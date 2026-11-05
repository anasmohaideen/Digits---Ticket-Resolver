import type { Actor, ApprovalNode, EventNode, MessageNode, StreamNode, TicketDetailsTab } from '../types';

/**
 * Option 2 · the conversation as responses only (21 Oct review).
 *
 * The stream shows what was said or added: replies, notes, approval cards and
 * the AI's own artifacts (summary, root cause, resolution note), plus who the
 * ticket was assigned to and every status change, in time order. The rest of
 * what a Digit did on the way is folded into the "Worked for" log of the entry
 * it led to.
 *
 * Unlike Option 1's `buildConversationTimeline`, pending work attaches to the
 * next artifact as well as the next message, so the root cause carries the
 * searches that produced it rather than lending them to a later reply.
 */

export const ARTIFACT_KINDS = ['summary', 'root-cause', 'resolution'] as const;
export type ArtifactKind = (typeof ARTIFACT_KINDS)[number];

export const ARTIFACT_LABEL: Record<ArtifactKind, string> = {
  summary: 'Summary',
  'root-cause': 'Root cause',
  resolution: 'Resolution note'
};

/** An artifact the Digit added to the ticket, as a stream entry. */
export interface ArtifactEntry {
  kind: 'artifact';
  id: string;
  at: string;
  actor: Actor;
  artifact: ArtifactKind;
}

/**
 * Who the ticket is with, and what state it is in, is the one kind of
 * operational event the conversation shows as its own row: an assignment
 * (a Digit delegating or handing over) or a status change. Everything else a
 * Digit did stays in the "Worked for" log.
 */
export const SURFACED_EVENT_TYPES: ReadonlyArray<EventNode['type']> = [
  'ticket-created',
  'properties-updated',
  'delegated',
  'handed-over',
  'status-changed'
];

export type ResponseEntry = MessageNode | ApprovalNode | ArtifactEntry | EventNode;

const ARTIFACT_BY_EVENT: Partial<Record<EventNode['type'], ArtifactKind>> = {
  'summary-updated': 'summary',
  'root-cause-added': 'root-cause',
  'resolution-notes': 'resolution'
};

function isWorkerEntry(entry: ResponseEntry): boolean {
  return entry.kind === 'artifact' || (entry.kind === 'message' && entry.actor.kind === 'digit');
}

export function buildResponseTimeline(stream: StreamNode[]) {
  const entries: ResponseEntry[] = [];
  const workById: Record<string, EventNode[]> = {};
  let pending: EventNode[] = [];

  const settle = (entry: ResponseEntry) => {
    entries.push(entry);
    if (isWorkerEntry(entry) && pending.length) {
      workById[entry.id] = pending;
      pending = [];
    }
  };

  const visit = (node: StreamNode) => {
    switch (node.kind) {
      case 'group':
        node.children.forEach(visit);
        return;
      case 'event': {
        const artifact = ARTIFACT_BY_EVENT[node.type];
        if (SURFACED_EVENT_TYPES.includes(node.type)) {
          expandHandover(node).forEach(settle);
        } else if (artifact && (node.actor.kind === 'digit' || node.actor.kind === 'copilot')) {
          settle({ kind: 'artifact', id: node.id, at: node.at, actor: node.actor, artifact });
        } else if (node.actor.kind === 'digit') {
          pending.push(node);
        }
        return;
      }
      case 'message':
      case 'approval':
        settle(node);
        return;
      default:
        return;
    }
  };

  stream.forEach(visit);

  if (pending.length) {
    const last = [...entries].reverse().find(isWorkerEntry);
    if (last) workById[last.id] = [...(workById[last.id] ?? []), ...pending];
  }

  /* Time order, so an assignment that follows the message announcing it
     lands after that message whatever order the data lists them in. */
  entries.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));

  return { entries, workById };
}

/* ───────────── Before the ticket ───────────── */

/** The "ticket created" event in the stream, if any. */
export function ticketCreatedEvent(stream: StreamNode[]): EventNode | undefined {
  for (const node of stream) {
    if (node.kind === 'group') {
      const found = ticketCreatedEvent(node.children);
      if (found) return found;
    } else if (node.kind === 'event' && node.type === 'ticket-created') {
      return node;
    }
  }
  return undefined;
}

/** When the ticket was created. */
export function ticketCreatedAt(stream: StreamNode[]): string | undefined {
  return ticketCreatedEvent(stream)?.at;
}

/**
 * Splits the conversation at the moment the ticket was created. Everything
 * before it happened in chat, between the requester and the Digits.
 */
export function splitAtCreation(entries: ResponseEntry[], createdAt: string | undefined) {
  if (!createdAt) return { before: [] as ResponseEntry[], after: entries };
  const cut = Date.parse(createdAt);
  return {
    before: entries.filter((entry) => Date.parse(entry.at) < cut),
    after: entries.filter((entry) => Date.parse(entry.at) >= cut)
  };
}

/** What the requester saw in the chat: messages only, no private notes and no events. */
export function requesterVisible(entries: ResponseEntry[]): MessageNode[] {
  return entries.filter((entry): entry is MessageNode =>
    entry.kind === 'message' && entry.variant !== 'private-note');
}

/* ───────────── Collapse ───────────── */

export type ResponseRow =
  | { kind: 'entry'; entry: ResponseEntry }
  | { kind: 'collapsed'; id: string; hidden: ResponseEntry[] };

/**
 * Beyond the threshold, everything but the most recent responses folds into
 * one "+N conversations" pill — human or AI, before or after the ticket was
 * created. The top card is what stands in for the folded part.
 */
export const RESPONSE_THRESHOLD = 6;
export const RESPONSE_VISIBLE = 2;
export const COLLAPSED_ID = 'collapsed-responses';

export function collapseResponses(
  entries: ResponseEntry[],
  { expanded = false, threshold = RESPONSE_THRESHOLD, visible = RESPONSE_VISIBLE } = {}
): ResponseRow[] {
  /* Assignment and status rows are not counted as responses, but they fold
     into the pill with the messages around them. */
  const responses = entries.filter((entry) => entry.kind !== 'event');
  if (expanded || responses.length <= threshold) {
    return entries.map((entry) => ({ kind: 'entry', entry }));
  }
  const cut = entries.indexOf(responses[responses.length - visible]);
  return [
    { kind: 'collapsed', id: COLLAPSED_ID, hidden: entries.slice(0, cut) },
    ...entries.slice(cut).map((entry): ResponseRow => ({ kind: 'entry', entry }))
  ];
}

/**
 * One kind of row for every assignment: a hand-over is "<Digit> assigned it to
 * <agent>", and why it went there (the blocker, the routing) sits under the
 * chevron, as does a Digit's stated intent for an earlier assignment.
 */
export function assignmentEvent(event: EventNode): EventNode {
  const why = event.intent ? [{ label: 'Why', value: [event.intent] }] : [];
  /* Creating the ticket and setting its properties carry their reasoning the same way. */
  if (event.type === 'ticket-created' || event.type === 'properties-updated') {
    return { ...event, data: { ...event.data, details: [...(event.data.details ?? []), ...why] }, intent: undefined };
  }
  if (event.type !== 'delegated' && event.type !== 'handed-over') return event;
  const details = event.data.details?.length ? event.data.details : why;
  return { ...event, type: 'delegated', data: { ...event.data, details }, intent: undefined };
}

/**
 * A hand-over to a person is two events, as it happens in two steps: the Digit
 * routes the ticket to a group (and says why), then someone in that group gets
 * it, by round robin, by load, or by picking it up themselves.
 */
export function expandHandover(event: EventNode): EventNode[] {
  const target = event.data.target;
  if (event.type !== 'handed-over' || !target || target.kind !== 'agent') return [event];
  const group = event.data.group ?? event.data.routing?.split('→')[1]?.trim();
  if (!group) return [event];
  const method = event.data.method ?? 'round-robin';
  const how = {
    'round-robin': `Round robin: next agent in the rotation for ${group}.`,
    'load-balanced': `Load balanced: fewest open tickets in ${group}.`,
    manual: `Picked up from the ${group} queue.`
  }[method];
  const { target: _target, method: _method, ...rest } = event.data;
  const toGroup: EventNode = { ...event, type: 'delegated', data: { ...rest, group } };
  const toPerson: EventNode = {
    kind: 'event',
    id: `${event.id}-person`,
    at: event.at,
    actor: target,
    type: 'delegated',
    data: { target, group, method, details: [{ label: 'How', value: [how] }] }
  };
  return [toGroup, toPerson];
}

/* ───────────── The top card ───────────── */

/** Which artifacts this ticket has, in the order the dropdown lists them. */
export function availableArtifacts(
  tab: Pick<TicketDetailsTab, 'summary' | 'rootCause'>,
  hasResolution: boolean
): ArtifactKind[] {
  const kinds: ArtifactKind[] = [];
  /* Tab order is fixed: Summary, Root cause, Resolution. */
  if (tab.summary.state !== 'not-generated') kinds.push('summary');
  if (tab.rootCause.state !== 'not-analyzed') kinds.push('root-cause');
  if (hasResolution) kinds.push('resolution');
  return kinds;
}

/**
 * What the top card leads with, by ticket stage: the resolution note once the
 * ticket is resolved, else the root cause once there is one, else the summary.
 */
export function leadArtifact(available: ArtifactKind[]): ArtifactKind {
  /* By stage, not by tab order. */
  return (['resolution', 'root-cause', 'summary'] as const).find((kind) => available.includes(kind)) ?? 'summary';
}

/**
 * Property updates that follow one another from the same actor read as one
 * row ("updated 3 properties"), not three: their field changes are merged,
 * keeping each field's first "from" and last "to".
 */
export function groupPropertyUpdates(entries: ResponseEntry[]): ResponseEntry[] {
  const out: ResponseEntry[] = [];
  for (const entry of entries) {
    const prev = out[out.length - 1];
    if (
      entry.kind === 'event' && entry.type === 'properties-updated' &&
      prev && prev.kind === 'event' && prev.type === 'properties-updated' &&
      JSON.stringify(prev.actor) === JSON.stringify(entry.actor)
    ) {
      const merged = new Map<string, { field: string; from: string; to: string }>();
      [...(prev.data.fields ?? []), ...(entry.data.fields ?? [])].forEach((change) => {
        const seen = merged.get(change.field);
        merged.set(change.field, seen ? { ...seen, to: change.to } : change);
      });
      const fields = [...merged.values()];
      out[out.length - 1] = {
        ...prev,
        data: {
          ...prev.data,
          fields,
          count: fields.length,
          details: [...(prev.data.details ?? []), ...(entry.data.details ?? [])]
        },
        why: [prev.why, entry.why].filter(Boolean).join(' ') || undefined
      } as ResponseEntry;
    } else {
      out.push(entry);
    }
  }
  return out;
}

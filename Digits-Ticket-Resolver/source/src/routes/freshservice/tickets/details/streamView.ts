/**
 * The Details tab's behaviour, as pure functions.
 *
 * `spec/03-behaviour.md` asks for landing position, collapsing and filtering to
 * be expressible without a DOM, so they live here and the components only
 * render what these return. `streamView.test.ts` covers them.
 */

import type {
  Actor,
  GroupNode,
  MessageNode,
  OutcomeTone,
  ReviewState,
  StreamNode,
  TicketDetailsTab
} from './types';

/* ───────────── Landing position ───────────── */

export type LandingTarget = { kind: 'top' } | { kind: 'item'; id: string };

/** A Digit or Copilot acts; a requester or agent converses. */
export function isHumanActor(actor: Actor): boolean {
  return actor.kind === 'requester' || actor.kind === 'agent';
}

/** The handover is the boundary between "before you" and "yours". */
export function findHandover(stream: StreamNode[]): StreamNode | undefined {
  return stream.find((node) => node.kind === 'event' && node.type === 'handed-over');
}

/** `live` nodes have no timestamp of their own — they are always current. */
function nodeTime(node: StreamNode): string | undefined {
  return node.kind === 'live' ? undefined : node.kind === 'group' ? node.end : node.at;
}

/**
 * Where the tab should be scrolled on open.
 *
 * The first rule wins deliberately: an agent who was just assigned is sent to
 * the top even though everything is technically unread, because the two cards
 * plus the collapsed run are what they need first.
 */
export function getLandingTarget(tab: Pick<TicketDetailsTab, 'viewer' | 'stream'>): LandingTarget {
  const { lastSeenAt } = tab.viewer;
  if (!lastSeenAt) return { kind: 'top' };

  const handover = findHandover(tab.stream);
  const handoverAt = handover ? nodeTime(handover) : undefined;
  if (handoverAt && lastSeenAt < handoverAt) return { kind: 'top' };

  const firstUnread = tab.stream.find((node) => {
    const at = nodeTime(node);
    return at !== undefined && at > lastSeenAt;
  });

  return firstUnread ? { kind: 'item', id: firstUnread.id } : { kind: 'top' };
}

/** Marks the "new" divider above the first unread item, when there is one. */
export function firstUnreadId(
  tab: Pick<TicketDetailsTab, 'viewer' | 'stream'>
): string | undefined {
  const target = getLandingTarget(tab);
  return target.kind === 'item' ? target.id : undefined;
}

/* ───────────── Group chips and phases ───────────── */

/**
 * Phase chips for a run.
 *
 * The run's authored `outcomes` win when present, because `spec/01` fixes the
 * fixtures' copy ("Deflection · didn't resolve" reads better than anything
 * derived). A run authored without them falls back to deriving one chip per
 * child phase, which is the rule in `spec/03`.
 */
export function runChips(run: GroupNode): Array<{ label: string; tone: OutcomeTone }> {
  if (run.outcomes.length > 0) return run.outcomes;
  return derivePhaseChips(run);
}

export function derivePhaseChips(run: GroupNode): Array<{ label: string; tone: OutcomeTone }> {
  return run.children
    .filter((child): child is GroupNode => child.kind === 'group' && child.level === 'phase')
    .map((phase) => {
      const outcome = phase.outcomes[0];
      return {
        label: outcome ? `${phase.title} · ${outcome.label}` : phase.title,
        tone: outcome?.tone ?? 'neutral'
      };
    });
}

export function phasesOf(run: GroupNode): GroupNode[] {
  return run.children.filter(
    (child): child is GroupNode => child.kind === 'group' && child.level === 'phase'
  );
}

/** Depth-first ids, so a deep link can be traced to the phase holding it. */
export function descendantIds(node: StreamNode): string[] {
  if (node.kind !== 'group') return [node.id];
  return [node.id, ...node.children.flatMap(descendantIds)];
}

/**
 * Which phases start open inside an expanded run: the ones authored
 * `defaultOpen`, plus the one holding the item the viewer deep-linked to.
 * Everything else stays collapsed.
 */
export function initialOpenPhases(run: GroupNode, deepLinkId?: string): string[] {
  return phasesOf(run)
    .filter((phase) => phase.defaultOpen || (deepLinkId ? descendantIds(phase).includes(deepLinkId) : false))
    .map((phase) => phase.id);
}

/** The run that holds a given item, used to open it before scrolling there. */
export function findGroupContaining(stream: StreamNode[], id: string): GroupNode | undefined {
  for (const node of stream) {
    if (node.kind !== 'group') continue;
    if (descendantIds(node).includes(id) && node.id !== id) return node;
  }
  return undefined;
}

/* ───────────── The stream view ───────────── */

export type StreamFilter = 'all-activity' | 'messages-only';

export type StreamRow =
  | { kind: 'node'; node: StreamNode }
  /** Today's "+N conversations" pill, standing in for `hidden`. */
  | { kind: 'collapsed'; id: string; hidden: MessageNode[] };

/**
 * More than five contiguous human messages collapse to the latest four, per
 * `spec/03` rule 4. INC-4133's seven become "+3 conversations" and four cards.
 */
export const HUMAN_THREAD_THRESHOLD = 5;
export const HUMAN_THREAD_VISIBLE = 4;

/**
 * Folds long runs of human messages into the pill. Non-message nodes break a
 * run, so a note or event between replies keeps both sides visible.
 */
export function collapseHumanThreads(nodes: StreamNode[], expandedPillIds: string[] = []): StreamRow[] {
  const rows: StreamRow[] = [];
  let run: MessageNode[] = [];

  const flushRun = () => {
    if (run.length === 0) return;
    const pillId = `collapsed-${run[0].id}`;
    const collapsed = run.length > HUMAN_THREAD_THRESHOLD && !expandedPillIds.includes(pillId);

    if (collapsed) {
      const hidden = run.slice(0, run.length - HUMAN_THREAD_VISIBLE);
      rows.push({ kind: 'collapsed', id: pillId, hidden });
      for (const node of run.slice(run.length - HUMAN_THREAD_VISIBLE)) {
        rows.push({ kind: 'node', node });
      }
    } else {
      for (const node of run) rows.push({ kind: 'node', node });
    }
    run = [];
  };

  for (const node of nodes) {
    if (node.kind === 'message' && isHumanActor(node.actor)) {
      run.push(node);
      continue;
    }
    flushRun();
    rows.push({ kind: 'node', node });
  }
  flushRun();

  return rows;
}

/** Every message in the tree, in time order. Used by "Messages only". */
export function flattenMessages(nodes: StreamNode[]): MessageNode[] {
  const out: MessageNode[] = [];
  const walk = (list: StreamNode[]) => {
    for (const node of list) {
      if (node.kind === 'group') walk(node.children);
      else if (node.kind === 'message') out.push(node);
    }
  };
  walk(nodes);
  return out.sort((a, b) => a.at.localeCompare(b.at));
}

export interface StreamViewOptions {
  filter: StreamFilter;
  /** Pills the viewer has opened, so the fold does not snap shut on re-render. */
  expandedPillIds?: string[];
}

/**
 * The rows the Conversations zone renders.
 *
 * "All activity" keeps the authored grouping — the run group renders itself and
 * decides what its children show. "Messages only" drops events, approvals,
 * live rows and group headers, and flattens what is left into one time-ordered
 * thread. Human-thread collapsing applies in both.
 */
export function buildStreamView(nodes: StreamNode[], options: StreamViewOptions): StreamRow[] {
  const expanded = options.expandedPillIds ?? [];
  if (options.filter === 'messages-only') {
    return collapseHumanThreads(flattenMessages(nodes), expanded);
  }
  return collapseHumanThreads(nodes, expanded);
}

/* ───────────── Review states ───────────── */

/**
 * The three states `spec/03` asks to be reviewable. Only the stream differs:
 * "engaged" appends the agent's note and reply plus the requester's answer, and
 * "expanded" is the landing data with the run and two phases opened — which is
 * view state, not data, so it is returned alongside.
 */
export interface ReviewView {
  stream: StreamNode[];
  /** Run ids that start expanded. */
  openRunIds: string[];
  /** Phase ids that start expanded. */
  openPhaseIds: string[];
}

export function buildReviewView(tab: TicketDetailsTab, state: ReviewState): ReviewView {
  const runs = tab.stream.filter(
    (node): node is GroupNode => node.kind === 'group' && node.level === 'run'
  );

  if (state === 'engaged') {
    return {
      // The primary ticket's conversation intentionally ends with the worker's
      // response; the older engaged demo is not a second public timeline.
      stream: tab.ticket.id === 'INC-4127' ? tab.stream : [...tab.stream, ...(tab.engagedStream ?? [])],
      openRunIds: [],
      openPhaseIds: []
    };
  }

  if (state === 'expanded') {
    return {
      stream: tab.stream,
      openRunIds: runs.map((run) => run.id),
      // "Before the ticket" and "Root cause", per the spec's table. Matching by
      // title rather than id keeps it true for any fixture using those phases.
      openPhaseIds: runs.flatMap((run) =>
        phasesOf(run)
          .filter((phase) => phase.title === 'Before the ticket' || phase.title === 'Root cause')
          .map((phase) => phase.id)
      )
    };
  }

  return { stream: tab.stream, openRunIds: [], openPhaseIds: [] };
}

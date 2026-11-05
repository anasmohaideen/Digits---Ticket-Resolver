import type { EventNode, FixStep, RichText, RootCauseState, SummaryCard, SummaryState, TicketDetailsTab } from '../types';
import type { ResponseEntry } from './responseTimeline';

/**
 * The Ticket Resolver journey, one stage at a time, named after the PRD's jobs
 * and return states so the page can be read against it. Picking a stage shows
 * the ticket as it stood when that job finished (or failed): the rows that
 * exist by then, and the top card's state. "Full ticket" is the ticket as
 * authored.
 *
 * A stage is a cut through the ticket's own timeline, found by the kind of row
 * it ends on, so it works on every ticket that follows the same path.
 */
export type StageId =
  | 'created'
  | 'triage'
  | 'triage-failed'
  | 'summarising'
  | 'summary'
  | 'rca-running'
  | 'rca-failed'
  | 'rca-done'
  | 'approval'
  | 'group'
  | 'person'
  | 'resolved'
  | 'blocked-freeze'
  | 'blocked-no-tool'
  | 'blocked-permission'
  | 'blocked-partial';

type Cut = 'created' | 'triage' | 'summary' | 'rca' | 'group' | 'all';

interface Stage {
  id: StageId;
  label: string;
  /** Which job this belongs to in the PRD. */
  job: 'Deflection' | 'Triage' | 'RCA' | 'Resolution' | 'Hand-over';
  cut: Cut;
  summary: SummaryState;
  rootCause: RootCauseState;
  /** Only on the ticket whose story has this approval. */
  ticketOnly?: string;
  /** An in-between moment other stages already cover: still reachable by `?stage=`, not offered in the control. */
  hidden?: boolean;
  /** A different way the fix can be blocked, shown on the same ticket. */
  blocker?: Exclude<BlockerId, 'freeze'>;
}

type BlockerId = 'freeze' | 'no-tool' | 'permission' | 'partial';

export const STAGES: Stage[] = [
  { id: 'created', label: 'Deflection failed, ticket created', job: 'Deflection', cut: 'created', summary: 'not-generated', rootCause: 'not-analyzed', hidden: true },
  { id: 'triage', label: 'Triage done', job: 'Triage', cut: 'triage', summary: 'not-generated', rootCause: 'not-analyzed', hidden: true },
  { id: 'summarising', label: 'Summary generating', job: 'Triage', cut: 'triage', summary: 'generating', rootCause: 'not-analyzed', hidden: true },
  { id: 'triage-failed', label: 'Triage failed, handed to a group', job: 'Triage', cut: 'created', summary: 'not-generated', rootCause: 'not-analyzed' },
  { id: 'summary', label: 'Summary generated', job: 'Triage', cut: 'summary', summary: 'ready', rootCause: 'not-analyzed' },
  { id: 'rca-running', label: 'Root cause analysis running', job: 'RCA', cut: 'summary', summary: 'ready', rootCause: 'analyzing', hidden: true },
  { id: 'rca-failed', label: 'No root cause found, handed to a group', job: 'RCA', cut: 'summary', summary: 'ready', rootCause: 'not-analyzed' },
  { id: 'rca-done', label: 'Root cause analysis done', job: 'RCA', cut: 'rca', summary: 'ready', rootCause: 'found' },
  { id: 'approval', label: 'Resolution awaiting approval', job: 'Resolution', cut: 'rca', summary: 'ready', rootCause: 'found', ticketOnly: 'INC-4127' },
  { id: 'group', label: 'Handed over to a group', job: 'Hand-over', cut: 'group', summary: 'ready', rootCause: 'found' },
  { id: 'person', label: 'Assigned to a person', job: 'Hand-over', cut: 'all', summary: 'ready', rootCause: 'found' },
  { id: 'resolved', label: 'Resolved: employee confirmed, resolution note written', job: 'Resolution', cut: 'all', summary: 'ready', rootCause: 'found', ticketOnly: 'INC-4127' },
  { id: 'blocked-freeze', label: 'Blocked: change freeze, needs approval', job: 'Resolution', cut: 'all', summary: 'ready', rootCause: 'found', ticketOnly: 'INC-4140' },
  { id: 'blocked-no-tool', label: 'Blocked: no workflow can run the fix', job: 'Resolution', cut: 'all', summary: 'ready', rootCause: 'found', ticketOnly: 'INC-4140', blocker: 'no-tool' },
  { id: 'blocked-permission', label: 'Blocked: permission denied', job: 'Resolution', cut: 'all', summary: 'ready', rootCause: 'found', ticketOnly: 'INC-4140', blocker: 'permission' },
  { id: 'blocked-partial', label: 'Blocked: fix only partly applied', job: 'Resolution', cut: 'all', summary: 'ready', rootCause: 'found', ticketOnly: 'INC-4140', blocker: 'partial' }
];

/** A shorter journey for tickets that show the ways a fix can be blocked. */
const SIMPLE_JOURNEY: Record<string, StageId[]> = {
  'INC-4140': ['triage-failed', 'rca-failed', 'rca-done', 'blocked-freeze', 'blocked-no-tool', 'blocked-permission', 'blocked-partial']
};

/** Tickets whose timeline follows the path the stages cut through. */
export const STAGE_TICKETS = ['INC-4127', 'INC-4140', 'INC-4142'];

export function stagesFor(ticketCode: string): Stage[] {
  const simple = SIMPLE_JOURNEY[ticketCode];
  if (simple) return simple.map((id) => STAGES.find((stage) => stage.id === id)!);
  return STAGES.filter((stage) => !stage.hidden && (!stage.ticketOnly || stage.ticketOnly === ticketCode));
}

export function parseStage(value: string | null, ticketCode: string): StageId | undefined {
  return STAGES.find((stage) => stage.id === value && (!stage.ticketOnly || stage.ticketOnly === ticketCode))?.id;
}

const stageOf = (id: StageId) => STAGES.find((stage) => stage.id === id)!;

/** A summary as it reads when a job failed and the ticket went to a group: only what had happened by then. */
export function applyFailureToSummary(summary: SummaryCard, id: StageId | undefined): SummaryCard {
  if (id !== 'triage-failed' && id !== 'rca-failed') return summary;
  const triage = id === 'triage-failed';
  return {
    ...summary,
    tried: (summary.tried ?? []).slice(0, 1),
    standing: [triage
      ? 'Ticket Resolver couldn’t classify this, so it went to the Service Desk for a person to triage.'
      : 'Ticket Resolver found no likely cause, so it went to the Service Desk for a person to look into.'],
    strip: triage
      ? 'KB steps didn’t help. Ticket Resolver couldn’t classify it; with the Service Desk.'
      : 'KB steps didn’t help. No likely cause found; with the Service Desk.'
  };
}

/** The top cards as they stood at this stage. A result the ticket never had stays as authored. */
export function applyStageToTab(tab: TicketDetailsTab, id: StageId | undefined): TicketDetailsTab {
  if (!id) return tab;
  const stage = stageOf(id);
  return {
    ...tab,
    summary: stage.summary === 'ready'
      ? applyFailureToSummary(tab.summary, id)
      : { ...tab.summary, state: stage.summary, ...(stage.summary === 'generating' ? { elapsedSeconds: 6 } : {}) },
    rootCause: stage.rootCause === 'found'
      ? tab.rootCause
      : {
          ...tab.rootCause,
          state: stage.rootCause,
          ...(stage.rootCause === 'analyzing' ? { live: { label: 'Comparing similar tickets and recent changes', elapsedSeconds: 14 } } : {})
        }
  };
}

const isCut = (entry: ResponseEntry, cut: Cut): boolean => {
  switch (cut) {
    case 'created': return entry.kind === 'event' && entry.type === 'ticket-created';
    case 'triage': return entry.kind === 'event' && entry.type === 'properties-updated';
    case 'summary': return entry.kind === 'artifact' && entry.artifact === 'summary';
    case 'rca': return entry.kind === 'artifact' && entry.artifact === 'root-cause';
    case 'group': return entry.kind === 'event' && Boolean(entry.data.group) && !entry.data.target;
    case 'all': return false;
  }
};

/** The ticket's own rows up to the row this stage ends on. */
export function cutEntries(entries: ResponseEntry[], id: StageId | undefined): ResponseEntry[] {
  if (!id) return entries;
  const { cut } = stageOf(id);
  if (cut === 'all') return entries;
  let last = -1;
  entries.forEach((entry, index) => {
    if (isCut(entry, cut)) last = index;
  });
  return last === -1 ? entries : entries.slice(0, last + 1);
}

/* ───────────── The other ways a fix is blocked (INC-4140) ───────────── */

const CHECKED: FixStep = { label: 'Checked the rule against the firewall policy', status: 'done' };
const CONFIRM: FixStep = { label: 'Confirm the app loads from the office network', status: 'skipped', detail: 'not run' };

const BLOCKERS: Record<Exclude<BlockerId, 'freeze'>, {
  blocker: string;
  steps: FixStep[];
  nextStep: RichText;
  recommended: RichText[];
  tried: string;
  standing: string;
  strip: string;
}> = {
  'no-tool': {
    blocker: 'No workflow can add a firewall allow-list rule',
    steps: [{ label: 'Looked for a workflow that adds a firewall allow-list rule', status: 'failed', detail: 'none found' }, CONFIRM],
    nextStep: ['Add the office outbound range to the expense app’s allow-list by hand, then ask Elena to retry.'],
    recommended: [['Add the office outbound range to the expense app’s allow-list by hand.'], ['Ask Elena to retry the expense app from the office network.']],
    tried: 'Ticket Resolver found the cause but no workflow can add a firewall rule, so it couldn’t run a fix.',
    standing: 'Handed over to the Network Team. The rule has to be added by hand, and Elena has a submission deadline today.',
    strip: 'KB steps didn’t help. Ticket Resolver found the cause; no workflow can run the fix.'
  },
  permission: {
    blocker: 'The workflow’s account isn’t allowed to edit firewall rules',
    steps: [CHECKED, { label: 'Create the allow-list rule on the firewall', status: 'failed', detail: 'permission denied' }, CONFIRM],
    nextStep: ['Add the office outbound range to the expense app’s allow-list with an account that can edit firewall rules, then ask Elena to retry.'],
    recommended: [['Add the office outbound range to the expense app’s allow-list with an account that can edit firewall rules.'], ['Ask Elena to retry the expense app from the office network.']],
    tried: 'Ticket Resolver found the cause and tried the allow-list workflow. The firewall rule step was denied permission.',
    standing: 'Handed over to the Network Team. The workflow’s account can’t edit firewall rules, so someone with access needs to add it, and Elena has a deadline today.',
    strip: 'KB steps didn’t help. Ticket Resolver found the cause; the fix was denied permission.'
  },
  partial: {
    blocker: 'The rule was added on the primary firewall but not the secondary',
    steps: [
      CHECKED,
      { label: 'Create the allow-list rule on the primary firewall', status: 'done' },
      { label: 'Create the allow-list rule on the secondary firewall', status: 'failed', detail: 'timed out' },
      CONFIRM
    ],
    nextStep: ['Add the same rule on the secondary firewall, check the app loads from every office network, then ask Elena to retry.'],
    recommended: [['Add the same rule on the secondary firewall.'], ['Check the app loads from every office network.'], ['Ask Elena to retry the expense app.']],
    tried: 'Ticket Resolver found the cause and ran the allow-list workflow. The rule went onto the primary firewall but not the secondary.',
    standing: 'Handed over to the Network Team. The fix is half in place, and Elena has a submission deadline today.',
    strip: 'KB steps didn’t help. Ticket Resolver found the cause; the fix was only partly applied.'
  }
};

/** The top cards for a blocker stage: the same ticket, a different reason the fix stopped. */
export function applyBlockerToTab(tab: TicketDetailsTab, id: StageId | undefined): TicketDetailsTab {
  const blocker = id ? stageOf(id).blocker : undefined;
  if (!blocker || !tab.rootCause.fix) return tab;
  const copy = BLOCKERS[blocker];
  return {
    ...tab,
    summary: {
      ...tab.summary,
      tried: [...(tab.summary.tried ?? []).slice(0, 1), [copy.tried]],
      standing: [copy.standing],
      strip: copy.strip
    },
    rootCause: {
      ...tab.rootCause,
      fix: { ...tab.rootCause.fix, via: blocker === 'no-tool' ? undefined : tab.rootCause.fix.via, steps: copy.steps, nextStep: copy.nextStep, recommended: copy.recommended }
    }
  };
}

/** A row or work-log event as it reads under this blocker: the blocker line and the workflow's steps. */
export function applyBlockerToEvent(event: EventNode, id: StageId | undefined): EventNode {
  const blocker = id ? stageOf(id).blocker : undefined;
  if (!blocker) return event;
  const copy = BLOCKERS[blocker];
  if (event.data.group && !event.data.target) {
    return {
      ...event,
      data: {
        ...event.data,
        details: (event.data.details ?? []).map((detail) => (detail.label === 'Blocker' ? { ...detail, value: [copy.blocker] } : detail))
      }
    };
  }
  if (event.type === 'workflow-executed' && event.data.steps) {
    return { ...event, data: { ...event.data, steps: copy.steps }, workOutcome: copy.blocker };
  }
  return event;
}

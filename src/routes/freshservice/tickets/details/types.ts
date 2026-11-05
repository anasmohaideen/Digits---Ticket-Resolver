/**
 * Data contract for the Ticket Resolver (TR) Details tab.
 *
 * Adapted from `docs/tr-details-handoff/data/types.ts`. The shape is the
 * handoff's; the conventions are this repo's — `as const` tuples with a derived
 * union wherever the handoff used a bare string union, so the values are
 * available at runtime for lookup tables and the gallery.
 *
 * Times are ISO 8601 strings. They are formatted with `format.ts`, never
 * pre-formatted in the data.
 */

export const CHANNELS = ['slack', 'teams', 'portal', 'email', 'phone'] as const;
export type Channel = (typeof CHANNELS)[number];

export const DIGIT_IDS = [
  'workplace-concierge',
  'ticket-resolver',
  'knowledge-curator',
  'software-handler',
  'hardware-handler'
] as const;
export type DigitId = (typeof DIGIT_IDS)[number];

export type Actor =
  | { kind: 'requester'; id: string; name: string; title?: string }
  | { kind: 'agent'; id: string; name: string }
  | { kind: 'digit'; digit: DigitId; name: string }
  | { kind: 'copilot'; name: 'Freddy AI Copilot' };

/** Where a link points. Resolved by `details.tokens.ts`, not by the data. */
export type LinkTargetType =
  | 'ticket'
  | 'change'
  | 'asset'
  | 'article'
  | 'related-tickets'
  | 'resolution-tab'
  | 'workflow-run';

export interface Link {
  label: string;
  to: { type: LinkTargetType; id?: string };
}

/** Rich inline text: plain strings plus inline links, in reading order. */
export type RichText = Array<string | Link>;

export interface Attachment {
  name: string;
  sizeLabel: string;
  /** A pasted code or log snippet; the handoff log shows it in full. */
  snippet?: string;
}

/* ───────────── Zone 1 · AI cards ───────────── */

export const SUMMARY_STATES = ['not-generated', 'generating', 'ready', 'out-of-date', 'edited'] as const;
export type SummaryState = (typeof SUMMARY_STATES)[number];

export interface SummaryCard {
  state: SummaryState;
  title?: string;
  updatedAt?: string;
  updatedBy?: Actor;
  reason?: 'handover' | 'on-demand' | 'triage';
  issue?: RichText;
  tried?: RichText[];
  standing?: RichText;
  /** One-line "what has happened", used by the collapsed row and the strip. */
  strip?: string;
  basedOn?: { messages: number; actions: number };
  /** `generating` only — drives the live "Thinking {s}s" label. */
  elapsedSeconds?: number;
  /** `out-of-date` only. Proposed; gated by `showOutOfDate`. */
  newSince?: { messages: number; since: string };
  /** `edited` only. Proposed; gated by `showEdited`. */
  editedBy?: { agent: Actor; at: string };
}

export const FIX_STEP_STATUSES = ['done', 'failed', 'skipped', 'running'] as const;
export type FixStepStatus = (typeof FIX_STEP_STATUSES)[number];

export interface FixStep {
  label: string;
  status: FixStepStatus;
  detail?: string;
}

export const FIX_STATUSES = [
  'proposed',
  'awaiting-approval',
  'running',
  'applied',
  'blocked',
  'none'
] as const;
export type FixStatus = (typeof FIX_STATUSES)[number];

export interface SuggestedFix {
  title: string;
  via?: { kind: 'workflow'; name: string };
  status: FixStatus;
  steps?: FixStep[];
  nextStep?: RichText;
  /** What the assigned person should do, in order, as the Digit recommends. */
  recommended?: RichText[];
  verified?: string;
  approver?: Actor;
  /** Stream item "View in conversation" scrolls to. */
  eventId?: string;
  /** `running` only — drives the live "Executing workflow: {name} {s}s" label. */
  elapsedSeconds?: number;
}

export const ROOT_CAUSE_STATES = [
  'not-analyzed',
  'analyzing',
  'found',
  'inconclusive',
  'disputed'
] as const;
export type RootCauseState = (typeof ROOT_CAUSE_STATES)[number];

export type ConfidenceBand = 'high' | 'medium' | 'low';

export interface RootCauseCard {
  state: RootCauseState;
  title?: string;
  at?: string;
  by?: Actor;
  cause?: RichText;
  evidence?: RichText[];
  /** `inconclusive` only. */
  checked?: RichText;
  confidence?: { score: number; threshold: number; band: ConfidenceBand };
  reasoning?: string;
  fix?: SuggestedFix;
  /** `analyzing` only. */
  live?: { label: string; elapsedSeconds: number };
  /** `disputed` only. Proposed; gated by `showDisputed`. */
  feedback?: { by: Actor; reasonPlaceholder: string };
}

export interface Description {
  body: RichText;
  attachments: Attachment[];
  /** e.g. "From Megan's first Slack message". Omitted on normal tickets. */
  origin?: string;
  /** A ticket the Concierge created: its two-line orientation, shown above the chat it came from. */
  brief?: string;
}

/* ───────────── Zone 3 · Stream ───────────── */

export const MESSAGE_VARIANTS = [
  'requester-reply',
  'reply',
  'forward',
  'public-note',
  'private-note',
  'digit-message',
  'concierge-message'
] as const;
export type MessageVariant = (typeof MESSAGE_VARIANTS)[number];

export interface MessageNode {
  kind: 'message';
  id: string;
  at: string;
  actor: Actor;
  variant: MessageVariant;
  channel: Channel;
  /** Digit and Concierge messages: always 'workplace-concierge'. */
  via?: 'workplace-concierge';
  /** Reply and forward over email. */
  to?: string[];
  cc?: string[];
  bcc?: string[];
  /** People notified of a note. */
  notify?: string[];
  body: RichText;
  attachments?: Attachment[];
  /** Proposed signals, each behind a prop on the card. */
  flags?: { sentiment?: string; draftedWithCopilot?: 'as-is' | 'edited' };
}

export const EVENT_TYPES = [
  'ticket-created',
  'delegated',
  'status-changed',
  'properties-updated',
  'searched',
  'root-cause-added',
  'summary-updated',
  'workflow-executed',
  'approval-requested',
  'approval-decided',
  'handed-over',
  'resolution-notes',
  'thought',
  'external-update',
  'digit-event'
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

/** Type-specific payload. Only the keys each `EventType` uses are populated. */
export interface EventData {
  /** delegated, handed-over, approval-requested. */
  target?: Actor;
  /** status-changed. */
  status?: string;
  /** properties-updated. */
  fields?: Array<{ field: string; from: string; to: string }>;
  /** searched, properties-updated, external-update. */
  count?: number;
  /** searched: "similar tickets", "recent change". */
  entity?: string;
  /** searched (work graph), digit-event, approval-decided, resolution-notes. */
  object?: RichText;
  /** digit-event, searched (alternative phrasing). */
  verb?: string;
  /** searched. */
  results?: Array<{ link: Link; meta: string }>;
  /** workflow-executed. */
  workflow?: string;
  /** workflow-executed, thought (steps form). */
  steps?: FixStep[];
  /** approval-decided. */
  decision?: 'approved' | 'rejected';
  /** handed-over. */
  reason?: 'blocked' | 'inconclusive';
  /** handed-over. */
  routing?: string;
  /** delegated (assigned to a group, or to a person within it). */
  group?: string;
  /** delegated, for the person within the group: how they came to have it. */
  method?: 'round-robin' | 'load-balanced' | 'manual';
  /** handed-over, ticket-created, approval-decided (rejection reason). */
  details?: Array<{ label: string; value: RichText }>;
  /** external-update. */
  app?: string;
  /** thought. */
  seconds?: number;
}

export interface EventNode {
  kind: 'event';
  id: string;
  at: string;
  actor: Actor;
  type: EventType;
  data: EventData;
  /** Digit's intended next step, displayed before the action in its work log. */
  intent?: string;
  /** Related actions share one preceding reasoning statement. */
  intentGroup?: string;
  /** Result shown after the action, distinct from the preceding reasoning. */
  workOutcome?: string;
  /** Reasoning, shown behind the "Why" toggle. Never open by default. */
  why?: string;
}

export interface ApprovalNode {
  kind: 'approval';
  id: string;
  at: string;
  actor: Actor;
  title: string;
  what: RichText;
  whyAction: RichText;
  /** One line on why the Digit is asking, shown on the card in every state. Falls back to the first sentence of `whyAction`. */
  reason?: string;
  comments: number;
  state: 'pending' | 'approved' | 'rejected';
  /** Optional structured changes for approvals that update ticket fields. */
  proposedFields?: Array<{ field: string; from: string; to: string }>;
  /** Context-specific labels while retaining the shared approval surface. */
  actionLabels?: { reject: string; approve: string };
  decidedBy?: Actor;
  decidedAt?: string;
}

export const LIVE_ACTIVITIES = ['thinking', 'searching', 'executing', 'waiting'] as const;
export type LiveActivity = (typeof LIVE_ACTIVITIES)[number];

export interface LiveNode {
  kind: 'live';
  id: string;
  actor: Actor;
  activity: LiveActivity;
  /** "Searching for similar tickets", "Waiting for approval from Jordan Reyes". */
  label: string;
  elapsedSeconds: number;
}

export type OutcomeTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface GroupNode {
  kind: 'group';
  id: string;
  level: 'run' | 'phase';
  actor: Actor;
  /** run: "Ticket Resolver worked on this before you"; phase: "Root cause". */
  title: string;
  start: string;
  end: string;
  /** "8 messages with Megan in Slack · 19 actions". */
  meta: string;
  /** Run: one chip per phase. Phase: its own outcome. */
  outcomes: Array<{ label: string; tone: OutcomeTone }>;
  defaultOpen: boolean;
  children: StreamNode[];
}

export type StreamNode = MessageNode | EventNode | ApprovalNode | LiveNode | GroupNode;

/* ───────────── Root ───────────── */

export interface TicketDetailsTab {
  ticket: {
    id: string;
    type: 'incident' | 'service-request';
    subject: string;
    source: Channel;
    requester: Actor;
    assignee?: Actor;
    createdBy?: Actor;
  };
  viewer: { agent: Actor; lastSeenAt?: string };
  summary: SummaryCard;
  rootCause: RootCauseCard;
  description: Description;
  stream: StreamNode[];
  /** Appended for the "engaged" review state. */
  engagedStream?: StreamNode[];
}

/**
 * The three states `spec/03-behaviour.md` asks to be reviewable, selected with
 * `?state=` so each is linkable.
 */
export const REVIEW_STATES = ['landing', 'engaged', 'expanded'] as const;
export type ReviewState = (typeof REVIEW_STATES)[number];

/**
 * Proposed blocks are gated so the team can review them separately from the
 * agreed ones. All default to on in the prototype; the gallery toggles them.
 */
export interface ProposedFlags {
  /** B1 `out-of-date` notice. */
  showOutOfDate: boolean;
  /** B1 `edited` chip and restore link. */
  showEdited: boolean;
  /** B2 `disputed` chip and reason input. */
  showDisputed: boolean;
  /** B4 sentiment badge on requester replies. */
  showSentiment: boolean;
  /** B4 "Drafted with Freddy" badge on agent replies. */
  showDraftedWith: boolean;
  /** B6 decided approval card. */
  showDecidedApproval: boolean;
}

export const DEFAULT_PROPOSED: ProposedFlags = {
  showOutOfDate: true,
  showEdited: true,
  showDisputed: true,
  showSentiment: true,
  showDraftedWith: true,
  showDecidedApproval: true
};

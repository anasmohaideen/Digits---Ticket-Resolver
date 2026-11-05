/**
 * Data contract for the TR Details tab prototype.
 * Adapt names and style to the repo's conventions. Keep the shape.
 * Times are ISO 8601 strings; format them with the repo's date helpers.
 */

export type Channel = 'slack' | 'teams' | 'portal' | 'email' | 'phone';

export type DigitId =
  | 'workplace-concierge'
  | 'ticket-resolver'
  | 'knowledge-curator'
  | 'software-handler'
  | 'hardware-handler';

export type Actor =
  | { kind: 'requester'; id: string; name: string; title?: string }
  | { kind: 'agent'; id: string; name: string }
  | { kind: 'digit'; digit: DigitId; name: string }
  | { kind: 'copilot'; name: 'Freddy AI Copilot' };

export interface Link {
  label: string;
  /** Opaque route target; resolve with the repo's router helpers. */
  to: { type: 'ticket' | 'change' | 'asset' | 'article' | 'related-tickets' | 'resolution-tab' | 'workflow-run'; id?: string };
}

/** Rich inline text: plain strings plus inline links. */
export type RichText = Array<string | Link>;

export interface Attachment { name: string; sizeLabel: string }

/* ───────────── Zone 1 · AI cards ───────────── */

export interface SummaryCard {
  state: 'not-generated' | 'generating' | 'ready' | 'out-of-date' | 'edited';
  title?: string;
  updatedAt?: string;
  updatedBy?: Actor;
  reason?: 'handover' | 'on-demand' | 'triage';
  issue?: RichText;
  tried?: RichText[];
  standing?: RichText;
  /** One-line "what has happened" used by the collapsed row and the sticky strip. */
  strip?: string;
  basedOn?: { messages: number; actions: number };
  /** For state 'out-of-date' (proposed). */
  newSince?: { messages: number; since: string };
  /** For state 'edited' (proposed). */
  editedBy?: { agent: Actor; at: string };
}

export type FixStepStatus = 'done' | 'failed' | 'skipped' | 'running';
export interface FixStep { label: string; status: FixStepStatus; detail?: string }

export interface SuggestedFix {
  title: string;
  via?: { kind: 'workflow'; name: string };
  status: 'proposed' | 'awaiting-approval' | 'running' | 'applied' | 'blocked' | 'none';
  steps?: FixStep[];
  nextStep?: RichText;
  verified?: string;
  approver?: Actor;
  /** Stream item to scroll to from "View in conversation". */
  eventId?: string;
}

export interface RootCauseCard {
  state: 'not-analyzed' | 'analyzing' | 'found' | 'inconclusive' | 'disputed';
  title?: string;
  at?: string;
  by?: Actor;
  cause?: RichText;
  evidence?: RichText[];
  /** For 'inconclusive'. */
  checked?: RichText;
  confidence?: { score: number; threshold: number; band: 'high' | 'medium' | 'low' };
  reasoning?: string;
  fix?: SuggestedFix;
}

export interface Description {
  body: RichText;
  attachments: Attachment[];
  /** e.g. "From Megan's first Slack message"; omit for normal tickets. */
  origin?: string;
}

/* ───────────── Zone 3 · Stream ───────────── */

export type MessageVariant =
  | 'requester-reply'
  | 'reply'
  | 'forward'
  | 'public-note'
  | 'private-note'
  | 'digit-message'
  | 'concierge-message';

export interface MessageNode {
  kind: 'message';
  id: string;
  at: string;
  actor: Actor;
  variant: MessageVariant;
  channel: Channel;
  /** Digit and Concierge messages: always 'workplace-concierge'. */
  via?: 'workplace-concierge';
  /** For reply/forward over email. */
  to?: string[];
  body: RichText;
  attachments?: Attachment[];
  /** Proposed, behind props. */
  flags?: { sentiment?: string; draftedWithCopilot?: 'as-is' | 'edited' };
}

export type EventType =
  | 'ticket-created'
  | 'delegated'
  | 'status-changed'
  | 'properties-updated'
  | 'searched'
  | 'root-cause-added'
  | 'summary-updated'
  | 'workflow-executed'
  | 'approval-requested'
  | 'approval-decided'
  | 'handed-over'
  | 'resolution-notes'
  | 'thought'
  | 'external-update'
  | 'digit-event';

export interface EventNode {
  kind: 'event';
  id: string;
  at: string;
  actor: Actor;
  type: EventType;
  /** Type-specific payload; see the examples in catalog.json. */
  data: {
    target?: Actor;                         // delegated, handed-over, approval-requested
    status?: string;                        // status-changed
    fields?: Array<{ field: string; from: string; to: string }>; // properties-updated
    count?: number;                         // searched, properties-updated, external-update
    entity?: string;                        // searched: "similar tickets", "recent change"
    object?: RichText;                      // searched (work graph), digit-event, approval-decided
    verb?: string;                          // digit-event, searched (alt phrasing)
    results?: Array<{ link: Link; meta: string }>; // searched
    workflow?: string;                      // workflow-executed
    steps?: FixStep[];                      // workflow-executed, thought (steps form)
    decision?: 'approved' | 'rejected';     // approval-decided
    reason?: 'blocked' | 'inconclusive';    // handed-over
    routing?: string;                       // handed-over
    details?: Array<{ label: string; value: RichText }>; // handed-over, ticket-created
    app?: string;                           // external-update
    seconds?: number;                       // thought
  };
  /** Reasoning shown behind a "Why" toggle. */
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
  comments: number;
  state: 'pending' | 'approved' | 'rejected';
  decidedBy?: Actor;
  decidedAt?: string;
}

export interface LiveNode {
  kind: 'live';
  id: string;
  actor: Actor;
  activity: 'thinking' | 'searching' | 'executing' | 'waiting';
  label: string;          // "Searching for similar tickets", "Waiting for approval from Jordan Reyes"
  elapsedSeconds: number;
}

export interface GroupNode {
  kind: 'group';
  id: string;
  level: 'run' | 'phase';
  actor: Actor;
  title: string;          // run: "Ticket Resolver worked on this before you"; phase: "Root cause"
  start: string;
  end: string;
  meta: string;           // "8 messages with Megan in Slack · 19 actions"
  /** Run: one chip per phase. Phase: its own outcome. */
  outcomes: Array<{ label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }>;
  defaultOpen: boolean;
  children: StreamNode[];
}

export type StreamNode = MessageNode | EventNode | ApprovalNode | LiveNode | GroupNode;

/* ───────────── Root ───────────── */

export interface TicketDetailsTab {
  ticket: {
    id: string;
    type: 'incident';
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
  /** Items appended for the "engaged" review state. */
  engagedStream?: StreamNode[];
}

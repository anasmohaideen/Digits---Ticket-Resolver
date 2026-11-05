/**
 * One example of every block and state, for the dev gallery.
 *
 * This is `docs/tr-details-handoff/data/catalog.json` expanded into the real
 * shapes: the JSON uses `@actor` shorthands and `ref` pointers into the two
 * scenario files, which is readable in a handoff but not renderable. The
 * content is unchanged.
 */

import type {
  ApprovalNode,
  Channel,
  EventNode,
  GroupNode,
  LiveNode,
  MessageNode,
  RootCauseCard,
  StreamNode,
  SuggestedFix,
  SummaryCard
} from '../types';
import { INC_4127 } from './inc-4127';
import { INC_4133 } from './inc-4133';

/* ───────────── Actors ───────────── */

export const TR = { kind: 'digit', digit: 'ticket-resolver', name: 'Ticket Resolver' } as const;
export const WC = { kind: 'digit', digit: 'workplace-concierge', name: 'Workplace Concierge' } as const;
export const KC = { kind: 'digit', digit: 'knowledge-curator', name: 'Knowledge Curator' } as const;
export const COPILOT = { kind: 'copilot', name: 'Freddy AI Copilot' } as const;
export const MEGAN = { kind: 'requester', id: 'u-megan', name: 'Megan Brooks' } as const;
export const DANIEL = { kind: 'requester', id: 'u-daniel', name: 'Daniel Ortiz' } as const;
export const JORDAN = { kind: 'agent', id: 'a-jordan', name: 'Jordan Reyes' } as const;

/** Finds an authored node anywhere in a scenario's stream, by id. */
function node(stream: StreamNode[], id: string): StreamNode {
  for (const item of stream) {
    if (item.id === id) return item;
    if (item.kind === 'group') {
      const found = item.children.find((child) => child.id === id) ?? null;
      if (found) return found;
      for (const child of item.children) {
        if (child.kind === 'group') {
          const deeper = child.children.find((grandchild) => grandchild.id === id);
          if (deeper) return deeper;
        }
      }
    }
  }
  throw new Error(`catalog: no stream node "${id}"`);
}

const event = (id: string) => node(INC_4127.stream, id) as EventNode;
const message = (id: string) => node(INC_4127.stream, id) as MessageNode;

export const RUN = node(INC_4127.stream, 'g-run') as GroupNode;
export const APPROVAL = node(INC_4127.stream, 'ap1') as ApprovalNode;

/* ───────────── B1 · Summary states ───────────── */

export const SUMMARY_CATALOG: Array<{ label: string; summary: SummaryCard; collapsed?: boolean }> = [
  { label: 'Not generated', summary: { state: 'not-generated' } },
  {
    label: 'Generating',
    summary: { state: 'generating', updatedBy: TR, elapsedSeconds: 2.1 }
  },
  { label: 'Ready', summary: INC_4127.summary },
  {
    label: 'Out of date (proposed)',
    summary: {
      ...INC_4127.summary,
      state: 'out-of-date',
      newSince: { messages: 3, since: '2026-10-19T09:35:00-07:00' }
    }
  },
  {
    label: 'Edited by an agent (proposed)',
    summary: {
      ...INC_4127.summary,
      state: 'edited',
      editedBy: { agent: JORDAN, at: '2026-10-19T09:52:00-07:00' },
      standing: ['Intune profile assigned manually at 9:44. Waiting for Megan to confirm.']
    }
  },
  { label: 'Ready, collapsed', summary: INC_4127.summary, collapsed: true }
];

/* ───────────── B2 · Root cause states ───────────── */

export const ROOT_CAUSE_CATALOG: Array<{
  label: string;
  rootCause: RootCauseCard;
  collapsed?: boolean;
}> = [
  { label: 'Not analyzed', rootCause: { state: 'not-analyzed' } },
  {
    label: 'Analyzing',
    rootCause: {
      state: 'analyzing',
      by: TR,
      live: { label: 'Searching for similar tickets', elapsedSeconds: 2.1 }
    }
  },
  { label: 'Found', rootCause: INC_4127.rootCause },
  {
    label: 'Inconclusive',
    rootCause: {
      state: 'inconclusive',
      by: TR,
      at: '2026-10-19T09:21:00-07:00',
      title: 'Couldn’t determine a root cause',
      checked: [
        '4 similar tickets, 1 recent change and the requester’s device. 2 similar tickets were fixed in different ways, so the evidence conflicts.'
      ],
      confidence: { score: 0.41, threshold: 0.75, band: 'low' },
      fix: { title: 'No fix suggested', status: 'none' }
    }
  },
  {
    label: 'Marked not helpful (proposed)',
    rootCause: {
      ...INC_4127.rootCause,
      state: 'disputed',
      feedback: { by: JORDAN, reasonPlaceholder: 'What was wrong?' }
    }
  },
  { label: 'Found, collapsed', rootCause: INC_4127.rootCause, collapsed: true }
];

/* ───────────── B2 · Suggested fix statuses ───────────── */

const BLOCKED_FIX = INC_4127.rootCause.fix!;

export const FIX_CATALOG: SuggestedFix[] = [
  {
    title: 'Re-issue Megan’s Wi-Fi certificate',
    via: { kind: 'workflow', name: 'Re-issue Wi-Fi certificate (macOS)' },
    status: 'proposed'
  },
  {
    title: 'Re-issue Megan’s Wi-Fi certificate',
    status: 'awaiting-approval',
    approver: JORDAN,
    eventId: 'ap1'
  },
  {
    title: 'Re-issue Megan’s Wi-Fi certificate',
    via: { kind: 'workflow', name: 'Re-issue Wi-Fi certificate (macOS)' },
    status: 'running',
    elapsedSeconds: 2.1,
    steps: [
      { label: 'Revoked the old certificate', status: 'done' },
      { label: 'Assigning the new Wi-Fi profile', status: 'running' },
      { label: 'Confirm the laptop checked in', status: 'skipped' }
    ]
  },
  {
    title: 'Re-issue Megan’s Wi-Fi certificate',
    status: 'applied',
    verified: 'Workflow confirmed the laptop checked in. Megan confirmed she’s back on Corp-Secure.'
  },
  BLOCKED_FIX,
  { title: 'No fix suggested', status: 'none' }
];

/* ───────────── B4 · Messages ───────────── */

export const MESSAGE_CATALOG: Array<{ label: string; message: MessageNode; compact?: boolean }> = [
  {
    label: 'Requester reply · Slack',
    message: { ...message('m3'), body: ['Just me, I think.'] }
  },
  {
    label: 'Requester reply · with sentiment (proposed)',
    message: {
      kind: 'message',
      id: 'cat-m10',
      at: '2026-10-19T09:37:00-07:00',
      variant: 'requester-reply',
      channel: 'slack',
      actor: INC_4127.ticket.requester,
      body: ['Ugh, second time this month. I have a client demo at 11.'],
      flags: { sentiment: 'Frustrated · Time-sensitive' }
    }
  },
  {
    label: 'Requester reply · email with an attachment',
    message: {
      kind: 'message',
      id: 'cat-x5',
      at: '2026-10-19T08:46:00-07:00',
      actor: DANIEL,
      variant: 'requester-reply',
      channel: 'email',
      body: ['Here you go.'],
      attachments: [{ name: 'outlook-prompt.png', sizeLabel: '212 KB' }]
    }
  },
  {
    label: 'Agent reply · email',
    message: {
      kind: 'message',
      id: 'cat-x4',
      at: '2026-10-19T08:31:00-07:00',
      actor: JORDAN,
      variant: 'reply',
      channel: 'email',
      to: ['daniel.ortiz@acmecorp.com'],
      body: ['Could you send a screenshot of the prompt?']
    }
  },
  {
    label: 'Agent reply · Slack, drafted with Freddy (proposed)',
    message: {
      kind: 'message',
      id: 'cat-r1',
      at: '2026-10-19T09:44:00-07:00',
      actor: JORDAN,
      variant: 'reply',
      channel: 'slack',
      body: ['I’ve pushed the fix to your laptop.'],
      flags: { draftedWithCopilot: 'edited' }
    }
  },
  {
    label: 'Forward',
    message: {
      kind: 'message',
      id: 'cat-x7',
      at: '2026-10-19T08:50:00-07:00',
      actor: JORDAN,
      variant: 'forward',
      channel: 'email',
      to: ['identity-team@acmecorp.com'],
      body: ['Can you check sign-in logs?']
    }
  },
  {
    label: 'Public note',
    message: {
      kind: 'message',
      id: 'cat-x3',
      at: '2026-10-19T08:20:00-07:00',
      actor: JORDAN,
      variant: 'public-note',
      channel: 'email',
      body: ['No Microsoft 365 incidents reported for our tenant.']
    }
  },
  {
    label: 'Private note',
    message: {
      kind: 'message',
      id: 'cat-n1',
      at: '2026-10-19T09:41:00-07:00',
      actor: JORDAN,
      variant: 'private-note',
      channel: 'slack',
      body: ['Assigning the profile manually in Intune.']
    }
  },
  {
    label: 'Digit message',
    message: { ...message('m9'), body: ['I’ve passed this to Jordan on the Network team with everything I found.'] }
  },
  {
    label: 'Concierge message',
    message: {
      ...message('m2'),
      body: ['Is it only your laptop, or are people around you having trouble too?']
    }
  },
  {
    label: 'Digit message · compact (inside a phase)',
    message: {
      ...message('m4'),
      body: ['Let’s try a quick fix: forget Corp-Secure, then rejoin.']
    },
    compact: true
  }
];

/* ───────────── B5 · Events ───────────── */

export const EVENT_CATALOG: Array<{ label: string; event: EventNode; note?: string }> = [
  { label: 'Ticket created', event: event('e-created') },
  { label: 'Delegated', event: event('e-deleg') },
  {
    label: 'Status changed',
    event: {
      kind: 'event',
      id: 'cat-status',
      at: '2026-10-19T09:18:00-07:00',
      actor: TR,
      type: 'status-changed',
      data: { status: 'Waiting on Requester' }
    }
  },
  { label: 'Properties updated', event: event('e-props') },
  { label: 'Searched · with results', event: event('e-s1') },
  { label: 'Searched · count and linked object', event: event('e-s2') },
  { label: 'Searched · work graph phrasing', event: event('e-s3') },
  { label: 'Root cause added · with Why', event: event('e-rc') },
  { label: 'Summary updated', event: event('e-sum') },
  { label: 'Workflow executed · 1 step failed', event: event('e-wf') },
  {
    label: 'Workflow executed · all done',
    event: {
      kind: 'event',
      id: 'cat-wf-ok',
      at: '2026-10-19T09:36:00-07:00',
      actor: TR,
      type: 'workflow-executed',
      data: {
        workflow: 'Re-issue Wi-Fi certificate (macOS)',
        steps: [
          { label: 'Revoked the old certificate in Microsoft Intune', status: 'done' },
          { label: 'Assigned the new Corp-Secure Wi-Fi profile in Intune', status: 'done' },
          { label: 'Confirmed the laptop checked in · new certificate valid until Oct 2027', status: 'done' }
        ]
      }
    }
  },
  { label: 'Approval requested', event: event('e-ar') },
  { label: 'Approval decided · approved', event: event('e-ad') },
  {
    label: 'Approval decided · rejected',
    event: {
      kind: 'event',
      id: 'cat-ad-no',
      at: '2026-10-19T09:31:00-07:00',
      actor: JORDAN,
      type: 'approval-decided',
      data: {
        decision: 'rejected',
        object: ['Re-issue Megan’s Wi-Fi certificate'],
        details: [{ label: 'Reason', value: ['Hold until we decide whether to roll back CHG-2187.'] }]
      }
    }
  },
  { label: 'Handed over · blocked', event: event('e-ho') },
  {
    label: 'Handed over · inconclusive',
    event: {
      kind: 'event',
      id: 'cat-ho-inc',
      at: '2026-10-19T09:35:00-07:00',
      actor: TR,
      type: 'handed-over',
      data: {
        target: JORDAN,
        reason: 'inconclusive',
        routing: 'Intelligent routing → Network Team',
        details: [
          { label: 'Checked', value: ['4 similar tickets, 1 recent change'] },
          { label: 'Confidence', value: ['Low · 0.41 (threshold 0.75)'] }
        ]
      }
    }
  },
  {
    label: 'Resolution notes',
    event: {
      kind: 'event',
      id: 'cat-res',
      at: '2026-10-19T09:36:00-07:00',
      actor: TR,
      type: 'resolution-notes',
      data: { object: [{ label: 'resolution notes', to: { type: 'resolution-tab' } }] }
    }
  },
  {
    label: 'Thought',
    event: {
      kind: 'event',
      id: 'cat-thought',
      at: '2026-10-19T09:36:30-07:00',
      actor: TR,
      type: 'thought',
      data: {
        seconds: 2,
        steps: [
          { label: 'Workflow reported the new certificate is valid until Oct 2027', status: 'done' },
          { label: 'Megan confirmed she’s back on Corp-Secure', status: 'done' }
        ]
      }
    }
  },
  {
    label: 'Updates in an external app',
    note: 'Tools-registry path only — not MVP.',
    event: {
      kind: 'event',
      id: 'cat-ext',
      at: '2026-10-19T09:37:00-07:00',
      actor: TR,
      type: 'external-update',
      data: { app: 'Workday', count: 3 }
    }
  },
  {
    label: 'Another Digit’s event',
    event: {
      kind: 'event',
      id: 'cat-kc',
      at: '2026-10-19T10:02:00-07:00',
      actor: KC,
      type: 'digit-event',
      data: {
        verb: 'proposed updates to',
        object: [{ label: 'Can’t connect to Corp-Secure Wi-Fi', to: { type: 'article', id: 'KB-118' } }]
      }
    }
  }
];

/* ───────────── B6 · Approval ───────────── */

export const APPROVAL_CATALOG: Array<{ label: string; approval: ApprovalNode }> = [
  { label: 'Pending', approval: { ...APPROVAL, id: 'cat-ap-pending', state: 'pending' } },
  { label: 'Approved', approval: APPROVAL },
  {
    label: 'Rejected (proposed)',
    approval: {
      ...APPROVAL,
      id: 'cat-ap-rejected',
      state: 'rejected',
      decidedBy: JORDAN,
      decidedAt: '2026-10-19T09:31:00-07:00'
    }
  }
];

/* ───────────── B5 · Live states ───────────── */

export const LIVE_CATALOG: LiveNode[] = [
  { kind: 'live', id: 'cat-live-think', actor: TR, activity: 'thinking', label: 'Thinking', elapsedSeconds: 2.1 },
  {
    kind: 'live',
    id: 'cat-live-search',
    actor: TR,
    activity: 'searching',
    label: 'Searching for similar tickets',
    elapsedSeconds: 2.1
  },
  {
    kind: 'live',
    id: 'cat-live-exec',
    actor: TR,
    activity: 'executing',
    label: 'Executing workflow: Re-issue Wi-Fi certificate (macOS)',
    elapsedSeconds: 2.1
  },
  {
    kind: 'live',
    id: 'cat-live-wait',
    actor: TR,
    activity: 'waiting',
    label: 'Waiting for approval from Jordan Reyes',
    elapsedSeconds: 240
  }
];

/* ───────────── B7 · Groups ───────────── */

export const GROUP_CATALOG: Array<{ label: string; run: GroupNode; open: boolean; openPhaseIds?: string[] }> = [
  { label: 'Digit run · collapsed (landing)', run: RUN, open: false },
  {
    label: 'Digit run · expanded, two phases open',
    run: RUN,
    open: true,
    openPhaseIds: ['p-before', 'p-rca']
  }
];

/** The human-thread fold, straight from the email scenario. */
export const HUMAN_THREAD = INC_4133.stream;

/* ───────────── B9 · Reply bar ───────────── */

export const REPLY_BAR_CATALOG: Array<{ label: string; source: Channel }> = [
  { label: 'Slack · reply in Slack, private note only', source: 'slack' },
  { label: 'Teams · reply in Teams, private note only', source: 'teams' },
  { label: 'Email · today’s labels, public and private notes', source: 'email' }
];

/* ───────────── B10 · Sticky strip ───────────── */

export const STRIP_CATALOG: Array<{ label: string; summary: SummaryCard; rootCause: RootCauseCard }> = [
  { label: 'With a root cause and a fix', summary: INC_4127.summary, rootCause: INC_4127.rootCause },
  { label: 'No root cause — text and Show only', summary: INC_4133.summary, rootCause: INC_4133.rootCause }
];

export { INC_4127, INC_4133, COPILOT as FREDDY, WC as CONCIERGE };

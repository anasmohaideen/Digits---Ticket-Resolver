import type { Actor, ApprovalNode, EventNode, MessageNode, RichText, StreamNode } from '../types';
import { incidentTimestamp, refreshIncidentDates } from '../incidentDates.ts';

/**
 * Option 2 · the review interactions, as data.
 *
 * Each scenario is a later moment in the same story, so they build on one
 * another: S2 is S1 plus Jordan asking the AI, S3 adds the reply editor, S4 is
 * the ticket resolved. Everything here is Option 2's own — the shared fixtures
 * are not touched, the extra entries are appended at render time.
 */

export const SCENARIOS = ['1', '2', '3', '4', '5'] as const;
export type ScenarioId = (typeof SCENARIOS)[number];

export const SCENARIO_LABEL: Record<ScenarioId, string> = {
  '1': 'Consumption',
  '2': 'Ask AI',
  '3': 'Public reply',
  '4': 'Resolution',
  '5': 'Approvals'
};

export function parseScenario(value: string | null): ScenarioId {
  return SCENARIOS.includes(value as ScenarioId) ? (value as ScenarioId) : '1';
}

/**
 * The four interactions are authored around the incident. SR-4128 tells its
 * own, complete story in its fixture, so it renders that as authored rather
 * than having the incident's Wi-Fi messages appended to it.
 */
export function hasScenarioData(ticketId: string): boolean {
  return ticketId === 'INC-4127';
}

const RESOLVER: Actor = { kind: 'digit', digit: 'ticket-resolver', name: 'Ticket Resolver' };
const MEGAN: Actor = { kind: 'requester', id: 'u-megan', name: 'Megan Brooks', title: 'Product Analyst · San Mateo HQ' };
export const JORDAN: Actor = { kind: 'agent', id: 'a-jordan', name: 'Jordan Reyes' };

/* ───────────── S1 · the customer chases ───────────── */

const CHASER: MessageNode = {
  kind: 'message',
  id: 'o2-m10',
  at: incidentTimestamp('2026-10-20T10:05:00-07:00'),
  actor: MEGAN,
  variant: 'requester-reply',
  channel: 'slack',
  body: ['Hey, is there any update on this? I’m still stuck on Guest Wi-Fi and can’t get to anything internal.']
};

/** A current, unresolved action used to exercise the sticky approval surface. */
export const PROFILE_APPROVAL: ApprovalNode = {
  kind: 'approval',
  id: 'o2-ap-profile',
  at: incidentTimestamp('2026-10-20T10:04:00-07:00'),
  actor: RESOLVER,
  title: 'Assign the Corp-Secure Wi-Fi profile to Megan’s laptop',
  what: [
    'Assign the “Corp-Secure Wi-Fi (2026)” configuration profile to ASSET-2291 in Microsoft Intune. Ticket Resolver will then verify that the new certificate is installed.'
  ],
  whyAction: [
    'The certificate was renewed, but the workflow could not assign the Wi-Fi profile because its service account lacks permission. This change affects the device’s network configuration.'
  ],
  reason: 'The workflow’s service account can’t assign device profiles, so it needs your go-ahead.',
  comments: 0,
  state: 'pending'
};

/** A handoff-time field update that needs the assigned agent's approval. */
export const PROPERTY_UPDATE_APPROVAL: ApprovalNode = {
  kind: 'approval',
  id: 'o2-ap-properties',
  at: incidentTimestamp('2026-10-20T10:06:00-07:00'),
  actor: RESOLVER,
  title: 'Update ticket properties',
  what: [],
  whyAction: [
    'Based on the Wi-Fi connectivity issue and the worker’s investigation, these are the updates I recommend.'
  ],
  proposedFields: [
    { field: 'Priority', from: 'Medium', to: 'High' },
    { field: 'Category', from: '--', to: 'Network' },
    { field: 'Sub-category', from: '--', to: 'Wi-Fi' },
    { field: 'Item', from: '--', to: 'Connectivity' }
  ],
  actionLabels: { reject: 'Discard', approve: 'Accept' },
  reason: 'Based on the Wi-Fi connectivity issue and the worker’s investigation, these are the updates I recommend.',
  comments: 0,
  state: 'pending'
};

/* ───────────── S2 · Ask AI ───────────── */

/** The question S2 opens with, already typed in the Ask AI editor. */
export const ASK_QUESTION = 'Why did the Wi-Fi profile step fail, and can I assign it myself?';

/** The private note Jordan's question lands as in the main pane. */
export const ASK_NOTE: MessageNode = {
  kind: 'message',
  id: 'o2-ask-1',
  at: incidentTimestamp('2026-10-20T10:12:00-07:00'),
  actor: JORDAN,
  variant: 'private-note',
  channel: 'slack',
  body: ['Why did the Wi-Fi profile step fail, and can I assign it myself?']
};

export interface ThreadMessage {
  id: string;
  from: 'agent' | 'ai';
  at: string;
  body: string;
}

/** Ticket Resolver's side of the S2 back-and-forth, preloaded in the side pane. */
export const ASK_THREAD: ThreadMessage[] = [
  { id: 't1', from: 'agent', at: ASK_NOTE.at, body: 'Why did the Wi-Fi profile step fail, and can I assign it myself?' },
  {
    id: 't2',
    from: 'ai',
    at: incidentTimestamp('2026-10-20T10:12:20-07:00'),
    body: 'The workflow’s service account can revoke certificates but isn’t allowed to assign device profiles in Intune, so step 3 returned “permission denied”. You’re in the Network Team’s Intune admin group, so you can assign it: Devices › ASSET-2291 › Configuration › assign “Corp-Secure Wi-Fi (2026)”.'
  }
];

/** Canned answers for anything asked in the prototype after the preloaded ones. */
export const AI_FOLLOW_UPS = [
  'Once the profile is assigned, Megan’s laptop picks up the new certificate on its next Intune check-in, usually within 5 minutes. A restart forces it.',
  'Yes — 3 of the 7 similar tickets were closed the same way. I can draft a reply to Megan with the restart step if you’d like.',
  'Nothing else on her device record looks off. If it still fails after the restart, the next thing to check is the RADIUS log for her MAC address.'
];

/* ───────────── S3 · the suggested reply ───────────── */

export const SUGGESTED_REPLY = refreshIncidentDates(
  'Hi Megan, thanks for bearing with us. The Wi-Fi certificate on your laptop didn’t renew after an update on Friday, so Corp-Secure was rejecting it. I’ve now assigned the new Wi-Fi profile to your MacBook. Please restart it and rejoin Corp-Secure — it should connect straight away. Let me know if it doesn’t.');

/** "Make it shorter" in the composer's Reply using AI menu. */
export const SUGGESTED_REPLY_SHORT =
  'Hi Megan, I’ve assigned the new Wi-Fi profile to your MacBook. Please restart it and rejoin Corp-Secure, and let me know if it still fails.';

/* ───────────── S4 · resolved ───────────── */

const SENT_REPLY: MessageNode = {
  kind: 'message',
  id: 'o2-reply-1',
  at: incidentTimestamp('2026-10-20T10:31:00-07:00'),
  actor: JORDAN,
  variant: 'reply',
  channel: 'slack',
  body: [SUGGESTED_REPLY],
  flags: { draftedWithCopilot: 'as-is' }
};

const CONFIRMATION: MessageNode = {
  kind: 'message',
  id: 'o2-m11',
  at: incidentTimestamp('2026-10-20T10:44:00-07:00'),
  actor: MEGAN,
  variant: 'requester-reply',
  channel: 'slack',
  body: ['That worked! I’m back on Corp-Secure. Thanks, Jordan.']
};

const RESOLVED_WORK: EventNode[] = [
  {
    kind: 'event',
    id: 'o2-w1',
    at: incidentTimestamp('2026-10-20T10:45:00-07:00'),
    actor: RESOLVER,
    type: 'digit-event',
    data: { verb: 'confirmed the fix with', object: ['Megan’s reply'] },
    intent: 'Megan confirmed she is back on Corp-Secure. I should check the device before writing up the resolution.',
    intentGroup: 'resolution'
  },
  {
    kind: 'event',
    id: 'o2-w2',
    at: incidentTimestamp('2026-10-20T10:46:10-07:00'),
    actor: RESOLVER,
    type: 'searched',
    data: { verb: 'checked the Intune device record for', object: ['ASSET-2291'] },
    intentGroup: 'resolution',
    workOutcome: 'The new certificate is installed and the Corp-Secure profile reports as assigned.'
  },
  {
    kind: 'event',
    id: 'o2-w3',
    at: incidentTimestamp('2026-10-20T10:48:30-07:00'),
    actor: RESOLVER,
    type: 'status-changed',
    data: { status: 'Resolved' },
    intent: 'The fix is verified, so the ticket can be resolved.',
    intentGroup: 'close'
  }
];

const RESOLUTION_EVENT: EventNode = {
  kind: 'event',
  id: 'o2-resolution',
  at: incidentTimestamp('2026-10-20T10:49:00-07:00'),
  actor: RESOLVER,
  type: 'resolution-notes',
  data: {}
};

export interface ResolutionNote {
  at: string;
  by: Actor;
  /** The one-line form, for the brief bar. */
  brief: string;
  resolution: RichText;
  cause: RichText;
  steps: RichText[];
  prevention?: RichText;
}

export const RESOLUTION_NOTE: ResolutionNote = {
  at: RESOLUTION_EVENT.at,
  by: RESOLVER,
  brief: 'Wi-Fi profile reassigned and certificate renewed; Megan is back on Corp-Secure',
  resolution: ['Megan is back on Corp-Secure Wi-Fi after Jordan assigned the new Wi-Fi profile and she restarted her laptop.'],
  cause: [
    'Her Wi-Fi certificate didn’t renew after ',
    { label: 'CHG-2187', to: { type: 'change', id: 'CHG-2187' } },
    ' rotated the certificate authority in Intune.'
  ],
  steps: [
    ['Revoked the old certificate in Microsoft Intune (Re-issue Wi-Fi certificate workflow).'],
    ['Jordan Reyes assigned the Corp-Secure Wi-Fi (2026) profile manually after the workflow hit a permissions error.'],
    ['Megan restarted and rejoined Corp-Secure; device record confirms the new certificate.']
  ],
  prevention: [
    'Grant the workflow’s service account permission to assign device profiles so the ',
    { label: '6 other similar tickets', to: { type: 'related-tickets' } },
    ' can be fixed end to end.'
  ]
};

/**
 * What a scenario appends to the authored stream, in time order. S2's private
 * note is not here: it belongs to its Ask AI thread (`useAskAi`).
 */
export function scenarioStream(scenario: ScenarioId): StreamNode[] {
  const nodes: StreamNode[] = [CHASER];
  if (scenario === '4') nodes.push(SENT_REPLY, CONFIRMATION, ...RESOLVED_WORK, RESOLUTION_EVENT);
  return nodes;
}

export function scenarioApprovals(scenario: ScenarioId): ApprovalNode[] {
  /* Consumption (S1) is about reading the ticket, and approvals have their own
     scenario (S5), so S1 carries none. S4 has Jordan finishing the fix by hand. */
  if (scenario === '4' || scenario === '1') return [];
  /* S5 tries the stack: both approvals waiting at once. The other scenarios wait
     on the Wi-Fi profile. */
  if (scenario === '5') return [PROFILE_APPROVAL, PROPERTY_UPDATE_APPROVAL];
  return [PROFILE_APPROVAL];
}

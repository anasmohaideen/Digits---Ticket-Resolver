import type { Actor, StreamNode, TicketDetailsTab } from '../types';

/**
 * SR-4128 · "Employee software and benefits request".
 *
 * A service request's own story, not the incident's. A request has no root
 * cause to find, so the top card stays on the Summary; what it does have is an
 * approval — the one artifact the 21 Oct review kept for service requests —
 * and a fulfilment arc across three catalog items and two teams.
 *
 * The requested-items table, the attachments and the description below all
 * describe these same three items.
 */

const RESOLVER: Actor = { kind: 'digit', digit: 'ticket-resolver', name: 'Ticket Resolver' };
const CONCIERGE: Actor = { kind: 'digit', digit: 'workplace-concierge', name: 'Workplace Concierge' };
const MEGAN: Actor = { kind: 'requester', id: 'u-megan', name: 'Megan Brooks', title: 'Product Analyst · San Mateo HQ' };
const JORDAN: Actor = { kind: 'agent', id: 'a-jordan', name: 'Jordan Reyes' };

/**
 * The Digit's work, as one run with the phases the stream flattens into each
 * message's "Worked for" log.
 */
const STREAM: StreamNode[] = [
  {
    kind: 'group',
    id: 'g-run',
    level: 'run',
    actor: RESOLVER,
    title: 'Ticket Resolver worked on this before you',
    start: '2026-10-19T09:05:00-07:00',
    end: '2026-10-19T10:02:00-07:00',
    meta: '6 messages with Megan in Slack · 11 actions',
    outcomes: [
      { label: 'Catalog items · created', tone: 'success' },
      { label: 'Illustrator licence · needs approval', tone: 'warning' }
    ],
    defaultOpen: false,
    children: [
      {
        kind: 'message',
        id: 'm1',
        at: '2026-10-19T09:05:00-07:00',
        actor: MEGAN,
        variant: 'requester-reply',
        channel: 'slack',
        body: [
          'Hi! Three things, sorry to bundle them: I need Adobe Illustrator for the brand refresh, I’d like to claim the travel advance for next week’s Austin offsite, and I need to add my newborn to my health cover.'
        ]
      },
      {
        kind: 'message',
        id: 'm2',
        at: '2026-10-19T09:05:40-07:00',
        actor: CONCIERGE,
        variant: 'concierge-message',
        channel: 'slack',
        via: 'workplace-concierge',
        body: [
          'Happy to help, Megan — bundling is fine. Quick check so I raise the right items: is the Illustrator licence for you only, and is the advance for the Austin trip on the 27th?'
        ]
      },
      {
        kind: 'message',
        id: 'm3',
        at: '2026-10-19T09:08:00-07:00',
        actor: MEGAN,
        variant: 'requester-reply',
        channel: 'slack',
        body: ['Just me for Illustrator, and yes — Austin, 27th to 29th.']
      },
      {
        kind: 'event',
        id: 'w1',
        at: '2026-10-19T09:09:00-07:00',
        actor: RESOLVER,
        type: 'searched',
        data: { verb: 'matched the request against the service catalog', count: 3, entity: 'catalog items' },
        intent: 'Megan asked for three unrelated things in one message. I should split them into their own catalog items so each can be fulfilled by the team that owns it.',
        intentGroup: 'intake'
      },
      {
        kind: 'event',
        id: 'w2',
        at: '2026-10-19T09:09:30-07:00',
        actor: RESOLVER,
        type: 'properties-updated',
        data: { fields: [{ field: 'Group', from: '--', to: 'Service Desk' }] },
        intentGroup: 'intake',
        workOutcome: 'Three items raised: Adobe Illustrator CC to Access Management, Advance Cash Request to Finance, and Benefits Change Request to HR.'
      },
      {
        kind: 'event',
        id: 'e-sum',
        at: '2026-10-19T09:09:50-07:00',
        actor: RESOLVER,
        type: 'summary-updated',
        data: {}
      },
      {
        kind: 'message',
        id: 'm4',
        at: '2026-10-19T09:10:00-07:00',
        actor: RESOLVER,
        variant: 'digit-message',
        channel: 'slack',
        body: [
          'All three are raised as SR-4128. The travel advance and the benefits change are with Finance and HR. Illustrator is a paid licence, so it needs your manager’s approval first — I’ve sent that to Jordan.'
        ]
      },
      {
        kind: 'event',
        id: 'w3',
        at: '2026-10-19T09:11:00-07:00',
        actor: RESOLVER,
        type: 'searched',
        data: { verb: 'checked the licence pool for', object: ['Adobe Illustrator CC'] },
        intent: 'Before asking for approval I should check whether a spare licence already exists, since reusing one needs no spend.',
        intentGroup: 'licence',
        workOutcome: 'No spare seats: 24 of 24 in use, so this is a new purchase and needs approval.'
      },
      {
        kind: 'approval',
        id: 'ap1',
        at: '2026-10-19T09:12:00-07:00',
        actor: RESOLVER,
        title: 'Approve an Adobe Illustrator CC licence for Megan Brooks',
        what: ['Buy one Adobe Illustrator CC seat (£19.97 per month) and assign it to Megan’s Adobe account.'],
        whyAction: [
          'The licence pool is fully allocated, so this is new spend. Design software over £15 a month needs the requester’s manager to approve.'
        ],
        comments: 0,
        state: 'approved',
        decidedBy: JORDAN,
        decidedAt: '2026-10-19T09:31:00-07:00'
      },
      {
        kind: 'event',
        id: 'w4',
        at: '2026-10-19T09:33:00-07:00',
        actor: RESOLVER,
        type: 'workflow-executed',
        data: {
          workflow: 'Assign Adobe licence',
          steps: [
            { label: 'Purchased one Illustrator CC seat', status: 'done' },
            { label: 'Assigned the seat to megan.brooks@acme.com', status: 'done' },
            { label: 'Emailed Megan the activation link', status: 'done' }
          ]
        },
        intent: 'Jordan approved the spend, so I can buy the seat and assign it.',
        intentGroup: 'licence',
        workOutcome: 'Illustrator is active on Megan’s account.'
      },
      {
        kind: 'message',
        id: 'm5',
        at: '2026-10-19T09:35:00-07:00',
        actor: RESOLVER,
        variant: 'digit-message',
        channel: 'slack',
        body: [
          'Jordan approved the licence — Illustrator is on your Adobe account now, just sign out and back in. Finance have the travel advance and will pay it with the November run.'
        ]
      },
      {
        kind: 'message',
        id: 'm6',
        at: '2026-10-19T09:52:00-07:00',
        actor: MEGAN,
        variant: 'requester-reply',
        channel: 'slack',
        body: ['Illustrator is working, thank you. What about the health cover — does HR need anything from me?']
      },
      {
        kind: 'event',
        id: 'w5',
        at: '2026-10-19T09:58:00-07:00',
        actor: RESOLVER,
        type: 'searched',
        data: { verb: 'checked the HR benefits workflow for', object: ['dependent additions'] },
        intent: 'Megan is asking what HR still needs. I should check the dependent-addition rules rather than guess.',
        intentGroup: 'benefits',
        workOutcome: 'Adding a newborn needs a birth certificate within 30 days of birth, then cover backdates to the date of birth.'
      },
      {
        kind: 'message',
        id: 'm7',
        at: '2026-10-19T10:02:00-07:00',
        actor: RESOLVER,
        variant: 'digit-message',
        channel: 'slack',
        body: [
          'HR need one thing: your baby’s birth certificate, uploaded to this request. Do that within 30 days of the birth and the cover backdates to their date of birth, so there’s no gap.'
        ]
      }
    ]
  },
  {
    kind: 'event',
    id: 'e-handover',
    at: '2026-10-19T10:03:00-07:00',
    actor: RESOLVER,
    type: 'handed-over',
    data: {
      target: JORDAN,
      reason: 'blocked',
      routing: 'Service Desk',
      details: [
        { label: 'Waiting on', value: ['Megan to upload the birth certificate for the benefits change'] },
        { label: 'Done', value: ['Illustrator licence assigned; travel advance queued with Finance'] }
      ]
    }
  }
];

export const SR_4128: TicketDetailsTab = {
  ticket: {
    id: 'SR-4128',
    type: 'service-request',
    subject: 'Employee software and benefits request',
    source: 'slack',
    requester: MEGAN,
    assignee: JORDAN,
    createdBy: CONCIERGE
  },
  viewer: { agent: JORDAN },
  summary: {
    state: 'ready',
    title: 'Three catalog items: Illustrator, travel advance, benefits change',
    updatedAt: '2026-10-19T09:09:50-07:00',
    updatedBy: RESOLVER,
    reason: 'handover',
    issue: [
      'Megan asked for three things in one Slack message: an Adobe Illustrator CC licence, a travel advance for the Austin offsite on 27–29 Oct, and a benefits change to add her newborn to her health cover.'
    ],
    tried: [
      ['Split into three catalog items and routed them to Access Management, Finance and HR.'],
      ['The Illustrator licence needed new spend, so it went to Jordan for approval; once approved the seat was bought and assigned.']
    ],
    standing: [
      'Illustrator is active and the travel advance is queued with Finance for the November run. The benefits change is waiting on Megan to upload the birth certificate.'
    ],
    strip: 'Illustrator assigned; advance with Finance; benefits change waiting on a document.',
    basedOn: { messages: 6, actions: 11 }
  },
  /* A request has nothing to diagnose, so the top card offers Summary alone. */
  rootCause: { state: 'not-analyzed' },
  description: {
    brief: 'Megan needs three things: an Adobe Illustrator licence, a travel advance for the Austin offsite on 27–29 Oct, and her newborn added to her health cover.',
    origin: 'From Megan’s first Slack message',
    body: [
      'Hi! Three things, sorry to bundle them: I need Adobe Illustrator for the brand refresh, I’d like to claim the travel advance for next week’s Austin offsite, and I need to add my newborn to my health cover.'
    ],
    attachments: [{ name: 'offsite-itinerary.pdf', sizeLabel: '96 KB' }]
  },
  stream: STREAM
};

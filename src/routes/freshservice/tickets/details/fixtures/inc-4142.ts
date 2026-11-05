import type { Actor, TicketDetailsTab } from '../types';

/**
 * Path: Inconclusive at Root cause. A Slack incident Ticket Resolver
 * investigated but could not pin down: three weak suspects, none confirmed, no
 * crash reports to separate them. With no confirmed cause there is no fix to
 * run, so it hands over as Inconclusive and a person collects the evidence.
 *
 * Invented for the prototype, in the same morning window as INC-4127 (earlier
 * in it) so `refreshIncidentDates` maps the times the same way.
 */

const RESOLVER: Actor = { kind: 'digit', digit: 'ticket-resolver', name: 'Ticket Resolver' };
const CONCIERGE: Actor = { kind: 'digit', digit: 'workplace-concierge', name: 'Workplace Concierge' };
const MARCUS: Actor = { kind: 'requester', id: 'u-marcus', name: 'Marcus Bell', title: 'Account Executive · New York' };
const JORDAN: Actor = { kind: 'agent', id: 'a-jordan', name: 'Jordan Reyes' };

export const INC_4142: TicketDetailsTab = {
  ticket: {
    id: 'INC-4142',
    type: 'incident',
    subject: 'MacBook restarts during video calls [IR]',
    source: 'slack',
    requester: MARCUS,
    assignee: JORDAN,
    createdBy: RESOLVER
  },
  viewer: { agent: JORDAN },
  summary: {
    state: 'ready',
    title: 'Marcus’s MacBook restarts during video calls',
    updatedAt: '2026-10-19T08:55:00-07:00',
    updatedBy: RESOLVER,
    reason: 'handover',
    issue: [
      'Marcus’s MacBook restarts on its own in the middle of video calls, a few times a week, in both Zoom and Teams. It happened twice yesterday with customers on the line.'
    ],
    tried: [
      ['Knowledge-base steps (install pending macOS updates, restart): it restarted again an hour later.'],
      ['Ticket Resolver checked similar tickets, recent changes and the device record. Three weak suspects, none confirmed, and no crash reports are available.']
    ],
    standing: [
      'Handed over to the Hardware team. Next step: collect the crash logs after the next restart to tell the suspects apart.'
    ],
    strip: 'Restarts during video calls. Ticket Resolver couldn’t confirm a cause; the next step is to collect crash logs.',
    basedOn: { messages: 9, actions: 12 }
  },
  rootCause: {
    state: 'inconclusive',
    title: 'Cause not confirmed',
    at: '2026-10-19T08:46:00-07:00',
    by: RESOLVER,
    checked: [
      'Similar tickets, recent changes, the device record and crash reports. Three possible causes, none confirmed, and there are no crash reports to separate them.'
    ],
    evidence: [
      ['A macOS update rolled out last Tuesday in ', { label: 'CHG-2191', to: { type: 'change', id: 'CHG-2191' } }, ', and the restarts began soon after. Other updated Macs are fine.'],
      ['Marcus uses a dock for calls. Its firmware is older than the current release. ', { label: '2 similar tickets', to: { type: 'related-tickets' } }, ' involved docks, but neither was confirmed.'],
      ['Battery health on ', { label: 'ASSET-3342', to: { type: 'asset', id: 'ASSET-3342' } }, ' is 78%, which is low but not enough on its own to cause restarts.']
    ],
    confidence: { score: 0.42, threshold: 0.75, band: 'low' },
    reasoning:
      'Each suspect fits part of the picture, none fits all of it, and there are no crash reports on the device to confirm or rule any of them out. Confidence is below the 0.75 bar for suggesting a fix.',
    fix: { title: 'No fix suggested', status: 'none' }
  },
  description: {
    brief: 'Marcus’s MacBook keeps restarting in the middle of video calls. He takes his calls on a dock.',
    origin: 'From Marcus’s first Slack message',
    body: [
      'My MacBook has been restarting by itself in the middle of video calls, a few times a week. It happened twice yesterday with customers on the line.'
    ],
    attachments: [{ name: 'about-this-mac.png', sizeLabel: '96 KB' }]
  },
  stream: [
    {
      kind: 'group',
      id: 'i-run',
      level: 'run',
      actor: RESOLVER,
      title: 'Ticket Resolver worked on this before you',
      start: '2026-10-19T08:20:00-07:00',
      end: '2026-10-19T08:55:00-07:00',
      meta: '9 messages with Marcus in Slack · 12 actions',
      outcomes: [
        { label: 'Deflection · didn’t resolve', tone: 'neutral' },
        { label: 'Triage · 5 fields set', tone: 'neutral' },
        { label: 'Root cause · Inconclusive', tone: 'warning' },
        { label: 'Resolution · no fix to run', tone: 'neutral' }
      ],
      defaultOpen: false,
      children: [
        {
          kind: 'group',
          id: 'i-before',
          level: 'phase',
          actor: RESOLVER,
          title: 'Before the ticket',
          start: '2026-10-19T08:20:00-07:00',
          end: '2026-10-19T08:25:00-07:00',
          meta: 'Slack conversation · 5 messages',
          outcomes: [{ label: 'Deflection didn’t resolve', tone: 'neutral' }],
          defaultOpen: false,
          children: [
            {
              kind: 'message',
              id: 'i1',
              at: '2026-10-19T08:20:00-07:00',
              variant: 'requester-reply',
              channel: 'slack',
              actor: MARCUS,
              body: [
                'My MacBook has been restarting by itself in the middle of video calls, a few times a week. It happened twice yesterday with customers on the line.'
              ],
              attachments: [{ name: 'about-this-mac.png', sizeLabel: '96 KB' }]
            },
            {
              kind: 'message',
              id: 'i2',
              at: '2026-10-19T08:20:30-07:00',
              variant: 'concierge-message',
              channel: 'slack',
              via: 'workplace-concierge',
              actor: CONCIERGE,
              body: ['Thanks, Marcus. Quick check so I get this to the right place: does it only restart during video calls, or at other times too?']
            },
            {
              kind: 'message',
              id: 'i3',
              at: '2026-10-19T08:21:10-07:00',
              variant: 'requester-reply',
              channel: 'slack',
              actor: MARCUS,
              body: ['Only on calls, as far as I can tell. Zoom and Teams both.']
            },
            {
              kind: 'event',
              id: 'i-deleg',
              intent: 'The restarts only happen on video calls. I should route this to Ticket Resolver and check the guidance for a safe first fix.',
              intentGroup: 'initial-triage',
              at: '2026-10-19T08:21:25-07:00',
              type: 'delegated',
              actor: CONCIERGE,
              data: { target: RESOLVER }
            },
            {
              kind: 'event',
              id: 'i-kb',
              intentGroup: 'initial-triage',
              intent: 'First, I should check the guidance for a safe fix Marcus can try himself.',
              at: '2026-10-19T08:22:00-07:00',
              type: 'searched',
              actor: RESOLVER,
              data: {
                count: 1,
                entity: 'knowledge article',
                results: [
                  {
                    link: { label: 'MacBook restarts unexpectedly', to: { type: 'article', id: 'KB-131' } },
                    meta: 'Knowledge base · Hardware'
                  }
                ]
              }
            },
            {
              kind: 'message',
              id: 'i4',
              at: '2026-10-19T08:22:30-07:00',
              variant: 'digit-message',
              channel: 'slack',
              via: 'workplace-concierge',
              actor: RESOLVER,
              body: [
                'Let’s try the basics first: install any pending macOS updates and restart once. ',
                { label: 'MacBook restarts unexpectedly', to: { type: 'article', id: 'KB-131' } }
              ]
            },
            {
              kind: 'message',
              id: 'i5',
              at: '2026-10-19T08:25:00-07:00',
              variant: 'requester-reply',
              channel: 'slack',
              actor: MARCUS,
              body: ['Updated and restarted. It happened again an hour later, mid-call.']
            }
          ]
        },
        {
          kind: 'event',
          id: 'i-created',
          intent: 'The first fix did not work and the restarts keep happening. I should create an incident and classify it so we can track the investigation.',
          intentGroup: 'incident-setup',
          at: '2026-10-19T08:25:20-07:00',
          type: 'ticket-created',
          actor: RESOLVER,
          data: {
            target: MARCUS,
            details: [
              { label: 'Tried first', value: [{ label: 'MacBook restarts unexpectedly', to: { type: 'article', id: 'KB-131' } }, ' (2 steps)'] },
              { label: 'Source', value: ['Slack'] }
            ]
          }
        },
        {
          kind: 'group',
          id: 'i-triage',
          level: 'phase',
          actor: RESOLVER,
          title: 'Triage',
          start: '2026-10-19T08:25:20-07:00',
          end: '2026-10-19T08:26:00-07:00',
          meta: '5 fields set · summary added · told Marcus the ticket number',
          outcomes: [{ label: '5 fields set', tone: 'neutral' }],
          defaultOpen: false,
          children: [
            {
              kind: 'event',
              id: 'i-props',
              intentGroup: 'incident-setup',
              intent: 'I should classify the incident from Marcus’s report and the result of the first fix.',
              at: '2026-10-19T08:25:40-07:00',
              type: 'properties-updated',
              actor: RESOLVER,
              data: {
                count: 5,
                fields: [
                  { field: 'Status', from: 'Open', to: 'In progress' },
                  { field: 'Category', from: 'None', to: 'Hardware' },
                  { field: 'Sub-category', from: 'None', to: 'Laptop' },
                  { field: 'Urgency', from: 'Low', to: 'Medium' },
                  { field: 'Priority', from: 'Low', to: 'Medium' }
                ]
              },
              why: 'Installing updates and restarting didn’t stop it, so it isn’t a pending-update problem. It affects one device and the work still gets done between restarts, so Medium urgency. Classifying as Hardware › Laptop.'
            },
            { kind: 'event', id: 'i-sum-work', at: '2026-10-19T08:25:48-07:00', type: 'digit-event', actor: RESOLVER, data: { verb: 'summarised the conversation so far' }, intent: 'I should write a short summary of what has been said so far, so whoever picks this up doesn’t have to read the whole conversation.' },
            { kind: 'event', id: 'i-sum', at: '2026-10-19T08:25:55-07:00', type: 'summary-updated', actor: RESOLVER, data: {} }
          ]
        },
        {
          kind: 'group',
          id: 'i-rca',
          level: 'phase',
          actor: RESOLVER,
          title: 'Root cause',
          start: '2026-10-19T08:27:00-07:00',
          end: '2026-10-19T08:46:00-07:00',
          meta: '4 searches',
          outcomes: [{ label: 'Inconclusive · 0.42', tone: 'warning' }],
          defaultOpen: false,
          children: [
            {
              kind: 'event',
              id: 'i-s1',
              intent: 'I should compare similar tickets, recent changes and Marcus’s device record to look for a pattern.',
              intentGroup: 'investigation',
              at: '2026-10-19T08:27:00-07:00',
              type: 'searched',
              actor: RESOLVER,
              data: {
                count: 2,
                entity: 'similar tickets',
                results: [
                  { link: { label: 'INC-4051', to: { type: 'ticket', id: 'INC-4051' } }, meta: 'MacBook freezes, then restarts · Resolved, cause not recorded' },
                  { link: { label: 'INC-4088', to: { type: 'ticket', id: 'INC-4088' } }, meta: 'MacBook restarts when docked · Resolved, dock replaced' }
                ]
              }
            },
            {
              kind: 'event',
              id: 'i-s2',
              intentGroup: 'investigation',
              intent: 'A recent update could explain the timing. I should check what changed on Marcus’s Mac.',
              at: '2026-10-19T08:31:00-07:00',
              type: 'searched',
              actor: RESOLVER,
              data: { count: 1, entity: 'recent change', object: [{ label: 'CHG-2191', to: { type: 'change', id: 'CHG-2191' } }] }
            },
            {
              kind: 'event',
              id: 'i-s3',
              intentGroup: 'investigation',
              intent: 'I should inspect Marcus’s device record for battery, dock and firmware details.',
              at: '2026-10-19T08:36:00-07:00',
              type: 'searched',
              actor: RESOLVER,
              data: {
                verb: 'looked up Marcus’s device in the work graph',
                object: [{ label: 'ASSET-3342', to: { type: 'asset', id: 'ASSET-3342' } }]
              }
            },
            {
              kind: 'event',
              id: 'i-s4',
              intentGroup: 'investigation',
              intent: 'A restart should leave a crash report. I should look for one to tell the suspects apart.',
              at: '2026-10-19T08:41:00-07:00',
              type: 'digit-event',
              actor: RESOLVER,
              data: { verb: 'looked for crash reports from', object: [{ label: 'ASSET-3342', to: { type: 'asset', id: 'ASSET-3342' } }] },
              workOutcome: 'No crash reports are available from the device, so none of the three suspects can be confirmed or ruled out.'
            },
            { kind: 'event', id: 'i-rc-think', at: '2026-10-19T08:45:30-07:00', type: 'thought', actor: RESOLVER, data: { seconds: 20 }, intent: 'Three weak suspects: the macOS update, the dock’s older firmware and 78% battery health. None fits everything and there are no crash reports to separate them, so I’ll score my confidence before deciding whether to suggest a fix.' },
            {
              kind: 'event',
              id: 'i-rc',
              at: '2026-10-19T08:46:00-07:00',
              type: 'root-cause-added',
              actor: RESOLVER,
              data: {},
              why: 'Three weak suspects: the macOS update, the dock’s older firmware and 78% battery health. Each fits part of the picture and none is confirmed. With no crash reports there is nothing to separate them, so confidence is 0.42, below the 0.75 bar for suggesting a fix.'
            }
          ]
        },
        {
          kind: 'group',
          id: 'i-res',
          level: 'phase',
          actor: RESOLVER,
          title: 'Resolution',
          start: '2026-10-19T08:47:00-07:00',
          end: '2026-10-19T08:55:00-07:00',
          meta: 'No workflow fits an unconfirmed cause',
          outcomes: [{ label: 'No fix to run', tone: 'neutral' }],
          defaultOpen: false,
          children: [
            {
              kind: 'event',
              id: 'i-sw',
              intent: 'Without a confirmed cause I shouldn’t change settings on Marcus’s laptop. I should check whether any workflow fits.',
              intentGroup: 'fix-planning',
              workOutcome: 'No workflow fits an unconfirmed cause. A person needs to collect crash logs after the next restart before anything is changed.',
              at: '2026-10-19T08:48:00-07:00',
              type: 'searched',
              actor: RESOLVER,
              data: { count: 0, entity: 'workflows' },
              why: 'Updating the dock firmware, rolling back macOS or replacing the battery would each be a guess, and each carries its own cost. Better to gather the evidence first.'
            }
          ]
        }
      ]
    },
    {
      kind: 'message',
      id: 'i9',
      at: '2026-10-19T08:25:10-07:00',
      variant: 'digit-message',
      channel: 'slack',
      via: 'workplace-concierge',
      actor: CONCIERGE,
      body: [
        'Marcus, I’ve created a ticket for this. It will be passed to a person on the Hardware team with everything we’ve checked, so you won’t need to repeat anything.'
      ]
    },
    {
      kind: 'event',
      id: 'i-ho',
      intentGroup: 'fix-planning',
      at: '2026-10-19T08:55:40-07:00',
      type: 'handed-over',
      actor: RESOLVER,
      data: {
        target: JORDAN,
        reason: 'inconclusive',
        method: 'manual',
        routing: 'Intelligent routing → Hardware',
        details: [
          { label: 'Blocker', value: ['Cause not confirmed: three weak suspects, no crash reports'] },
          { label: 'Diagnosis', value: ['macOS update, older dock firmware or battery health (78%); none confirmed'] },
          { label: 'Tried', value: ['KB steps; similar tickets, recent changes, device record and crash reports'] },
          { label: 'Next step', value: ['Collect crash logs from the MacBook after the next restart'] },
          { label: 'Routed by', value: ['Intelligent routing → Hardware'] }
        ]
      }
    }
  ]
};

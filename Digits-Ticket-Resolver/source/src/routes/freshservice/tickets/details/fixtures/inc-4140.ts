import type { Actor, TicketDetailsTab } from '../types';

/**
 * Path: Blocked at Resolution. A Slack incident Ticket Resolver worked through
 * to a known cause and a ready fix, then could not apply: a quarter-end change
 * freeze means the firewall rule needs an emergency change a person must
 * approve. Handed to the Network Team as Blocked.
 *
 * Invented for the prototype. Wall-clock times sit inside the same morning
 * window as INC-4127 so `refreshIncidentDates` maps them the same way; no
 * clock times are written into prose for the same reason.
 */

const RESOLVER: Actor = { kind: 'digit', digit: 'ticket-resolver', name: 'Ticket Resolver' };
const CONCIERGE: Actor = { kind: 'digit', digit: 'workplace-concierge', name: 'Workplace Concierge' };
const ELENA: Actor = { kind: 'requester', id: 'u-elena', name: 'Elena Torres', title: 'Finance Analyst · San Mateo HQ' };
const JORDAN: Actor = { kind: 'agent', id: 'a-jordan', name: 'Jordan Reyes' };

export const INC_4140: TicketDetailsTab = {
  ticket: {
    id: 'INC-4140',
    type: 'incident',
    subject: 'Can’t open the expense app from the office network [BR2]',
    source: 'slack',
    requester: ELENA,
    assignee: JORDAN,
    createdBy: RESOLVER
  },
  viewer: { agent: JORDAN },
  summary: {
    state: 'ready',
    title: 'Elena can’t reach the expense app from the office',
    updatedAt: '2026-10-19T09:39:00-07:00',
    updatedBy: RESOLVER,
    reason: 'handover',
    issue: [
      'Elena’s browser times out on the expense app from the San Mateo office network since this morning. It loads on her phone’s hotspot, and a teammate next to her sees the same thing. She needs to submit quarter-end expenses today.'
    ],
    tried: [
      ['Knowledge-base steps (restart the browser, flush DNS): didn’t help.'],
      ['Ticket Resolver found the cause and tried the allow-list workflow. The firewall rule step was blocked by the quarter-end change freeze.']
    ],
    standing: [
      'Handed over to the Network Team. The rule needs an emergency change approved by a person, and Elena has a submission deadline today.'
    ],
    strip: 'KB steps didn’t help. Ticket Resolver found the cause; the fix is blocked by the quarter-end change freeze.',
    basedOn: { messages: 9, actions: 11 }
  },
  rootCause: {
    state: 'found',
    title: 'Expense app moved; the office outbound range isn’t allow-listed',
    at: '2026-10-19T09:15:00-07:00',
    by: RESOLVER,
    cause: [
      'The expense app moved to a new address range in ',
      { label: 'CHG-2203', to: { type: 'change', id: 'CHG-2203' } },
      ', and the office’s outbound range isn’t on the new allow-list, so the firewall drops the connection.'
    ],
    evidence: [
      [{ label: '3 similar tickets', to: { type: 'related-tickets' } }, ' this morning, all from the San Mateo office network. None from remote staff.'],
      [{ label: 'CHG-2203', to: { type: 'change', id: 'CHG-2203' } }, ' · firewall change moved the expense app to a new range.'],
      ['Elena and a teammate both load the app on a hotspot but not from the office.']
    ],
    confidence: { score: 0.81, threshold: 0.75, band: 'high' },
    reasoning:
      'All 3 similar tickets are on the office network and began after CHG-2203 moved the expense app. Remote staff are unaffected and a hotspot works, which points at the office’s outbound range rather than the app itself.',
    fix: {
      title: 'Add the office outbound range to the expense app’s allow-list',
      via: { kind: 'workflow', name: 'Add allow-list rule (firewall)' },
      status: 'blocked',
      steps: [
        { label: 'Checked the rule against the firewall policy', status: 'done' },
        { label: 'Create the allow-list rule on the firewall', status: 'failed', detail: 'blocked by quarter-end change freeze' },
        { label: 'Confirm the app loads from the office network', status: 'skipped', detail: 'not run' }
      ],
      nextStep: [
        'Raise an emergency change to add the office outbound range to the expense app’s allow-list, get it approved, then ask Elena to retry. Related: ',
        { label: 'CHG-2203', to: { type: 'change', id: 'CHG-2203' } },
        '.'
      ],
      recommended: [
        ['Raise an emergency change to add the office outbound range to the expense app’s allow-list. Related: ', { label: 'CHG-2203', to: { type: 'change', id: 'CHG-2203' } }, '.'],
        ['Get the change approved.'],
        ['Ask Elena to retry the expense app from the office network.']
      ],
      eventId: 'f-wf'
    }
  },
  description: {
    brief: 'Elena can’t open the expense app from the San Mateo office network, though it works on her phone’s hotspot. Finance submissions close today.',
    origin: 'From Elena’s first Slack message',
    body: [
      'Hi, since this morning I can’t open the expense app from the office network. The page just times out. It works on my phone’s hotspot. I need to submit quarter-end expenses today.'
    ],
    attachments: [{ name: 'expense-timeout.png', sizeLabel: '142 KB' }]
  },
  stream: [
    {
      kind: 'group',
      id: 'f-run',
      level: 'run',
      actor: RESOLVER,
      title: 'Ticket Resolver worked on this before you',
      start: '2026-10-19T09:05:00-07:00',
      end: '2026-10-19T09:39:00-07:00',
      meta: '9 messages with Elena in Slack · 11 actions',
      outcomes: [
        { label: 'Deflection · didn’t resolve', tone: 'neutral' },
        { label: 'Triage · 5 fields set', tone: 'neutral' },
        { label: 'Root cause · High', tone: 'success' },
        { label: 'Resolution · blocked by change freeze', tone: 'warning' }
      ],
      defaultOpen: false,
      children: [
        {
          kind: 'group',
          id: 'f-before',
          level: 'phase',
          actor: RESOLVER,
          title: 'Before the ticket',
          start: '2026-10-19T09:05:00-07:00',
          end: '2026-10-19T09:09:00-07:00',
          meta: 'Slack conversation · 5 messages',
          outcomes: [{ label: 'Deflection didn’t resolve', tone: 'neutral' }],
          defaultOpen: false,
          children: [
            {
              kind: 'message',
              id: 'f1',
              at: '2026-10-19T09:05:00-07:00',
              variant: 'requester-reply',
              channel: 'slack',
              actor: ELENA,
              body: [
                'Hi, since this morning I can’t open the expense app from the office network. The page just times out. It works on my phone’s hotspot. I need to submit quarter-end expenses today.'
              ],
              attachments: [{ name: 'expense-timeout.png', sizeLabel: '142 KB' }]
            },
            {
              kind: 'message',
              id: 'f2',
              at: '2026-10-19T09:05:30-07:00',
              variant: 'concierge-message',
              channel: 'slack',
              via: 'workplace-concierge',
              actor: CONCIERGE,
              body: ['Thanks, Elena. Quick check so I get this to the right place: is it only you, or is it failing for others on your team too?']
            },
            {
              kind: 'message',
              id: 'f3',
              at: '2026-10-19T09:06:10-07:00',
              variant: 'requester-reply',
              channel: 'slack',
              actor: ELENA,
              body: ['Me, and Priya next to me too. My hotspot is fine.']
            },
            {
              kind: 'event',
              id: 'f-deleg',
              intent: 'Elena and a teammate are both affected on the office network. I should route this to Ticket Resolver and check the guidance for a safe first fix.',
              intentGroup: 'initial-triage',
              at: '2026-10-19T09:06:25-07:00',
              type: 'delegated',
              actor: CONCIERGE,
              data: { target: RESOLVER }
            },
            {
              kind: 'event',
              id: 'f-kb',
              intentGroup: 'initial-triage',
              intent: 'First, I should check the guidance for a fix Elena can try herself.',
              at: '2026-10-19T09:07:00-07:00',
              type: 'searched',
              actor: RESOLVER,
              data: {
                count: 1,
                entity: 'knowledge article',
                results: [
                  {
                    link: { label: 'Can’t reach an internal app from the office network', to: { type: 'article', id: 'KB-204' } },
                    meta: 'Knowledge base · Network'
                  }
                ]
              }
            },
            {
              kind: 'message',
              id: 'f4',
              at: '2026-10-19T09:07:30-07:00',
              variant: 'digit-message',
              channel: 'slack',
              via: 'workplace-concierge',
              actor: RESOLVER,
              body: [
                'Let’s try a quick fix: restart your browser and flush your DNS cache, then reload the expense app. ',
                { label: 'Can’t reach an internal app from the office network', to: { type: 'article', id: 'KB-204' } }
              ]
            },
            {
              kind: 'message',
              id: 'f5',
              at: '2026-10-19T09:09:00-07:00',
              variant: 'requester-reply',
              channel: 'slack',
              actor: ELENA,
              body: ['Did both. Still timing out.'],
              attachments: [
                {
                  name: 'connection-test.txt',
                  sizeLabel: '1 KB',
                  snippet: 'curl: (28) Connection timed out after 10001 milliseconds\nhost: expenses.acmecorp.com'
                }
              ]
            }
          ]
        },
        {
          kind: 'event',
          id: 'f-created',
          intent: 'The first fix did not work and more than one person is affected. I should create an incident and classify it from Elena’s report.',
          intentGroup: 'incident-setup',
          at: '2026-10-19T09:09:20-07:00',
          type: 'ticket-created',
          actor: RESOLVER,
          data: {
            target: ELENA,
            details: [
              { label: 'Tried first', value: [{ label: 'Can’t reach an internal app from the office network', to: { type: 'article', id: 'KB-204' } }, ' (2 steps)'] },
              { label: 'Source', value: ['Slack'] }
            ]
          }
        },
        {
          kind: 'group',
          id: 'f-triage',
          level: 'phase',
          actor: RESOLVER,
          title: 'Triage',
          start: '2026-10-19T09:09:20-07:00',
          end: '2026-10-19T09:10:00-07:00',
          meta: '5 fields set · summary added · told Elena the ticket number',
          outcomes: [{ label: '5 fields set', tone: 'neutral' }],
          defaultOpen: false,
          children: [
            {
              kind: 'event',
              id: 'f-props',
              intentGroup: 'incident-setup',
              intent: 'I should classify the incident from Elena’s report. Several people are affected and it is quarter-end, so urgency is high.',
              at: '2026-10-19T09:09:40-07:00',
              type: 'properties-updated',
              actor: RESOLVER,
              data: {
                count: 5,
                fields: [
                  { field: 'Status', from: 'Open', to: 'In progress' },
                  { field: 'Category', from: 'None', to: 'Network' },
                  { field: 'Sub-category', from: 'None', to: 'Connectivity' },
                  { field: 'Urgency', from: 'Low', to: 'High' },
                  { field: 'Priority', from: 'Low', to: 'High' }
                ]
              },
              why: 'More than one person is affected and Elena has a same-day deadline for quarter-end expenses, so this is High urgency. The app works elsewhere, so it is a network-path issue: Network › Connectivity.'
            },
            { kind: 'event', id: 'f-sum-work', at: '2026-10-19T09:09:48-07:00', type: 'digit-event', actor: RESOLVER, data: { verb: 'summarised the conversation so far' }, intent: 'I should write a short summary of what has been said so far, so whoever picks this up doesn’t have to read the whole conversation.' },
            { kind: 'event', id: 'f-sum', at: '2026-10-19T09:09:55-07:00', type: 'summary-updated', actor: RESOLVER, data: {} }
          ]
        },
        {
          kind: 'group',
          id: 'f-rca',
          level: 'phase',
          actor: RESOLVER,
          title: 'Root cause',
          start: '2026-10-19T09:11:00-07:00',
          end: '2026-10-19T09:15:00-07:00',
          meta: '3 searches',
          outcomes: [{ label: 'High · 0.81', tone: 'success' }],
          defaultOpen: false,
          children: [
            {
              kind: 'event',
              id: 'f-s1',
              intent: 'I should compare similar tickets, recent changes and the office network setup to find what is blocking the expense app.',
              intentGroup: 'investigation',
              at: '2026-10-19T09:11:00-07:00',
              type: 'searched',
              actor: RESOLVER,
              data: {
                count: 3,
                entity: 'similar tickets',
                results: [
                  { link: { label: 'INC-4136', to: { type: 'ticket', id: 'INC-4136' } }, meta: 'Expense app times out from the office · Open' },
                  { link: { label: 'INC-4137', to: { type: 'ticket', id: 'INC-4137' } }, meta: 'Can’t submit a report from the office Wi-Fi · Open' },
                  { link: { label: 'INC-4139', to: { type: 'ticket', id: 'INC-4139' } }, meta: 'Finance portal unreachable on the 2nd floor · Open' }
                ]
              }
            },
            {
              kind: 'event',
              id: 'f-s2',
              intentGroup: 'investigation',
              intent: 'A recent change may explain the pattern. I should check what changed on the network path to the expense app.',
              at: '2026-10-19T09:12:00-07:00',
              type: 'searched',
              actor: RESOLVER,
              data: { count: 1, entity: 'recent change', object: [{ label: 'CHG-2203', to: { type: 'change', id: 'CHG-2203' } }] }
            },
            {
              kind: 'event',
              id: 'f-s3',
              intentGroup: 'investigation',
              intent: 'I should confirm which address range the office’s traffic leaves from.',
              at: '2026-10-19T09:13:00-07:00',
              type: 'searched',
              actor: RESOLVER,
              data: {
                verb: 'looked up the office’s outbound range in the work graph',
                object: [{ label: 'ASSET-FW-02', to: { type: 'asset', id: 'ASSET-FW-02' } }]
              }
            },
            { kind: 'event', id: 'f-rc-think', at: '2026-10-19T09:14:30-07:00', type: 'thought', actor: RESOLVER, data: { seconds: 12 }, intent: 'All 3 similar tickets are on the office network and began after CHG-2203 moved the expense app. Remote staff and a hotspot both work, so the office’s outbound range most likely isn’t allow-listed for the new address.' },
            {
              kind: 'event',
              id: 'f-rc',
              at: '2026-10-19T09:15:00-07:00',
              type: 'root-cause-added',
              actor: RESOLVER,
              data: {},
              why: 'All 3 similar tickets are on the office network and began after CHG-2203 moved the expense app. Remote staff are unaffected and a hotspot works, which points at the office’s outbound range not being allow-listed.'
            }
          ]
        },
        {
          kind: 'group',
          id: 'f-res',
          level: 'phase',
          actor: RESOLVER,
          title: 'Resolution',
          start: '2026-10-19T09:16:00-07:00',
          end: '2026-10-19T09:39:00-07:00',
          meta: 'Workflow found · change freeze blocked the rule',
          outcomes: [{ label: 'Blocked', tone: 'warning' }],
          defaultOpen: false,
          children: [
            {
              kind: 'event',
              id: 'f-sw',
              intent: 'The allow-list rule looks like the fix. I should find a workflow that adds it and check whether a change is allowed right now.',
              intentGroup: 'fix-planning',
              workOutcome: 'One workflow fits: “Add allow-list rule (firewall)”. It can apply the fix end to end.',
              at: '2026-10-19T09:17:00-07:00',
              type: 'searched',
              actor: RESOLVER,
              data: { count: 1, entity: 'workflows' },
              why: 'The “Add allow-list rule (firewall)” workflow fits the cause. Firewall changes have their own policy checks, so I will run those before applying the rule.'
            },
            {
              kind: 'event',
              id: 'f-freeze',
              intentGroup: 'fix-planning',
              intent: 'Firewall changes are policy-controlled. I should check the change calendar before running the workflow.',
              at: '2026-10-19T09:18:00-07:00',
              type: 'digit-event',
              actor: RESOLVER,
              data: { verb: 'checked the change calendar for', object: ['the quarter-end change freeze'] },
              workOutcome: 'Firewall changes are frozen until quarter-end close finishes. Only an emergency change, approved by a person, can go through.'
            },
            {
              kind: 'event',
              id: 'f-wf',
              intent: 'The rule can’t be added under the freeze. I should run the workflow’s checks and confirm exactly where it stops.',
              intentGroup: 'approved-workflow',
              workOutcome: 'The rule step was blocked by the change freeze. The fix needs a person to raise and approve an emergency change.',
              at: '2026-10-19T09:36:00-07:00',
              type: 'workflow-executed',
              actor: RESOLVER,
              data: {
                workflow: 'Add allow-list rule (firewall)',
                steps: [
                  { label: 'Checked the rule against the firewall policy', status: 'done' },
                  { label: 'Create the allow-list rule on the firewall', status: 'failed', detail: 'blocked by quarter-end change freeze' },
                  { label: 'Confirm the app loads from the office network', status: 'skipped', detail: 'not run' }
                ]
              },
              why: 'The workflow can’t create the rule while firewall changes are frozen, and I can’t raise an emergency change on my own. The cause is known but the fix can’t finish, so this is Blocked, not Inconclusive. Elena can’t reach the app until it is done, so it needs a person quickly.'
            }
          ]
        }
      ]
    },
    {
      kind: 'message',
      id: 'f9',
      at: '2026-10-19T09:09:10-07:00',
      variant: 'digit-message',
      channel: 'slack',
      via: 'workplace-concierge',
      actor: CONCIERGE,
      body: [
        'Elena, I’ve created a ticket for this. It will be passed to a person on the Network team with everything we’ve tried, so you won’t need to repeat anything.'
      ]
    },
    {
      kind: 'event',
      id: 'f-ho',
      intentGroup: 'approved-workflow',
      at: '2026-10-19T09:39:40-07:00',
      type: 'handed-over',
      actor: RESOLVER,
      data: {
        target: JORDAN,
        reason: 'blocked',
        method: 'load-balanced',
        routing: 'Intelligent routing → Network Team',
        details: [
          { label: 'Blocker', value: ['Quarter-end change freeze blocks the allow-list rule; needs an emergency change'] },
          { label: 'Diagnosis', value: ['Office outbound range not allow-listed after CHG-2203'] },
          { label: 'Tried', value: ['KB steps; “Add allow-list rule (firewall)” workflow'] },
          { label: 'Routed by', value: ['Intelligent routing → Network Team'] }
        ]
      }
    }
  ]
};

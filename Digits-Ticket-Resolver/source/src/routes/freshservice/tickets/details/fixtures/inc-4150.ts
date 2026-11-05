import type { Actor, RootCauseCard, SummaryCard, TicketDetailsTab } from '../types';

/**
 * INC-4150 · an incident created the traditional way: the employee emailed the
 * help desk. No Digit has touched it, so there are no AI worker events, and the
 * top card starts empty. Clicking it generates the summary on demand, from the
 * `INC_4150_SUMMARY` below.
 */

const ROHAN: Actor = { kind: 'requester', id: 'u-rohan', name: 'Rohan Mehta', title: 'Finance Analyst · Bengaluru' };
const JORDAN: Actor = { kind: 'agent', id: 'a-jordan', name: 'Jordan Reyes' };

export const INC_4150: TicketDetailsTab = {
  ticket: {
    id: 'INC-4150',
    type: 'incident',
    subject: 'Lost access to the Finance shared drive after team move',
    source: 'email',
    requester: ROHAN,
    assignee: JORDAN
  },
  viewer: { agent: JORDAN, lastSeenAt: '2026-10-19T08:20:00-07:00' },
  summary: { state: 'not-generated' },
  rootCause: { state: 'not-analyzed' },
  description: {
    body: [
      'Hi IT, I moved from Sales Ops to the Finance team on Monday, and since then I get “Access denied” when I open the Finance shared drive (\\\\fileshare\\finance). I still need it for the month-end close, which starts on Thursday.',
      'I’ve attached a screenshot of the error and the email from HR confirming my move. Could you please restore my access? Thanks, Rohan'
    ],
    attachments: [
      { name: 'access-denied.png', sizeLabel: '184 KB' },
      { name: 'hr-team-move-confirmation.pdf', sizeLabel: '92 KB' }
    ]
  },
  stream: [
    {
      kind: 'message',
      id: 'y1',
      at: '2026-10-19T08:30:00-07:00',
      variant: 'reply',
      channel: 'email',
      actor: JORDAN,
      to: ['rohan.mehta@acme.com'],
      body: [
        'Hi Rohan, thanks for the details. I can see your move to Finance in HR’s email. Could you confirm whether you can still open the Sales Ops folders, and which Windows or Mac device you’re on?'
      ]
    },
    {
      kind: 'message',
      id: 'y2',
      at: '2026-10-19T08:48:00-07:00',
      variant: 'requester-reply',
      channel: 'email',
      actor: ROHAN,
      body: ['Sales Ops folders are gone too, which is fine. I’m on my Windows laptop, signed in on the office network.']
    },
    {
      kind: 'message',
      id: 'y3',
      at: '2026-10-19T08:55:00-07:00',
      variant: 'private-note',
      channel: 'email',
      actor: JORDAN,
      body: ['His group membership still shows Sales Ops. Needs the Finance-Users group added, which Access Management owns.']
    }
  ]
};

/** What clicking the empty card generates. */
export const INC_4150_SUMMARY: SummaryCard = {
  state: 'ready',
  title: 'Rohan lost Finance shared-drive access after moving teams',
  reason: 'on-demand',
  updatedBy: { kind: 'copilot', name: 'Agent Concierge' },
  issue: [
    'Rohan moved from Sales Ops to Finance on Monday and now gets “Access denied” on the Finance shared drive. He needs it for the month-end close on Thursday.'
  ],
  tried: [
    ['Jordan asked which folders and device were affected; Rohan confirmed he is on his Windows laptop on the office network.'],
    ['Jordan found his group membership still lists Sales Ops and not Finance-Users.']
  ],
  standing: ['Waiting on Access Management to add Rohan to the Finance-Users group.'],
  strip: 'Rohan lost Finance drive access after a team move. Needs the Finance-Users group added.',
  basedOn: { messages: 4, actions: 0 }
};

/** What asking for a root cause generates. */
export const INC_4150_ROOT_CAUSE: RootCauseCard = {
  state: 'found',
  title: 'Group membership wasn’t updated when Rohan moved teams',
  reasoning:
    'His account still lists the Sales Ops groups and not Finance-Users, and HR’s email confirms the move. Both similar tickets after team moves were fixed by changing group membership.',
  cause: ['Rohan’s group membership wasn’t updated when he moved from Sales Ops to Finance, so he can’t open drives that only Finance-Users can.'],
  evidence: [
    ['His account still lists the Sales Ops groups. HR’s email confirms the move to Finance.'],
    [{ label: '2 similar tickets', to: { type: 'related-tickets' } }, ' after team moves, both fixed by changing group membership.']
  ],
  confidence: { score: 0.88, threshold: 0.75, band: 'high' },
  fix: {
    title: 'Add Rohan to Finance-Users and remove the Sales Ops groups',
    via: { kind: 'workflow', name: 'Update group membership (Okta)' },
    status: 'proposed',
    nextStep: ['Ask Access Management to add Rohan to Finance-Users and remove the Sales Ops groups, then ask Rohan to sign out and back in.'],
    recommended: [
      ['Ask Access Management to add Rohan to the Finance-Users group.'],
      ['Ask them to remove the Sales Ops groups.'],
      ['Ask Rohan to sign out and back in, and confirm the Finance shared drive opens.']
    ]
  }
};

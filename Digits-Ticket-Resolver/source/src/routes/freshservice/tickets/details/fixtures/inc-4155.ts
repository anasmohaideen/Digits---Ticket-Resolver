import type { Actor, TicketDetailsTab } from '../types';
import { incidentTimestamp } from '../incidentDates.ts';
import type { ResolutionNote } from '../option2/scenarios';

/**
 * Path: Resolved by Ticket Resolver, with no human. A Slack incident the
 * Resolver triaged, diagnosed and fixed itself, then closed once the employee
 * confirmed. Nobody was assigned and nothing was handed over, so there is no
 * handover event and no assignee. Invented for the prototype.
 */

const RESOLVER: Actor = { kind: 'digit', digit: 'ticket-resolver', name: 'Ticket Resolver' };
const CONCIERGE: Actor = { kind: 'digit', digit: 'workplace-concierge', name: 'Workplace Concierge' };
const TARIQ: Actor = { kind: 'requester', id: 'u-tariq', name: 'Tariq Hassan', title: 'Sales Operations Analyst · Austin' };
const JORDAN: Actor = { kind: 'agent', id: 'a-jordan', name: 'Jordan Reyes' };

export const INC_4155: TicketDetailsTab = {
  ticket: {
    id: 'INC-4155',
    type: 'incident',
    subject: 'Locked out of Salesforce after a password change',
    source: 'slack',
    requester: TARIQ,
    createdBy: RESOLVER
  },
  viewer: { agent: JORDAN },
  summary: {
    state: 'ready',
    title: 'Tariq’s account locked after failed sign-ins; unlocked',
    updatedAt: '2026-10-19T09:10:00-07:00',
    updatedBy: RESOLVER,
    reason: 'triage',
    issue: [
      'Tariq can’t sign in to Salesforce. He changed his password this morning and has been refused ever since.'
    ],
    tried: [
      ['Knowledge-base steps (clear the browser’s saved password, retry): didn’t help.'],
      ['Ticket Resolver found his single sign-on account locked after five failed attempts, ran the “Unlock Account & Send Reset Link” workflow, which unlocked it and sent him a password reset link.']
    ],
    standing: ['Fixed. Tariq confirmed he can sign in, and the ticket is resolved.'],
    strip: 'Account locked after failed sign-ins. Ticket Resolver unlocked it; Tariq confirmed.',
    basedOn: { messages: 8, actions: 9 }
  },
  rootCause: {
    state: 'found',
    title: 'Saved old password kept retrying and locked the account',
    at: '2026-10-19T09:15:00-07:00',
    by: RESOLVER,
    cause: [
      'Tariq’s browser kept retrying his old saved password after he changed it, which locked his single sign-on account after five failed attempts.'
    ],
    evidence: [
      ['Okta shows five failed sign-ins from his laptop in the last ten minutes, all with the old password.'],
      [{ label: '2 similar tickets', to: { type: 'related-tickets' } }, ' this month, both fixed by unlocking the account.']
    ],
    confidence: { score: 0.93, threshold: 0.75, band: 'high' },
    reasoning:
      'The sign-in log shows repeated failures from one device with the old password, and the account is locked. Both similar tickets were solved by unlocking and clearing the saved password.',
    fix: {
      title: 'Run the “Unlock Account & Send Reset Link” workflow, which unlocks the account and sends a password reset link',
      via: { kind: 'workflow', name: 'Unlock Account & Send Reset Link' },
      status: 'applied',
      steps: [
        { label: 'Checked the account’s lock status', status: 'done' },
        { label: 'Unlocked the account in Okta', status: 'done' },
        { label: 'Sent Tariq a fresh password reset link', status: 'done' }
      ],
      recommended: [
        ['Check the account’s lock status.'],
        ['Unlock the account in Okta.'],
        ['Send Tariq a fresh password reset link.']
      ],
      verified: 'Tariq confirmed he can sign in to Salesforce.',
      eventId: 'g-wf'
    }
  },
  description: {
    brief: 'Tariq can’t sign in to Salesforce since changing his password this morning. It keeps refusing him, and he has a pipeline review at noon.',
    origin: 'From Tariq’s first Slack message',
    body: [
      'Hi, I changed my password this morning and now I can’t get into Salesforce. It just says my credentials are wrong. I have a pipeline review at noon.'
    ],
    attachments: [{ name: 'salesforce-login-error.png', sizeLabel: '118 KB' }]
  },
  stream: [
    {
      kind: 'group',
      id: 'g-run',
      level: 'run',
      actor: RESOLVER,
      title: 'Ticket Resolver worked on this',
      start: '2026-10-19T09:05:00-07:00',
      end: '2026-10-19T09:28:00-07:00',
      meta: '8 messages with Tariq in Slack · 9 actions',
      outcomes: [
        { label: 'Deflection · didn’t resolve', tone: 'neutral' },
        { label: 'Triage · 4 fields set', tone: 'neutral' },
        { label: 'Root cause · High', tone: 'success' },
        { label: 'Resolution · fixed', tone: 'success' }
      ],
      defaultOpen: false,
      children: [
        {
          kind: 'group',
          id: 'g-before',
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
              id: 'g1',
              at: '2026-10-19T09:05:00-07:00',
              variant: 'requester-reply',
              channel: 'slack',
              actor: TARIQ,
              body: [
                'Hi, I changed my password this morning and now I can’t get into Salesforce. It just says my credentials are wrong. I have a pipeline review at noon.'
              ],
              attachments: [{ name: 'salesforce-login-error.png', sizeLabel: '118 KB' }]
            },
            {
              kind: 'message',
              id: 'g2',
              at: '2026-10-19T09:05:30-07:00',
              variant: 'concierge-message',
              channel: 'slack',
              via: 'workplace-concierge',
              actor: CONCIERGE,
              body: ['Thanks, Tariq. Let me check the guidance for this. Did you sign in anywhere else with the new password, such as your phone?']
            },
            {
              kind: 'message',
              id: 'g3',
              at: '2026-10-19T09:06:10-07:00',
              variant: 'requester-reply',
              channel: 'slack',
              actor: TARIQ,
              body: ['Yes, I put it into the Salesforce app on my phone as well. That’s the only place.']
            },
            {
              kind: 'event',
              id: 'g-deleg',
              intent: 'Tariq changed his password and then failed to sign in. I should route this to Ticket Resolver and check the guidance for a safe first fix.',
              intentGroup: 'initial-triage',
              at: '2026-10-19T09:06:25-07:00',
              type: 'delegated',
              actor: CONCIERGE,
              data: { target: RESOLVER }
            },
            {
              kind: 'message',
              id: 'g4',
              at: '2026-10-19T09:07:30-07:00',
              variant: 'digit-message',
              channel: 'slack',
              via: 'workplace-concierge',
              actor: RESOLVER,
              body: ['Let’s try a quick fix: clear the saved password in your browser, then sign in again with the new one.']
            },
            {
              kind: 'message',
              id: 'g5',
              at: '2026-10-19T09:09:00-07:00',
              variant: 'requester-reply',
              channel: 'slack',
              actor: TARIQ,
              body: ['Did that. Still refused.']
            }
          ]
        },
        {
          kind: 'event',
          id: 'g-created',
          intent: 'The first fix did not work. I should create an incident and classify it from Tariq’s report.',
          intentGroup: 'incident-setup',
          at: '2026-10-19T09:09:20-07:00',
          type: 'ticket-created',
          actor: RESOLVER,
          data: {
            target: TARIQ,
            details: [
              { label: 'Tried first', value: ['Clearing the saved password'] },
              { label: 'Source', value: ['Slack'] }
            ]
          }
        },
        {
          kind: 'group',
          id: 'g-triage',
          level: 'phase',
          actor: RESOLVER,
          title: 'Triage',
          start: '2026-10-19T09:09:30-07:00',
          end: '2026-10-19T09:10:00-07:00',
          meta: '4 fields set · summary added',
          outcomes: [{ label: '4 fields set', tone: 'neutral' }],
          defaultOpen: false,
          children: [
            {
              kind: 'event',
              id: 'g-props',
              intentGroup: 'incident-setup',
              intent: 'I should classify the incident from Tariq’s report. One person is blocked from a system he needs by noon, so urgency is medium.',
              at: '2026-10-19T09:09:40-07:00',
              type: 'properties-updated',
              actor: RESOLVER,
              data: {
                count: 4,
                fields: [
                  { field: 'Status', from: 'Open', to: 'In progress' },
                  { field: 'Category', from: 'None', to: 'Access' },
                  { field: 'Sub-category', from: 'None', to: 'Sign-in' },
                  { field: 'Urgency', from: 'Low', to: 'Medium' }
                ]
              },
              why: 'One person is locked out of a system he needs before a noon meeting. It is a sign-in problem, so Access › Sign-in, with medium urgency.'
            },
            { kind: 'event', id: 'g-sum-work', at: '2026-10-19T09:09:48-07:00', type: 'digit-event', actor: RESOLVER, data: { verb: 'summarised the conversation so far' }, intent: 'I should write a short summary of what has been said so far.' },
            { kind: 'event', id: 'g-sum', at: '2026-10-19T09:09:55-07:00', type: 'summary-updated', actor: RESOLVER, data: {} }
          ]
        },
        {
          kind: 'group',
          id: 'g-rca',
          level: 'phase',
          actor: RESOLVER,
          title: 'Root cause',
          start: '2026-10-19T09:11:00-07:00',
          end: '2026-10-19T09:15:00-07:00',
          meta: '2 searches',
          outcomes: [{ label: 'High · 0.93', tone: 'success' }],
          defaultOpen: false,
          children: [
            {
              kind: 'event',
              id: 'g-s1',
              intent: 'I should look at Tariq’s sign-in history and compare similar tickets to see why the new password is refused.',
              intentGroup: 'investigation',
              at: '2026-10-19T09:11:00-07:00',
              type: 'searched',
              actor: RESOLVER,
              data: {
                count: 2,
                entity: 'similar tickets',
                results: [
                  { link: { label: 'INC-4091', to: { type: 'ticket', id: 'INC-4091' } }, meta: 'Locked out of Salesforce after a password reset · Resolved' },
                  { link: { label: 'INC-4112', to: { type: 'ticket', id: 'INC-4112' } }, meta: 'Okta account locked, can’t reach the CRM · Resolved' }
                ]
              }
            },
            {
              kind: 'event',
              id: 'g-s2',
              intentGroup: 'investigation',
              intent: 'I should check the account’s recent sign-in attempts in Okta.',
              at: '2026-10-19T09:12:30-07:00',
              type: 'searched',
              actor: RESOLVER,
              data: { verb: 'checked the recent sign-ins for', object: ['Tariq’s Okta account'] },
              workOutcome: 'Five failed sign-ins in ten minutes, all from his laptop with the old password. The account is locked.'
            },
            { kind: 'event', id: 'g-rc-think', at: '2026-10-19T09:14:30-07:00', type: 'thought', actor: RESOLVER, data: { seconds: 9 }, intent: 'The failures all use the old password from one device, so his browser is retrying it and has locked the account. Both similar tickets were fixed by unlocking it.' },
            {
              kind: 'event',
              id: 'g-rc',
              at: '2026-10-19T09:15:00-07:00',
              type: 'root-cause-added',
              actor: RESOLVER,
              data: {},
              why: 'Repeated failures with the old password from one device locked the account. Unlocking it fixed both similar tickets.'
            }
          ]
        },
        {
          kind: 'group',
          id: 'g-res',
          level: 'phase',
          actor: RESOLVER,
          title: 'Resolution',
          start: '2026-10-19T09:16:00-07:00',
          end: '2026-10-19T09:28:00-07:00',
          meta: 'Account unlocked · confirmed by Tariq',
          outcomes: [{ label: 'Fixed', tone: 'success' }],
          defaultOpen: false,
          children: [
            {
              kind: 'event',
              id: 'g-wf',
              intent: 'Unlocking the account is the fix. The “Unlock Account & Send Reset Link” workflow unlocks the account and sends a password reset link, and it is pre-approved for this, so I can run it.',
              intentGroup: 'fix-planning',
              workOutcome: 'Account unlocked and a reset link sent. No approval was needed.',
              at: '2026-10-19T09:18:00-07:00',
              type: 'workflow-executed',
              actor: RESOLVER,
              data: {
                workflow: 'Unlock Account & Send Reset Link',
                steps: [
                  { label: 'Checked the account’s lock status', status: 'done' },
                  { label: 'Unlocked the account in Okta', status: 'done' },
                  { label: 'Sent Tariq a fresh password reset link', status: 'done' }
                ]
              },
              why: 'This workflow is pre-approved for unlocks, so I could apply the fix without waiting for anyone.'
            },
            {
              kind: 'event',
              id: 'g-confirm',
              intentGroup: 'fix-planning',
              intent: 'Tariq says he can sign in. I should check the account before writing up the resolution.',
              at: '2026-10-19T09:27:00-07:00',
              type: 'digit-event',
              actor: RESOLVER,
              data: { verb: 'confirmed the fix with', object: ['Tariq’s reply'] }
            }
          ]
        }
      ]
    },
    {
      kind: 'message',
      id: 'g9',
      at: '2026-10-19T09:09:10-07:00',
      variant: 'digit-message',
      channel: 'slack',
      via: 'workplace-concierge',
      actor: CONCIERGE,
      body: ['Tariq, I’ve created a ticket for this. Ticket Resolver is looking into it now, so there’s nothing you need to do.']
    },
    {
      kind: 'message',
      id: 'g10',
      at: '2026-10-19T09:20:00-07:00',
      variant: 'digit-message',
      channel: 'slack',
      via: 'workplace-concierge',
      actor: RESOLVER,
      body: [
        'Tariq, your account was locked after five failed sign-ins from your old saved password. I’ve unlocked it and sent you a reset link. Please try Salesforce now, and clear the old password from your phone app so it doesn’t lock again.'
      ]
    },
    {
      kind: 'message',
      id: 'g11',
      at: '2026-10-19T09:26:00-07:00',
      variant: 'requester-reply',
      channel: 'slack',
      actor: TARIQ,
      body: ['I’m in! Thank you, that was fast.']
    },
    {
      kind: 'event',
      id: 'g-resolution',
      at: '2026-10-19T09:28:00-07:00',
      type: 'resolution-notes',
      actor: RESOLVER,
      data: {}
    }
  ]
};

/** The resolution note this ticket ends with, written by the Resolver itself. */
export const INC_4155_RESOLUTION: ResolutionNote = {
  at: incidentTimestamp('2026-10-19T09:28:00-07:00'),
  by: RESOLVER,
  brief: 'Account unlocked and reset link sent; Tariq is back in Salesforce',
  resolution: ['Tariq is back in Salesforce after Ticket Resolver unlocked his account and he signed in with his new password.'],
  cause: ['His phone app kept retrying his old saved password after he changed it, which locked his single sign-on account after five failed attempts.'],
  steps: [
    ['Found five failed sign-ins in Okta, all with the old password, and the account locked.'],
    ['Ticket Resolver ran the “Unlock Account & Send Reset Link” workflow, which unlocked his account and sent him a fresh password reset link.'],
    ['Tariq confirmed he can sign in to Salesforce.']
  ],
  prevention: ['Ask people to clear old saved passwords from their phone apps after a password change.']
};

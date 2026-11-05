/**
 * Dev data for the Details tab.
 *
 * The repo has no mock layer and no feature-flag mechanism, so the tab is
 * driven straight from these fixtures: a ticket renders Digit blocks only when
 * a fixture for its code carries them, and every other ticket renders nothing
 * new. That keeps the existing pages exactly as they were.
 */

import type { Ticket } from '../../tickets.data';
import type { TicketDetailsTab } from '../types';
import { INC_4127 } from './inc-4127';
import { INC_4133 } from './inc-4133';
import { INC_4140 } from './inc-4140';
import { INC_4142 } from './inc-4142';
import { INC_4150 } from './inc-4150';
import { INC_4155 } from './inc-4155';
import { INC_4160 } from './inc-4160';
import { SR_4128 } from './sr-4128';
import { refreshIncidentDates } from '../incidentDates';
import { withRichContent } from './richContent';

export { INC_4127, INC_4133, INC_4140, INC_4142, INC_4150, INC_4155, INC_4160, SR_4128 };

/** Keyed by the ticket's display code, independently of its numeric route ID. */
export const DETAILS_FIXTURES: Record<string, TicketDetailsTab> = {
  'INC-4127': withRichContent('INC-4127', refreshIncidentDates(INC_4127)),
  'INC-4133': withRichContent('INC-4133', refreshIncidentDates(INC_4133)),
  'INC-4140': withRichContent('INC-4140', refreshIncidentDates(INC_4140)),
  'INC-4142': withRichContent('INC-4142', refreshIncidentDates(INC_4142)),
  'INC-4150': withRichContent('INC-4150', refreshIncidentDates(INC_4150)),
  'INC-4155': withRichContent('INC-4155', refreshIncidentDates(INC_4155)),
  'INC-4160': INC_4160,
  'SR-4128': withRichContent('SR-4128', SR_4128)
};

export function findDetailsFixture(code: string | undefined): TicketDetailsTab | undefined {
  return code ? DETAILS_FIXTURES[code.toUpperCase()] : undefined;
}

/**
 * Standalone records for scenario tickets not yet present in the ticket list.
 * INC-4127 is a regular list ticket; INC-4133 remains a detail-only fixture.
 *
 * The fallback keeps the human-only regression fixture accessible without
 * adding a second scenario to the regular list.
 */
export const DETAILS_TICKETS: Record<string, Ticket> = {
  'INC-4150': {
    id: 'INC-4150',
    code: 'INC-4150',
    subject: 'Lost access to the Finance shared drive after team move',
    requester: 'Rohan Mehta',
    requesterTitle: 'Finance Analyst · Bengaluru',
    state: 'On track',
    status: 'Open',
    priority: 'Medium',
    assignee: 'Jordan Reyes',
    type: 'Incident',
    urgency: 'Medium',
    impact: 'Low',
    department: 'Finance',
    group: 'Access Management',
    source: 'Email',
    experienceScore: 'Good',
    experienceScoreValue: 72
  },
  'INC-4160': {
    id: 'INC-4160',
    code: 'INC-4160',
    subject: 'Nightly sync job fails with a certificate error (rich content cases)',
    requester: 'Priya Nair',
    requesterTitle: 'Data Engineer · Chennai',
    state: 'On track',
    status: 'Open',
    priority: 'Medium',
    assignee: 'Jordan Reyes',
    type: 'Incident',
    urgency: 'Medium',
    impact: 'Medium',
    department: 'IT',
    group: 'Service Desk',
    source: 'Email',
    experienceScore: 'Good',
    experienceScoreValue: 70
  },
  'INC-4155': {
    id: 'INC-4155',
    code: 'INC-4155',
    subject: 'Locked out of Salesforce after a password change',
    requester: 'Tariq Hassan',
    requesterTitle: 'Sales Operations Analyst · Austin',
    state: 'On track',
    status: 'Resolved',
    priority: 'Medium',
    assignee: 'Ticket Resolver',
    type: 'Incident',
    urgency: 'Medium',
    impact: 'Low',
    department: 'Sales',
    group: 'Service Desk',
    source: 'Slack',
    experienceScore: 'Good',
    experienceScoreValue: 80
  },
  'INC-4133': {
    id: 'INC-4133',
    code: 'INC-4133',
    subject: 'Outlook keeps asking for my password',
    requester: 'Daniel Ortiz',
    requesterTitle: 'Account Executive · Austin',
    state: 'On track',
    status: 'Open',
    priority: 'Low',
    assignee: 'None',
    type: 'Incident',
    urgency: 'Low',
    impact: 'Low',
    department: 'Sales',
    group: 'Service Desk',
    source: 'Email',
    experienceScore: 'Good',
    experienceScoreValue: 77
  }
};

export function findDetailsTicket(code: string | undefined): Ticket | undefined {
  return code ? DETAILS_TICKETS[code.toUpperCase()] : undefined;
}

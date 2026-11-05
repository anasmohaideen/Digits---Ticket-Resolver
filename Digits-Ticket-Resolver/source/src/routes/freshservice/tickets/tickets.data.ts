import type { TTagVariant } from '@freshworks/dew-components';
import meganBrooksAvatar from '../../../../Assets/Human Avatars/female-9.png';

/**
 * Sample ticket data for the Tickets prototype.
 *
 * Shapes and vocabulary follow a real Freshservice ticket list — INC- prefixed
 * ids, an SLA-derived State separate from the workflow Status, and a Priority
 * that carries its own colour. The values are invented; the field set is not.
 */

export const STATUSES = ['Open', 'Pending', 'Resolved', 'Closed'] as const;
export type Status = (typeof STATUSES)[number];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;
export type Priority = (typeof PRIORITIES)[number];

/** SLA state, not workflow state — a ticket can be Open and Overdue at once. */
export const STATES = ['Overdue', 'Due soon', 'On track'] as const;
export type State = (typeof STATES)[number];

export const AGENTS = ['None', 'Sarah Kim', 'Alex Patel', 'Lena Brauer', 'Tom Nguyen', 'Jordan Reyes', 'Ticket Resolver'] as const;
export type Agent = (typeof AGENTS)[number];

export const LEVELS = ['Low', 'Medium', 'High'] as const;
export type Level = (typeof LEVELS)[number];

export const TICKET_TYPES = ['Incident', 'Service Request', 'Major Incident'] as const;
export type TicketType = (typeof TICKET_TYPES)[number];

export const DEPARTMENTS = ['IT', 'Finance', 'Sales', 'Marketing', 'Operations'] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const GROUPS = ['Service Desk', 'Network Team', 'Hardware', 'Access Management'] as const;
export type Group = (typeof GROUPS)[number];

export const SOURCES = ['Portal', 'Email', 'Phone', 'Chat', 'Slack'] as const;
export type Source = (typeof SOURCES)[number];

export const EXPERIENCE_SCORES = ['Excellent', 'Good', 'Average', 'Poor'] as const;
export type ExperienceScore = (typeof EXPERIENCE_SCORES)[number];

/** The detail card's donut and tag take their colour from the band. */
export const EXPERIENCE_VARIANT: Record<ExperienceScore, TTagVariant> = {
  Excellent: 'green',
  Good: 'green',
  Average: 'yellow',
  Poor: 'red'
};

export const EXPERIENCE_COLOR: Record<ExperienceScore, string> = {
  Excellent: 'var(--color-icon-semantic-success)',
  Good: 'var(--color-icon-semantic-success)',
  Average: 'var(--color-icon-semantic-warning)',
  Poor: 'var(--color-icon-semantic-error)'
};

/** The three facets the card scores, each shown with a tick. */
export const EXPERIENCE_FACETS = ['Reliability', 'Quality', 'Effort'] as const;

export interface Ticket {
  /** Dew's Table requires `id` on every row. */
  id: string;
  code: string;
  subject: string;
  requester: string;
  requesterAvatarUrl?: string;
  requesterTitle?: string;
  state: State;
  status: Status;
  priority: Priority;
  assignee: Agent;
  /* Fields the real filter sidebar can facet on. Values invented; the field
     set is measured. */
  type: TicketType;
  urgency: Level;
  impact: Level;
  department: Department;
  group: Group;
  source: Source;
  experienceScore: ExperienceScore;
  /** The number the detail page's donut draws. */
  experienceScoreValue: number;
}

/** Priority → the Dew semantic colour it reads as in the product. */
export const PRIORITY_COLOR: Record<Priority, string> = {
  Low: 'var(--color-fill-semantic-success)',
  Medium: 'var(--color-fill-semantic-info)',
  High: 'var(--color-fill-semantic-warning)',
  Urgent: 'var(--color-fill-semantic-error)'
};

/** SLA state → Tag variant. Overdue is the only one that should alarm. */
export const STATE_VARIANT: Record<State, TTagVariant> = {
  Overdue: 'red',
  'Due soon': 'yellow',
  'On track': 'green'
};

export const TICKETS: Ticket[] = [
  { id: '1', code: 'INC-4127', subject: 'Can’t connect to Corp-Secure Wi-Fi [BR1]', requester: 'Megan Brooks', requesterAvatarUrl: meganBrooksAvatar, requesterTitle: 'Product Analyst · San Mateo HQ', state: 'Due soon', status: 'Open', priority: 'Medium', assignee: 'Jordan Reyes', type: 'Incident', urgency: 'High', impact: 'Medium', department: 'IT', group: 'Network Team', source: 'Slack', experienceScore: 'Average', experienceScoreValue: 62 },
  { id: '13', code: 'INC-4140', subject: 'Can’t open the expense app from the office network [BR2]', requester: 'Elena Torres', requesterTitle: 'Finance Analyst · San Mateo HQ', state: 'Due soon', status: 'Open', priority: 'High', assignee: 'Jordan Reyes', type: 'Incident', urgency: 'High', impact: 'Medium', department: 'Finance', group: 'Network Team', source: 'Slack', experienceScore: 'Poor', experienceScoreValue: 48 },
  { id: '14', code: 'INC-4142', subject: 'MacBook restarts during video calls [IR]', requester: 'Marcus Bell', requesterTitle: 'Account Executive · New York', state: 'On track', status: 'Open', priority: 'Medium', assignee: 'Jordan Reyes', type: 'Incident', urgency: 'Medium', impact: 'Low', department: 'Sales', group: 'Hardware', source: 'Slack', experienceScore: 'Average', experienceScoreValue: 60 },
  { id: '12', code: 'SR-4128', subject: 'Employee software and benefits request', requester: 'Megan Brooks', requesterAvatarUrl: meganBrooksAvatar, requesterTitle: 'Product Analyst · San Mateo HQ', state: 'On track', status: 'Open', priority: 'Medium', assignee: 'Jordan Reyes', type: 'Service Request', urgency: 'Medium', impact: 'Low', department: 'IT', group: 'Service Desk', source: 'Slack', experienceScore: 'Good', experienceScoreValue: 82 }
];

/** Initials for requesters without an image, e.g. "Megan Brooks" → "MB". */
export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * The full column set offered by the real ticket list's "Customize columns"
 * panel — 31 fields, of which six are on by default. Captured from the live
 * product rather than invented, because which fields exist (and which are
 * default) is exactly the sort of thing a prototype gets wrong.
 */
export const DEFAULT_COLUMNS = ['subject', 'requester', 'status', 'priority', 'assignee'] as const;

/**
 * Subject and Requester cannot be switched off — their checkboxes come back
 * `disabled` in the live customizer. Every other column, including the four
 * other defaults, is optional.
 */
export const MANDATORY_COLUMNS = ['subject', 'requester'] as const;

export const COLUMN_FIELDS: { id: string; label: string }[] = [
  { id: 'subject', label: 'Subject' },
  { id: 'requester', label: 'Requester' },
  { id: 'state', label: 'State' },
  { id: 'status', label: 'Status' },
  { id: 'priority', label: 'Priority' },
  { id: 'assignee', label: 'Assigned to' },
  { id: 'statusDetails', label: 'Status details' },
  { id: 'department', label: 'Department' },
  { id: 'source', label: 'Source' },
  { id: 'createdDate', label: 'Created Date' },
  { id: 'lastModified', label: 'Last Modified Date' },
  { id: 'dueDate', label: 'Due date' },
  { id: 'closedDate', label: 'Closed Date' },
  { id: 'approvalStatus', label: 'Approval Status' },
  { id: 'plannedStart', label: 'Planned Start Date' },
  { id: 'plannedEnd', label: 'Planned End Date' },
  { id: 'plannedEffort', label: 'Planned Effort' },
  { id: 'associationType', label: 'Association type' },
  { id: 'requesterLocation', label: 'Requester Location' },
  { id: 'requesterVip', label: 'Requester VIP' },
  { id: 'resolvedDate', label: 'Resolved Date' },
  { id: 'skillset', label: 'Skillset' },
  { id: 'experienceScore', label: 'Experience score' },
  { id: 'impact', label: 'Impact' },
  { id: 'urgency', label: 'Urgency' },
  { id: 'category', label: 'Category' },
  { id: 'subCategory', label: 'Sub-Category' },
  { id: 'item', label: 'Item' },
  { id: 'majorIncidentType', label: 'Major incident type' },
  { id: 'impactedLocations', label: 'Impacted locations' },
  { id: 'customersImpacted', label: 'No. of customers impacted' }
];

/**
 * Fields the Export sheet offers — all 46, in the product's own order, which
 * runs DOWN the first column and then down the second (measured: two columns
 * at x=1345 and x=1607, 45px row pitch), not left-to-right across rows.
 */
export const EXPORT_FIELDS: string[] = [
  'Subject', 'Type', 'Source', 'Status', 'Urgency', 'Impact',
  'Priority', 'Group', 'Agent', 'Department', 'Description', 'Category',
  'Sub-Category', 'Item', 'Planned Start Date', 'Planned End Date', 'Planned Effort',
  'Resolution Note', 'Skillset', 'Experience Score', 'Association type',
  'Requester Location', 'Requester VIP', 'Ticket Id', 'Requester Name',
  'Requester Email', 'Created Time', 'Due by Time', 'Resolved Time', 'Closed Time',
  'Last Updated Time', 'Initial Response Time', 'Time Tracked',
  'First Response Time (in Hrs)', 'Resolution Time (in Hrs)', 'Agent interactions',
  'Customer interactions', 'Resolution Status', 'First Response Status', 'Tags',
  'Survey Result', 'Approval Status', 'Business impact', 'Major incident type',
  'Impacted locations', 'No. of customers impacted'
];

/**
 * The export sheet's "Filter tickets by" row: a date field, then a period.
 * Both are dropdowns, sitting side by side under "Export as".
 */
export const EXPORT_FILTER_FIELDS = ['Created time', 'Resolved time', 'Closed time'] as const;
export const EXPORT_FILTER_PERIODS = ['Last 30 Days', 'Last 7 Days', 'From yesterday', 'Set date'] as const;

/** The eight checked when the sheet opens. Note Ticket Id, not Type. */
export const EXPORT_DEFAULTS = new Set([
  'Subject', 'Status', 'Priority', 'Group', 'Agent', 'Ticket Id',
  'Requester Name', 'Requester Email'
]);

/**
 * Fields the real Sort by menu offers, in its order. Note it is a subset of
 * the column list — Assigned to and State are columns you cannot sort by, and
 * Department and Source are sortable without being default columns.
 */
export const SORT_FIELDS = [
  'Subject', 'Requester', 'Status', 'Priority', 'Department', 'Source',
  'Created Date', 'Last Modified Date', 'Due date', 'Closed Date',
  'Planned Start Date', 'Planned End Date', 'Association type',
  'Requester Location', 'Requester VIP', 'Resolved Date', 'Experience score',
  'Impact', 'Urgency', 'Category', 'Sub-Category', 'Item', 'Major incident type'
] as const;

/** Which of those map onto a field this prototype actually holds. */
export const SORTABLE_KEYS: Partial<Record<string, keyof Ticket>> = {
  Subject: 'subject',
  Requester: 'requester',
  Status: 'status',
  Priority: 'priority'
};

/* ------------------------------------------------------------------ */
/* Filter sidebar                                                      */
/* ------------------------------------------------------------------ */

/**
 * The real Basic filter is not a short list of checkbox facets — it is
 * twenty groups in a fixed order, mixing four control kinds. Measured from
 * the live sidebar (`.fieldset-wrapper`), where each group's class names the
 * kind it uses: `checkbox-group`, `select-field`, `autocomplete-field`,
 * `dependent-select-dropdown-field`.
 *
 * Two things worth stating, because both are easy to get backwards:
 *
 *   - There is NO State facet. State is a column only. Filtering on SLA is
 *     done through "Due by", which is why that group exists and State does
 *     not.
 *   - Most groups are EMPTY on a real account — Requesters, Departments,
 *     Groups, Source, Tags and Category all render as selects with nothing
 *     chosen. Rendering them empty is faithful, not unfinished.
 */
export type FacetKind = 'checkbox' | 'select' | 'autocomplete' | 'period';

export interface Facet {
  id: string;
  label: string;
  kind: FacetKind;
  /** Options for a checkbox group, or the choices a select offers. */
  options?: readonly string[];
  /** The ticket field this facet filters, when the prototype holds one. */
  field?: keyof Ticket;
}

export const FILTER_FACETS: Facet[] = [
  { id: 'agents', label: 'Agents', kind: 'select', options: AGENTS, field: 'assignee' },
  { id: 'created', label: 'Created', kind: 'period' },
  { id: 'status', label: 'Status', kind: 'select', options: STATUSES, field: 'status' },
  { id: 'requesters', label: 'Requesters', kind: 'autocomplete' },
  { id: 'departments', label: 'Departments', kind: 'select', options: DEPARTMENTS, field: 'department' },
  { id: 'groups', label: 'Groups', kind: 'select', options: GROUPS, field: 'group' },
  { id: 'plannedStart', label: 'Planned Start Date', kind: 'period' },
  { id: 'plannedEnd', label: 'Planned End Date', kind: 'period' },
  { id: 'dueBy', label: 'Due by', kind: 'checkbox', options: ['Overdue', 'Due Today', 'Tomorrow', 'Next 8 Hours'] },
  { id: 'firstResponse', label: 'First response', kind: 'checkbox', options: ['Overdue', 'Due Today'] },
  { id: 'priority', label: 'Priority', kind: 'checkbox', options: PRIORITIES, field: 'priority' },
  { id: 'urgency', label: 'Urgency', kind: 'checkbox', options: LEVELS, field: 'urgency' },
  { id: 'impact', label: 'Impact', kind: 'checkbox', options: LEVELS, field: 'impact' },
  { id: 'type', label: 'Type', kind: 'checkbox', options: TICKET_TYPES, field: 'type' },
  { id: 'source', label: 'Source', kind: 'select', options: SOURCES, field: 'source' },
  { id: 'tags', label: 'Tags', kind: 'autocomplete' },
  { id: 'category', label: 'Category', kind: 'select' },
  {
    id: 'majorIncidentType',
    label: 'Major incident type',
    kind: 'checkbox',
    options: ['(empty)', 'Full outage', 'Partial outage', 'Performance degradation', 'Status page incident']
  },
  { id: 'experienceScore', label: 'Experience Score Level', kind: 'checkbox', options: EXPERIENCE_SCORES, field: 'experienceScore' }
];

/** The period options the date facets offer. */
export const PERIOD_PLACEHOLDER = 'Select a time period';

/** The saved view the list opens on. The shell's header names it too. */
export const TICKET_VIEW_NAME = 'New & My Open Tickets';

/**
 * The code the shell's breadcrumb shows on a ticket detail route. Exported as
 * a lookup rather than the fixture itself, so the app shell depends on one
 * function instead of on this feature's data.
 */
export function ticketCodeFor(idOrCode: string): string | undefined {
  return TICKETS.find((t) => t.id === idOrCode || t.code === idOrCode)?.code;
}

/** Resolve a display code to the numeric identifier used in ticket URLs. */
export function ticketIdFor(idOrCode: string): string | undefined {
  return TICKETS.find((t) => t.id === idOrCode || t.code === idOrCode)?.id;
}

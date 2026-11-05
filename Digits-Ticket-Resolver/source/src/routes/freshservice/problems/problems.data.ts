/**
 * Problems, read off /a/problems/view/my_open.
 *
 * The only one of the three with a row in it, and the same shape as the Tickets
 * list: a saved view named in the top bar, a table tab, bulk select, a sort
 * control and a range label.
 */

import type { ChangeFilter } from '../changes/changes.data';

export const PROBLEMS_MODULE = 'Problems';
export const PROBLEMS_VIEW = 'New & My Open Problems';

export const PROBLEMS_SORT_LABEL = 'Sort by:';
export const PROBLEMS_SORT_VALUE = 'Date created';
export const PROBLEMS_EXPORT = 'Export';

export interface Problem {
  id: string;
  code: string;
  subject: string;
  requester: string;
  status: string;
  priority: string;
  assignedTo: string;
  department: string;
}

/** The tenant's one problem, plus three more so the table can be sorted. */
export const PROBLEMS: Problem[] = [
  { id: '1', code: 'PRB-1', subject: 'Unable to reach email server', requester: 'Prithvi Tharun (Me)', status: 'Open', priority: 'High', assignedTo: 'Unassigned', department: 'IT' },
  { id: '2', code: 'PRB-2', subject: 'Recurring VPN drops for remote staff', requester: 'Maria Santos', status: 'Open', priority: 'Urgent', assignedTo: 'Alex Patel', department: 'Sales' },
  { id: '3', code: 'PRB-3', subject: 'Printer queue stalls after firmware update', requester: 'Rachel Osei', status: 'Pending', priority: 'Medium', assignedTo: 'Lena Brauer', department: 'Finance' },
  { id: '4', code: 'PRB-4', subject: 'Shared drive latency in the Chennai office', requester: 'Daniel Fischer', status: 'Open', priority: 'Low', assignedTo: 'Sarah Kim', department: 'Operations' },
];

/** Column widths as the live grid lays them out at 1920. */
export const PROBLEM_COLUMNS = [
  { id: 'subject', header: 'Subject', size: 424 },
  { id: 'requester', header: 'Requester', size: 234 },
  { id: 'status', header: 'Status', size: 153 },
  { id: 'priority', header: 'Priority', size: 178 },
  { id: 'assignedTo', header: 'Assigned to', size: 254 },
  { id: 'department', header: 'Department', size: 184 },
] as const;

/**
 * The filter panel, the same 342 wide shape as Changes and Assets but WITHOUT
 * the Basic and Advanced modes, and with Status as checkboxes rather than
 * chips. Those two differences are why the panel takes its fields as a prop.
 */
export const PROBLEM_FILTERS: ChangeFilter[] = [
  { label: 'Agents', kind: 'chips', chips: ['Unassigned', 'Me'] },
  { label: 'Created', kind: 'select', value: 'Last 6 months' },
  { label: 'Status', kind: 'checkbox', options: ['Open', 'Change Requested', 'Closed'], checked: ['Open'] },
  { label: 'Requesters', kind: 'text', placeholder: 'Search name or email' },
  { label: 'Departments', kind: 'select', placeholder: 'Select' },
  { label: 'Groups', kind: 'select', placeholder: 'Select' },
  { label: 'Planned Start Date', kind: 'period' },
  { label: 'Planned End Date', kind: 'period' },
];

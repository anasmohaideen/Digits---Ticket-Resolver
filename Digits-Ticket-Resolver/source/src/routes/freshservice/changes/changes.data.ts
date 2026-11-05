/**
 * Changes, read off /a/changes/view/my_open.
 *
 * The tenant has no changes, so this is the view's empty state plus the chrome
 * around it. What makes the page worth building is that chrome: a Change
 * Calendar alongside the table, and a filter panel richer than any other
 * section's, with its own Basic and Advanced modes.
 */

export const CHANGES_MODULE = 'Changes';
export const CHANGES_VIEW = 'New & My Open Changes';

export const CHANGES_CALENDAR = 'Change Calendar';
export const CHANGES_EMPTY = "You don't have anything to see in this view.";
export const CHANGES_EMPTY_LINK = 'All Changes';

/** The panel leads with these two modes, then a field search. */
export const FILTER_MODES = ['Basic filter', 'Advanced filter'];
export const FILTER_SEARCH_PLACEHOLDER = 'Search fields';
export const FILTER_APPLY = 'Apply';

export type FilterKind = 'chips' | 'select' | 'text' | 'period' | 'checkbox';

export interface ChangeFilter {
  label: string;
  kind: FilterKind;
  /** Values already applied on the live view, shown as removable chips. */
  chips?: string[];
  value?: string;
  placeholder?: string;
  /** For the checkbox kind: the options, and which start ticked. */
  options?: string[];
  checked?: string[];
}

/**
 * In live's order. Three arrive with values already set, which is why the view
 * is "New & My Open" rather than everything: unassigned or mine, opened in the
 * last six months, still open.
 */
export const CHANGE_FILTERS: ChangeFilter[] = [
  { label: 'Agents', kind: 'chips', chips: ['Unassigned', 'Me'] },
  { label: 'Created', kind: 'select', value: 'Last 6 months' },
  { label: 'Status', kind: 'chips', chips: ['Open'] },
  { label: 'Requesters', kind: 'text', placeholder: 'Search name or email' },
  { label: 'Departments', kind: 'select', placeholder: 'Select' },
  { label: 'Groups', kind: 'select', placeholder: 'Select' },
  { label: 'Planned Start Date', kind: 'period' },
  { label: 'Planned End Date', kind: 'period' },
];

export const PERIOD_PLACEHOLDER = 'Select a time period';
export const CREATED_OPTIONS = ['Last 6 months', 'Last 30 days', 'Last 7 days', 'Any time'];

/* ---------------------------------------------------------------------------
 * Advanced filter. Not a variant of Basic but a condition builder: the same
 * three applied values, expressed as rows you can remove or add to.
 * ------------------------------------------------------------------------- */

export const ADVANCED_BLURB =
  'Conditional form filter allow to apply complex criteria and conditions to filter data';
export const ADVANCED_MATCH = 'Match ALL of the below conditions';
export const ADVANCED_GROUP = 'Change fields';
export const ADVANCED_ADD = 'Add';
export const ADVANCED_ADD_ASSOCIATION = 'Add association';
/** Its footer says "Apply filters" where Basic's says just "Apply". */
export const ADVANCED_APPLY = 'Apply filters';

export interface Condition {
  id: string;
  field: string;
  operator: string;
  chips?: string[];
  /** A plain value, for operators that do not take a set. */
  value?: string;
}

export const ADVANCED_CONDITIONS: Condition[] = [
  { id: 'status', field: 'Status', operator: 'includes', chips: ['Open'] },
  { id: 'agent', field: 'Agent', operator: 'includes', chips: ['Unassigned', 'Me'] },
  { id: 'created', field: 'Created', operator: 'in the last', value: '6 months' },
];

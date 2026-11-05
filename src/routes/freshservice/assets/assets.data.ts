/**
 * Assets, read off /cmdb/items.
 *
 * The rail calls this section "Assets"; the top bar names the module and the
 * view, "Inventory - All Assets", the same shape Tickets uses for
 * "Tickets List - New & My Open Tickets".
 *
 * The live tenant holds no assets at all, so the layout was measured against
 * its empty state and the rows below are a fixture. Without them the table has
 * no column widths to settle, nothing to sort and no selection to make, which
 * is most of what this page is.
 */

export const ASSETS_MODULE = 'Inventory';
export const ASSETS_VIEW = 'All Assets';

export interface Asset {
  id: string;
  displayName: string;
  assetType: string;
  location: string;
  usedBy: string;
  department: string;
  managedBy: string;
}

export const ASSETS: Asset[] = [
  { id: '1', displayName: 'MW-LAP-0142', assetType: 'Laptop', location: 'Chennai HQ', usedBy: 'David Chen', department: 'IT', managedBy: 'Sarah Kim' },
  { id: '2', displayName: 'MW-LAP-0143', assetType: 'Laptop', location: 'Chennai HQ', usedBy: 'Maria Santos', department: 'Sales', managedBy: 'Sarah Kim' },
  { id: '3', displayName: 'MW-MON-0088', assetType: 'Monitor', location: 'Chennai HQ', usedBy: 'James Walker', department: 'Operations', managedBy: 'Lena Brauer' },
  { id: '4', displayName: 'MW-SRV-0004', assetType: 'Server', location: 'AWS ap-south-1', usedBy: 'None', department: 'IT', managedBy: 'Alex Patel' },
  { id: '5', displayName: 'MW-PRN-0011', assetType: 'Printer', location: 'Chennai HQ', usedBy: 'None', department: 'Finance', managedBy: 'Lena Brauer' },
  { id: '6', displayName: 'MW-PHN-0231', assetType: 'Mobile Phone', location: 'Remote', usedBy: 'Rachel Osei', department: 'Marketing', managedBy: 'Sarah Kim' },
  { id: '7', displayName: 'MW-SW-ADOBE', assetType: 'Software', location: 'Cloud', usedBy: 'Priya Nair', department: 'Marketing', managedBy: 'Alex Patel' },
  { id: '8', displayName: 'MW-NET-0017', assetType: 'Router', location: 'Chennai HQ', usedBy: 'None', department: 'IT', managedBy: 'Tom Nguyen' },
];

/**
 * Column widths as the live grid lays them out at 1920. Display Name takes
 * roughly double the rest, and every other column is an identical 206.
 */
export const ASSET_COLUMNS = [
  { id: 'displayName', header: 'Display Name', size: 401 },
  { id: 'assetType', header: 'Asset Type', size: 206 },
  { id: 'location', header: 'Location', size: 206 },
  { id: 'usedBy', header: 'Used By', size: 206 },
  { id: 'department', header: 'Department', size: 206 },
  { id: 'managedBy', header: 'Managed By', size: 206 },
] as const;

/** The bulk-action row, which sits to the left of the table's own search. */
export const ASSET_BULK_ACTIONS = ['Delete', 'Bulk Update', 'Print labels'];

/** Above it: two text actions, a primary, and the filter toggle. */
export const ASSET_EXPORT = 'Export';
export const ASSET_IMPORT = 'Import';
export const ASSET_ADD = 'Add New';

/** Live's own wording when the table has nothing to show. */
export const ASSETS_EMPTY = 'No data available in table';

/**
 * The filter panel's fields, in order. It is an inline panel rather than a
 * sheet: 342 wide against a 1px left border, and the page keeps its full
 * width behind it rather than dimming.
 */
export const ASSET_FILTERS: {
  label: string;
  kind: 'select' | 'text' | 'period';
  /**
   * The asset field this filter narrows. Six of the eleven have nothing behind
   * them in the fixture — groups, three date ranges, impact and a discovery
   * flag are not modelled — so they render for fidelity and do not filter.
   * Marking that here beats leaving a reader to guess which ones work.
   */
  field?: keyof Asset;
}[] = [
  { label: 'Asset Type', kind: 'select', field: 'assetType' },
  { label: 'Used By', kind: 'text', field: 'usedBy' },
  { label: 'Department', kind: 'text', field: 'department' },
  { label: 'Location', kind: 'text', field: 'location' },
  { label: 'Managed By', kind: 'text', field: 'managedBy' },
  { label: 'Managed By Group', kind: 'text' },
  { label: 'Created Date', kind: 'period' },
  { label: 'Updated Date', kind: 'period' },
  { label: 'Impact', kind: 'text' },
  { label: 'End of Life', kind: 'period' },
  { label: 'Discovery Enabled', kind: 'select' },
];

export const ASSET_TYPE_OPTIONS = ['All Assets', 'Laptop', 'Monitor', 'Server', 'Printer', 'Mobile Phone', 'Software', 'Router'];
export const PERIOD_PLACEHOLDER = 'Select a time period';

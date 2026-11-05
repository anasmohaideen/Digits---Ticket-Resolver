import { useMemo, useState } from 'react';
import { IconButton, Search, Table, TextButton, type IField } from '@freshworks/dew-components';
import AssetFilterPanel from './AssetFilterPanel';
import { sortRows } from '../sortRows';
import {
  ASSETS,
  ASSETS_EMPTY,
  ASSET_ADD,
  ASSET_BULK_ACTIONS,
  ASSET_COLUMNS,
  ASSET_EXPORT,
  ASSET_FILTERS,
  ASSET_IMPORT,
  type Asset,
} from './assets.data';

type ColumnDef<T> = {
  id: string;
  accessorKey?: Extract<keyof T, string>;
  header: string;
  size?: number;
};

/**
 * Assets, rebuilt from /cmdb/items.
 *
 * Two toolbar rows, not one, and they carry different weights of action:
 *
 *   top     Export and Import as bare brand-blue text, then Add New as the
 *           only filled button, then the filter toggle
 *   second  Delete, Bulk Update and Print labels as secondary buttons beside
 *           the table's own search, with the range and pager on the right
 *
 * Measured at 1920: the grid starts at x=85, the table search is 501x32 at
 * x=403, and the filter panel is 342 wide against a 1px left border.
 *
 * The three bulk actions are DISABLED until something is selected. That is not
 * a guess: on a live page with zero rows selected they carry class "btn
 * disabled" at opacity .5, cursor not-allowed, pointer-events none. They also
 * showed no hover, which was the tell — a secondary button that does not react
 * to a pointer is usually not styled that way on purpose.
 */
export default function Assets() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  // Live puts a column customiser at the right of the header row; Dew's Table
  // ships the same control, so it is configured rather than rebuilt.
  const [fields, setFields] = useState<IField[]>(
    ASSET_COLUMNS.map((c, i) => ({ id: c.id, name: c.header, label: c.header, checked: true, position: i }))
  );
  const [density, setDensity] = useState<'default' | 'compact'>('default');

  /* The search box filters. It sits above a table and looks like it should, so
     leaving it decorative would be worse than not shipping it. Matched across
     every column rather than the name alone, since a person scanning this page
     is as likely to be looking for a location or an owner as a tag. */
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ASSETS.filter((a) => {
      const matchesQuery =
        !q ||
        [a.displayName, a.assetType, a.location, a.usedBy, a.department, a.managedBy].some((v) =>
          v.toLowerCase().includes(q)
        );
      if (!matchesQuery) return false;
      // Only the five filters that name a field narrow anything; the other six
      // have nothing behind them in the fixture and are declared without one.
      return ASSET_FILTERS.every((f) => {
        if (!f.field) return true;
        const wanted = (filters[f.label] ?? '').trim().toLowerCase();
        if (!wanted || wanted === 'all assets') return true;
        return String(a[f.field]).toLowerCase().includes(wanted);
      });
    });
  }, [query, filters]);

  const columns = useMemo<ColumnDef<Asset>[]>(
    () =>
      ASSET_COLUMNS.filter((c) => fields.find((f) => f.id === c.id)?.checked !== false).map((c) => ({
        id: c.id,
        accessorKey: c.id as Extract<keyof Asset, string>,
        header: c.header,
        size: c.size,
      })),
    [fields]
  );

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0, minHeight: 0 }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '16px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--spacing-200)' }}>
          {/* Bare text, not buttons: no fill, no border, brand blue at 14px/600. */}
          <TextButton variant="link" size="default" className="fs-assets-link">
            {ASSET_EXPORT}
          </TextButton>
          <TextButton variant="link" size="default" className="fs-assets-link">
            {ASSET_IMPORT}
          </TextButton>
          <TextButton variant="primary" size="default">
            {ASSET_ADD}
          </TextButton>
          <IconButton
            iconName="Filter"
            aria-label={filtersOpen ? 'Hide filters' : 'Show filters'}
            aria-pressed={filtersOpen}
            /* Dew's own sustained-pressed state for an icon toggle, rather
               than a hand-painted brand fill. */
            active={filtersOpen}
            withBackground
            size="default"
            onClick={() => setFiltersOpen((open) => !open)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-150)', paddingBlock: '20px 12px' }}>
          {ASSET_BULK_ACTIONS.map((action) => (
            <TextButton key={action} variant="secondary" size="default" disabled={selected.size === 0}>
              {action}
            </TextButton>
          ))}
          <div className="fs-assets-search" style={{ flex: '0 0 501px', maxWidth: '100%', minWidth: 0 }}>
            <Search placeholder="Search" value={query} onValueChange={(next: string) => setQuery(next ?? '')} />
          </div>
          {/* The range sits with the pager, not under the table. */}
          <span style={{ marginInlineStart: 'auto', fontSize: '14px', color: 'var(--color-text-placeholder)' }}>
            Showing {rows.length ? 1 : 0} to {rows.length} of {rows.length} entries
          </span>
          <IconButton iconName="ChevronLeft" aria-label="Previous page" size="default" disabled />
          <IconButton iconName="ChevronRight" aria-label="Next page" size="default" disabled />
        </div>

        {/* Dew's Table neither takes a label prop nor forwards aria-label to the
            <table>, so the accessible name goes on a labelled region around it
            rather than on a prop that silently does nothing. */}
        <div className="fs-assets-table" role="region" aria-label="Assets" style={{ minWidth: 0, flex: 1 }}>
          <Table<Asset>
            data={sortRows(rows, sorting)}
            columns={columns}
            enableMultiSelect
            enableSorting
            sortingState={sorting}
            onSortChange={setSorting}
            selectedRows={selected}
            onSelectedRowsChange={setSelected}
            defaultStateComponent={EmptyAssets}
            rowDensity={density}
            columnCustomizer={{
              show: true,
              displayHeaderList: fields,
              onHeaderViewChange: setFields,
              rowDensity: density,
              onRowDensityChange: setDensity,
              showSelectAllColumns: true,
            }}
          />
        </div>
      </div>

      {filtersOpen && (
        <AssetFilterPanel
          values={filters}
          onChange={(label, value) => setFilters((prev) => ({ ...prev, [label]: value }))}
        />
      )}
    </div>
  );
}

/** Live's own wording, and a plain line rather than an illustration. */
function EmptyAssets() {
  return (
    <div style={{ padding: 'var(--spacing-300)', textAlign: 'center', fontSize: '14px', color: 'var(--color-text-primary)' }}>
      {ASSETS_EMPTY}
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Checkbox, Icon, IconButton, Table, Tag, TextButton } from '@freshworks/dew-components';
import FilterPanel from '../FilterPanel';
import { sortRows } from '../sortRows';
import {
  PROBLEMS,
  PROBLEMS_EXPORT,
  PROBLEMS_SORT_LABEL,
  PROBLEMS_SORT_VALUE,
  PROBLEM_FILTERS,
  PROBLEM_COLUMNS,
  type Problem,
} from './problems.data';

type ColumnDef<T> = {
  id: string;
  accessorKey?: Extract<keyof T, string>;
  header: string;
  size?: number;
  cell?: (context: { row: { original: T } }) => React.ReactNode;
};

/**
 * Problems, rebuilt from /a/problems/view/my_open.
 *
 * The only one of the three sections with a row in it. One toolbar row, not
 * two: Select all and the sort control on the left, then Export, the range,
 * the pager and the filter toggle pushed right.
 *
 * It also carries the same 342 filter panel as Changes, minus the Basic and
 * Advanced modes, and with Status as checkboxes rather than chips.
 *
 * An earlier pass rendered a "Problem table" tab above all this. There is no
 * such tab: the string is a visually hidden H1 parked at x=-9935 for screen
 * readers, and a DOM search found it and took it for a control.
 *
 * Measured column widths at 1920: Subject takes 424 and the rest run
 * 234/153/178/254/184.
 */
export default function Problems() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const columns = useMemo<ColumnDef<Problem>[]>(
    () =>
      PROBLEM_COLUMNS.map((c) => ({
        id: c.id,
        accessorKey: c.id as Extract<keyof Problem, string>,
        header: c.header,
        size: c.size,
        ...(c.id === 'subject'
          ? {
              /* Live prints the code after the subject, not in its own column. */
              cell: ({ row }: { row: { original: Problem } }) => (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-100)', minWidth: 0 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.original.subject}</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>#{row.original.code}</span>
                </span>
              ),
            }
          : {}),
        ...(c.id === 'status'
          ? { cell: ({ row }: { row: { original: Problem } }) => <Tag variant="gray">{row.original.status}</Tag> }
          : {}),
      })),
    []
  );

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0, minHeight: 0 }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '16px 20px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-200)', paddingInlineStart: '16px', paddingBlockEnd: '12px' }}>
        <Checkbox
          checked={selected.size === PROBLEMS.length}
          isIndeterminate={selected.size > 0 && selected.size < PROBLEMS.length}
          onChange={() => setSelected(selected.size === PROBLEMS.length ? new Set() : new Set(PROBLEMS.map((p) => p.id)))}
          label="Select all"
        />
        <span aria-hidden style={{ width: '1px', height: '24px', background: 'var(--color-boundary-border-mildest)' }} />

        <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>{PROBLEMS_SORT_LABEL}</span>
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-semi-bold)' }}>{PROBLEMS_SORT_VALUE}</span>
          <Icon name="ChevronDown" size="sm" color="var(--color-icon-secondary)" />
        </button>

        {/* Export is a bordered button on the RIGHT beside the range, not a
            text link on the left. */}
        <span style={{ marginInlineStart: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--spacing-150)' }}>
          <TextButton variant="secondary" size="default" prefixIcon="Export">
            {PROBLEMS_EXPORT}
          </TextButton>
          <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>
            1 - {PROBLEMS.length} of {PROBLEMS.length}
          </span>
          <IconButton iconName="ChevronLeft" aria-label="Previous page" size="default" disabled />
          <IconButton iconName="ChevronRight" aria-label="Next page" size="default" disabled />
          <IconButton
            iconName="Filter"
            aria-label={filtersOpen ? 'Hide filters' : 'Show filters'}
            aria-pressed={filtersOpen}
            active={filtersOpen}
            withBackground
            size="default"
            onClick={() => setFiltersOpen((open) => !open)}
          />
        </span>
      </div>

      <div className="fs-problems-table" role="region" aria-label="Problems" style={{ minWidth: 0, flex: 1 }}>
        <Table<Problem>
          data={sortRows(PROBLEMS, sorting)}
          columns={columns}
          enableMultiSelect
          enableSorting
          sortingState={sorting}
          onSortChange={setSorting}
          selectedRows={selected}
          onSelectedRowsChange={setSelected}
        />
        </div>
      </div>

      {filtersOpen && <FilterPanel fields={PROBLEM_FILTERS} label="Filter problems" />}
    </div>
  );
}

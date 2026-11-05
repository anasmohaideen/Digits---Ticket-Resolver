import { useMemo, useState } from 'react';
import { Icon, IconButton, Table, Tag } from '@freshworks/dew-components';
import { REPORTS, REPORT_COLUMNS, type Report } from './analytics.data';
import { sortRows } from '../sortRows';

type ColumnDef<T> = {
  id: string;
  accessorKey?: Extract<keyof T, string>;
  header: string;
  size?: number;
  cell?: (context: { row: { original: T } }) => React.ReactNode;
};

/**
 * The report list.
 *
 * The favourite star owns its own state. Dew's Table does not re-render a cell
 * when the parent's state changes -- not through `columns`, and not through
 * `data` either. The click handler fires and the state updates; the star simply
 * never redraws, which reads as a dead button. A self-contained component
 * re-renders itself and sidesteps the Table entirely.
 *
 * The trade is that the page no longer knows which reports are starred. Nothing
 * here needs to, and a prototype is the right place to take that trade rather
 * than remount the whole table on every click and lose its sort.
 *
 * Measured widths: a 56px star column, Name at 420, five metadata columns at an
 * identical 185, and a 64px overflow column. Name is the only one that carries
 * more than a string — a Curated tag beside the title, and a second line of
 * description on the three reports that have one.
 */
export default function ReportsTable({ query = '' }: { query?: string }) {
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);

  /* The search filters. It sits above a list and looks like it should, so
     leaving it decorative would be worse than not shipping it. */
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return REPORTS;
    return REPORTS.filter((r) =>
      [r.name, r.description ?? '', r.location, r.createdBy].some((v) => v.toLowerCase().includes(q))
    );
  }, [query]);
  const columns = useMemo<ColumnDef<Report>[]>(
    () => [
      {
        id: 'favorite',
        header: '',
        size: 56,
        cell: ({ row }: { row: { original: Report } }) => <FavoriteStar report={row.original} />,
      },
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        size: 420,
        cell: ({ row }: { row: { original: Report } }) => (
          <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', minWidth: 0 }}>
              <span style={{ fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.original.name}
              </span>
              {row.original.curated && <Tag variant="blue">Curated</Tag>}
            </span>
            {row.original.description && (
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.original.description}
              </span>
            )}
          </span>
        ),
      },
      ...REPORT_COLUMNS.filter((c) => c.id !== 'name').map((c) => ({
        id: c.id,
        accessorKey: c.id as Extract<keyof Report, string>,
        header: c.header,
        size: c.size,
      })),
      {
        id: 'actions',
        header: '',
        size: 64,
        cell: ({ row }: { row: { original: Report } }) => (
          <IconButton iconName="MoreVertical" aria-label={`${row.original.name} options`} size="mini" />
        ),
      },
    ],
    []
  );

  return (
    <div className="fs-reports-table" role="region" aria-label="Reports" style={{ minWidth: 0, flex: 1 }}>
      <Table<Report>
        data={sortRows(rows, sorting)}
        columns={columns}
        enableSorting
        sortingState={sorting}
        onSortChange={setSorting}
      />
    </div>
  );
}

/** Self-contained so a click actually redraws it; see the note above. */
function FavoriteStar({ report }: { report: Report }) {
  const [on, setOn] = useState(Boolean(report.favorite));
  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      aria-label={on ? `Unfavourite ${report.name}` : `Favourite ${report.name}`}
      aria-pressed={on}
      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
    >
      {/* A toggle shows its STATE, not the action: filled when on. */}
      <Icon
        name={on ? 'FavouriteStarFill' : 'FavouriteStar'}
        size="sm"
        color={on ? 'var(--color-icon-semantic-warning)' : 'var(--color-icon-secondary)'}
      />
    </button>
  );
}

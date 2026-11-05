import { useMemo, useState, type ReactNode } from 'react';
import { Badge, IconButton, Menu, Table, TextButton } from '@freshworks/dew-components';
import { INITIAL_ITEMS, ItemArtwork, STAGES, type RequestedItem } from '../RequestedItems';

/**
 * Option 2 · requested items as a table (21 Oct review).
 *
 * Option 1 stacks one 78px card per item; a table keeps a long request to a
 * few rows above the conversation. Same items, same stage menu, same action.
 */

/** The structural subset of TanStack's `ColumnDef` Dew's `Table` reads. */
type ColumnDef<T> = {
  id: string;
  accessorKey: Extract<keyof T, string>;
  header: string;
  size?: number;
  cell?: (context: { row: { original: T } }) => ReactNode;
};

const CELL: React.CSSProperties = { font: 'var(--font-body)', color: 'var(--color-text-primary)' };

export default function RequestedItemsTable({ initialItems = INITIAL_ITEMS }: { initialItems?: RequestedItem[] } = {}) {
  const [items, setItems] = useState(initialItems);
  const setStage = (id: string, stage: RequestedItem['stage']) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, stage } : item)));

  const columns = useMemo<ColumnDef<RequestedItem>[]>(() => [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Item',
      size: 260,
      cell: ({ row }) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-150)', minWidth: 0 }}>
          <span style={{ transform: 'scale(0.8)', display: 'inline-flex' }}><ItemArtwork item={row.original} /></span>
          <span style={{ ...CELL, fontWeight: 'var(--font-weight-semi-bold)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {row.original.name}
          </span>
        </span>
      )
    },
    {
      id: 'stage',
      accessorKey: 'stage',
      header: 'Stage',
      size: 140,
      cell: ({ row }) => (
        <Menu
          aria-label={`${row.original.name} stage`}
          options={STAGES.map((stage) => ({ value: stage, label: stage }))}
          onClick={(option) => setStage(row.original.id, option.value as RequestedItem['stage'])}
          slots={{
            trigger: (
              <TextButton type="button" variant="link" size="mini" suffixIcon="ChevronDown" style={{ ...CELL, padding: 0 }}>
                {row.original.stage}
              </TextButton>
            )
          }}
        />
      )
    },
    {
      id: 'actions',
      accessorKey: 'id',
      header: '',
      size: 190,
      cell: ({ row }) => (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--spacing-100)' }}>
          <TextButton
            type="button"
            variant="secondary"
            size="mini"
            prefixIcon="CircleCheck"
            disabled={row.original.stage === 'Fulfilled'}
            onClick={() => setStage(row.original.id, 'Fulfilled')}
          >
            {row.original.stage === 'Fulfilled' ? 'Fulfilled' : 'Fulfill'}
          </TextButton>
          <IconButton iconName="MoreVertical" aria-label={`${row.original.name} actions`} size="mini" />
        </span>
      )
    }
  ], []);

  return (
    <section aria-labelledby="o2-requested-items-heading" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-150)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)' }}>
        <h2 id="o2-requested-items-heading" style={{ margin: 0, font: 'var(--font-body-semibold)', color: 'var(--color-text-primary)' }}>
          Requested items
        </h2>
        <Badge count={items.length} color="primary" />
      </div>
      <div
        className="tr-attachments-table"
        style={{ border: '1px solid var(--color-boundary-border-mildest)', borderRadius: 'var(--border-radius-large)', backgroundColor: 'var(--color-fill-surface)', overflow: 'hidden' }}
      >
        <Table<RequestedItem> data={items} columns={columns} skipPagination />
      </div>
    </section>
  );
}

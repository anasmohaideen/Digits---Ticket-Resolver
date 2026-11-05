import { useMemo, useState } from 'react';
import { Checkbox, Icon, Search, SplitButton, Table, Tag, TextButton, type IMenuOption } from '@freshworks/dew-components';
import ArticleFilterSheet from './ArticleFilterSheet';
import EmptyState from '../EmptyState';
import emptyBoxArt from './assets/empty-box.svg';
import { ARTICLE_COLUMNS, CATEGORY_EMPTY, CATEGORY_EMPTY_ACTION, NEW_ARTICLE_OPTIONS, type Article } from './kb.data';
import { sortRows } from '../sortRows';

type ColumnDef<T> = {
  id: string;
  accessorKey?: Extract<keyof T, string>;
  header: string;
  size?: number;
  enableSorting?: boolean;
  cell?: (context: { row: { original: T } }) => React.ReactNode;
};

/**
 * The article table, shared by All Articles and by every category view.
 *
 * Measured on live at 1920: the sidebar ends at 365 and the table grid runs
 * 389 to 1872, so the content sits on 24px of padding. The heading is indented
 * a further 16px against the table, which is why it carries its own inset.
 *
 * The split button pins to the top right on its own row ABOVE the heading, not
 * beside it — the heading and the Filter button share the second row.
 *
 * Two differences between the two callers, both taken from live rather than
 * smoothed over: a category leads with a search box where All Articles does
 * not, and a category writes "IT (1)" with a space where All Articles writes
 * "All Articles(1)" without one.
 */
export default function ArticleListView({
  title,
  blurb,
  articles,
  showSearch = false,
}: {
  title: string;
  blurb?: string;
  articles: Article[];
  showSearch?: boolean;
}) {
  // Dew's Table works in Sets, not arrays, for the selection.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const columns = useMemo<ColumnDef<Article>[]>(
    () =>
      ARTICLE_COLUMNS.map((c) => ({
        id: c.id,
        accessorKey: c.id as Extract<keyof Article, string>,
        header: c.header,
        size: c.size,
        enableSorting: c.sortable,
        ...(c.id === 'title'
          ? {
              cell: ({ row }: { row: { original: Article } }) => (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-100)' }}>
                  <Icon name="Article" size="sm" color="var(--color-icon-secondary)" />
                  {row.original.title}
                </span>
              ),
            }
          : {}),
        ...(c.id === 'status'
          ? {
              /* Measured: a 46x20 pill on --color-fill-surface inside a
                 --color-boundary-border-mildest hairline, 12px/500 primary.
                 Dew's "gray" Tag is that shape, not a filled status chip. */
              cell: ({ row }: { row: { original: Article } }) => <Tag variant="gray">{row.original.status}</Tag>,
            }
          : {}),
      })),
    []
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0, padding: '16px 24px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: showSearch ? 'space-between' : 'flex-end', gap: 'var(--spacing-300)' }}>
        {showSearch && (
          <div className="fs-kb-search" style={{ flex: '0 1 619px', minWidth: 0 }}>
            <Search placeholder={`Search ${title}`} />
          </div>
        )}
        <SplitButton
          variant="primary"
          size="default"
          options={NEW_ARTICLE_OPTIONS.map((label) => ({ value: label, label }))}
          onOptionSelect={(_option: IMenuOption) => undefined}
        >
          New Article
        </SplitButton>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-300)', paddingBlockStart: '24px' }}>
        <div style={{ paddingInlineStart: '16px' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: 0, fontSize: '18px', lineHeight: '26px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
            {showSearch ? `${title} (${articles.length})` : `${title}(${articles.length})`}
            <Icon name="ChevronDown" size="md" color="var(--color-icon-secondary)" />
          </h1>
          {blurb && (
            <p style={{ margin: '2px 0 0', fontSize: '12px', lineHeight: '15px', color: 'var(--color-text-secondary)' }}>{blurb}</p>
          )}
        </div>
        <TextButton variant="secondary" size="default" prefixIcon="Filter" onClick={() => setFilterOpen(true)}>
          Filter
        </TextButton>
      </div>

      {articles.length === 0 ? (
        <EmptyState art={emptyBoxArt} message={CATEGORY_EMPTY}>
          <TextButton variant="primary" size="default">
            {CATEGORY_EMPTY_ACTION}
          </TextButton>
        </EmptyState>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-200)', paddingInlineStart: '44px', paddingBlock: '20px 8px' }}>
            <Checkbox
              checked={selected.size === articles.length}
              isIndeterminate={selected.size > 0 && selected.size < articles.length}
              onChange={() => setSelected(selected.size === articles.length ? new Set() : new Set(articles.map((a) => a.id)))}
              label="Select all"
            />
            <span aria-hidden style={{ width: '1px', height: '24px', background: 'var(--color-boundary-border-mildest)' }} />
          </div>

          <div className="fs-kb-table" style={{ minWidth: 0, flex: 1 }}>
            <Table<Article>
              data={sortRows(articles, sorting)}
              columns={columns}
              enableMultiSelect
              enableSorting
              sortingState={sorting}
              onSortChange={setSorting}
              selectedRows={selected}
              onSelectedRowsChange={setSelected}
            />
          </div>
        </>
      )}

      <ArticleFilterSheet open={filterOpen} onOpenChange={setFilterOpen} />
    </div>
  );
}

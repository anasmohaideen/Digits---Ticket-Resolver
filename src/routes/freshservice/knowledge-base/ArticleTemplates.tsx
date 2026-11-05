import { useMemo, useState } from 'react';
import { Table, TextButton } from '@freshworks/dew-components';
import { ARTICLE_TEMPLATES, TEMPLATES_ACTION, TEMPLATES_BLURB, TEMPLATES_TITLE, TEMPLATE_COLUMNS, type ArticleTemplate } from './kb.data';
import { sortRows } from '../sortRows';

type ColumnDef<T> = {
  id: string;
  accessorKey?: Extract<keyof T, string>;
  header: string;
  size?: number;
  enableSorting?: boolean;
};

/**
 * Article Templates, read off /a/solutions/templates.
 *
 * Its own four-column table rather than the article one, and its action is
 * "Create Template" — a plain primary button, not the split button the article
 * views carry. The blurb runs long enough to wrap, which is why it is not
 * clamped the way the All Articles line is.
 */
export default function ArticleTemplates() {
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);

  const columns = useMemo<ColumnDef<ArticleTemplate>[]>(
    () =>
      TEMPLATE_COLUMNS.map((c) => ({
        id: c.id,
        accessorKey: c.id as Extract<keyof ArticleTemplate, string>,
        header: c.header,
        size: c.size,
        enableSorting: c.sortable,
      })),
    []
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0, padding: '16px 24px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-300)' }}>
        <div style={{ paddingInlineStart: '16px', maxWidth: '780px' }}>
          <h1 style={{ margin: 0, fontSize: '18px', lineHeight: '26px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
            {TEMPLATES_TITLE}({ARTICLE_TEMPLATES.length})
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '12px', lineHeight: '17px', color: 'var(--color-text-secondary)' }}>
            {TEMPLATES_BLURB}
          </p>
        </div>
        <TextButton variant="primary" size="default">
          {TEMPLATES_ACTION}
        </TextButton>
      </div>

      <div className="fs-kb-table" style={{ minWidth: 0, flex: 1, paddingBlockStart: '20px' }}>
        <Table<ArticleTemplate>
          data={sortRows(ARTICLE_TEMPLATES, sorting)}
          columns={columns}
          enableSorting
          sortingState={sorting}
          onSortChange={setSorting}
        />
      </div>
    </div>
  );
}

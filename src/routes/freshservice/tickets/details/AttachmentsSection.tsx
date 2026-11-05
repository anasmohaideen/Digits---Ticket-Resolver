import { useMemo, useState, type ReactNode } from 'react';
import { Badge, Icon, IconButton, Table, TextButton } from '@freshworks/dew-components';
import type { IconName } from '@freshworks/dew-components';
import { attachedOn } from './format';

/**
 * Attachments, for service requests.
 *
 * Sits between Requested items and Conversations. The table itself is Dew's
 * `Table` rather than a hand-rolled grid, so column sizing, header styling,
 * row borders and keyboard behaviour come from the system.
 *
 * Type sizes here are the two the design allows: 14px for the section title and
 * every cell value, 12px for the column headers and the file's own metadata.
 */

export interface AttachmentRecord {
  id: string;
  name: string;
  /** Bytes as the product already formats them, e.g. "239 KB". */
  sizeLabel: string;
  /** ISO 8601; rendered by `attachedOn`. */
  at: string;
  attachedBy: string;
  /** Internal-only files carry a lock beside the name. */
  restricted?: boolean;
}

export const DEFAULT_ATTACHMENTS: AttachmentRecord[] = [
  {
    id: 'passport',
    name: 'Passport.png',
    sizeLabel: '239 KB',
    at: '2024-11-21T02:09:00Z',
    attachedBy: 'Samuel H Wood'
  },
  {
    id: 'verification-letter',
    name: 'Employee verification letter.pdf',
    sizeLabel: '239 KB',
    at: '2024-11-21T02:09:00Z',
    attachedBy: 'System',
    restricted: true
  },
  {
    id: 'company-id',
    name: 'Company ID Proof.png',
    sizeLabel: '239 KB',
    at: '2024-11-21T02:09:00Z',
    attachedBy: 'Ricky James Chadwik'
  }
];

/**
 * Dew's `Table` takes TanStack's `ColumnDef`. `Tickets.tsx` declares the
 * structural subset it needs rather than importing the generic, so the same
 * local shape is used here — with `header` widened to a node, because these
 * headers carry their own type size.
 */
/*
 * Dew's table is `table-fixed` and already full width, so these sizes act as
 * proportions: their sum stays below the narrowest column this tab renders in,
 * and the browser shares the remaining width out between them. Sizes that sum
 * past the container make the table scroll sideways inside its panel instead.
 */
type ColumnDef<T> = {
  id: string;
  accessorKey: Extract<keyof T, string>;
  header: string;
  size?: number;
  cell?: (context: { row: { original: T } }) => ReactNode;
};

/** The `Docutype/*` family, by extension, as the product shows file types. */
const DOCUTYPE: Record<string, IconName> = {
  png: 'Docutype/Png',
  jpg: 'Docutype/Jpg',
  jpeg: 'Docutype/Jpg',
  pdf: 'Docutype/Pdf'
};

function extensionOf(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

function fileIcon(name: string): IconName {
  return DOCUTYPE[extensionOf(name)] ?? 'Docutype/Unknown';
}

/**
 * The `Docutype/*` glyphs paint from a single `--fill-0`, which `Icon`'s
 * `color` sets, so the family is tinted by kind the way the product colour-codes
 * it: documents red, images highlight-violet, anything else neutral.
 */
function fileIconColor(name: string): string {
  const extension = extensionOf(name);
  if (extension === 'pdf') return 'var(--color-icon-semantic-error)';
  if (extension === 'png' || extension === 'jpg' || extension === 'jpeg') {
    return 'var(--color-icon-semantic-highlight)';
  }
  return 'var(--color-icon-secondary)';
}

const CELL: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '20px',
  color: 'var(--color-text-primary)'
};

export default function AttachmentsSection({
  defaultOpen = true,
  records = DEFAULT_ATTACHMENTS
}: {
  defaultOpen?: boolean;
  /** A ticket's own files; defaults to the set this section shipped with. */
  records?: AttachmentRecord[];
} = {}) {
  const [open, setOpen] = useState(defaultOpen);

  const columns = useMemo<ColumnDef<AttachmentRecord>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Attachment',
        size: 220,
        cell: ({ row }) => (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-150)', minWidth: 0 }}>
            <Icon
              category="docutype"
              name={fileIcon(row.original.name)}
              size="md"
              color={fileIconColor(row.original.name)}
              title=""
            />
            <span
              style={{
                ...CELL,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {row.original.name}
            </span>
            {row.original.restricted && (
              <Icon
                name="Lock"
                size="sm"
                color="var(--color-icon-secondary)"
                title="Internal only"
                style={{ flexShrink: 0 }}
              />
            )}
          </span>
        )
      },
      {
        id: 'size',
        accessorKey: 'sizeLabel',
        header: 'Size',
        size: 80,
        cell: ({ row }) => <span style={CELL}>{row.original.sizeLabel}</span>
      },
      {
        id: 'at',
        accessorKey: 'at',
        header: 'Attached on',
        size: 160,
        cell: ({ row }) => <span style={CELL}>{attachedOn(row.original.at)}</span>
      },
      {
        id: 'by',
        accessorKey: 'attachedBy',
        header: 'Attached by',
        size: 150,
        cell: ({ row }) => <span style={CELL}>{row.original.attachedBy}</span>
      },
      {
        id: 'download',
        accessorKey: 'id',
        header: '',
        size: 56,
        cell: ({ row }) => (
          <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton
              iconName="Download"
              aria-label={`Download ${row.original.name}`}
              size="mini"
              withBackground
            />
          </span>
        )
      }
    ],
    []
  );

  return (
    <section
      aria-labelledby="attachments-heading"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-150)',
        padding: 'var(--spacing-250)',
        backgroundColor: 'var(--color-fill-container)',
        borderRadius: 'var(--border-radius-large)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)' }}>
        <h2
          id="attachments-heading"
          style={{
            margin: 0,
            fontSize: '14px',
            lineHeight: '20px',
            fontWeight: 'var(--font-weight-semi-bold)',
            color: 'var(--color-text-primary)'
          }}
        >
          Attachments
        </h2>
        <Badge count={records.length} color="primary" />
        <span style={{ flex: 1 }} />
        <IconButton
          iconName={open ? 'ChevronUp' : 'ChevronDown'}
          aria-label={open ? 'Collapse attachments' : 'Expand attachments'}
          aria-expanded={open}
          aria-controls="attachments-panel"
          size="default"
          withBackground
          onClick={() => setOpen((value) => !value)}
        />
      </div>

      <div id="attachments-panel" hidden={!open}>
        {open && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-150)' }}>
            <div
              className="tr-attachments-table"
              style={{
                border: '1px solid var(--color-boundary-border-mildest)',
                borderRadius: 'var(--border-radius-large)',
                backgroundColor: 'var(--color-fill-surface)',
                overflow: 'hidden'
              }}
            >
              <Table<AttachmentRecord> data={records} columns={columns} skipPagination />
            </div>
            <TextButton
              type="button"
              variant="link"
              size="mini"
              style={{ padding: 0, fontSize: '14px', alignSelf: 'flex-start' }}
            >
              View all
            </TextButton>
          </div>
        )}
      </div>
    </section>
  );
}

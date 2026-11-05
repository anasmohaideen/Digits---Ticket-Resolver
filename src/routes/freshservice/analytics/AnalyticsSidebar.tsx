import { useState } from 'react';
import { Icon } from '@freshworks/dew-components';
import { NEW_FOLDER, REPORT_NAV, REPORT_NAV_FOOT, type ReportNavItem } from './analytics.data';

/**
 * The reports sidebar.
 *
 * Measured inside the reports iframe: 309 wide with 40px rows, and the selected
 * row is 13px/600 --color-text-brand on --color-fill-semantic-info-mildest —
 * the same pair the Knowledge Base sidebar uses, so it shares that hover rule
 * too rather than growing a second one.
 *
 * Trash and Settings pin to the FOOT of the panel rather than following the
 * list, which is also what Knowledge Base does.
 */
const ROW = 40;

export default function AnalyticsSidebar({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  // Curated reports ships expanded on the live tenant.
  const [open, setOpen] = useState<Record<string, boolean>>({ curated: true });

  return (
    <nav
      aria-label="Reports"
      style={{
        width: '309px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-fill-surface)',
        borderInlineEnd: '1px solid var(--color-boundary-border-mildest)',
        overflowY: 'auto',
        paddingBlock: 'var(--spacing-100)',
      }}
    >
      {REPORT_NAV.map((item) => (
        <div key={item.id}>
          <Row
            item={item}
            active={selected === item.id}
            onClick={() =>
              item.children ? setOpen((p) => ({ ...p, [item.id]: !p[item.id] })) : onSelect(item.id)
            }
            expanded={item.children ? Boolean(open[item.id]) : undefined}
            /* My reports carries a small "Folder" action on its right, 66x20 at
               13px/400 with a leading icon. It is the only row that has one. */
            action={item.id === 'mine' ? NEW_FOLDER : undefined}
          />
          {item.children && open[item.id] && (
            <div>
              {item.children.map((child) => (
                <Row
                  key={child.id}
                  item={{ id: child.id, label: child.label, icon: 'Folder' }}
                  active={selected === child.id}
                  onClick={() => onSelect(child.id)}
                  indent
                />
              ))}
            </div>
          )}
        </div>
      ))}

      <div style={{ marginBlockStart: 'auto', paddingBlockStart: 'var(--spacing-200)' }}>
        {REPORT_NAV_FOOT.map((item) => (
          <Row key={item.id} item={item} active={selected === item.id} onClick={() => onSelect(item.id)} />
        ))}
      </div>
    </nav>
  );
}

function Row({
  item,
  active,
  onClick,
  indent = false,
  expanded,
  action,
}: {
  item: ReportNavItem;
  active: boolean;
  onClick: () => void;
  indent?: boolean;
  expanded?: boolean;
  action?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? undefined : 'fs-kb-row'}
      aria-current={active ? 'page' : undefined}
      aria-expanded={expanded}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-100)',
        width: '100%',
        height: `${ROW}px`,
        paddingInline: `${indent ? 44 : 20}px 16px`,
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        // Left undefined when not current: an inline background, even
        // 'transparent', outranks .fs-kb-row:hover and kills the hover.
        background: active ? 'var(--color-fill-semantic-info-mildest)' : undefined,
        fontSize: '13px',
        fontWeight: active ? 'var(--font-weight-semi-bold)' : 400,
        color: active ? 'var(--color-text-brand)' : 'var(--color-text-primary)',
      }}
    >
      <Icon
        name={item.icon}
        size="sm"
        color={active ? 'var(--color-icon-selected)' : 'var(--color-icon-secondary)'}
      />
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {item.label}
      </span>
      {action && (
        <span
          role="button"
          tabIndex={0}
          onClick={(event) => event.stopPropagation()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-text-primary)', cursor: 'pointer' }}
        >
          <Icon name="Folder" size="sm" color="var(--color-icon-secondary)" />
          {action}
        </span>
      )}
      {expanded !== undefined && (
        <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size="sm" color="var(--color-icon-secondary)" />
      )}
    </button>
  );
}

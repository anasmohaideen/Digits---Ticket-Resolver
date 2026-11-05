import { useState } from 'react';
import { Icon } from '@freshworks/dew-components';
import { KB_CATEGORIES, KB_NAV, KB_TRASH, type KbNavItem } from './kb.data';

/**
 * The Knowledge Base sidebar.
 *
 * Measured on the live panel: 300px wide against a 1px #eaeef2 right edge, list
 * padded 8px 12px 4px, rows 275x32 on a 40px pitch. Three bands separated by
 * rules — the four fixed views, the category tree, and Trash pinned to the
 * bottom of the panel rather than following the last category.
 *
 * The selected row is the interesting one: --color-fill-semantic-info-mildest
 * behind --color-text-brand, on an asymmetric 4px/8px/8px/4px radius. The tight
 * left corners are there to seat the brand accent bar flush against the edge.
 */
const ROW_HEIGHT = 32;

export default function KbSidebar({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  // Both categories ship expanded on the live tenant.
  const [open, setOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(KB_CATEGORIES.map((c) => [c.id, true]))
  );

  return (
    <nav
      aria-label="Knowledge Base"
      style={{
        width: '300px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-fill-surface)',
        borderInlineEnd: '1px solid var(--color-boundary-border-mildest)',
        overflowY: 'auto',
      }}
    >
      <ul style={{ listStyle: 'none', margin: 0, padding: '8px 12px 4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {KB_NAV.map((item) => (
          <li key={item.id}>
            <Row item={item} active={selected === item.id} onClick={() => onSelect(item.id)} />
          </li>
        ))}
      </ul>

      {/* Each category is its own block closed by a rule, which is how the live
          panel separates them rather than one rule above the whole tree. */}
      {KB_CATEGORIES.map((category) => (
        <div key={category.id} style={{ borderBlockStart: '1px solid var(--color-boundary-border-mildest)', padding: '8px 12px' }}>
          {/* Two targets, not one. On live the LABEL navigates to the category
              and the chevron only expands it, so a single button that did both
              made the category unreachable. */}
          {/* The hover sits on the ROW, not on the label, so travelling over
              the chevron fills it too — which is what live does, where the
              whole row is a single anchor. */}
          <div
            className={selected === category.id ? undefined : 'fs-kb-row'}
            style={{
              display: 'flex',
              alignItems: 'center',
              height: `${ROW_HEIGHT}px`,
              borderRadius: '4px 8px 8px 4px',
              borderInlineStart: `3px solid ${selected === category.id ? 'var(--color-fill-brand)' : 'transparent'}`,
              background: selected === category.id ? 'var(--color-fill-semantic-info-mildest)' : undefined,
            }}
          >
            <button
              type="button"
              onClick={() => onSelect(category.id)}
              aria-current={selected === category.id ? 'page' : undefined}
              style={{
                flex: 1,
                minWidth: 0,
                textAlign: 'left',
                height: '100%',
                padding: '0 12px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'var(--font-weight-semi-bold)',
                color: selected === category.id ? 'var(--color-text-brand)' : 'var(--color-text-primary)',
              }}
            >
              {category.label}
            </button>
            <button
              type="button"
              onClick={() => setOpen((prev) => ({ ...prev, [category.id]: !prev[category.id] }))}
              aria-expanded={open[category.id]}
              aria-label={`${open[category.id] ? 'Collapse' : 'Expand'} ${category.label}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                padding: '0 12px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
              }}
            >
              <Icon name={open[category.id] ? 'ChevronUp' : 'ChevronDown'} size="sm" color="var(--color-icon-secondary)" />
            </button>
          </div>
          {open[category.id] && (
            <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {category.folders.map((folder) => (
                <li key={folder.id}>
                  {/* Folders indent 8px against their parent, measured at
                      x=85 where the category label sits at x=77. */}
                  <Row
                    item={{ id: folder.id, label: folder.label, icon: 'Folder' }}
                    active={selected === folder.id}
                    onClick={() => onSelect(folder.id)}
                    indent
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {/* Pinned to the foot of the panel, not to the end of the list. */}
      <div style={{ marginBlockStart: 'auto', borderBlockStart: '1px solid var(--color-boundary-border-mildest)', padding: '12px' }}>
        <Row item={KB_TRASH} active={selected === KB_TRASH.id} onClick={() => onSelect(KB_TRASH.id)} />
      </div>
    </nav>
  );
}

function Row({
  item,
  active,
  onClick,
  indent = false,
}: {
  item: KbNavItem;
  active: boolean;
  onClick: () => void;
  indent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? undefined : 'fs-kb-row'}
      aria-current={active ? 'page' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-100)',
        width: '100%',
        height: `${ROW_HEIGHT}px`,
        padding: '0 12px',
        marginInlineStart: indent ? '8px' : 0,
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        // Tight left corners so the accent bar sits flush; see the file comment.
        borderRadius: '4px 8px 8px 4px',
        borderInlineStart: `3px solid ${active ? 'var(--color-fill-brand)' : 'transparent'}`,
        // Left undefined when not current: an inline background — even
        // 'transparent' — outranks .fs-kb-row:hover and kills the hover.
        background: active ? 'var(--color-fill-semantic-info-mildest)' : undefined,
        fontSize: '14px',
        color: active ? 'var(--color-text-brand)' : 'var(--color-text-primary)',
      }}
    >
      <Icon
        name={item.icon}
        size="sm"
        color={active ? 'var(--color-icon-selected)' : 'var(--color-icon-secondary)'}
      />
      {item.label}
    </button>
  );
}

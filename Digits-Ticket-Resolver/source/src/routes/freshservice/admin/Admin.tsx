import { useMemo, useState } from 'react';
import { Icon, Search } from '@freshworks/dew-components';
import { ADMIN_SECTIONS, type AdminItem } from './admin.data';

/**
 * Admin home.
 *
 * Measured off the live page rather than composed by eye:
 *
 *   search       a 48px field spanning the content column, its own band
 *   section      h2 at 24px/600 with a description beneath
 *   sub-group    16px/600, only in the three sections that have them
 *   card         304x104, five per row on a 336px pitch — so a 32px gap —
 *                borderless and unfilled, icon left of a title and one line
 *                of description
 *
 * The cards carry no chrome at all: no fill, no border, no padding. They read
 * as a list rather than as tiles, which is easy to get wrong in the other
 * direction.
 */
export default function Admin() {
  const [query, setQuery] = useState('');

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ADMIN_SECTIONS;
    const match = (item: AdminItem) =>
      item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    return ADMIN_SECTIONS.map((section) => ({
      ...section,
      groups: section.groups
        .map((group) => ({ ...group, items: group.items.filter(match) }))
        .filter((group) => group.items.length > 0)
    })).filter((section) => section.groups.length > 0);
  }, [query]);

  const hits = sections.reduce((n, s) => n + s.groups.reduce((m, g) => m + g.items.length, 0), 0);

  return (
    <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
      {/* Measured at 1600x48 spanning the content column, in its own band. */}
      <div className="fs-admin-search" style={{ padding: 'var(--spacing-300) var(--spacing-400)', backgroundColor: 'var(--color-fill-container)' }}>
        <Search
          value={query}
          onValueChange={setQuery}
          onClear={() => setQuery('')}
          placeholder="Search admin"
          aria-label="Search admin"
        />
      </div>

      <div style={{ padding: 'var(--spacing-400)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-600)' }}>
        {sections.map((section) => (
          <section key={section.label}>
            <h2 style={{ margin: 0, fontSize: '24px', lineHeight: '34px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
              {section.label}
            </h2>
            <p style={{ margin: '0 0 var(--spacing-300)', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              {section.description}
            </p>

            {section.groups.map((group) => (
              <div key={group.label || section.label} style={{ marginBlockEnd: 'var(--spacing-300)' }}>
                {group.label && (
                  <h3 style={{ margin: '0 0 var(--spacing-200)', fontSize: '16px', lineHeight: '24px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
                    {group.label}
                  </h3>
                )}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(304px, 1fr))',
                    columnGap: 'var(--spacing-400)',
                    rowGap: 'var(--spacing-300)'
                  }}
                >
                  {group.items.map((item) => (
                    <AdminCard key={item.title} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}

        {hits === 0 && (
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            No admin settings match “{query}”.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Borderless, unfilled: icon in a left column, title and one line beside it.
 *
 * NO HOVER STATE, deliberately. Measured under a real pointer on the live
 * page — with :hover resolving into the card, background, title colour,
 * text-decoration and box-shadow are all unchanged; the only thing that moves
 * is a border-radius on a transparent element. The cursor is the whole
 * affordance.
 *
 * Recorded because a dense grid of links with no hover feedback reads as an
 * oversight, and the obvious "fix" would be a deviation from the product.
 * Keyboard focus is a different matter and is left to the browser's ring.
 */
function AdminCard({ item }: { item: AdminItem }) {
  return (
    <a
      href="#"
      style={{
        display: 'flex',
        gap: 'var(--spacing-150)',
        padding: 'var(--spacing-100) 0',
        textDecoration: 'none',
        minWidth: 0
      }}
    >
      <Icon name={item.icon} size="md" />
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: '14px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
          {item.title}
        </span>
        <span style={{ display: 'block', fontSize: '14px', lineHeight: '20px', color: 'var(--color-text-secondary)' }}>
          {item.description}
        </span>
      </span>
    </a>
  );
}

import { useState } from 'react';
import { Checkbox, Icon, Search, Select, TextButton } from '@freshworks/dew-components';
import {
  ACTION_APPS,
  ACTION_SORT_OPTIONS,
  BROWSE_ACTIONS,
  type BrowseAction
} from './aiStudio.data';

/**
 * Browse Actions.
 *
 * Two columns, measured: an apps panel on the left with its own search, then
 * the action grid with a search and a sort control above it. Cards are 304px
 * with an 8px radius — squarer than the 12px used elsewhere in the studio,
 * which is worth not "correcting".
 *
 * The grid repeats the eight captured actions rather than inventing names to
 * fill 99+. Enough to show the layout and let it scroll.
 */
const REPEATS = 4;

export default function BrowseActions() {
  const [appQuery, setAppQuery] = useState('');
  const [actionQuery, setActionQuery] = useState('');
  const [sort, setSort] = useState(ACTION_SORT_OPTIONS[0]);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());

  const apps = ACTION_APPS.filter((a) => a.toLowerCase().includes(appQuery.trim().toLowerCase()));

  const grid = BROWSE_ACTIONS.filter((a) => {
      const q = actionQuery.trim().toLowerCase();
      const byApp = selectedApps.size === 0 || [...selectedApps].some((s) => s.startsWith(a.vendor));
      if (!byApp) return false;
      return !q || a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
    });

  // "App name" sorts by the APP, which is what groups Asana's actions together
  // and Ashby's after them, as the live grid does. Sorting those by action
  // title instead just clusters identical names.
  const byApp = sort.startsWith('App name');
  const desc = sort.endsWith('Descending');
  const ordered = [...grid].sort((a, b) => {
    const key = byApp
      ? a.vendor.localeCompare(b.vendor) || a.title.localeCompare(b.title)
      : a.title.localeCompare(b.title);
    return desc ? -key : key;
  });
  // Repeat AFTER ordering, so each pass through the set keeps its variety.
  // Repeating first and sorting after just stacks four identical titles.
  const sorted = Array.from({ length: REPEATS }, () => ordered).flat();

  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-300)', alignItems: 'flex-start', minHeight: 0 }}>
      <aside style={APPS_PANEL}>
        <Search
          value={appQuery}
          onValueChange={setAppQuery}
          onClear={() => setAppQuery('')}
          placeholder="Search apps"
          aria-label="Search apps"
        />

        <div>
          <div style={PANEL_HEADING}>Connected apps</div>
          <p style={{ margin: 'var(--spacing-150) 0 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            No apps are connected
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={PANEL_HEADING}>All apps</span>
          <TextButton type="button" variant="link" size="mini" suffixIcon="NewTab">
            View all
          </TextButton>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
          {apps.map((app) => (
            <Checkbox
              key={app}
              label={app}
              checked={selectedApps.has(app)}
              onChange={() =>
                setSelectedApps((prev) => {
                  const next = new Set(prev);
                  next.has(app) ? next.delete(app) : next.add(app);
                  return next;
                })
              }
            />
          ))}
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-300)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-200)' }}>
          <div style={{ width: '286px' }}>
            <Search
              value={actionQuery}
              onValueChange={setActionQuery}
              onClear={() => setActionQuery('')}
              placeholder="Search actions..."
              aria-label="Search actions"
            />
          </div>
          <div style={{ marginInlineStart: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)' }}>
            <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>Sort by :</span>
            <Select
              aria-label="Sort actions"
              options={ACTION_SORT_OPTIONS.map((o) => ({ value: o, label: o }))}
              value={{ value: sort, label: sort }}
              onValueChange={(next) => next && setSort(next.value as string)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(304px, 1fr))', gap: 'var(--spacing-250)' }}>
          {sorted.map((action, i) => (
            <ActionCard key={`${action.title}-${i}`} action={action} />
          ))}
        </div>

        {sorted.length === 0 && (
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            No actions match these filters.
          </p>
        )}
      </div>
    </div>
  );
}

function ActionCard({ action }: { action: BrowseAction }) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minHeight: '191px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-200)',
        padding: 'var(--spacing-250)',
        border: '1px solid var(--color-boundary-border-mildest)',
        // 8px here, not the 12px the other studio cards use.
        borderRadius: 'var(--border-radius-medium)',
        backgroundColor: 'var(--color-fill-surface)',
        boxShadow: hovered ? 'var(--shadow-md)' : 'none',
        transition: 'box-shadow 120ms ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span title={action.vendor} style={VENDOR_TILE}>
          {action.vendor.slice(0, 1)}
        </span>
        <button type="button" aria-label={`More options for ${action.title}`} style={MORE_BTN}>
          <Icon name="MoreVertical" size="sm" color="var(--color-icon-secondary)" />
        </button>
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: '16px', lineHeight: '22px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
          {action.title}
        </h3>
        <p style={{ margin: 'var(--spacing-100) 0 0', fontSize: '14px', lineHeight: '20px', color: 'var(--color-text-secondary)' }}>
          {action.description}
        </p>
      </div>
    </article>
  );
}

const APPS_PANEL: React.CSSProperties = {
  width: '265px',
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-300)',
  padding: 'var(--spacing-250)',
  border: '1px solid var(--color-boundary-border-mildest)',
  borderRadius: 'var(--border-radius-medium)',
  backgroundColor: 'var(--color-fill-surface)'
};

const PANEL_HEADING: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'var(--font-weight-semi-bold)',
  color: 'var(--color-text-primary)'
};

/** Vendor logos again — Dew carries none of them, so an initial tile stands in. */
const VENDOR_TILE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: 'var(--border-radius-small)',
  border: '1px solid var(--color-boundary-border-mildest)',
  backgroundColor: 'var(--color-fill-container)',
  fontSize: '14px',
  fontWeight: 'var(--font-weight-semi-bold)',
  color: 'var(--color-text-primary)'
};

const MORE_BTN: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  display: 'flex'
};

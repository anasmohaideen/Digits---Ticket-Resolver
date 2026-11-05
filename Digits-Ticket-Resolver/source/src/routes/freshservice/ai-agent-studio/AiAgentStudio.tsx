import { useState } from 'react';
import { NavLink, Navigate, useParams } from 'react-router-dom';
import { Icon } from '@freshworks/dew-components';
import AiAgents from './AiAgents';
import LibraryScreen from './LibraryScreen';
import CreateAgent from './CreateAgent';
import { DEFAULT_STUDIO_VIEW, STUDIO_NAV, type StudioNavItem } from './aiStudio.data';

const BASE = '/freshservice/agent-studio';

const VALID = new Set([
  ...STUDIO_NAV.flatMap((item) => [item.id, ...(item.children ?? []).map((c) => c.id)]),
  // Reached from the chooser rather than the nav, so it is routable without
  // being a nav item.
  'create'
]);

/**
 * AI Agent Studio shell.
 *
 * A 215px sub-nav beside the content, measured off the live studio: items are
 * 40px tall, the Library group expands in place rather than flying out, and
 * its children indent to x=115 against the parent's x=77.
 */
export default function AiAgentStudio() {
  const { view } = useParams<{ view: string }>();

  if (!view || !VALID.has(view)) {
    return <Navigate to={`${BASE}/${DEFAULT_STUDIO_VIEW}`} replace />;
  }

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0, minHeight: 0 }}>
      <StudioNav view={view} />
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        {view === 'ai-agents' ? (
          <AiAgents />
        ) : view === 'create' ? (
          <CreateAgent />
        ) : (
          <LibraryScreen view={view} />
        )}
      </div>
    </div>
  );
}

function StudioNav({ view }: { view: string }) {
  // Collapsed on load, measured: a fresh studio shows only AI agents and
  // Library, and expands in place when Library is pressed. But if the view
  // IS one of Library's children it opens, otherwise landing on Workflows
  // leaves the group shut and nothing showing where you are.
  const inLibrary = (STUDIO_NAV.find((item) => item.children)?.children ?? []).some(
    (child) => child.id === view
  );
  const [libraryOpen, setLibraryOpen] = useState(inLibrary);
  // Measured: a nav row takes a container fill on hover and its label goes
  // from secondary to primary. Rows had no hover at all.
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <nav
      aria-label="AI Agent Studio"
      style={{
        // Measured: the panel runs 251 and its items 215, inset 12 from the
        // left with the slack falling on the right.
        width: '251px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-050)',
        padding: 'var(--spacing-200) var(--spacing-150)',
        borderInlineEnd: '1px solid var(--color-boundary-border-mildest)',
        overflowY: 'auto'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', padding: 'var(--spacing-100) var(--spacing-150) var(--spacing-300)' }}>
        <Icon name="Ai" size="md" color="var(--color-icon-semantic-highlight)" />
        <span style={{ fontSize: '16px', color: 'var(--color-text-primary)' }}>
          <strong style={{ fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-brand)' }}>AI Agent</strong> Studio
        </span>
      </div>

      {STUDIO_NAV.map((item) =>
        item.children ? (
          <div key={item.id}>
            {/* A rule separates the top item from the Library group. */}
            <div
              style={{
                height: '1px',
                backgroundColor: 'var(--color-boundary-divider)',
                margin: 'var(--spacing-150) var(--spacing-150)'
              }}
            />
            <button
              type="button"
              onClick={() => setLibraryOpen((open) => !open)}
              onMouseEnter={() => setHovered('library')}
              onMouseLeave={() => setHovered(null)}
              style={{
                ...NAV_ROW,
                backgroundColor: hovered === 'library' ? 'var(--color-fill-container)' : 'transparent',
                color: hovered === 'library' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
              }}
              aria-expanded={libraryOpen}
            >
              <Icon name={item.icon} size="md" color="var(--color-icon-secondary)" />
              <span style={{ flex: 1, textAlign: 'start' }}>{item.label}</span>
              <Icon name={libraryOpen ? 'ChevronDown' : 'ChevronRight'} size="sm" color="var(--color-icon-secondary)" />
            </button>
            {libraryOpen &&
              item.children.map((child) => <NavRow key={child.id} item={child} indented />)}
          </div>
        ) : (
          <NavRow key={item.id} item={item} />
        )
      )}
    </nav>
  );
}

function NavRow({ item, indented }: { item: StudioNavItem; indented?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <NavLink
      to={`${BASE}/${item.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={({ isActive }) => ({
        ...NAV_ROW,
        // Measured: children indent to x=115 against the parent's x=77, and
        // run 177 wide against its 215.
        marginInlineStart: indented ? '38px' : 0,
        width: indented ? '177px' : '215px',
        backgroundColor: isActive
          ? 'var(--color-fill-semantic-info-mildest)'
          : hovered
            ? 'var(--color-fill-container)'
            : 'transparent',
        color: isActive
          ? 'var(--color-text-brand)'
          : hovered
            ? 'var(--color-text-primary)'
            : 'var(--color-text-secondary)',
        fontWeight: isActive ? 'var(--font-weight-semi-bold)' : '400',
        textDecoration: 'none'
      })}
    >
      {!indented && <Icon name={item.icon} size="md" color="var(--color-icon-secondary)" />}
      <span>{item.label}</span>
    </NavLink>
  );
}

const NAV_ROW: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-150)',
  height: '40px',
  padding: '0 var(--spacing-150)',
  borderRadius: 'var(--border-radius-medium)',
  border: 'none',
  background: 'transparent',
  fontSize: '14px',
  // Measured: a resting nav label is secondary, going primary on hover.
  color: 'var(--color-text-secondary)',
  cursor: 'pointer',
  width: '215px',
  boxSizing: 'border-box'
};

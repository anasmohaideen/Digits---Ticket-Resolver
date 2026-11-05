import { useState } from 'react';
import { TextButton } from '@freshworks/dew-components';
import {
  AGENTS_LIBRARY_SUBTITLE,
  AGENTS_LIBRARY_TITLE,
  LIBRARY_SCREENS,
  PREBUILT_AGENTS,
  PREBUILT_WORKFLOWS,
  PREBUILT_FUNCTIONS,
  AUTHENTICATION_EMPTY,
  type PrebuiltWorkflow,
  type PrebuiltFunction
} from './aiStudio.data';
import AgentCard from './AgentCard';
import { Search } from '@freshworks/dew-components';
import BrowseActions from './BrowseActions';
// The product's own empty-state illustration, lifted from the live studio —
// all four empty states there use this same 420x200 drawing.
import emptyStateArt from './assets/empty-state.svg';

/**
 * The Library screens.
 *
 * Three of the four share one shape — title, optional subtitle, a strip of
 * tabs carrying counts, then an empty state with two actions — so they are
 * one component driven by data rather than three near-copies. The agents list
 * is the odd one out and reuses the pre-built cards under its own title.
 */
export default function LibraryScreen({ view }: { view: string }) {
  if (view === 'library-agents') {
    return (
      <div style={PAGE}>
        <div>
          <h1 style={TITLE}>{AGENTS_LIBRARY_TITLE}</h1>
          <p style={{ margin: 'var(--spacing-100) 0 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {AGENTS_LIBRARY_SUBTITLE}{' '}
            <a href="#" style={{ color: 'var(--color-text-brand)', fontWeight: 'var(--font-weight-semi-bold)', textDecoration: 'none' }}>
              Learn more
            </a>
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-300)' }}>
          {PREBUILT_AGENTS.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    );
  }

  const screen = LIBRARY_SCREENS[view];
  if (!screen) return null;

  return <LibraryList screen={screen} />;
}

function LibraryList({ screen }: { screen: (typeof LIBRARY_SCREENS)[string] }) {
  const [tab, setTab] = useState(screen.tabs[0].label);
  // Only the pre-built workflows tab has content behind it; everything else
  // in this account is empty, which is what the empty state is for.
  const showWorkflows = tab === 'Pre-built Workflows';
  const showFunctions = tab === 'Pre-built functions';
  const showBrowseActions = tab === 'Browse Actions';
  const showAuthentication = tab === 'Authentication';

  return (
    <div style={PAGE}>
      <header>
        <h1 style={TITLE}>{screen.title}</h1>
        {screen.subtitle && (
          <p style={{ margin: 'var(--spacing-100) 0 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {screen.subtitle}{' '}
            <a href="#" style={{ color: 'var(--color-text-brand)', fontWeight: 'var(--font-weight-semi-bold)', textDecoration: 'none' }}>
              Learn more
            </a>
          </p>
        )}
      </header>

      {/* Tabs carry their counts inline, as the live strip does. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-200)', borderBlockEnd: '1px solid var(--color-boundary-divider)' }}>
        {screen.tabs.map((item) => {
          const active = tab === item.label;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setTab(item.label)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-100)',
                height: '40px',
                padding: '0 var(--spacing-100)',
                border: 'none',
                background: 'transparent',
                borderBlockEnd: `2px solid ${active ? 'var(--color-boundary-brand)' : 'transparent'}`,
                fontSize: '14px',
                fontWeight: active ? 'var(--font-weight-semi-bold)' : 'var(--font-weight-regular)',
                color: active ? 'var(--color-text-brand)' : 'var(--color-text-primary)',
                cursor: 'pointer'
              }}
            >
              {item.label}
              {item.count && (
                <span
                  style={{
                    ...COUNT,
                    backgroundColor: active ? 'var(--color-fill-semantic-info-mildest)' : 'var(--color-fill-container)',
                    color: active ? 'var(--color-text-brand)' : 'var(--color-text-secondary)'
                  }}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
        {screen.headerAction && (
          <span style={{ marginInlineStart: 'auto' }}>
            <TextButton type="button" variant="link" size="mini" suffixIcon="NewTab">
              {screen.headerAction}
            </TextButton>
          </span>
        )}
      </div>

      {showWorkflows ? (
        <WorkflowGrid />
      ) : showFunctions ? (
        <FunctionGrid />
      ) : showBrowseActions ? (
        <BrowseActions />
      ) : showAuthentication ? (
        <AuthenticationEmpty />
      ) : (
      <div style={EMPTY}>
        <img src={emptyStateArt} alt="" width={420} height={200} style={{ marginBlockEnd: 'var(--spacing-300)' }} />
        <h3 style={{ margin: 0, fontSize: '18px', lineHeight: '23px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
          {screen.empty.title}
        </h3>
        <p style={{ margin: 'var(--spacing-100) 0 0', maxWidth: '520px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          {screen.empty.body}
        </p>
        <div style={{ display: 'flex', gap: 'var(--spacing-150)', marginBlockStart: 'var(--spacing-300)' }}>
          {screen.empty.actions.map((action) => (
            <TextButton key={action.label} type="button" variant={action.variant} size="default">
              {action.label}
            </TextButton>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}

/**
 * The fourteen pre-built functions. Cards are 260px on a five-column grid —
 * narrower than the workflow cards, since a function is a title and a line.
 */
function FunctionGrid() {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const visible = PREBUILT_FUNCTIONS.filter(
    (f) => !q || f.title.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-300)' }}>
      <div style={{ width: '332px' }}>
        <Search
          value={query}
          onValueChange={setQuery}
          onClear={() => setQuery('')}
          placeholder="Search"
          aria-label="Search functions"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--spacing-250)' }}>
        {visible.map((fn) => (
          <FunctionCard key={fn.title} fn={fn} />
        ))}
      </div>

      {visible.length === 0 && (
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          No functions match “{query}”.
        </p>
      )}
    </div>
  );
}

function FunctionCard({ fn }: { fn: PrebuiltFunction }) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minHeight: '172px',
        boxSizing: 'border-box',
        padding: 'var(--spacing-250)',
        border: `1px solid ${hovered ? 'var(--color-fill-semantic-info-mild)' : 'var(--color-boundary-border-mildest)'}`,
        borderRadius: 'var(--border-radius-large)',
        backgroundColor: 'var(--color-fill-surface)',
        transition: 'border-color 120ms ease'
      }}
    >
      <h3 style={{ margin: 0, fontSize: '14px', lineHeight: '20px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
        {fn.title}
      </h3>
      <p style={{ margin: 'var(--spacing-150) 0 0', fontSize: '12px', lineHeight: '18px', color: 'var(--color-text-secondary)' }}>
        {fn.description}
      </p>
    </article>
  );
}

/** Authentication is empty on a fresh account — its own state, not the tab's. */
function AuthenticationEmpty() {
  return (
    <div style={EMPTY}>
      <img src={emptyStateArt} alt="" width={420} height={200} />
      <h3 style={{ margin: 'var(--spacing-300) 0 0', fontSize: '18px', lineHeight: '23px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
        {AUTHENTICATION_EMPTY.title}
      </h3>
      <p style={{ margin: 'var(--spacing-100) 0 0', maxWidth: '460px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
        {AUTHENTICATION_EMPTY.body}
      </p>
      <div style={{ marginBlockStart: 'var(--spacing-300)' }}>
        <TextButton type="button" variant="primary" size="default" prefixIcon="CirclePlus">
          {AUTHENTICATION_EMPTY.action}
        </TextButton>
      </div>
    </div>
  );
}

const PAGE: React.CSSProperties = {
  padding: 'var(--spacing-400)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-300)'
};

const TITLE: React.CSSProperties = {
  margin: 0,
  fontSize: '24px',
  lineHeight: '30px',
  fontWeight: 'var(--font-weight-bold)',
  color: 'var(--color-text-primary)'
};

const COUNT: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '20px',
  height: '20px',
  padding: '0 var(--spacing-050)',
  borderRadius: 'var(--border-radius-xsmall)',
  backgroundColor: 'var(--color-fill-container)',
  fontSize: '12px',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text-secondary)'
};

const EMPTY: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  paddingBlock: 'var(--spacing-600)'
};

/**
 * The pre-built workflows grid.
 *
 * Measured: 359px cards on a 379px pitch, four to a row, 12px radius. Each
 * carries a title, a description and the vendor it works through. A "+ Use"
 * action appears on hover — at rest the card is just its text.
 */
function WorkflowGrid() {
  const [query, setQuery] = useState('');
  const visible = PREBUILT_WORKFLOWS.filter((w) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      w.title.toLowerCase().includes(q) ||
      w.description.toLowerCase().includes(q) ||
      w.vendor.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-300)' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '240px' }}>
          <Search
            value={query}
            onValueChange={setQuery}
            onClear={() => setQuery('')}
            placeholder="Search pre-built workflows"
            aria-label="Search pre-built workflows"
          />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(359px, 1fr))',
          gap: 'var(--spacing-250)'
        }}
      >
        {visible.map((workflow) => (
          <WorkflowCard key={workflow.title} workflow={workflow} />
        ))}
      </div>

      {visible.length === 0 && (
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          No pre-built workflows match “{query}”.
        </p>
      )}
    </div>
  );
}

function WorkflowCard({ workflow }: { workflow: PrebuiltWorkflow }) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minHeight: '172px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-150)',
        padding: 'var(--spacing-250)',
        border: '1px solid var(--color-boundary-border-mildest)',
        borderRadius: 'var(--border-radius-large)',
        backgroundColor: 'var(--color-fill-surface)'
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: '14px',
          lineHeight: '20px',
          fontWeight: 'var(--font-weight-semi-bold)',
          color: hovered ? 'var(--color-text-brand)' : 'var(--color-text-primary)'
        }}
      >
        {workflow.title}
      </h3>
      <p style={{ margin: 0, flex: 1, fontSize: '12px', lineHeight: '18px', color: 'var(--color-text-secondary)' }}>
        {workflow.description}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-100)' }}>
        <span title={workflow.vendor} style={VENDOR_TILE}>
          {workflow.vendor.slice(0, 1)}
        </span>
        {hovered && (
          <TextButton type="button" variant="secondary" size="mini" prefixIcon="Plus">
            Use
          </TextButton>
        )}
      </div>
    </article>
  );
}

/** Vendor logos again: Dew carries none of these, so an initial tile stands in. */
const VENDOR_TILE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  borderRadius: 'var(--border-radius-xsmall)',
  border: '1px solid var(--color-boundary-border-mildest)',
  backgroundColor: 'var(--color-fill-container)',
  fontSize: '12px',
  fontWeight: 'var(--font-weight-semi-bold)',
  color: 'var(--color-text-primary)'
};

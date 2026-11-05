import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { IconButton, Search, Tag } from '@freshworks/dew-components';
import { TicketDetailView, type SplitContext } from './TicketDetailOption2';
import {
  EMPTY_DRAFT,
  FilterSidebar,
  SortMenu,
  filterTickets,
  sortTickets,
  type Condition,
  type FilterDraft
} from './Tickets';
import ViewSwitcher from './ViewSwitcher';
import { VIEW_TICKETS, neighbour, splitHref } from './ticketViews';
import { PRIORITY_COLOR, STATE_VARIANT, ticketIdFor } from './tickets.data';
import type { Ticket } from './tickets.data';

/**
 * Tickets · Split view: the list on the left, the ticket beside it.
 *
 *   list     The three tickets, with search, sort and Filters. Picking one
 *            changes the URL (`/tickets/:id?view=split`) without adding a
 *            history entry, so Back still leaves the split view.
 *   ticket   The Option 2 ticket page, unchanged. Previous / Next walk the
 *            list as it is currently filtered and sorted.
 *   right    Properties, Ask AI or Filters: one at a time (see `TicketDetailView`).
 *
 * Each ticket stays mounted once opened and is only hidden when another is
 * selected, so a half-typed reply, an open Ask AI thread and the scroll
 * position are all still there when you come back to it.
 */

const LIST_WIDTH = 320;

function ListRow({
  ticket,
  selected,
  onSelect,
  rowRef
}: {
  ticket: Ticket;
  selected: boolean;
  onSelect: () => void;
  rowRef: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <button
      ref={rowRef}
      type="button"
      role="option"
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-050)',
        width: '100%',
        padding: 'var(--spacing-150) var(--spacing-200)',
        textAlign: 'start',
        font: 'inherit',
        cursor: 'pointer',
        border: 0,
        borderBlockEnd: '1px solid var(--color-boundary-border-mildest)',
        borderInlineStart: `3px solid ${selected ? 'var(--color-boundary-semantic-info)' : 'transparent'}`,
        backgroundColor: selected ? 'var(--color-fill-semantic-info-mildest)' : 'transparent',
        color: 'var(--color-text-primary)'
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', font: 'var(--font-caption-regular)', color: 'var(--color-text-secondary)' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.requester}</span>
        <span aria-hidden>•</span>
        <span style={{ flexShrink: 0 }}>{ticket.code}</span>
      </span>
      <span
        style={{
          font: 'var(--font-body-semibold)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden' }}
      >
        {ticket.subject}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', paddingBlockStart: 'var(--spacing-050)' }}>
        <Tag variant={STATE_VARIANT[ticket.state]}>{ticket.state}</Tag>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-050)', font: 'var(--font-caption-regular)' }}>
          <span aria-hidden style={{ width: '10px', height: '10px', borderRadius: 'var(--border-radius-2xsmall)', backgroundColor: PRIORITY_COLOR[ticket.priority] }} />
          {ticket.priority}
        </span>
      </span>
    </button>
  );
}

export default function TicketsSplit() {
  const { id: routeId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedId = routeId ? ticketIdFor(routeId) ?? routeId : '';

  const [query, setQuery] = useState('');
  const [sortField, setSortField] = useState('Created Date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState<FilterDraft>(EMPTY_DRAFT);
  const [applied, setApplied] = useState<FilterDraft>(EMPTY_DRAFT);
  const [filterMode, setFilterMode] = useState<'basic' | 'advanced'>('basic');
  const [match, setMatch] = useState<'all' | 'any'>('all');
  const [conditions, setConditions] = useState<Condition[]>([]);

  const clearFilters = () => {
    setDraft(EMPTY_DRAFT);
    setApplied(EMPTY_DRAFT);
    setConditions([]);
  };
  const activeFilterCount =
    filterMode === 'advanced'
      ? conditions.length
      : Object.values(applied.facets).reduce((n, list) => n + list.length, 0) +
        Object.values(applied.selects).reduce((n, list) => n + list.length, 0);

  const rows = useMemo(() => {
    const filtered = filterTickets(VIEW_TICKETS, { applied, filterMode, conditions, match });
    const needle = query.trim().toLowerCase();
    const searched = needle
      ? filtered.filter((t) => `${t.subject} ${t.requester} ${t.code}`.toLowerCase().includes(needle))
      : filtered;
    return sortTickets(searched, sortField, sortDir);
  }, [applied, filterMode, conditions, match, query, sortField, sortDir]);
  const ids = useMemo(() => rows.map((t) => t.id), [rows]);

  /* Tickets stay mounted once opened, so each keeps its own drafts and place. */
  const [opened, setOpened] = useState<string[]>(() => (selectedId ? [selectedId] : []));
  useEffect(() => {
    if (selectedId) setOpened((current) => (current.includes(selectedId) ? current : [...current, selectedId]));
  }, [selectedId]);

  const panes = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollMemory = useRef<Record<string, number>>({});
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const listRef = useRef<HTMLDivElement | null>(null);

  const scrollerOf = (id: string) =>
    panes.current[id]?.querySelector<HTMLElement>('[data-ticket-conversation-scroller]') ?? null;

  const select = (next: string) => {
    if (next === selectedId) return;
    const scroller = scrollerOf(selectedId);
    if (scroller) scrollMemory.current[selectedId] = scroller.scrollTop;
    const params = new URLSearchParams(searchParams);
    const [path] = splitHref(next).split('?');
    params.set('view', 'split');
    navigate(`${path}?${params.toString()}`, { replace: true });
  };

  /* Bring back where the newly shown ticket was scrolled to. */
  useLayoutEffect(() => {
    const saved = scrollMemory.current[selectedId];
    const scroller = scrollerOf(selectedId);
    if (saved !== undefined && scroller) scroller.scrollTop = saved;
  }, [selectedId]);

  /* Arrow keys move through the list; the ticket follows. */
  const onListKeyDown = (event: React.KeyboardEvent) => {
    const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
    if (!step && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const next = step ? neighbour(ids, selectedId, step) : event.key === 'Home' ? ids[0] : ids[ids.length - 1];
    if (!next) return;
    select(next);
    requestAnimationFrame(() => rowRefs.current[next]?.focus());
  };

  const filterPane = (
    <FilterSidebar
      draft={draft}
      onDraftChange={setDraft}
      onApply={() => setApplied(draft)}
      activeCount={activeFilterCount}
      mode={filterMode}
      onModeChange={setFilterMode}
      match={match}
      onMatchChange={setMatch}
      conditions={conditions}
      onConditionsChange={setConditions}
      onClear={clearFilters}
    />
  );

  /* A code in the address becomes the ticket's id, as the full page does. */
  if (routeId && selectedId !== routeId) {
    const query = searchParams.toString();
    return <Navigate to={`/freshservice/tickets/${selectedId}${query ? `?${query}` : ''}`} replace />;
  }

  const contextFor = (id: string): SplitContext => ({
    previous: neighbour(ids, id, -1),
    next: neighbour(ids, id, 1),
    onNavigate: select,
    filtersOpen,
    onFiltersOpenChange: setFiltersOpen
  });

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0, minHeight: 0 }}>
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-150)',
          flexShrink: 0,
          padding: 'var(--spacing-300) var(--spacing-300) var(--spacing-200)',
          borderBlockEnd: '1px solid var(--color-boundary-border-mildest)'
        }}
      >
        <ViewSwitcher current="split" ticketId={selectedId} />
        <SortMenu
          field={sortField}
          direction={sortDir}
          onChange={(field, direction) => {
            setSortField(field);
            setSortDir(direction);
          }}
        />
        <span style={{ flex: 1 }} />
        <span style={{ font: 'var(--font-body)', color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
          {rows.length} of {VIEW_TICKETS.length}
        </span>
        <IconButton
          iconName="Filter"
          size="default"
          active={filtersOpen}
          aria-pressed={filtersOpen}
          aria-label={activeFilterCount > 0 ? `Filters (${activeFilterCount} applied)` : 'Filters'}
          onClick={() => setFiltersOpen((open) => !open)}
        />
      </header>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <section
          aria-label="Tickets"
          style={{
            width: `${LIST_WIDTH}px`,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            backgroundColor: 'var(--color-fill-surface)',
            borderInlineEnd: '1px solid var(--color-boundary-border-mildest)'
          }}
        >
          <div style={{ padding: 'var(--spacing-150) var(--spacing-200)' }}>
            <Search placeholder="Search" value={query} onValueChange={(next: string) => setQuery(next ?? '')} />
          </div>
          <div
            ref={listRef}
            role="listbox"
            aria-label="Tickets"
            onKeyDown={onListKeyDown}
            style={{ flex: 1, minHeight: 0, overflowY: 'auto', borderBlockStart: '1px solid var(--color-boundary-border-mildest)' }}
          >
            {rows.map((ticket) => (
              <ListRow
                key={ticket.id}
                ticket={ticket}
                selected={ticket.id === selectedId}
                onSelect={() => select(ticket.id)}
                rowRef={(el) => { rowRefs.current[ticket.id] = el; }}
              />
            ))}
            {rows.length === 0 && (
              <p style={{ margin: 0, padding: 'var(--spacing-300)', font: 'var(--font-body)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                No tickets match.
              </p>
            )}
          </div>
        </section>

        <div style={{ position: 'relative', display: 'flex', flex: 1, minWidth: 0, minHeight: 0 }}>
          {opened.map((id) => (
            <div
              key={id}
              ref={(el) => { panes.current[id] = el; }}
              hidden={id !== selectedId}
              style={{ display: id === selectedId ? 'flex' : 'none', flex: 1, minWidth: 0, minHeight: 0, flexDirection: 'column' }}
            >
              <TicketDetailView ticketId={id} split={contextFor(id)} />
            </div>
          ))}
        </div>
      </div>
    </div>
    {/* The full height of the workspace, beside the toolbar as well as the ticket. */}
    {filtersOpen && filterPane}
    </div>
  );
}

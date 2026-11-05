import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Menu, Tag, TextButton } from '@freshworks/dew-components';
import ViewControls from './ViewControls';
import ViewSwitcher from './ViewSwitcher';
import { VIEW_TICKETS, detailHref } from './ticketViews';
import { AGENTS, PRIORITIES, PRIORITY_COLOR, STATE_VARIANT, STATUSES, initials } from './tickets.data';
import type { Ticket } from './tickets.data';

/**
 * Tickets · Board view.
 *
 * The same three tickets as the table, as columns. "Group by" regroups the
 * columns by status, priority or assignee. A card opens the ticket's full
 * page, exactly as a table row does. Cards are read-only for now.
 */

type GroupBy = 'Status' | 'Priority' | 'Assignee';
const GROUP_OPTIONS: GroupBy[] = ['Status', 'Priority', 'Assignee'];

interface Column {
  id: string;
  label: string;
  dot: string;
}

const STATUS_DOT: Record<string, string> = {
  Open: 'var(--color-icon-semantic-info)',
  Pending: 'var(--color-icon-semantic-warning)',
  Resolved: 'var(--color-icon-semantic-success)',
  Closed: 'var(--color-icon-secondary)'
};

const GROUPINGS: Record<GroupBy, { columns: Column[]; key: (t: Ticket) => string }> = {
  Status: {
    columns: STATUSES.map((s) => ({ id: s, label: s, dot: STATUS_DOT[s] })),
    key: (t) => t.status
  },
  Priority: {
    columns: [...PRIORITIES].reverse().map((p) => ({ id: p, label: p, dot: PRIORITY_COLOR[p] })),
    key: (t) => t.priority
  },
  Assignee: {
    columns: [
      ...AGENTS.filter((a) => a !== 'None').map((a): Column => ({ id: a, label: a, dot: 'var(--color-icon-secondary)' })),
      { id: 'None', label: 'Unassigned', dot: 'var(--color-icon-secondary)' }
    ],
    key: (t) => t.assignee
  }
};

function BoardCard({ ticket }: { ticket: Ticket }) {
  return (
    <Link
      to={detailHref(ticket.id)}
      aria-label={`${ticket.code}, ${ticket.subject}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-150)',
        padding: 'var(--spacing-200)',
        textDecoration: 'none',
        color: 'inherit',
        backgroundColor: 'var(--color-fill-surface)',
        border: '1px solid var(--color-boundary-border-mildest)',
        borderRadius: 'var(--border-radius-large)',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', font: 'var(--font-caption-regular)', color: 'var(--color-text-secondary)' }}>
        <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{ticket.code}</span>
        <span aria-hidden>•</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.requester}</span>
      </div>
      <h3 style={{ margin: 0, font: 'var(--font-body-semibold)', color: 'var(--color-text-primary)' }}>
        {ticket.subject}
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', flexWrap: 'wrap' }}>
        <Tag variant={STATE_VARIANT[ticket.state]}>{ticket.state}</Tag>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-050)', font: 'var(--font-caption-regular)', color: 'var(--color-text-primary)' }}>
          <span aria-hidden style={{ width: '10px', height: '10px', borderRadius: 'var(--border-radius-2xsmall)', backgroundColor: PRIORITY_COLOR[ticket.priority] }} />
          {ticket.priority}
        </span>
        <span style={{ flex: 1 }} />
        {ticket.assignee !== 'None' ? (
          <Avatar size="sm" initials={initials(ticket.assignee)} name={ticket.assignee} />
        ) : (
          <span style={{ font: 'var(--font-caption-regular)', color: 'var(--color-text-secondary)' }}>Unassigned</span>
        )}
      </div>
    </Link>
  );
}

export default function TicketsBoard() {
  const [groupBy, setGroupBy] = useState<GroupBy>('Status');
  const grouping = GROUPINGS[groupBy];
  const columns = useMemo(
    () => grouping.columns.map((column) => ({ ...column, items: VIEW_TICKETS.filter((t) => grouping.key(t) === column.id) })),
    [grouping]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0, padding: 'var(--spacing-300)', gap: 'var(--spacing-200)' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-150)' }}>
        <ViewSwitcher current="board" />
        <Menu
          aria-label="Group tickets"
          options={GROUP_OPTIONS.map((g) => ({ value: g, label: g }))}
          onClick={(option) => setGroupBy(option.value as GroupBy)}
          slots={{
            trigger: (
              <TextButton type="button" variant="link" size="default" suffixIcon="ChevronDown">
                {`Group by: ${groupBy}`}
              </TextButton>
            )
          }}
        />
      </header>

      <div
        role="list"
        aria-label={`Tickets grouped by ${groupBy.toLowerCase()}`}
        style={{ display: 'flex', flex: 1, minHeight: 0, gap: 'var(--spacing-200)', overflowX: 'auto' }}
      >
        {columns.map((column) => (
          <section
            key={column.id}
            role="listitem"
            aria-label={`${column.label}, ${column.items.length}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 0 280px',
              maxWidth: '360px',
              minHeight: 0,
              gap: 'var(--spacing-150)',
              padding: 'var(--spacing-150)',
              backgroundColor: 'var(--color-fill-container)',
              borderRadius: 'var(--border-radius-large)'
            }}
          >
            <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', padding: 'var(--spacing-050) var(--spacing-050)' }}>
              <span aria-hidden style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: column.dot }} />
              <h2 style={{ margin: 0, font: 'var(--font-body-semibold)', color: 'var(--color-text-primary)' }}>{column.label}</h2>
              <span style={{ font: 'var(--font-caption-regular)', color: 'var(--color-text-secondary)' }}>{column.items.length}</span>
            </header>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-100)', overflowY: 'auto' }}>
              {column.items.map((ticket) => <BoardCard key={ticket.id} ticket={ticket} />)}
              {column.items.length === 0 && (
                <p style={{ margin: 0, padding: 'var(--spacing-200)', font: 'var(--font-caption-regular)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  No tickets
                </p>
              )}
            </div>
          </section>
        ))}
      </div>
      <ViewControls />
    </div>
  );
}

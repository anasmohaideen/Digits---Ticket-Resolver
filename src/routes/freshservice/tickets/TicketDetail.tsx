import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { Avatar, Icon, IconButton, Menu, Select, TextButton } from '@freshworks/dew-components';
import slackLogo from './assets/slack-logo.svg';
import DetailsTab, { type DetailsTabHandle } from './details/DetailsTab';
import SentimentPill from './details/SentimentPill';
import { findDetailsFixture, findDetailsTicket } from './details/fixtures';
import { REVIEW_STATES, type ReviewState } from './details/types';
import { INCIDENT_DATES } from './details/incidentDates';
import { dateAndTime } from './details/format';
import { relativeAgo } from './details/option2/relativeTime';
import {
  AGENTS,
  DEPARTMENTS,
  GROUPS,
  LEVELS,
  PRIORITIES,
  SOURCES,
  TICKET_TYPES,
  PRIORITY_COLOR,
  STATUSES,
  TICKETS,
  ticketIdFor,
  initials
} from './tickets.data';
import type {
  Agent,
  Department,
  Group,
  Level,
  Priority,
  Source,
  Status,
  Ticket,
  TicketType
} from './tickets.data';

/**
 * Ticket detail.
 *
 * Structure measured from the live product rather than assumed:
 *
 *   quick actions   58px band, pad 11/32, state badge and viewers left,
 *                   32px icon buttons right, bottom divider
 *   subject block   48x48 module icon tinted by PRIORITY, h3 at 16/20 600,
 *                   then requester · reported time · source on one line
 *   tabs            42px, active tab = brand label over a 2px brand underline
 *                   the full width of the tab, not a pill
 *   sidebar         366px of 319px cards, radius 12, shadow-xs; the card in
 *                   focus takes an info-mild border, the rest are borderless
 *
 * Note the top bar switches to a BREADCRUMB here (Tickets > #INC-5) rather
 * than the list's title + saved-view form.
 */

/**
 * All nine, in the product's order. The first pass stopped at Associations,
 * which is where the row happens to wrap on a narrow window — the four after
 * it are real tabs, not overflow.
 */
const TABS = [
  'Details',
  'Related tickets',
  'Tasks',
  'Assets',
  'Associations',
  'Impacted services',
  'Responders',
  'Activity',
  'Resolution'
] as const;

const CARD: React.CSSProperties = {
  padding: 'var(--spacing-200)',
  backgroundColor: 'var(--color-fill-surface)',
  borderRadius: 'var(--border-radius-large)',
  boxShadow: 'var(--shadow-xs)',
  border: '1px solid transparent'
};

const LABEL: React.CSSProperties = {
  fontSize: '12px',
  lineHeight: '20px',
  fontWeight: 'var(--font-weight-medium)',
  color: 'var(--color-text-secondary)'
};

const VALUE: React.CSSProperties = {
  fontSize: '12px',
  lineHeight: '20px',
  fontWeight: 'var(--font-weight-semi-bold)',
  color: 'var(--color-text-primary)'
};

function PropRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 'var(--spacing-100)' }}>{children}</div>;
}

function PropField({
  label,
  required,
  children
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-050)', marginBlockEnd: 'var(--spacing-200)' }}>
      <span style={LABEL}>
        {label}
        {required && <span style={{ color: 'var(--color-text-semantic-error)' }}> *</span>}
      </span>
      {children}
    </label>
  );
}

/**
 * The widget rail down the right edge — 48px, measured, holding one entry per
 * sidebar card. "Time entries" is listed here even though the card itself is
 * not built because it remains part of the ticket's widget navigation.
 */
const WIDGETS = [
  { id: 'summary', label: 'Summary', icon: 'CircleInfo' },
  { id: 'requester', label: 'Requester information', icon: 'LeftNavBar/User' },
  { id: 'properties', label: 'Properties', icon: 'Note' },
  { id: 'time', label: 'Time entries', icon: 'Timer' }
] as const;

const TAB_LIST_HEIGHT = '42px';

/**
 * Keep every representation of the requester on the same deterministic avatar.
 * Dew otherwise chooses a random colour for each Avatar mount, so the header
 * and requester card can disagree even when their name and initials match.
 */
function RequesterAvatar({ ticket, style }: { ticket: Ticket; style?: React.CSSProperties }) {
  return (
    <Avatar
      name={ticket.requester}
      imageUrl={ticket.requesterAvatarUrl}
      initials={initials(ticket.requester)}
      shape="round"
      colorVariant="default"
      style={style}
    />
  );
}

function tabButtonStyle(active: boolean): React.CSSProperties {
  return {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-050)',
    height: '100%',
    padding: '0 var(--spacing-100)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'var(--font-weight-medium)',
    whiteSpace: 'nowrap',
    color: active ? 'var(--color-text-brand)' : 'var(--color-text-secondary)'
  };
}

/** The active underline sits flush with the tablist's own bottom border. */
function TabUnderline({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        insetInline: 0,
        bottom: 0,
        height: '2px',
        borderRadius: 'var(--border-radius-xsmall)',
        backgroundColor: active ? 'var(--color-fill-brand)' : 'transparent'
      }}
    />
  );
}

function TabButton({ name, active, onClick }: { name: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" role="tab" aria-selected={active} onClick={onClick} style={tabButtonStyle(active)}>
      {name}
      <TabUnderline active={active} />
    </button>
  );
}

/**
 * Horizontal tab strip that collapses whatever doesn't fit into a trailing
 * "More" menu instead of wrapping labels or scrolling — matching the
 * product, which never does either. Widths are measured off a hidden,
 * off-screen copy of the same buttons so the visible row never flashes.
 */
function TicketTabs<T extends string>({
  tabs,
  active,
  onChange
}: {
  tabs: readonly T[];
  active: T;
  onChange: (tab: T) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const moreMeasureRef = useRef<HTMLButtonElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(tabs.length);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const recalc = () => {
      const available = container.clientWidth;
      const gap = parseFloat(getComputedStyle(container).columnGap || '0') || 0;
      const moreWidth = moreMeasureRef.current?.getBoundingClientRect().width ?? 0;

      let total = 0;
      let count = 0;
      for (let i = 0; i < tabs.length; i++) {
        const width = measureRefs.current[i]?.getBoundingClientRect().width ?? 0;
        const withTab = total + (count > 0 ? gap : 0) + width;
        const hasMore = count + 1 < tabs.length;
        const reserve = hasMore ? gap + moreWidth : 0;
        if (count > 0 && withTab + reserve > available) break;
        total = withTab;
        count++;
      }
      setVisibleCount(Math.max(count, 1));
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(container);
    return () => observer.disconnect();
  }, [tabs]);

  const visibleTabs = tabs.slice(0, visibleCount);
  const overflowTabs = tabs.slice(visibleCount);
  const activeInOverflow = overflowTabs.includes(active);

  return (
    <div
      role="tablist"
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
        flexShrink: 0,
        gap: 'var(--spacing-200)',
        padding: '0 var(--spacing-400)',
        height: TAB_LIST_HEIGHT,
        borderBlockEnd: '1px solid var(--color-boundary-border-mildest)',
        overflow: 'hidden'
      }}
    >
      {/* Hidden measuring layer — same buttons, off-screen, used only to read widths. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
          display: 'flex',
          gap: 'var(--spacing-200)',
          height: TAB_LIST_HEIGHT
        }}
      >
        {tabs.map((name, i) => (
          <button
            key={name}
            ref={(el) => { measureRefs.current[i] = el; }}
            type="button"
            tabIndex={-1}
            style={tabButtonStyle(false)}
          >
            {name}
          </button>
        ))}
        <button ref={moreMeasureRef} type="button" tabIndex={-1} style={tabButtonStyle(false)}>
          More
          <Icon name="ChevronDown" size="sm" />
        </button>
      </div>

      {visibleTabs.map((name) => (
        <TabButton key={name} name={name} active={active === name} onClick={() => onChange(name)} />
      ))}

      {overflowTabs.length > 0 && (
        <Menu
          aria-label="More tabs"
          onClick={(option) => onChange(option.value as T)}
          options={overflowTabs.map((name) => ({ value: name, label: name }))}
          slots={{
            trigger: (
              <button type="button" role="tab" aria-selected={activeInOverflow} style={tabButtonStyle(activeInOverflow)}>
                More
                <Icon name="ChevronDown" size="sm" />
                <TabUnderline active={activeInOverflow} />
              </button>
            )
          }}
        />
      )}
    </div>
  );
}

const PROP_INPUT: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: 'var(--spacing-100) var(--spacing-150)',
  border: '1px solid var(--color-boundary-border-mildest)',
  borderRadius: 'var(--border-radius-small)',
  fontSize: '14px',
  color: 'var(--color-text-primary)',
  backgroundColor: 'var(--color-fill-surface)'
};

function SlaRow({
  label,
  due,
  editable,
  topSpacing = false
}: {
  label: string;
  due: string;
  /** Resolution due can be rescheduled in the product; first response cannot. */
  editable?: boolean;
  topSpacing?: boolean;
}) {
  return (
    <div style={{ paddingBlockStart: topSpacing ? 'var(--spacing-100)' : 0 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ ...LABEL, display: 'flex', alignItems: 'center', gap: 'var(--spacing-050)' }}>
          {label}
          {editable && (
            <IconButton iconName="Edit" aria-label={`Edit ${label.toLowerCase()}`} size="mini" />
          )}
        </div>
        <div style={VALUE}>{due}</div>
      </div>
    </div>
  );
}

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const found = TICKETS.find((t) => t.id === id || t.code === id) ?? findDetailsTicket(id);
  const [ticket, setTicket] = useState<Ticket | undefined>(found);
  const [tab, setTab] = useState<(typeof TABS)[number]>('Details');
  const [propsOpen, setPropsOpen] = useState(true);
  const [activeWidget, setActiveWidget] = useState<string>('summary');
  const widgetRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /* Demo-only replay control (INC-4127), triggered from the widget rail
     rather than a header button so it doesn't read as part of the product. */
  const detailsTabRef = useRef<DetailsTabHandle | null>(null);
  const [replayPlaying, setReplayPlaying] = useState(false);

  const canonicalId = id ? ticketIdFor(id) : undefined;
  if (canonicalId && canonicalId !== id) {
    const query = searchParams.toString();
    return <Navigate to={`/freshservice/tickets/${canonicalId}${query ? `?${query}` : ''}`} replace />;
  }

  if (!ticket) {
    return (
      <div style={{ padding: 'var(--spacing-600)', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>No such ticket.</p>
        <Link to="/freshservice/tickets" style={{ color: 'var(--color-text-brand)' }}>
          Back to tickets
        </Link>
      </div>
    );
  }

  /* Ticket Resolver's Details tab, when there is a fixture for this ticket.
     `?state=` picks which of the three review states to render. */
  const detailsTab = findDetailsFixture(ticket.code);
  const stateParam = searchParams.get('state');
  const reviewState: ReviewState = REVIEW_STATES.includes(stateParam as ReviewState)
    ? (stateParam as ReviewState)
    : 'landing';

  const patch = (changes: Partial<Ticket>) => setTicket((t) => (t ? { ...t, ...changes } : t));
  const opts = <T extends string>(values: readonly T[]) => values.map((v) => ({ value: v, label: v }));

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0, minHeight: 0, flexDirection: 'column' }}>
      {/* Quick actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flexShrink: 0,
          padding: 'var(--spacing-200) var(--spacing-200) var(--spacing-200) var(--spacing-400)',
          borderBlockEnd: '1px solid var(--color-boundary-border-mildest)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)' }}>
          <IconButton iconName="Actions/Star" aria-label="Add to favourites" size="default" withBackground />
          <Menu
            aria-label="Share"
            onClick={() => {}}
            options={[
              { value: 'link', label: 'Copy link' },
              { value: 'email', label: 'Share via email' }
            ]}
            slots={{
              trigger: (
                <TextButton type="button" variant="secondary" size="default" suffixIcon="ChevronDown">
                  Share
                </TextButton>
              )
            }}
          />
          <TextButton type="button" variant="secondary" size="default" aria-label="Edit ticket">
            Edit
          </TextButton>
          <Menu
            aria-label="Conversations"
            onClick={() => {}}
            options={[
              { value: 'reply', label: 'Reply' },
              { value: 'forward', label: 'Forward' },
              { value: 'note', label: 'Add note' }
            ]}
            slots={{
              trigger: (
                <TextButton type="button" variant="secondary" size="default" suffixIcon="ChevronDown">
                  Reply
                </TextButton>
              )
            }}
          />
          <Menu
            aria-label="Associate"
            onClick={() => {}}
            options={[
              { value: 'change', label: 'Change' },
              { value: 'problem', label: 'Problem' },
              { value: 'asset', label: 'Asset' }
            ]}
            slots={{
              trigger: (
                <TextButton type="button" variant="secondary" size="default" suffixIcon="ChevronDown">
                  Associate
                </TextButton>
              )
            }}
          />
          <TextButton type="button" variant="secondary" size="default" onClick={() => patch({ status: 'Closed' })}>
            Close
          </TextButton>
          <IconButton iconName="MoreHorizontal" aria-label="More button" size="default" withBackground />
          <IconButton iconName="ChevronLeft" aria-label="Previous ticket" size="default" withBackground />
          <IconButton iconName="ChevronRight" aria-label="Next ticket" size="default" withBackground />
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Conversation column */}
        <div data-ticket-conversation-scroller style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '48px minmax(0, 1fr)', alignItems: 'center', columnGap: 'var(--spacing-200)', padding: 'var(--spacing-250) var(--spacing-400) var(--spacing-150)' }}>
            {/* Requester's avatar, with the channel the ticket came in on
                badged onto its bottom-right corner — ring cut from the
                surface colour so the badge reads as sitting on top. */}
            <span style={{ position: 'relative', display: 'inline-flex', alignSelf: 'center', flexShrink: 0 }}>
              <RequesterAvatar ticket={ticket} style={{ width: '48px', height: '48px' }} />
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  insetBlockEnd: '-2px',
                  insetInlineEnd: '-2px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  border: '2px solid var(--color-fill-surface)',
                  backgroundColor: 'var(--color-fill-surface)'
                }}
              >
                <img src={slackLogo} alt="" width={16} height={16} />
              </span>
            </span>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: '16px', lineHeight: '20px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
                {ticket.subject}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-050)', paddingBlockStart: '6px', fontSize: '12px', flexWrap: 'wrap' }}>
                <a href="#" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-brand)', textDecoration: 'none' }}>
                  {ticket.requester}
                </a>
                <span style={{ color: 'var(--color-text-secondary)' }}>reported {relativeAgo(INCIDENT_DATES.reportedAt)} ({dateAndTime(INCIDENT_DATES.reportedAt)})</span>
              </div>
            </div>
            {ticket.type === 'Incident' && <div style={{ gridColumn: 2 }}><SentimentPill code={ticket.code} subject={ticket.subject} /></div>}
          </div>

          {/* Tabs — active is a brand label over a 2px brand underline, flush
              with the strip's own bottom border. Overflow collapses into a
              "More" menu instead of scrolling or wrapping labels. */}
          <TicketTabs tabs={TABS} active={tab} onChange={setTab} />

          {/* The Details tab's content. Tickets with no Ticket Resolver
              fixture render exactly as they did before — nothing. */}
          {tab === 'Details' ? (
            detailsTab && (
              <DetailsTab
                key={reviewState}
                ref={detailsTabRef}
                tab={detailsTab}
                ticketType={ticket.type}
                reviewState={reviewState}
                onPlayingChange={setReplayPlaying}
              />
            )
          ) : (
            <div style={{ padding: 'var(--spacing-400)' }}>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                {tab} — not built in this prototype.
              </p>
            </div>
          )}
        </div>

        {/* Widget sidebar */}
        <aside
          style={{
            width: '366px',
            flexShrink: 0,
            overflowY: 'auto',
            padding: 'var(--spacing-200)',
            // Measured on the live sidebar: #f6f7f8, which is fill-container.
            // fill-base is #e6e6e6 — a full step darker, and it made the whole
            // column read grey against the product's near-white.
            backgroundColor: 'var(--color-fill-container)',
            borderInlineStart: '1px solid var(--color-boundary-border-mildest)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-100)'
          }}
        >
          <div
            ref={(el) => { widgetRefs.current.summary = el; }}
            style={{ ...CARD, borderColor: 'var(--color-boundary-semantic-info-mild)' }}
          >
            <div style={{ marginBlockEnd: 'var(--spacing-100)', fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>
              {ticket.status}
            </div>
            <div style={{ marginBlockEnd: 'var(--spacing-150)' }}>
              <div style={LABEL}>Priority</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-050)' }}>
                <span aria-hidden style={{ width: '10px', height: '10px', borderRadius: 'var(--border-radius-2xsmall)', backgroundColor: PRIORITY_COLOR[ticket.priority] }} />
                <span style={VALUE}>{ticket.priority}</span>
              </div>
            </div>
            <SlaRow label="First response due" due={INCIDENT_DATES.firstResponseDue} />
            <SlaRow label="Resolution due" due={INCIDENT_DATES.resolutionDue} editable topSpacing />
          </div>

          <div ref={(el) => { widgetRefs.current.requester = el; }} style={CARD}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', marginBlockEnd: 'var(--spacing-150)', fontSize: '14px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
              <Icon name="User" size="sm" />
              Requester information
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-100)' }}>
              <RequesterAvatar ticket={ticket} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-050)' }}>
                <a href="#" style={{ fontSize: '14px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-brand)', textDecoration: 'none' }}>
                  {ticket.requester}
                </a>
                {ticket.requesterTitle && (
                  <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--color-text-secondary)' }}>
                    {ticket.requesterTitle}
                  </span>
                )}
                <TextButton type="button" variant="link" size="mini" style={{ alignSelf: 'flex-start', padding: 0 }}>
                  View more details
                </TextButton>
              </div>
            </div>
          </div>

          <div ref={(el) => { widgetRefs.current.properties = el; }} style={CARD}>
            {/* Header carries an icon and a collapse chevron in the product. */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-100)',
                marginBlockEnd: 'var(--spacing-150)'
              }}
            >
              <Icon name="Note" size="sm" color="var(--color-icon-secondary)" />
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
                Properties
              </span>
              <IconButton
                iconName={propsOpen ? 'ChevronUp' : 'ChevronDown'}
                aria-label={propsOpen ? 'Collapse properties' : 'Expand properties'}
                size="mini"
                onClick={() => setPropsOpen((open) => !open)}
              />
            </div>

            {propsOpen && (
              <>
                <PropRow>
                  <PropField label="Priority" required>
                    <Select
                      aria-label="Ticket priority"
                      options={opts(PRIORITIES)}
                      value={{ value: ticket.priority, label: ticket.priority }}
                      onValueChange={(next) => next && patch({ priority: next.value as Priority })}
                    />
                  </PropField>
                  <PropField label="Status" required>
                    <Select
                      aria-label="Ticket status"
                      options={opts(STATUSES)}
                      value={{ value: ticket.status, label: ticket.status }}
                      onValueChange={(next) => next && patch({ status: next.value as Status })}
                    />
                  </PropField>
                </PropRow>

                <PropRow>
                  <PropField label="Source">
                    <Select
                      aria-label="Source"
                      options={opts(SOURCES)}
                      value={{ value: ticket.source, label: ticket.source }}
                      onValueChange={(next) => next && patch({ source: next.value as Source })}
                    />
                  </PropField>
                  <PropField label="Type">
                    <Select
                      aria-label="Type"
                      options={opts(TICKET_TYPES)}
                      value={{ value: ticket.type, label: ticket.type }}
                      onValueChange={(next) => next && patch({ type: next.value as TicketType })}
                    />
                  </PropField>
                </PropRow>

                <PropRow>
                  <PropField label="Urgency">
                    <Select
                      aria-label="Urgency"
                      options={opts(LEVELS)}
                      value={{ value: ticket.urgency, label: ticket.urgency }}
                      onValueChange={(next) => next && patch({ urgency: next.value as Level })}
                    />
                  </PropField>
                  <PropField label="Impact">
                    <Select
                      aria-label="Impact"
                      options={opts(LEVELS)}
                      value={{ value: ticket.impact, label: ticket.impact }}
                      onValueChange={(next) => next && patch({ impact: next.value as Level })}
                    />
                  </PropField>
                </PropRow>

                <PropRow>
                  <PropField label="Group">
                    <Select
                      aria-label="Group"
                      options={opts(GROUPS)}
                      value={{ value: ticket.group, label: ticket.group }}
                      onValueChange={(next) => next && patch({ group: next.value as Group })}
                    />
                  </PropField>
                  {/* "Agent" here, not the list's "Assigned to". */}
                  <PropField label="Agent">
                    <Select
                      aria-label="Ticket agent"
                      options={opts(AGENTS)}
                      value={{ value: ticket.assignee, label: ticket.assignee }}
                      onValueChange={(next) => next && patch({ assignee: next.value as Agent })}
                    />
                  </PropField>
                </PropRow>

                <PropRow>
                  <PropField label="Department">
                    <Select
                      aria-label="Department"
                      options={opts(DEPARTMENTS)}
                      value={{ value: ticket.department, label: ticket.department }}
                      onValueChange={(next) => next && patch({ department: next.value as Department })}
                    />
                  </PropField>
                  {/* Unset on the live ticket too, so it renders empty. */}
                  <PropField label="Category">
                    <Select aria-label="Category" options={[]} placeholder="--" value={null} onValueChange={() => {}} />
                  </PropField>
                </PropRow>

                <PropField label="Planned Start Date">
                  <input style={PROP_INPUT} placeholder="DD-MM-YYYY" aria-label="Planned Start Date" />
                </PropField>
                <PropField label="Planned End Date">
                  <input style={PROP_INPUT} placeholder="DD-MM-YYYY" aria-label="Planned End Date" />
                </PropField>
                <PropField label="Planned Effort">
                  <input style={PROP_INPUT} placeholder="Eg: 1h 10m" aria-label="Planned Effort" />
                </PropField>
                <PropField label="Tags">
                  <input style={PROP_INPUT} placeholder="Search" aria-label="Tags" />
                </PropField>

                <TextButton type="button" variant="primary" style={{ width: '100%' }}>
                  Update
                </TextButton>
              </>
            )}
          </div>
        </aside>

        {/* Widget rail */}
        <nav
          aria-label="Ticket widgets"
          style={{
            width: '48px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--spacing-100)',
            paddingBlock: 'var(--spacing-200)',
            // The rail sits on surface, not on the sidebar's fill.
            backgroundColor: 'var(--color-fill-surface)'
          }}
        >
          {WIDGETS.map((widget) => (
            <IconButton
              key={widget.id}
              iconName={widget.icon}
              aria-label={widget.label}
              size="default"
              active={activeWidget === widget.id}
              onClick={() => {
                setActiveWidget(widget.id);
                widgetRefs.current[widget.id]?.scrollIntoView({ block: 'start', behavior: 'smooth' });
              }}
            />
          ))}

          {/* Demo-only replay control, pinned to the bottom of this rail
              rather than living as a CTA inside the conversation thread. */}
          {tab === 'Details' && detailsTab && ticket.code === 'INC-4127' && (
            <IconButton
              iconName={replayPlaying ? 'Actions/Stop' : 'Actions/Play'}
              aria-label={replayPlaying ? 'Stop replay' : 'Replay live'}
              size="default"
              style={{ marginBlockStart: 'auto' }}
              onClick={() => detailsTabRef.current?.toggleReplay()}
            />
          )}
        </nav>
      </div>
    </div>
  );
}

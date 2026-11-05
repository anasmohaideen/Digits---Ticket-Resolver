import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { Avatar, HorizontalTabs, Icon, IconButton, Menu, Select, TextButton, TextField } from '@freshworks/dew-components';
import slackLogo from './assets/slack-logo.svg';
import SentimentPill from './details/SentimentPill';
import DetailsTabOption2, { STICKY_TABS_HEIGHT } from './details/option2/DetailsTabOption2';
import AskAiPanel from './details/option2/AskAiPanel';
import { copilotBus } from './details/option2/copilotBus';
import { CopilotPanel, useCopilotPanel } from '../../../dewai';
import { PrimaryButton } from '../../../dewai';
import useAskAi from './details/option2/useAskAi';
import ReviewControls from './details/option2/ReviewControls';
import type { InternalStyle } from './details/option2/ResponseCard';
import { hasScenarioData, parseScenario, type ScenarioId } from './details/option2/scenarios';
import { findDetailsFixture, findDetailsTicket } from './details/fixtures';
import { REVIEW_STATES, type ReviewState } from './details/types';
import { INCIDENT_DATES } from './details/incidentDates';
import { STAGE_TICKETS, applyBlockerToTab, applyStageToTab, parseStage, stagesFor } from './details/option2/stages';
import { dateAndTime } from './details/format';
import { TabNavigationContext } from './details/tabNavigation';
import RelatedTicketsTab from './details/option2/RelatedTicketsTab';
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
 * Ticket detail — OPTION 2 (exploration).
 *
 * A clone of `TicketDetail.tsx` whose Details tab is
 * `details/option2/DetailsTabOption2`. Option 1 is the first preference and is
 * untouched; this exists so the two can be opened side by side at
 * `/freshservice/tickets/:id`, the route it now answers at.
 *
 * Changes to the cloned chrome, from the 21 Oct design review:
 *
 *   controls    A floating button, bottom right, holds the prototype's own
 *               controls: the scenario (S1–S4, `?scenario=`), the internal-
 *               message treatment (`?internal=`).
 *   sticky      The tabs stay pinned; once the subject scrolls away it moves
 *               into the header bar.
 *   side pane   As in production, two header buttons at the far right: AI
 *               gives the whole side pane to Ask AI, collapse hides it. With
 *               both closed the conversation takes the full width, its content
 *               capped at 1080px and centred.
 *
 * Everything else below this line is Option 1's chrome, verbatim.
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
  font: 'var(--font-caption-medium)',
  color: 'var(--color-text-secondary)'};

const VALUE: React.CSSProperties = {
  font: 'var(--font-caption)',
  color: 'var(--color-text-primary)'};

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

/** Wide enough for the conversation, the Ask AI panel and the side pane side by side. */
const WIDE_BREAKPOINT = 1720;

function useMinWidth(px: number) {
  const query = `(min-width: ${px}px)`;
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

const TAB_LIST_HEIGHT = `${STICKY_TABS_HEIGHT}px`;

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

/** Dew HorizontalTabs supplies the trigger styling, active underline and the trailing "More" overflow. */
function TicketTabs<T extends string>({
  tabs,
  active,
  onChange
}: {
  tabs: readonly T[];
  active: T;
  onChange: (tab: T) => void;
}) {
  return (
    <HorizontalTabs
      value={active}
      onValueChange={(value) => onChange(value as T)}
      inset
      style={{ flexShrink: 0, height: TAB_LIST_HEIGHT }}
    >
      <HorizontalTabs.List aria-label="Ticket sections" style={{ height: TAB_LIST_HEIGHT }}>
        {tabs.map((name) => (
          <HorizontalTabs.Trigger key={name} value={name}>
            {name}
          </HorizontalTabs.Trigger>
        ))}
      </HorizontalTabs.List>
    </HorizontalTabs>
  );
}


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

/**
 * What the split view gives a ticket page it hosts: the neighbours the
 * Previous / Next buttons step to, and whether the Filters pane is open. The
 * pane itself belongs to the split view and runs the full height beside the
 * whole workspace; the ticket only steps Properties and Ask AI aside for it.
 */
export interface SplitContext {
  previous?: string;
  next?: string;
  onNavigate: (id: string) => void;
  filtersOpen: boolean;
  onFiltersOpenChange: (open: boolean) => void;
}

/** The route's page: one ticket, full width. */
export default function TicketDetailOption2() {
  const { id } = useParams<{ id: string }>();
  return <TicketDetailView key={id} ticketId={id} />;
}

export function TicketDetailView({ ticketId: id, split }: { ticketId: string | undefined; split?: SplitContext }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const found = TICKETS.find((t) => t.id === id || t.code === id) ?? findDetailsTicket(id);
  const [ticket, setTicket] = useState<Ticket | undefined>(found);
  const [tab, setTab] = useState<(typeof TABS)[number]>('Details');
  const [propsOpen, setPropsOpen] = useState(true);
  const [activeWidget, setActiveWidget] = useState<string>('summary');
  const widgetRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [paneHidden, setPaneHidden] = useState(true);
  const [subjectHidden, setSubjectHidden] = useState(false);
  /** Follow-ups the prototype control has sent from the requester. */
  const [incomingCount, setIncomingCount] = useState(0);
  const subjectRef = useRef<HTMLDivElement | null>(null);

  const internalStyle: InternalStyle = searchParams.get('internal') === 'border' ? 'border' : 'tint';
  const fixture = findDetailsFixture(found?.code);
  /* The journey's last stage is the resolved ticket, which is scenario S4. */
  const stageParam = fixture && STAGE_TICKETS.includes(fixture.ticket.id) ? parseStage(searchParams.get('stage'), fixture.ticket.id) : undefined;
  const scenario: ScenarioId = stageParam === 'resolved' ? '4' : parseScenario(searchParams.get('scenario'));
  const story = Boolean(fixture && hasScenarioData(fixture.ticket.id));
  const askAi = useAskAi(scenario, fixture?.viewer.agent ?? { kind: 'agent', id: 'viewer', name: 'You' }, story);

  /* S4 is the ticket resolved; every other scenario is it still open. */
  useEffect(() => {
    if (!story) return;
    setTicket((current) => (current ? { ...current, status: scenario === '4' ? 'Resolved' : found?.status ?? current.status } : current));
  }, [scenario, story, found?.status]);

  /* Ask AI docks beside the whole ticket card (see `AskAiPanel`) and takes
     the widgets' place, so the side pane steps aside while it is open. */
  const aiOpen = Boolean(askAi.openThread && fixture);

  /* Edit with Copilot from the reply editor: the panel takes the Ask AI slot. */
  const acceptRef = useRef<(text: string) => void>(() => undefined);
  const copilot = useCopilotPanel({ onAccept: (_start, _end, text) => acceptRef.current(text) });
  const openCopilotEdit = copilot.openForEdit;
  const closeAsk = askAi.close;
  useEffect(
    () =>
      copilotBus.subscribe(({ text, accept }) => {
        acceptRef.current = accept;
        closeAsk();
        openCopilotEdit({ start: 0, end: text.length, text });
      }),
    [openCopilotEdit, closeAsk]
  );
  const filtersOpen = Boolean(split?.filtersOpen);
  /* On a wide screen the side pane and the Ask AI panel can be open together,
     each from its own trigger; on a narrower one they take turns. */
  const wide = useMinWidth(WIDE_BREAKPOINT);
  const paneVisible = (wide || !aiOpen) && !paneHidden && !filtersOpen;

  /* The right-hand area holds one thing at a time: Properties, Ask AI or (in
     the split view) Filters. Opening Filters remembers what was there and
     gives it back when the filters are dismissed; asking the AI or opening
     Properties while Filters is open simply replaces it. */
  type Restore = { kind: 'properties' } | { kind: 'ask'; id: string } | { kind: 'none' };
  const restoreRef = useRef<Restore | null>(null);
  const wasFiltersOpen = useRef(false);
  const openThreadId = askAi.openThread?.id;
  useEffect(() => {
    if (!split) return;
    const was = wasFiltersOpen.current;
    wasFiltersOpen.current = filtersOpen;
    if (filtersOpen && !was) {
      restoreRef.current = openThreadId ? { kind: 'ask', id: openThreadId } : paneHidden ? { kind: 'none' } : { kind: 'properties' };
      if (openThreadId) askAi.close();
    } else if (!filtersOpen && was) {
      const restore = restoreRef.current;
      restoreRef.current = null;
      if (restore?.kind === 'ask') askAi.open(restore.id);
    }
    // Only a change in the filter pane's visibility moves the right-hand area.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersOpen]);

  useEffect(() => {
    if (split && aiOpen && filtersOpen) {
      restoreRef.current = null;
      split.onFiltersOpenChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiOpen]);

  /* Once the subject has scrolled away it moves into the header bar. */
  useEffect(() => {
    const subject = subjectRef.current;
    const scroller = subject?.closest<HTMLElement>('[data-ticket-conversation-scroller]');
    if (!subject || !scroller) return;
    const observer = new IntersectionObserver(([entry]) => setSubjectHidden(!entry.isIntersecting), { root: scroller, threshold: 0 });
    observer.observe(subject);
    return () => observer.disconnect();
  }, [ticket?.id]);

  const canonicalId = id ? ticketIdFor(id) : undefined;
  if (canonicalId && canonicalId !== id) {
    const query = searchParams.toString();
    return <Navigate to={`/freshservice/tickets/${canonicalId}${query ? `?${query}` : ''}`} replace />;
  }

  if (!ticket) {
    return (
      <div style={{ padding: 'var(--spacing-600)', textAlign: 'center' }}>
        <p style={{ font: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>No such ticket.</p>
        <Link to="/freshservice/tickets" style={{ color: 'var(--color-text-brand)' }}>
          Back to tickets
        </Link>
      </div>
    );
  }

  /* Ticket Resolver's Details tab, when there is a fixture for this ticket.
     `?state=` picks which of the three review states to render. */
  const authoredTab = findDetailsFixture(ticket.code);
  const stageId = stageParam;
  const detailsTab = authoredTab ? applyBlockerToTab(applyStageToTab(authoredTab, stageId), stageId) : authoredTab;
  const stateParam = searchParams.get('state');
  const reviewState: ReviewState = REVIEW_STATES.includes(stateParam as ReviewState)
    ? (stateParam as ReviewState)
    : 'landing';

  const patch = (changes: Partial<Ticket>) => setTicket((t) => (t ? { ...t, ...changes } : t));
  const opts = <T extends string>(values: readonly T[]) => values.map((v) => ({ value: v, label: v }));

  return (
    <TabNavigationContext.Provider value={{ openTab: (name) => TABS.includes(name as (typeof TABS)[number]) && setTab(name as (typeof TABS)[number]) }}>
    <div style={{ display: 'flex', flex: 1, minWidth: 0, minHeight: 0, flexDirection: 'column' }}>
      {/* Quick actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          padding: 'var(--spacing-200) var(--spacing-200) var(--spacing-200) var(--spacing-400)',
          borderBlockEnd: '1px solid var(--color-boundary-border-mildest)'
        }}
      >
        {/* The subject, once it has scrolled away. The prototype's own
            controls live in the floating button, not here. */}
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          <span
            aria-hidden={!subjectHidden}
            className={`tr-o2-header-subject ${subjectHidden ? 'is-visible' : ''}`}
            title={ticket.subject}
          >
            {ticket.subject}
          </span>
        </div>
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
          <IconButton
            iconName="ChevronLeft"
            aria-label="Previous ticket"
            size="default"
            withBackground
            disabled={Boolean(split) && !split?.previous}
            onClick={() => split?.previous && split.onNavigate(split.previous)}
          />
          <IconButton
            iconName="ChevronRight"
            aria-label="Next ticket"
            size="default"
            withBackground
            disabled={Boolean(split) && !split?.next}
            onClick={() => split?.next && split.onNavigate(split.next)}
          />
          <span aria-hidden style={{ width: '1px', height: '24px', marginInline: 'var(--spacing-050)', backgroundColor: 'var(--color-boundary-divider-mildest)' }} />
          {/* Dew AI primary button: opens and closes the Ask AI side panel. */}
          <PrimaryButton
            active={aiOpen}
            onClick={() => {
              if (aiOpen) askAi.close();
              else askAi.ask('This ticket', { anchorId: 'ticket' });
            }}
          />
          <IconButton
            iconName={paneVisible ? 'CollapseSidebar' : 'ExpandSidebar'}
            aria-label={paneVisible ? 'Hide side pane' : 'Show side pane'}
            aria-pressed={!paneVisible}
            size="default"
            withBackground
            onClick={() => {
              if (paneVisible) {
                setPaneHidden(true);
              } else {
                if (!wide) askAi.close();
                setPaneHidden(false);
                if (split?.filtersOpen) {
                  restoreRef.current = null;
                  split.onFiltersOpenChange(false);
                }
              }
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Conversation column */}
        <div data-ticket-conversation-scroller style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflowY: 'auto' }}>
          <div ref={subjectRef} style={{ display: 'grid', gridTemplateColumns: '48px minmax(0, 1fr)', alignItems: 'center', columnGap: 'var(--spacing-200)', padding: 'var(--spacing-250) var(--spacing-400) var(--spacing-150)' }}>
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
                  borderRadius: 'var(--border-radius-small)',
                  border: '2px solid var(--color-fill-surface)',
                  backgroundColor: 'var(--color-fill-surface)'
                }}
              >
                <img src={slackLogo} alt="" width={16} height={16} />
              </span>
            </span>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ margin: 0, font: 'var(--font-callout)', color: 'var(--color-text-primary)' }}>
                {ticket.subject}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-050)', paddingBlockStart: 'var(--spacing-075)', font: 'var(--font-caption-regular)', flexWrap: 'wrap' }}>
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
          <div style={{ position: 'sticky', top: 0, zIndex: 5, flexShrink: 0, backgroundColor: 'var(--color-fill-surface)' }}>
            <TicketTabs tabs={TABS} active={tab} onChange={setTab} />
          </div>

          {/* The Details tab's content. Tickets with no Ticket Resolver
              fixture render exactly as they did before — nothing. */}
          {tab === 'Related tickets' ? (
            <RelatedTicketsTab ticketCode={ticket.code} />
          ) : tab === 'Details' ? (
            detailsTab && (
              <DetailsTabOption2
                key={`${reviewState}-${scenario}-${stageId ?? 'full'}`}
                tab={detailsTab}
                ticketType={ticket.type}
                reviewState={reviewState}
                scenario={scenario}
                internalStyle={internalStyle}
                askAi={askAi}
                incomingCount={incomingCount}
                stage={stageId}
                fullTab={authoredTab}
              />
            )
          ) : (
            <div style={{ padding: 'var(--spacing-400)' }}>
              <p style={{ margin: 0, font: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
                {tab} — not built in this prototype.
              </p>
            </div>
          )}
        </div>

        {/* Side pane — Ask AI or the widgets, or hidden so the conversation can
            go edge to edge. */}
        {paneVisible && <aside
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
          <>
          <div
            ref={(el) => { widgetRefs.current.summary = el; }}
            style={{ ...CARD, borderColor: 'var(--color-boundary-semantic-info-mild)' }}
          >
            <div style={{ marginBlockEnd: 'var(--spacing-100)', font: 'var(--font-callout)', color: 'var(--color-text-primary)' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', marginBlockEnd: 'var(--spacing-150)', font: 'var(--font-body-semibold)', color: 'var(--color-text-primary)' }}>
              <Icon name="User" size="sm" />
              Requester information
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-100)' }}>
              <RequesterAvatar ticket={ticket} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-050)' }}>
                <a href="#" style={{ font: 'var(--font-body-semibold)', color: 'var(--color-text-brand)', textDecoration: 'none' }}>
                  {ticket.requester}
                </a>
                {ticket.requesterTitle && (
                  <span style={{ font: 'var(--font-caption-regular)', color: 'var(--color-text-secondary)' }}>
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
              <span style={{ flex: 1, font: 'var(--font-body-semibold)', color: 'var(--color-text-primary)' }}>
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

                <div style={{ marginBlockEnd: 'var(--spacing-200)' }}><TextField label="Planned Start Date" placeholder="DD-MM-YYYY" /></div>
                <div style={{ marginBlockEnd: 'var(--spacing-200)' }}><TextField label="Planned End Date" placeholder="DD-MM-YYYY" /></div>
                <div style={{ marginBlockEnd: 'var(--spacing-200)' }}><TextField label="Planned Effort" placeholder="Eg: 1h 10m" /></div>
                <div style={{ marginBlockEnd: 'var(--spacing-200)' }}><TextField label="Tags" placeholder="Search" /></div>

                <TextButton type="button" variant="primary" style={{ width: '100%' }}>
                  Update
                </TextButton>
              </>
            )}
          </div>
          </>
        </aside>}

        {/* Widget rail — hidden with the side pane, so a collapsed pane gives the
            conversation the full width. The header button brings both back. */}
        {paneVisible && <nav
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
              active={paneVisible && (wide || !aiOpen) && activeWidget === widget.id}
              onClick={() => {
                setActiveWidget(widget.id);
                if (!wide) askAi.close();
                setPaneHidden(false);
                requestAnimationFrame(() => widgetRefs.current[widget.id]?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
              }}
            />
          ))}
        </nav>}

        {/* Freddy AI sits at the far right, beyond the side pane. */}
        {aiOpen && detailsTab && !copilot.open && (
          <div className="tr-o2-copilot-dock">
            <AskAiPanel askAi={askAi} viewer={detailsTab.viewer.agent} />
          </div>
        )}
        {copilot.open && (
          <div className="tr-o2-copilot-dock">
            <CopilotPanel className="tr-o2-ai-slider" {...copilot.buildCopilotPanelProps()} />
          </div>
        )}

      </div>
      <ReviewControls
        stages={authoredTab && tab === 'Details' && STAGE_TICKETS.includes(authoredTab.ticket.id)
          ? {
              value: stageId,
              options: stagesFor(authoredTab.ticket.id),
              onChange: (next) => {
                const params = new URLSearchParams(searchParams);
                if (next) params.set('stage', next);
                else params.delete('stage');
                setSearchParams(params, { replace: true });
              }
            }
          : undefined}
        incoming={detailsTab && tab === 'Details'
          ? { count: incomingCount, onSend: () => setIncomingCount((count) => count + 1), onReset: () => setIncomingCount(0) }
          : undefined}
      />
    </div>
    </TabNavigationContext.Provider>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { Avatar, Icon, IconButton, Menu, Select, TextButton } from '@freshworks/dew-components';
import slackLogo from './assets/slack-logo.svg';
import SentimentPill from './details/SentimentPill';
import DetailsTabOption2, { STICKY_TABS_HEIGHT } from './details/option2/DetailsTabOption2';
import AskAiPanel from './details/option2/AskAiPanel';
import useAskAi from './details/option2/useAskAi';
import { PrimaryButton } from '../../../dewai';
import ReviewControls from './details/option2/ReviewControls';
import useDigitDemo from './details/option2/useDigitDemo';
import HandOverDialog, { TakeoverContext, type Takeover } from './HandOverDialog';
import type { InternalStyle } from './details/option2/ResponseCard';
import { hasScenarioData, parseScenario, type ScenarioId } from './details/option2/scenarios';
import { findDetailsFixture, findDetailsTicket } from './details/fixtures';
import { REVIEW_STATES, type ReviewState } from './details/types';
import { INCIDENT_DATES } from './details/incidentDates';
import { STAGE_TICKETS, applyBlockerToTab, applyStageToTab, digitOwns, parseStage, STAGE_DIGIT, stagesFor } from './details/option2/stages';
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
      /* clientWidth includes the strip's side padding, which tabs can't use. */
      const style = getComputedStyle(container);
      const available = container.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
      const gap = parseFloat(style.columnGap || '0') || 0;
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

/** The pane's free-text fields, which the prototype keeps only for the session. */
const EMPTY_TEXTS = { plannedStart: '', plannedEnd: '', plannedEffort: '', tags: '' };

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

/** Read-only while the Digit has the ticket, as Dew's disabled fields read. */
function SlaRow({
  label,
  due,
  editable,
  onEdit,
  topSpacing = false
}: {
  label: string;
  due: string;
  onEdit?: () => void;
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
            <IconButton iconName="Edit" aria-label={`Edit ${label.toLowerCase()}`} size="mini" onClick={onEdit} />
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
  /** Taken from the Digit with Pickup; any other stage starts fresh. */
  const [pickedUpAt, setPickedUpAt] = useState<string | undefined>();
  /** A change to a ticket the Digit has, waiting on the take-over confirmation. */
  const [handOver, setHandOver] = useState<(() => void) | undefined>();

  const internalStyle: InternalStyle = searchParams.get('internal') === 'border' ? 'border' : 'tint';
  const fixture = findDetailsFixture(found?.code);
  /* The journey's last stage is the resolved ticket, which is scenario S4. */
  const selectedStage = fixture && STAGE_TICKETS.includes(fixture.ticket.id) ? parseStage(searchParams.get('stage'), fixture.ticket.id) : undefined;
  const demo = useDigitDemo(fixture?.ticket.id === 'INC-4127' && tab === 'Details', selectedStage);
  const stageParam = demo.active ? demo.current.stage : selectedStage;
  const selectedScenario: ScenarioId = selectedStage === 'resolved' ? '4' : parseScenario(searchParams.get('scenario'));
  const scenario: ScenarioId = demo.active ? (demo.current.stage === 'resolved' ? '4' : '1') : selectedScenario;
  const story = Boolean(fixture && hasScenarioData(fixture.ticket.id));
  /* While the Digit has the ticket, people can read it but not change it. */
  const locked = digitOwns(stageParam) && (demo.active || !pickedUpAt);
  /* Nothing is disabled while the Digit has the ticket. The first change asks
     to take it over (`HandOverDialog`); Continue picks the ticket up and then
     goes ahead with what the person did. */
  const takeover: Takeover = (action) => {
    if (!locked) {
      action?.();
      return;
    }
    setHandOver(() => () => {
      setPickedUpAt(new Date().toISOString());
      if (action) window.setTimeout(action, 0);
    });
  };
  useEffect(() => setPickedUpAt(undefined), [selectedStage]);
  /* The properties pane's draft (see `update`); a new stage starts it fresh. */
  const [draft, setDraft] = useState<Partial<Ticket>>({});
  const [texts, setTexts] = useState(EMPTY_TEXTS);
  const [savedTexts, setSavedTexts] = useState(EMPTY_TEXTS);
  useEffect(() => { setDraft({}); setTexts(savedTexts); }, [selectedStage]); // eslint-disable-line react-hooks/exhaustive-deps
  /* A ticket the list shows with Ticket Resolver is the Resolver's while it
     owns the stage; once it has handed over, or someone picks it up, the agent
     is the person it went to (the viewer, as in the hand-over rows). */
  const viewerAgent = (AGENTS as readonly string[]).includes(fixture?.viewer.agent.name ?? '')
    ? (fixture!.viewer.agent.name as Agent)
    : undefined;
  const resolverAssigned = found?.assignee === 'Ticket Resolver' && Boolean(fixture && STAGE_TICKETS.includes(fixture.ticket.id));
  useEffect(() => {
    if (!resolverAssigned) return;
    const assignee: Agent = digitOwns(selectedStage) && !pickedUpAt ? 'Ticket Resolver' : viewerAgent ?? 'Ticket Resolver';
    setTicket((current) => (current ? { ...current, assignee } : current));
  }, [resolverAssigned, selectedStage, pickedUpAt, viewerAgent]);
  /* The pre-ticket chat is kept for 90 days; `?expired=1` shows the ticket after that. */
  const conversationExpired = searchParams.get('expired') === '1';
  const askAi = useAskAi(scenario, fixture?.viewer.agent ?? { kind: 'agent', id: 'viewer', name: 'You' }, story);

  /* S4 is the ticket resolved; every other scenario is it still open. */
  useEffect(() => {
    if (!story) return;
    setTicket((current) => (current ? { ...current, status: selectedScenario === '4' ? 'Resolved' : found?.status ?? current.status } : current));
  }, [selectedScenario, story, found?.status]);

  /* Ask AI docks beside the whole ticket card (see `AskAiPanel`) and takes
     the widgets' place, so the side pane steps aside while it is open. */
  const aiOpen = Boolean(askAi.openThread && fixture);
  const filtersOpen = Boolean(split?.filtersOpen);
  /* Conversation keeps at least 640px, Ask AI at least 300px, and Properties
     is a fixed 366px + 48px rail. When all three fit they sit side by side;
     otherwise Ask AI and Properties take turns (the last one opened wins). */
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [rowWidth, setRowWidth] = useState(0);
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const measure = () => setRowWidth(row.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [fixture]);
  /* The Ask AI dock: the AI Design System's 360px slider, 8px of canvas on
     each side and a 1px border. Minimized, it collapses to a floating header
     card and takes no room in the row. */
  const askWidth = 360 + 16 + 1;
  const [aiMinimized, setAiMinimized] = useState(false);
  const aiTakesRoom = aiOpen && !aiMinimized;
  const wide = rowWidth >= 640 + askWidth + 366 + 48;
  const paneVisible = !paneHidden && !filtersOpen && (!aiTakesRoom || wide);

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
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>No such ticket.</p>
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

  /* The properties pane is a form: edits are held as a draft and nothing
     changes until Update, which stays off until something differs from what
     is saved. Update is the one change here, so it is where a ticket the Digit
     has asks to be taken over (as does moving it off Ticket Resolver). */
  const edit = (changes: Partial<Ticket>) => setDraft((current) => ({ ...current, ...changes }));
  const changed = ticket
    ? (Object.keys(draft) as Array<keyof Ticket>).filter((key) => draft[key] !== ticket[key])
    : [];
  const formDirty = changed.length > 0 || (Object.keys(texts) as Array<keyof typeof texts>).some((key) => texts[key] !== savedTexts[key]);
  const form = { ...ticket!, ...draft, ...(demo.active ? { status: demo.current.stage === 'resolved' ? 'Resolved' as Status : 'Open' as Status, assignee: 'Ticket Resolver' as Agent } : {}) };
  const update = () => {
    const apply = () => {
      patch(Object.fromEntries(changed.map((key) => [key, draft[key]])) as Partial<Ticket>);
      setSavedTexts(texts);
      setDraft({});
    };
    const leavesResolver = ticket?.assignee === 'Ticket Resolver' && changed.includes('assignee');
    if (!locked && leavesResolver) setHandOver(() => apply);
    else takeover(apply);
  };
  const opts = <T extends string>(values: readonly T[]) => values.map((v) => ({ value: v, label: v }));

  return (
    <TabNavigationContext.Provider value={{ openTab: (name) => TABS.includes(name as (typeof TABS)[number]) && setTab(name as (typeof TABS)[number]) }}>
    <TakeoverContext.Provider value={takeover}>
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
          {/* The Digit still has the ticket: Pick up takes it over outright. */}
          {locked && (
            <TextButton type="button" variant="secondary" size="default" onClick={() => takeover()}>
              Pick up
            </TextButton>
          )}
          {/* Taking the ticket from the Digit can't be undone, so every change to it
              (Pick up included) is confirmed first, in the same words. */}
          <HandOverDialog
            open={Boolean(handOver)}
            digit={STAGE_DIGIT.name}
            onCancel={() => setHandOver(undefined)}
            onConfirm={() => {
              handOver?.();
              setHandOver(undefined);
            }}
          />
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
          <TextButton type="button" variant="secondary" size="default" aria-label="Edit ticket" onClick={() => takeover()}>
            Edit
          </TextButton>
          <Menu
            aria-label="Conversations"
            onClick={() => takeover()}
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
            onClick={() => takeover()}
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
          <TextButton type="button" variant="secondary" size="default" onClick={() => takeover(() => patch({ status: 'Closed' }))}>
            Close
          </TextButton>
          <IconButton iconName="MoreHorizontal" aria-label="More button" size="default" withBackground onClick={() => takeover()} />
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
          {/* Dew AI primary button (from the reference build): opens and closes Ask AI. */}
          <PrimaryButton
            active={aiOpen}
            ariaLabel={aiOpen ? 'Close Ask AI' : 'Open Ask AI'}
            onClick={() => (aiOpen ? askAi.close() : askAi.openPanel())}
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

      <div ref={rowRef} style={{ display: 'flex', flex: 1, minHeight: 0 }}>
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
                  borderRadius: '4px',
                  border: '2px solid var(--color-fill-surface)',
                  backgroundColor: 'var(--color-fill-surface)'
                }}
              >
                {detailsTab?.ticket.source === 'email' ? <Icon name="Email" size="sm" /> : <img src={slackLogo} alt="" width={16} height={16} />}
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
                key={demo.active ? `demo-${demo.run}` : `${reviewState}-${scenario}-${stageId ?? 'full'}-normal`}
                tab={detailsTab}
                ticketType={ticket.type}
                reviewState={reviewState}
                scenario={scenario}
                internalStyle={internalStyle}
                askAi={askAi}
                incomingCount={incomingCount}
                stage={stageId}
                fullTab={authoredTab}
                locked={locked}
                pickedUpAt={demo.active ? undefined : pickedUpAt}
                conversationExpired={conversationExpired}
                demo={demo.active ? demo.current : undefined}
                demoPaused={demo.status !== 'playing'}
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
          {/* While the Digit has the ticket the reply dock says so, for the whole page; the fields here just read as disabled. */}
          <div
            ref={(el) => { widgetRefs.current.summary = el; }}
            style={{ ...CARD, borderColor: 'var(--color-boundary-semantic-info-mild)' }}
          >
            <div style={{ marginBlockEnd: 'var(--spacing-100)', fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>
              {demo.active ? form.status : ticket.status}
            </div>
            <div style={{ marginBlockEnd: 'var(--spacing-150)' }}>
              <div style={LABEL}>Priority</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-050)' }}>
                <span aria-hidden style={{ width: '10px', height: '10px', borderRadius: 'var(--border-radius-2xsmall)', backgroundColor: PRIORITY_COLOR[ticket.priority] }} />
                <span style={VALUE}>{ticket.priority}</span>
              </div>
            </div>
            <SlaRow label="First response due" due={INCIDENT_DATES.firstResponseDue} />
            <SlaRow label="Resolution due" due={INCIDENT_DATES.resolutionDue} editable onEdit={() => takeover()} topSpacing />
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
                      value={{ value: form.priority, label: form.priority }}
                      onValueChange={(next) => next && edit({ priority: next.value as Priority })}
                    />
                  </PropField>
                  <PropField label="Status" required>
                    <Select
                      aria-label="Ticket status"
                      options={opts(STATUSES)}
                      value={{ value: form.status, label: form.status }}
                      onValueChange={(next) => next && edit({ status: next.value as Status })}
                    />
                  </PropField>
                </PropRow>

                <PropRow>
                  <PropField label="Source">
                    <Select
                      aria-label="Source"
                      options={opts(SOURCES)}
                      value={{ value: form.source, label: form.source }}
                      onValueChange={(next) => next && edit({ source: next.value as Source })}
                    />
                  </PropField>
                  <PropField label="Type">
                    <Select
                      aria-label="Type"
                      options={opts(TICKET_TYPES)}
                      value={{ value: form.type, label: form.type }}
                      onValueChange={(next) => next && edit({ type: next.value as TicketType })}
                    />
                  </PropField>
                </PropRow>

                <PropRow>
                  <PropField label="Urgency">
                    <Select
                      aria-label="Urgency"
                      options={opts(LEVELS)}
                      value={{ value: form.urgency, label: form.urgency }}
                      onValueChange={(next) => next && edit({ urgency: next.value as Level })}
                    />
                  </PropField>
                  <PropField label="Impact">
                    <Select
                      aria-label="Impact"
                      options={opts(LEVELS)}
                      value={{ value: form.impact, label: form.impact }}
                      onValueChange={(next) => next && edit({ impact: next.value as Level })}
                    />
                  </PropField>
                </PropRow>

                <PropRow>
                  <PropField label="Group">
                    <Select
                      aria-label="Group"
                      options={opts(GROUPS)}
                      value={{ value: form.group, label: form.group }}
                      onValueChange={(next) => next && edit({ group: next.value as Group })}
                    />
                  </PropField>
                  {/* "Agent" here, not the list's "Assigned to". */}
                  <PropField label="Agent">
                    <Select
                      aria-label="Ticket agent"
                      options={opts(AGENTS.filter((agent) => agent !== 'Ticket Resolver'))}
                      value={{ value: form.assignee, label: form.assignee }}
                      onValueChange={(next) => next && edit({ assignee: next.value as Agent })}
                    />
                  </PropField>
                </PropRow>

                <PropRow>
                  <PropField label="Department">
                    <Select
                      aria-label="Department"
                      options={opts(DEPARTMENTS)}
                      value={{ value: form.department, label: form.department }}
                      onValueChange={(next) => next && edit({ department: next.value as Department })}
                    />
                  </PropField>
                  {/* Unset on the live ticket too, so it renders empty. */}
                  <PropField label="Category">
                    <Select aria-label="Category" options={[]} placeholder="--" value={null} onValueChange={() => {}} />
                  </PropField>
                </PropRow>

                <PropField label="Planned Start Date">
                  <input style={PROP_INPUT} placeholder="DD-MM-YYYY" aria-label="Planned Start Date" value={texts.plannedStart} onChange={(event) => setTexts((current) => ({ ...current, plannedStart: event.target.value }))} />
                </PropField>
                <PropField label="Planned End Date">
                  <input style={PROP_INPUT} placeholder="DD-MM-YYYY" aria-label="Planned End Date" value={texts.plannedEnd} onChange={(event) => setTexts((current) => ({ ...current, plannedEnd: event.target.value }))} />
                </PropField>
                <PropField label="Planned Effort">
                  <input style={PROP_INPUT} placeholder="Eg: 1h 10m" aria-label="Planned Effort" value={texts.plannedEffort} onChange={(event) => setTexts((current) => ({ ...current, plannedEffort: event.target.value }))} />
                </PropField>
                <PropField label="Tags">
                  <input style={PROP_INPUT} placeholder="Search" aria-label="Tags" value={texts.tags} onChange={(event) => setTexts((current) => ({ ...current, tags: event.target.value }))} />
                </PropField>

                <TextButton type="button" variant="primary" style={{ width: '100%' }} disabled={!formDirty} onClick={update}>
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
              active={paneVisible && activeWidget === widget.id}
              onClick={() => {
                setActiveWidget(widget.id);
                if (!wide) askAi.close();
                setPaneHidden(false);
                requestAnimationFrame(() => widgetRefs.current[widget.id]?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
              }}
            />
          ))}
        </nav>}

        {/* Ask AI floats at the far right, beyond the side pane, as its own
            card on a container-fill canvas (from the reference build). */}
        {aiOpen && detailsTab && (
          <div className="tr-o2-copilot-dock">
            <AskAiPanel askAi={askAi} viewer={detailsTab.viewer.agent} onMinimizedChange={setAiMinimized} />
          </div>
        )}
      </div>
      <ReviewControls
        demo={fixture?.ticket.id === 'INC-4127' && tab === 'Details' ? {
          status: demo.status,
          label: demo.current.label,
          step: demo.index + 1,
          total: demo.total,
          onPlay: demo.play,
          onPause: demo.pause,
          onRestart: demo.restart,
          onExit: demo.exit
        } : undefined}
        stages={authoredTab && tab === 'Details' && STAGE_TICKETS.includes(authoredTab.ticket.id)
          ? {
              value: selectedStage,
              options: stagesFor(authoredTab.ticket.id),
              onChange: (next) => {
                demo.exit();
                const params = new URLSearchParams(searchParams);
                if (next) params.set('stage', next);
                else params.delete('stage');
                setSearchParams(params, { replace: true });
              }
            }
          : undefined}
        expired={detailsTab && tab === 'Details'
          ? {
              value: conversationExpired,
              onChange: (next) => {
                const params = new URLSearchParams(searchParams);
                if (next) params.set('expired', '1');
                else params.delete('expired');
                setSearchParams(params, { replace: true });
              }
            }
          : undefined}
        incoming={detailsTab && tab === 'Details'
          ? { count: incomingCount, onSend: () => setIncomingCount((count) => count + 1), onReset: () => setIncomingCount(0) }
          : undefined}
      />
    </div>
    </TakeoverContext.Provider>
    </TabNavigationContext.Provider>
  );
}

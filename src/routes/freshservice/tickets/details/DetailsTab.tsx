import { Fragment, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { ProposedFlags, ReviewState, TicketDetailsTab } from './types';
import { DEFAULT_PROPOSED } from './types';
import {
  buildReviewView,
  buildStreamView,
  firstUnreadId,
  initialOpenPhases
} from './streamView';
import SummaryCard from './SummaryCard';
import RootCauseCard from './RootCauseCard';
import DescriptionBlock from './DescriptionBlock';
import AttachmentsSection from './AttachmentsSection';
import ConversationsHeader from './ConversationsHeader';
import ReplyBar from './ReplyBar';
import { ConversationsPill, StreamNodeView, UnreadDivider } from './StreamGroup';
import { buildConversationTimeline } from './conversationTimeline';
import LiveWorkerCard, { liveStepCount, type LiveWorkStage } from './LiveWorkerCard';
import RequestedItems from './RequestedItems';
import type { TicketType } from '../tickets.data';

type ReplayState = {
  visibleCount: number;
  live: { id: string; stage: LiveWorkStage; visibleSteps: number } | null;
  revealId: string | null;
};

function TimelineArtifact({ kind, id, tab, proposed, reveal = false }: { kind: 'summary' | 'root-cause'; id: string; tab: TicketDetailsTab; proposed: ProposedFlags; reveal?: boolean }) {
  const [collapsed, setCollapsed] = useState(true);
  const originRef = useRef<HTMLSpanElement | null>(null);
  const pendingRef = useRef<(() => void) | null>(null);

  useEffect(() => () => pendingRef.current?.(), []);

  const toggleCollapsed = () => {
    if (!collapsed) {
      setCollapsed(true);
      return;
    }
    const origin = originRef.current;
    const scroller = origin?.closest<HTMLElement>('[data-ticket-conversation-scroller]');
    if (!origin || !scroller) {
      setCollapsed(false);
      return;
    }
    const originTop = origin.getBoundingClientRect().top;
    const viewportTop = scroller.getBoundingClientRect().top;
    if (originTop >= viewportTop + 8) {
      setCollapsed(false);
      return;
    }

    pendingRef.current?.();
    const target = scroller.scrollTop + originTop - viewportTop - 8;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      scroller.scrollTo({ top: target, behavior: 'auto' });
      setCollapsed(false);
      return;
    }
    let frame: number;
    const startedAt = performance.now();
    const finish = () => {
      window.cancelAnimationFrame(frame);
      pendingRef.current = null;
      setCollapsed(false);
    };
    const checkPosition = () => {
      if (Math.abs(scroller.scrollTop - target) < 2) {
        finish();
      } else if (performance.now() - startedAt > 1400) {
        scroller.scrollTo({ top: target, behavior: 'auto' });
        finish();
      } else {
        frame = window.requestAnimationFrame(checkPosition);
      }
    };
    pendingRef.current = () => window.cancelAnimationFrame(frame);
    scroller.scrollTo({ top: target, behavior: 'smooth' });
    frame = window.requestAnimationFrame(checkPosition);
  };

  return <>
    <span ref={originRef} className="tr-artifact-origin" aria-hidden="true" />
    <div id={`stream-${id}`} className={`tr-artifact-inline-sticky ${reveal ? 'tr-conversation-reveal' : ''}`}>
    {kind === 'summary'
      ? <SummaryCard summary={tab.summary} ticketCode={tab.ticket.id} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} proposed={proposed} hideHeaderActions />
      : <RootCauseCard rootCause={tab.rootCause} ticketCode={tab.ticket.id} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} proposed={proposed} hideHeaderActions />}
    </div>
  </>;
}

/**
 * The Details tab's content, for incident tickets.
 *
 * The current summary sits above conversations; historical summary and root
 * cause artifacts remain at the points where they were created in the stream.
 */

/** Imperative handle for the demo-only replay control, driven from the
 * widget rail outside this component rather than a header button here. */
export type DetailsTabHandle = { toggleReplay: () => void };

const DetailsTab = forwardRef<DetailsTabHandle, {
  tab: TicketDetailsTab;
  ticketType: TicketType;
  reviewState?: ReviewState;
  proposed?: ProposedFlags;
  onPlayingChange?: (isPlaying: boolean) => void;
}>(function DetailsTab({
  tab,
  ticketType,
  reviewState = 'landing',
  proposed = DEFAULT_PROPOSED,
  onPlayingChange
}, ref) {
  const ticketCode = tab.ticket.id;

  const [expandedPillIds, setExpandedPillIds] = useState<string[]>([]);
  const [topSummaryCollapsed, setTopSummaryCollapsed] = useState(true);
  const [replayRun, setReplayRun] = useState(0);
  const [replay, setReplay] = useState<ReplayState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const contentStartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { onPlayingChange?.(isPlaying); }, [isPlaying, onPlayingChange]);

  useImperativeHandle(ref, () => ({
    toggleReplay: () => {
      if (isPlaying) {
        setReplayRun(0);
        setReplay(null);
        setIsPlaying(false);
      } else {
        setReplayRun((value) => value + 1);
      }
    }
  }), [isPlaying]);

  const review = useMemo(() => buildReviewView(tab, reviewState), [tab, reviewState]);
  const timeline = useMemo(() => buildConversationTimeline(review.stream), [review.stream]);
  const conversationStream = timeline.nodes;
  const unreadId = useMemo(
    () => firstUnreadId({ viewer: tab.viewer, stream: conversationStream }),
    [tab.viewer, conversationStream]
  );
  const rows = useMemo(
    () => buildStreamView(conversationStream, { filter: 'all-activity', expandedPillIds }),
    [conversationStream, expandedPillIds]
  );

  useEffect(() => {
    if (!replayRun) return;
    let active = true;
    let timer: number | undefined;
    let resolvePending: (() => void) | undefined;
    const pause = (milliseconds: number) => new Promise<void>((resolve) => {
      resolvePending = resolve;
      timer = window.setTimeout(() => {
        resolvePending = undefined;
        resolve();
      }, milliseconds);
    });
    const play = async () => {
      setIsPlaying(true);
      for (let index = 0; index < rows.length && active; index += 1) {
        const row = rows[index];
        const id = row.kind === 'node' ? row.node.id : row.id;
        const worker = row.kind === 'node' && row.node.kind === 'message' && row.node.actor.kind === 'digit';
        if (worker && row.node.kind === 'message') {
          const activities = timeline.workByMessageId[id] ?? [];
          setReplay({ visibleCount: index + 1, live: { id, stage: 'thinking', visibleSteps: 0 }, revealId: null });
          await pause(2200);
          if (!active) break;
          setReplay({ visibleCount: index + 1, live: { id, stage: 'working', visibleSteps: 0 }, revealId: null });
          for (let step = 1; step <= liveStepCount(activities) && active; step += 1) {
            await pause(1000);
            if (active) setReplay({ visibleCount: index + 1, live: { id, stage: 'working', visibleSteps: step }, revealId: null });
          }
          await pause(1700);
          if (!active) break;
          setReplay({ visibleCount: index + 1, live: null, revealId: id });
        } else {
          setReplay({ visibleCount: index + 1, live: null, revealId: id });
        }
        await pause(index === 0 ? 900 : 1050);
      }
      if (active) setIsPlaying(false);
    };
    void play();
    return () => {
      active = false;
      window.clearTimeout(timer);
      resolvePending?.();
    };
  }, [replayRun, rows, timeline.workByMessageId]);

  const visibleRows = replay ? rows.slice(0, replay.visibleCount) : rows;

  const segments: { id: string; rows: typeof rows }[] = [{ id: 'before-artifacts', rows: [] }];
  for (const row of visibleRows) {
    if (row.kind === 'node' && (
      row.node.kind === 'approval' ||
      (row.node.kind === 'event' && (row.node.type === 'summary-updated' || row.node.type === 'root-cause-added'))
    )) segments.push({ id: `from-${row.node.id}`, rows: [] });
    segments[segments.length - 1].rows.push(row);
  }

  /* Open at the newest update. The original artifact cards are sticky inside
     their own stream segments, so no duplicate is created during scrolling. */
  useEffect(() => {
    const scroller = contentStartRef.current?.closest<HTMLElement>('[data-ticket-conversation-scroller]');
    if (!scroller) return;
    const frame = requestAnimationFrame(() => {
      // Incidents keep the existing newest-update landing position. Service
      // requests open at the top so the requested catalog items are visible
      // before the conversation history.
      scroller.scrollTop = ticketType === 'Service Request' ? 0 : scroller.scrollHeight;
    });
    return () => cancelAnimationFrame(frame);
  }, [tab.ticket.id, ticketType, reviewState]);

  useEffect(() => {
    if (!replay || !isPlaying) return;
    const row = rows[replay.visibleCount - 1];
    const id = row?.kind === 'node' ? row.node.id : row?.id;
    if (!id) return;
    const frame = requestAnimationFrame(() => document.getElementById(`stream-${id}`)?.scrollIntoView({ behavior: 'smooth', block: replay.visibleCount === 1 ? 'start' : 'end' }));
    return () => cancelAnimationFrame(frame);
  }, [replay?.visibleCount, isPlaying, rows]);

  return (
    <div className="tr-details-tab" style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        ref={contentStartRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          /* 24px between Summary, Description, Requested items, Attachments
             and Conversations. */
          gap: 'var(--spacing-300)',
          padding: 'var(--spacing-400)'
        }}
      >
        <SummaryCard
          summary={tab.summary}
          ticketCode={ticketCode}
          collapsed={topSummaryCollapsed}
          onToggleCollapsed={() => setTopSummaryCollapsed((value) => !value)}
          proposed={proposed}
        />

        {/* Service requests only. An incident's description duplicates the
            Summary card's Issue section, so it stays hidden there; a request's
            description carries what the requester actually asked for, which the
            requested items below don't repeat. Gated on the same ticket type as
            those items so the two always appear together. */}
        {ticketType === 'Service Request' && (
          <DescriptionBlock description={tab.description} ticketCode={ticketCode} />
        )}

        {ticketType === 'Service Request' && <RequestedItems />}

        {ticketType === 'Service Request' && <AttachmentsSection />}

        <ConversationsHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
          {segments.map((segment) => <div key={segment.id} className="tr-artifact-segment">
          {segment.rows.map((row) => {
            if (row.kind === 'collapsed') {
              return (
                <ConversationsPill
                  key={row.id}
                  count={row.hidden.length}
                  onExpand={() => setExpandedPillIds((ids) => [...ids, row.id])}
                />
              );
            }

            return (
              /* A fragment, not a `display: contents` wrapper: the divider and
                 the row need to be siblings in the column's flex flow, and
                 `display: contents` on a flex item is a known source of paint
                 bugs. */
              <Fragment key={row.node.id}>
                {row.node.id === unreadId && <UnreadDivider />}
                {row.node.kind === 'event' && row.node.type === 'summary-updated' ? (
                  <TimelineArtifact kind="summary" id={row.node.id} tab={tab} proposed={proposed} reveal={replay?.revealId === row.node.id} />
                ) : row.node.kind === 'event' && row.node.type === 'root-cause-added' ? (
                  <TimelineArtifact kind="root-cause" id={row.node.id} tab={tab} proposed={proposed} reveal={replay?.revealId === row.node.id} />
                ) : row.node.kind === 'approval' ? (
                  <div className={`tr-artifact-inline-sticky ${replay?.revealId === row.node.id ? 'tr-conversation-reveal' : ''}`}><StreamNodeView node={row.node} ticketCode={ticketCode} proposed={proposed} /></div>
                ) : row.node.kind === 'message' && replay?.live?.id === row.node.id ? (
                  <LiveWorkerCard message={row.node} activities={timeline.workByMessageId[row.node.id] ?? []} stage={replay.live.stage} visibleSteps={replay.live.visibleSteps} ticketCode={ticketCode} />
                ) : <StreamNodeView
                  node={row.node}
                  ticketCode={ticketCode}
                  proposed={proposed}
                  openRunIds={review.openRunIds}
                  openPhaseIds={
                    row.node.kind === 'group'
                      ? review.openPhaseIds.length > 0
                        ? review.openPhaseIds
                        : initialOpenPhases(row.node)
                      : undefined
                  }
                  onSummaryUpdated={() => document.getElementById('stream-e-sum')?.scrollIntoView({ block: 'center', behavior: 'smooth' })}
                  workActivities={timeline.workByMessageId[row.node.id]}
                  reveal={replay?.revealId === row.node.id}
                  liveReplayHistory={row.node.id === 'm2' && replay !== null && replay.visibleCount >= 2 && replay.live?.id !== 'm2'}
                />}
              </Fragment>
            );
          })}
          </div>)}

            {/* New items are appended here, above the bar — nothing above moves. */}
            {!isPlaying && <ReplyBar viewer={tab.viewer.agent} source={tab.ticket.source} />}
          </div>
        </ConversationsHeader>
      </div>
    </div>
  );
});

export default DetailsTab;

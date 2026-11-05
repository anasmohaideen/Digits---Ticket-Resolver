import { useRef } from 'react';
import { InlineMessage, SegmentedTabs, Shimmer, Spinner } from '@freshworks/dew-components';
import type { Actor, MessageNode, ProposedFlags, TicketDetailsTab } from '../types';
import { META } from '../details.styles';
import { elapsed } from '../format';
import { SparkleIcon, SummaryHeaderActions } from '../AiCardChrome';
import { ActionBanner, AiFeedbackFooter } from '../../../../../dewai';
import PreTicketLog from './PreTicketLog';
import { ResolutionBody, RootCauseBody, SummaryBody } from './ArtifactBodies';
import { RelativeTime, type InternalStyle } from './ResponseCard';
import ActorAvatar from '../ActorAvatar';
import { ARTIFACT_LABEL, type ArtifactKind } from './responseTimeline';
import type { ResolutionNote } from './scenarios';

/**
 * Option 2 · the top card, one source of truth (21 Oct review).
 *
 *   lead       The card leads with whatever matters at this stage of the
 *              ticket — the resolution note once resolved, else the root
 *              cause, else the summary — and follows when a newer one lands.
 *   tabs       When there is more than one, they sit in the header as Dew's
 *              segmented tabs, so every option is visible up front. (A dropdown
 *              hid the fact that a summary, say, was there at all.)
 *   byline     "Updated 27 minutes ago by AI", or by the person's name once
 *              they have edited it. The card carries no Digit branding.
 *   one fix    Root cause and suggested fix are one section.
 *   no fold    No "View more": the content is the point of the card. A tall
 *              max-height scrolls only the rare, unusually long one.
 *
 * Every artifact also has its own entry in the conversation; this card is the
 * quick way to the one that matters now. "Ask AI" lives only in the reply dock.
 */

/** Flip to bring the conversation-log accordion back to the foot of the top card. */
const SHOW_LOG_IN_CARD = false;

/**
 * Who the byline credits, by avatar and name: "Updated 21 minutes ago by
 * (Ticket Resolver's mark) Ticket Resolver", or the person who edited it. A
 * Digit's mark gets a 20px slot, its artwork's size, as in the timeline.
 */
function Byline({ actor }: { actor: Actor }) {
  return (
    <span className="tr-o2-card-author">
      <ActorAvatar actor={actor} size="xxs" pixelSize={actor.kind === 'digit' ? 20 : undefined} />
      <span>{actor.name}</span>
    </span>
  );
}

export default function ArtifactCard({
  tab,
  ticketCode,
  proposed,
  available,
  active,
  onChange,
  resolution,
  internalStyle,
  log = [],
  locked = false,
  onForward,
  onDelete,
  onGenerate
}: {
  tab: TicketDetailsTab;
  ticketCode?: string;
  proposed: ProposedFlags;
  available: ArtifactKind[];
  active: ArtifactKind;
  onChange: (next: ArtifactKind) => void;
  resolution?: ResolutionNote;
  internalStyle: InternalStyle;
  /** The requester-visible chat before the ticket: the read-only record at the foot. */
  log?: MessageNode[];
  /** The Digit still has the ticket: the card can be read and copied, not changed. */
  locked?: boolean;
  /** Present only on email-based tickets: drops the card's text into the reply editor. */
  onForward?: (text: string) => void;
  onDelete: (kind: ArtifactKind) => void;
  /** Present where a summary can be generated on demand: the empty row becomes the button. */
  onGenerate?: () => void;
}) {
  const { summary, rootCause } = tab;
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const className = `tr-ai-card tr-o2-card ${internalStyle === 'border' ? 'is-accent' : ''}`;

  /* The log now lives in the Description box. The accordion stays built, behind
     this switch, in case it comes back to the foot of this card. */
  const logBlock = SHOW_LOG_IN_CARD ? <PreTicketLog messages={log} ticketCode={ticketCode} /> : null;

  /* Nothing to show (never generated, or every tab deleted): the single
     "Summarize ticket" row, with the record of the chat still below it. */
  if (available.length === 0) {
    /* The AI Design System's action banner (from the reference build), with
       the Freddy logo before the title and no info icon. Without `onGenerate`
       (the ticket is locked) it shows but can't be clicked. */
    return (
      <ActionBanner
        state="default"
        title="Summarize ticket"
        onSummarize={onGenerate}
        leadingIcon={<SparkleIcon size="md" />}
        hideInfoIcon
      />
    );
  }

  if (summary.state === 'generating') {
    return (
      <section className={className} aria-label="Summary">
        <div className="tr-ai-card-content" aria-live="polite">
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)' }}>
            <Spinner size="sm" aria-label="Generating summary" /> Thinking {elapsed(summary.elapsedSeconds ?? 0)}
          </span>
          <Shimmer width="100%" height={14} radius="sm" />
          <Shimmer width="70%" height={14} radius="sm" />
        </div>
        {logBlock}
      </section>
    );
  }

  /* A summary a person has edited is credited to them, at their edit's time. */
  const author: { by?: Actor; at?: string } =
    active === 'resolution'
      ? { by: resolution?.by, at: resolution?.at }
      : active === 'root-cause'
        ? { by: rootCause.by, at: rootCause.at }
        : summary.state === 'edited' && summary.editedBy
          ? { by: summary.editedBy.agent, at: summary.editedBy.at }
          : { by: summary.updatedBy, at: summary.updatedAt };

  const label = ARTIFACT_LABEL[active];

  return (
    <section className={className} aria-label={label}>
      <div className="tr-o2-card-head">
        <div className="tr-o2-card-title-group">
          {available.length > 1 ? (
            <SegmentedTabs size="mini" value={active} onValueChange={(next) => onChange(next as ArtifactKind)}>
              <SegmentedTabs.List aria-label="What this card shows">
                {available.map((kind) => (
                  <SegmentedTabs.Trigger key={kind} value={kind}>
                    {ARTIFACT_LABEL[kind]}
                  </SegmentedTabs.Trigger>
                ))}
              </SegmentedTabs.List>
            </SegmentedTabs>
          ) : (
            <h2 className="tr-ai-card-title">{label}</h2>
          )}
          {author.by && author.at && (
            <div className="tr-o2-card-meta">
              <span style={META}>Updated</span>
              <RelativeTime at={author.at} />
              <span style={META}>by</span>
              <Byline actor={author.by} />
            </div>
          )}
        </div>
        <span style={{ flex: 1 }} />
        <SummaryHeaderActions
          subject={label.toLowerCase()}
          readOnly={locked}
          onForward={onForward ? () => onForward(bodyRef.current?.innerText ?? '') : undefined}
          onDelete={() => onDelete(active)}
        />
      </div>

      {active === 'summary' && summary.state === 'out-of-date' && proposed.showOutOfDate && summary.newSince && (
        <InlineMessage variant="info">New messages arrived since this summary. Regenerate to include them.</InlineMessage>
      )}

      <div ref={bodyRef} className="tr-ai-card-content tr-o2-card-body">
        {active === 'summary' && <SummaryBody tab={tab} ticketCode={ticketCode} />}
        {active === 'root-cause' && (
          rootCause.state === 'analyzing' ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)' }} aria-live="polite">
              <Spinner size="sm" aria-label="Analysing" /> {rootCause.live?.label ?? 'Analysing'} {elapsed(rootCause.live?.elapsedSeconds ?? 0)}
            </span>
          ) : (
            <RootCauseBody tab={tab} ticketCode={ticketCode} />
          )
        )}
        {active === 'resolution' && resolution && <ResolutionBody note={resolution} ticketCode={ticketCode} />}
      </div>

      {/* From the reference build: feedback sits under the content, in the AI
          Design System's footer, rather than in the header. Not while the
          root cause is still being worked out. */}
      {!(active === 'root-cause' && rootCause.state === 'analyzing') && (
        <div style={{ marginBlockStart: 'var(--spacing-200)' }}>
          <AiFeedbackFooter key={active} />
        </div>
      )}

      {logBlock}
    </section>
  );
}

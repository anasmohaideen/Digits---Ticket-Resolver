import { useId, useState } from 'react';
import { Icon, Tag, Tooltip } from '@freshworks/dew-components';
import type { Actor, Channel, EventNode } from '../types';
import { META } from '../details.styles';
import ActorAvatar from '../ActorAvatar';
import EventLeadingIcon from '../EventLeadingIcon';
import { eventLine } from '../EventRow';
import Reveal from './Reveal';
import { fullDateTime, relativeAgo } from './relativeTime';
/**
 * Option 2 · one entry in the conversation (21 Oct review).
 *
 * A fork of Option 1's `MessageCard`, which stays as it is. The differences:
 *
 *   time       "Megan Brooks · 2 days ago" on the name line for every author,
 *              with the full date in a tooltip; no "Responded … (Mon, Oct 19)".
 *   internal   The AI's artifacts are private to agents, like a private note,
 *              but must not read as one (orange) or as a reply (white). Two
 *              treatments are offered for review — a tint or an accent edge.
 *   work log   "Worked for 5m" with the reasoning, on artifacts too.
 *   footer     Room for "Ask AI" and a thread's reply count.
 */

/**
 * `event` is the system private-note variant for "A assigned it to B" and
 * status changes. It is a message card in structure (avatar slot, header line,
 * body under a chevron) with the border, fill and padding taken away, so it
 * reads as the light row it replaces. In the data it would be a private note
 * with a system type tag, which is what the UI keys off.
 */
export type ResponseTone = 'requester' | 'reply' | 'forward' | 'public-note' | 'private-note' | 'worker' | 'internal-ai' | 'event';
export type InternalStyle = 'tint' | 'border';

export const INTERNAL_STYLE_LABEL: Record<InternalStyle, string> = {
  tint: 'Gradient edge',
  border: 'Accent edge'
};

/**
 * The AI's own entry (the Resolution card) keeps the gradient edge — a white
 * card on a 1px gradient border with a glow out of its top-left corner. The
 * recipe is `.tr-o2-edge` in the stylesheet. Notes no longer take it: per the
 * card guidelines, a private note is a flat card with no tint or gradient.
 */
function edgeClass(tone: ResponseTone, internalStyle: InternalStyle): string | undefined {
  if (tone === 'internal-ai' && internalStyle === 'tint') return 'tr-o2-edge tr-o2-edge-ai';
  return undefined;
}

/**
 * Fill follows the card guidelines (`Digits-Details-Card-Guidelines.md`):
 * what the helpdesk sends out — replies, the Digit's responses, forwards —
 * sits on the container fill; the requester's messages and both kinds of note
 * stay on the surface. Who can see an entry is carried by its chip, not its fill.
 */
function surface(tone: ResponseTone, internalStyle: InternalStyle): React.CSSProperties {
  switch (tone) {
    case 'event':
      return {};
    case 'worker':
    case 'reply':
    case 'forward':
      return { background: 'var(--color-fill-container)', border: '1px solid var(--color-boundary-border-mildest)' };
    case 'internal-ai':
      return internalStyle === 'tint'
        ? {}
        : {
            background: 'var(--color-fill-surface)',
            border: '1px solid var(--color-boundary-border-mildest)',
            borderInlineStart: '3px solid var(--color-boundary-semantic-highlight)'
          };
    default:
      return { background: 'var(--color-fill-surface)', border: '1px solid var(--color-boundary-border-mildest)' };
  }
}

/**
 * The card's type, as a Dew `Tag` beside the author's name. Colour says who can
 * see it: blue the requester, yellow agents only, gray sent outside the
 * conversation. The requester's own messages carry none.
 */
function typeChip(tone: ResponseTone): React.ReactNode {
  switch (tone) {
    case 'reply':
    case 'worker':
      return <Tag variant="blue" iconName="Reply">Reply</Tag>;
    case 'public-note':
      return <Tag variant="blue" iconName="Note">Public note</Tag>;
    case 'private-note':
      return <Tag variant="yellow" iconName="Lock">Private note</Tag>;
    case 'forward':
      return <Tag variant="gray" iconName="Forward">Forwarded</Tag>;
    default:
      return null;
  }
}

/** "2 days ago", with the full date on hover and to assistive tech. */
export function RelativeTime({ at }: { at: string }) {
  const full = fullDateTime(at);
  return (
    <Tooltip content={full} placement="top">
      {/* A block box, so Dew's tooltip wrapper takes the text's own height and
          the time lands on the same centre line as the name beside it. */}
      <time dateTime={at} aria-label={full} style={{ ...META, display: 'block', cursor: 'default' }}>
        {relativeAgo(at)}
      </time>
    </Tooltip>
  );
}

function workDuration(activities: EventNode[]): string {
  if (activities.length < 2) return '13s';
  const seconds = Math.max(1, Math.round((new Date(activities[activities.length - 1].at).getTime() - new Date(activities[0].at).getTime()) / 1000));
  return seconds < 60 ? `${seconds}s` : `${Math.round(seconds / 60)}m`;
}

function workPhases(activities: EventNode[]) {
  const phases: Array<{ key: string; reasoning?: string; actions: EventNode[] }> = [];
  for (const activity of activities) {
    const key = activity.intentGroup ?? activity.id;
    const current = phases[phases.length - 1];
    if (current?.key === key) current.actions.push(activity);
    else phases.push({ key, reasoning: activity.intent, actions: [activity] });
  }
  return phases;
}

function actionSegments(actions: EventNode[]) {
  const segments: Array<{ actions: EventNode[]; outcome?: string }> = [];
  let current: EventNode[] = [];
  for (const action of actions) {
    current.push(action);
    if (action.workOutcome) {
      segments.push({ actions: current, outcome: action.workOutcome });
      current = [];
    }
  }
  if (current.length) segments.push({ actions: current });
  return segments;
}

const REASONING: React.CSSProperties = { margin: 0, fontSize: '13px', lineHeight: '20px', color: 'var(--color-text-secondary)' };

/* One rhythm for the work log: 12px between a phase's reasoning, actions and
   outcome, 20px between phases, and room before the body when it is open. */
const STEP_GAP = 'var(--spacing-150)';
const PHASE_GAP = 'var(--spacing-250)';

/** "Worked for 13s": how long the Digit's work took, for the toggle that opens its log. */
export function workLabel(activities: EventNode[]): string {
  return `Worked for ${workDuration(activities)}`;
}

function WorkLog({ activities, conclusion, ticketCode }: { activities: EventNode[]; conclusion?: string; ticketCode?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div style={{ marginTop: 'var(--spacing-150)' }}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-050)', padding: 0, border: 0, background: 'transparent', cursor: 'pointer', font: 'inherit', fontSize: '14px', lineHeight: '20px', color: 'var(--color-text-secondary)' }}
      >
        {workLabel(activities)}
        <span className={`tr-o2-chevron ${open ? 'is-open' : ''}`}>
          <Icon name="ChevronRight" size="xs" color="var(--color-icon-secondary)" />
        </span>
      </button>
      <Reveal open={open} id={id}>
        <WorkLogBody activities={activities} conclusion={conclusion} ticketCode={ticketCode} />
      </Reveal>
    </div>
  );
}

/** The work log itself: each phase's reasoning, its actions, and what came of them. */
export function WorkLogBody({ activities, conclusion, ticketCode }: { activities: EventNode[]; conclusion?: string; ticketCode?: string }) {
  return (
        <div style={{ padding: 'var(--spacing-150) 0', display: 'flex', flexDirection: 'column', gap: PHASE_GAP }}>
          {workPhases(activities).map((phase) => (
            <div key={phase.key} style={{ display: 'flex', flexDirection: 'column', gap: STEP_GAP }}>
              {phase.reasoning && <p style={REASONING}>{phase.reasoning}</p>}
              {actionSegments(phase.actions).map((segment) => (
                <div key={segment.actions[0].id} style={{ display: 'flex', flexDirection: 'column', gap: STEP_GAP }}>
                  <ol style={{ margin: 0, paddingInlineStart: 'var(--spacing-200)', borderInlineStart: '2px solid var(--color-boundary-border-milder)', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: STEP_GAP }}>
                    {segment.actions.map((activity) => (
                      <li key={activity.id} style={{ display: 'grid', gridTemplateColumns: 'var(--spacing-250) minmax(0, 1fr)', alignItems: 'center', columnGap: 'var(--spacing-100)', fontSize: '13px', lineHeight: '18px', color: 'var(--color-text-secondary)' }}>
                        <span style={{ display: 'inline-flex', width: 'var(--spacing-250)', height: 'var(--spacing-250)', alignItems: 'center', justifyContent: 'center' }}>
                          <EventLeadingIcon event={activity} />
                        </span>
                        <span style={{ minWidth: 0, lineHeight: '24px' }}>{eventLine(activity, ticketCode, true)}</span>
                      </li>
                    ))}
                  </ol>
                  {segment.outcome && <p style={REASONING}>{segment.outcome}</p>}
                </div>
              ))}
            </div>
          ))}
          {conclusion && <p style={REASONING}>{conclusion}</p>}
        </div>
  );
}

export default function ResponseCard({
  id,
  actor,
  at,
  tone,
  internalStyle,
  channel,
  title,
  tags,
  work,
  conclusion,
  ticketCode,
  reveal = false,
  footer,
  headline,
  leading,
  timeText,
  children
}: {
  id: string;
  actor: Actor;
  at: string;
  tone: ResponseTone;
  internalStyle: InternalStyle;
  /** Badged onto the avatar for requesters and Digits, as in Option 1. */
  channel?: Channel;
  /** The artifact's name, leading the body: "Root cause". */
  title?: string;
  tags?: React.ReactNode;
  work?: EventNode[];
  /** The reasoning's last word, shown at the end of the work log. */
  conclusion?: string;
  ticketCode?: string;
  reveal?: boolean;
  footer?: React.ReactNode;
  /** `event` only: the sentence that stands where the name does. */
  headline?: React.ReactNode;
  /** `event` only: what stands in the avatar's place. */
  leading?: React.ReactNode;
  /** `event` only: the time as the light row has always shown it. */
  timeText?: string;
  children?: React.ReactNode;
}) {
  const isEvent = tone === 'event';
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsId = useId();
  const hasBody = Boolean(children);

  return (
    <article
      id={`stream-${id}`}
      className={[edgeClass(tone, internalStyle), reveal ? 'tr-conversation-reveal' : undefined].filter(Boolean).join(' ') || undefined}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'flex-start',
        gap: isEvent ? 'var(--spacing-100)' : 'var(--spacing-150)',
        padding: isEvent ? 'var(--spacing-050) 0' : 'var(--spacing-200)',
        borderRadius: isEvent ? 0 : '16px',
        ...surface(tone, internalStyle)
      }}
    >
      {leading ?? <ActorAvatar actor={actor} size="xs" pixelSize={32} channel={channel} />}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* As tall as the 32px avatar beside it, so the name and the time sit
            on the avatar's centre line rather than 4px above it. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-050)', flexWrap: 'wrap', minHeight: isEvent ? '24px' : '32px' }}>
          {headline ? (
            <span style={{ fontSize: '14px', lineHeight: '20px', color: 'var(--color-text-primary)' }}>{headline}</span>
          ) : (
            <span style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
              {actor.name}
            </span>
          )}
          {!isEvent && typeChip(tone)}
          <span aria-hidden style={META}>·</span>
          {isEvent && timeText ? (
            <time dateTime={at} title={fullDateTime(at)} style={META}>{timeText}</time>
          ) : (
            <RelativeTime at={at} />
          )}
          {isEvent && hasBody && (
            <button
              type="button"
              aria-expanded={detailsOpen}
              aria-controls={detailsId}
              onClick={() => setDetailsOpen((value) => !value)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-025)', marginInlineStart: 'var(--spacing-050)', padding: 0, border: 0, background: 'transparent', cursor: 'pointer', font: 'inherit', fontSize: '13px', lineHeight: '20px', color: 'var(--color-text-secondary)' }}
            >
              Details
              <span className={`tr-o2-chevron ${detailsOpen ? 'is-open' : ''}`}>
                <Icon name="ChevronRight" size="xs" color="var(--color-icon-secondary)" />
              </span>
            </button>
          )}
          {tags}
        </div>

        {work && work.length > 0 && <WorkLog activities={work} conclusion={conclusion} ticketCode={ticketCode} />}

        {title && (
          <div style={{ marginTop: 'var(--spacing-150)', fontSize: '14px', lineHeight: '20px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
            {title}
          </div>
        )}

        {isEvent ? (
          hasBody && (
            <Reveal open={detailsOpen} id={detailsId}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-050)', padding: 'var(--spacing-050) 0 var(--spacing-100)' }}>
                {children}
              </div>
            </Reveal>
          )
        ) : (
          <div style={{ marginTop: 'var(--spacing-100)', fontSize: '14px', lineHeight: '20px', color: 'var(--color-text-primary)' }}>
            {children}
          </div>
        )}

        {footer && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', flexWrap: 'wrap', marginTop: 'var(--spacing-150)' }}>
            {footer}
          </div>
        )}
      </div>
    </article>
  );
}

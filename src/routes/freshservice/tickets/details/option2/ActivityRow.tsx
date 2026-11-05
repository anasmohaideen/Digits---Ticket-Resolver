import { useId, useState, type MouseEvent, type ReactNode } from 'react';
import { Icon, Tooltip } from '@freshworks/dew-components';
import type { Actor, EventNode } from '../types';
import ActorAvatar from '../ActorAvatar';
import Reveal from './Reveal';
import { WorkLogBody, workLabel } from './ResponseCard';
import { fullDateTime, relativeAgo } from './relativeTime';

/**
 * Option 2 · one line in the timeline for everything that isn't a message:
 * assignments, property and status changes, the Summary and Root cause.
 *
 *   [action icon]   (av) Ticket Resolver assigned it to Network Team
 *                   via Intelligent routing   25 minutes ago  ⌄
 *                   └ the open panel, aligned to the sentence
 *
 * The action icon leads and says what happened. Every person or Digit named
 * in the sentence carries their avatar right beside the name (`ActivityPerson`):
 * Ticket Resolver's own mark, or the person's photo. One text style for the
 * sentence: 14/24, the people and the thing acted on in semibold, the verb
 * regular, then the time in the muted meta style, with no separator. A row with more to show carries a chevron
 * straight after its text, and the whole line opens it. "View" (Summary and
 * Root cause) sits beside the time and takes the reader to the pinned card.
 */
export default function ActivityRow({
  id,
  at,
  icon,
  text,
  tag,
  meta,
  details,
  work,
  conclusion,
  ticketCode,
  view
}: {
  id: string;
  /** Who did it; their avatar and name are part of `text`. */
  actor: Actor;
  at: string;
  /** What kind of thing happened (`EventLeadingIcon`). */
  icon?: ReactNode;
  /** The sentence: "Ticket Resolver assigned it to Network Team". */
  text: ReactNode;
  /** An outcome badge after the sentence (Blocked, Inconclusive). */
  tag?: ReactNode;
  /** Ends the sentence, in its own style: "via Intelligent routing". */
  meta?: string;
  /** What the row opens to. */
  details?: ReactNode;
  /** The Digit's work behind this row; the row opens to its log. */
  work?: EventNode[];
  conclusion?: string;
  ticketCode?: string;
  /** Takes the reader to where the thing now lives (the pinned card). */
  view?: { onClick: () => void; ariaLabel: string };
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const hasWork = Boolean(work && work.length > 0);
  const expandable = !view && (Boolean(details) || hasWork);

  /* The whole line opens the panel for the pointer; keyboard users have the
     chevron, which is the real control. A click that ends a text selection,
     or lands on another control, leaves it alone. */
  const onLineClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button, a')) return;
    if (window.getSelection()?.toString()) return;
    if (view) { view.onClick(); return; }
    if (!expandable) return;
    setOpen((value) => !value);
  };

  return (
    <article id={`stream-${id}`} className={`tr-o2-activity${expandable ? ' is-expandable' : ''}${view ? ' is-artifact-pointer' : ''}${open ? ' is-open' : ''}`}>
      <div className="tr-o2-activity-line" onClick={onLineClick}>
        <span className="tr-o2-activity-lead">{icon}</span>
        <p className="tr-o2-activity-text">
          {text}
          {/* How it happened reads as part of the sentence: "… to Network Team via Intelligent routing". */}
          {meta && <> {meta}</>}
          {tag && <span className="tr-o2-activity-tag">{tag}</span>}
          {/* No separator: the smaller, muted type already sets the time apart. */}
          {' '}
          <Tooltip content={fullDateTime(at)} placement="top">
            <time className="tr-o2-activity-meta" dateTime={at} aria-label={fullDateTime(at)} tabIndex={0}>
              {relativeAgo(at)}
            </time>
          </Tooltip>
          {view && (
            <Tooltip content={view.ariaLabel} placement="top">
              <button type="button" className="tr-o2-activity-view" aria-label={view.ariaLabel} onClick={view.onClick}>
                View
              </button>
            </Tooltip>
          )}
          {expandable && (
            <button
              type="button"
              className="tr-o2-activity-chevron"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={open ? 'Hide details' : 'Show details'}
              onClick={() => setOpen((value) => !value)}
            >
              <Icon name="ChevronDown" size="xs" color="currentColor" />
            </button>
          )}
        </p>
      </div>

      {expandable && (
        <div className="tr-o2-activity-panel">
          <Reveal open={open} id={panelId}>
            <div className="tr-o2-activity-panel-body">
              {details}
              {hasWork && (
                <>
                  <p className="tr-o2-activity-caption">{workLabel(work!)}</p>
                  <WorkLogBody activities={work!} conclusion={conclusion} ticketCode={ticketCode} />
                </>
              )}
            </div>
          </Reveal>
        </div>
      )}
    </article>
  );
}

/**
 * A person or Digit named in an activity row: their avatar, 6px, then the name
 * in semibold. A Digit's mark gets a 20px slot (its artwork is 20px at most),
 * so the gap to its name looks the same as beside a 24px photo.
 */
export function ActivityPerson({ actor }: { actor: Actor }) {
  return (
    <span className="tr-o2-activity-person">
      <ActorAvatar actor={actor} size="xxs" pixelSize={actor.kind === 'digit' ? 20 : undefined} />
      <strong>{actor.name}</strong>
    </span>
  );
}

export const activityPerson = (actor: Actor) => <ActivityPerson actor={actor} />;

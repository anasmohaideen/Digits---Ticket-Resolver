import { useId, useLayoutEffect, useRef, useState } from 'react';
import { Icon, TextButton } from '@freshworks/dew-components';
import type { Actor, Attachment, Channel, Description, MessageNode } from '../types';
import { CHANNEL_LABEL, CHANNEL_LOGO } from '../details.tokens';
import RichTextView from '../RichTextView';
import AttachmentTiles from './AttachmentTiles';
import { LogLines, logSpeaker } from './PreTicketLog';
import { Face, actorKey } from './MessagesPill';
import Reveal from './Reveal';

/**
 * Option 2 · the Description box, the same on every ticket and always right
 * after the top card.
 *
 *   description   The only body text. On a person's ticket it is their own text (a form, an
 *                 email); on one the Concierge created it is the description
 *                 it wrote from the chat.
 *   source        An AI-created ticket keeps the chat it came from in the
 *                 card's footer, collapsed ("Megan Brooks and Workplace
 *                 Concierge · 6 messages"): a read-only copy, boxed apart so
 *                 it never reads as part of the description. The chat is kept
 *                 for 90 days; after that the row is simply not there.
 *   attachments   Always under the description, whatever happened to the chat.
 *
 * Long descriptions fold to a few lines with "View more" / "View less", as the
 * production field does: no inner scrolling.
 */

/** About seven lines of 22px text. */
const FOLDED_HEIGHT = 154;
// Reversible switch: true = no border/padding around the Description; false = original boxed look.
const FLAT_DESCRIPTION = false;

const textOf = (description: Description) =>
  description.body.map((part) => (typeof part === 'string' ? part : part.label)).join('\n\n');

export default function DescriptionBox({
  description,
  ticketCode,
  log,
  requesterName,
  requester,
  channel,
  attachments,
  conversationExpired = false
}: {
  description: Description;
  ticketCode?: string;
  /** The requester-visible chat before the ticket; when present the ticket was created from it. */
  log: MessageNode[];
  requesterName?: string;
  requester?: Actor;
  /** Where the chat happened. */
  channel?: Channel;
  /** Files listed at the foot; defaults to the description's own. */
  attachments?: Attachment[];
  /** The chat is past its 90 days: only the description and files are left. */
  conversationExpired?: boolean;
}) {
  const fromChat = log.length > 0;
  const showSource = fromChat && !conversationExpired;
  const bodyId = useId();
  const sourceId = useId();
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);

  /* The chat's own description is the Concierge's brief; the first message is the fallback. */
  const current = fromChat && description.brief ? description.brief : textOf(description);

  /* Only offer "View more" when the content is actually taller than the fold. */
  useLayoutEffect(() => {
    const node = bodyRef.current;
    if (!node) return;
    const measure = () => setOverflows(node.scrollHeight > FOLDED_HEIGHT + 4);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [current]);

  const files = fromChat
    ? log.flatMap((message) => message.attachments ?? [])
    : (attachments ?? description.attachments);
  const folded = overflows && !expanded;

  /* The chat's two sides, as the requester saw them: every Digit spoke as the Concierge. */
  const speakers: Actor[] = [];
  for (const message of log) {
    if (!speakers.some((actor) => logSpeaker(actor) === logSpeaker(message.actor))) speakers.push(message.actor);
  }
  const concierge = speakers.find((actor) => actor.kind === 'digit');
  const parties = [requesterName ?? requester?.name ?? 'The requester', concierge ? logSpeaker(concierge) : 'Workplace Concierge'].join(' and ');

  return (
    <section className={`tr-o2-desc${FLAT_DESCRIPTION ? ' is-flat' : ''}`} aria-label="Description">
      <div className="tr-o2-desc-head">
        <h3 className="tr-o2-desc-title">Description</h3>
      </div>

      <div
        id={bodyId}
        ref={bodyRef}
        className={`tr-o2-desc-body ${folded ? 'is-folded' : ''}`}
        style={folded ? { maxHeight: FOLDED_HEIGHT } : undefined}
      >
        {fromChat ? (
          current.split('\n\n').map((paragraph, i) => <p key={i} className="tr-o2-desc-para">{paragraph}</p>)
        ) : (
          <RichTextView value={description.body} ticketCode={ticketCode} />
        )}
      </div>

      {overflows && (
        <TextButton
          type="button"
          variant="link"
          size="mini"
          className="tr-o2-desc-more"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'View less' : 'View more'}
        </TextButton>
      )}

      {files.length > 0 && (
        <div className="tr-o2-desc-files">
          <div className="tr-o2-desc-files-label">Attachments ({files.length})</div>
          <AttachmentTiles attachments={files.map((file) => ({ ...file, snippet: undefined }))} />
        </div>
      )}

      {/* The chat this ticket came from is the card's footer: a full-width strip
          along its bottom edge, below the description and its files, that
          opens in place to the read-only transcript. */}
      {showSource && (
        <div className={`tr-o2-desc-source${sourceOpen ? ' is-open' : ''}`}>
          <button
            type="button"
            className="tr-o2-desc-source-head"
            aria-expanded={sourceOpen}
            aria-controls={sourceId}
            onClick={() => setSourceOpen((value) => !value)}
          >
            {/* Says where the description came from, then who was in that chat
                (their faces; the names are in the transcript) and how long it was. */}
            <span className="tr-o2-desc-source-label">
              Description generated from the conversation
              {channel ? (
                <>
                  {' in '}
                  <span className="tr-o2-desc-source-channel">
                    {CHANNEL_LOGO[channel] && <img src={CHANNEL_LOGO[channel]} alt="" width={16} height={16} />}
                    <strong>{CHANNEL_LABEL[channel]}</strong>
                  </span>
                </>
              ) : null}
            </span>
            <span className="tr-o2-desc-source-faces" aria-label={parties}>
              {speakers.slice(0, 3).map((actor, i) => (
                <span key={actorKey(actor)} style={{ marginLeft: i === 0 ? 0 : -6, zIndex: 3 - i }}>
                  <Face actor={actor} />
                </span>
              ))}
            </span>
            <span className="tr-o2-desc-source-count">{log.length} {log.length === 1 ? 'message' : 'messages'}</span>
            <span style={{ flex: 1 }} />
            <Icon name={sourceOpen ? 'ChevronUp' : 'ChevronDown'} size="sm" color="var(--color-icon-secondary)" />
          </button>
          <Reveal open={sourceOpen} id={sourceId}>
            <div className="tr-o2-desc-source-body">
              <LogLines messages={log} ticketCode={ticketCode} />
              <p className="tr-o2-desc-source-note">
                Read-only copy of the chat before this ticket was created. It isn’t part of the description.
              </p>
            </div>
          </Reveal>
        </div>
      )}
    </section>
  );
}

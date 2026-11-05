import { useId, useLayoutEffect, useRef, useState } from 'react';
import { Icon, TextButton } from '@freshworks/dew-components';
import type { Attachment, Description, MessageNode } from '../types';
import RichTextView from '../RichTextView';
import AttachmentTiles from './AttachmentTiles';
import { LogLines } from './PreTicketLog';

/**
 * Option 2 · the Description box, the same on every ticket and always right
 * after the top card.
 *
 *   a person's ticket   The requester's own text (a form, an email) and the
 *                       files that came with it. Editable in the product.
 *   an AI-created one   The conversation before the ticket was created, as a
 *                       read-only copy, with the chat's files at its foot.
 *
 * Long content folds to a few lines with "View more" / "View less", as the
 * production field does: no inner scrolling.
 */

/** About seven lines of 22px text. */
const FOLDED_HEIGHT = 154;
// Reversible switch: true = no border/padding around the Description; false = original boxed look.
const FLAT_DESCRIPTION = false;

export default function DescriptionBox({
  description,
  ticketCode,
  log,
  requesterName,
  attachments
}: {
  description: Description;
  ticketCode?: string;
  /** The requester-visible chat before the ticket; when present it is the content. */
  log: MessageNode[];
  requesterName?: string;
  /** Files listed at the foot; defaults to the description's own. */
  attachments?: Attachment[];
}) {
  const isLog = log.length > 0;
  const bodyId = useId();
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  /* Only offer "View more" when the content is actually taller than the fold. */
  useLayoutEffect(() => {
    const node = bodyRef.current;
    if (!node) return;
    const measure = () => setOverflows(node.scrollHeight > FOLDED_HEIGHT + 4);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [isLog, log, description]);

  const files = isLog
    ? log.flatMap((message) => message.attachments ?? [])
    : (attachments ?? description.attachments);
  const folded = overflows && !expanded;

  return (
    <section className={`tr-o2-desc${FLAT_DESCRIPTION ? ' is-flat' : ''}`} aria-label="Description">
      <div className="tr-o2-desc-head">
        <h3 className="tr-o2-desc-title">Description</h3>
      </div>
      {isLog && (
        <p className={`tr-o2-desc-meta${description.brief ? ' has-brief' : ''}`}>
          {requesterName ?? 'The requester'} and Workplace Concierge · {log.length} messages
        </p>
      )}
      {isLog && description.brief && <p className="tr-o2-desc-brief">{description.brief}<span className="tr-o2-desc-byline"><Icon name="Ai" size="sm" color="var(--color-icon-semantic-highlight)" /> Summarised by AI</span></p>}

      <div
        id={bodyId}
        ref={bodyRef}
        className={`tr-o2-desc-body ${folded ? 'is-folded' : ''}`}
        style={folded ? { maxHeight: FOLDED_HEIGHT } : undefined}
      >
        {isLog ? (
          <LogLines messages={log} ticketCode={ticketCode} />
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
    </section>
  );
}

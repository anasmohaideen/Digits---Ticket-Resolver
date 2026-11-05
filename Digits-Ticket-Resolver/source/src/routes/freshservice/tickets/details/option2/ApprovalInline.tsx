import { useId, useState } from 'react';
import { IconButton, Select, Tag, TextButton } from '@freshworks/dew-components';
import type { ApprovalNode } from '../types';
import ActorAvatar from '../ActorAvatar';
import RichTextView from '../RichTextView';
import Reveal from './Reveal';

/**
 * Option 2 · the approval, inline as the last card in the conversation.
 *
 * It used to float over the conversation in the reply dock, covering the
 * messages it asks about. Now it is the final card in the column, in the
 * Digit's voice ("Ticket Resolver · Approval needed"), so it reads as the
 * next thing in the story and always sits just above the reply dock.
 *
 *   one        A single card: header, title, one-line reason, body, and
 *              Reject / Approve — the last two stay put when it is folded.
 *   several    A stack. The next approvals peek out beneath the front card,
 *              and the arrows in its header cycle through them, newest first.
 *   decided    The card leaves; the decision is recorded in the Digit's
 *              "Worked for" log, as before.
 *   collapse   The footer link folds the body away; title, reason
 *              and buttons stay, and the link says what is folded.
 *
 * Built from the conversation cards' own pieces: `ActorAvatar`, the shared
 * gradient edge (`tr-o2-edge`) and Dew's Tag, IconButton, Select and TextButton.
 */

const NAME_STYLE: React.CSSProperties = {
  font: 'var(--font-body-semibold)',
  color: 'var(--color-text-primary)'};

const BODY_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-200)',
  font: 'var(--font-body)',
  color: 'var(--color-text-secondary)'};

/** The one-line reason: authored, else the first sentence of the longer "why". */
function reasonOf(approval: ApprovalNode): string {
  if (approval.reason) return approval.reason;
  const text = approval.whyAction.map((part) => (typeof part === 'string' ? part : part.label)).join('');
  const end = text.search(/[.!?](\s|$)/);
  return (end === -1 ? text : text.slice(0, end + 1)).trim();
}

export default function ApprovalInline({
  approvals: unordered,
  ticketCode,
  defaultExpanded = true,
  onDecide
}: {
  /** Pending approvals, in any order; the deck shows the newest first. */
  approvals: ApprovalNode[];
  ticketCode?: string;
  defaultExpanded?: boolean;
  onDecide: (approval: ApprovalNode, state: 'approved' | 'rejected') => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  /* Proposed values stay editable until the agent decides. */
  const [edits, setEdits] = useState<Record<string, Record<string, string>>>({});
  const bodyId = useId();

  /* Newest in front, oldest at the back of the stack. */
  const approvals = [...unordered].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  const count = approvals.length;
  if (count === 0) return null;

  const position = Math.min(index, count - 1);
  const approval = approvals[position];
  const peeks = Math.min(count - 1, 2);
  const fields = approval.proposedFields;
  const valueOf = (field: { field: string; to: string }) => edits[approval.id]?.[field.field] ?? field.to;

  const go = (step: 1 | -1) => {
    setDirection(step === 1 ? 'next' : 'prev');
    setIndex((position + step + count) % count);
  };

  return (
    <section
      className="tr-o2-approval-deck"
      data-count={count}
      aria-label={count > 1 ? `Approvals waiting, ${position + 1} of ${count}` : 'Approval waiting'}
      style={{ '--peeks': peeks } as React.CSSProperties}
    >
      {Array.from({ length: peeks }, (_, i) => (
        <span key={i} className="tr-o2-approval-peek" style={{ '--i': i + 1 } as React.CSSProperties} aria-hidden />
      ))}

      <article key={approval.id} className={`tr-o2-approval tr-o2-edge tr-o2-edge-ai${count > 1 ? ` is-${direction}` : ''}`}>
        <div className="tr-o2-approval-head">
          <ActorAvatar actor={approval.actor} pixelSize={24} />
          <span style={NAME_STYLE}>{approval.actor.name}</span>
          <Tag variant="yellow">Approval needed</Tag>
          <span style={{ flex: 1 }} />
          {count > 1 && (
            <div className="tr-o2-approval-pager" role="group" aria-label="Cycle through approvals">
              <IconButton iconName="ChevronLeft" aria-label="Previous approval" size="mini" onClick={() => go(-1)} />
              <span aria-live="polite">{position + 1} of {count}</span>
              <IconButton iconName="ChevronRight" aria-label="Next approval" size="mini" onClick={() => go(1)} />
            </div>
          )}
        </div>

        <strong className="tr-o2-approval-title" style={NAME_STYLE}>{approval.title}</strong>
        {/* One line, in every state, so a folded card still says why it asks. */}
        <p className="tr-o2-approval-reason" title={reasonOf(approval)}>{reasonOf(approval)}</p>

        <Reveal open={expanded} id={bodyId}>
          <div className="tr-o2-approval-details">
            {fields ? (
              <dl className="tr-o2-approval-fields">
                {fields.map((field) => (
                  <div key={field.field} className="tr-o2-approval-field">
                    <dt>{field.field}</dt>
                    <dd>
                      <Select
                        aria-label={field.field}
                        options={[...new Set([field.to, field.from].filter((option) => option !== '--'))].map((option) => ({ value: option, label: option }))}
                        value={{ value: valueOf(field), label: valueOf(field) }}
                        onValueChange={(option) => option && setEdits((current) => ({
                          ...current,
                          [approval.id]: { ...current[approval.id], [field.field]: String(option.value) }
                        }))}
                      />
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <div style={BODY_STYLE}>
                <div>
                  <strong style={{ ...NAME_STYLE, display: 'block' }}>What this action</strong>
                  <RichTextView value={approval.what} ticketCode={ticketCode} />
                </div>
                <div>
                  <strong style={{ ...NAME_STYLE, display: 'block' }}>Why this action</strong>
                  <RichTextView value={approval.whyAction} ticketCode={ticketCode} />
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {/* Outside the fold: the toggle, Reject and Approve sit in the same
            place whether the card is open or folded. Opening only slides them
            down with it. The toggle says what is folded away, so a folded card
            never reads as missing something. */}
        <div className="tr-o2-approval-footer">
          <TextButton
            type="button"
            variant="link"
            suffixIcon={expanded ? 'ChevronUp' : 'ChevronDown'}
            aria-expanded={expanded}
            aria-controls={bodyId}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Hide details' : fields ? `Review ${fields.length} ${fields.length === 1 ? 'change' : 'changes'}` : 'View details'}
          </TextButton>
          <div className="tr-o2-approval-actions">
            <TextButton type="button" variant="secondary" onClick={() => onDecide(approval, 'rejected')}>Reject</TextButton>
            <TextButton type="button" variant="primary" onClick={() => onDecide(approval, 'approved')}>Approve</TextButton>
          </div>
        </div>
      </article>
    </section>
  );
}

/**
 * Floats above the reply buttons while an approval is waiting but its card is
 * out of view. Clicking it goes to the card.
 */
export function ApprovalPill({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <TextButton type="button" variant="secondary" suffixIcon="ArrowDown" onClick={onClick}>
      {count === 1 ? '1 approval pending' : `${count} approvals pending`}
    </TextButton>
  );
}

/** Floats above the reply buttons while employee messages sit below the fold. */
export function NewMessagePill({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <TextButton type="button" variant="secondary" suffixIcon="ArrowDown" onClick={onClick}>
      {count === 1 ? '1 new message' : `${count} new messages`}
    </TextButton>
  );
}

/** The floating pills, side by side, centred over the dock. */
export function PillRow({ children }: { children: React.ReactNode }) {
  return <div className="tr-o2-approval-pill">{children}</div>;
}

import { useState } from 'react';
import { Icon, IconButton, Menu, TextButton, type IMenuOption } from '@freshworks/dew-components';
import type { Actor } from './types';
import { META } from './details.styles';
import ActorAvatar from './ActorAvatar';

/**
 * The parts both AI cards share: the sparkle, the header's action set, the
 * "Ask AI" button and the helpful / not helpful pair.
 *
 * "Ask AI" opens the Copilot panel in the product. Nothing in this repo builds
 * that panel, so the button is present and inert — the spec says it "can appear
 * where specified and open whatever it opens today", and today that is nothing.
 */

/** The Freddy AI mark, from `Assets/Icons/Freddy AI.svg`. */
export function SparkleIcon({ size = 'sm' }: { size?: '2xs' | 'xs' | 'sm' | 'md' }) {
  return <Icon name="Ai" size={size} color="var(--color-icon-secondary)" title="Agent Concierge" />;
}

export function AskAiButton() {
  return (
    <TextButton type="button" variant="secondary" prefixIcon="Ai">
      Ask AI
    </TextButton>
  );
}

/**
 * Thumbs match the feedback affordance in the AI card reference. Dew supplies
 * the colours, while these two small vectors avoid emoji-style CSAT faces.
 */
export function FeedbackButtons({ onNotHelpful }: { onNotHelpful?: () => void }) {
  const [given, setGiven] = useState<'helpful' | 'not-helpful' | null>(null);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-100)' }}>
      {(['helpful', 'not-helpful'] as const).map((value) => (
        <IconButton
          key={value}
          iconName={value === 'helpful' ? (given === value ? 'Actions/UpvoteFilled' : 'Actions/Upvote') : (given === value ? 'Actions/DownvoteFilled' : 'Actions/Downvote')}
          aria-label={value === 'helpful' ? 'Helpful' : 'Not helpful'}
          aria-pressed={given === value}
          size="mini"
          onClick={() => {
            setGiven(value);
            if (value === 'not-helpful') onNotHelpful?.();
          }}
        />
      ))}
    </span>
  );
}

/**
 * "Updated 9:35 AM by Ticket Resolver at handover" — the attribution line both
 * cards carry, with the actor's avatar inline.
 */
export function ActorMeta({ actor, suffix }: { actor: Actor; suffix?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-050)', ...META }}>
      <ActorAvatar actor={actor} size="xxs" />
      <span>{actor.name}</span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
}

/**
 * The Summary card's existing header actions. Each is a no-op in the
 * prototype except regenerate, which the owning card wires to its own state.
 */
export function SummaryHeaderActions({
  onRegenerate,
  onCopy,
  onEdit,
  copied = false,
  editing = false,
  onAddNote,
  onForward,
  onDelete,
  subject = 'summary'
}: {
  onRegenerate?: () => void;
  onCopy?: () => void;
  onEdit?: () => void;
  copied?: boolean;
  editing?: boolean;
  onAddNote?: () => void;
  /** Omit to hide "Forward": it only applies to email-based tickets. */
  onForward?: () => void;
  onDelete?: () => void;
  subject?: string;
}) {
  const note: IMenuOption = { value: 'note', label: 'Add as note', prefixIcon: 'NewNote' };
  const forward: IMenuOption = { value: 'forward', label: 'Forward', prefixIcon: 'Forward' };
  const remove: IMenuOption = { value: 'delete', label: 'Delete', prefixIcon: 'Delete' };
  const options = onForward ? [note, forward, remove] : [note, remove];
  return (
    <>
      <IconButton iconName="Refresh" aria-label={`Regenerate ${subject}`} size="mini" onClick={onRegenerate} />
      <IconButton iconName="Copy" aria-label={copied ? `Copied ${subject}` : `Copy ${subject}`} size="mini" onClick={onCopy} />
      {onEdit && <IconButton iconName="Edit" aria-label={`Edit ${subject}`} size="mini" aria-pressed={editing} onClick={onEdit} />}
      <Menu
        aria-label={`More ${subject} actions`}
        options={options}
        onClick={(option: IMenuOption) => {
          if (option.value === 'note') onAddNote?.();
          if (option.value === 'forward') onForward?.();
          if (option.value === 'delete') onDelete?.();
        }}
        slots={{ trigger: <IconButton iconName="MoreVertical" aria-label={`More ${subject} actions`} size="mini" /> }}
      />
    </>
  );
}

/**
 * The collapse chevron both cards carry on the right of their header. A plain
 * `IconButton` with `aria-expanded`, matching the sidebar's Properties toggle.
 */
export function CollapseToggle({
  open,
  onToggle,
  controls,
  label
}: {
  open: boolean;
  onToggle: () => void;
  controls: string;
  label: string;
}) {
  return (
    <IconButton
      iconName={open ? 'ChevronUp' : 'ChevronDown'}
      aria-label={open ? `Collapse ${label}` : `Expand ${label}`}
      aria-expanded={open}
      aria-controls={controls}
      size="mini"
      onClick={onToggle}
    />
  );
}

import { useState } from 'react';
import { Icon, IconButton, Menu, TextButton, type IMenuOption } from '@freshworks/dew-components';
import type { Actor } from './types';
import { FREDDY_AI_ICON } from './details.tokens';
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
  return <Icon custom src={FREDDY_AI_ICON} size={size} alt="" title="Freddy AI" />;
}

export function AskAiButton() {
  return (
    <TextButton type="button" variant="secondary" prefixIcon={{ custom: true, iconSrc: FREDDY_AI_ICON }}>
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
        <button
          key={value}
          type="button"
          aria-label={value === 'helpful' ? 'Helpful' : 'Not helpful'}
          aria-pressed={given === value}
          onClick={() => {
            setGiven(value);
            if (value === 'not-helpful') onNotHelpful?.();
          }}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, padding: 2, border: 0, background: 'transparent', cursor: 'pointer', color: given === value ? 'var(--color-icon-selected)' : 'var(--color-icon-secondary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={value === 'not-helpful' ? { transform: 'rotate(180deg)' } : undefined} aria-hidden="true">
            <path d="M7 10v11H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3Zm0 0 4.2-7a2 2 0 0 1 3.5 1.8L13.8 8H20a2 2 0 0 1 1.9 2.5l-2 8A3 3 0 0 1 17 21H7" />
          </svg>
        </button>
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
  onAddNote,
  onForward,
  onDelete,
  onEdit,
  readOnly = false,
  subject = 'summary'
}: {
  onRegenerate?: () => void;
  onAddNote?: () => void;
  /** Omit to hide "Forward": it only applies to email-based tickets. */
  onForward?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  /** Read-only: copy stays, everything that changes the card is disabled. */
  readOnly?: boolean;
  subject?: string;
}) {
  const note: IMenuOption = { value: 'note', label: 'Add as note', prefixIcon: 'NewNote' };
  const forward: IMenuOption = { value: 'forward', label: 'Forward', prefixIcon: 'Forward' };
  const remove: IMenuOption = { value: 'delete', label: 'Delete', prefixIcon: 'Delete' };
  const options = onForward ? [note, forward, remove] : [note, remove];
  return (
    <>
      <IconButton iconName="Refresh" aria-label={`Regenerate ${subject}`} size="mini" disabled={readOnly} onClick={onRegenerate} />
      <IconButton iconName="Copy" aria-label={`Copy ${subject}`} size="mini" />
      <IconButton iconName="Edit" aria-label={`Edit ${subject}`} size="mini" disabled={readOnly} onClick={onEdit} />
      <Menu
        aria-label={`More ${subject} actions`}
        disabled={readOnly}
        options={options}
        onClick={(option: IMenuOption) => {
          if (option.value === 'note') onAddNote?.();
          if (option.value === 'forward') onForward?.();
          if (option.value === 'delete') onDelete?.();
        }}
        slots={{ trigger: <IconButton iconName="MoreVertical" aria-label={`More ${subject} actions`} size="mini" disabled={readOnly} /> }}
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

import { InlineMessage, TextButton } from '@freshworks/dew-components';

/**
 * The dock when the ticket cannot be replied to (closed, or the viewer has
 * view-only access): the composer is replaced by one Dew inline message and,
 * where it applies, a single way back in.
 */
export default function ReadOnlyDock({ reason = 'This ticket is closed.', onReopen }: { reason?: string; onReopen?: () => void }) {
  return (
    <div className="tr-o2-reply-transition">
      <div className="tr-o2-reply-dock">
        <div className="tr-o2-reply-dock-stack">
          <InlineMessage variant="info">
            {reason} Replies and notes are turned off.{' '}
            {onReopen && <TextButton variant="link" onClick={onReopen}>Reopen ticket</TextButton>}
          </InlineMessage>
        </div>
      </div>
    </div>
  );
}

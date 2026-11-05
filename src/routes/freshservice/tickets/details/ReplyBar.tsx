import { Menu, TextButton } from '@freshworks/dew-components';
import type { Actor, Channel } from './types';
import { CHANNEL_LOGO, isChatChannel } from './details.tokens';
import ActorAvatar from './ActorAvatar';

/**
 * B9 · Reply bar (collapsed composer).
 *
 * The editors themselves are out of scope — these buttons open today's editors
 * in the product, and nothing in this prototype, so they are inert. Only the
 * labels change by channel:
 *
 *   slack / teams → "Reply" with an "in Slack" / "in Teams" badge, and a
 *                   private note only, because there is no public note to post
 *                   back to a chat thread.
 *   everything else → today's labels, with public and private notes.
 */
export default function ReplyBar({
  viewer,
  source
}: {
  viewer: Actor;
  source: Channel;
}) {
  const chat = isChatChannel(source);

  return (
    <div className="tr-reply-bar">
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--spacing-150)', flexWrap: 'wrap' }}>
        <ActorAvatar actor={viewer} size="sm" />

        <TextButton type="button" variant="secondary" prefixIcon={chat && CHANNEL_LOGO[source] ? { custom: true, iconSrc: CHANNEL_LOGO[source] } : 'Reply'}>
          Reply
        </TextButton>

        <TextButton type="button" variant="secondary" prefixIcon="Forward">
          Forward
        </TextButton>

        {chat ? (
          <TextButton type="button" variant="secondary" prefixIcon="Lock">
            Add private note
          </TextButton>
        ) : (
          <Menu
            aria-label="Add note"
            onClick={() => {}}
            options={[
              { value: 'public', label: 'Public note' },
              { value: 'private', label: 'Private note' }
            ]}
            slots={{
              trigger: (
                <TextButton type="button" variant="secondary" prefixIcon="NewNote" suffixIcon="ChevronDown">
                  Add note
                </TextButton>
              )
            }}
          />
        )}
      </div>
    </div>
  );
}

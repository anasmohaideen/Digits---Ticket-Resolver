import { Avatar } from '@freshworks/dew-components';
import type { TAvatarColorVariant, TAvatarSize } from '@freshworks/dew-components';
import type { Actor, Channel } from './types';
import { CHANNEL_LOGO, DIGIT_AVATAR, PERSON_AVATAR, initials } from './details.tokens';

/**
 * One avatar for every kind of actor in the stream.
 *
 * Dew's `Avatar` picks a random colour variant per mount when none is given,
 * which is why `TicketDetail`'s `RequesterAvatar` pins one. The same problem is
 * worse here — the same person appears on a dozen rows — so the variant is
 * derived from the name and stays stable for the life of the ticket.
 */

const PERSON_VARIANTS: TAvatarColorVariant[] = ['default', 'info', 'success', 'warning', 'highlight'];

function variantFor(name: string): TAvatarColorVariant {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PERSON_VARIANTS[hash % PERSON_VARIANTS.length];
}

function ChannelBadge({ channel }: { channel?: Channel }) {
  const logo = channel && CHANNEL_LOGO[channel];
  if (!logo) return null;
  return <img
    src={logo}
    alt=""
    width={16}
    height={16}
    style={{
      position: 'absolute',
      right: -3,
      bottom: -3,
      boxSizing: 'border-box',
      padding: 2,
      background: 'var(--color-fill-surface)',
      border: '1px solid var(--color-boundary-border-mild, var(--color-boundary-border-mildest))',
      borderRadius: '50%'
    }}
  />;
}

export default function ActorAvatar({
  actor,
  size = 'sm',
  channel,
  pixelSize
}: {
  actor: Actor;
  size?: TAvatarSize;
  channel?: Channel;
  /** Conversation rows use 32px; other Digit placements stay at 24px. */
  pixelSize?: 24 | 32;
}) {
  if (actor.kind === 'digit' || actor.kind === 'copilot') {
    /* Agent Concierge wears the Concierge Digit's mark. */
    const artwork = DIGIT_AVATAR[actor.kind === 'digit' ? actor.digit : 'workplace-concierge'];
    const dimension = pixelSize ?? 24;
    const glyph = dimension - (dimension === 32 ? 8 : 4);
    return artwork ? (
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: dimension, height: dimension, flexShrink: 0 }}>
        {/* The mark sits inset in its box, like every other timeline icon: 20 in 24, 24 in 32. */}
        <img src={artwork} alt={`${actor.name} avatar`} width={glyph} height={glyph} style={{ display: 'block', objectFit: 'contain' }} />
        <ChannelBadge channel={channel} />
      </span>
    ) : (
      // A Digit without artwork takes a whitelist icon rather than borrowing another's mark.
      <Avatar iconName="Bots" name={actor.name} shape="square" size={size} colorVariant="info" />
    );
  }

  const photo = PERSON_AVATAR[actor.id];
  const avatar = (
    <Avatar
      imageUrl={photo}
      name={actor.name}
      initials={initials(actor.name)}
      shape="round"
      size={size}
      colorVariant={variantFor(actor.name)}
    />
  );
  return channel && CHANNEL_LOGO[channel]
    ? <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
        {avatar}
        <ChannelBadge channel={channel} />
      </span>
    : avatar;
}

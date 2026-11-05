import { Avatar, Icon } from '@freshworks/dew-components';
import type { Actor } from '../types';
import { DIGIT_AVATAR, PERSON_AVATAR, initials } from '../details.tokens';
import type { ResponseEntry } from './responseTimeline';

/**
 * Option 2's fold: "+N conversations" becomes a pill that names who is inside
 * it — up to three overlapping faces, "N messages" and Dew's up/down chevrons.
 * Centred on the same hairline as Option 1's pill.
 */

const AVATAR_PX = 20;
const MAX_FACES = 3;

function actorKey(actor: Actor): string {
  if (actor.kind === 'digit') return `digit:${actor.digit}`;
  if (actor.kind === 'copilot') return 'copilot';
  return `${actor.kind}:${actor.id}`;
}

/** Distinct authors of the folded entries, in stream order. */
function faces(hidden: ResponseEntry[]): Actor[] {
  const seen = new Set<string>();
  const actors: Actor[] = [];
  for (const entry of hidden) {
    if (entry.kind === 'event') continue;
    const key = actorKey(entry.actor);
    if (seen.has(key)) continue;
    seen.add(key);
    actors.push(entry.actor);
    if (actors.length === MAX_FACES) break;
  }
  return actors;
}

function Face({ actor }: { actor: Actor }) {
  const artwork =
    actor.kind === 'digit' ? DIGIT_AVATAR[actor.digit]
    : actor.kind === 'copilot' ? DIGIT_AVATAR['workplace-concierge']
    : PERSON_AVATAR[actor.id];

  if (artwork) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: AVATAR_PX, height: AVATAR_PX }}>
        <img
          src={artwork}
          alt=""
          width={actor.kind !== 'requester' && actor.kind !== 'agent' ? AVATAR_PX - 4 : AVATAR_PX}
          height={actor.kind !== 'requester' && actor.kind !== 'agent' ? AVATAR_PX - 4 : AVATAR_PX}
          style={{
            display: 'block',
            objectFit: actor.kind === 'digit' || actor.kind === 'copilot' ? 'contain' : 'cover',
            borderRadius: actor.kind === 'digit' || actor.kind === 'copilot' ? undefined : '50%'
          }}
        />
      </span>
    );
  }

  // Dew's smallest avatar is 24px; scaled to sit with the 20px artwork.
  return (
    <span style={{ display: 'inline-flex', transform: `scale(${AVATAR_PX / 24})`, transformOrigin: 'top left' }}>
    <Avatar
      size="xxs"
      name={actor.name}
      initials={actor.kind === 'digit' || actor.kind === 'copilot' ? undefined : initials(actor.name)}
      iconName={actor.kind === 'digit' ? 'Bots' : actor.kind === 'copilot' ? 'Ai' : undefined}
      shape={actor.kind === 'digit' || actor.kind === 'copilot' ? 'square' : 'round'}
      colorVariant={actor.kind === 'copilot' ? 'highlight' : 'info'}
    />
    </span>
  );
}

export default function MessagesPill({
  hidden,
  onExpand
}: {
  hidden: ResponseEntry[];
  onExpand: () => void;
}) {
  /* Assignment and status rows fold away with the messages but are not messages. */
  const count = hidden.filter((entry) => entry.kind !== 'event').length;
  const actors = faces(hidden);

  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
      <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-boundary-divider-mildest)' }} />
      <button
        type="button"
        className="tr-o2-messages-pill"
        aria-expanded={false}
        aria-label={`Show ${count} earlier ${count === 1 ? 'message' : 'messages'}`}
        onClick={onExpand}
      >
        <span aria-hidden style={{ display: 'inline-flex', alignItems: 'center' }}>
          {actors.map((actor, i) => (
            <span
              key={actorKey(actor)}
              style={{
                display: 'inline-flex',
                width: AVATAR_PX,
                height: AVATAR_PX,
                marginLeft: i === 0 ? 0 : -6,
                position: 'relative',
                zIndex: MAX_FACES - i
              }}
            >
              <Face actor={actor} />
            </span>
          ))}
        </span>
        <span>{`${count} ${count === 1 ? 'message' : 'messages'}`}</span>
        <Icon name="Sorting" size="sm" color="var(--color-icon-primary)" />
      </button>
      <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-boundary-divider-mildest)' }} />
    </div>
  );
}

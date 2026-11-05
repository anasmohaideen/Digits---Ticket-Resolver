import { Icon, Spinner, Tag } from '@freshworks/dew-components';
import type { LiveNode } from './types';
import { BODY_COMPACT, NO_SHRINK } from './details.styles';
import { elapsed } from './format';
import ActorAvatar from './ActorAvatar';

/**
 * B5 · Live states.
 *
 * What the end of the stream shows while a Digit is working: "Thinking 2.1s",
 * "Searching for similar tickets 2.1s", "Executing workflow: … 2.1s", and the
 * proposed "Waiting for approval from …". Each is replaced by the matching
 * event row once it finishes.
 *
 * `waiting` is deliberately not a spinner: the Digit is idle on purpose, and a
 * spinner would say it is working.
 */
export default function LiveRow({ live }: { live: LiveNode }) {
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-100)',
        padding: 'var(--spacing-050) 0'
      }}
      aria-live="polite"
    >
      {live.activity === 'waiting' ? (
        <Icon name="Pause" size="sm" color="var(--color-icon-secondary)" title="Waiting" />
      ) : (
        <Spinner size="sm" aria-label={live.label} />
      )}
      <ActorAvatar actor={live.actor} size="xxs" />
      <span style={BODY_COMPACT}>
        <strong style={{ fontWeight: 'var(--font-weight-semi-bold)' }}>{live.actor.name}</strong> ·{' '}
        {live.label}
      </span>
      <Tag variant="gray" style={NO_SHRINK}>{elapsed(live.elapsedSeconds)}</Tag>
    </div>
  );
}

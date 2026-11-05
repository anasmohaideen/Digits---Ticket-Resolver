import { useEffect, useId, useState } from 'react';
import { Icon } from '@freshworks/dew-components';
import type { EventNode, MessageNode } from './types';
import ActorAvatar from './ActorAvatar';
import EventLeadingIcon from './EventLeadingIcon';
import { eventLine } from './EventRow';

/** 'waiting': the work is paused on an approval (Option 2's Replay Live). */
export type LiveWorkStage = 'thinking' | 'working' | 'waiting';

const STAGE_LABEL: Record<LiveWorkStage, string> = {
  thinking: 'Thinking',
  working: 'Working',
  waiting: 'Waiting for approval'
};

export function liveStepCount(activities: EventNode[]) {
  return Math.max(1, activities.length);
}

export default function LiveWorkerCard({
  message,
  activities,
  stage,
  visibleSteps,
  ticketCode,
  approver,
  defaultOpen = false,
  paused = false,
  statusLabel,
  inline = false
}: {
  message: MessageNode;
  activities: EventNode[];
  stage: LiveWorkStage;
  visibleSteps: number;
  ticketCode?: string;
  /** Who the paused work is waiting on, for the 'waiting' stage. */
  approver?: string;
  defaultOpen?: boolean;
  paused?: boolean;
  /** Specific work in progress, using the same inline text shine as Thinking. */
  statusLabel?: string;
  /** Compact conversation activity, with work details closed until requested. */
  inline?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const bodyId = useId();

  useEffect(() => setElapsedSeconds(0), [stage]);

  useEffect(() => {
    if (paused || inline) return;
    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 0.1), 100);
    return () => window.clearInterval(timer);
  }, [stage, paused, inline]);

  /* A pause on an approval opens the work, so the agent sees what it is waiting on. */
  useEffect(() => {
    if (stage === 'waiting' && !inline) setOpen(true);
  }, [stage, inline]);

  const reasoning = message.id === 'm2'
    ? 'I should find out whether the Wi-Fi problem affects only Megan’s laptop before deciding where to route it.'
    : activities[0]?.intent ?? 'I should check the ticket context and choose the next safe step.';

  return (
    <article id={`stream-${message.id}`} className={`tr-live-worker-card${inline ? ' is-inline' : ''}${paused ? ' is-paused' : ''}`} aria-label={`${message.actor.name} ${stage}`}>
      {!inline && <ActorAvatar actor={message.actor} size="xs" pixelSize={32} channel={message.channel} />}
      <div className="tr-live-worker-content">
        {!inline && <div className="tr-live-worker-name">{message.actor.name}</div>}
        <button type="button" className="tr-live-worker-toggle" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen((value) => !value)}>
          <span className="tr-live-shine" aria-live="polite">{statusLabel ?? STAGE_LABEL[stage]}</span>
          {!inline && <span>{elapsedSeconds.toFixed(1)}s</span>}
          <Icon name={open ? 'ChevronDown' : 'ChevronRight'} size="xs" color="var(--color-icon-secondary)" />
        </button>
        {open && (
          <div id={bodyId} className="tr-live-worker-timeline">
            <p className="tr-live-shine tr-live-reveal" key={`reason-${message.id}`}>{reasoning}</p>
            {stage !== 'thinking' && (
              <ol>
                {activities.length > 0 ? activities.slice(0, visibleSteps).map((activity) => (
                  <li key={activity.id} className="tr-live-reveal">
                    <EventLeadingIcon event={activity} />
                    <span className="tr-live-shine">{eventLine(activity, ticketCode, true)}</span>
                  </li>
                )) : visibleSteps > 0 && (
                  <li className="tr-live-reveal">
                    <Icon name="CircleCheck" size="sm" color="var(--color-icon-disabled)" />
                    <span className="tr-live-shine">{message.id === 'm2' ? 'Reviewed Megan’s report and prepared a clarifying question.' : 'Prepared a response for Megan.'}</span>
                  </li>
                )}
              </ol>
            )}
            {stage === 'working' && !statusLabel && <span className="tr-live-worker-progress tr-live-shine">{visibleSteps === 0 ? 'Starting work…' : 'Putting the response together…'}</span>}
            {stage === 'waiting' && <span className="tr-live-worker-progress tr-live-shine">Waiting for {approver ?? 'an agent'} to decide…</span>}
          </div>
        )}
      </div>
    </article>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@freshworks/dew-components';
import { AIThinking, type AIThinkingStepItem } from '../../../../../dewai';
import type { Actor } from '../types';
import ActorAvatar from '../ActorAvatar';
import { TimelineIconBox } from '../EventLeadingIcon';
import { META } from '../details.styles';

/**
 * A Digit at work, in the timeline.
 *
 * Built on the AI Design System's `AIThinking` (Messages · Think): while it
 * runs it is the active state with steps that go spinner → tick; when it
 * finishes it settles into the collapsed "Ran N steps" summary, with the
 * outcome on the line below, so the cause and the result read as one story.
 * Stop cancels the run and keeps what was done.
 */
export default function DigitRunRow({
  actor,
  steps,
  outcome,
  stepMs = 1100
}: {
  actor: Actor;
  /** What the Digit does, in order. */
  steps: string[];
  /** The line that appears once it has finished. */
  outcome: string;
  stepMs?: number;
}) {
  const [done, setDone] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const settledRef = useRef(false);
  const finished = done >= steps.length;
  const active = !finished && !stopped;

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => setDone((value) => value + 1), stepMs);
    return () => window.clearTimeout(timer);
  }, [active, done, stepMs]);

  /* Once it settles, fold the steps away (one time) so the outcome leads. */
  useEffect(() => {
    if (!active && !settledRef.current) {
      settledRef.current = true;
      setExpanded(false);
    }
  }, [active]);

  const items: AIThinkingStepItem[] = steps
    .slice(0, stopped ? done : Math.min(done + 1, steps.length))
    .map((label, index) => ({ id: `${index}`, label, stage: index < done ? 'completed' : 'thinking' }));

  const ranCount = stopped ? done : steps.length;
  const thinkingText = active
    ? steps[Math.min(done, steps.length - 1)]
    : `${stopped ? 'Stopped after' : 'Ran'} ${ranCount} ${ranCount === 1 ? 'step' : 'steps'}`;

  return (
    <div className="tr-o2-run" aria-live="polite">
      <div className="tr-o2-run-head">
        <TimelineIconBox>
          <ActorAvatar actor={actor} size="xxs" />
        </TimelineIconBox>
        <div style={{ minWidth: 0, flex: 1 }}>
          <AIThinking
            phase={active ? 'active' : 'complete'}
            details
            thinkingText={thinkingText}
            steps={items}
            expanded={expanded}
            onExpandedChange={setExpanded}
            onStop={active ? () => setStopped(true) : undefined}
          />
        </div>
      </div>
      {finished && !stopped && (
        <div className="tr-o2-run-outcome">
          <TimelineIconBox>
            <Icon name="Tick" size="sm" color="var(--color-icon-semantic-success)" title="" />
          </TimelineIconBox>
          <span style={{ font: 'var(--font-body)', color: 'var(--color-text-primary)' }}>{outcome}</span>
          <span style={META}>just now</span>
        </div>
      )}
    </div>
  );
}

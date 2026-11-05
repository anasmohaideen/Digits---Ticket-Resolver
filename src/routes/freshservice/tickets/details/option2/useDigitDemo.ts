import { useEffect, useMemo, useRef, useState } from 'react';
import type { StageId } from './stages';
import { digitDemoJourney } from './digitDemoJourney';
export type { DigitDemoStep } from './digitDemoJourney';

export default function useDigitDemo(enabled: boolean, selectedStage?: StageId) {
  const steps = useMemo(() => digitDemoJourney(selectedStage), [selectedStage]);
  const [status, setStatus] = useState<'idle' | 'playing' | 'paused' | 'finished'>('idle');
  const [index, setIndex] = useState(0);
  const [run, setRun] = useState(0);
  const remaining = useRef(steps[0].duration);
  const started = useRef(0);
  const current = steps[index] ?? steps[0];

  useEffect(() => {
    if (!enabled) setStatus('idle');
  }, [enabled]);

  useEffect(() => {
    setStatus('idle');
    setIndex(0);
    remaining.current = steps[0].duration;
  }, [steps]);

  useEffect(() => {
    if (status !== 'playing' || !enabled) return;
    started.current = Date.now();
    const timer = window.setTimeout(() => {
      if (index === steps.length - 1) setStatus('finished');
      else {
        remaining.current = steps[index + 1].duration;
        setIndex(index + 1);
      }
    }, remaining.current);
    return () => window.clearTimeout(timer);
  }, [enabled, status, index, run, steps]);

  const restart = () => {
    remaining.current = steps[0].duration;
    setIndex(0);
    setRun((value) => value + 1);
    setStatus('playing');
  };

  return {
    status, index, run, current,
    active: enabled && status !== 'idle',
    total: steps.length,
    play: () => status === 'paused' ? setStatus('playing') : restart(),
    pause: () => {
      remaining.current = Math.max(0, remaining.current - (Date.now() - started.current));
      setStatus('paused');
    },
    restart,
    exit: () => setStatus('idle')
  };
}

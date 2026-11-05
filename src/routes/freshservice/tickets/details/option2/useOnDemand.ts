import { useEffect, useState } from 'react';

export type OnDemandPhase = 'idle' | 'generating' | 'ready';

/**
 * Something an agent asks for by clicking (a summary, a root cause, a
 * resolution note): it thinks for a couple of seconds, then it is there. The
 * prototype has no model behind it, so what it produces is authored.
 */
export function useOnDemand(duration = 2400) {
  const [state, setState] = useState<{ phase: OnDemandPhase; at?: string }>({ phase: 'idle' });
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (state.phase !== 'generating') return;
    const tick = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    const done = window.setTimeout(() => setState({ phase: 'ready', at: new Date().toISOString() }), duration);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(done);
    };
  }, [state.phase, duration]);

  return {
    phase: state.phase,
    at: state.at,
    elapsed,
    start: () => {
      setElapsed(0);
      setState({ phase: 'generating' });
    }
  };
}

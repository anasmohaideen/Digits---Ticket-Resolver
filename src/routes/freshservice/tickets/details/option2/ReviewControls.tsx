import { useEffect, useId, useRef, useState } from 'react';
import { MAX_INCOMING } from './incomingMessages';
import type { StageId, stagesFor } from './stages';

/**
 * Option 2 · the prototype's own controls, kept out of the product UI.
 *
 * The scenario sits behind one floating button in the
 * bottom-right corner. It is deliberately NOT built from Dew: a dark,
 * developer-toolbar style (system font, monospace labels, its own colours)
 * so nobody reviewing the page mistakes it for part of Freshservice.
 *
 * The internal-message treatment is still switchable with `?internal=`.
 */
export default function ReviewControls({
  stages,
  incoming,
  expired
}: {
  /** The Resolver journey, one job at a time. */
  stages?: { value: StageId | undefined; options: ReturnType<typeof stagesFor>; onChange: (next: StageId | undefined) => void };
  /** Sends the requester's next follow-up into the conversation. */
  incoming?: { count: number; onSend: () => void; onReset: () => void };
  /** Past 90 days the pre-ticket chat is gone; only the description and files stay. */
  expired?: { value: boolean; onChange: (next: boolean) => void };
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelId = useId();

  /* Closes on Escape and on a click anywhere else on the page. */
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="tr-proto">
      {open && (
        <div id={panelId} role="dialog" aria-label="Prototype controls" className="tr-proto-panel">
          <div className="tr-proto-head">
            <span className="tr-proto-title">Prototype controls</span>
            <button type="button" className="tr-proto-close" aria-label="Close prototype controls" onClick={() => setOpen(false)}>
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>

          {stages && (
            <div role="radiogroup" aria-label="Journey stage" className="tr-proto-group">
              <span className="tr-proto-label">Journey stage</span>
              <button
                type="button"
                role="radio"
                aria-checked={!stages.value}
                className="tr-proto-option"
                onClick={() => stages.onChange(undefined)}
              >
                <span className="tr-proto-dot" aria-hidden />
                Full ticket
              </button>
              {stages.options.map((stage) => (
                <button
                  key={stage.id}
                  type="button"
                  role="radio"
                  aria-checked={stages.value === stage.id}
                  className="tr-proto-option"
                  onClick={() => stages.onChange(stage.id)}
                >
                  <span className="tr-proto-dot" aria-hidden />
                  {stage.job} · {stage.label}
                </button>
              ))}
            </div>
          )}

          {expired && (
            <div role="group" aria-label="Slack conversation" className="tr-proto-group">
              <span className="tr-proto-label">Slack conversation</span>
              <button
                type="button"
                role="switch"
                aria-checked={expired.value}
                className="tr-proto-option"
                onClick={() => expired.onChange(!expired.value)}
              >
                <span className="tr-proto-dot" aria-hidden />
                Expired (older than 90 days)
              </button>
            </div>
          )}

          {incoming && (
            <>
              <button
                type="button"
                className="tr-proto-action"
                disabled={incoming.count >= MAX_INCOMING}
                onClick={incoming.onSend}
              >
                Simulate new message ({incoming.count}/{MAX_INCOMING})
              </button>
              {incoming.count > 0 && (
                <button type="button" className="tr-proto-action" onClick={incoming.onReset}>
                  Clear new messages
                </button>
              )}
            </>
          )}
        </div>
      )}

      <button
        type="button"
        className={`tr-proto-trigger ${open ? 'is-open' : ''}`}
        aria-label={open ? 'Hide prototype controls' : 'Show prototype controls'}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2 4h7M12 4h2M2 12h2M7 12h7M2 8h3M8 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="10.5" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="5.5" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="6.5" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
    </div>
  );
}

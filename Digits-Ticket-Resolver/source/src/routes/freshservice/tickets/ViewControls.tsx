import { useEffect, useId, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { VIEW_TICKETS, detailHref, viewHref } from './ticketViews';

/**
 * The prototype's own controls for the ticket views, kept out of the product
 * UI. A second floating button, beside the scenario controls, that flips the
 * open ticket between its full page and the split view beside the list. Like
 * the scenario controls it is deliberately not built from Dew.
 */

type Layout = 'split' | 'full';

const OPTIONS: Array<{ id: Layout; label: string }> = [
  { id: 'split', label: 'With split' },
  { id: 'full', label: 'Without split' }
];

function useCurrentLayout(): Layout {
  const { search } = useLocation();
  return new URLSearchParams(search).get('view') === 'split' ? 'split' : 'full';
}

export default function ViewControls({ besideScenarios = false }: { /** Sits left of the scenario controls, on pages that have them. */ besideScenarios?: boolean }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelId = useId();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const layout = useCurrentLayout();

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

  const go = (target: Layout) => {
    /* Either way, the ticket that is open stays open. */
    const ticketId = id && id !== 'board' ? id : VIEW_TICKETS[0]?.id;
    if (!ticketId) return;
    navigate(target === 'split' ? viewHref('split', ticketId) : detailHref(ticketId));
  };

  return (
    <div ref={rootRef} className={`tr-proto tr-proto-views${besideScenarios ? ' is-beside' : ''}`}>
      {open && (
        <div id={panelId} role="dialog" aria-label="Layout controls" className="tr-proto-panel">
          <div className="tr-proto-head">
            <span className="tr-proto-title">Layout</span>
            <button type="button" className="tr-proto-close" aria-label="Close layout controls" onClick={() => setOpen(false)}>
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>

          <div role="radiogroup" aria-label="Layout" className="tr-proto-group">
            {OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={layout === option.id}
                className="tr-proto-option"
                onClick={() => go(option.id)}
              >
                <span className="tr-proto-dot" aria-hidden />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        className={`tr-proto-trigger ${open ? 'is-open' : ''}`}
        aria-label={open ? 'Hide layout controls' : 'Show layout controls'}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="2" y="2.5" width="12" height="11" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
          <path d="M6.6 2.5v11" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
    </div>
  );
}

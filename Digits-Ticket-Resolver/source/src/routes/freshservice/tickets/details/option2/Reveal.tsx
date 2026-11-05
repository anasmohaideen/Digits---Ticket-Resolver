import { useEffect, useRef } from 'react';

/**
 * Option 2 · a smooth open/close for content of unknown height.
 *
 * Animates a one-row grid between `0fr` and `1fr`, which eases to the
 * content's real height without measuring it, and fades the content with it.
 * The content stays mounted, so closing animates too; while closed it is
 * `inert`, so nothing inside can be tabbed to or read out.
 */
export default function Reveal({
  open,
  id,
  className,
  children
}: {
  open: boolean;
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  /* React 18 does not know `inert` as a prop, so it is set on the node. */
  useEffect(() => {
    if (ref.current) ref.current.inert = !open;
  }, [open]);

  return (
    <div ref={ref} id={id} className={`tr-o2-reveal ${open ? 'is-open' : ''} ${className ?? ''}`} aria-hidden={!open}>
      <div className="tr-o2-reveal-inner">{children}</div>
    </div>
  );
}

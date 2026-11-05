import { useNavigate } from 'react-router-dom';
import { IconButton } from '@freshworks/dew-components';
import type { IconName } from '@freshworks/dew-components';
import { viewHref, type TicketsView } from './ticketViews';

/**
 * Table · Board · Split, as one group of icon buttons. It sits in the same
 * place on all three pages, so switching reads as one page changing its
 * layout rather than three pages. Each button is a navigation.
 */

/* Dew has no list-beside-a-pane glyph (its "Split" is a branching arrow), so
   the split view's icon is drawn here in the same 16px outline style. */
const SPLIT_ICON =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#12334C" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2.5" width="12" height="11" rx="1.6"/><path d="M6.6 2.5v11M3.7 5.6h1.4M3.7 8h1.4M3.7 10.4h1.4"/></svg>'
  );

const VIEWS: Array<{ id: TicketsView; label: string; icon: IconName | 'custom' }> = [
  { id: 'table', label: 'Table view', icon: 'Table' },
  { id: 'board', label: 'Board view', icon: 'TableColumn' },
  { id: 'split', label: 'Split view', icon: 'custom' }
];

export default function ViewSwitcher({
  current,
  ticketId
}: {
  current: TicketsView;
  /** The ticket the split view should open on; defaults to the first in the list. */
  ticketId?: string;
}) {
  const navigate = useNavigate();
  return (
    <div role="group" aria-label="Ticket view" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-050)' }}>
      {VIEWS.map((view) => {
        const common = {
          'aria-label': view.label,
          'aria-pressed': current === view.id,
          active: current === view.id,
          size: 'default' as const,
          onClick: () => current !== view.id && navigate(viewHref(view.id, ticketId))
        };
        return view.icon === 'custom'
          ? <IconButton key={view.id} iconName="custom" iconSrc={SPLIT_ICON} {...common} />
          : <IconButton key={view.id} iconName={view.icon} {...common} />;
      })}
    </div>
  );
}

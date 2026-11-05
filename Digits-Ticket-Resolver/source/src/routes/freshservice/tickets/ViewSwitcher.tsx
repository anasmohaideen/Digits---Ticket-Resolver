import { useNavigate } from 'react-router-dom';
import { IconButton } from '@freshworks/dew-components';
import type { IconName } from '@freshworks/dew-components';
import { viewHref, type TicketsView } from './ticketViews';

/**
 * Table · Board · Split, as one group of icon buttons. It sits in the same
 * place on all three pages, so switching reads as one page changing its
 * layout rather than three pages. Each button is a navigation.
 */

const VIEWS: Array<{ id: TicketsView; label: string; icon: IconName }> = [
  { id: 'table', label: 'Table view', icon: 'Table' },
  { id: 'board', label: 'Board view', icon: 'TableColumn' },
  { id: 'split', label: 'Split view', icon: 'ExpandSidebar' }
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
        return <IconButton key={view.id} iconName={view.icon} {...common} />;
      })}
    </div>
  );
}

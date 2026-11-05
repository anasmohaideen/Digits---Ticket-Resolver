import { useSearchParams } from 'react-router-dom';
import TicketDetailOption2 from './TicketDetailOption2';
import TicketsSplit from './TicketsSplit';
import ViewControls from './ViewControls';

/**
 * `/freshservice/tickets/:id` answers two ways: the ticket's full page, or —
 * with `?view=split` — the same ticket beside the list.
 */
export default function TicketsRoute() {
  const [searchParams] = useSearchParams();
  return (
    <>
      {searchParams.get('view') === 'split' ? <TicketsSplit /> : <TicketDetailOption2 />}
      <ViewControls besideScenarios />
    </>
  );
}

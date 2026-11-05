import { DETAILS_TICKETS } from './details/fixtures';
import { TICKETS } from './tickets.data';
import type { Ticket } from './tickets.data';

/**
 * The three ways to see the ticket list, and the URL each one lives at.
 *
 *   table   /freshservice/tickets
 *   board   /freshservice/tickets/board
 *   split   /freshservice/tickets/:id?view=split
 *
 * The URL is the single source of truth: switching view is a navigation, and
 * the back button, a refresh and a shared link all land where they should.
 * Opening a ticket from the table or the board goes to its full page (no
 * `view` flag); only the split view carries the flag.
 */

export type TicketsView = 'table' | 'board' | 'split';

export const TICKETS_PATH = '/freshservice/tickets';
export const BOARD_PATH = `${TICKETS_PATH}/board`;

/**
 * The tickets this prototype can open, in list order: the three human-routed
 * Ticket Resolver paths first (blocked on a permission, blocked on a change
 * freeze, inconclusive at root cause), then the two regression tickets.
 */
const CODES = ['INC-4127', 'INC-4140', 'INC-4142', 'INC-4133', 'INC-4150', 'INC-4155', 'INC-4160', 'SR-4128'] as const;

/**
 * One ticket per use case. The list, board and split rail show what the use
 * case covers; the details page keeps the ticket's real, product-style subject.
 */
export const USE_CASE_TITLE: Record<(typeof CODES)[number], string> = {
  'INC-4127': 'Slack · Resolver hands over a blocked incident (missing permission)',
  'INC-4140': 'Slack · Blocked at resolution — change freeze needs a person to approve',
  'INC-4142': 'Slack · Inconclusive root cause — a person collects evidence',
  'INC-4133': 'Email · Human-only incident with a long conversation thread',
  'INC-4150': 'Email · No AI activity yet — summary generated on demand',
  'INC-4155': 'Slack · Resolved end-to-end by Ticket Resolver, no human',
  'INC-4160': 'Rich content · formatting, code, images, tables, quoted mail',
  'SR-4128': 'Service request · approval and multi-item fulfilment'
};

export const VIEW_TICKETS: Ticket[] = CODES.flatMap((code) => {
  const ticket = TICKETS.find((t) => t.code === code) ?? DETAILS_TICKETS[code];
  return ticket ? [{ ...ticket, subject: USE_CASE_TITLE[code] }] : [];
});

/** A ticket's full page. */
export const detailHref = (id: string) => `${TICKETS_PATH}/${id}`;

/** A ticket inside the split view. */
export const splitHref = (id: string) => `${TICKETS_PATH}/${id}?view=split`;

/** Where each view's switcher button goes. Split opens on the first ticket unless told otherwise. */
export function viewHref(view: TicketsView, ticketId: string = VIEW_TICKETS[0]?.id ?? ''): string {
  if (view === 'table') return TICKETS_PATH;
  if (view === 'board') return BOARD_PATH;
  return splitHref(ticketId);
}

/** The ticket after or before this one in a list, if there is one. */
export function neighbour(ids: string[], id: string, step: 1 | -1): string | undefined {
  const at = ids.indexOf(id);
  return at === -1 ? undefined : ids[at + step];
}

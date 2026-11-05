import type { IMenuOption } from '@freshworks/dew-components';
import { TICKETS } from '../tickets/tickets.data';

/**
 * The dashboard's data, derived from the ticket fixture so the numbers on the
 * scorecards and the slices in the charts always agree with the Tickets list.
 *
 * Everything here — the widget titles, their order, the six scorecards, the
 * three charts — was read off the live product at /a/dashboard. Where the
 * fixture has no equivalent concept (a watch list, an On Hold status) the
 * widget still ships and reads zero, which is exactly what the live tenant
 * shows for those two.
 */

const unresolved = TICKETS.filter((t) => t.status !== 'Resolved');

export interface ScoreCard {
  id: string;
  label: string;
  count: number;
  /**
   * The saved ticket view the tile opens. Live wraps the WHOLE card in an
   * anchor to /a/tickets/view/<view>, so a tile is a link, not a readout.
   * The starter has a single Tickets list rather than per-view routes, so the
   * slug is recorded here and the link lands on the list.
   */
  view: string;
  /**
   * Live marks two of the six with a threshold: their card turns red and grows
   * a warning icon once the count is non-zero. Overdue and Unassigned carry it;
   * "Open tickets" reads 5 on the live tenant and stays white, so the tint is a
   * property of the widget, not of the number.
   */
  threshold?: boolean;
}

/**
 * The six tiles in the product's order and wording. "Open tickets" really is
 * sentence case on live while its five siblings are title case; that is the
 * product's own inconsistency and is preserved rather than tidied.
 */
export const SCORECARDS: ScoreCard[] = [
  { id: 'overdue', view: 'overdue', label: 'Overdue Tickets', count: TICKETS.filter((t) => t.state === 'Overdue').length, threshold: true },
  { id: 'due-today', view: 'due_today', label: 'Tickets Due Today', count: TICKETS.filter((t) => t.state === 'Due soon').length },
  { id: 'open', view: 'open', label: 'Open tickets', count: TICKETS.filter((t) => t.status === 'Open').length },
  // The fixture's Status vocabulary is Open / Pending / Resolved / Closed, with
  // no On Hold in it, so this reads zero. The live tenant reads zero here too.
  { id: 'on-hold', view: 'on_hold', label: 'Tickets On Hold', count: 0 },
  { id: 'unassigned', view: 'new', label: 'Unassigned Tickets', count: TICKETS.filter((t) => t.assignee === 'None').length, threshold: true },
  // No ticket in the fixture is watched, and the live tenant reads 0 here too.
  { id: 'watching', view: 'monitored_by', label: "Tickets I'm Watching", count: 0 },
];

export interface Slice {
  label: string;
  value: number;
}

/**
 * Dew's categorical chart palette, by token suffix.
 *
 * Read off the live Highcharts gradients: the pie's first slice fills with
 * --color-chart-category-13 and the bar series with -15. The tenant only ever
 * had one slice, so only those two were observable; the run continues through
 * the palette's neighbouring entries. The same 20-colour palette ships in the
 * dew-styles we install, zero-padded, with 13 and 15 matching live exactly.
 */
export const CHART_PALETTE = ['13', '14', '15', '16', '01', '02', '03', '04'];

export const chartColor = (index: number) =>
  `var(--color-chart-category-${CHART_PALETTE[index % CHART_PALETTE.length]})`;

/** Slices in a fixed vocabulary order, so a colour always means the same thing. */
const tally = (values: string[], order: string[]): Slice[] =>
  order
    .map((label) => ({ label, value: values.filter((v) => v === label).length }))
    .filter((s) => s.value > 0);

export const PRIORITY_ORDER = ['Low', 'Medium', 'High', 'Urgent'];
const STATUS_ORDER = ['Open', 'Pending', 'On Hold'];

export const UNRESOLVED_BY_PRIORITY = tally(unresolved.map((t) => t.priority), PRIORITY_ORDER);
export const UNRESOLVED_BY_STATUS = tally(unresolved.map((t) => t.status), STATUS_ORDER);

/**
 * The bar widget. Live plots the saved view's open tickets against priority and
 * keeps every priority on the axis, including the empty ones — the zeroes are
 * the point, so this one is not filtered the way the pie slices are.
 */
export const OPEN_BY_PRIORITY: Slice[] = PRIORITY_ORDER.map((label) => ({
  label,
  value: unresolved.filter((t) => t.priority === label).length,
}));

/** The saved view the bar widget is scoped to, named in its title on live. */
export const BAR_WIDGET_TITLE = 'New & My Open Tickets';

/** The dashboard's own name, shown in the top bar rather than as a page title. */
export const DASHBOARD_NAME = 'My Dashboard';

/** Who the dashboard is shared with. A fresh account gets a private one. */
export const DASHBOARD_VISIBILITY = 'Only me';


/**
 * The chart widgets' overflow menu. Live offers exactly one entry, on both the
 * pie widgets and the bar widget: it swaps the chart for a table of the same
 * series.
 */
export const WIDGET_MENU_OPTIONS = ['Table View'];

/**
 * The dashboard's own overflow, in the top bar beside its name.
 *
 * Both entries carry a leading icon on live — a pencil and a duplicate — and
 * the library ships both under exactly those names, so the menu is described
 * here as Dew's own IMenuOption rather than as labels the call site has to
 * decorate. 150 x 90 for two rows is what live measures, which is the icon
 * column paying for itself.
 */
export const DASHBOARD_MENU_OPTIONS: IMenuOption[] = [
  { value: 'edit', label: 'Edit', prefixIcon: 'Edit' },
  { value: 'clone', label: 'Clone', prefixIcon: 'Clone' },
];

/**
 * The dashboard switcher, opened from the name in the top bar. Live lists every
 * saved dashboard with a tick against the current one, above a quota line.
 *
 * The quota is an ALLOWANCE, not a remaining count. Live reads "20 more to go"
 * against one saved dashboard, so the plan permits 21 and the line counts down
 * as dashboards are added -- which is why cloning has to move it. Storing the
 * 20 directly, as this did at first, meant the line kept promising 20 more
 * however many you had made.
 */
export const DASHBOARDS = [DASHBOARD_NAME];
export const DASHBOARD_ALLOWANCE = 21;

/**
 * What Clone names the copy.
 *
 * "Copy of X" is the product's own form. Cloning the copy gives "Copy of Copy
 * of X" rather than a numbered suffix, which is what a plain prefix does and is
 * left as it falls; the numbering only appears when that exact name is already
 * taken, since a switcher listing two identical names is the one outcome that
 * would be unusable.
 */
export const cloneNameFor = (name: string, taken: string[]) => {
  const base = `Copy of ${name}`;
  if (!taken.includes(base)) return base;
  let n = 2;
  while (taken.includes(`${base} ${n}`)) n += 1;
  return `${base} ${n}`;
};

/** Confirmation copy for the two actions in the dashboard's overflow. */
export const DASHBOARD_CLONED_TOAST = (name: string) => `Dashboard cloned as "${name}"`;
export const DASHBOARD_RENAMED_TOAST = (name: string) => `Dashboard saved as "${name}"`;

/** The Edit dialog behind the first entry in that overflow. */
export const EDIT_DIALOG_TITLE = 'Edit dashboard';
export const EDIT_NAME_LABEL = 'Dashboard name';

/** Right-hand sheets, opened from the two buttons above the widget grid. */
export const ACTIVITY_SHEET_TITLE = 'Recent Activity';
export const ANNOUNCEMENTS_SHEET_TITLE = 'Announcements';
export const ANNOUNCEMENTS_FILTER = 'Active announcements';
export const ANNOUNCEMENTS_EMPTY = "You don't have anything to see in this view.";

export interface ActivityEntry {
  id: string;
  actor: string;
  /** Sentence fragments either side of the ticket link, as live composes them. */
  before: string;
  ticket: string;
  code: string;
  after: string;
  when: string;
}

/**
 * The activity feed, composed out of the ticket fixture so it can never name a
 * ticket the Tickets list does not have. Live groups entries under a heading —
 * "Older" on this tenant — and phrases each as actor, verb, ticket link, object.
 */
export const ACTIVITY_GROUP = 'Older';

export const ACTIVITY_FEED: ActivityEntry[] = TICKETS.slice(0, 8).map((t, i) => {
  const actor = t.assignee === 'None' ? t.requester : t.assignee;
  const shapes = [
    { before: 'assigned the Ticket', after: `to the group ${t.group}`, when: '12 days ago' },
    { before: 'submitted a new Ticket', after: `for ${t.requester}`, when: 'a month ago' },
    { before: 'updated Ticket status of', after: `to ${t.status}`, when: 'a month ago' },
    { before: 'changed the priority of', after: `to ${t.priority}`, when: '3 months ago' },
  ];
  const shape = shapes[i % shapes.length];
  return { id: t.id, actor, ticket: t.subject, code: t.code, ...shape };
});

/**
 * The dashboard's lower half.
 *
 * These were left out of the first pass as "not worth rebuilding", which was
 * the wrong call: they are two thirds of what a real tenant's dashboard shows,
 * and leaving them out made our page end where the live one is still going.
 *
 * A caveat on their fidelity. Everything above this line came off the live DOM.
 * These came off a screenshot of it, so the strings and the layout are exact
 * and the pixel values are read at 2x rather than measured. Where a number
 * mattered it was rounded to the value the rest of the grid already uses -- a
 * widget is 578 wide and a tile 118 tall here because that is what the top of
 * the page measures, not because the screenshot was trusted to the pixel.
 */

export interface InfoWidget {
  id: string;
  title: string;
  /** A second line under the title. Only the gamification pair carries one. */
  subtitle?: string;
  /** A text action in the top-right corner, in place of the charts' kebab. */
  action?: string;
  /** The line the widget shows in place of data it does not have. */
  message: string;
  height: number;
}

/**
 * The gamification widgets. Both are empty on this tenant, and both say so in
 * the product's own encouraging register rather than with a generic "No data".
 */
export const ACHIEVEMENTS_WIDGET: InfoWidget = {
  id: 'achievements',
  title: 'Achievements',
  subtitle: 'This month',
  action: 'Show All',
  message: "It's game time! Complete quests and become a trend setter in your team",
  height: 386,
};

export const LEADERBOARD_WIDGET: InfoWidget = {
  id: 'leaderboard',
  title: 'Leaderboard',
  subtitle: 'This month',
  action: 'More Info',
  message: 'Your team is still looking for their best performer. It could be you!',
  height: 252,
};

/**
 * An onboarding report with nothing to report. Note the register changes again:
 * this one is a flat statement about the data, not an invitation.
 */
export const OFFBOARDING_INITIATED_WIDGET: InfoWidget = {
  id: 'offboarding-initiated',
  title: 'Offboarding Request Initiated By',
  message: "We can't raise the bar as we don't have enough data",
  height: 386,
};

/**
 * Two widgets on the live dashboard render an error where their chart should
 * be: the feature behind them has been withdrawn and the widget outlives it.
 *
 * They are reproduced rather than quietly dropped, because a dashboard that
 * shows you a dead widget and asks you to remove it yourself is a real product
 * behaviour worth having in a prototype -- and it is the single place in the
 * whole app where an InlineMessage appears in anger.
 */
export const RETIRED_WIDGET_MESSAGE = 'Feature no longer accessible, please remove the widget.';

export const RETIRED_ONBOARDING_WIDGET = {
  id: 'my-open-onboarding',
  title: 'My Open Onboarding Requests',
  height: 118,
  span: 1,
};

export const RETIRED_ONBOARDING_INITIATED_WIDGET = {
  id: 'onboarding-initiated',
  title: 'Onboarding Request Initiated By',
  height: 228,
  span: 2,
};

/**
 * The one tile in the lower half that still works. It counts the same thing the
 * scorecards above it count -- nothing, on a tenant with no offboarding -- so it
 * reads 0 and carries no threshold.
 */
export const OFFBOARDING_TILE: ScoreCard = {
  id: 'my-open-offboarding',
  label: 'My Open Offboarding Requests',
  count: 0,
  view: 'offboarding',
};

import type { IconName } from '@freshworks/dew-components';

/**
 * Reports and Insights > Analytics, read off /analytics.
 *
 * The live page renders inside a CROSS-ORIGIN iframe pointing at
 * freshreports.com, which is why a plain DOM scrape of the Freshservice page
 * comes back with 143 characters and looks like a failed load. Everything below
 * was measured by attaching to that iframe as its own CDP target.
 *
 * Its table is react-table divs rather than a <table>, so the column widths are
 * real layout values rather than something the browser negotiated.
 */

export const ANALYTICS_TITLE = 'Analytics';

/** The segmented pair above the page. Analytics is the half this starter builds. */
export const INSIGHTS_TABS = ['AI Insights', 'Analytics'];

export interface ReportNavItem {
  id: string;
  label: string;
  icon: IconName;
  children?: { id: string; label: string }[];
}

/**
 * The sidebar, 309 wide with 40px rows. Trash and Settings are pinned to the
 * foot of the panel rather than following the list, the same way Knowledge
 * Base pins its own Trash.
 */
export const REPORT_NAV: ReportNavItem[] = [
  { id: 'recent', label: 'Recent', icon: 'Recent' },
  { id: 'favorites', label: 'Favorites', icon: 'FavouriteStar' },
  { id: 'all-reports', label: 'All reports', icon: 'LeftNavBar/Analytics2' },
  {
    id: 'curated',
    label: 'Curated reports',
    icon: 'LeftNavBar/ApplicationGroups',
    children: [
      { id: 'esm', label: 'Enterprise Service Management' },
      { id: 'itsm', label: 'IT Service Management' },
      { id: 'itam', label: 'IT Asset Management' },
      { id: 'itom', label: 'IT Operations Management' },
    ],
  },
  { id: 'shared', label: 'Shared reports', icon: 'LeftNavBar/Contacts' },
  { id: 'mine', label: 'My reports', icon: 'LeftNavBar/User' },
];

export const REPORT_NAV_FOOT: ReportNavItem[] = [
  { id: 'trash', label: 'Trash', icon: 'Delete' },
  { id: 'settings', label: 'Settings', icon: 'LeftNavBar/Settings' },
];

export interface Report {
  id: string;
  name: string;
  /** Every seeded report is Curated; a user's own would not be. */
  curated?: boolean;
  description?: string;
  location: string;
  createdBy: string;
  createdDate: string;
  lastModifiedBy: string;
  lastModifiedDate: string;
  favorite?: boolean;
}

/** The ten reports the tenant ships with, in its own default order. */
export const REPORTS: Report[] = [
  { id: '1', name: 'AI Agent Performance Report', curated: true, location: '--', createdBy: 'System', createdDate: '08/28/2026', lastModifiedBy: '--', lastModifiedDate: '08/28/2026' },
  { id: '2', name: 'Freddy AI Copilot Value Report', curated: true, location: 'Curated reports / IT Service Management', createdBy: 'System', createdDate: '07/28/2026', lastModifiedBy: '--', lastModifiedDate: '07/28/2026' },
  { id: '3', name: 'Journey Requests Overview', curated: true, location: 'Curated reports / Enterprise Service Management', createdBy: 'System', createdDate: '11/21/2025', lastModifiedBy: '--', lastModifiedDate: '05/05/2026' },
  { id: '4', name: 'Freddy AI Agent Overview', curated: true, location: 'Curated reports / IT Service Management', createdBy: 'System', createdDate: '02/26/2025', lastModifiedBy: '--', lastModifiedDate: '05/05/2026' },
  { id: '5', name: 'Freddy AI Copilot Overview', curated: true, location: 'Curated reports / IT Service Management', createdBy: 'System', createdDate: '10/16/2024', lastModifiedBy: '--', lastModifiedDate: '05/05/2026' },
  { id: '6', name: 'eSignature Usage', curated: true, location: 'Curated reports / Enterprise Service Management', createdBy: 'System', createdDate: '08/29/2024', lastModifiedBy: '--', lastModifiedDate: '05/05/2026' },
  { id: '7', name: 'Solutions Overview', curated: true, description: 'Gives an overview of Solutions creation and usage', location: 'Curated reports / IT Service Management', createdBy: 'System', createdDate: '07/02/2024', lastModifiedBy: '--', lastModifiedDate: '05/05/2026' },
  { id: '8', name: 'Offboarding Requests Overview', curated: true, location: 'Curated reports / Enterprise Service Management', createdBy: 'System', createdDate: '12/18/2023', lastModifiedBy: '--', lastModifiedDate: '05/05/2026' },
  { id: '9', name: 'On-call Management Overview', curated: true, description: 'Provides insights into on-call schedules and escalations', location: 'Curated reports / IT Operations Management', createdBy: 'System', createdDate: '05/12/2023', lastModifiedBy: '--', lastModifiedDate: '05/05/2026' },
  { id: '10', name: 'Overview of Orchestration Transactions', curated: true, description: 'Provides insights into orchestration usage', location: 'Curated reports / IT Asset Management', createdBy: 'System', createdDate: '12/22/2022', lastModifiedBy: '--', lastModifiedDate: '05/05/2026' },
];

/**
 * Column widths as the live grid lays them out. The star and the row overflow
 * are fixed ends; Name takes more than double any other column, and the five
 * metadata columns are an identical 185.
 */
export const REPORT_COLUMNS = [
  { id: 'name', header: 'Name', size: 420 },
  { id: 'location', header: 'Location', size: 185 },
  { id: 'createdBy', header: 'Created by', size: 185 },
  { id: 'createdDate', header: 'Created date', size: 185 },
  { id: 'lastModifiedBy', header: 'Last Modified by', size: 185 },
  { id: 'lastModifiedDate', header: 'Last Modified date', size: 185 },
] as const;

export const REPORTS_HEADING = 'All reports';
export const CONTENT_TABS = ['Reports', 'Folders'];
export const SORT_LABEL = 'Sort By:';
export const SORT_VALUE = 'Last modified date';
export const HELP_CENTER = 'Help Center';
export const NEW_REPORT = 'New Report';

/** The split button's one menu entry, read off the live dropdown. */
export const NEW_REPORT_OPTIONS = ['From Report Templates'];

/** A small text action beside My reports, 66x20 with a leading icon. */
export const NEW_FOLDER = 'Folder';

/** A dismissible nudge above the tabs. */
export const FOLDER_BANNER = 'Try using folders to better organize and manage your custom reports.';
export const FOLDER_BANNER_LINK = 'Create a folder';

/* ---------------------------------------------------------------------------
 * Reports and Insights > AI Insights, read off /analytics/freddy-insights.
 *
 * The other half of the segmented pair, and a different page entirely: a 382px
 * insight rail beside a centred prompt.
 * ------------------------------------------------------------------------- */

export const CONVERSATIONAL_TITLE = 'Conversational Insights';
export const CONVERSATIONAL_BLURB = 'Ask Freddy AI for quick, helpful answers';
export const PROACTIVE_TITLE = 'Proactive Insights';
export const EXECUTIVE_TITLE = 'Executive Overview';
export const EXECUTIVE_BLURB = 'See performance highlights that matter';

/** A warning banner above the list; the tenant's insights are seeded samples. */
export const SAMPLE_NOTICE = 'Sample Insights are shown below.';
export const SAMPLE_NOTICE_LINK = 'Learn more';

export interface Insight {
  id: string;
  text: string;
  team: string;
  when: string;
}

/** The six the tenant shows, verbatim. */
export const INSIGHTS: Insight[] = [
  { id: '1', text: 'Resolution Time in Bhrs was unusually high in the week starting Aug 23, 2026, reaching 1d 19h.', team: 'Change Team', when: '4 days ago' },
  { id: '2', text: 'First Response Time in Bhrs spiked to 3h 29m in the month of Aug 2026, showing a 150.00% increase from the previous month.', team: 'Service Design Team', when: '9 days ago' },
  { id: '3', text: 'The number of tickets violating first response SLA was unusually high in the week starting Aug 23, 2026.', team: 'Network Team', when: '4 days ago' },
  { id: '4', text: 'Total ticket count spiked to 482 in the week starting Aug 23, 2026, showing a 104.24% increase from the previous week.', team: 'Software Team', when: '4 days ago' },
  { id: '5', text: 'Total ticket count spiked to 362 in the week starting Aug 23, 2026, showing a 72% increase from the previous week.', team: 'Capacity Management Team', when: '4 days ago' },
  { id: '6', text: 'First Response Time in Bhrs reached 8h 45m in the week starting Aug 23, 2026, marking a 826% increase.', team: 'Major Incident Team', when: '4 days ago' },
];

/** The centred prompt. */
export const WELCOME_NAME = 'Prithvi Tharun';
export const PROMPT_PLACEHOLDER = 'Give me top 5 agents based on ticket volume';
export const PROMPT_CAPTION = 'Builds visualizations from your analytics. Generated by AI and may be inaccurate.';
export const PROMPT_CAPTION_LINK = 'Tips to get better responses.';

export const PROMPT_SUGGESTIONS = [
  'Help me with the trend of SLA violated tickets created in the last 30 days',
  'Give me the count of urgent priority open tickets',
  'Give me a trend for average resolution time',
  'Show me tickets count by its statuses',
];

import type { IconName } from '@freshworks/dew-components';

/**
 * AI Agent Studio.
 *
 * Captured from the live studio, which is a micro-frontend rendered inside a
 * shadow root (`fw-ai-agent-mfe`) — worth knowing, because anything reading
 * `document.body` there sees an empty page and concludes the screen is blank.
 */

export interface StudioNavItem {
  id: string;
  label: string;
  icon: IconName;
  children?: StudioNavItem[];
}

/** The sub-nav: one top item, then a Library group of four. */
export const STUDIO_NAV: StudioNavItem[] = [
  { id: 'ai-agents', label: 'AI agents', icon: 'Ai' },
  {
    id: 'library',
    label: 'Library',
    icon: 'Apps',
    children: [
      { id: 'library-agents', label: 'AI Agents', icon: 'Ai' },
      { id: 'workflows', label: 'Workflows', icon: 'Admin/WorkflowAutomator' },
      { id: 'api-actions', label: 'API Actions', icon: 'Admin/ApiClient' },
      { id: 'functions', label: 'Functions', icon: 'Code' }
    ]
  }
];

export const DEFAULT_STUDIO_VIEW = 'ai-agents';

export interface PrebuiltAgent {
  id: string;
  name: string;
  description: string;
  /** The product draws a bespoke illustration; an emoji stands in for it. */
  avatar: string;
  /**
   * Integrations the agent ships with. The product shows each vendor's own
   * logo, which Dew does not carry — Datadog, Azure DevOps and BambooHR have
   * no icon in the set — so these render as initial tiles rather than as
   * invented marks.
   */
  integrations: string[];
  /** Shown as "+N" after the visible logos. */
  moreIntegrations: number;
}

export const PREBUILT_AGENTS: PrebuiltAgent[] = [
  {
    id: 'it-agent',
    name: 'IT Agent',
    description: 'Resolve IT issues, access requests, incidents, and device actions with accurate updates.',
    avatar: '🖥️',
    integrations: ['Freshservice', 'Datadog', 'Azure DevOps'],
    moreIntegrations: 4
  },
  {
    id: 'hr-agent',
    name: 'HR Agent',
    description: 'Access leaves, employment records, timesheets, and HR requests with accurate updates.',
    avatar: '🧑‍💼',
    integrations: ['BambooHR'],
    moreIntegrations: 0
  }
];

/**
 * The "Create new Agent" dropdown is not a menu — it is a 590x251 panel
 * headed "Choose a type", holding two option cards side by side, each with an
 * icon, a description, the channels it works with, and its own Create action.
 */
export interface AgentType {
  id: string;
  name: string;
  description: string;
  /** The product uses a coloured emoji here, as the agent cards do. */
  emoji: string;
  /**
   * The product draws unlabelled inline SVGs here — no alt, title or href to
   * read a vendor from. Visually they are Slack, Microsoft Teams and a web
   * widget for chat, and an envelope for email; Dew carries Microsoft and a
   * portal mark but no Slack, so the first falls back to a generic chat icon.
   */
  channels: IconName[];
}

export const AGENT_TYPES: AgentType[] = [
  {
    id: 'chat',
    name: 'Chat AI Agent',
    description: 'Handles live customer conversations in real time',
    emoji: '💬',
    channels: ['Conversation', 'External/Microsoft', 'Portal']
  },
  {
    id: 'email',
    name: 'Email AI Agent',
    description: 'Responds to customer emails automatically',
    emoji: '✉️',
    channels: ['Email']
  }
];

/** The page's own copy, kept here so the screen stays layout. */
export const AI_AGENTS_COPY = {
  title: 'AI agents',
  subtitle:
    'Build and deploy AI agents to respond to customer queries instantly, across all your support channels.',
  promoBanner:
    'We are offering AI Agent Studio to all Growth, Pro and Enterprise customers as a promotional offer until September 30, 2026.',
  demoTitle: 'New to AI Agents?',
  demoBody: 'Watch a short demo to see how they work and how you can launch your first one in minutes.',
  exploreTitle: 'Explore pre-built AI Agents',
  exploreSubtitle: 'Choose from curated agents built for your business needs — customize and launch instantly.'
};

/* ------------------------------------------------------------------ */
/* Library screens                                                     */
/* ------------------------------------------------------------------ */

/**
 * The three Library screens that are not the agents list share one shape: a
 * title, an optional subtitle with a Learn more link, a strip of tabs
 * carrying counts, and an empty state offering two actions.
 *
 * Counts are the live account's — 0 created against 20 pre-built workflows,
 * 99+ browsable actions, 14 pre-built functions — kept because they show what
 * the screen looks like before anyone has built anything, which is the state
 * a prototype is most often shown in.
 */
export interface LibraryTab {
  label: string;
  count?: string;
}

export interface LibraryAction {
  label: string;
  variant: 'primary' | 'secondary';
}

export interface LibraryScreen {
  title: string;
  subtitle?: string;
  tabs: LibraryTab[];
  /** A link sitting with the tabs rather than in the empty state. */
  headerAction?: string;
  empty: { title: string; body: string; actions: LibraryAction[] };
}

export const LIBRARY_SCREENS: Record<string, LibraryScreen> = {
  workflows: {
    title: 'Workflows library',
    subtitle: 'Easily manage, edit, and assign workflows to your AI agents from one central place.',
    tabs: [
      { label: 'Created workflows', count: '0' },
      { label: 'Pre-built Workflows', count: '20' }
    ],
    empty: {
      title: 'Make your AI Agent actionable',
      body: 'Create a new workflow in the workflows library and you can add them to the AI Agent post that',
      actions: [
        { label: 'Explore pre-built workflows', variant: 'secondary' },
        { label: 'Create new workflow', variant: 'primary' }
      ]
    }
  },
  'api-actions': {
    title: 'Actions and Authentication',
    subtitle:
      'Easily create, edit, and manage API actions and custom authentication all from one central place.',
    tabs: [
      { label: 'My Actions', count: '0' },
      { label: 'Browse Actions', count: '99+' },
      { label: 'Authentication', count: '0' }
    ],
    headerAction: 'Go to marketplace',
    empty: {
      title: 'Make your AI Agent actionable',
      body: 'Create custom API Actions or manage app actions in the Actions Library and link it to Workflows to execute those APIs.',
      actions: [
        { label: 'Create API action', variant: 'primary' },
        { label: 'Browse all actions', variant: 'secondary' }
      ]
    }
  },
  functions: {
    title: 'Functions',
    subtitle:
      'Create, manage and reuse functions to transform and process data within your workflows.',
    tabs: [{ label: 'My functions' }, { label: 'Pre-built functions', count: '14' }],
    empty: {
      title: 'Make your custom functions',
      body: 'Create custom functions and link it to Workflows to execute them.',
      actions: [
        { label: 'Create', variant: 'primary' },
        { label: 'Browse pre-built functions', variant: 'secondary' }
      ]
    }
  }
};

/** The agents list reuses the pre-built cards under its own title. */
export const AGENTS_LIBRARY_TITLE = 'Agents Library';
export const AGENTS_LIBRARY_SUBTITLE =
  'A curated library of pre-built AI Agents to help you get started fast.';

/* ------------------------------------------------------------------ */
/* Pre-built workflows                                                 */
/* ------------------------------------------------------------------ */

/**
 * The twenty pre-built workflows, captured from the live library.
 *
 * Four titles end in an ellipsis in the product's own markup — the
 * truncation is in the text, not the CSS — so they are stored as they ship
 * rather than "repaired".
 *
 * Vendors come from each card's image alt. Dew carries none of these logos,
 * so the card shows an initial tile as the agent cards do.
 */
export interface PrebuiltWorkflow {
  title: string;
  description: string;
  vendor: string;
}

export const PREBUILT_WORKFLOWS: PrebuiltWorkflow[] = [
  { title: 'Fetch Ticket details - Freshservice', description: 'I would like to get updates on issues that I reported recently', vendor: 'Freshservice' },
  { title: 'Correlating Latency with Service...', description: 'Micorservice is slow Name of the microservice could be anything - Payments, Checkout, Auth service etc', vendor: 'Datadog' },
  { title: 'Creating Bug - Azure Devops', description: 'Create a bug for an issue or failure Login/mobile/appilcations/SaaS/Desktop/Infra', vendor: 'Azure DevOps' },
  { title: 'Search for missing email - MS ex...', description: 'when the user says that his/her email is missing', vendor: 'Exchange Online' },
  { title: 'Password Reset - Azure AD', description: 'User asks for his/her Azure password to be reset', vendor: 'Microsoft Entra ID' },
  { title: 'Wipe data from Device - JamF', description: 'Wipe Data from my Device', vendor: 'Jamf Pro' },
  { title: 'Create Incident - PagerDuty', description: 'Service is down. Create incident in Pager duty', vendor: 'PagerDuty' },
  { title: 'Lock Computer - JamF', description: 'Lock my Device', vendor: 'Jamf Pro' },
  { title: 'Revoke Sign in Sessions - Azure AD', description: 'Sign me out from all Microsoft sessions across devices and applications.', vendor: 'Microsoft Entra ID' },
  { title: 'Password Reset - Okta', description: 'I need to reset my Okta password', vendor: 'Okta' },
  { title: 'View Leave Balance - BambooHR', description: '"What is my leave balance?" "Show my PTO balance." "How many sick leaves are remaining?" "Check my holiday balance."', vendor: 'BambooHR' },
  { title: 'ApplyLeave - BambooHR', description: '"Apply for leave" "Apply for Sick leave" "Apply for Vacation" "Apply for Casual Leave"', vendor: 'BambooHR' },
  { title: 'View Profile Details - BambooHR', description: '"Get my Profile" "View my Profile Details"', vendor: 'BambooHR' },
  { title: 'View Timesheet Entries - BambooHR', description: '"Fetch my time sheet entries" "Fetch the time sheet entries for May month"', vendor: 'BambooHR' },
  { title: 'View Dependents - BambooHR', description: '"View my Dependents" "Who are the dependents added in the system" "Fetch the dependent and thier details added in the system"', vendor: 'BambooHR' },
  { title: 'Create Dependents - BambooHR', description: '"Add new dependents" "Help me create a new dependent"', vendor: 'BambooHR' },
  { title: 'View Job Details - BambooHR', description: '"Get my Job Details" "Fetch my Job Details"', vendor: 'BambooHR' },
  { title: 'Show Dependents - Zoho People', description: '"Show Dependents" "Fetch my dependents" "Who all are added as my dependents"', vendor: 'Zoho People' },
  { title: 'Submit Timesheet Entries - ZohoP...', description: 'Submit Timesheet entries', vendor: 'Zoho People' },
  { title: 'View Internal Job Openings - Sma...', description: 'Get Internal Job Opennings', vendor: 'SmartRecruiters' },
];

/* ------------------------------------------------------------------ */
/* Pre-built functions                                                 */
/* ------------------------------------------------------------------ */

/** The fourteen pre-built functions, captured whole from the live library. */
export interface PrebuiltFunction {
  title: string;
  description: string;
}

export const PREBUILT_FUNCTIONS: PrebuiltFunction[] = [
  { title: 'Arithmetic Expression', description: 'Evaluate an arithmetic expression using up to three numeric variables (number_1, number_2, number_3)' },
  { title: 'Extract from List', description: 'Extract an element from a list at the specified index, with optional sub-splitting by a delimiter' },
  { title: 'Concatenate', description: 'Concatenate two or three text values with an optional separator' },
  { title: 'Split', description: 'Split a text by a separator and return the element at the given index' },
  { title: 'Compare Dates', description: 'Compare two dates and return -1, 0, or 1 depending on whether date_1 is before, equal to, or after date_2' },
  { title: 'Get Days Between', description: 'Return the number of days between two dates, with optional working-days-only counting' },
  { title: 'Add Time to Date', description: 'Add days, hours, and/or minutes to a date, with optional weekend skipping and timezone support' },
  { title: 'Format Date', description: 'Convert a date from one format to another' },
  { title: 'Get Current Date', description: 'Return the current date/time in the specified format and timezone' },
  { title: 'Base64 Decode', description: 'Decode a Base64-encoded value to plain text' },
  { title: 'Base64 Encode', description: 'Encode a text value to Base64' },
  { title: 'Lowercase', description: 'Convert a text value to lowercase' },
  { title: 'Uppercase', description: 'Convert a text value to uppercase' },
  { title: 'Add Numbers', description: 'Add two numbers together and return the sum' },
];

/* ------------------------------------------------------------------ */
/* Browse actions                                                      */
/* ------------------------------------------------------------------ */

/**
 * The apps panel beside the action grid. Thirty-four in the live account;
 * the names ship truncated there ("Azure DevOps for ...") because the product
 * truncates them in its own markup, so they are written out in full here
 * rather than reproducing an ellipsis that carries no information.
 */
export const ACTION_APPS: string[] = [
  'Asana for AI Agents',
  'Ashby for AI agents',
  'Atlassian MCP',
  'Azure DevOps for AI Agents',
  'BambooHR for AI Agents',
  'ClickUp MCP',
  'Datadog for AI Agents',
  'Device42 for AI Agents',
  'Exchange Online for AI Agents',
  'Expensify for AI Agents',
  'Freshservice for AI Agents',
  'Greenhouse for AI Agents',
  'Gusto for AI Agents',
  'Jamf Pro for AI Agents',
  'Jira for AI Agents',
  'Lever for AI agents'
];

export interface BrowseAction {
  title: string;
  description: string;
  vendor: string;
}

/**
 * A sample of the browsable actions. The live tab lists 99+; these eight are
 * captured verbatim and the grid repeats them, which is enough to show the
 * layout and scrolling without inventing action names that do not exist.
 */
export const BROWSE_ACTIONS: BrowseAction[] = [
  { title: 'Add Comment to Task', description: 'Add a comment to an Asana task to provide updates, ask questions, or collaborate with your team.', vendor: 'Asana' },
  { title: 'Create Task', description: 'Create a new task in an Asana project to track a new action item or piece of work.', vendor: 'Asana' },
  { title: 'Get Task Details', description: 'Retrieve the complete details of a specific task in Asana to understand its requirements.', vendor: 'Asana' },
  { title: 'Update Task', description: 'Modify the fields of an existing Asana task, such as its name, description, or completion state.', vendor: 'Asana' },
  { title: 'Add Candidate', description: 'Creates a candidate via candidate.create with actor attribution. user_email resolves the actor.', vendor: 'Ashby' },
  { title: 'Approve Job Requisition', description: 'Retrieves pending approvals filterable by entityType=Opening. No single-step approval.', vendor: 'Ashby' },
  { title: 'Approve Offer Letter', description: 'Approves an offer or a specific approval step — mimics the "Force Approve" function.', vendor: 'Ashby' },
  { title: 'Get All Applications', description: 'Calls application.list with optional filters and returns only rows where hiringTeam matches.', vendor: 'Ashby' }
];

/** Sort options offered above the action grid. */
export const ACTION_SORT_OPTIONS = [
  'App name - Ascending',
  'App name - Descending',
  'Action name - Ascending',
  'Action name - Descending'
];

/** The Authentication tab is empty on a fresh account. */
export const AUTHENTICATION_EMPTY = {
  title: 'No authentication added',
  body: 'Create custom API Actions or manage app actions in the Actions Library and link it to Workflows to execute those APIs.',
  action: 'Add authentication'
};

/* ------------------------------------------------------------------ */
/* Create agent                                                        */
/* ------------------------------------------------------------------ */

/**
 * The create-agent modal, measured at 600px wide.
 *
 * Its six avatars are remote images on Freshworks' bot CDN rather than
 * anything in the DOM, so they cannot be lifted the way the empty-state
 * drawing was. Coloured tints with Dew's own bot icon stand in — six
 * distinguishable choices, which is what the picker is for.
 */
export const AGENT_AVATAR_TINTS = [
  'var(--color-fill-semantic-info-mildest)',
  'var(--color-fill-semantic-success-mildest)',
  'var(--color-fill-semantic-error-mildest)',
  'var(--color-fill-semantic-warning-mildest)',
  'var(--color-fill-semantic-highlight-mildest)',
  'var(--color-fill-container)'
];

export const CREATE_AGENT_COPY = {
  heading: 'Create new',
  nameLabel: 'Name',
  namePlaceholder: 'Enter a name',
  avatarLabel: 'Avatar',
  languageLabel: 'Primary language',
  terms: 'By proceeding further, you agree to',
  termsLink: 'Freshworks supplemental terms.',
  cancel: 'Cancel',
  continue: 'Continue'
};

export const AGENT_LANGUAGES = [
  { code: 'EN', label: 'English' },
  { code: 'FR', label: 'French' },
  { code: 'DE', label: 'German' },
  { code: 'ES', label: 'Spanish' },
  { code: 'PT', label: 'Portuguese' }
];

/** The "Create new" page reached from the panel's chooser. */
export const CREATE_PAGE_COPY = {
  title: 'Create new',
  subtitle: 'Start from scratch or pick a pre-built one from our library.',
  scratchTitle: 'Start from scratch',
  scratchBody: 'Create an agent tailored to your specific needs.',
  or: 'OR',
  libraryTitle: 'Choose from library',
  librarySubtitle: 'Pick a ready-to-use agent, customize, and launch in minutes.'
};

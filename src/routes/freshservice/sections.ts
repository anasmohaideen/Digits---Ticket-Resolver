import type { IconName } from '@freshworks/dew-components';

/**
 * The rail, read off the live product top to bottom.
 *
 * Fifteen items, and EIGHT of them are groups rather than destinations: their
 * rail icon opens a flyout listing the views underneath. That is the shape this
 * file exists to carry, and getting it wrong put three sections in the wrong
 * place — Analytics was a top-level item when it belongs under Reports and
 * Insights, "Service catalog" was a top-level item when it is Services under IT
 * Operations, and Assets was a plain link when it is a group whose first child
 * is Inventory.
 */

export interface NavChild {
  /** Route segment under the parent: /freshservice/<section>/<child>. */
  id: string;
  label: string;
  icon: IconName;
  /**
   * An explicit route, for a child that does not live under its parent's path.
   * Admin is More's first child but has never been at /freshservice/more.
   */
  href?: string;
}

export interface NavSection {
  /** Route segment under /freshservice and rail item id. */
  id: string;
  label: string;
  icon: IconName;
  selectedIcon: IconName;
  /** A group's flyout contents. The rail item shows the first child's page. */
  children?: NavChild[];
  /**
   * A group with nothing of its own to show. Its rail item only opens the
   * flyout, so it is a button rather than a link. "More" is the only one.
   */
  groupOnly?: boolean;
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'reports-insights',
    label: 'Reports and Insights',
    icon: 'LeftNavBar/Analytics',
    selectedIcon: 'LeftNavBar/AnalyticsSelected',
    children: [
      { id: 'ai-insights', label: 'AI Insights', icon: 'LeftNavBar/FreddyAINew' },
      { id: 'analytics', label: 'Analytics', icon: 'LeftNavBar/Analytics2' },
      { id: 'project-analytics', label: 'Project Analytics', icon: 'LeftNavBar/ProjectsAnalytics' },
      { id: 'post-incident-reports', label: 'Post Incident Reports', icon: 'LeftNavBar/PostIncidentReports' },
      { id: 'documents', label: 'Documents', icon: 'DocumentPaper' },
    ],
  },
  { id: 'dashboard', label: 'Dashboard', icon: 'LeftNavBar/Dashboard', selectedIcon: 'LeftNavBar/DashboardSelected' },
  {
    id: 'tickets',
    label: 'Tickets',
    icon: 'LeftNavBar/Tickets',
    selectedIcon: 'LeftNavBar/TicketsSelected',
    children: [
      { id: 'list', label: 'List', icon: 'LeftNavBar/List' },
      { id: 'board', label: 'Board', icon: 'LeftNavBar/Board' },
    ],
  },
  {
    id: 'journeys',
    label: 'Journeys',
    icon: 'LeftNavBar/Journey',
    selectedIcon: 'LeftNavBar/Journey',
    children: [
      { id: 'journey-requests', label: 'Journey Requests', icon: 'LeftNavBar/JourneyRequest' },
      { id: 'journey-activities', label: 'Journey Activities', icon: 'LeftNavBar/JourneyActivities' },
      { id: 'offboarding-requests', label: 'Offboarding Requests', icon: 'LeftNavBar/Offboarding' },
    ],
  },
  { id: 'problems', label: 'Problems', icon: 'LeftNavBar/Problems', selectedIcon: 'LeftNavBar/ProblemsSelected' },
  { id: 'changes', label: 'Changes', icon: 'LeftNavBar/Changes', selectedIcon: 'LeftNavBar/ChangesSelected' },
  { id: 'releases', label: 'Releases', icon: 'LeftNavBar/Releases', selectedIcon: 'LeftNavBar/Releases' },
  { id: 'tasks', label: 'Tasks', icon: 'LeftNavBar/Tasks', selectedIcon: 'LeftNavBar/Tasks' },
  {
    id: 'it-operations',
    label: 'IT Operations',
    icon: 'LeftNavBar/ITOperations',
    selectedIcon: 'LeftNavBar/ITOperations',
    children: [
      { id: 'services', label: 'Services', icon: 'LeftNavBar/Services' },
      { id: 'alerts', label: 'Alerts', icon: 'LeftNavBar/Alert' },
    ],
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: 'LeftNavBar/Assets',
    selectedIcon: 'LeftNavBar/AssetsSelected',
    children: [
      { id: 'inventory', label: 'Inventory', icon: 'LeftNavBar/Inventory' },
      { id: 'cloud', label: 'Cloud', icon: 'LeftNavBar/Cloud' },
      { id: 'software', label: 'Software', icon: 'LeftNavBar/Software' },
      { id: 'contracts', label: 'Contracts', icon: 'LeftNavBar/Contracts' },
      { id: 'purchase-orders', label: 'Purchase Orders', icon: 'LeftNavBar/PurchaseOrders' },
    ],
  },
  { id: 'agent-studio', label: 'AI Agent Studio', icon: 'LeftNavBar/Chatbot', selectedIcon: 'LeftNavBar/ChatbotSelected' },
  {
    id: 'projects',
    label: 'Projects',
    icon: 'LeftNavBar/Projects',
    selectedIcon: 'LeftNavBar/Projects',
    children: [
      { id: 'all-projects', label: 'Projects', icon: 'LeftNavBar/Projects' },
      { id: 'project-tasks', label: 'Project Tasks', icon: 'LeftNavBar/ProjectTask' },
      { id: 'project-templates', label: 'Project Templates', icon: 'LeftNavBar/ProjectTemplate' },
    ],
  },
  { id: 'workload', label: 'Workload', icon: 'LeftNavBar/Workload', selectedIcon: 'LeftNavBar/Workload' },
  {
    id: 'solutions',
    label: 'Solutions',
    icon: 'LeftNavBar/Solution',
    selectedIcon: 'LeftNavBar/SolutionSelected',
    children: [
      { id: 'knowledge-base', label: 'Knowledge Base', icon: 'LeftNavBar/Solution' },
      { id: 'recommended-topics', label: 'Recommended topics', icon: 'ArticleAnalytics' },
    ],
  },
  {
    id: 'more',
    label: 'More',
    icon: 'LeftNavBar/More',
    selectedIcon: 'LeftNavBar/More',
    groupOnly: true,
    children: [
      { id: 'admin', label: 'Admin', icon: 'LeftNavBar/AdminCenter', href: '/freshservice/admin' },
      { id: 'customize-sidebar', label: 'Customize Sidebar', icon: 'LeftNavBar/Settings' },
    ],
  },
];

/** Section the bare /freshservice route redirects to. */
export const DEFAULT_SECTION = 'dashboard';

export function getSection(id: string | undefined): NavSection | undefined {
  return NAV_SECTIONS.find((section) => section.id === id);
}

export function getChild(sectionId: string | undefined, childId: string | undefined): NavChild | undefined {
  return getSection(sectionId)?.children?.find((child) => child.id === childId);
}

/**
 * Where a rail item points. A group shows its FIRST child at the parent's own
 * route rather than redirecting, which keeps /freshservice/tickets on the list
 * and leaves /freshservice/tickets/:id free for a ticket.
 */
export function sectionHref(section: NavSection): string {
  return `/freshservice/${section.id}`;
}

export function childHref(section: NavSection, child: NavChild): string {
  if (child.href) return child.href;
  // The first child IS the parent's page, so it keeps the parent's URL — except
  // under a groupOnly parent, which has no page for it to borrow.
  return !section.groupOnly && section.children?.[0]?.id === child.id
    ? sectionHref(section)
    : `/freshservice/${section.id}/${child.id}`;
}

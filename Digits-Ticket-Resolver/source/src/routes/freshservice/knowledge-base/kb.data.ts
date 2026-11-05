import type { IconName } from '@freshworks/dew-components';

/**
 * Solutions > Knowledge Base, read off the live product at
 * /a/solutions/articles/filters/all_articles.
 *
 * The sidebar has three bands separated by rules: four fixed views, then the
 * category tree, then Trash pinned to the bottom of the panel.
 */

export interface KbNavItem {
  id: string;
  label: string;
  icon: IconName;
}

/** The fixed views, in the product's order. */
export const KB_NAV: KbNavItem[] = [
  { id: 'all-articles', label: 'All Articles', icon: 'Article' },
  { id: 'article-templates', label: 'Article Templates', icon: 'DocumentPaper' },
  { id: 'approvals', label: 'Approvals', icon: 'Checkbox' },
  { id: 'articles-to-review', label: 'Articles to review', icon: 'Feedback' },
];

export interface KbCategory {
  id: string;
  label: string;
  folders: { id: string; label: string }[];
}

/**
 * The category tree. Each category collapses, and its folders indent by 8px
 * against the parent — measured at x=85 where the parent sits at x=77.
 */
export const KB_CATEGORIES: KbCategory[] = [
  { id: 'default', label: 'Default Category', folders: [{ id: 'drafts', label: 'Drafts' }] },
  { id: 'it', label: 'IT', folders: [{ id: 'it-policies', label: 'IT policies' }] },
];

/** Pinned to the bottom of the sidebar, below a rule. */
export const KB_TRASH: KbNavItem = { id: 'trash', label: 'Trash', icon: 'Delete' };

export type ArticleStatus = 'Draft' | 'Published' | 'In Review';

export interface Article {
  id: string;
  title: string;
  status: ArticleStatus;
  helpful: number;
  notHelpful: number;
  views: number;
  insertedInTickets: number;
  author: string;
  folder: string;
}

/**
 * The live tenant holds a single seeded article. The fixture keeps it first and
 * adds five more so the table has something to sort, the way the Tickets
 * fixture carries more rows than the tenant does.
 */
export const ARTICLES: Article[] = [
  { id: '1', title: 'Password Management Policy (Sample)', status: 'Draft', helpful: 0, notHelpful: 0, views: 0, insertedInTickets: 0, author: 'Prithvi Tharun', folder: 'IT policies' },
  { id: '2', title: 'How to connect to the corporate VPN', status: 'Published', helpful: 42, notHelpful: 3, views: 1284, insertedInTickets: 37, author: 'Sarah Kim', folder: 'IT policies' },
  { id: '3', title: 'Requesting a new laptop', status: 'Published', helpful: 28, notHelpful: 1, views: 903, insertedInTickets: 21, author: 'Alex Patel', folder: 'Drafts' },
  { id: '4', title: 'Setting up multi-factor authentication', status: 'Published', helpful: 61, notHelpful: 4, views: 1750, insertedInTickets: 54, author: 'Lena Brauer', folder: 'IT policies' },
  { id: '5', title: 'Onboarding checklist for new joiners', status: 'In Review', helpful: 12, notHelpful: 0, views: 318, insertedInTickets: 6, author: 'Tom Nguyen', folder: 'Drafts' },
  { id: '6', title: 'Printer troubleshooting guide', status: 'Draft', helpful: 0, notHelpful: 0, views: 0, insertedInTickets: 0, author: 'Prithvi Tharun', folder: 'IT policies' },
];

/**
 * Column widths as the live table lays them out at 1920, where the grid runs
 * 389 to 1872. Title is the only column you cannot sort by.
 */
export const ARTICLE_COLUMNS = [
  { id: 'title', header: 'Title', size: 325, sortable: false },
  { id: 'status', header: 'Status', size: 162, sortable: true },
  { id: 'helpful', header: 'Helpful', size: 130, sortable: true },
  { id: 'notHelpful', header: 'Not Helpful', size: 130, sortable: true },
  { id: 'views', header: 'Views', size: 108, sortable: true },
  { id: 'insertedInTickets', header: 'Inserted in Tickets', size: 195, sortable: true },
  { id: 'author', header: 'Author', size: 162, sortable: true },
  { id: 'folder', header: 'Folder', size: 217, sortable: true },
] as const;

/** Heading and blurb above the table. */
export const ALL_ARTICLES_TITLE = 'All Articles';
export const ALL_ARTICLES_BLURB = 'Viewing articles across all categories & folders';

/** The view name the top bar shows. */
export const KB_TITLE = 'Knowledge Base';


/** The split button's menu, captured from the live dropdown. */
export const NEW_ARTICLE_OPTIONS = ['New Folder', 'New Category', 'Article from external URL'];

/** The Filter sheet's two fields, and the options the live selects offer. */
export const ARTICLE_STATUS_OPTIONS: ArticleStatus[] = ['Draft', 'Published', 'In Review'];
export const REVIEW_DATE_OPTIONS = ['All articles', 'Due for review', 'Overdue for review'];

/* ---------------------------------------------------------------------------
 * The other sidebar views. Each was read off its own live route:
 *   /a/solutions/templates            /a/solutions/approvals
 *   /a/solutions/articles-to-review   /a/solutions/trash
 *   /a/solutions/categories/<id>
 * ------------------------------------------------------------------------- */

export interface ArticleTemplate {
  id: string;
  name: string;
  usageCount: number;
  createdBy: string;
  lastUpdatedOn: string;
}

/** The tenant holds one template; two more give the table something to sort. */
export const ARTICLE_TEMPLATES: ArticleTemplate[] = [
  { id: '1', name: 'asd', usageCount: 0, createdBy: 'Prithvi Tharun', lastUpdatedOn: '01 Jun 2026, 11:02 PM' },
  { id: '2', name: 'Incident write-up', usageCount: 14, createdBy: 'Sarah Kim', lastUpdatedOn: '18 Aug 2026, 09:41 AM' },
  { id: '3', name: 'How-to guide', usageCount: 6, createdBy: 'Alex Patel', lastUpdatedOn: '02 Sep 2026, 04:15 PM' },
];

export const TEMPLATE_COLUMNS = [
  { id: 'name', header: 'Template Name', size: 420, sortable: true },
  { id: 'usageCount', header: 'Usage Count', size: 200, sortable: true },
  { id: 'createdBy', header: 'Created By', size: 260, sortable: true },
  { id: 'lastUpdatedOn', header: 'Last Updated On', size: 300, sortable: true },
] as const;

export const TEMPLATES_TITLE = 'Article Templates';
export const TEMPLATES_BLURB =
  'Templates help your team create articles faster by offering a ready-made structure, ensuring consistency, and reducing effort';
export const TEMPLATES_ACTION = 'Create Template';

/** Views that are empty on the tenant, each with the product's own artwork. */
export const APPROVALS_EMPTY = 'No approvals found.';
export const REVIEW_EMPTY = 'No articles to review';
export const CATEGORY_EMPTY = 'No articles in category';
export const CATEGORY_EMPTY_ACTION = 'Create article';

/** Trash keeps a caption and three counters above its empty state. */
export const TRASH_TITLE = 'Trash';
export const TRASH_BLURB = 'Items in Trash are automatically and permanently deleted after 6 months';
export const TRASH_TABS = ['Articles', 'Folders', 'Categories'];
export const TRASH_EMPTY = "You don't have anything to see in this view";

/**
 * Default Category carries a blurb naming its drop-box address; IT carries
 * none. So the blurb belongs to the category, not to the category view.
 */
export const CATEGORY_BLURBS: Record<string, string> = {
  default: 'All emails sent to kbase@mellowwork.freshservice.com will be stored here as drafts',
};

/* ---------------------------------------------------------------------------
 * Solutions > Recommended topics, read off /a/knowledge-insights.
 *
 * A different shape from Knowledge Base: no sidebar, so the content runs the
 * full width, and the top bar carries a Beta tag beside the name.
 * ------------------------------------------------------------------------- */

export const TOPICS_TITLE = 'Recommended topics';
export const TOPICS_BETA = 'Beta';
export const TOPICS_HEADING = 'Unassigned topics';
export const TOPICS_BLURB =
  'Review common issues from tickets in the past 90 days and identify gaps in your knowledge base to create helpful articles.';
export const TOPICS_BLURB_LINK = 'Learn More';

/** The tenant has produced nothing yet, so the page is its own empty state. */
export const TOPICS_EMPTY_HEADING = 'Analyzing service desk data';
export const TOPICS_EMPTY_BODY = 'Check back soon for GenAI-powered help topic recommendations.';
export const TOPICS_EMPTY_LINK = 'Learn more';

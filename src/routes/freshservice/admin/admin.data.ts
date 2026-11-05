import type { IconName } from '@freshworks/dew-components';

/**
 * Freshservice Admin home.
 *
 * Every section, group, item and description below is captured from the live
 * Admin page rather than written: ten sections, three of which carry
 * sub-groups, and 88 items in total. Descriptions are the product's own
 * sentences, so the wording is worth leaving alone.
 */

export interface AdminItem {
  title: string;
  description: string;
  /**
   * Dew ships Freshservice's own Admin icon family, so most items carry their
   * real product icon matched by name. A handful have no icon in the set and
   * fall back to the settings gear rather than borrowing something unrelated.
   */
  icon: IconName;
}

export interface AdminGroup {
  /** Empty when a section lists its items directly, with no sub-heading. */
  label: string;
  items: AdminItem[];
}

export interface AdminSection {
  label: string;
  description: string;
  groups: AdminGroup[];
}

export const ADMIN_SECTIONS: AdminSection[] = [
  {
    label: 'Account Settings',
    description: 'Manage account configurations and customizations for your service desk',
    groups: [
      {
        label: '',
        items: [
          { title: 'Account', description: 'Manage account information and related settings', icon: 'Admin/Account' },
          { title: 'Account mode', description: 'Switch between Employee Support Mode and Managed Services Mode', icon: 'Admin/Account' },
          { title: 'Plans & Billing', description: 'Manage plans, subscriptions and licenses', icon: 'Admin/PlansBilling' },
          { title: 'Manage Workspaces', description: 'Manage workspaces, members and configurations', icon: 'Admin/WorkspaceSettings' },
          { title: 'Service Desk Settings', description: 'Manage service desk configurations and security settings', icon: 'LeftNavBar/Settings' },
          { title: 'Portals', description: 'Customize portal settings for both agents and requesters.', icon: 'Portal' },
          { title: 'Sandbox', description: 'Test and deploy changes between production and sandboxes', icon: 'Admin/Sandbox' },
          { title: 'Day Passes', description: 'Manage passes for agents that require occasional service desk access', icon: 'Admin/DayPass' },
          { title: 'Audit Log', description: 'Keep track of all actions and changes across the service desk', icon: 'Admin/AuditLog' },
          { title: 'Email Notifications', description: 'Configure automatic notifications to users based on specific events', icon: 'Admin/EmailNotification' },
          { title: 'Data Archival', description: 'Archive old and inactive work items to improve system performance', icon: 'Admin/DataArchival' },
          { title: 'Recovery center', description: 'Restore or rollback deleted configurations', icon: 'Recover' },
        ]
      },
    ]
  },
  {
    label: 'User Management',
    description: 'Manage users, groups and permissions across the service desk',
    groups: [
      {
        label: '',
        items: [
          { title: 'Agents', description: 'Manage all service desk agents, permissions and access rights', icon: 'Admin/Agents' },
          { title: 'Roles', description: 'Create and modify roles to manage agent permissions', icon: 'Admin/Roles' },
          { title: 'Departments', description: 'Manage departments and their associated members', icon: 'Admin/Department' },
          { title: 'Department Fields', description: 'Create and manage fields that capture information for departments', icon: 'Admin/DepartmentFields' },
          { title: 'Requesters', description: 'Manage requesters and their information', icon: 'Admin/Requesters' },
          { title: 'User Fields', description: 'Create and manage fields that capture information for users', icon: 'Admin/UserFields' },
          { title: 'CAB', description: 'Set up a Change Advisory Board to evaluate changes before implementation', icon: 'Admin/Cab' },
          { title: 'Agent Groups', description: 'Create agent groups to streamline ticket assignment', icon: 'Admin/AgentGroups' },
          { title: 'Requester Groups', description: 'Create requester groups and manage permissions for members', icon: 'Admin/RequesterGroup' },
          { title: 'Work Schedule', description: 'Assign work schedule to users to calculate their workload', icon: 'Admin/WorkSchedule' },
          { title: 'Integration Users', description: 'Manage accounts used by apps and automations to access the service desk', icon: 'User' },
        ]
      },
    ]
  },
  {
    label: 'Freddy AI',
    description: 'Intelligent assistance for employees and agents powered by Freddy and Generative AI',
    groups: [
      {
        label: '',
        items: [
          { title: 'Freddy', description: 'Enable smart suggestions and conversational intelligence', icon: 'LeftNavBar/FreddyAINew' },
        ]
      },
    ]
  },
  {
    label: 'Channels',
    description: 'Manage your support channels - email, phone, chat and more',
    groups: [
      {
        label: 'Email',
        items: [
          { title: 'Email Settings and Mailboxes', description: 'Set up and manage your service desk mailboxes', icon: 'Admin/EmailSettings' },
        ]
      },
      {
        label: 'Chat',
        items: [
          { title: 'Servicebot for Microsoft Teams', description: 'Enable Freddy AI to intelligently answer employee queries and service requests', icon: 'External/Microsoft' },
          { title: 'Servicebot for Slack', description: 'Enable Freddy AI to intelligently answer employee queries and service requests', icon: 'LeftNavBar/Settings' },
          { title: 'Freshchat', description: 'Enable chat on your support portal for real-time conversations with agents', icon: 'Freshchat' },
        ]
      },
      {
        label: 'Other Channels',
        items: [
          { title: 'Freshcaller', description: 'Enable phone support, manage agents and convert calls into tickets', icon: 'Freshcaller' },
          { title: 'Freshdesk', description: 'Unify employee and customer support for efficient resolution', icon: 'Admin/Freshdesk' },
          { title: 'Feedback Widget', description: 'Embed a ticket form in any webpage of your choice', icon: 'Admin/FeedbackWidget' },
          { title: 'Status Pages', description: 'Communicate real-time updates on the operational status of your services to your users.', icon: 'Status' },
        ]
      },
    ]
  },
  {
    label: 'Service Management',
    description: 'Manage the end to end service delivery configurations for your organization',
    groups: [
      {
        label: 'Service Desk Settings',
        items: [
          { title: 'Business Hours', description: 'Define the working hours for your service desk', icon: 'Admin/BusinessHours' },
          { title: 'SLA and OLA Policies', description: 'Define service agreements with internal and external stakeholders', icon: 'Admin/SlaPolicy' },
          { title: 'XLA Policies', description: 'Outcome based and reads what they can improve and how', icon: 'Admin/SlaPolicy' },
          { title: 'Priority Matrix', description: 'Configure auto-prioritization of tickets based on urgency and impact', icon: 'Admin/PriorityMatrix' },
          { title: 'Field Manager', description: 'Manage fields for forms and time entries', icon: 'Admin/FieldManager' },
          { title: 'Form Templates', description: 'Pre-fill new forms for repetitive tickets/changes', icon: 'Admin/FormTemplates' },
          { title: 'Business Rules for Forms', description: 'Define conditional logic to build dynamic forms', icon: 'Admin/BusinessRules' },
          { title: 'Tags', description: 'Manage tags that streamline search within your service desk', icon: 'Admin/Tags' },
          { title: 'Surveys', description: 'Create surveys across channels to track employee satisfaction and team efficiency', icon: 'LeftNavBar/Settings' },
          { title: 'Closure Rules', description: 'Define fulfilment criteria for closing tickets and problems', icon: 'Admin/ClosureRules' },
          { title: 'Ticket Assignment Policies', description: 'Assign tickets to agents based on their availability, load, and skillset', icon: 'LeftNavBar/Settings' },
          { title: 'Checklist Templates', description: 'Create checklists to help agents fulfill service requests correctly', icon: 'Admin/Checklist' },
          { title: 'Knowledge Base', description: 'Manage solution articles expiry preferences', icon: 'Article' },
        ]
      },
      {
        label: 'Service Request Management',
        items: [
          { title: 'Service Catalog', description: 'Manage list of services provided to your end-users', icon: 'Admin/ServiceCatalog' },
          { title: 'Document Templates and Signatures', description: 'Create ready-to-use templates equipped with formatting, signatures, and more', icon: 'Signature' },
          { title: 'Employee Offboarding', description: 'Streamline processes for stakeholders to offboard relieving employees', icon: 'Admin/EmployeeOffboarding' },
          { title: 'Journeys', description: 'Create automated processes for common journeys like onboarding', icon: 'Admin/Journeys' },
        ]
      },
      {
        label: 'Change Management',
        items: [
          { title: 'Change Lifecycle', description: 'Control transitions within the lifecycle of a change based on its type', icon: 'Admin/ChangeLifecycle' },
          { title: 'Change Risk Policy', description: 'Find and evaluate change risks early using automated insights and survey feedback', icon: 'Admin/ChangeRiskPolicy' },
        ]
      },
    ]
  },
  {
    label: 'Automation & Productivity',
    description: 'Supercharge your service desk with automations, integrations and agent productivity tools',
    groups: [
      {
        label: 'Automation',
        items: [
          { title: 'Workflow Automator', description: 'Automate processes using a drag-and-drop workflow builder', icon: 'Admin/WorkflowAutomator' },
          { title: 'Supervisor Rules', description: 'Run hourly checks to automate actions on matching tickets', icon: 'Admin/Supervisor' },
          { title: 'Orchestration Center', description: 'Automate processes across tools by integrating with third party apps', icon: 'Admin/OrchestrationCenter' },
          { title: 'Scenario Automations', description: 'Create templates to perform multiple actions on a ticket', icon: 'Admin/ScenarioAutomations' },
          { title: 'Credentials', description: 'Store credentials and reference them across forms and workflows', icon: 'Admin/Credentials' },
          { title: 'Skillsets', description: 'Define and manage skillsets for effective ticket routing using Freddy AI', icon: 'Admin/Skillsets' },
        ]
      },
      {
        label: 'Agent Productivity',
        items: [
          { title: 'Canned Responses', description: 'Precreate replies and quickly respond to tickets', icon: 'Admin/CannedResponses' },
          { title: 'Scheduler', description: 'Schedule periodic ticket creation for repetitive tasks', icon: 'Admin/Scheduler' },
          { title: 'Leaderboard', description: 'Set up a point-based system for gamified ticket resolution', icon: 'Admin/Leaderboard' },
          { title: 'Email Commands', description: 'Create email shortcuts to perform tickets actions from your inbox', icon: 'Admin/EmailCommands' },
          { title: 'Collaborate', description: 'Enable conversations using your collaboration tools', icon: 'LeftNavBar/Settings' },
        ]
      },
      {
        label: 'Extensibility',
        items: [
          { title: 'Apps', description: 'Integrate with and manage third-party apps used in your ecosystem', icon: 'Admin/Apps' },
          { title: 'Connector Apps', description: 'Build, automate, and streamline workflows between Freshservice and third-party integrations.', icon: 'Admin/ConnectorApp' },
          { title: 'Custom Objects', description: 'Create referenceable objects to use in workflows and forms', icon: 'Admin/CustomObjects' },
        ]
      },
    ]
  },
  {
    label: 'DevOps Management',
    description: 'Automate your CI/CD tools with our freshservice events',
    groups: [
      {
        label: '',
        items: [
          { title: 'DevOps Tools', description: 'Automate your DevOps process through integrations', icon: 'Admin/Devops' },
        ]
      },
    ]
  },
  {
    label: 'Asset Management',
    description: 'Discover and manage assets and their related information',
    groups: [
      {
        label: '',
        items: [
          { title: 'Asset Types & Fields', description: 'Manage asset types and fields to capture asset information', icon: 'Admin/AssetTypesFields' },
          { title: 'Cloud Management', description: 'Discover and manage your cloud resources with integrations', icon: 'Admin/CloudManagement' },
          { title: 'SaaS Management', description: 'Manage your SaaS apps by integrating with them or with identity providers', icon: 'Admin/SaasManagements' },
          { title: 'Discovery Hub', description: 'Discover and manage your IT assets across their lifecycle with Freshservice\'s ITAM offerings', icon: 'Admin/DiscoveryHub' },
          { title: 'Product Catalog', description: 'Manage products currently used in your organization', icon: 'Admin/ProductCatalog' },
          { title: 'Vendors', description: 'Manage your vendors and their information', icon: 'Admin/Vendors' },
          { title: 'Vendor Fields', description: 'Create and manage fields that capture information for vendors', icon: 'Admin/VendorFields' },
          { title: 'Software Fields', description: 'Create and manage fields that capture information for software', icon: 'Admin/SoftwareFields' },
          { title: 'Contract Types', description: 'Manage default contract types and create new types', icon: 'Admin/ContractTypes' },
          { title: 'Purchase Order Fields', description: 'Create and manage fields that capture information for purchase orders', icon: 'Admin/PurchaseOrderFields' },
          { title: 'Locations', description: 'Manage different locations referenced across the service desk', icon: 'Admin/Locations' },
          { title: 'Asset Depreciation', description: 'Calculate depreciation value of assets using three modes', icon: 'Admin/AssetDepreciation' },
          { title: 'Relationship Types', description: 'Manage upstream and downstream relationship types for assets', icon: 'Admin/RelationshipTypes' },
        ]
      },
    ]
  },
  {
    label: 'IT Operations Management',
    description: 'Track and manage the health of your IT Infrastructure Operations',
    groups: [
      {
        label: '',
        items: [
          { title: 'Monitoring Tools', description: 'Integrate monitoring tools to manage all alerts on a single pane', icon: 'Admin/MonitoringTool' },
          { title: 'On-call schedules', description: 'Ensure 24x7 agent coverage through automated escalation', icon: 'Admin/OnCallManagement' },
          { title: 'Manage Post Incident Reports', description: 'Create and manage Post Incident Report (PIR) templates for streamlined incident analysis', icon: 'LeftNavBar/PostIncidentReports' },
          { title: 'Alert Field Manager', description: 'Enrich alerts with specific data from incoming payloads using alert fields', icon: 'Admin/AlertFieldManager' },
        ]
      },
    ]
  },
  {
    label: 'Project & Workload Management',
    description: 'Manage project and workload settings for your service desk',
    groups: [
      {
        label: '',
        items: [
          { title: 'Project Fields', description: 'Create and manage fields to capture information about projects', icon: 'Admin/ProjectFields' },
          { title: 'Project Collaboration', description: 'Integrate with collaboration platforms to converse about ongoing tasks', icon: 'Admin/ProjectCollaborations' },
          { title: 'JIRA Import', description: 'Import projects and tasks from Jira to Freshservice', icon: 'Admin/JiraImport' },
          { title: 'Devops Integrations', description: 'Integrate with source control tools to see code change details within tasks', icon: 'Admin/DevopsIntegrations' },
          { title: 'Workload Management', description: 'View, manage, and balance the workload of your team', icon: 'Admin/WorkLoadManagement' },
        ]
      },
    ]
  },
];

/** Total items, for the search field placeholder and any count we show. */
export const ADMIN_ITEM_COUNT = ADMIN_SECTIONS.reduce(
  (n, s) => n + s.groups.reduce((m, g) => m + g.items.length, 0),
  0
);

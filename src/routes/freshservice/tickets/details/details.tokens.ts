/**
 * Lookup tables for the Details tab.
 *
 * Everything here maps a value in the data onto something that already exists
 * in the system — a Dew `Tag` variant, an icon from the whitelist, an asset in
 * `Assets/`, a route. No colours, sizes or radii are defined here; the
 * components read Dew's tokens directly.
 */

import type { IconName, TTagVariant } from '@freshworks/dew-components';
import { ticketIdFor } from '../tickets.data';
import type {
  Channel,
  ConfidenceBand,
  DigitId,
  EventType,
  FixStatus,
  Link,
  OutcomeTone
} from './types';

/* ───────────── Avatars and brand marks ───────────── */

import ticketResolverAvatar from '../../../../../Assets/Digits Avatar/Ticket Resolver.svg';
import workplaceConciergeAvatar from '../../../../../Assets/Digits Avatar/Workplace Concierge.svg';
import knowledgeCuratorAvatar from '../../../../../Assets/Digits Avatar/Knowledge Curator.svg';
import freddyAiIcon from '../../../../../Assets/Icons/Freddy AI.svg';
import slackLogo from '../../../../../Assets/Slack logo.svg';
import teamsLogo from '../../../../../Assets/Teams logo.svg';
import meganBrooksAvatar from '../../../../../Assets/Human Avatars/female-9.png';
import agentAvatar from '../../../../../Assets/Human Avatars/female-9-1.png';
import ticketCreationIcon from '../../../../../Assets/Icons/Ticket creation.svg';
import workflowExecutionIcon from '../../../../../Assets/Icons/Workflow Execution.svg';
import approvalRequestIcon from '../../../../../Assets/Icons/Approval request.svg';
import editPropertiesIcon from '../../../../../Assets/Icons/Edit properties.svg';
import assignedAgentIcon from '../../../../../Assets/Icons/Assigned Agent.svg';

/**
 * The three Digits with artwork in `Assets/Digits Avatar/`. The two Handlers
 * have none, so they fall back to the `Bots` whitelist icon in `ActorAvatar`
 * rather than borrowing another Digit's mark.
 */
export const DIGIT_AVATAR: Partial<Record<DigitId, string>> = {
  'ticket-resolver': ticketResolverAvatar,
  'workplace-concierge': workplaceConciergeAvatar,
  'knowledge-curator': knowledgeCuratorAvatar
};

/**
 * Sizing rule for Digit artwork: the longer side is never more than 20px and
 * the other side scales with it (Ticket Resolver's 304×229 mark → 20×15,
 * Workplace Concierge's 304×305 → 20×20). Apply it to every Digit `<img>`;
 * the slot around it can be larger, the artwork centres inside.
 */
export const DIGIT_AVATAR_MAX_PX = 20;
export const DIGIT_AVATAR_STYLE = {
  display: 'block',
  width: 'auto',
  height: 'auto',
  maxWidth: DIGIT_AVATAR_MAX_PX,
  maxHeight: DIGIT_AVATAR_MAX_PX
} as const;

/** The sparkle on both AI cards and the sticky strip. */
export const FREDDY_AI_ICON = freddyAiIcon;

/**
 * People with a photo in `Assets/Human Avatars/`. Keyed by actor id so the
 * stream and the subject block show the same face — `tickets.data.ts` already
 * puts this photo on Megan.
 */
export const PERSON_AVATAR: Record<string, string> = {
  'u-megan': meganBrooksAvatar,
  'a-jordan': agentAvatar
};

/** Only the two chat channels have a mark; the rest read as text. */
export const CHANNEL_LOGO: Partial<Record<Channel, string>> = {
  slack: slackLogo,
  teams: teamsLogo
};

/* ───────────── Copy ───────────── */

/** Sentence case, as the copy conventions require. Used mid-sentence. */
export const CHANNEL_LABEL: Record<Channel, string> = {
  slack: 'Slack',
  teams: 'Teams',
  portal: 'the portal',
  email: 'email',
  phone: 'phone'
};

/** `ticket.source` decides whether the reply bar carries a channel badge. */
export function isChatChannel(channel: Channel): boolean {
  return channel === 'slack' || channel === 'teams';
}

/* ───────────── Tag variants ───────────── */

/**
 * Dew's `Badge` counts things; `Tag` labels them. Every badge in the spec is a
 * label, so they all map onto `Tag` variants.
 */
export const TAG_VARIANT_BY_TONE: Record<OutcomeTone, TTagVariant> = {
  neutral: 'gray',
  success: 'green',
  warning: 'yellow',
  danger: 'red'
};

export const TAG_VARIANT_BY_BAND: Record<ConfidenceBand, TTagVariant> = {
  high: 'green',
  medium: 'yellow',
  low: 'red'
};

export const BAND_LABEL: Record<ConfidenceBand, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

/** B2's suggested-fix status table, label and tone in one place. */
export const FIX_STATUS_BADGE: Record<FixStatus, { label: string; variant: TTagVariant }> = {
  proposed: { label: 'Suggested', variant: 'blue' },
  'awaiting-approval': { label: 'Waiting for approval', variant: 'yellow' },
  running: { label: 'Running', variant: 'blue' },
  applied: { label: 'Applied', variant: 'green' },
  blocked: { label: 'Blocked', variant: 'yellow' },
  none: { label: 'No fix suggested', variant: 'gray' }
};

/* ───────────── Event icons ───────────── */

/**
 * One leading icon per `EventType`, all from Dew's whitelist. Where no icon
 * names the action exactly, the closest existing one is used and the row's
 * text carries the meaning — the spec's own rule about never relying on an
 * icon alone.
 */
export const EVENT_ICON: Record<EventType, IconName> = {
  'ticket-created': 'TicketPrimary',
  delegated: 'PickupTicket',
  'status-changed': 'EditProperties',
  'properties-updated': 'EditProperties',
  searched: 'Search',
  'root-cause-added': 'BulbIdea',
  'summary-updated': 'AiResponse',
  'workflow-executed': 'Admin/WorkflowAutomator',
  'approval-requested': 'Actions/Approve',
  'approval-decided': 'CircleCheck',
  'handed-over': 'Handshake',
  'resolution-notes': 'Note',
  thought: 'BulbIdea',
  'external-update': 'EditProperties',
  'digit-event': 'Bots'
};

/** Authored Digit workup icons supplied for these four event states. */
export const EVENT_CUSTOM_ICON: Partial<Record<EventType, string>> = {
  'ticket-created': ticketCreationIcon,
  delegated: assignedAgentIcon,
  'handed-over': assignedAgentIcon,
  'workflow-executed': workflowExecutionIcon,
  'approval-requested': approvalRequestIcon,
  'properties-updated': editPropertiesIcon,
  'status-changed': editPropertiesIcon
};

/** Fix and workflow steps. `running` uses a `Spinner` instead of an icon. */
export const FIX_STEP_ICON: Record<'done' | 'failed' | 'skipped', IconName> = {
  done: 'Check',
  failed: 'CrossSmall',
  skipped: 'Minus'
};

export const FIX_STEP_COLOR: Record<'done' | 'failed' | 'skipped', string> = {
  done: 'var(--color-icon-semantic-success)',
  failed: 'var(--color-icon-semantic-error)',
  skipped: 'var(--color-icon-secondary)'
};

/* ───────────── Attachments ───────────── */

/**
 * Dew ships a `Docutype/*` icon per file type. Read-only attachment rows use
 * them by extension rather than one generic clip, which is what the product
 * does. Anything unmapped falls back to the family's own unknown icon.
 */
const DOCUTYPE_BY_EXTENSION: Record<string, IconName> = {
  png: 'Docutype/Png',
  jpg: 'Docutype/Jpg',
  jpeg: 'Docutype/Jpeg',
  gif: 'Docutype/Gif',
  svg: 'Docutype/Svg',
  pdf: 'Docutype/Pdf',
  txt: 'Docutype/Txt',
  csv: 'Docutype/Csv',
  doc: 'Docutype/Doc',
  docx: 'Docutype/Docx',
  xls: 'Docutype/Xls',
  xlsx: 'Docutype/Xlsx',
  ppt: 'Docutype/Ppt',
  pptx: 'Docutype/Pptx',
  zip: 'Docutype/Zip',
  mp4: 'Docutype/Mp4',
  mov: 'Docutype/Mov'
};

export function attachmentIcon(fileName: string): IconName {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  return DOCUTYPE_BY_EXTENSION[extension] ?? 'Docutype/Unknown';
}

/* ───────────── Routing ───────────── */

/**
 * Link targets are opaque in the data, so they are resolved here against the
 * routes this app actually has. Records this prototype does not build — change,
 * asset, article, workflow run — resolve to the module's list page rather than
 * a dead `#`, which is the closest honest destination.
 */
export function linkHref(link: Link, ticketCode?: string): string {
  const ticketId = ticketCode ? ticketIdFor(ticketCode) ?? ticketCode : undefined;
  switch (link.to.type) {
    case 'ticket':
      return `/freshservice/tickets/${ticketIdFor(link.to.id ?? '') ?? link.to.id ?? ''}`;
    case 'change':
      return '/freshservice/changes';
    case 'asset':
      return '/freshservice/assets';
    case 'article':
      return '/freshservice/solutions';
    case 'related-tickets':
      // The Related tickets tab lives on this ticket, and the tab strip owns
      // its own state, so the link lands on the ticket itself.
      return ticketId ? `/freshservice/tickets/${ticketId}` : '/freshservice/tickets';
    case 'resolution-tab':
      return ticketId ? `/freshservice/tickets/${ticketId}` : '/freshservice/tickets';
    case 'workflow-run':
      return '/freshservice/admin';
    default:
      return '/freshservice/tickets';
  }
}

export { initials } from '../tickets.data';

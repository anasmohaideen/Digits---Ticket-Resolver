import { useId, useState } from 'react';
import { Icon, TextButton, Tag } from '@freshworks/dew-components';
import type { Channel, EventNode, MessageNode, MessageVariant, ProposedFlags } from './types';
import { CHANNEL_LABEL, isChatChannel } from './details.tokens';
import { dateAndTime } from './format';
import RichHtmlView from './RichHtmlView';
import RichTextView, { StreamingRichTextView } from './RichTextView';
import AttachmentList from './AttachmentList';
import ActorAvatar from './ActorAvatar';
import { eventLine } from './EventRow';
import { META } from './details.styles';
import EventLeadingIcon from './EventLeadingIcon';

function relativeTime(at: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(at).getTime()) / 60_000));
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  const months = Math.round(days / 30);
  return `${months} ${months === 1 ? 'month' : 'months'} ago`;
}

function metaFor(message: MessageNode): string {
  const when = `${relativeTime(message.at)} (${dateAndTime(message.at)})`;
  const channel = isChatChannel(message.channel) ? ` in ${CHANNEL_LABEL[message.channel]}` : '';
  switch (message.variant) {
    case 'forward': return `Forwarded ${when}${message.to?.length ? ` to ${message.to.join(', ')}` : ''}`;
    case 'reply': return `Replied ${when}${message.to?.length ? ` to ${message.to.join(', ')}` : channel}`;
    case 'requester-reply': return `Replied ${when}${channel}`;
    case 'public-note': return `Added a public note ${when}`;
    case 'private-note': return `Added a private note ${when}`;
    default: return `Responded ${when}`;
  }
}

const SURFACE: Record<MessageVariant, string> = {
  forward: 'var(--color-fill-container)',
  reply: 'var(--color-fill-surface)',
  'requester-reply': 'var(--color-fill-surface)',
  'public-note': 'var(--color-fill-semantic-info-mildest)',
  'private-note': 'var(--color-fill-semantic-warning-mildest)',
  'digit-message': 'var(--color-fill-container)',
  'concierge-message': 'var(--color-fill-container)'
};

function isWorker(variant: MessageVariant) {
  return variant === 'digit-message' || variant === 'concierge-message';
}

function workDuration(activities: EventNode[]): string {
  if (activities.length < 2) return '13s';
  const seconds = Math.max(1, Math.round((new Date(activities[activities.length - 1].at).getTime() - new Date(activities[0].at).getTime()) / 1000));
  return seconds < 60 ? `${seconds}s` : `${Math.round(seconds / 60)}m`;
}

function workPhases(activities: EventNode[]) {
  const phases: Array<{ key: string; reasoning?: string; actions: EventNode[] }> = [];
  for (const activity of activities) {
    const key = activity.intentGroup ?? activity.id;
    const current = phases[phases.length - 1];
    if (current?.key === key) current.actions.push(activity);
    else phases.push({ key, reasoning: activity.intent, actions: [activity] });
  }
  return phases;
}

function actionSegments(actions: EventNode[]) {
  const segments: Array<{ actions: EventNode[]; outcome?: string }> = [];
  let current: EventNode[] = [];
  for (const action of actions) {
    current.push(action);
    if (action.workOutcome) {
      segments.push({ actions: current, outcome: action.workOutcome });
      current = [];
    }
  }
  if (current.length) segments.push({ actions: current });
  return segments;
}

export default function MessageCard({
  message,
  ticketCode,
  proposed,
  compact = false,
  channelOverride,
  workActivities,
  reveal = false,
  liveReplayHistory = false
}: {
  message: MessageNode;
  ticketCode?: string;
  proposed: ProposedFlags;
  compact?: boolean;
  channelOverride?: Channel;
  workActivities?: EventNode[];
  reveal?: boolean;
  liveReplayHistory?: boolean;
}) {
  const node = channelOverride ? { ...message, channel: channelOverride } : message;
  const worker = isWorker(node.variant);
  const [workOpen, setWorkOpen] = useState(false);
  const workId = useId();

  return (
    <article
      id={`stream-${node.id}`}
      className={reveal ? 'tr-conversation-reveal' : undefined}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--spacing-150)',
        padding: compact ? 'var(--spacing-150)' : 'var(--spacing-200)',
        background: SURFACE[node.variant],
        border: `1px solid ${node.variant === 'public-note'
          ? 'var(--color-boundary-semantic-info-mildest)'
          : node.variant === 'private-note'
            ? 'var(--color-boundary-semantic-warning-mildest)'
            : 'var(--color-boundary-border-mildest)'}`,
        borderRadius: 'var(--border-radius-large)'
      }}
    >
      <ActorAvatar actor={node.actor} size="xs" pixelSize={32} channel={worker || node.variant === 'requester-reply' ? node.channel : undefined} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', flexWrap: 'wrap', marginBottom: 'var(--spacing-025)' }}>
          <span style={{ font: 'var(--font-body-semibold)', color: 'var(--color-text-primary)' }}>
            {node.actor.name}
          </span>
          {node.variant === 'private-note' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-050)', font: 'var(--font-body-medium)', color: 'var(--color-text-semantic-warning)' }}>
              <Icon name="Lock" size="xs" color="var(--color-icon-semantic-warning)" />
              Private Note
            </span>
          )}
          {proposed.showSentiment && node.flags?.sentiment && <Tag variant="yellow">{node.flags.sentiment}</Tag>}
          {proposed.showDraftedWith && node.flags?.draftedWithCopilot && <Tag variant="gray" iconName="Ai">Drafted with Freddy</Tag>}
        </div>
        <div style={META}>
          {metaFor(node)}
        </div>

        {worker && ((workActivities?.length ?? 0) > 0 || liveReplayHistory) && (
          <div style={{ marginTop: 'var(--spacing-200)' }}>
            <TextButton
              variant="link"
              size="mini"
              aria-expanded={workOpen}
              aria-controls={workId}
              suffixIcon={workOpen ? 'ChevronDown' : 'ChevronRight'}
              onClick={() => setWorkOpen((value) => !value)}
            >
              Worked for {liveReplayHistory && !workActivities?.length ? '5s' : workDuration(workActivities ?? [])}
            </TextButton>
            {workOpen && (
              <div id={workId} style={{ marginTop: 'var(--spacing-100)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-150)' }}>
                {liveReplayHistory && !workActivities?.length && (
                  <div>
                    <p style={{ margin: '0 0 var(--spacing-100)', font: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>I should find out whether the Wi-Fi problem affects only Megan’s laptop before deciding where to route it.</p>
                    <ol style={{ margin: 0, paddingInlineStart: 'var(--spacing-200)', borderInlineStart: '2px solid var(--color-boundary-border-milder)', listStyle: 'none' }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', font: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
                        <Icon name="CircleCheck" size="sm" color="var(--color-icon-disabled)" />
                        Reviewed Megan’s report and prepared a clarifying question.
                      </li>
                    </ol>
                  </div>
                )}
                {workPhases(workActivities ?? []).map((phase) => (
                  <div key={phase.key}>
                    {phase.reasoning && <p style={{ margin: '0 0 var(--spacing-100)', font: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>{phase.reasoning}</p>}
                    {actionSegments(phase.actions).map((segment) => (
                      <div key={segment.actions[0].id}>
                        <ol style={{ margin: 0, paddingInlineStart: 'var(--spacing-200)', borderInlineStart: '2px solid var(--color-boundary-border-milder)', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-150)' }}>
                          {segment.actions.map((activity) => (
                            <li key={activity.id} style={{ display: 'grid', gridTemplateColumns: 'var(--spacing-300) minmax(0, 1fr)', alignItems: 'center', columnGap: 'var(--spacing-100)', font: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
                              <EventLeadingIcon event={activity} />
                              <span style={{ minWidth: 0, lineHeight: '24px' }}>
                                {eventLine(activity, ticketCode, true)}
                              </span>
                            </li>
                          ))}
                        </ol>
                        {segment.outcome && <p style={{ margin: 'var(--spacing-100) 0 0', font: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>{segment.outcome}</p>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: worker && (workActivities?.length || liveReplayHistory) ? 'var(--spacing-150)' : 'var(--spacing-200)', font: 'var(--font-body)', color: 'var(--color-text-primary)' }}>
          {node.html ? <RichHtmlView html={node.html} /> : reveal ? <StreamingRichTextView value={node.body} ticketCode={ticketCode} /> : <RichTextView value={node.body} ticketCode={ticketCode} />}
        </div>
        {node.attachments && <AttachmentList attachments={node.attachments} heading={false} />}
      </div>
    </article>
  );
}

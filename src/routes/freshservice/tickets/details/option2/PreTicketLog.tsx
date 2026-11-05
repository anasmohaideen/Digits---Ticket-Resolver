import { Fragment, useId, useState } from 'react';
import { Icon } from '@freshworks/dew-components';
import type { Attachment, MessageNode } from '../types';
import { dayLabel, timeOfDayAmPm } from '../format';
import RichTextView from '../RichTextView';
import AttachmentTiles from './AttachmentTiles';
import Reveal from './Reveal';

/**
 * The conversation before the ticket existed, as a read-only record at the foot
 * of the top card: a text-link disclosure ("Conversation before ticket (6)")
 * that opens a copy of what the requester saw at handoff.
 *
 *   grouping     Consecutive messages from one person sit under one name; each
 *                still carries its own time.
 *   days         A separator where the chat crosses midnight.
 *   attachments  Tagged inline (`<wifi-error.png>`) and shown as tiles under
 *                the message that carried them; a pasted snippet in full.
 *   handoff      A closing line where the record ends and the ticket begins.
 *
 * Only what the requester saw: no notes, no Digit reasoning, no events.
 */

type Group = { name: string; messages: MessageNode[] };

/** Before the ticket existed, every Digit line reached the requester through Workplace Concierge. */
export function logSpeaker(actor: MessageNode['actor']): string {
  return actor.kind === 'digit' ? 'Workplace Concierge' : actor.name;
}

function groupBySpeaker(messages: MessageNode[]): Group[] {
  const groups: Group[] = [];
  for (const message of messages) {
    const last = groups[groups.length - 1];
    const name = logSpeaker(message.actor);
    if (last && last.name === name && dayLabel(last.messages[last.messages.length - 1].at) === dayLabel(message.at)) {
      last.messages.push(message);
    } else {
      groups.push({ name, messages: [message] });
    }
  }
  return groups;
}

const tagName = (attachment: Attachment) => `<${attachment.name}>`;

/**
 * The log itself: grouped lines, day separators, inline attachment tags and
 * snippets, and the closing "Ticket created" line. Used inside the Description
 * box (the live home) and by the hidden accordion below.
 */
export function LogLines({
  messages,
  ticketCode,
  inlineTiles = false
}: {
  messages: MessageNode[];
  ticketCode?: string;
  /** Show each message's files as tiles under it; the Description box lists them once, at its foot. */
  inlineTiles?: boolean;
}) {
  const groups = groupBySpeaker(messages);
  return (
    <>
      <ol className="tr-o2-log-lines">
        {groups.map((group, index) => {
          const first = group.messages[0];
          const newDay = index === 0 || dayLabel(groups[index - 1].messages[0].at) !== dayLabel(first.at);
          return (
            <Fragment key={first.id}>
              <li className="tr-o2-log-line">
                <div className="tr-o2-log-who">
                  <strong>{group.name}</strong>
                  <time className="tr-o2-log-time" dateTime={first.at}>
                    {newDay ? `${dayLabel(first.at)}, ` : ''}{timeOfDayAmPm(first.at)}
                  </time>
                </div>
                {group.messages.map((message, i) => (
                  <div key={message.id} className="tr-o2-log-text">
                    {i > 0 && <time className="tr-o2-log-time tr-o2-log-time-inline" dateTime={message.at}>{timeOfDayAmPm(message.at)}</time>}
                    <RichTextView value={message.body} ticketCode={ticketCode} />
                    {message.attachments?.map((attachment) => (
                      <span key={attachment.name}>
                        {' '}
                        <span className="tr-o2-log-tag">{tagName(attachment)}</span>
                      </span>
                    ))}
                    {message.attachments?.map((attachment) =>
                      attachment.snippet ? (
                        <pre key={`${attachment.name}-snippet`} className="tr-o2-log-snippet" aria-label={`Contents of ${attachment.name}`}>
                          {attachment.snippet}
                        </pre>
                      ) : null
                    )}
                    {inlineTiles && message.attachments && message.attachments.length > 0 && (
                      <AttachmentTiles attachments={message.attachments.filter((attachment) => !attachment.snippet)} />
                    )}
                  </div>
                ))}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </>
  );
}

/**
 * The accordion version, for the foot of the top card. Not shown for now (the
 * log lives in the Description box); kept so it can come back.
 */
export default function PreTicketLog({
  messages,
  ticketCode,
  defaultOpen = false
}: {
  messages: MessageNode[];
  ticketCode?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  if (messages.length === 0) return null;

  return (
    <div className="tr-o2-log">
      <button
        type="button"
        className="tr-o2-log-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size="sm" title="" />
        <span>Conversation before ticket ({messages.length})</span>
      </button>

      <Reveal open={open} id={panelId}>
        <p className="tr-o2-log-meta">Read-only copy of the conversation at handoff</p>
        <LogLines messages={messages} ticketCode={ticketCode} inlineTiles />
      </Reveal>
    </div>
  );
}

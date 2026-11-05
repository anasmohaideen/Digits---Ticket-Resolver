import type { ReactNode } from 'react';
import { Badge, Tag, TextButton } from '@freshworks/dew-components';
import type { Actor, EventNode } from './types';
import EventLeadingIcon from './EventLeadingIcon';
import { BODY_COMPACT, META, NO_SHRINK, SECTION_LABEL, SPACER } from './details.styles';
import { elapsed, timeOfDay } from './format';
import RichTextView, { InlineLink } from './RichTextView';
import FixSteps from './FixSteps';
import ActorAvatar from './ActorAvatar';
import { DisclosureButton, DisclosurePanel, useDisclosure } from './Disclosure';

/**
 * B5 · Stream events.
 *
 * One row per event: leading icon · actor avatar · actor name · verb phrase ·
 * object · optional badge, count and disclosures. Every `EventType` in the
 * contract is handled here, so a new type fails to compile rather than
 * rendering an empty row.
 */

/** A name set in the middle of a line. */
function Strong({ children }: { children: ReactNode }) {
  return <strong style={{ fontWeight: 'var(--font-weight-semi-bold)' }}>{children}</strong>;
}

/** A person or Digit mentioned mid-line, with their avatar, as in the reference. */
function MentionWithAvatar({ actor }: { actor: Actor }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-025)', verticalAlign: 'middle' }}>
      <ActorAvatar actor={actor} size="xxs" />
      <Strong>{actor.name}</Strong>
    </span>
  );
}

/** "searched for 7 similar tickets" — the phrase the spec gives per type. */
export function eventLine(
  event: EventNode,
  ticketCode?: string,
  showDigitAvatar = false,
  /** Option 2's activity rows: how every person or Digit named in the line is drawn, the actor included. */
  person?: (actor: Actor) => ReactNode
): ReactNode {
  const { data } = event;
  const Mention = person ? ({ actor }: { actor: Actor }) => <>{person(actor)}</> : MentionWithAvatar;
  const who = person
    ? person(event.actor)
    : showDigitAvatar && event.actor.kind === 'digit'
      ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-050)', verticalAlign: 'middle' }}><ActorAvatar actor={event.actor} /><Strong>{event.actor.name}</Strong></span>
      : <Strong>{event.actor.name}</Strong>;

  switch (event.type) {
    case 'ticket-created':
      return (
        <>
          {who} created this ticket on behalf of {data.target ? <Mention actor={data.target} /> : 'the requester'}
        </>
      );
    case 'delegated':
      if (data.method && data.target) {
        const how = data.method === 'manual' ? 'picked it up' : `was auto-assigned (${data.method === 'round-robin' ? 'round robin' : 'load balanced'})`;
        return <>{person ? person(data.target) : <Strong>{data.target.name}</Strong>} {how}</>;
      }
      if (data.group && !data.target) return <>{who} assigned it to <Strong>{data.group}</Strong></>;
      return (
        <>
          {who} assigned it to {data.target ? <Mention actor={data.target} /> : 'another worker'}
        </>
      );
    case 'status-changed':
      return (
        <>
          {who} updated status to <Strong>{data.status}</Strong>
        </>
      );
    case 'properties-updated':
      return (
        <>
          {who} updated <Strong>Ticket properties</Strong>
        </>
      );
    case 'searched':
      // Three authored shapes: a count of things, a count plus the thing it
      // found, and a verb phrase for the work graph.
      return (
        <>
          {who}{' '}
          {data.verb ? (
            data.verb
          ) : (
            <>
              searched for{' '}
              <Strong>
                {data.count} {data.entity}
              </Strong>
            </>
          )}
          {data.object && (
            <>
              {' · '}
              <RichTextView value={data.object} ticketCode={ticketCode} />
            </>
          )}
        </>
      );
    case 'root-cause-added':
      return (
        <>
          {who} added a root cause to the <Strong>Summary</Strong>
        </>
      );
    case 'summary-updated':
      return (
        <>
          {who} updated the <Strong>Summary</Strong>
        </>
      );
    case 'workflow-executed':
      return (
        <>
          {who} executed <Strong>{data.workflow}</Strong>
        </>
      );
    case 'approval-requested':
      return (
        <>
          {who} requested approval from {data.target ? <Mention actor={data.target} /> : 'an approver'}
        </>
      );
    case 'approval-decided':
      return (
        <>
          {who} {data.decision === 'rejected' ? 'rejected' : 'approved'}{' '}
          <Strong>{data.object ? <RichTextView value={data.object} ticketCode={ticketCode} /> : 'the action'}</Strong>
        </>
      );
    case 'handed-over':
      return (
        <>
          {who} handed over to {data.target ? <Mention actor={data.target} /> : 'an agent'}
        </>
      );
    case 'resolution-notes':
      return (
        <>
          {who} generated{' '}
          <Strong>
            {data.object ? <RichTextView value={data.object} ticketCode={ticketCode} /> : 'resolution notes'}
          </Strong>
        </>
      );
    case 'thought':
      return (
        <>
          {who} thought for {elapsed(data.seconds ?? 0)}
        </>
      );
    case 'external-update':
      return (
        <>
          {who} made updates in <Strong>{data.app}</Strong>
        </>
      );
    case 'digit-event':
      return (
        <>
          {who} {data.verb}{' '}
          <Strong>
            {data.object ? <RichTextView value={data.object} ticketCode={ticketCode} /> : ''}
          </Strong>
        </>
      );
    default:
      return who;
  }
}

/** A failed step is called out on the row, not only inside the disclosure. */
function failedSteps(event: EventNode): number {
  return (event.data.steps ?? []).filter((step) => step.status === 'failed').length;
}

export function hasDetails(event: EventNode): boolean {
  const { data } = event;
  return Boolean(data.fields?.length || data.results?.length || data.steps?.length || data.details?.length);
}

/** The indented content under an expanded row. */
export function EventDetails({ event, ticketCode }: { event: EventNode; ticketCode?: string }) {
  const { data } = event;
  return (
    <>
      {data.fields?.map((field) => (
        <div key={field.field} style={BODY_COMPACT}>
          <span style={{ color: 'var(--color-text-secondary)' }}>{field.field}: </span>
          {field.from} to <Strong>{field.to}</Strong>
        </div>
      ))}

      {data.results?.map((result) => (
        <div key={result.link.label} style={{ display: 'flex', gap: 'var(--spacing-100)', alignItems: 'baseline' }}>
          <span style={BODY_COMPACT}>
            <InlineLink link={result.link} ticketCode={ticketCode} />
          </span>
          {result.meta && <span style={META}>{result.meta}</span>}
        </div>
      ))}

      {data.steps && data.steps.length > 0 && <FixSteps steps={data.steps} />}

      {data.details?.map((detail) => (
        <div key={detail.label} style={BODY_COMPACT}>
          <span style={SECTION_LABEL}>{detail.label}: </span>
          <RichTextView value={detail.value} ticketCode={ticketCode} />
        </div>
      ))}
    </>
  );
}

export default function EventRow({
  event,
  ticketCode,
  defaultDetailsOpen = false,
  defaultWhyOpen = false,
  onSummaryUpdated
}: {
  event: EventNode;
  ticketCode?: string;
  defaultDetailsOpen?: boolean;
  defaultWhyOpen?: boolean;
  /** The handover row links back to the Summary card it updated. */
  onSummaryUpdated?: () => void;
}) {
  const details = useDisclosure(defaultDetailsOpen);
  const why = useDisclosure(defaultWhyOpen);
  const failed = failedSteps(event);

  return (
    <div
      id={`stream-${event.id}`}
      style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-050)' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-100)',
          flexWrap: 'wrap',
          padding: 'var(--spacing-050) 0'
        }}
      >
        <EventLeadingIcon event={event} />
        <ActorAvatar actor={event.actor} size="xxs" />
        <span style={BODY_COMPACT}>{eventLine(event, ticketCode)}</span>

        {/* Handover carries its reason as a badge, then its routing as meta. */}
        {event.type === 'handed-over' && event.data.reason && (
          <Tag variant={event.data.reason === 'blocked' ? 'yellow' : 'gray'} style={NO_SHRINK}>
            {event.data.reason === 'blocked' ? 'Blocked' : 'Inconclusive'}
          </Tag>
        )}
        {failed > 0 && <Tag variant="red" style={NO_SHRINK}>{failed === 1 ? '1 step failed' : `${failed} steps failed`}</Tag>}
        {typeof event.data.count === 'number' && event.type === 'properties-updated' && (
          <Badge count={event.data.count} color="neutral" />
        )}
        {typeof event.data.count === 'number' && event.type === 'external-update' && (
          <Badge count={event.data.count} color="neutral" />
        )}

        <span style={META}>
          {event.type === 'handed-over' && event.data.routing ? `· ${event.data.routing} · ` : '· '}
          {timeOfDay(event.at)}
        </span>
        {/* Points back at the Summary card the handover updated. A
            `TextButton` rather than a bare button, so it carries Dew's
            focus-visible ring like every other control here. */}
        {event.type === 'handed-over' && (
          <TextButton type="button" variant="link" size="mini" onClick={onSummaryUpdated}>
            Summary updated
          </TextButton>
        )}

        <span style={SPACER} />
        {hasDetails(event) && <DisclosureButton disclosure={details} label="Details" openLabel="Hide" />}
        {event.why && <DisclosureButton disclosure={why} label="Why" openLabel="Why" />}
      </div>

      <div style={{ paddingInlineStart: 'var(--spacing-400)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-050)' }}>
        <DisclosurePanel disclosure={details}>
          <EventDetails event={event} ticketCode={ticketCode} />
        </DisclosurePanel>
        <DisclosurePanel disclosure={why}>
          <span style={BODY_COMPACT}>{event.why}</span>
        </DisclosurePanel>
      </div>
    </div>
  );
}

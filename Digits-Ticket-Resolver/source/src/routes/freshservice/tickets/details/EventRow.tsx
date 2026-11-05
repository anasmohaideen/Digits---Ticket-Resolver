import { useState, type ReactNode } from 'react';
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
function Mention({ actor }: { actor: Actor }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-025)', verticalAlign: 'middle' }}>
      <ActorAvatar actor={actor} size="xxs" />
      <Strong>{actor.name}</Strong>
    </span>
  );
}

/** "searched for 7 similar tickets" — the phrase the spec gives per type. */
export function eventLine(event: EventNode, ticketCode?: string, showDigitAvatar = false): ReactNode {
  const { data } = event;
  const who = showDigitAvatar && event.actor.kind === 'digit'
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
        return <><Strong>{data.target.name}</Strong> {how}</>;
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

/**
 * What a collapsed row says about its own details, so the toggle is worth the
 * click: a count and a noun, a one-change preview, and a flag when a step failed.
 */
export function detailsSummary(event: EventNode): { label: string; preview?: string; tone: 'default' | 'error' } {
  const { data } = event;
  const failed = (data.steps ?? []).filter((step) => step.status === 'failed').length;
  const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
  if (data.fields?.length) {
    const first = data.fields[0];
    return {
      label: plural(data.fields.length, 'change'),
      preview: data.fields.length === 1 ? `${first.field}: ${first.from} → ${first.to}` : undefined,
      tone: 'default'
    };
  }
  if (data.steps?.length) {
    return { label: failed ? `${plural(data.steps.length, 'step')}, ${failed} failed` : plural(data.steps.length, 'step'), tone: failed ? 'error' : 'default' };
  }
  if (data.results?.length) return { label: plural(data.results.length, 'result'), tone: 'default' };
  if (data.details?.length) return { label: plural(data.details.length, 'detail'), tone: 'default' };
  return { label: 'Why', tone: 'default' };
}

/** The indented content under an expanded row. */
/* Only ordinal scales earn colour; every other field stays plain text. */
const LEVEL_FIELDS = new Set(['Priority', 'Urgency', 'Impact', 'Severity']);
const LEVEL_VARIANT: Record<string, 'green' | 'yellow' | 'red'> = { low: 'green', medium: 'yellow', high: 'red', urgent: 'red', critical: 'red' };

function LevelTag({ value }: { value: string }) {
  const variant = LEVEL_VARIANT[value.trim().toLowerCase()];
  return variant ? <Tag variant={variant}>{value}</Tag> : <Strong>{value}</Strong>;
}

const DETAIL_CAP = 5;

/** Long lists show the first few, then "+N more" opens the rest. */
function Capped<T>({ items, render }: { items: T[]; render: (item: T, index: number) => ReactNode }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, DETAIL_CAP);
  const hidden = items.length - shown.length;
  return (
    <>
      {shown.map(render)}
      {hidden > 0 && <TextButton variant="link" size="mini" onClick={() => setAll(true)}>{`+${hidden} more`}</TextButton>}
    </>
  );
}

export function EventDetails({ event, ticketCode }: { event: EventNode; ticketCode?: string }) {
  const { data } = event;
  return (
    <>
      {data.fields && <Capped items={data.fields} render={(field) => (
        <div key={field.field} style={BODY_COMPACT}>
          <span style={{ color: 'var(--color-text-secondary)' }}>{field.field}: </span>
          {LEVEL_FIELDS.has(field.field) ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-075)', verticalAlign: 'middle' }}>
              <LevelTag value={field.from} />
              <span aria-hidden style={{ color: 'var(--color-text-placeholder)' }}>→</span>
              <LevelTag value={field.to} />
            </span>
          ) : (
            <>{field.from} to <Strong>{field.to}</Strong></>
          )}
        </div>
      )} />}

      {data.results && <Capped items={data.results} render={(result) => (
        <div key={result.link.label} style={{ display: 'flex', gap: 'var(--spacing-100)', alignItems: 'baseline' }}>
          <span style={BODY_COMPACT}>
            <InlineLink link={result.link} ticketCode={ticketCode} />
          </span>
          {result.meta && <span style={META}>{result.meta}</span>}
        </div>
      )} />}

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

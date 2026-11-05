import { useRef, type ReactNode } from 'react';
import type { Actor, EventNode } from '../types';
import ActorAvatar from '../ActorAvatar';
import EventLeadingIcon, { TimelineIconBox } from '../EventLeadingIcon';
import { SparkleIcon } from '../AiCardChrome';

/**
 * The leading mark of a timeline row. One thing happened, one mark: a person
 * acting gets their avatar alone; a Digit or Agent Concierge acting gets its
 * avatar with the kind of action tucked behind it. Anything bigger stacks
 * (overlapping, 24px each) up to three, then "+n"; hover or focus lists every
 * Digit involved and every action performed.
 */

export const MAX_STACK = 3;
const OVERLAP = 'var(--spacing-200)'; // 16px step: a 24px chip overlapped by 8px

export interface LeadItem {
  key: string;
  node: ReactNode;
  /** Who or what, as the popover names it. */
  label: string;
  group: 'who' | 'action';
}

const ACTION_LABEL: Partial<Record<EventNode['type'], string>> = {
  'ticket-created': 'Created the ticket',
  'properties-updated': 'Updated ticket properties',
  'status-changed': 'Changed the status',
  delegated: 'Assigned the ticket',
  'handed-over': 'Handed the ticket over',
  searched: 'Searched',
  'root-cause-added': 'Added the root cause',
  'summary-updated': 'Updated the summary',
  'workflow-executed': 'Ran a workflow',
  'approval-requested': 'Asked for approval',
  'approval-decided': 'Recorded an approval decision',
  'resolution-notes': 'Wrote resolution notes',
  thought: 'Reasoned about it',
  'external-update': 'Updated an external app'
};

export function actionLabel(event: EventNode): string {
  if (event.type === 'digit-event' && event.data.verb) return event.data.verb.charAt(0).toUpperCase() + event.data.verb.slice(1);
  return ACTION_LABEL[event.type] ?? 'Took an action';
}

const isAi = (actor: Actor) => actor.kind === 'digit' || actor.kind === 'copilot';
const actorKey = (actor: Actor) => (actor.kind === 'digit' ? `digit:${actor.digit}` : actor.kind === 'copilot' ? 'copilot' : `${actor.kind}:${actor.id}`);

function whoItem(actor: Actor): LeadItem {
  return { key: actorKey(actor), node: <ActorAvatar actor={actor} size="xxs" />, label: actor.name, group: 'who' };
}

/** What the stack holds for one event, plus any events that were part of the same piece of work. */
export function eventLead(event: EventNode, related: EventNode[] = []): LeadItem[] {
  const all = [event, ...related];
  const items: LeadItem[] = [];
  const seen = new Set<string>();
  const add = (item: LeadItem) => { if (!seen.has(item.key)) { seen.add(item.key); items.push(item); } };

  all.forEach((entry) => add(whoItem(entry.actor)));
  const target = event.data.target;
  if (target) add(whoItem(target));

  /* Only an AI doing something earns an action mark, and one per kind of action. */
  all.filter((entry) => isAi(entry.actor)).forEach((entry) => {
    add({ key: `action:${entry.type}`, node: <EventLeadingIcon event={entry} />, label: actionLabel(entry), group: 'action' });
  });
  return items;
}

/** The same, for the Summary / Root cause pointer rows. */
export function artifactLead(actor: Actor, label: string, work: EventNode[] = []): LeadItem[] {
  const items: LeadItem[] = [whoItem(actor)];
  const seen = new Set(items.map((item) => item.key));
  work.forEach((entry) => {
    const who = whoItem(entry.actor);
    if (!seen.has(who.key)) { seen.add(who.key); items.push(who); }
  });
  if (actor.kind === 'digit') items.push({ key: 'action:artifact', node: <TimelineIconBox><SparkleIcon size="md" /></TimelineIconBox>, label, group: 'action' });
  work.filter((entry) => isAi(entry.actor)).forEach((entry) => {
    const key = `action:${entry.type}`;
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ key, node: <EventLeadingIcon event={entry} />, label: actionLabel(entry), group: 'action' });
  });
  return items;
}

/** How many 24px slots the stack takes (the "+n" chip is one). */
export function leadSlots(items: LeadItem[]): number {
  return items.length > MAX_STACK ? MAX_STACK + 1 : Math.max(items.length, 1);
}

export default function TimelineLead({ items }: { items: LeadItem[] }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  /* Opens below by default; flips above / to the end when the window edge is too close. */
  const place = () => {
    const node = ref.current;
    const pop = node?.querySelector<HTMLElement>('.tr-lead-pop');
    if (!node || !pop) return;
    node.classList.remove('is-up', 'is-end');
    const box = node.getBoundingClientRect();
    const need = pop.offsetHeight || 160;
    const width = pop.offsetWidth || 240;
    const scroller = node.closest<HTMLElement>('[data-ticket-conversation-scroller]');
    const bottomEdge = Math.min(window.innerHeight, scroller ? scroller.getBoundingClientRect().bottom : window.innerHeight);
    if (box.bottom + need + 12 > bottomEdge) node.classList.add('is-up');
    if (box.left + width + 12 > window.innerWidth) node.classList.add('is-end');
  };
  if (items.length <= 1) {
    return <span style={{ display: 'inline-flex', minHeight: 'var(--spacing-300)' }}>{items[0]?.node}</span>;
  }
  const shown = items.slice(0, MAX_STACK);
  const extra = items.length - shown.length;
  const who = items.filter((item) => item.group === 'who');
  const actions = items.filter((item) => item.group === 'action');

  return (
    <span ref={ref} className="tr-lead" tabIndex={0} onMouseEnter={place} onFocus={place} role="group" aria-label={`${who.map((item) => item.label).join(', ')}: ${actions.length} actions`}>
      <span className="tr-lead-stack" aria-hidden>
        {shown.map((item, index) => (
          <span key={item.key} className="tr-lead-chip" style={{ marginInlineStart: index === 0 ? 0 : `calc(${OVERLAP} - var(--spacing-300))`, zIndex: MAX_STACK - index }}>
            {item.node}
          </span>
        ))}
        {extra > 0 && (
          <span className="tr-lead-chip tr-lead-more" style={{ marginInlineStart: `calc(${OVERLAP} - var(--spacing-300))` }}>+{extra}</span>
        )}
      </span>
      <span className="tr-lead-pop" role="tooltip">
        {who.length > 0 && (
          <>
            <span className="tr-lead-pop-head">{who.some((item) => item.key.startsWith('digit') || item.key === 'copilot') ? 'Digits involved' : 'People involved'}</span>
            {who.map((item) => (
              <span key={item.key} className="tr-lead-pop-row">{item.node}<span>{item.label}</span></span>
            ))}
          </>
        )}
        {actions.length > 0 && (
          <>
            <span className="tr-lead-pop-head">Actions performed</span>
            {actions.map((item) => (
              <span key={item.key} className="tr-lead-pop-row">{item.node}<span>{item.label}</span></span>
            ))}
          </>
        )}
      </span>
    </span>
  );
}

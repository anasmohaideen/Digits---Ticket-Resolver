/**
 * Option 2's conversation rules from the 21 Oct review: responses only, the
 * "+N" fold, and what the top card leads with. Run with `pnpm test`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  availableArtifacts,
  buildResponseTimeline,
  assignmentEvent,
  collapseResponses,
  leadArtifact,
  requesterVisible,
  splitAtCreation,
  ticketCreatedAt,
  RESPONSE_VISIBLE,
  SURFACED_EVENT_TYPES
} from './responseTimeline.ts';
import { scenarioStream } from './scenarios.ts';
import { INC_4127 } from '../fixtures/inc-4127.ts';
import { INC_4140 } from '../fixtures/inc-4140.ts';
import { INC_4142 } from '../fixtures/inc-4142.ts';

const base = buildResponseTimeline(INC_4127.stream);

test('the stream keeps responses, artifacts, assignments and status changes, and folds other work', () => {
  const kinds = new Set(base.entries.map((entry) => entry.kind));
  assert.deepEqual([...kinds].sort(), ['approval', 'artifact', 'event', 'message']);
  const events = base.entries.filter((entry) => entry.kind === 'event').map((entry) => entry.kind === 'event' && entry.type);
  assert.deepEqual(events, ['delegated', 'ticket-created', 'properties-updated', 'delegated', 'delegated']);
  const times = base.entries.map((entry) => Date.parse(entry.at));
  assert.deepEqual(times, [...times].sort((a, b) => a - b));
  const artifacts = base.entries.filter((entry) => entry.kind === 'artifact').map((entry) => entry.kind === 'artifact' && entry.artifact);
  assert.deepEqual(artifacts, ['summary', 'root-cause']);
});

test('work that produced the root cause is attached to the root cause entry', () => {
  const work = base.workById['e-rc'] ?? [];
  assert.ok(work.length > 0);
  assert.ok(work.every((event) => event.actor.kind === 'digit'));
});

test('no Digit work is lost between entries', () => {
  const attached = Object.values(base.workById).flat().length;
  let digitWork = 0;
  const walk = (nodes: typeof INC_4127.stream) => nodes.forEach((node) => {
    if (node.kind === 'group') walk(node.children);
    else if (node.kind === 'event' && node.actor.kind === 'digit' && !['summary-updated', 'root-cause-added', 'resolution-notes', ...SURFACED_EVENT_TYPES].includes(node.type)) digitWork += 1;
  });
  walk(INC_4127.stream);
  assert.equal(attached, digitWork);
});

test('past the threshold, everything but the latest two folds into one pill', () => {
  const s1 = buildResponseTimeline([...INC_4127.stream, ...scenarioStream('1')]);
  const rows = collapseResponses(s1.entries);
  assert.equal(rows[0].kind, 'collapsed');
  const last = rows[rows.length - 1];
  assert.equal(last.kind === 'entry' && last.entry.id, 'o2-m10');
  /* One pill: the assignment rows inside the folded range fold with it. */
  assert.equal(rows.filter((row) => row.kind === 'collapsed').length, 1);
  const responses = s1.entries.filter((entry) => entry.kind !== 'event');
  const hidden = rows[0].kind === 'collapsed' ? rows[0].hidden : [];
  assert.equal(hidden.filter((entry) => entry.kind !== 'event').length, responses.length - RESPONSE_VISIBLE);
  assert.ok(hidden.some((entry) => entry.kind === 'event'));
});

test('short conversations and expanded ones are not folded', () => {
  assert.ok(collapseResponses(base.entries.slice(0, 4)).every((row) => row.kind === 'entry'));
  assert.ok(collapseResponses(base.entries, { expanded: true }).every((row) => row.kind === 'entry'));
});

test('a hand-over is two events: to the group with its reasoning, then to the person with how', () => {
  const group = base.entries.find((entry) => entry.kind === 'event' && entry.data.group && !entry.data.target);
  assert.ok(group && group.kind === 'event');
  const row = assignmentEvent(group);
  assert.equal(row.type, 'delegated');
  assert.equal(row.data.group, 'Network Team');
  assert.equal(row.data.target, undefined);
  assert.ok((row.data.details?.length ?? 0) > 0);

  const person = base.entries.find((entry) => entry.kind === 'event' && entry.data.method);
  assert.ok(person && person.kind === 'event');
  assert.equal(person.data.target?.name, 'Jordan Reyes');
  assert.equal(person.data.method, 'round-robin');
  assert.ok(base.entries.indexOf(group) < base.entries.indexOf(person));
});

test('creating the ticket and setting its properties are rows of their own, with their reasoning', () => {
  const created = base.entries.find((entry) => entry.kind === 'event' && entry.type === 'ticket-created');
  const props = base.entries.find((entry) => entry.kind === 'event' && entry.type === 'properties-updated');
  assert.ok(created && created.kind === 'event' && props && props.kind === 'event');
  assert.ok(assignmentEvent(props).data.details?.some((detail) => detail.label === 'Why'));
  assert.ok(base.entries.indexOf(created) < base.entries.indexOf(props));
  assert.ok(!Object.values(base.workById).flat().some((event) => event.id === created.id || event.id === props.id));
});

test('the conversation splits at the moment the ticket was created', () => {
  const createdAt = ticketCreatedAt(INC_4127.stream);
  assert.equal(createdAt, '2026-10-19T09:17:20-07:00');
  const { before, after } = splitAtCreation(base.entries, createdAt);
  assert.equal(before.length + after.length, base.entries.length);
  assert.ok(before.every((entry) => Date.parse(entry.at) < Date.parse(createdAt!)));
  assert.ok(after.every((entry) => Date.parse(entry.at) >= Date.parse(createdAt!)));
  /* Without a "ticket created" event there is no log to split off. */
  assert.deepEqual(splitAtCreation(base.entries, undefined).before, []);
});

test('the log keeps only what the requester saw, with its attachments', () => {
  const { before } = splitAtCreation(base.entries, ticketCreatedAt(INC_4127.stream));
  const log = requesterVisible(before);
  assert.deepEqual(log.map((message) => message.id), ['m1', 'm2', 'm3', 'm4', 'm5', 'm9']);
  assert.ok(before.some((entry) => entry.kind === 'event'), 'the assignment is before the ticket but is not in the log');
  const files = log.flatMap((message) => message.attachments ?? []);
  assert.deepEqual(files.map((file) => file.name), ['wifi-error.png', 'wifi-diagnostics.txt']);
  assert.ok(files.some((file) => file.snippet));
});

test('each human-routed path has a chat before the ticket, a hand-over and the right ending', () => {
  const paths = [
    { tab: INC_4140, handover: 'blocked', root: 'found', fix: 'blocked' },
    { tab: INC_4142, handover: 'inconclusive', root: 'inconclusive', fix: 'none' }
  ] as const;
  for (const { tab, handover, root, fix } of paths) {
    const timeline = buildResponseTimeline(tab.stream);
    const createdAt = ticketCreatedAt(tab.stream);
    assert.ok(createdAt, `${tab.ticket.id} has a ticket-created event`);
    const { before } = splitAtCreation(timeline.entries, createdAt);
    assert.ok(requesterVisible(before).length >= 5, `${tab.ticket.id} has its pre-ticket chat`);
    assert.ok(before.every((entry) => entry.kind === 'message' || entry.kind === 'event'));
    const ho = timeline.entries.find((entry) => entry.kind === 'event' && entry.data.group && !entry.data.target);
    assert.ok(ho && ho.kind === 'event' && ho.data.reason === handover);
    assert.equal(tab.rootCause.state, root);
    assert.equal(tab.rootCause.fix?.status, fix);
    assert.equal(tab.ticket.source, 'slack');
    assert.equal(tab.ticket.assignee?.name, 'Jordan Reyes');
    assert.ok(!timeline.entries.some((entry) => entry.kind === 'approval'), 'these paths carry no approval card');
  }
});

test('the top card leads with resolution, then root cause, then summary', () => {
  assert.equal(leadArtifact(availableArtifacts(INC_4127, false)), 'root-cause');
  assert.equal(leadArtifact(availableArtifacts(INC_4127, true)), 'resolution');
  const noCause = { ...INC_4127, rootCause: { ...INC_4127.rootCause, state: 'not-analyzed' as const } };
  assert.equal(leadArtifact(availableArtifacts(noCause, false)), 'summary');
});

test('S4 adds the resolution note as its own entry, carrying its work', () => {
  const s4 = buildResponseTimeline([...INC_4127.stream, ...scenarioStream('4')]);
  const last = s4.entries[s4.entries.length - 1];
  assert.equal(last.kind === 'artifact' && last.artifact, 'resolution');
  /* Its third piece of work, the status change, is its own row now. */
  assert.equal(s4.workById[last.id]?.length, 2);
  const status = s4.entries.find((entry) => entry.kind === 'event' && entry.type === 'status-changed');
  assert.ok(status);
});

import { groupPropertyUpdates } from './responseTimeline.ts';

test('consecutive property updates from one actor merge into one row, first from / last to', () => {
  const actor = { kind: 'digit', digit: 'ticket-resolver', name: 'Ticket Resolver' } as const;
  const make = (id: string, field: string, from: string, to: string) => ({
    kind: 'event' as const, id, at: '2026-10-19T09:00:00-07:00', actor, type: 'properties-updated' as const,
    data: { fields: [{ field, from, to }], count: 1 }
  });
  const out = groupPropertyUpdates([make('a', 'Priority', 'Low', 'Medium'), make('b', 'Category', 'None', 'Network'), make('c', 'Priority', 'Medium', 'High')] as never);
  assert.equal(out.length, 1);
  const first = out[0] as { data: { fields: Array<{ field: string; from: string; to: string }>; count: number } };
  assert.equal(first.data.count, 2);
  assert.deepEqual(first.data.fields.find((f) => f.field === 'Priority'), { field: 'Priority', from: 'Low', to: 'High' });
});

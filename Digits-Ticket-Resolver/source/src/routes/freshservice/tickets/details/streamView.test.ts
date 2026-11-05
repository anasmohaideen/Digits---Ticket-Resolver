/**
 * Tests for the Details tab's grouping and landing rules.
 *
 * Run with `pnpm test` — Node's built-in runner, which strips the types on the
 * way in. No DOM and no snapshots: these cover the rules in
 * `spec/03-behaviour.md`, not the styling.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildReviewView,
  buildStreamView,
  collapseHumanThreads,
  derivePhaseChips,
  descendantIds,
  findGroupContaining,
  firstUnreadId,
  flattenMessages,
  getLandingTarget,
  initialOpenPhases,
  isHumanActor,
  phasesOf,
  runChips,
  HUMAN_THREAD_THRESHOLD,
  HUMAN_THREAD_VISIBLE
} from './streamView.ts';
import { INC_4127 } from './fixtures/inc-4127.ts';
import { INC_4133 } from './fixtures/inc-4133.ts';
import type { GroupNode, MessageNode, StreamNode } from './types.ts';

const run = INC_4127.stream.find(
  (node): node is GroupNode => node.kind === 'group' && node.level === 'run'
)!;

function message(id: string, at: string, who: 'human' | 'digit'): MessageNode {
  return {
    kind: 'message',
    id,
    at,
    actor:
      who === 'human'
        ? { kind: 'agent', id: 'a-1', name: 'Jordan Reyes' }
        : { kind: 'digit', digit: 'ticket-resolver', name: 'Ticket Resolver' },
    variant: who === 'human' ? 'reply' : 'digit-message',
    channel: 'slack',
    body: [id]
  };
}

/* ───────────── Landing position ───────────── */

test('lands at the top when the viewer has never seen the ticket', () => {
  assert.deepEqual(getLandingTarget(INC_4127), { kind: 'top' });
});

test('lands at the top when the viewer last looked before the handover', () => {
  const tab = {
    stream: INC_4127.stream,
    viewer: { ...INC_4127.viewer, lastSeenAt: '2026-10-19T09:20:00-07:00' }
  };
  assert.deepEqual(getLandingTarget(tab), { kind: 'top' });
});

test('lands at the top when the worker sign-off is the latest item already seen', () => {
  const tab = {
    stream: INC_4127.stream,
    viewer: { ...INC_4127.viewer, lastSeenAt: '2026-10-19T09:36:00-07:00' }
  };
  assert.deepEqual(getLandingTarget(tab), { kind: 'top' });
  assert.equal(firstUnreadId(tab), undefined);
});

test('lands at the top when the viewer has seen everything', () => {
  const tab = {
    stream: INC_4127.stream,
    viewer: { ...INC_4127.viewer, lastSeenAt: '2026-10-19T23:00:00-07:00' }
  };
  assert.deepEqual(getLandingTarget(tab), { kind: 'top' });
  assert.equal(firstUnreadId(tab), undefined);
});

test('a ticket with no handover still lands on its first unread item', () => {
  // INC-4133 is human-only: no handover event, and the viewer last looked at
  // 8:51, after the final forward at 8:50.
  assert.deepEqual(getLandingTarget(INC_4133), { kind: 'top' });

  const earlier = {
    stream: INC_4133.stream,
    viewer: { ...INC_4133.viewer, lastSeenAt: '2026-10-19T08:30:00-07:00' }
  };
  assert.deepEqual(getLandingTarget(earlier), { kind: 'item', id: 'x4' });
});

/* ───────────── Human-thread collapsing ───────────── */

test('INC-4133 folds its seven human messages into "+3 conversations" and four cards', () => {
  const rows = collapseHumanThreads(INC_4133.stream);
  assert.equal(rows.length, 5);

  const [pill, ...cards] = rows;
  assert.equal(pill.kind, 'collapsed');
  assert.equal(pill.kind === 'collapsed' && pill.hidden.length, 3);
  assert.deepEqual(
    pill.kind === 'collapsed' ? pill.hidden.map((node) => node.id) : [],
    ['x1', 'x2', 'x3']
  );
  assert.deepEqual(
    cards.map((row) => (row.kind === 'node' ? row.node.id : row.id)),
    ['x4', 'x5', 'x6', 'x7']
  );
});

test('a run at the threshold is left alone', () => {
  const nodes: StreamNode[] = Array.from({ length: HUMAN_THREAD_THRESHOLD }, (_, i) =>
    message(`h${i}`, `2026-10-19T09:0${i}:00-07:00`, 'human')
  );
  const rows = collapseHumanThreads(nodes);
  assert.equal(rows.length, HUMAN_THREAD_THRESHOLD);
  assert.ok(rows.every((row) => row.kind === 'node'));
});

test('one more than the threshold folds, keeping the latest four', () => {
  const nodes: StreamNode[] = Array.from({ length: HUMAN_THREAD_THRESHOLD + 1 }, (_, i) =>
    message(`h${i}`, `2026-10-19T09:0${i}:00-07:00`, 'human')
  );
  const rows = collapseHumanThreads(nodes);
  assert.equal(rows.filter((row) => row.kind === 'node').length, HUMAN_THREAD_VISIBLE);
  assert.equal(rows[0].kind, 'collapsed');
});

test('a non-message breaks a human run, so neither side folds', () => {
  const event: StreamNode = {
    kind: 'event',
    id: 'e1',
    at: '2026-10-19T09:03:30-07:00',
    actor: { kind: 'digit', digit: 'ticket-resolver', name: 'Ticket Resolver' },
    type: 'summary-updated',
    data: {}
  };
  const nodes: StreamNode[] = [
    ...Array.from({ length: 4 }, (_, i) => message(`a${i}`, `2026-10-19T09:0${i}:00-07:00`, 'human')),
    event,
    ...Array.from({ length: 4 }, (_, i) => message(`b${i}`, `2026-10-19T09:1${i}:00-07:00`, 'human'))
  ];
  assert.ok(collapseHumanThreads(nodes).every((row) => row.kind === 'node'));
});

test('Digit messages are not part of a human run', () => {
  const nodes: StreamNode[] = [
    ...Array.from({ length: 3 }, (_, i) => message(`a${i}`, `2026-10-19T09:0${i}:00-07:00`, 'human')),
    message('d1', '2026-10-19T09:04:00-07:00', 'digit'),
    ...Array.from({ length: 3 }, (_, i) => message(`b${i}`, `2026-10-19T09:1${i}:00-07:00`, 'human'))
  ];
  assert.ok(collapseHumanThreads(nodes).every((row) => row.kind === 'node'));
  assert.equal(isHumanActor(nodes[3].kind === 'message' ? nodes[3].actor : nodes[0].actor), false);
});

test('opening the pill reveals every message in the run', () => {
  const rows = collapseHumanThreads(INC_4133.stream, ['collapsed-x1']);
  assert.equal(rows.length, 7);
  assert.ok(rows.every((row) => row.kind === 'node'));
});

/* ───────────── The filter ───────────── */

test('"Messages only" flattens nested messages in time order and drops everything else', () => {
  const rows = buildStreamView(INC_4127.stream, { filter: 'messages-only' });
  const ids = rows.flatMap((row) => (row.kind === 'node' ? [row.node.id] : row.hidden.map((m) => m.id)));

  assert.deepEqual(ids, ['m1', 'm2', 'm3', 'm4', 'm5', 'm9']);
  assert.ok(rows.every((row) => row.kind === 'collapsed' || row.node.kind === 'message'));
});

test('"All activity" keeps the run group as one row', () => {
  const rows = buildStreamView(INC_4127.stream, { filter: 'all-activity' });
  assert.deepEqual(
    rows.map((row) => (row.kind === 'node' ? row.node.id : row.id)),
    ['g-run', 'e-ho', 'm9']
  );
});

test('flattenMessages reaches into phases', () => {
  assert.equal(flattenMessages(INC_4127.stream).length, 6);
  assert.equal(flattenMessages(INC_4133.stream).length, 7);
});

/* ───────────── Groups ───────────── */

test('the run shows the chips it was authored with', () => {
  assert.deepEqual(
    runChips(run).map((chip) => chip.label),
    ['Deflection · didn’t resolve', 'Triage · 5 fields set', 'Root cause · High', 'Resolution · approved, then blocked']
  );
});

test('a run authored without chips derives one per phase', () => {
  const chips = derivePhaseChips(run);
  assert.deepEqual(chips, [
    { label: 'Before the ticket · Deflection didn’t resolve', tone: 'neutral' },
    { label: 'Triage · 5 fields set', tone: 'neutral' },
    { label: 'Root cause · High · 0.84', tone: 'success' },
    { label: 'Resolution · Blocked', tone: 'warning' }
  ]);
  assert.deepEqual(runChips({ ...run, outcomes: [] }), chips);
});

test('phases start collapsed, and a deep link opens the one holding its item', () => {
  assert.deepEqual(initialOpenPhases(run), []);
  // e-wf is the failed workflow run, which lives in the Resolution phase.
  assert.deepEqual(initialOpenPhases(run, 'e-wf'), ['p-res']);
  assert.deepEqual(initialOpenPhases(run, 'e-rc'), ['p-rca']);
});

test('the run holding an item can be found from the top of the stream', () => {
  assert.equal(findGroupContaining(INC_4127.stream, 'e-wf')?.id, 'g-run');
  assert.equal(findGroupContaining(INC_4127.stream, 'm10'), undefined);
});

test('phasesOf lists only phase groups, in order', () => {
  assert.deepEqual(phasesOf(run).map((phase) => phase.id), ['p-before', 'p-triage', 'p-rca', 'p-res']);
});

test('descendantIds walks the whole subtree', () => {
  const ids = descendantIds(run);
  assert.ok(ids.includes('g-run'));
  assert.ok(ids.includes('p-before'));
  assert.ok(ids.includes('m1'));
  assert.ok(ids.includes('ap1'));
});

/* ───────────── Review states ───────────── */

test('"landing" is the fixture as authored, with nothing expanded', () => {
  const view = buildReviewView(INC_4127, 'landing');
  assert.equal(view.stream, INC_4127.stream);
  assert.deepEqual(view.openRunIds, []);
  assert.deepEqual(view.openPhaseIds, []);
});

test('"engaged" keeps the worker response as the primary ticket ending', () => {
  const view = buildReviewView(INC_4127, 'engaged');
  assert.equal(view.stream[view.stream.length - 1]?.id, 'm9');
  assert.deepEqual(view.openRunIds, []);
});

test('"expanded" opens the run and the two phases the spec names', () => {
  const view = buildReviewView(INC_4127, 'expanded');
  assert.deepEqual(view.openRunIds, ['g-run']);
  assert.deepEqual(view.openPhaseIds, ['p-before', 'p-rca']);
});

test('a human-only ticket has no run to expand', () => {
  const view = buildReviewView(INC_4133, 'expanded');
  assert.deepEqual(view.openRunIds, []);
  assert.deepEqual(view.openPhaseIds, []);
});

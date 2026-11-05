import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INC_4127 } from './fixtures/inc-4127.ts';
import { buildConversationTimeline } from './conversationTimeline.ts';

test('Digit and requester responses are separate conversation cards', () => {
  const timeline = buildConversationTimeline(INC_4127.stream);
  const ids = timeline.nodes.map((node) => node.id);
  for (const id of ['m1', 'm2', 'm3', 'm4', 'm5', 'm9']) assert.ok(ids.includes(id), id);
  assert.ok(ids.indexOf('m4') < ids.indexOf('m5'));
  assert.ok(ids.indexOf('m5') < ids.indexOf('m9'));
});

test('summary, root cause and approval are timeline artifacts', () => {
  const ids = buildConversationTimeline(INC_4127.stream).nodes.map((node) => node.id);
  assert.ok(ids.indexOf('e-rc') < ids.indexOf('ap1'));
});

test('work logs contain actions and reasoning, never messages or artifacts', () => {
  const timeline = buildConversationTimeline(INC_4127.stream);
  assert.deepEqual(timeline.workByMessageId.m4.map((event) => event.id), ['e-deleg', 'e-kb']);
  assert.deepEqual(timeline.workByMessageId.m9.map((event) => event.id).slice(0, 2), ['e-created', 'e-props']);
  assert.deepEqual(timeline.workByMessageId.m9.map((event) => event.id).slice(-2), ['e-wf', 'e-ho']);
  assert.ok(!Object.values(timeline.workByMessageId).flat().some((event) => event.id === 'e-ad'));
  assert.ok(Object.values(timeline.workByMessageId).flat().every((event) => event.actor.kind === 'digit' && (event.intent || event.intentGroup)));
  assert.deepEqual(timeline.workByMessageId.m9.slice(-2).map((event) => event.intentGroup), ['approved-workflow', 'approved-workflow']);
  assert.equal(timeline.workByMessageId.m9.filter((event) => event.intentGroup === 'investigation').length, 3);
  assert.ok(timeline.workByMessageId.m9.some((event) => event.id === 'e-sw' && event.workOutcome));
  assert.ok(Object.values(timeline.workByMessageId).flat().every((event) => event.kind === 'event' && !['summary-updated', 'root-cause-added'].includes(event.type)));
});

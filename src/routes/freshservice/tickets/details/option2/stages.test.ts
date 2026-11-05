import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INC_4127 } from '../fixtures/inc-4127.ts';
import { INC_4142 } from '../fixtures/inc-4142.ts';
import { buildResponseTimeline } from './responseTimeline.ts';
import { STAGE_TICKETS, applyStageToTab, cutEntries, digitOwns, parseStage, stagesFor } from './stages.ts';

const ids = (tab: typeof INC_4127, stage: Parameters<typeof cutEntries>[1]) =>
  cutEntries(buildResponseTimeline(tab.stream).entries, stage).map((entry) => entry.id);

test('each stage shows the rows that exist by the end of that job', () => {
  assert.deepEqual(ids(INC_4127, 'created').filter((id) => id.startsWith('e-')), ['e-deleg', 'e-created']);
  assert.ok(ids(INC_4127, 'triage').includes('e-props'));
  assert.ok(!ids(INC_4127, 'triage').includes('e-sum'));
  assert.ok(ids(INC_4127, 'summary').includes('e-sum') && !ids(INC_4127, 'summary').includes('e-rc'));
  assert.ok(ids(INC_4127, 'rca-done').includes('e-rc') && !ids(INC_4127, 'rca-done').includes('e-ho'));
  const group = ids(INC_4127, 'group');
  assert.ok(group.includes('e-ho') && !group.includes('e-ho-person'));
  assert.ok(ids(INC_4127, 'person').includes('e-ho-person'));
  assert.deepEqual(ids(INC_4127, undefined), buildResponseTimeline(INC_4127.stream).entries.map((entry) => entry.id));
});

test('the same stages cut the other human-routed ticket', () => {
  assert.ok(ids(INC_4142, 'group').includes('i-ho') && !ids(INC_4142, 'group').includes('i-ho-person'));
});

test('a stage sets the top cards to how they stood, and leaves the full ticket alone', () => {
  assert.equal(applyStageToTab(INC_4127, undefined), INC_4127);
  assert.equal(applyStageToTab(INC_4127, 'created').summary.state, 'not-generated');
  assert.equal(applyStageToTab(INC_4127, 'created').rootCause.state, 'not-analyzed');
  assert.equal(applyStageToTab(INC_4127, 'summarising').summary.state, 'generating');
  assert.equal(applyStageToTab(INC_4127, 'rca-running').rootCause.state, 'analyzing');
  assert.equal(applyStageToTab(INC_4127, 'rca-done').rootCause.state, INC_4127.rootCause.state);
});

test('the approval stage belongs to the ticket whose story has the approval', () => {
  assert.ok(stagesFor('INC-4127').some((stage) => stage.id === 'approval'));
  assert.ok(!stagesFor('INC-4140').some((stage) => stage.id === 'approval'));
  assert.equal(parseStage('approval', 'INC-4140'), undefined);
  assert.deepEqual(STAGE_TICKETS, ['INC-4127', 'INC-4140', 'INC-4142']);
});

test('a failed job hands the ticket to a group and then a person, and the summary says so', () => {
  const triage = applyStageToTab(INC_4127, 'triage-failed');
  assert.equal(triage.summary.state, 'not-generated');
  const rca = applyStageToTab(INC_4127, 'rca-failed');
  assert.equal(rca.rootCause.state, 'not-analyzed');
  assert.equal(rca.summary.state, 'ready');
  assert.ok(ids(INC_4127, 'rca-failed').includes('e-sum') && !ids(INC_4127, 'rca-failed').includes('e-rc'));
  assert.ok(stagesFor('INC-4127').some((stage) => stage.id === 'rca-failed'));
});

test('the Digit holds the ticket until it hands over', () => {
  for (const id of ['summary', 'rca-done', 'approval'] as const) assert.ok(digitOwns(id), id);
  for (const id of ['triage-failed', 'rca-failed', 'group', 'person', 'resolved', 'blocked-freeze'] as const) assert.ok(!digitOwns(id), id);
  assert.ok(!digitOwns(undefined));
});

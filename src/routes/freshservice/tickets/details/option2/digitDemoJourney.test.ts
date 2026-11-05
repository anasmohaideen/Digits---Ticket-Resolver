import { test } from 'node:test';
import assert from 'node:assert/strict';
import { digitDemoJourney } from './digitDemoJourney.ts';
import { STAGES } from './stages.ts';

test('each journey stops at the selected outcome instead of always resolving', () => {
  for (const stage of STAGES) {
    const journey = digitDemoJourney(stage.id);
    assert.equal(journey[journey.length - 1]?.stage, stage.id);
    assert.ok(journey.every((step) => step.duration > 0));
    assert.equal(new Set(journey.map((step) => step.id)).size, journey.length);
    if (stage.id !== 'resolved') assert.ok(!journey.some((step) => step.stage === 'resolved'));
  }
});

test('failed jobs do not generate artifacts from later jobs', () => {
  const triage = digitDemoJourney('triage-failed');
  assert.ok(!triage.some((step) => step.generating || step.work === 'root-cause' || step.work === 'resolution'));
  const rca = digitDemoJourney('rca-failed');
  assert.ok(rca.some((step) => step.generating === 'summary'));
  assert.ok(!rca.some((step) => step.generating === 'root-cause' || step.work === 'resolution'));
});

test('approval stops at waiting and resolved includes resolution generation', () => {
  const waiting = digitDemoJourney('approval');
  assert.equal(waiting[waiting.length - 1]?.live, 'waiting');
  assert.ok(!waiting.some((step) => step.id === 'fix' || step.generating === 'resolution'));
  const resolved = digitDemoJourney('resolved');
  assert.ok(resolved.some((step) => step.generating === 'resolution'));
});

test('full ticket follows the authored handover journey', () => {
  const journey = digitDemoJourney(undefined);
  assert.equal(journey[journey.length - 1]?.stage, 'person');
  assert.ok(journey.some((step) => step.stage === 'group'));
  assert.ok(!journey.some((step) => step.generating === 'resolution'));
});

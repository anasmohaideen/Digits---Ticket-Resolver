import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INC_4127 } from '../fixtures/inc-4127.ts';
import { applyStageToTab } from './stages.ts';
import { digitWorkPresentation } from './digitWork.ts';
import { digitDemoJourney } from './digitDemoJourney.ts';

test('Digit generation stays inline and adds no unfinished artifact tab', () => {
  for (const stage of ['summarising', 'rca-running'] as const) {
    const original = applyStageToTab(INC_4127, stage);
    const presentation = digitWorkPresentation(original, true);
    assert.equal(presentation.working, stage === 'summarising' ? 'summary' : 'root-cause');
    assert.notEqual(presentation.tab.summary.state, 'generating');
    assert.notEqual(presentation.tab.rootCause.state, 'analyzing');
    assert.equal(original.summary.state, stage === 'summarising' ? 'generating' : 'ready');
  }
});

test('manual generation retains its card loading state', () => {
  for (const stage of ['summarising', 'rca-running'] as const) {
    const original = applyStageToTab(INC_4127, stage);
    const presentation = digitWorkPresentation(original, false);
    assert.equal(presentation.working, undefined);
    assert.equal(presentation.tab, original);
  }
});

test('autoplay generation always uses inline working in the conversation', () => {
  for (const step of digitDemoJourney('resolved').filter((step) => step.generating)) {
    assert.equal(step.focus, 'conversation');
    assert.equal(step.live, 'working');
    const original = applyStageToTab(INC_4127, step.stage);
    assert.equal(digitWorkPresentation(original, true, step.generating).working, step.generating);
  }
});

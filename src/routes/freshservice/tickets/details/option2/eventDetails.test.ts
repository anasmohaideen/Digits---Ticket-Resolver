import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { EventNode } from '../types';
import { standardDetails } from './eventDetails.ts';

const RESOLVER = { kind: 'digit', digit: 'ticket-resolver', name: 'Ticket Resolver' } as const;
const event = (data: EventNode['data'], extra: Partial<EventNode> = {}): EventNode =>
  ({ kind: 'event', id: 'e', at: '2026-11-04T10:00:00Z', actor: RESOLVER, type: 'delegated', data, ...extra });

const text = (value: Array<string | { label: string }>) => value.map((part) => (typeof part === 'string' ? part : part.label)).join('');

test('one Why, last: the intent and the reasoning join into one paragraph', () => {
  const details = standardDetails(event(
    { fields: [{ field: 'Status', from: 'Open', to: 'In progress' }], details: [{ label: 'Why', value: ['I should classify it.'] }] },
    { type: 'properties-updated', why: 'Only one laptop is affected.' }
  ));
  assert.deepEqual(details.why.map(text), ['I should classify it.', 'Only one laptop is affected.']);
  assert.equal(details.facts.length, 0);
});

test('an empty old value reads None', () => {
  const details = standardDetails(event({ fields: [{ field: 'Group', from: '--', to: 'Service Desk' }] }, { type: 'properties-updated' }));
  assert.deepEqual(details.changes, [{ field: 'Group', from: 'None', to: 'Service Desk' }]);
});

test('hand-over labels map onto the vocabulary, in its order, and routing moves to the meta line', () => {
  const details = standardDetails(event({
    group: 'Network Team',
    details: [
      { label: 'Blocker', value: ['Intune denied'] },
      { label: 'Diagnosis', value: ['Certificate not renewed'] },
      { label: 'Tried', value: ['KB steps'] },
      { label: 'Routed by', value: ['Intelligent routing → Network Team'] }
    ]
  }));
  assert.deepEqual(details.facts.map((fact) => [fact.label, text(fact.value)]), [
    ['Found', 'Certificate not renewed'],
    ['Tried', 'KB steps'],
    ['Blocked by', 'Intune denied']
  ]);
  assert.equal(details.routing, 'via Intelligent routing');
});

test('a job that did not finish is what blocked the hand-over', () => {
  const details = standardDetails(event({ details: [{ label: 'Triage', value: ['Didn’t finish'] }, { label: 'Why', value: ['No category fits.'] }] }));
  assert.deepEqual(details.facts.map((fact) => [fact.label, text(fact.value)]), [['Blocked by', 'Triage didn’t finish']]);
  assert.deepEqual(details.why.map(text), ['No category fits.']);
});

test('auto-assignment keeps its explanation without repeating the method the headline names', () => {
  const details = standardDetails(event({ method: 'round-robin', details: [{ label: 'How', value: ['Round robin: next agent in the rotation for Network Team.'] }] }));
  assert.deepEqual(details.why.map(text), ['Next agent in the rotation for Network Team.']);
});

test('labels outside the vocabulary are kept, after it', () => {
  const details = standardDetails(event({ details: [{ label: 'Done', value: ['Licence assigned'] }, { label: 'Waiting on', value: ['Megan'] }, { label: 'Source', value: ['Slack'] }, { label: 'Tried first', value: ['KB article'] }] }));
  assert.deepEqual(details.facts.map((fact) => fact.label), ['Source', 'Tried', 'Done', 'Waiting on']);
});

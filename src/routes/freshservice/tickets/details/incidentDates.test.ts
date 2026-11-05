import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INCIDENT_DATES, incidentTimestamp, refreshIncidentDates } from './incidentDates.ts';

test('the whole incident happens today, in chronological order and in the past', () => {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const followUp = incidentTimestamp('2026-10-20T10:05:00-07:00');
  assert.equal(followUp.slice(0, 10), today);
  assert.equal(INCIDENT_DATES.reportedAt.slice(0, 10), today);
  assert.ok(Date.parse(INCIDENT_DATES.reportedAt) < Date.parse(followUp));
  const resolved = incidentTimestamp('2026-10-20T10:49:00-07:00');
  assert.equal(resolved.slice(0, 10), today);
  assert.ok(Date.parse(resolved) <= Date.now());
  assert.ok(Date.parse(resolved) > Date.parse(followUp));
  assert.ok(Date.parse(resolved) - Date.parse(INCIDENT_DATES.reportedAt) < 30 * 60_000);
});

test('nested times compress Digit work to under a minute without mutating source data', () => {
  const source = { at: '2026-10-19T09:12:00-07:00', children: [{ decidedAt: '2026-10-19T09:12:40-07:00' }], title: 'INC-4127' };
  const updated = refreshIncidentDates(source);
  const duration = Date.parse(updated.children[0].decidedAt) - Date.parse(updated.at);
  assert.ok(duration >= 0 && duration <= 10_000);
  const rootCauseDuration = Date.parse(incidentTimestamp('2026-10-19T09:21:00-07:00')) - Date.parse(incidentTimestamp('2026-10-19T09:19:00-07:00'));
  assert.ok(rootCauseDuration >= 0 && rootCauseDuration <= 30_000);
  assert.equal(updated.title, source.title);
  assert.equal(source.at, '2026-10-19T09:12:00-07:00');
  assert.notEqual(updated.at, source.at);
});

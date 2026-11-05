/** Keep the incident demo current on each page load, in the viewer's India timezone. */
const MINUTE = 60_000;
const now = Date.now();
const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date(now));
const midnight = Date.parse(`${today}T00:00:00+05:30`);
const sourceStart = Date.parse('2026-10-19T08:00:00Z');
const firstDayEnd = Date.parse('2026-10-19T09:46:00Z');
const followUpStart = Date.parse('2026-10-20T10:05:00Z');
const sourceEnd = Date.parse('2026-10-20T10:49:00Z');

/** Digit work runs four times faster; the overnight wait becomes five minutes. */
function compressedOffset(source: number): number {
  if (source <= firstDayEnd) return (source - sourceStart) / 4;
  const firstPhase = (firstDayEnd - sourceStart) / 4;
  if (source < followUpStart) return firstPhase + (source - firstDayEnd) / (followUpStart - firstDayEnd) * 5 * MINUTE;
  return firstPhase + 5 * MINUTE + (source - followUpStart) / 4;
}

const totalDuration = compressedOffset(sourceEnd);
const end = now - Math.min(2 * MINUTE, (now - midnight) / 10);
// Even just after midnight, keep the entire conversation today and in the past.
const scale = Math.min(1, (end - midnight) / totalDuration);
const start = end - totalDuration * scale;

/** One consistent mapping for conversation, work-log, approval and reply times. */
export function incidentTimestamp(iso: string): string {
  const source = Date.parse(`${iso.slice(0, 19)}Z`);
  const timestamp = start + Math.max(0, Math.min(totalDuration, compressedOffset(source))) * scale;
  return `${new Date(timestamp + 330 * MINUTE).toISOString().slice(0, 19)}+05:30`;
}

const changeDate = new Date(`${today}T00:00:00Z`);
const changeLabel = changeDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
const changeWeekday = changeDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });

/** Copy fixture data, including nested approvals, attachments and work-log times. */
export function refreshIncidentDates<T>(value: T): T {
  if (typeof value === 'string') {
    return (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(value)
      ? incidentTimestamp(value)
      : value.replace(/Fri, Oct 16/g, changeLabel).replace(/Friday/g, changeWeekday)
        .replace(/9:(31|35)( AM)?/g, (_match, minute: string, meridiem: string | undefined) => {
          const date = new Date(incidentTimestamp(`2026-10-19T09:${minute}:00-07:00`));
          const clock = date.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' });
          return meridiem ? clock : clock.replace(/ (AM|PM)$/, '');
        }).replace('Megan has a client demo at 11.', 'Megan has a client demo coming up.')) as T;
  }
  if (Array.isArray(value)) return value.map((item) => refreshIncidentDates(item)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, refreshIncidentDates(item)])) as T;
  }
  return value;
}

function dueLabel(iso: string): string {
  const date = new Date(iso);
  const options = { timeZone: 'Asia/Kolkata' };
  return `by ${date.toLocaleDateString('en-GB', { ...options, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}, ${date.toLocaleTimeString('en-US', { ...options, hour: 'numeric', minute: '2-digit' })}`;
}

export const INCIDENT_DATES = {
  reportedAt: incidentTimestamp('2026-10-19T09:12:00-07:00'),
  firstResponseDue: dueLabel(new Date(now + 30 * MINUTE).toISOString()),
  resolutionDue: dueLabel(new Date(now + 4 * 60 * MINUTE).toISOString())
};

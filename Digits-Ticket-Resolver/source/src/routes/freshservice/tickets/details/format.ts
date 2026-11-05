/**
 * Time formatting for the Details tab.
 *
 * The repo has no date helper — every page before this one printed a literal
 * string ("reported 5 months ago (Mon, 13 Apr 8:07 AM)"). The fixtures carry
 * ISO timestamps instead, so one place has to turn them into the viewer's
 * format. `Intl` is used directly rather than adding a date library.
 */

/**
 * Reads the timestamp in the offset it was written with, not the viewer's.
 *
 * "Viewer's format" in the copy conventions means the viewer's locale and clock
 * convention, not their timezone: the fixtures are a Pacific-time scenario
 * whose own copy says "Handed over to the Network Team at 9:35 AM". Converting
 * to the reader's zone would print 10:05 PM next to that sentence. So the
 * instant is shifted by its own offset and then formatted in UTC, which leaves
 * the wall-clock time as authored while locale, 12/24-hour clock and ordering
 * still follow the viewer.
 */
function atAuthoredOffset(iso: string): Date {
  const match = /([+-])(\d{2}):(\d{2})$/.exec(iso);
  const date = new Date(iso);
  if (!match) return date;
  const sign = match[1] === '-' ? -1 : 1;
  const minutes = sign * (Number(match[2]) * 60 + Number(match[3]));
  return new Date(date.getTime() + minutes * 60_000);
}

/** "9:35 AM" in the viewer's locale and clock convention. */
export function timeOfDay(iso: string): string {
  return atAuthoredOffset(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC'
  });
}

/** "09:12 AM" — a log line, always on a 12-hour clock. */
export function timeOfDayAmPm(iso: string): string {
  return atAuthoredOffset(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'
  });
}

/** "Mon, Oct 19", the day a log covers. */
export function dayLabel(iso: string): string {
  return atAuthoredOffset(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC'
  });
}

/** Date and time in the authored offset, for conversation-card metadata. */
export function dateAndTime(iso: string): string {
  const date = atAuthoredOffset(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC'
  });
  return `${date} ${timeOfDay(iso)}`;
}

/**
 * "9:12–9:35 AM" when the two times share a meridiem and day, otherwise both
 * in full. An en dash, as in the reference.
 */
export function timeRange(startIso: string, endIso: string): string {
  const start = timeOfDay(startIso);
  const end = timeOfDay(endIso);
  const startMeridiem = start.slice(-2);
  const endMeridiem = end.slice(-2);
  const sameDay =
    atAuthoredOffset(startIso).toISOString().slice(0, 10) ===
    atAuthoredOffset(endIso).toISOString().slice(0, 10);

  if (sameDay && startMeridiem === endMeridiem && /\s(AM|PM)$/i.test(start)) {
    return `${start.replace(/\s(AM|PM)$/i, '')}–${end}`;
  }
  return `${start}–${end}`;
}

/**
 * "2.1s" while a Digit is working, "4m" once a wait is long enough that
 * seconds stop meaning anything. Matches the reference's two forms.
 */
export function elapsed(seconds: number): string {
  if (seconds < 60) {
    // One decimal below ten seconds, where the change is visible; whole
    // seconds after that, where it is just noise.
    return seconds < 10 ? `${seconds.toFixed(1)}s` : `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

/** "0.84" — scores are shown to two places everywhere in the spec. */
export function score(value: number): string {
  return value.toFixed(2);
}

/**
 * "21st Nov 2024 02:09 AM" — the attachment table's own format, with an
 * ordinal day. Built from `Intl` parts rather than a date library, and read in
 * the timestamp's authored offset like every other time on this tab.
 */
export function attachedOn(iso: string): string {
  const date = atAuthoredOffset(iso);
  const day = date.getUTCDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th';
  const month = date.toLocaleString(undefined, { month: 'short', timeZone: 'UTC' });
  const time = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'
  });
  return `${day}${suffix} ${month} ${date.getUTCFullYear()} ${time}`;
}

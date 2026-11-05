/**
 * "1 day ago" for the artifact's last-updated line.
 *
 * Option 1's `SummaryCard` keeps the same three lines private, and that file is
 * not being touched for this exploration, so Option 2 carries its own copy.
 * `format.ts` is about wall-clock times, which these are not.
 */
export function relativeUpdated(at?: string): string {
  return at ? relativeAgo(at) : '';
}

/**
 * "just now" … "2 days ago" … "5 months ago" — the only time every message in
 * Option 2 shows. The full date moves to the tooltip (21 Oct review).
 */
export function relativeAgo(at: string, now = Date.now()): string {
  const minutes = Math.max(0, Math.floor((now - new Date(at).getTime()) / 60_000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  const months = Math.round(days / 30);
  return `${months} ${months === 1 ? 'month' : 'months'} ago`;
}

/**
 * "Monday, October 19, 2026 at 9:18 AM", read in the offset the timestamp was
 * authored with — the same convention as `format.ts`.
 */
export function fullDateTime(iso: string): string {
  const match = /([+-])(\d{2}):(\d{2})$/.exec(iso);
  const date = new Date(iso);
  const shifted = match
    ? new Date(date.getTime() + (match[1] === '-' ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3])) * 60_000)
    : date;
  return shifted.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC'
  });
}

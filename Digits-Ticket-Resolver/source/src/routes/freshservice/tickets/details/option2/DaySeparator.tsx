/** A quiet date line between conversation rows when the day changes. */
export const dayOf = (at?: string): string => (at ? new Date(at).toDateString() : '');

export default function DaySeparator({ at }: { at: string }) {
  const date = new Date(at);
  const label = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div className="tr-o2-day-separator" role="separator" aria-label={label}>
      <time dateTime={date.toISOString()}>{label}</time>
    </div>
  );
}

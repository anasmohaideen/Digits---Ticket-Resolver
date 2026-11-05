/**
 * Apply a Dew Table sort to the rows behind it.
 *
 * Dew's Table takes `sortingState` and `onSortChange`, draws the sort arrows and
 * sets aria-sort on the header -- and does NOT reorder anything. With the sort
 * controlled, applying it is the consumer's job. Every table in this starter
 * passed the state and none of them applied it, so five tables announced a sort
 * to screen readers that the eye could not see.
 *
 * It reads as working, which is why it survived: the arrow moves, aria-sort
 * flips, and unless you check the row order against a baseline from the SAME
 * column you will not notice.
 */
export type SortState = { id: string; desc: boolean }[];

export function sortRows<T>(rows: T[], sorting: SortState): T[] {
  if (!sorting.length) return rows;
  const { id, desc } = sorting[0];

  return [...rows].sort((a, b) => {
    // An interface without an index signature will not accept a[id] directly,
    // and constraining T to Record<string, unknown> would reject every row type
    // in this repo. The read is widened here instead.
    const left = (a as Record<string, unknown>)[id];
    const right = (b as Record<string, unknown>)[id];
    if (left === right) return 0;

    // Numbers compare as numbers; everything else as a locale-aware string, so
    // "Freddy" sorts against "eSignature" the way a reader expects.
    const result =
      typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left ?? '').localeCompare(String(right ?? ''), undefined, { numeric: true, sensitivity: 'base' });

    return desc ? -result : result;
  });
}

import { useCallback, useEffect, useState } from 'react';

/**
 * Remembers whether an AI card is collapsed, per viewer, per ticket.
 *
 * `spec/03` rule 6 asks for this to follow the repo's existing
 * preference/storage pattern. There isn't one — nothing in `src/` persists
 * anything — so `localStorage` is used directly under one namespaced key, with
 * both the read and the write guarded: a private window or blocked site data
 * throws on access, and a card that cannot remember its state is not a reason
 * to fail the page.
 */
export default function useCardCollapse(
  key: string,
  defaultCollapsed = false
): [boolean, (collapsed: boolean) => void] {
  const storageKey = `fs.tr.cardCollapse.${key}`;

  const [collapsed, setCollapsedState] = useState<boolean>(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      return stored === null ? defaultCollapsed : stored === '1';
    } catch {
      return defaultCollapsed;
    }
  });

  // A different ticket or card reuses this hook, so the stored value is read
  // again when the key changes rather than only on first mount.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      setCollapsedState(stored === null ? defaultCollapsed : stored === '1');
    } catch {
      setCollapsedState(defaultCollapsed);
    }
    // `defaultCollapsed` is a constant per call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const setCollapsed = useCallback(
    (next: boolean) => {
      setCollapsedState(next);
      try {
        window.localStorage.setItem(storageKey, next ? '1' : '0');
      } catch {
        /* Storage is unavailable; the card still works for this session. */
      }
    },
    [storageKey]
  );

  return [collapsed, setCollapsed];
}

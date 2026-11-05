import { useEffect, useSyncExternalStore } from 'react';

/**
 * Light / dark / system, applied the way the Dew starter pack does it: one theme
 * class on the root (`dew-light-theme`, `dew-dark-theme`, `dew-system-theme`),
 * which switches every semantic token. `data-surface` follows the resolved
 * mode so the AI Design System's `--ai-*` tokens switch with it.
 */
export type ThemeMode = 'light' | 'dark' | 'system';

const KEY = 'tr-theme-mode';
const listeners = new Set<() => void>();
let mode: ThemeMode = 'light';

try {
  const saved = localStorage.getItem(KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'system') mode = saved;
} catch {
  /* storage can be unavailable; the default is light */
}

const resolved = (value: ThemeMode): 'light' | 'dark' =>
  value === 'system' ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : value;

function apply(value: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove('dew-light-theme', 'dew-dark-theme', 'dew-system-theme');
  root.classList.add(`dew-${value}-theme`);
  root.setAttribute('data-surface', resolved(value));
}

export function setThemeMode(next: ThemeMode) {
  mode = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* ignore */
  }
  apply(next);
  listeners.forEach((listener) => listener());
}

export function useThemeMode(): ThemeMode {
  const current = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => mode
  );
  useEffect(() => {
    apply(current);
    if (current !== 'system') return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => apply('system');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [current]);
  return current;
}

/**
 * Shared style objects for the Details tab.
 *
 * Dew ships no type-style tokens, so every page in this repo writes explicit
 * `fontSize`/`lineHeight` with a `--font-weight-*` token (see `TicketDetail`'s
 * `LABEL`/`VALUE` and `Overview`'s `Section`). Fourteen components would
 * otherwise repeat the same six combinations, so they are declared once here.
 * No new sizes, weights, colours or radii are introduced — every value already
 * appears elsewhere in `src/`.
 */

import type { CSSProperties } from 'react';

/** Body copy inside cards and messages. */
export const BODY: CSSProperties = {
  fontSize: '14px',
  lineHeight: '20px',
  color: 'var(--color-text-primary)'
};

/** Stream rows and anything inside an expanded group, where density matters. */
export const BODY_COMPACT: CSSProperties = {
  fontSize: '13px',
  lineHeight: '18px',
  color: 'var(--color-text-primary)'
};

/** Timestamps, "replied in Slack", counts — everything secondary. */
export const META: CSSProperties = {
  fontSize: '12px',
  lineHeight: '20px',
  color: 'var(--color-text-secondary)'
};

/** A name or object inside an otherwise secondary line. */
export const META_STRONG: CSSProperties = {
  ...META,
  fontWeight: 'var(--font-weight-semi-bold)',
  color: 'var(--color-text-primary)'
};

/** "Issue", "What was tried", "Evidence" — the short bold section labels. */
export const SECTION_LABEL: CSSProperties = {
  fontSize: '13px',
  lineHeight: '18px',
  fontWeight: 'var(--font-weight-semi-bold)',
  color: 'var(--color-text-primary)'
};

/** A card's own title, and a person's name on a message card. */
export const CARD_TITLE: CSSProperties = {
  fontSize: '14px',
  lineHeight: '20px',
  fontWeight: 'var(--font-weight-semi-bold)',
  color: 'var(--color-text-primary)'
};

/** The "Conversations" heading, matching `Overview`'s section heading. */
export const HEADING: CSSProperties = {
  margin: 0,
  fontSize: '16px',
  lineHeight: '24px',
  fontWeight: 'var(--font-weight-semi-bold)',
  color: 'var(--color-text-primary)'
};

/**
 * Dew's `Card` is `flex-col items-start`, so children shrink to their content
 * unless they are told to stretch.
 */
export const CARD_ROW: CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-100)'
};

export const CARD_BLOCK: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-050)'
};

/** One line, truncated — collapsed card rows and the sticky strip. */
export const TRUNCATE: CSSProperties = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

/** The indented container an expanded disclosure's content sits in. */
export const DISCLOSURE_PANEL: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-050)',
  padding: 'var(--spacing-100) var(--spacing-150)',
  backgroundColor: 'var(--color-fill-container)',
  borderRadius: 'var(--border-radius-small)'
};

/** Pushes what follows to the far end of a row. */
export const SPACER: CSSProperties = { flex: 1, minWidth: 0 };

/**
 * Tags truncate their own label when squeezed, so a badge in a row that can
 * compress has to opt out of shrinking or it collapses to an ellipsis — which
 * is how "in Slack" became a sliver in the reply bar at narrow widths.
 */
export const NO_SHRINK: CSSProperties = { flexShrink: 0 };

export const DIVIDER: CSSProperties = {
  width: '100%',
  height: '1px',
  backgroundColor: 'var(--color-boundary-divider-mildest)'
};

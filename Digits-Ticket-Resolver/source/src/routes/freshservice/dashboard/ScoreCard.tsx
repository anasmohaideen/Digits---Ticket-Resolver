import { Link } from 'react-router-dom';
import { Icon } from '@freshworks/dew-components';
import type { ScoreCard as ScoreCardData } from './dashboard.data';

/**
 * A counter tile.
 *
 * Measured on the live dashboard at 281 x 118 with a 12px radius and the same
 * --shadow-xs every widget carries. Two skins, and the difference is the
 * widget's configured threshold rather than the size of the number:
 *
 *   default   white on #eaeef2, count in #003fd2  (--color-text-brand)
 *   breached  #ffe9ee on #ffc2cb, count in #cd2629, plus a warning icon
 *
 * Live proves the distinction is not "count > 0": "Open tickets" reads 5 and
 * stays white, while Overdue reads 5 and turns red. Only a card that has a
 * threshold AND has breached it gets the tint.
 *
 * The whole card is a LINK. Live wraps it in an anchor to
 * /a/tickets/view/<view>, inset 1px inside the border, so the entire 281x118
 * surface is the hit target rather than the number alone.
 */
export default function ScoreCard({ label, count, threshold }: ScoreCardData) {
  const breached = Boolean(threshold) && count > 0;
  return (
    <Link
      to="/freshservice/tickets"
      className="fs-dash-tile"
      style={{
        height: '118px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textDecoration: 'none',
        // Measured off a live card: label inset 25/16, count 19 up from the
        // bottom, warning icon 19 in from the right.
        padding: '16px 19px 19px 24px',
        borderRadius: '12px',
        background: breached ? 'var(--color-fill-semantic-error-mildest)' : 'var(--color-fill-surface)',
        border: `1px solid ${
          breached ? 'var(--color-boundary-semantic-error-mild)' : 'var(--color-boundary-border-mildest)'
        }`,
        /* Hover lifts the card and grows it 1%; see .fs-dash-tile:hover. */
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-100)' }}>
        <h2
          style={{
            margin: 0,
            fontSize: '14px',
            lineHeight: '20px',
            fontWeight: 'var(--font-weight-semi-bold)',
            color: 'var(--color-text-primary)',
          }}
        >
          {label}
        </h2>
        {/* Live draws a SOLID triangle here, filled --color-icon-semantic-error
            with the glyph knocked out in --color-icon-inverse. The
            dew-components we install ship no such asset: "Warning" is an outline
            triangle and "Actions/Warning" a filled circle. Taking the outline
            keeps the silhouette a warning triangle, which is the half that
            carries the meaning, rather than hand-vendoring the product's SVG. */}
        {breached && (
          <Icon name="Warning" size="md" color="var(--color-icon-semantic-error)" ariaLabel="Above threshold" />
        )}
      </div>
      {/* 32px/700 on a 20px line box, which is what pins the number this close
          to the bottom edge of a 118px card. */}
      <span
        style={{
          fontSize: '32px',
          lineHeight: '20px',
          fontWeight: 'var(--font-weight-semi-bold)',
          color: breached ? 'var(--color-text-semantic-error)' : 'var(--color-text-brand)',
        }}
      >
        {count}
      </span>
    </Link>
  );
}

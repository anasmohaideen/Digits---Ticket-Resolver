import { NavLink } from 'react-router-dom';
import { Icon } from '@freshworks/dew-components';
import freddyAvatar from './assets/freddy-avatar.svg';

/**
 * The pair at the top of Reports and Insights.
 *
 * Measured on live, and both halves are BORDERED pills with a 16px leading
 * icon — not the borderless text pills this started as:
 *
 *   unselected  white on 1px --color-boundary-border-mildest,
 *               14px/600 --color-text-secondary
 *   selected    --color-fill-semantic-info-mildest on 1px
 *               --color-boundary-semantic-info, 14px/600 --color-text-brand
 *
 * Both 34 tall on 6px/12px padding and an 8px radius. Note the weight is 600
 * on BOTH; only the colours change.
 *
 * These are ROUTES, not local state: live moves between /analytics and
 * /analytics/freddy-insights, so a pair that only flipped a boolean would leave
 * the URL lying about which half you were on.
 */
const TABS = [
  { label: 'AI Insights', to: '/freshservice/reports-insights', sparkle: true },
  { label: 'Analytics', to: '/freshservice/reports-insights/analytics', sparkle: false },
];

export default function InsightsTabs() {
  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-100)', padding: '12px 16px', flexShrink: 0 }}>
      {TABS.map((tab) => (
        <NavLink
          key={tab.label}
          to={tab.to}
          end
          style={({ isActive }) => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--spacing-100)',
            height: '34px',
            boxSizing: 'border-box',
            padding: '6px 12px',
            borderRadius: '8px',
            border: `1px solid ${
              isActive ? 'var(--color-boundary-semantic-info)' : 'var(--color-boundary-border-mildest)'
            }`,
            background: isActive ? 'var(--color-fill-semantic-info-mildest)' : 'var(--color-fill-surface)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 'var(--font-weight-semi-bold)',
            color: isActive ? 'var(--color-text-brand)' : 'var(--color-text-secondary)',
          })}
        >
          {/* AI Insights' glyph is a radial gradient (#9B43E0 to #2950FF), so it
              is the same vendored asset as the big sparkle rather than a Dew
              icon. Analytics' is a plain chart filled with the brand token, so
              that one IS a Dew icon. */}
          {tab.sparkle ? (
            <img src={freddyAvatar} alt="" width={16} height={16} />
          ) : (
            /* Dew's own Analytics glyph: circles joined by line segments, which
               is what live draws. Chart/LineStraightSingle was a plain line
               with no nodes -- the right SIZE and the wrong shape.

               The cost is that LeftNavBar icons are locked to md (20px) and
               ignore `size`, so this renders 20 against live's 16. Four pixels
               on the correct glyph beats an exact size on the wrong one, and
               Dew ships no 16px version of it. */
            <Icon name="LeftNavBar/Analytics2" size="sm" color="var(--color-icon-selected)" />
          )}
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}

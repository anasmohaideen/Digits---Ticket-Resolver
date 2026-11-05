import type { ReactNode } from 'react';
import { HyperlinkButton, IconButton, Menu, type IMenuOption } from '@freshworks/dew-components';
import { WIDGET_MENU_OPTIONS } from './dashboard.data';

/**
 * The chrome every dashboard widget shares, measured off a live widget:
 *
 *   578 x 386, border-radius 12px, 1px solid #eaeef2, shadow 1px 1px 2px
 *   rgba(18,51,76,.05); title 14px/600 #485a68 inset 15px from the top and
 *   24px from the left, with a kebab pinned to the top right.
 *
 * Each of those hex values is a Dew token rather than a one-off: #eaeef2 is
 * --color-boundary-border-mildest, #485a68 is --color-text-secondary, and the
 * shadow is exactly --shadow-xs.
 *
 * Hovering swaps that shadow for a 0 4px 16px lift on --color-shadow-10. A
 * chart card does NOT scale the way a scorecard does — the scorecard is a link
 * and grows 1%, the chart card only lifts.
 */
export const WIDGET_HEIGHT = 386;

export default function WidgetCard({
  title,
  subtitle,
  action,
  span = 2,
  height = WIDGET_HEIGHT,
  children,
}: {
  title: string;
  /** A second line under the title, which only the gamification pair carries. */
  subtitle?: string;
  /**
   * A text action in the top-right corner. The widgets that have one -- the
   * Achievements "Show All", the Leaderboard "More Info" -- show it INSTEAD of
   * the kebab, not beside it, so passing this swaps the corner rather than
   * adding to it.
   */
  action?: string;
  /** Columns to occupy in the dashboard's six-column grid. */
  span?: number;
  height?: number;
  children: ReactNode;
}) {
  return (
    <section
      className="fs-dash-widget"
      style={{
        gridColumn: `span ${span}`,
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--color-boundary-border-mildest)',
        borderRadius: '12px',
        /* Hover lifts the card; see .fs-dash-widget:hover. */
        boxShadow: 'var(--shadow-xs)',
        background: 'var(--color-fill-surface)',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '15px 12px 0 24px',
          gap: 'var(--spacing-100)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <h2
            style={{
              margin: 0,
              fontSize: '14px',
              lineHeight: '21px',
              fontWeight: 'var(--font-weight-semi-bold)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {title}
          </h2>
          {/* 12px and secondary: the period the widget is scoped to, not a
              description of it. */}
          {subtitle && (
            <span style={{ fontSize: '12px', lineHeight: '18px', color: 'var(--color-text-secondary)' }}>
              {subtitle}
            </span>
          )}
        </div>
        {action ? (
          <HyperlinkButton href="#" size="mini">
            {action}
          </HyperlinkButton>
        ) : (
          /* Live's kebab opens a single-entry menu, 112px wide, that swaps the
             chart for a table of the same series. Both pie widgets and the bar
             widget offer the identical one entry. */
          <Menu
            aria-label={`${title} options`}
            options={WIDGET_MENU_OPTIONS.map((label) => ({ value: label, label }))}
            onClick={(_option: IMenuOption) => undefined}
            slots={{
              trigger: <IconButton iconName="MoreVertical" aria-label={`${title} options`} size="mini" />,
            }}
          />
        )}
      </header>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>{children}</div>
    </section>
  );
}

import { useState } from 'react';
import { Icon, TextButton } from '@freshworks/dew-components';
import ActivitySheet from './ActivitySheet';
import AnnouncementsSheet from './AnnouncementsSheet';
import BarChart from './BarChart';
import DonutChart from './DonutChart';
import ScoreCard from './ScoreCard';
import WidgetCard from './WidgetCard';
import { RetiredWidget, WidgetEmptyState } from './WidgetEmptyState';
import {
  ACHIEVEMENTS_WIDGET,
  BAR_WIDGET_TITLE,
  DASHBOARD_VISIBILITY,
  LEADERBOARD_WIDGET,
  OFFBOARDING_INITIATED_WIDGET,
  OFFBOARDING_TILE,
  OPEN_BY_PRIORITY,
  RETIRED_ONBOARDING_INITIATED_WIDGET,
  RETIRED_ONBOARDING_WIDGET,
  SCORECARDS,
  UNRESOLVED_BY_PRIORITY,
  UNRESOLVED_BY_STATUS,
} from './dashboard.data';

/**
 * Freshservice's landing screen, rebuilt from /a/dashboard.
 *
 * The live page is a gridstack on a six-column layout: each widget item is
 * 281px wide with an 8px margin all round, so the columns are 281 and the
 * gutters 16. Scorecards take one column, charts take two — 2 x 281 + 16 = 578,
 * which is exactly what the chart widgets measure. Expressed here as a plain
 * CSS grid, since nothing in a prototype needs the drag-and-resize machinery.
 *
 * The page is TWO grids, not one, and the reason is that live is a gridstack
 * and this is not. Gridstack free-packs: a short widget lets the one below it
 * ride up into the space, so the lower half of the live page is three columns
 * of stacked widgets of differing heights rather than tidy rows. A CSS grid row
 * is as tall as its tallest item, which would have dropped the small tiles
 * 110px below where live puts them. Expressing the lower half as three stacks
 * reproduces the packing exactly, without any of the drag-and-resize machinery.
 */
export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <DashboardToolbar />

      {/* 40px, measured from the toolbar's baseline to the top of the first tile. */}
      <div
        style={{
          marginTop: '40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
          gap: '16px',
        }}
      >
        {SCORECARDS.map((card) => (
          <ScoreCard key={card.id} {...card} />
        ))}

        <WidgetCard title="Unresolved Tickets by Priority">
          <DonutChart slices={UNRESOLVED_BY_PRIORITY} />
        </WidgetCard>
        <WidgetCard title="Unresolved Tickets by Status">
          <DonutChart slices={UNRESOLVED_BY_STATUS} />
        </WidgetCard>
        <WidgetCard title={BAR_WIDGET_TITLE}>
          <BarChart slices={OPEN_BY_PRIORITY} />
        </WidgetCard>
      </div>

      <LowerHalf />
    </div>
  );
}

/**
 * Everything below the charts: the gamification pair, two onboarding reports
 * with no data behind them, and the two widgets whose feature has been retired.
 *
 * Three columns of 578, each a stack — see the note on the page above for why
 * this is not simply more rows of the grid up there.
 */
function LowerHalf() {
  return (
    <div
      style={{
        marginTop: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        alignItems: 'start',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <WidgetCard
          title={ACHIEVEMENTS_WIDGET.title}
          subtitle={ACHIEVEMENTS_WIDGET.subtitle}
          action={ACHIEVEMENTS_WIDGET.action}
          span={1}
          height={ACHIEVEMENTS_WIDGET.height}
        >
          <WidgetEmptyState message={ACHIEVEMENTS_WIDGET.message} />
        </WidgetCard>

        {/* The only two one-column items down here, and they sit side by side
            under Achievements rather than starting a row of their own. */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
          <WidgetCard
            title={RETIRED_ONBOARDING_WIDGET.title}
            span={1}
            height={RETIRED_ONBOARDING_WIDGET.height}
          >
            <RetiredWidget title={RETIRED_ONBOARDING_WIDGET.title} />
          </WidgetCard>
          <ScoreCard {...OFFBOARDING_TILE} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <WidgetCard
          title={LEADERBOARD_WIDGET.title}
          subtitle={LEADERBOARD_WIDGET.subtitle}
          action={LEADERBOARD_WIDGET.action}
          span={1}
          height={LEADERBOARD_WIDGET.height}
        >
          <WidgetEmptyState message={LEADERBOARD_WIDGET.message} icon="award" />
        </WidgetCard>
        <WidgetCard
          title={RETIRED_ONBOARDING_INITIATED_WIDGET.title}
          span={1}
          height={RETIRED_ONBOARDING_INITIATED_WIDGET.height}
        >
          <RetiredWidget title={RETIRED_ONBOARDING_INITIATED_WIDGET.title} />
        </WidgetCard>
      </div>

      <WidgetCard
        title={OFFBOARDING_INITIATED_WIDGET.title}
        span={1}
        height={OFFBOARDING_INITIATED_WIDGET.height}
      >
        <WidgetEmptyState message={OFFBOARDING_INITIATED_WIDGET.message} />
      </WidgetCard>
    </div>
  );
}

/**
 * The band above the widgets: who can see this dashboard on the left, and two
 * panel triggers on the right. Measured at 32px tall with 8px between the two
 * buttons; the visibility line is 12px, smaller than anything in the grid.
 *
 * Both buttons open right-docked sheets rather than navigating.
 */
function DashboardToolbar() {
  const [activityOpen, setActivityOpen] = useState(false);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-200)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', fontSize: '12px' }}>
        <Icon name="EyeVisible" size="sm" color="var(--color-icon-secondary)" />
        <span style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>Visible To:</span>
        <span style={{ fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
          {DASHBOARD_VISIBILITY}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <TextButton variant="secondary" size="default" prefixIcon="Recent" onClick={() => setActivityOpen(true)}>
          Recent Activity
        </TextButton>
        <TextButton variant="secondary" size="default" prefixIcon="Announcement" onClick={() => setAnnouncementsOpen(true)}>
          Announcements
        </TextButton>
      </div>
      <ActivitySheet open={activityOpen} onOpenChange={setActivityOpen} />
      <AnnouncementsSheet open={announcementsOpen} onOpenChange={setAnnouncementsOpen} />
    </div>
  );
}

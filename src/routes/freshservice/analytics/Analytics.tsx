import { useState } from 'react';
import { Icon, InlineMessage, Search, SplitButton, TextButton, type IMenuOption } from '@freshworks/dew-components';
import AnalyticsSidebar from './AnalyticsSidebar';
import InsightsTabs from './InsightsTabs';
import ReportsTable from './ReportsTable';
import {
  ANALYTICS_TITLE,
  CONTENT_TABS,
  FOLDER_BANNER,
  FOLDER_BANNER_LINK,
  HELP_CENTER,
  NEW_REPORT,
  NEW_REPORT_OPTIONS,
  REPORTS_HEADING,
  SORT_LABEL,
  SORT_VALUE,
} from './analytics.data';

/**
 * Reports and Insights > Analytics.
 *
 * Three bands stacked above a sidebar-and-table body: a segmented pair naming
 * the two halves of Reports and Insights, then the page's own header carrying
 * Help Center and New Report, then the content.
 *
 * The whole thing lives in a cross-origin iframe on live, which is why a scrape
 * of the Freshservice page returns 143 characters and reads as a failed load.
 * Measurements came from attaching to that iframe as its own CDP target, and
 * are iframe-relative — which maps cleanly onto our content area, since the
 * iframe starts where our rail ends.
 */
export default function Analytics() {
  const [contentTab, setContentTab] = useState(CONTENT_TABS[0]);
  const [nav, setNav] = useState('all-reports');
  const [bannerOpen, setBannerOpen] = useState(true);
  const [query, setQuery] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
      <InsightsTabs />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-200)',
          padding: '0 16px 12px',
          borderBlockEnd: '1px solid var(--color-boundary-border-mildest)',
          flexShrink: 0,
        }}
      >
        <h1 style={{ margin: 0, fontSize: '18px', lineHeight: '26px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
          {ANALYTICS_TITLE}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-150)' }}>
          {/* Borderless and 98 wide at rest, which is why it reads as an icon
              with a label rather than a field. */}
          <div className="fs-reports-search" style={{ width: '98px' }}>
            <Search placeholder="Search" value={query} onValueChange={(next: string) => setQuery(next ?? '')} />
          </div>
          <TextButton variant="secondary" size="default" prefixIcon="Help">
            {HELP_CENTER}
          </TextButton>
          {/* A true split button: 100x32 main plus a 32x32 chevron half, both
              on the brand fill, measured at x=1683 and x=1783. */}
          <SplitButton
            variant="primary"
            size="default"
            options={NEW_REPORT_OPTIONS.map((label) => ({ value: label, label }))}
            onOptionSelect={(_option: IMenuOption) => undefined}
          >
            {NEW_REPORT}
          </SplitButton>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0, minWidth: 0 }}>
        <AnalyticsSidebar selected={nav} onSelect={setNav} />

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '16px 20px 20px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', lineHeight: '24px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
            {REPORTS_HEADING}
          </h2>

          {bannerOpen && (
            <div style={{ paddingBlock: 'var(--spacing-200)' }}>
              <InlineMessage variant="info" onDismiss={() => setBannerOpen(false)}>
                {FOLDER_BANNER}{' '}
                <a href="#" style={{ color: 'var(--color-text-brand)' }}>
                  {FOLDER_BANNER_LINK}
                </a>
              </InlineMessage>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-200)', paddingBlockEnd: 'var(--spacing-200)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-050)' }}>
              {CONTENT_TABS.map((label) => (
                <Pill key={label} label={label} active={contentTab === label} onClick={() => setContentTab(label)} />
              ))}
            </div>
            {/* A control, not a caption: the label is muted and the value is not. */}
            <button
              type="button"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px' }}
            >
              <span style={{ color: 'var(--color-text-secondary)' }}>{SORT_LABEL}</span>
              <span style={{ color: 'var(--color-text-primary)' }}>{SORT_VALUE}</span>
              <Icon name="ChevronDown" size="sm" color="var(--color-icon-secondary)" />
            </button>
          </div>

          {contentTab === CONTENT_TABS[0] ? (
            <ReportsTable query={query} />
          ) : (
            <p style={{ margin: 0, paddingBlock: 'var(--spacing-400)', textAlign: 'center', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Folders are not built yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Both tab rows use the same pill: brand on info-mildest when selected. */
function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={active ? undefined : 'fs-kb-row'}
      style={{
        height: '34px',
        paddingInline: '16px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: active ? 'var(--font-weight-semi-bold)' : 500,
        background: active ? 'var(--color-fill-semantic-info-mildest)' : undefined,
        color: active ? 'var(--color-text-brand)' : 'var(--color-text-secondary)',
      }}
    >
      {label}
    </button>
  );
}

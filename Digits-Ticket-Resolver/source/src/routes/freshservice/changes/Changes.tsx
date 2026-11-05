import { useState } from 'react';
import { IconButton, TextButton } from '@freshworks/dew-components';
import FilterPanel from '../FilterPanel';
import EmptyState from '../EmptyState';
import emptyChangesArt from './assets/empty-changes.svg';
import { CHANGES_CALENDAR, CHANGES_EMPTY, CHANGES_EMPTY_LINK, CHANGE_FILTERS } from './changes.data';

/**
 * Changes, rebuilt from /a/changes/view/my_open.
 *
 * The tenant has no changes, so the page is its empty state and the chrome
 * around it. Two things make that chrome worth building: a Change Calendar
 * alongside the table, which no other module offers, and a filter panel with
 * its own Basic and Advanced modes.
 *
 * The filter panel ships OPEN, because the view arrives already filtered:
 * unassigned or mine, opened in the last six months, still open. Hiding the
 * reason the list is empty would be the wrong default.
 */
export default function Changes() {
  const [filtersOpen, setFiltersOpen] = useState(true);

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0, minHeight: 0 }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '16px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--spacing-150)' }}>
          <TextButton variant="secondary" size="default" prefixIcon="CalenderTime">
            {CHANGES_CALENDAR}
          </TextButton>
          <IconButton
            iconName="Filter"
            aria-label={filtersOpen ? 'Hide filters' : 'Show filters'}
            aria-pressed={filtersOpen}
            active={filtersOpen}
            withBackground
            size="default"
            onClick={() => setFiltersOpen((open) => !open)}
          />
        </div>

        <EmptyState art={emptyChangesArt} message={CHANGES_EMPTY}>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            View{' '}
            <a href="#" style={{ color: 'var(--color-text-brand)', textDecoration: 'none' }}>
              {CHANGES_EMPTY_LINK}
            </a>
          </p>
        </EmptyState>
      </div>

      {filtersOpen && <FilterPanel fields={CHANGE_FILTERS} label="Filter changes" withModes />}
    </div>
  );
}

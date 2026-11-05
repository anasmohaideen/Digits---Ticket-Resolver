import type * as React from 'react';
import { Icon } from '@freshworks/dew-components';
import type { EventNode } from './types';
import { EVENT_CUSTOM_ICON, EVENT_ICON } from './details.tokens';

/**
 * Every glyph in the timeline sits in the same 24px box (Dew spacing-300) with
 * a 20px glyph (spacing-250) centred in it, so rows line up whatever the icon.
 */
export const TIMELINE_ICON_BOX = 'var(--spacing-300)';
export const TIMELINE_ICON_GLYPH = 'var(--spacing-250)';

export function TimelineIconBox({ children }: { children: React.ReactNode }) {
  return (
    <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: TIMELINE_ICON_BOX, height: TIMELINE_ICON_BOX, flexShrink: 0 }}>
      {children}
    </span>
  );
}

export default function EventLeadingIcon({ event }: { event: EventNode }) {
  const customIcon = EVENT_CUSTOM_ICON[event.type];
  if (customIcon) {
    return (
      <TimelineIconBox>
        <span style={{ display: 'block', width: TIMELINE_ICON_GLYPH, height: TIMELINE_ICON_GLYPH, backgroundColor: 'var(--color-icon-disabled)', WebkitMask: `url("${customIcon}") center / contain no-repeat`, mask: `url("${customIcon}") center / contain no-repeat` }} />
      </TimelineIconBox>
    );
  }

  const rejected = event.type === 'approval-decided' && event.data.decision === 'rejected';
  return (
    <TimelineIconBox>
      <Icon
        name={rejected ? 'CircleCross' : EVENT_ICON[event.type]}
        size="md"
        color="var(--color-icon-disabled)"
        title=""
        style={{ width: TIMELINE_ICON_GLYPH, height: TIMELINE_ICON_GLYPH, flexShrink: 0 }}
      />
    </TimelineIconBox>
  );
}

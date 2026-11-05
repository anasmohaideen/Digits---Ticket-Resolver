import { Icon } from '@freshworks/dew-components';
import type { EventNode } from './types';
import { EVENT_CUSTOM_ICON, EVENT_ICON } from './details.tokens';

const EVENT_LEADING_ICON_SIZE = 20;

export default function EventLeadingIcon({ event }: { event: EventNode }) {
  const customIcon = EVENT_CUSTOM_ICON[event.type];
  if (customIcon) return <span aria-hidden="true" style={{ display: 'block', width: EVENT_LEADING_ICON_SIZE, height: EVENT_LEADING_ICON_SIZE, flexShrink: 0, backgroundColor: 'var(--color-icon-disabled)', WebkitMask: `url("${customIcon}") center / contain no-repeat`, mask: `url("${customIcon}") center / contain no-repeat` }} />;

  const rejected = event.type === 'approval-decided' && event.data.decision === 'rejected';
  return <Icon
    name={rejected ? 'CircleCross' : EVENT_ICON[event.type]}
    size="md"
    color="var(--color-icon-disabled)"
    title=""
    style={{ width: EVENT_LEADING_ICON_SIZE, height: EVENT_LEADING_ICON_SIZE, flexShrink: 0 }}
  />;
}

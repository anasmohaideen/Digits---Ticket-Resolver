import { Icon } from '@freshworks/dew-components';
import emptyCuesArt from './assets/empty-cues.svg';
import {
  TOPICS_BLURB,
  TOPICS_BLURB_LINK,
  TOPICS_EMPTY_BODY,
  TOPICS_EMPTY_HEADING,
  TOPICS_EMPTY_LINK,
  TOPICS_HEADING,
} from './kb.data';

/**
 * Solutions > Recommended topics, read off /a/knowledge-insights.
 *
 * Not the Knowledge Base shape. There is no sidebar, so the content runs the
 * full width from x=102, and the whole page is an empty state until the
 * tenant's service-desk data has been analysed.
 *
 * Both the heading and its blurb are --color-text-primary here — the blurb is
 * NOT dropped to secondary the way All Articles' one-liner is. Measured at
 * 18px/500 over 14px/400.
 *
 * Its own empty state is centred on a 220px illustration with an 18px/500 line
 * over a 16px/400 one, which is a step larger than the 16px single line the
 * quiet Knowledge Base views use.
 */
export default function RecommendedTopics() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0, padding: '24px 32px' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: 0, fontSize: '18px', lineHeight: '20px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
        {TOPICS_HEADING} (0)
        {/* The heading is a switcher on live, same as All Articles'. */}
        <Icon name="ChevronDown" size="md" color="var(--color-icon-secondary)" />
      </h1>
      <p style={{ margin: '6px 0 0', fontSize: '14px', lineHeight: '20px', color: 'var(--color-text-primary)' }}>
        {TOPICS_BLURB}{' '}
        <a href="#" style={{ color: 'var(--color-text-brand)', textDecoration: 'none' }}>
          {TOPICS_BLURB_LINK}
        </a>
      </p>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-150)' }}>
        <img src={emptyCuesArt} alt="" width={220} height={221} />
        <p style={{ margin: 0, fontSize: '18px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{TOPICS_EMPTY_HEADING}</p>
        <p style={{ margin: 0, fontSize: '16px', color: 'var(--color-text-primary)' }}>
          {TOPICS_EMPTY_BODY}{' '}
          <a href="#" style={{ color: 'var(--color-text-brand)', textDecoration: 'none' }}>
            {TOPICS_EMPTY_LINK}
          </a>
        </p>
      </div>
    </div>
  );
}

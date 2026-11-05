import EmptyState from '../EmptyState';
import noArticlesArt from './assets/no-articles-to-preview.svg';
import { TRASH_BLURB, TRASH_EMPTY, TRASH_TABS, TRASH_TITLE } from './kb.data';

/**
 * Trash, read off /a/solutions/trash.
 *
 * Unlike the other quiet views it is not empty chrome around an illustration:
 * it keeps a caption warning about the six-month purge, and three counters for
 * what is in there, before the empty state.
 */
export default function TrashView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0, padding: '16px 24px 24px' }}>
      <div style={{ paddingInlineStart: '16px' }}>
        <h1 style={{ margin: 0, fontSize: '18px', lineHeight: '26px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
          {TRASH_TITLE}
        </h1>
        <p style={{ margin: '2px 0 0', fontSize: '12px', lineHeight: '15px', color: 'var(--color-text-secondary)' }}>
          {TRASH_BLURB}
        </p>
      </div>

      {/* Counters, not tabs — live shows all three at once with their counts
          rather than switching between them. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-400)', padding: '20px 0 0 16px' }}>
        {TRASH_TABS.map((tab) => (
          <span key={tab} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: 'var(--color-text-primary)' }}>
            {tab}
            <span style={{ fontWeight: 'var(--font-weight-semi-bold)' }}>0</span>
          </span>
        ))}
      </div>

      <EmptyState art={noArticlesArt} message={TRASH_EMPTY} />
    </div>
  );
}

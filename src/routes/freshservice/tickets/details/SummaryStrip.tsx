import { Tag, TextButton } from '@freshworks/dew-components';
import type { RootCauseCard, SummaryCard } from './types';
import { BAND_LABEL, FIX_STATUS_BADGE, TAG_VARIANT_BY_BAND } from './details.tokens';
import { BODY_COMPACT, NO_SHRINK, TRUNCATE } from './details.styles';
import { SparkleIcon } from './AiCardChrome';

/**
 * B10 · Sticky summary strip (version S1 from the reference).
 *
 * Appears under the tab bar once both AI cards have scrolled out of view, so
 * the two things an agent keeps checking stay in reach without the cards
 * following them down the page. The chips are real buttons: each scrolls to its
 * card and expands it if it was collapsed.
 */
export default function SummaryStrip({
  summary,
  rootCause,
  onShow,
  onShowRootCause,
  onShowFix
}: {
  summary: SummaryCard;
  rootCause: RootCauseCard;
  onShow: () => void;
  onShowRootCause: () => void;
  onShowFix: () => void;
}) {
  const band = rootCause.confidence?.band;
  const fix = rootCause.fix;

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-150)',
        padding: 'var(--spacing-100) var(--spacing-400)',
        backgroundColor: 'var(--color-fill-surface)',
        borderBlockEnd: '1px solid var(--color-boundary-border-mildest)',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      <SparkleIcon />
      <span style={{ ...BODY_COMPACT, ...TRUNCATE, flex: 1 }} title={summary.strip}>
        {summary.strip ?? summary.title}
      </span>

      {/* On a ticket with no root cause, the strip is only the line and Show. */}
      {band && (
        <TextButton type="button" variant="secondary" size="mini" onClick={onShowRootCause}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-050)' }}>
            <Tag variant={TAG_VARIANT_BY_BAND[band]} style={NO_SHRINK}>{BAND_LABEL[band]}</Tag>
            Root cause
          </span>
        </TextButton>
      )}
      {fix && fix.status !== 'none' && (
        <TextButton type="button" variant="secondary" size="mini" onClick={onShowFix}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-050)' }}>
            <Tag variant={FIX_STATUS_BADGE[fix.status].variant} style={NO_SHRINK}>{FIX_STATUS_BADGE[fix.status].label}</Tag>
            Fix
          </span>
        </TextButton>
      )}

      <TextButton type="button" variant="link" size="mini" onClick={onShow}>
        Show
      </TextButton>
    </div>
  );
}

import { useId } from 'react';
import { InlineMessage, Shimmer, Spinner, TextButton } from '@freshworks/dew-components';
import type { ProposedFlags, SummaryCard as SummaryCardData } from './types';
import { elapsed } from './format';
import RichTextView from './RichTextView';
import ActorAvatar from './ActorAvatar';
import { FeedbackButtons, SparkleIcon, SummaryHeaderActions } from './AiCardChrome';
import useAnimatedCardHeight from './useAnimatedCardHeight';

const sectionLabel: React.CSSProperties = {
  fontSize: '14px', lineHeight: '20px', fontWeight: 'var(--font-weight-semi-bold)',
  color: 'var(--color-text-primary)'
};

function relativeUpdated(at?: string): string {
  if (!at) return '';
  const hours = Math.max(1, Math.round((Date.now() - new Date(at).getTime()) / 3_600_000));
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}

export default function SummaryCard({
  summary,
  ticketCode,
  collapsed,
  onToggleCollapsed,
  proposed,
  onRegenerate,
  hideHeaderActions = false
}: {
  summary: SummaryCardData;
  ticketCode?: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  proposed: ProposedFlags;
  onRegenerate?: () => void;
  hideHeaderActions?: boolean;
}) {
  const bodyId = useId();
  const { contentRef, height } = useAnimatedCardHeight(collapsed);

  if (summary.state === 'not-generated') {
    return (
      <button type="button" className="tr-ai-card tr-ai-empty" onClick={onRegenerate}>
        <SparkleIcon size="md" />
        <span>Summarize ticket</span>
      </button>
    );
  }

  return (
    <section className="tr-ai-card" aria-label="Summary">
      <div className="tr-ai-card-header">
        <SparkleIcon size="md" />
        <h3 className="tr-ai-card-title">Summary</h3>
        {summary.updatedAt && (
          <span className="tr-ai-card-meta">
            Last updated {relativeUpdated(summary.updatedAt)} by
            {summary.updatedBy && <ActorAvatar actor={summary.updatedBy} />}
            {summary.updatedBy?.name ?? 'AI Copilot'}
          </span>
        )}
        <span style={{ flex: 1 }} />
        {!hideHeaderActions && <SummaryHeaderActions onRegenerate={onRegenerate} />}
      </div>

      {summary.state === 'generating' ? (
        <div className="tr-ai-card-content" aria-live="polite">
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)' }}>
            <Spinner size="sm" aria-label="Generating summary" /> Thinking {elapsed(summary.elapsedSeconds ?? 0)}
          </span>
          <Shimmer width="100%" height={14} radius="sm" />
          <Shimmer width="70%" height={14} radius="sm" />
        </div>
      ) : (
        <>
          {summary.state === 'out-of-date' && proposed.showOutOfDate && summary.newSince && (
            <InlineMessage variant="info">New messages arrived since this summary. Regenerate to include them.</InlineMessage>
          )}
          <div id={bodyId} className={`tr-ai-card-content tr-ai-animated ${collapsed ? 'tr-ai-preview' : ''}`} style={{ height }}>
            <div ref={contentRef} className="tr-ai-card-content-inner">
            {summary.issue && (
              <div className="tr-ai-section">
                <div style={sectionLabel}>Issue:</div>
                <ul><li><RichTextView value={summary.issue} ticketCode={ticketCode} /></li></ul>
              </div>
            )}
            {summary.tried && summary.tried.length > 0 && (
              <div className="tr-ai-section" aria-hidden={collapsed}>
                <div style={sectionLabel}>Actions taken:</div>
                <ul>{summary.tried.map((item, index) => <li key={index}><RichTextView value={item} ticketCode={ticketCode} /></li>)}</ul>
              </div>
            )}
            {summary.standing && (
              <div className="tr-ai-section" aria-hidden={collapsed}>
                <div style={sectionLabel}>Current status:</div>
                <ul><li><RichTextView value={summary.standing} ticketCode={ticketCode} /></li></ul>
              </div>
            )}
            </div>
          </div>
          <div className="tr-ai-card-footer">
            <TextButton type="button" variant="link" size="mini" aria-expanded={!collapsed} aria-controls={bodyId} onClick={onToggleCollapsed}>
              {collapsed ? 'View more' : 'View less'}
            </TextButton>
            <span className="tr-ai-footer-divider" />
            <FeedbackButtons />
          </div>
        </>
      )}
    </section>
  );
}

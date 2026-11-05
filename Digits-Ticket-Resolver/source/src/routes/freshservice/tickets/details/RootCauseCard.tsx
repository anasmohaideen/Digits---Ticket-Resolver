import { useId, useState } from 'react';
import { Shimmer, Spinner, TextButton, TextField } from '@freshworks/dew-components';
import type { ProposedFlags, RootCauseCard as RootCauseCardData } from './types';
import { elapsed } from './format';
import RichTextView from './RichTextView';
import ActorAvatar from './ActorAvatar';
import { FeedbackButtons, SparkleIcon, SummaryHeaderActions } from './AiCardChrome';
import useAnimatedCardHeight from './useAnimatedCardHeight';

const labelStyle: React.CSSProperties = {
  font: 'var(--font-body-semibold)', color: 'var(--color-text-primary)'};

export default function RootCauseCard({
  rootCause,
  ticketCode,
  collapsed,
  onToggleCollapsed,
  proposed,
  onFindInitiatingChanges,
  hideHeaderActions = false
}: {
  rootCause: RootCauseCardData;
  ticketCode?: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  proposed: ProposedFlags;
  onFindInitiatingChanges?: () => void;
  hideHeaderActions?: boolean;
  onViewInConversation?: (eventId: string) => void;
  onViewSimilarTickets?: () => void;
}) {
  const bodyId = useId();
  const [disputeOpen, setDisputeOpen] = useState(false);
  const { contentRef, height } = useAnimatedCardHeight(collapsed);

  if (rootCause.state === 'not-analyzed') {
    return (
      <button type="button" className="tr-ai-card tr-ai-empty" onClick={onFindInitiatingChanges}>
        <SparkleIcon size="md" />
        <span>Find root cause</span>
      </button>
    );
  }

  return (
    <section className="tr-ai-card" aria-label="Root cause">
      <div className="tr-ai-card-header">
        <SparkleIcon size="md" />
        <h3 className="tr-ai-card-title">Root cause</h3>
        {rootCause.at && (
          <span className="tr-ai-card-meta">
            Identified by
            {rootCause.by && <ActorAvatar actor={rootCause.by} />}
            {rootCause.by?.name ?? 'AI Copilot'}
          </span>
        )}
        <span style={{ flex: 1 }} />
        {!hideHeaderActions && <SummaryHeaderActions subject="root cause" />}
      </div>

      {rootCause.state === 'analyzing' ? (
        <div className="tr-ai-card-content" aria-live="polite">
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)' }}>
            <Spinner size="sm" aria-label="Analysing" /> {rootCause.live?.label ?? 'Analysing'} {elapsed(rootCause.live?.elapsedSeconds ?? 0)}
          </span>
          <Shimmer width="85%" height={14} radius="sm" />
        </div>
      ) : (
        <>
          <div id={bodyId} className={`tr-ai-card-content tr-ai-animated ${collapsed ? 'tr-ai-preview' : ''}`} style={{ height }}>
            <div ref={contentRef} className="tr-ai-card-content-inner">
            {rootCause.cause && (
              <div className="tr-ai-section">
                <div style={labelStyle}>Cause:</div>
                <ul><li><RichTextView value={rootCause.cause} ticketCode={ticketCode} /></li></ul>
              </div>
            )}
            {!rootCause.cause && rootCause.checked && (
              <div className="tr-ai-section">
                <div style={labelStyle}>What was checked:</div>
                <ul><li><RichTextView value={rootCause.checked} ticketCode={ticketCode} /></li></ul>
              </div>
            )}
            {rootCause.evidence && rootCause.evidence.length > 0 && (
              <div className="tr-ai-section" aria-hidden={collapsed}>
                <div style={labelStyle}>Evidence:</div>
                <ul>{rootCause.evidence.map((item, index) => <li key={index}><RichTextView value={item} ticketCode={ticketCode} /></li>)}</ul>
              </div>
            )}
            {rootCause.fix?.nextStep && (
              <div className="tr-ai-section" aria-hidden={collapsed}>
                <div style={labelStyle}>Suggested resolution:</div>
                <ul><li><RichTextView value={rootCause.fix.nextStep} ticketCode={ticketCode} /></li></ul>
              </div>
            )}
            </div>
          </div>
          {rootCause.state === 'disputed' && proposed.showDisputed && disputeOpen && (
            <div style={{ marginTop: 'var(--spacing-150)' }}>
              <TextField label="Reason" aria-label="Reason this root cause was not helpful" placeholder="What was wrong?" />
              <TextButton type="button" variant="link" size="mini" onClick={() => setDisputeOpen(false)}>Done</TextButton>
            </div>
          )}
          <div className="tr-ai-card-footer">
            <TextButton type="button" variant="link" size="mini" aria-expanded={!collapsed} aria-controls={bodyId} onClick={onToggleCollapsed}>
              {collapsed ? 'View more' : 'View less'}
            </TextButton>
            <span className="tr-ai-footer-divider" />
            <FeedbackButtons onNotHelpful={() => setDisputeOpen(true)} />
          </div>
        </>
      )}
    </section>
  );
}

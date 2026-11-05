import { useState } from 'react';
import { Icon, Tag, TextButton } from '@freshworks/dew-components';
import type { ApprovalNode, ProposedFlags } from './types';
import { BODY, CARD_BLOCK, CARD_ROW, CARD_TITLE, META, SECTION_LABEL, SPACER } from './details.styles';
import { timeOfDay } from './format';
import RichTextView from './RichTextView';
import ActorAvatar from './ActorAvatar';
import approveIcon from '../../../../../Assets/Icons/Approve.svg';

/**
 * B6 · Approval card.
 *
 * Sits inline in the stream, where the approval was requested, so the decision
 * stays next to the work that needed it. Once decided, Reject and Approve give
 * way to the outcome — the card cannot be acted on twice.
 */
export default function ApprovalCard({
  approval,
  ticketCode,
  proposed,
  state: controlledState,
  decidedAt: controlledDecidedAt,
  onStateChange
}: {
  approval: ApprovalNode;
  ticketCode?: string;
  proposed: ProposedFlags;
  state?: ApprovalNode['state'];
  decidedAt?: string;
  onStateChange?: (state: ApprovalNode['state']) => void;
}) {
  const [internalState, setInternalState] = useState(approval.state);
  const state = controlledState ?? internalState;
  const setState = (next: ApprovalNode['state']) => {
    if (controlledState === undefined) setInternalState(next);
    onStateChange?.(next);
  };
  const decided = state !== 'pending';
  const decidedBy = approval.decidedBy?.name ?? 'you';
  const decidedAt = controlledDecidedAt ?? approval.decidedAt ?? approval.at;

  return (
    <section className="tr-approval-card" id={`stream-${approval.id}`} aria-label={`Approval: ${approval.title}`}>
      <div className="tr-approval-card-body">
        <Tag variant="normal" className="tr-approval-badge fw-text-sm" style={{ border: 0 }}>Approval needed</Tag>
        <div style={{ ...CARD_ROW, marginTop: 'var(--spacing-150)', flexWrap: 'wrap' }}>
          <span style={{ ...CARD_TITLE, font: 'var(--font-callout-regular)' }}>{approval.title}</span>
          <span style={{ ...META, font: 'var(--font-body)' }}>{timeOfDay(approval.at)}</span>
        </div>
        <div style={{ ...CARD_BLOCK, marginTop: 'var(--spacing-200)' }}>
          <div style={{ ...SECTION_LABEL, font: 'var(--font-body)' }}>What this action</div>
          <div style={{ ...BODY, color: 'var(--color-text-secondary)' }}>
            <RichTextView value={approval.what} ticketCode={ticketCode} />
          </div>
        </div>
        <div style={{ ...CARD_BLOCK, marginTop: 'var(--spacing-200)' }}>
          <div style={{ ...SECTION_LABEL, font: 'var(--font-body)' }}>Why this action</div>
          <div style={{ ...BODY, color: 'var(--color-text-secondary)' }}>
            <RichTextView value={approval.whyAction} ticketCode={ticketCode} />
          </div>
        </div>
      </div>
      <div className="tr-approval-card-footer" style={CARD_ROW}>
        <span style={SPACER} />

        {decided && proposed.showDecidedApproval ? (
          <span className="tr-approval-decision fw-text-base" role="status">
            {state === 'approved'
              ? <span className="tr-mask-icon" aria-hidden style={{ width: 16, height: 16, ['--mask-src' as string]: `url("${approveIcon}")`, ['--mask-color' as string]: 'var(--color-icon-semantic-success)' }} />
              : <span className="tr-approval-decision-icon" style={{ background: 'var(--color-fill-semantic-error)' }}>
                  <Icon name="CrossSmall" size="xs" color="var(--color-text-inverse)" title="" />
                </span>}
            <span>{state === 'approved' ? 'Approved' : 'Rejected'} by</span>
            {approval.decidedBy && <ActorAvatar actor={approval.decidedBy} size="xs" />}
            <strong>{decidedBy}</strong>
            <span className="tr-approval-decision-time">{timeOfDay(decidedAt)}</span>
          </span>
        ) : (
          <>
            <TextButton type="button" variant="secondary" onClick={() => setState('rejected')}>
              Reject
            </TextButton>
          <TextButton type="button" variant="primary" onClick={() => setState('approved')}>
              Approve
            </TextButton>
          </>
        )}
      </div>

      {decided && !proposed.showDecidedApproval && (
        <div style={{ ...META, display: 'flex', alignItems: 'center', gap: 'var(--spacing-050)' }}>
          <Icon name="CircleCheck" size="sm" color="var(--color-icon-semantic-success)" title="" />
          Decided
        </div>
      )}
    </section>
  );
}

import { useId, useState } from 'react';
import { IconButton, Select, Tag, TextButton } from '@freshworks/dew-components';
import type { ApprovalNode } from '../types';
import RichTextView from '../RichTextView';
import Reveal from './Reveal';

/** The pending decision surface that sits above the reply dock. */
export default function ApprovalAttention({
  approval,
  ticketCode,
  pendingCount,
  onReject,
  onApprove,
  defaultExpanded = false
}: {
  approval: ApprovalNode;
  ticketCode?: string;
  pendingCount: number;
  onReject: () => void;
  onApprove: () => void;
  /** Open on arrival — Replay Live pulls the card in mid-work. */
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const detailsId = useId();
  // Proposed values stay editable before approval; options are the current and proposed values.
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() =>
    Object.fromEntries((approval.proposedFields ?? []).map((field) => [field.field, field.to]))
  );

  return (
    <section className={`tr-o2-approval-attention${expanded ? ' is-expanded' : ' is-collapsed'}`} aria-label={`Approval needed: ${approval.title}`}
      onClick={expanded ? undefined : () => setExpanded(true)}
    >
      {/* Collapsed, the whole card expands it; expanded, only the header collapses it so
          clicks on the fields and actions don't. The chevron stays the keyboard control. */}
      <div className="tr-o2-approval-attention-header" onClick={expanded ? () => setExpanded(false) : undefined}>
        <span className="tr-o2-approval-attention-copy">
          <span className="tr-o2-approval-attention-eyebrow fw-font-Inter fw-text-sm fw-font-normal fw-leading-[16px] fw-tracking-[0.06px] fw-text-secondary">
            <Tag variant="normal" className="tr-approval-badge fw-text-sm" style={{ border: 0 }}>Approval needed</Tag>
            {pendingCount > 1 && <span>{pendingCount} pending</span>}
          </span>
          <strong className="fw-font-Inter fw-text-base fw-font-semibold fw-leading-5 fw-tracking-[0.04px] fw-text-primary">{approval.title}</strong>
        </span>
        <IconButton
          iconName={expanded ? 'ChevronUp' : 'ChevronDown'}
          aria-label={expanded ? 'Collapse approval details' : 'Expand approval details'}
          aria-expanded={expanded}
          aria-controls={detailsId}
          size="mini"
          withBackground
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((current) => !current);
          }}
        />
      </div>

      <Reveal open={expanded} id={detailsId}>
        <div className="tr-o2-approval-attention-details">
          {approval.proposedFields ? (
            <div className="tr-o2-approval-properties fw-font-Inter fw-text-base fw-font-normal fw-leading-5 fw-tracking-[0.04px] fw-text-secondary">
              <RichTextView value={approval.whyAction} ticketCode={ticketCode} />
              <dl className="tr-o2-approval-fields">
                {approval.proposedFields.map((field) => (
                  <div key={field.field} className="tr-o2-approval-field">
                    <dt className="fw-font-Inter fw-text-sm fw-font-normal fw-leading-[16px] fw-tracking-[0.06px] fw-text-secondary">{field.field}</dt>
                    <dd>
                      <Select
                        aria-label={field.field}
                        options={[...new Set([field.to, field.from].filter((option) => option !== '--'))].map((option) => ({ value: option, label: option }))}
                        value={{ value: fieldValues[field.field], label: fieldValues[field.field] }}
                        onValueChange={(option) => option && setFieldValues((current) => ({ ...current, [field.field]: String(option.value) }))}
                      />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <div className="tr-o2-approval-attention-body fw-font-Inter fw-text-base fw-font-normal fw-leading-5 fw-tracking-[0.04px] fw-text-secondary">
              <div>
                <strong className="fw-font-semibold fw-text-primary">What this action</strong>
                <RichTextView value={approval.what} ticketCode={ticketCode} />
              </div>
              <div>
                <strong className="fw-font-semibold fw-text-primary">Why this action</strong>
                <RichTextView value={approval.whyAction} ticketCode={ticketCode} />
              </div>
            </div>
          )}

          <div className="tr-o2-approval-attention-actions">
            <TextButton type="button" variant="secondary" onClick={onReject}>
              {approval.actionLabels?.reject ?? 'Reject'}
            </TextButton>
            <TextButton type="button" variant="primary" onClick={onApprove}>
              {approval.actionLabels?.approve ?? 'Approve'}
            </TextButton>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

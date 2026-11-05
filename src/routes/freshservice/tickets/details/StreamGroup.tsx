import { useId, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  Card,
  Tag,
  TextButton
} from '@freshworks/dew-components';
import type { EventNode, GroupNode, ProposedFlags, StreamNode } from './types';
import { TAG_VARIANT_BY_TONE } from './details.tokens';
import { BODY_COMPACT, CARD_ROW, CARD_TITLE, META, NO_SHRINK, SPACER } from './details.styles';
import { timeRange } from './format';
import { phasesOf, runChips } from './streamView';
import ActorAvatar from './ActorAvatar';
import MessageCard from './MessageCard';
import EventRow from './EventRow';
import LiveRow from './LiveRow';
import ApprovalCard from './ApprovalCard';

/**
 * B7 · Groups, and the node dispatcher they share.
 *
 * Level 1 is the Digit run — everything the Digit did before a person was
 * assigned, folded into one row. Level 2 is a phase inside it. Milestone events
 * (`ticket-created`, `approval-decided`) sit between phases when the run is
 * open, which is why a run's children are a mixed list rather than only phases.
 */

export interface StreamNodeViewProps {
  node: StreamNode;
  ticketCode?: string;
  proposed: ProposedFlags;
  /** Inside an expanded phase, messages render at compact density. */
  compact?: boolean;
  /** Phases that start open, for a deep link or the review's expanded state. */
  openPhaseIds?: string[];
  /** Runs that start open, for the review's expanded state. */
  openRunIds?: string[];
  onSummaryUpdated?: () => void;
  workActivities?: EventNode[];
  reveal?: boolean;
  liveReplayHistory?: boolean;
}

export function StreamNodeView(props: StreamNodeViewProps) {
  const { node, ticketCode, proposed, compact, openPhaseIds, openRunIds, onSummaryUpdated, workActivities, reveal, liveReplayHistory } = props;

  switch (node.kind) {
    case 'message':
      return (
        <MessageCard message={node} ticketCode={ticketCode} proposed={proposed} compact={compact} workActivities={workActivities} reveal={reveal} liveReplayHistory={liveReplayHistory} />
      );
    case 'event':
      return <EventRow event={node} ticketCode={ticketCode} onSummaryUpdated={onSummaryUpdated} />;
    case 'approval':
      return <ApprovalCard approval={node} ticketCode={ticketCode} proposed={proposed} />;
    case 'live':
      return <LiveRow live={node} />;
    case 'group':
      return node.level === 'run' ? (
        <RunGroup
          run={node}
          ticketCode={ticketCode}
          proposed={proposed}
          defaultOpen={node.defaultOpen || (openRunIds?.includes(node.id) ?? false)}
          openPhaseIds={openPhaseIds}
          onSummaryUpdated={onSummaryUpdated}
        />
      ) : (
        // A phase outside a run only happens in the gallery, which renders one
        // on its own. `AccordionItem` needs its root, so it is supplied here.
        <Accordion type="multiple" defaultValue={openPhaseIds ?? [node.id]}>
          <PhaseGroup
            phase={node}
            ticketCode={ticketCode}
            proposed={proposed}
            onSummaryUpdated={onSummaryUpdated}
          />
        </Accordion>
      );
    default:
      return null;
  }
}

/** A list of nodes at one level, stacked with the stream's own rhythm. */
export function StreamNodes({
  nodes,
  ...rest
}: Omit<StreamNodeViewProps, 'node'> & { nodes: StreamNode[] }) {
  return (
    <>
      {nodes.map((node) => (
        <StreamNodeView key={node.id} node={node} {...rest} />
      ))}
    </>
  );
}

/* ───────────── Level 2 · Phase ───────────── */

/**
 * A phase row. Dew's `Accordion` supplies the chevron, `aria-expanded`,
 * `aria-controls` and Enter/Space handling, so none of that is re-implemented.
 */
function PhaseGroup({
  phase,
  ticketCode,
  proposed,
  onSummaryUpdated
}: {
  phase: GroupNode;
  ticketCode?: string;
  proposed: ProposedFlags;
  onSummaryUpdated?: () => void;
}) {
  return (
    <AccordionItem value={phase.id}>
      {/* `hideIcon` drops Dew's default leading `CircleCheck`, which would
          read as "this phase succeeded" on every phase. The chevron it adds
          after the children is the disclosure affordance, and is kept.
          The header wraps all its children in one flex span, so the row's own
          spacing is set here rather than relying on the header's gap. */}
      <AccordionHeader hideIcon>
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', flexWrap: 'wrap' }}>
          <span style={CARD_TITLE}>{phase.title}</span>
          <span style={META}>
            {phase.meta} · {timeRange(phase.start, phase.end)}
          </span>
          <span style={SPACER} />
          {phase.outcomes.map((outcome) => (
            <Tag key={outcome.label} variant={TAG_VARIANT_BY_TONE[outcome.tone]} style={NO_SHRINK}>
              {outcome.label}
            </Tag>
          ))}
        </span>
      </AccordionHeader>
      <AccordionContent>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-100)',
            paddingInlineStart: 'var(--spacing-200)',
            borderInlineStart: '2px solid var(--color-boundary-divider-mildest)'
          }}
        >
          <StreamNodes
            nodes={phase.children}
            ticketCode={ticketCode}
            proposed={proposed}
            compact
            onSummaryUpdated={onSummaryUpdated}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

/* ───────────── Level 1 · Run ───────────── */

export function RunGroup({
  run,
  ticketCode,
  proposed,
  defaultOpen,
  openPhaseIds,
  onSummaryUpdated
}: {
  run: GroupNode;
  ticketCode?: string;
  proposed: ProposedFlags;
  defaultOpen: boolean;
  openPhaseIds?: string[];
  onSummaryUpdated?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [openPhases, setOpenPhases] = useState<string[]>(openPhaseIds ?? []);
  const bodyId = useId();
  const chips = runChips(run);
  const phaseIds = phasesOf(run).map((phase) => phase.id);

  /* Children that are not phases — `ticket-created`, `approval-decided` and
     any other milestone — are rendered between the phases, in order. */
  const renderChildren = () =>
    run.children.map((child) => {
      if (child.kind === 'group' && child.level === 'phase') {
        return (
          <Accordion
            key={child.id}
            type="multiple"
            value={openPhases.filter((id) => phaseIds.includes(id))}
            onValueChange={(value) => setOpenPhases(value)}
          >
            <PhaseGroup
              phase={child}
              ticketCode={ticketCode}
              proposed={proposed}
              onSummaryUpdated={onSummaryUpdated}
            />
          </Accordion>
        );
      }
      return (
        <StreamNodeView
          key={child.id}
          node={child}
          ticketCode={ticketCode}
          proposed={proposed}
          compact
          onSummaryUpdated={onSummaryUpdated}
        />
      );
    });

  return (
    <Card variant="flat" padding="md" id={`stream-${run.id}`}>
      <div style={{ ...CARD_ROW, alignItems: 'flex-start' }}>
        <ActorAvatar actor={run.actor} size="md" />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-050)' }}>
          <span style={CARD_TITLE}>{run.title}</span>
          <span style={META}>
            {timeRange(run.start, run.end)} · {run.meta}
          </span>
          {!open && chips.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-050)', paddingBlockStart: 'var(--spacing-025)' }}>
              {chips.map((chip) => (
                <Tag key={chip.label} variant={TAG_VARIANT_BY_TONE[chip.tone]} style={NO_SHRINK}>
                  {chip.label}
                </Tag>
              ))}
            </div>
          )}
        </div>
        <TextButton
          type="button"
          variant="secondary"
          size="mini"
          suffixIcon={open ? 'ChevronUp' : 'ChevronDown'}
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Collapse' : 'Expand'}
        </TextButton>
      </div>

      {/* Kept in the DOM while collapsed, so `aria-controls` on the Expand
          button always resolves. */}
      <div
        id={bodyId}
        hidden={!open}
        style={open ? { width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-100)' } : undefined}
      >
        {open ? renderChildren() : null}
      </div>
    </Card>
  );
}

/**
 * Today's "+N conversations" pill, reused for human threads. Centred on a
 * hairline, which is how the product sets it.
 */
export function ConversationsPill({
  count,
  onExpand
}: {
  count: number;
  onExpand: () => void;
}) {
  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--spacing-150)' }}>
      <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-boundary-divider-mildest)' }} />
      <TextButton
        type="button"
        variant="secondary"
        size="mini"
        prefixIcon="DoubleChevronDown"
        aria-expanded={false}
        onClick={onExpand}
      >
        {`+${count} conversations`}
      </TextButton>
      <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-boundary-divider-mildest)' }} />
    </div>
  );
}

/** The repo has no "new" divider, so the stream gets one here. */
export function UnreadDivider() {
  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--spacing-150)' }}>
      <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-boundary-semantic-error-mild)' }} />
      <span style={{ ...BODY_COMPACT, color: 'var(--color-text-semantic-error)' }}>New</span>
      <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-boundary-semantic-error-mild)' }} />
    </div>
  );
}

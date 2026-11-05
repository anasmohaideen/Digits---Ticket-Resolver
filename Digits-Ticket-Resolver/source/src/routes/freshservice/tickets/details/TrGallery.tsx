import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card, TextButton, Toggle } from '@freshworks/dew-components';
import { ticketIdFor } from '../tickets.data';
import type { ProposedFlags } from './types';
import { DEFAULT_PROPOSED } from './types';
import { BODY_COMPACT, HEADING, META, SECTION_LABEL } from './details.styles';
import {
  APPROVAL_CATALOG,
  EVENT_CATALOG,
  FIX_CATALOG,
  GROUP_CATALOG,
  HUMAN_THREAD,
  JORDAN,
  LIVE_CATALOG,
  MESSAGE_CATALOG,
  REPLY_BAR_CATALOG,
  ROOT_CAUSE_CATALOG,
  STRIP_CATALOG,
  SUMMARY_CATALOG
} from './fixtures/catalog';
import SummaryCard from './SummaryCard';
import RootCauseCard from './RootCauseCard';
import MessageCard from './MessageCard';
import EventRow from './EventRow';
import LiveRow from './LiveRow';
import ApprovalCard from './ApprovalCard';
import ReplyBar from './ReplyBar';
import SummaryStrip from './SummaryStrip';
import { ConversationsPill, RunGroup, StreamNodes } from './StreamGroup';
import { collapseHumanThreads } from './streamView';

/**
 * Dev gallery for the Details tab.
 *
 * The repo has no Storybook, and `/` (Overview) is already its component
 * gallery, so this follows that pattern as a route: every entry in
 * `docs/tr-details-handoff/data/catalog.json`, in order, with the proposed
 * blocks behind toggles so they can be reviewed separately from the agreed
 * ones.
 */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-150)' }}>
      <h2 style={HEADING}>{title}</h2>
      {children}
    </section>
  );
}

function Entry({ label, note, children }: { label: string; note?: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-050)' }}>
      <div style={SECTION_LABEL}>{label}</div>
      {note && <div style={META}>{note}</div>}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-100)',
          padding: 'var(--spacing-150)',
          backgroundColor: 'var(--color-fill-container)',
          borderRadius: 'var(--border-radius-medium)'
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** One collapsible card per block, so the page is navigable. */
function Collapsible({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <Card variant="flat" padding="md">
      <TextButton
        type="button"
        variant="link"
        aria-expanded={open}
        suffixIcon={open ? 'ChevronUp' : 'ChevronDown'}
        onClick={() => setOpen((value) => !value)}
      >
        <span style={HEADING}>{label}</span>
      </TextButton>
      {open && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
          {children}
        </div>
      )}
    </Card>
  );
}

const TICKET_CODE = 'INC-4127';
const TICKET_ID = ticketIdFor(TICKET_CODE) ?? TICKET_CODE;

export default function TrGallery() {
  const [proposed, setProposed] = useState<ProposedFlags>(DEFAULT_PROPOSED);
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({});

  const toggleProposed = (key: keyof ProposedFlags) =>
    setProposed((flags) => ({ ...flags, [key]: !flags[key] }));

  const isCollapsed = (key: string, initial = false) => collapsedCards[key] ?? initial;
  const toggleCollapsed = (key: string, initial = false) =>
    setCollapsedCards((state) => ({ ...state, [key]: !(state[key] ?? initial) }));

  return (
    <div
      style={{
        minHeight: '100%',
        backgroundColor: 'var(--color-fill-base)',
        padding: 'var(--spacing-400)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-300)'
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-100)' }}>
        <h1 style={{ ...HEADING, font: 'var(--font-headline)' }}>
          Ticket Resolver · Details tab gallery
        </h1>
        <p style={{ ...BODY_COMPACT, margin: 0, color: 'var(--color-text-secondary)' }}>
          Every block and state in <code>docs/tr-details-handoff/data/catalog.json</code>. The three
          review states render in the real page:{' '}
          <Link to={`/freshservice/tickets/${TICKET_ID}?state=landing`} style={{ color: 'var(--color-text-brand)' }}>
            landing
          </Link>
          {' · '}
          <Link to={`/freshservice/tickets/${TICKET_ID}?state=engaged`} style={{ color: 'var(--color-text-brand)' }}>
            engaged
          </Link>
          {' · '}
          <Link to={`/freshservice/tickets/${TICKET_ID}?state=expanded`} style={{ color: 'var(--color-text-brand)' }}>
            fully expanded
          </Link>
          {' · '}
          <Link to="/freshservice/tickets/INC-4133" style={{ color: 'var(--color-text-brand)' }}>
            INC-4133 (email, humans only)
          </Link>
        </p>

        <Card variant="flat" padding="md">
          <div style={SECTION_LABEL}>Proposed blocks</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-200)' }}>
            {(
              [
                ['showOutOfDate', 'Summary · out of date'],
                ['showEdited', 'Summary · edited'],
                ['showDisputed', 'Root cause · disputed'],
                ['showSentiment', 'Message · sentiment'],
                ['showDraftedWith', 'Message · drafted with Freddy'],
                ['showDecidedApproval', 'Approval · decided']
              ] as Array<[keyof ProposedFlags, string]>
            ).map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)', ...BODY_COMPACT }}>
                <Toggle checked={proposed[key]} onChange={() => toggleProposed(key)} aria-label={label} />
                {label}
              </label>
            ))}
          </div>
        </Card>
      </header>

      <Collapsible label="B1 · Summary card">
        {SUMMARY_CATALOG.map((entry) => (
          <Entry key={entry.label} label={entry.label}>
            <SummaryCard
              summary={entry.summary}
              ticketCode={TICKET_CODE}
              collapsed={isCollapsed(`summary-${entry.label}`, entry.collapsed)}
              onToggleCollapsed={() => toggleCollapsed(`summary-${entry.label}`, entry.collapsed)}
              proposed={proposed}
            />
          </Entry>
        ))}
      </Collapsible>

      <Collapsible label="B2 · Root cause & suggested fix">
        {ROOT_CAUSE_CATALOG.map((entry) => (
          <Entry key={entry.label} label={entry.label}>
            <RootCauseCard
              rootCause={entry.rootCause}
              ticketCode={TICKET_CODE}
              collapsed={isCollapsed(`rc-${entry.label}`, entry.collapsed)}
              onToggleCollapsed={() => toggleCollapsed(`rc-${entry.label}`, entry.collapsed)}
              proposed={proposed}
            />
          </Entry>
        ))}

        <Section title="Suggested fix statuses">
          {FIX_CATALOG.map((fix) => (
            <Entry key={fix.status} label={`Fix · ${fix.status}`}>
              <RootCauseCard
                rootCause={{ ...ROOT_CAUSE_CATALOG[2].rootCause, fix }}
                ticketCode={TICKET_CODE}
                collapsed={false}
                onToggleCollapsed={() => {}}
                proposed={proposed}
              />
            </Entry>
          ))}
        </Section>
      </Collapsible>

      <Collapsible label="B4 · Conversation message cards">
        {MESSAGE_CATALOG.map((entry) => (
          <Entry key={entry.label} label={entry.label}>
            <MessageCard
              message={entry.message}
              ticketCode={TICKET_CODE}
              proposed={proposed}
              compact={entry.compact}
            />
          </Entry>
        ))}
      </Collapsible>

      <Collapsible label="B5 · Stream events">
        {EVENT_CATALOG.map((entry) => (
          <Entry key={entry.label} label={entry.label} note={entry.note}>
            <EventRow event={entry.event} ticketCode={TICKET_CODE} />
          </Entry>
        ))}

        <Section title="Live states">
          {LIVE_CATALOG.map((live) => (
            <Entry key={live.id} label={`Live · ${live.activity}`}>
              <LiveRow live={live} />
            </Entry>
          ))}
        </Section>
      </Collapsible>

      <Collapsible label="B6 · Approval card">
        {APPROVAL_CATALOG.map((entry) => (
          <Entry key={entry.label} label={entry.label}>
            <ApprovalCard approval={entry.approval} ticketCode={TICKET_CODE} proposed={proposed} />
          </Entry>
        ))}
      </Collapsible>

      <Collapsible label="B7 · Groups">
        {GROUP_CATALOG.map((entry) => (
          <Entry key={entry.label} label={entry.label}>
            <RunGroup
              key={`${entry.label}-${entry.open}`}
              run={entry.run}
              ticketCode={TICKET_CODE}
              proposed={proposed}
              defaultOpen={entry.open}
              openPhaseIds={entry.openPhaseIds}
            />
          </Entry>
        ))}

        <Entry
          label="Human thread · “+3 conversations” then four cards"
          note="INC-4133's seven human messages, folded by the same pill the product uses."
        >
          {collapseHumanThreads(HUMAN_THREAD).map((row) =>
            row.kind === 'collapsed' ? (
              <ConversationsPill key={row.id} count={row.hidden.length} onExpand={() => {}} />
            ) : (
              <StreamNodes key={row.node.id} nodes={[row.node]} ticketCode="INC-4133" proposed={proposed} />
            )
          )}
        </Entry>
      </Collapsible>

      <Collapsible label="B9 · Reply bar">
        {REPLY_BAR_CATALOG.map((entry) => (
          <Entry key={entry.label} label={entry.label}>
            <ReplyBar viewer={JORDAN} source={entry.source} />
          </Entry>
        ))}
      </Collapsible>

      <Collapsible label="B10 · Sticky summary strip">
        {STRIP_CATALOG.map((entry) => (
          <Entry key={entry.label} label={entry.label}>
            <SummaryStrip
              summary={entry.summary}
              rootCause={entry.rootCause}
              onShow={() => {}}
              onShowRootCause={() => {}}
              onShowFix={() => {}}
            />
          </Entry>
        ))}
      </Collapsible>
    </div>
  );
}

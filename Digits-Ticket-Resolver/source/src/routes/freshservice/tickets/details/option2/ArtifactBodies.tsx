import type { RichText, SuggestedFix, TicketDetailsTab } from '../types';
import RichTextView from '../RichTextView';
import type { ResolutionNote } from './scenarios';

/**
 * Option 2 · the content of each artifact, rendered the same way wherever it
 * appears — in the top card and in its own entry in the conversation.
 *
 * Summary and resolution are `Label:` + indented lines; the root cause is
 * `Label:` + a short paragraph per section (21 Oct UI pass).
 */

const SECTION_LABEL_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-100)',
  font: 'var(--font-body-semibold)',
  color: 'var(--color-text-primary)'};

export function Section({
  label,
  aside,
  items
}: {
  label: string;
  /** A chip beside the label, e.g. the root cause's confidence. */
  aside?: React.ReactNode;
  items: Array<React.ReactNode>;
}) {
  if (items.length === 0) return null;
  return (
    <div className="tr-ai-section">
      <div style={SECTION_LABEL_STYLE}>
        {label}
        {aside}
      </div>
      <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>
    </div>
  );
}

/**
 * A label and one short paragraph. The root cause reads as prose — a line or
 * two per section — rather than a stack of indented one-liners.
 */
export function ParagraphSection({
  label,
  aside,
  children
}: {
  label: string;
  aside?: React.ReactNode;
  children?: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <div className="tr-ai-section">
      <div style={SECTION_LABEL_STYLE}>
        {label}
        {aside}
      </div>
      <p className="tr-o2-paragraph">{children}</p>
    </div>
  );
}

/**
 * Several authored lines run together as sentences. A line written as a
 * label-and-detail pair ("CHG-2187 · certificate authority rotated") gets an
 * em dash instead of the middle dot, which reads as a list separator in prose.
 */
function asProse(lines: RichText[]): RichText {
  return lines.flatMap((line, index) => [
    ...(index > 0 ? [' '] : []),
    ...line.map((part) => (typeof part === 'string' ? part.replace(/^ · /, ' — ') : part))
  ]);
}

/** The recommended steps; a fix authored without them offers its next step, or the steps its workflow runs. */
function resolutionSteps(fix: SuggestedFix): RichText[] {
  if (fix.recommended?.length) return fix.recommended;
  if (fix.nextStep) return [fix.nextStep];
  return (fix.steps ?? []).map((step) => [step.label]);
}

export function SummaryBody({ tab, ticketCode }: { tab: TicketDetailsTab; ticketCode?: string }) {
  const { summary } = tab;
  return (
    <div className="tr-o2-panel">
      <Section label="Issue:" items={summary.issue ? [<RichTextView value={summary.issue} ticketCode={ticketCode} />] : []} />
      <Section
        label="Actions taken:"
        items={(summary.tried ?? []).map((item) => <RichTextView value={item} ticketCode={ticketCode} />)}
      />
      <Section
        label="Current status:"
        items={summary.standing ? [<RichTextView value={summary.standing} ticketCode={ticketCode} />] : []}
      />
    </div>
  );
}

/**
 * Root cause and its fix are one section: a cause without a fix simply ends
 * after the evidence, rather than leaving an empty "fix" area behind.
 */
export function RootCauseBody({ tab, ticketCode }: { tab: TicketDetailsTab; ticketCode?: string }) {
  const { rootCause } = tab;
  const fix = rootCause.fix && rootCause.fix.status !== 'none' ? rootCause.fix : undefined;

  return (
    <div className="tr-o2-panel">
      <ParagraphSection
        label="Likely cause:"
      >
        {rootCause.cause && <RichTextView value={rootCause.cause} ticketCode={ticketCode} />}
      </ParagraphSection>
      <ParagraphSection label="What was checked:">
        {!rootCause.cause && rootCause.checked && <RichTextView value={rootCause.checked} ticketCode={ticketCode} />}
      </ParagraphSection>
      <ParagraphSection label="Evidence:">
        {rootCause.evidence?.length ? <RichTextView value={asProse(rootCause.evidence)} ticketCode={ticketCode} /> : null}
      </ParagraphSection>
      {fix && (
        <>
          {/* The steps the assigned person should take, as the Digit recommends them. */}
          {resolutionSteps(fix).length > 0 && (
            <div className="tr-ai-section">
              <div style={SECTION_LABEL_STYLE}>Suggested resolution:</div>
              <ol className="tr-o2-resolution-list">
                {resolutionSteps(fix).map((step, index) => (
                  <li key={index}><RichTextView value={step} ticketCode={ticketCode} /></li>
                ))}
              </ol>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function ResolutionBody({ note, ticketCode }: { note: ResolutionNote; ticketCode?: string }) {
  return (
    <div className="tr-o2-panel">
      <Section label="Resolution:" items={[<RichTextView value={note.resolution} ticketCode={ticketCode} />]} />
      <Section label="Cause:" items={[<RichTextView value={note.cause} ticketCode={ticketCode} />]} />
      <Section label="Steps taken:" items={note.steps.map((step) => <RichTextView value={step} ticketCode={ticketCode} />)} />
      <Section
        label="To prevent this:"
        items={note.prevention ? [<RichTextView value={note.prevention} ticketCode={ticketCode} />] : []}
      />
    </div>
  );
}

/** One-line form of each artifact, for the sticky brief bar. */
export function briefLine(kind: 'summary' | 'root-cause' | 'resolution', tab: TicketDetailsTab, note?: ResolutionNote): string {
  if (kind === 'resolution' && note) return note.brief;
  if (kind === 'root-cause') return tab.rootCause.title ?? 'Root cause identified';
  return tab.summary.strip ?? tab.summary.title ?? 'Summary';
}

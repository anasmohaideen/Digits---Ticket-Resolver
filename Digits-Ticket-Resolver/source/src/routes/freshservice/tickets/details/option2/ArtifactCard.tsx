import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { InlineMessage, SegmentedTabs, TextButton, Tag, useToast } from '@freshworks/dew-components';
import { ActionBanner, AiFeedbackFooter, AiGeneratingText, AiShimmer } from '../../../../../dewai';
import type { Actor, MessageNode, ProposedFlags, RichText, TicketDetailsTab } from '../types';
import { META } from '../details.styles';
import { SummaryHeaderActions } from '../AiCardChrome';
import PreTicketLog from './PreTicketLog';
import FormatToolbar from './FormatToolbar';
import { placeCaretAtEnd } from './ReplyComposer';
import { textToHtml } from './composerText';
import { sanitizeHtml } from '../richHtml';
import { ResolutionBody, RootCauseBody, SummaryBody } from './ArtifactBodies';
import { RelativeTime, type InternalStyle } from './ResponseCard';
import { ARTIFACT_LABEL, type ArtifactKind } from './responseTimeline';
import type { ResolutionNote } from './scenarios';

/**
 * Option 2 · the top card, one source of truth (21 Oct review).
 *
 *   lead       The card leads with whatever matters at this stage of the
 *              ticket — the resolution note once resolved, else the root
 *              cause, else the summary — and follows when a newer one lands.
 *   tabs       When there is more than one, they sit in the header as Dew's
 *              segmented tabs, so every option is visible up front. (A dropdown
 *              hid the fact that a summary, say, was there at all.)
 *   byline     "Updated 27 minutes ago by AI", or by the person's name once
 *              they have edited it. The card carries no Digit branding.
 *   one fix    Root cause and suggested fix are one section.
 *   no fold    No "View more": the content is the point of the card. A tall
 *              max-height scrolls only the rare, unusually long one.
 *
 * Every artifact also has its own entry in the conversation; this card is the
 * quick way to the one that matters now. "Ask AI" lives only in the reply dock.
 */

/** Flip to bring the conversation-log accordion back to the foot of the top card. */
const SHOW_LOG_IN_CARD = false;

/** Who the byline credits: a person by name, anything a Digit or Copilot wrote as "AI". */
function bylineName(actor: Actor): string {
  return actor.kind === 'agent' || actor.kind === 'requester' ? actor.name : 'AI';
}

const plain = (value?: RichText): string =>
  (value ?? []).map((part) => (typeof part === 'string' ? part : part.label)).join('');
const lines = (items?: RichText[]): string => (items ?? []).map(plain).filter(Boolean).join('\n');

/** Stand-in for a model run: a fresh write-up of this ticket's own card, in new words. */
function regeneratedFrom(kind: ArtifactKind, tab: TicketDetailsTab, resolution?: ResolutionNote): string {
  const { summary, rootCause } = tab;
  if (kind === 'root-cause') {
    const fix = rootCause.fix;
    return [
      `Cause:\n${plain(rootCause.cause) || plain(rootCause.checked) || 'Not enough evidence to name a cause yet.'}`,
      fix ? `Suggested fix:\n${fix.title}${fix.nextStep ? `\n${plain(fix.nextStep)}` : ''}` : '',
      rootCause.confidence ? `Confidence: ${rootCause.confidence.band} (${Math.round(rootCause.confidence.score * 100)}%).` : ''
    ].filter(Boolean).join('\n\n');
  }
  if (kind === 'resolution' && resolution) {
    return [`Resolution:\n${plain(resolution.resolution)}`, `Cause:\n${plain(resolution.cause)}`, `Steps taken:\n${lines(resolution.steps)}`].join('\n\n');
  }
  return [
    `Issue:\n${plain(summary.issue) || summary.title || ''}`,
    summary.tried?.length ? `Actions taken:\n${lines(summary.tried)}` : '',
    summary.standing ? `Current status:\n${plain(summary.standing)}` : ''
  ].filter(Boolean).join('\n\n');
}

export default function ArtifactCard({
  tab,
  ticketCode,
  proposed,
  available,
  active,
  onChange,
  resolution,
  internalStyle,
  log = [],
  onForward,
  onDelete,
  onGenerate,
  pending = []
}: {
  tab: TicketDetailsTab;
  ticketCode?: string;
  proposed: ProposedFlags;
  available: ArtifactKind[];
  active: ArtifactKind;
  onChange: (next: ArtifactKind) => void;
  resolution?: ResolutionNote;
  internalStyle: InternalStyle;
  /** The requester-visible chat before the ticket: the read-only record at the foot. */
  log?: MessageNode[];
  /** Present only on email-based tickets: drops the card's text into the reply editor. */
  onForward?: (text: string) => void;
  onDelete: (kind: ArtifactKind) => void;
  /** Present where a summary can be generated on demand: the empty row becomes the button. */
  onGenerate?: () => void;
  /** Kinds being generated right now: their tab is already in the strip, their body shimmers. */
  pending?: ArtifactKind[];
}) {
  const { summary, rootCause } = tab;
  const bodyRef = useRef<HTMLDivElement | null>(null);
  /* Regenerate, copy and edit are local to the card: the prototype has no model,
     so regenerate replays the thinking banner, and an edit replaces the body text. */
  const [regenerating, setRegenerating] = useState(false);
  const [genFailed, setGenFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addSuccessToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [edits, setEdits] = useState<Partial<Record<ArtifactKind, { text: string; html: string; at: number }>>>({});
  const [regenerated, setRegenerated] = useState<Partial<Record<ArtifactKind, { text: string; at: number }>>>({});
  /* Reveal plays once per generation: switching tabs must not replay it. */
  const [played, setPlayed] = useState<Partial<Record<ArtifactKind, number>>>({});
  const [fresh, setFresh] = useState<Partial<Record<ArtifactKind, number>>>({});
  useEffect(() => { setEditing(false); setCopied(false); }, [active]);
  const markPlayed = (kind: ArtifactKind) => {
    const entry = regenerated[kind];
    if (entry) setPlayed((current) => ({ ...current, [kind]: entry.at }));
  };
  const revealAt = regenerated[active]?.at;
  useEffect(() => {
    if (!revealAt) return;
    const timer = window.setTimeout(() => setPlayed((current) => ({ ...current, [active]: revealAt })), 6000);
    return () => window.clearTimeout(timer);
  }, [revealAt, active]);
  useEffect(() => {
    if (!regenerating) return;
    const timer = window.setTimeout(() => {
      setRegenerating(false);
      /* Prototype hook: append ?gen-error to the hash to preview the failure state. */
      if (/gen-error/.test(window.location.href)) { setGenFailed(true); return; }
      setEdits((current) => { const next = { ...current }; delete next[active]; return next; });
      setFresh((current) => ({ ...current, [active]: Date.now() }));
      setRegenerated((current) => ({ ...current, [active]: { text: regeneratedFrom(active, tab, resolution), at: Date.now() } }));
    }, 2400);
    return () => window.clearTimeout(timer);
  }, [regenerating, active]);
  const regenerate = () => { setEditing(false); setGenFailed(false); setRegenerating(true); };
  const copy = () => {
    const text = edits[active]?.text ?? regenerated[active]?.text ?? bodyRef.current?.innerText ?? '';
    void navigator.clipboard?.writeText(text).catch(() => undefined);
    addSuccessToast({ message: 'Copied to clipboard', autoClose: true, timeout: 5000 });
  };
  const startEdit = () => {
    setDraft(edits[active]?.text ?? regenerated[active]?.text ?? bodyRef.current?.innerText ?? '');
    setEditing(true);
  };
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [draftEmpty, setDraftEmpty] = useState(true);
  const syncDraft = () => setDraftEmpty(!(editorRef.current?.innerText ?? '').trim());
  /* Opening the editor seeds it once; typing then belongs to the browser. */
  useLayoutEffect(() => {
    if (!editing || !editorRef.current) return;
    const seed = edits[active]?.html ?? textToHtml(draft);
    editorRef.current.innerHTML = seed;
    setDraftEmpty(!(editorRef.current.innerText ?? '').trim());
    editorRef.current.focus();
    placeCaretAtEnd(editorRef.current);
  }, [editing]);
  const saveEdit = () => {
    const el = editorRef.current;
    if (!el) return;
    setEdits((current) => ({ ...current, [active]: { text: el.innerText.trim(), html: sanitizeHtml(el.innerHTML), at: Date.now() } }));
    setEditing(false);
  };
  const className = `tr-ai-card tr-o2-card ${internalStyle === 'border' ? 'is-accent' : ''} ${regenerating ? 'is-regenerating' : ''}`;

  /* The log now lives in the Description box. The accordion stays built, behind
     this switch, in case it comes back to the foot of this card. */
  const logBlock = SHOW_LOG_IN_CARD ? <PreTicketLog messages={log} ticketCode={ticketCode} /> : null;

  /* Nothing to show (never generated, or every tab deleted): the single
     "Summarize ticket" row, with the record of the chat still below it. */
  if (available.length === 0) {
    return (
      <ActionBanner
        state="default"
        title="Summarize ticket"
        onSummarize={onGenerate}
      />
    );
  }

  if (summary.state === 'generating' && available.every((kind) => kind === 'summary')) {
    return <ActionBanner state="thinking" title="Summarize ticket" thinkingLabel="Summarising the ticket" />;
  }

  /* A summary a person has edited is credited to them, at their edit's time. */
  const author: { by?: Actor; at?: string } =
    active === 'resolution'
      ? { by: resolution?.by, at: resolution?.at }
      : active === 'root-cause'
        ? { by: rootCause.by, at: rootCause.at }
        : summary.state === 'edited' && summary.editedBy
          ? { by: summary.editedBy.agent, at: summary.editedBy.at }
          : { by: summary.updatedBy, at: summary.updatedAt };

  const label = ARTIFACT_LABEL[active];
  const pendingActive =
    pending.includes(active) ||
    (active === 'summary' && summary.state === 'generating') ||
    (active === 'root-cause' && rootCause.state === 'analyzing');
  const PENDING_TEXT: Record<ArtifactKind, string> = { summary: 'Summarising the ticket', 'root-cause': rootCause.live?.label ?? 'Finding the likely cause', resolution: 'Writing the resolution note' };
  const regen = regenerated[active];
  if (regen && !edits[active]) { author.at = new Date(regen.at).toISOString(); }

  return (
    <section className={className} aria-label={label} aria-busy={regenerating || undefined}>
      <div className="tr-o2-card-head">
        <div className="tr-o2-card-title-group">
          {available.length > 1 ? (
            <SegmentedTabs size="mini" value={active} onValueChange={(next) => { markPlayed(active); onChange(next as ArtifactKind); }}>
              <SegmentedTabs.List aria-label="What this card shows">
                {available.map((kind) => (
                  <SegmentedTabs.Trigger key={kind} value={kind} disabled={regenerating}>
                    {ARTIFACT_LABEL[kind]}
                  </SegmentedTabs.Trigger>
                ))}
              </SegmentedTabs.List>
            </SegmentedTabs>
          ) : (
            <h2 className="tr-ai-card-title">{label}</h2>
          )}
          {author.by && author.at && !pendingActive && (
            <div className="tr-o2-card-meta">
              <span style={META}>Updated</span>
              <RelativeTime at={author.at} />
              <span style={META}>by {bylineName(author.by)}</span>
            </div>
          )}
        </div>
        <span style={{ flex: 1 }} />
        {!pendingActive && <SummaryHeaderActions
          subject={label.toLowerCase()}
          onRegenerate={regenerate}
          onCopy={copy}
          onEdit={active === 'root-cause' ? undefined : editing ? () => setEditing(false) : startEdit}
          copied={copied}
          editing={editing}
          onForward={onForward ? () => onForward(bodyRef.current?.innerText ?? '') : undefined}
          onDelete={() => onDelete(active)}
        />}
      </div>

      {active === 'summary' && summary.state === 'out-of-date' && proposed.showOutOfDate && summary.newSince && (
        <InlineMessage variant="info">New messages arrived since this summary. Regenerate to include them.</InlineMessage>
      )}

      {genFailed && !regenerating && (
        <InlineMessage variant="error">
          Couldn’t generate the {label.toLowerCase()}. <TextButton variant="link" onClick={regenerate}>Try again</TextButton>
        </InlineMessage>
      )}

      {regenerating || pendingActive ? (
        <div className="tr-o2-card-body" role="status" aria-label={`${pendingActive ? PENDING_TEXT[active] : `Regenerating the ${label.toLowerCase()}`}`}>
          {pendingActive && <span style={META}>{PENDING_TEXT[active]}…</span>}
          <AiShimmer pattern="03" fullWidth lines={7} width="100%" />
        </div>
      ) : editing ? (
        <div className="tr-o2-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-100)' }}>
          <div className="tr-o2-card-editor">
            <FormatToolbar set="full" editorRef={editorRef} onChange={syncDraft} />
            <div
              ref={editorRef}
              className="tr-o2-compose-editor tr-o2-card-editor-body"
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-multiline="true"
              aria-label={`Edit ${label.toLowerCase()}`}
              onInput={syncDraft}
              onPaste={(event) => {
                event.preventDefault();
                const html = event.clipboardData.getData('text/html');
                if (html) document.execCommand('insertHTML', false, sanitizeHtml(html));
                else document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
                syncDraft();
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-100)', justifyContent: 'flex-end' }}>
            <TextButton variant="secondary" size="mini" onClick={() => setEditing(false)}>Cancel</TextButton>
            <TextButton variant="primary" size="mini" onClick={saveEdit} disabled={draftEmpty}>Save</TextButton>
          </div>
        </div>
      ) : edits[active] ? (
        <div ref={bodyRef} className="tr-ai-card-content tr-o2-card-body">
          <div className="tr-rich" dangerouslySetInnerHTML={{ __html: edits[active]!.html }} />
          <div style={{ marginBlockStart: 'var(--spacing-100)' }}><Tag variant="gray">Edited by you</Tag></div>
        </div>
      ) : regenerated[active] ? (
        <div ref={bodyRef} className="tr-ai-card-content tr-o2-card-body">
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            {played[active] === regenerated[active]!.at
              ? regenerated[active]!.text
              : <AiGeneratingText key={regenerated[active]!.at} text={regenerated[active]!.text} active />}
          </p>
        </div>
      ) : (
      <div ref={bodyRef} data-fresh={fresh[active]} className="tr-ai-card-content tr-o2-card-body">
        {active === 'summary' && <SummaryBody tab={tab} ticketCode={ticketCode} />}
        {active === 'root-cause' && (
          <RootCauseBody tab={tab} ticketCode={ticketCode} />
        )}
        {active === 'resolution' && resolution && <ResolutionBody note={resolution} ticketCode={ticketCode} />}
      </div>
      )}

      {!pendingActive && <div style={{ marginBlockStart: "var(--spacing-200)" }}><AiFeedbackFooter key={`${active}-${fresh[active] ?? 0}`} /></div>}

      {logBlock}
    </section>
  );
}

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Icon, IconButton, Menu, Select, SplitButton, TextButton } from '@freshworks/dew-components';
import type { Actor, Channel } from '../types';
import { CHANNEL_LABEL, CHANNEL_LOGO, FREDDY_AI_ICON, isChatChannel } from '../details.tokens';
import { composerLayout, isEmailLike, type ComposeMode } from './composerLayout';
import { emailFor, htmlToText, isBlank, textToHtml } from './composerText';
import FormatToolbar from './FormatToolbar';
import RecipientField from './RecipientField';
import { SparkleIcon } from '../AiCardChrome';
import ActorAvatar from '../ActorAvatar';
import { ActionButton } from '../../../../../dewai';
import { useTakeover } from '../../HandOverDialog';

/** The Digit a locked ticket is waiting on. */
const LOCK_DIGIT: Actor = { kind: 'digit', digit: 'ticket-resolver', name: 'Ticket Resolver' };

/**
 * The strip stacked on the dock while the Digit has the ticket ("Ticket
 * Resolver is working on this ticket…"). Off for now: nothing is locked, and
 * the first change asks to take over instead. Kept, switched off, while it's
 * discussed with PM; flip to bring it back.
 */
const SHOW_LOCK_STRIP = false;

/** What a note on an email ticket can be marked as. */
export type NoteKind = 'private' | 'public';

/**
 * Option 2 · the reply dock, and the editor that opens above it.
 *
 * One row of three buttons — Reply, Private note, Ask AI — is both the launcher
 * and the mode switch. It stays put: choosing a button opens that mode's editor
 * above the row, and choosing another switches in place. The editor is closed
 * by the selected button again, Escape, or its × — all of which keep what was
 * typed as a draft (a dot on the button). Cancel is the one thing that
 * discards.
 *
 *   border   2px, to say where the words go: grey for a reply to the
 *            requester, the private note's own orange, purple for Ask AI.
 *   size     One height for all three modes on a ticket, so switching never
 *            rescales the card; the text area gives and takes. Its width is
 *            the conversation cards'.
 *   content  `composerLayout` decides what each mode shows for the ticket's
 *            source: mail rows and a signature only on email and portal
 *            replies, the short toolbar on Slack and Teams, and so on.
 *
 * (Dew's Tabs cannot show "nothing selected", and with none selected leave no
 * tab reachable by keyboard, so this is a toolbar of toggle buttons.)
 *
 * The row reads left to right: the agent's own avatar, then the buttons.
 * While the Digit still has the ticket (`locked`) every button still works:
 * Reply, the note and "Reply using AI" first ask to take the ticket over
 * (`useTakeover`); Ask AI only reads, so it never asks.
 *
 * "Reply using AI" offers contextual drafts for the active ticket.
 * S3 opens with its suggested reply already in the field.
 */

export type { ComposeMode };

/** What goes with a sent message: its recipients, or a note's audience. */
export interface SendDetails extends Partial<Recipients> {
  notify?: string[];
  visibility?: NoteKind;
}

/** Who an email goes to, as the editor's mail rows hold them. */
export interface Recipients {
  to: string[];
  cc: string[];
  bcc: string[];
}

const firstName = (actor: Actor) => actor.name.split(' ')[0];

const LABEL: Record<ComposeMode, (requester: Actor) => string> = {
  reply: (requester) => `Reply to ${requester.name}`,
  forward: () => 'Forward email',
  note: () => 'Private note',
  ask: () => 'Ask AI'
};

const PLACEHOLDER: Record<ComposeMode, (requester: Actor) => string> = {
  reply: (requester) => `Reply to ${firstName(requester)}`,
  forward: () => 'Add a message to the forwarded email',
  note: () => 'Add a private note for agents',
  ask: () => 'Ask Sherpa about this ticket'
};

/* Sample content for the footer's pickers and the email rows. */
const MAILBOXES = [
  { value: 'it', label: 'Freshworks IT <it@acme.freshservice.com>' },
  { value: 'network', label: 'Network Team <network@acme.freshservice.com>' }
];

const CANNED = [
  { value: 'received', label: 'Received your request', text: 'Thanks for getting in touch. We’ve received your request and are looking into it now.' },
  { value: 'screenshot', label: 'Ask for a screenshot', text: 'Could you send a screenshot of the error you’re seeing? It will help us find the cause faster.' },
  { value: 'restart', label: 'Restart and retry', text: 'Please restart your device, then try again and let us know if the problem is still there.' }
];

const SOLUTIONS = [
  { value: 'wifi', label: 'Fix Corp-Secure Wi-Fi certificate errors' },
  { value: 'vpn', label: 'Reconnect to the company VPN' },
  { value: 'reset', label: 'Reset your network password' }
];

const SEND_OPTIONS = [
  { value: 'pending', label: 'Send and Set as Pending' },
  { value: 'resolved', label: 'Send and Set as Resolved' },
  { value: 'closed', label: 'Send and Set as Closed' }
];

const ASK_PROMPTS = ['Why did this fail?', 'Summarize what has happened', 'What should I do next?'];

type ReplySuggestion = 'smart' | 'steps' | 'acknowledge' | 'information' | 'follow-up' | 'close';

function suggestedDraft(kind: ReplySuggestion, requester: Actor, subject: string, ticketCode: string, smartReply?: string) {
  const name = firstName(requester);
  const wifi = ticketCode === 'INC-4127';
  switch (kind) {
    case 'smart': return smartReply || `Hi ${name}, thanks for reaching out about ${subject}. I’m reviewing your ticket and will share the next step as soon as I can.`;
    case 'steps': return wifi
      ? `Hi ${name}, we traced the Corp-Secure Wi-Fi issue to a certificate that didn’t renew on your MacBook. The Network team is assigning the updated Wi-Fi profile. Once they confirm it’s in place, please restart your laptop and rejoin Corp-Secure, then let us know whether Jira loads.`
      : `Hi ${name}, thanks for reporting ${subject}. We’re reviewing the cause and will share specific resolution steps once the checks are complete. Please let us know if the issue changes in the meantime.`;
    case 'acknowledge': return wifi
      ? `Hi ${name}, I understand you’re still on Guest Wi-Fi and can’t reach internal tools. We’re working with the Network team on your Corp-Secure certificate and will update you as soon as the new profile is assigned.`
      : `Hi ${name}, thanks for letting us know about ${subject}. I understand this is disrupting your work. We’re looking into it and will keep you updated.`;
    case 'information': return wifi
      ? `Hi ${name}, could you confirm whether Corp-Secure still shows “Unable to join the network” after a restart? If the message has changed, please send a screenshot. Please stay on Guest Wi-Fi while we finish checking the certificate.`
      : `Hi ${name}, to help us investigate ${subject}, could you share when it last happened, the exact error message or a screenshot, and whether anyone else is affected?`;
    case 'follow-up': return wifi
      ? `Hi ${name}, I’m following up on your Corp-Secure Wi-Fi issue. The Network team has the certificate findings and is working on the updated profile. Are you still able to use Guest Wi-Fi while we complete the fix?`
      : `Hi ${name}, I’m following up on ${subject}. Is the issue still happening, and has anything changed since your last update? We’ll use your reply to guide the next step.`;
    case 'close': return wifi
      ? `Hi ${name}, once the updated Wi-Fi profile is assigned, could you try reconnecting to Corp-Secure and confirm that Jira and your other internal tools work? If everything is back to normal, may we close this ticket?`
      : `Hi ${name}, could you confirm whether ${subject} is now resolved for you? If everything is working, may we close this ticket?`;
  }
}

const NOTE_TITLE: Record<NoteKind, string> = { private: 'Add private note', public: 'Add public note' };

/* The two audiences a note can have, as the product's own menu words them. */
const NOTE_MENU = [
  {
    label: 'Mark note as',
    options: [
      { value: 'private', label: 'Add private note', description: 'Hidden to the customer', prefixIcon: 'Lock' as const },
      { value: 'public', label: 'Add public note', description: 'Visible to the customer', prefixIcon: 'GlobalInternet' as const }
    ]
  }
];

/* The drafts behind Reply's split button, grouped as Copilot's own menu is. */
const REPLY_AI_MENU = [
  { label: 'Insert instantly', options: [{ value: 'smart', label: 'Insert smart reply' }] },
  {
    label: 'Chat with Copilot',
    showDivider: true,
    options: [
      { value: 'steps', label: 'Suggest resolution steps' },
      { value: 'acknowledge', label: 'Acknowledge' },
      { value: 'information', label: 'Request more information' },
      { value: 'follow-up', label: 'Follow up' },
      { value: 'close', label: 'Request confirmation to close' }
    ]
  }
];

const MODE_ICON_NAME = { note: 'Lock' } as const;

function placeCaretAtEnd(el: HTMLElement) {
  el.focus({ preventScroll: true });
  const selection = document.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

export default function ReplyComposer({
  requester,
  agent,
  subject,
  ticketCode,
  source,
  suggested,
  quoted,
  original,
  prefill = false,
  initialMode = 'reply',
  askPrefill,
  open,
  onOpenChange,
  onSend,
  onAskAi,
  onToggleAskPane,
  askPaneOpen = false,
  forward,
  defaults,
  pill,
  onDockHeight,
  locked = false
}: {
  /** Content forwarded from the top card; a new `id` loads it as the reply draft. */
  forward?: { id: number; text: string };
  /** What each editor holds the first time it opens, so any of them can be sent as it is. */
  defaults?: Partial<Record<ComposeMode, string>>;
  requester: Actor;
  /** Who is writing: signs an email reply. */
  agent: Actor;
  subject: string;
  ticketCode: string;
  source: Channel;
  suggested?: string;
  /** The requester's latest message, quoted beneath an email reply. */
  quoted?: { from: string; text: string };
  /** What a forward carries: the email the ticket was created from. */
  original?: { from: string; text: string };
  /** Open with the suggested reply already in the field (S3). */
  prefill?: boolean;
  /** Which editor an open composer starts in. */
  initialMode?: ComposeMode;
  /** A question already typed into Ask AI (S2). */
  askPrefill?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (text: string, mode: ComposeMode, details?: SendDetails) => void;
  /** Ask AI about the ticket: the composer's third mode. Sent as a private
      note; the side pane opens only once the answer arrives. */
  onAskAi?: () => void;
  /** The dock's Ask AI opens and closes the Ask AI pane; it never opens the composer. */
  onToggleAskPane?: () => void;
  askPaneOpen?: boolean;
  /** Floats above the editor and buttons without moving them, e.g. "1 approval pending". */
  pill?: ReactNode;
  /** The dock's current height, so the page knows how much of its bottom is covered. */
  onDockHeight?: (height: number) => void;
  /** The Digit still has the ticket: nothing can be sent until it hands over. */
  locked?: boolean;
}) {
  const chat = isChatChannel(source);
  const replyLabel = chat ? `${CHANNEL_LABEL[source]} Reply` : 'Reply';
  const replyIcon = chat && CHANNEL_LOGO[source] ? CHANNEL_LOGO[source] : undefined;
  /* Email tickets say so with a mail icon, rather than the generic arrow. */
  const replyIconName = source === 'email' ? 'Email' : 'Reply';
  /* A ticket that came in by email can also be forwarded on. */
  const email = source === 'email';
  const modes: ComposeMode[] = [
    'reply',
    ...(email ? (['forward'] as const) : []),
    'note',
    ...(onAskAi ? (['ask'] as const) : [])
  ];

  const [mode, setMode] = useState<ComposeMode>(onAskAi || initialMode !== 'ask' ? initialMode : 'reply');
  /* What was typed, per mode, as HTML, until it is sent or cancelled. */
  const [drafts, setDrafts] = useState<Record<ComposeMode, string>>({
    reply: '',
    forward: '',
    note: '',
    ask: askPrefill ? textToHtml(askPrefill) : ''
  });
  const [prefilled, setPrefilled] = useState(prefill);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [from, setFrom] = useState(MAILBOXES[0].value);
  const [showQuoted, setShowQuoted] = useState(false);
  const requesterEmail = emailFor(requester.name);
  /* A reply goes to the requester unless changed; a forward starts with no one. */
  const blankRecipients = (to: string[]): Recipients => ({ to, cc: [], bcc: [] });
  const [recipients, setRecipients] = useState<{ reply: Recipients; forward: Recipients }>({
    reply: blankRecipients([requesterEmail]),
    forward: blankRecipients([])
  });
  const [noteKind, setNoteKind] = useState<NoteKind>('private');
  const [notify, setNotify] = useState<string[]>([]);
  const [shown, setShown] = useState({ cc: false, bcc: false });
  const mailMode: 'reply' | 'forward' = mode === 'forward' ? 'forward' : 'reply';
  const mail = recipients[mailMode];
  const setMail = (field: keyof Recipients, next: string[]) =>
    setRecipients((current) => ({ ...current, [mailMode]: { ...current[mailMode], [field]: next } }));
  const showCc = shown.cc || mail.cc.length > 0;
  const showBcc = shown.bcc || mail.bcc.length > 0;
  const dockRef = useRef<HTMLDivElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);

  const layout = composerLayout(source, mode);
  const tall = isEmailLike(source);
  const draft = drafts[mode];
  const setDraft = (html: string) => setDrafts((current) => ({ ...current, [mode]: html }));
  const clearDraft = () => setDrafts((current) => ({ ...current, [mode]: '' }));

  const signature = `Kind regards,\n${agent.name}\nIT Support`;

  /* Report the dock's height, so the page can tell when the approval card is
     tucked behind it. */
  useLayoutEffect(() => {
    const dock = dockRef.current;
    if (!dock || !onDockHeight) return;
    const measure = () => onDockHeight(Math.ceil(dock.getBoundingClientRect().height));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(dock);
    return () => observer.disconnect();
  }, [onDockHeight]);

  /* The editor stays mounted so it can ease open; while closed nothing in it
     can be tabbed to. */
  useEffect(() => {
    if (wrapRef.current) wrapRef.current.inert = !open;
  }, [open]);

  /* The text area is editable markup, not a controlled field: it is filled from
     the draft only when they differ — switching modes, a suggestion, a canned
     response — and never while the agent's own typing keeps them equal. */
  useEffect(() => {
    const el = editorRef.current;
    if (el && el.innerHTML !== draft) el.innerHTML = draft;
  }, [mode, draft]);

  const onInput = () => {
    const el = editorRef.current;
    if (!el) return;
    if (isBlank(el.innerHTML)) {
      if (el.innerHTML) el.innerHTML = '';
      setDraft('');
    } else {
      setDraft(el.innerHTML);
    }
  };

  /* "Saved" follows the draft, a beat after the last keystroke. */
  useEffect(() => {
    if (isBlank(draft)) {
      setSaved('idle');
      return;
    }
    setSaved('saving');
    const timer = window.setTimeout(() => setSaved('saved'), 700);
    return () => window.clearTimeout(timer);
  }, [draft, mode]);

  /* Opening or switching while the agent is at the end of the conversation
     keeps the end in view as the editor grows beneath it. */
  const keepEndInView = () => {
    const scroller = dockRef.current?.closest<HTMLElement>('[data-ticket-conversation-scroller]');
    if (!scroller) return;
    const atEnd = scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop < 160;
    if (!atEnd) return;
    const until = performance.now() + 400;
    /* The agent's own scrolling always wins. */
    let following = true;
    const yieldToUser = () => { following = false; };
    scroller.addEventListener('wheel', yieldToUser, { once: true, passive: true });
    scroller.addEventListener('touchstart', yieldToUser, { once: true, passive: true });
    const follow = () => {
      if (!following) return;
      scroller.scrollTop = scroller.scrollHeight;
      if (performance.now() < until) requestAnimationFrame(follow);
      else {
        scroller.removeEventListener('wheel', yieldToUser);
        scroller.removeEventListener('touchstart', yieldToUser);
      }
    };
    requestAnimationFrame(follow);
  };

  const takeover = useTakeover();
  const choose = (next: ComposeMode) => {
    setSuggestionsOpen(false);
    if (open && next === mode) {
      onOpenChange(false);
      return;
    }
    setMode(next);
    const fallback = defaults?.[next];
    if (fallback && isBlank(drafts[next])) {
      setDrafts((current) => ({ ...current, [next]: textToHtml(fallback) }));
    }
    if (!open) keepEndInView();
    onOpenChange(true);
  };

  const close = () => {
    setSuggestionsOpen(false);
    onOpenChange(false);
    /* Hand focus back to the button that opened it. */
    requestAnimationFrame(() => toolbarRef.current?.querySelector<HTMLElement>(`[data-mode="${mode}"]`)?.focus());
  };

  /* Nothing is written while the Digit has the ticket, so an open editor folds away. */
  useEffect(() => {
    if (locked && open) onOpenChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  /* S3's first opening holds the suggestion; every later one starts empty. */
  useEffect(() => {
    if (open && prefilled && suggested) {
      setDrafts((current) => ({ ...current, reply: textToHtml(suggested) }));
      setPrefilled(false);
    }
  }, [open, prefilled, suggested]);

  /* "Forward" on the top card drops its content here as an email draft. */
  useEffect(() => {
    if (!forward) return;
    const target: ComposeMode = modes.includes('forward') ? 'forward' : 'reply';
    setMode(target);
    setDrafts((current) => ({ ...current, [target]: textToHtml(forward.text) }));
    onOpenChange(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forward?.id]);

  useEffect(() => {
    if (open && editorRef.current) placeCaretAtEnd(editorRef.current);
  }, [open, mode]);

  /* Escape closes the editor and keeps the draft. */
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode]);

  const body = htmlToText(draft);

  /* A forward needs someone to go to; its own words are optional. */
  const canSend = mode === 'forward' ? mail.to.length > 0 : Boolean(body);

  const send = () => {
    if (!canSend) return;
    else if (layout.replyToRow) {
      const text = body || 'Forwarded the original email.';
      onSend(layout.signature && body ? `${text}\n\n${signature}` : text, mode, mail);
    } else if (email && mode === 'note') onSend(body, mode, { notify, visibility: noteKind });
    else onSend(layout.signature ? `${body}\n\n${signature}` : body, mode);
    if (email && mode === 'note') setNotify([]);
    clearDraft();
    if (layout.replyToRow) {
      setRecipients((current) => ({ ...current, [mailMode]: blankRecipients(mailMode === 'reply' ? [requesterEmail] : []) }));
      setShown({ cc: false, bcc: false });
    }
    onOpenChange(false);
  };

  const insertSuggestion = (kind: ReplySuggestion) => {
    setDrafts((current) => ({ ...current, reply: textToHtml(suggestedDraft(kind, requester, subject, ticketCode, suggested)) }));
    setMode('reply');
    setSuggestionsOpen(false);
    requestAnimationFrame(() => editorRef.current && placeCaretAtEnd(editorRef.current));
  };

  /* Puts a canned response or an article link where the caret is, or at the end. */
  const insertIntoEditor = (content: string, asHtml = false) => {
    const el = editorRef.current;
    if (!el) return;
    const anchor = document.getSelection()?.anchorNode;
    if (!anchor || !el.contains(anchor)) placeCaretAtEnd(el);
    else el.focus({ preventScroll: true });
    document.execCommand(asHtml ? 'insertHTML' : 'insertText', false, content);
    onInput();
  };

  /* Reply's split button: open the editor with this draft already in it. */
  const replyUsingAi = (kind: ReplySuggestion) => {
    setSuggestionsOpen(false);
    setMode('reply');
    setDrafts((current) => ({ ...current, reply: textToHtml(suggestedDraft(kind, requester, subject, ticketCode, suggested)) }));
    if (!open) keepEndInView();
    onOpenChange(true);
    requestAnimationFrame(() => editorRef.current && placeCaretAtEnd(editorRef.current));
  };

  const startAsk = (prompt: string) => {
    setDrafts((current) => ({ ...current, ask: textToHtml(prompt) }));
    requestAnimationFrame(() => editorRef.current && placeCaretAtEnd(editorRef.current));
  };

  const buttonLabel: Record<ComposeMode, string> = { reply: replyLabel, forward: 'Forward', note: email ? 'Note' : 'Private note', ask: 'Ask AI' };
  const buttonIcon = (m: ComposeMode) =>
    m === 'reply' ? (replyIcon ? { custom: true as const, iconSrc: replyIcon } : replyIconName)
    : m === 'forward' ? ('Forward' as const)
    : m === 'note' ? (email && noteKind === 'public' ? ('GlobalInternet' as const) : MODE_ICON_NAME.note)
    : { custom: true as const, iconSrc: FREDDY_AI_ICON };

  return (
    <div className={`tr-o2-reply-transition${open ? ' is-open' : ''}`}>
      <div ref={dockRef} className="tr-o2-reply-dock">
        {/* Six progressively stronger blur bands behind the buttons. */}
        <div className="tr-o2-reply-dock-blur" aria-hidden>
          <span /><span /><span /><span /><span /><span />
        </div>
        <div className="tr-o2-reply-dock-stack">
          {pill}

          <div ref={wrapRef} className="tr-o2-reply-compose-wrap" aria-hidden={!open}>
            <div className="tr-o2-compose-slot">
            <section className={`tr-o2-compose${tall ? ' is-tall' : ''}`} data-mode={mode} data-note={email && mode === 'note' ? noteKind : undefined} aria-label={LABEL[mode](requester)}>
              <header className="tr-o2-compose-head">
                <span className="tr-o2-compose-title">
                  <span className="tr-o2-compose-title-icon" aria-hidden>
                    {mode === 'reply' ? (
                      replyIcon ? <img src={replyIcon} alt="" /> : <Icon name={replyIconName} size="md" />
                    ) : mode === 'forward' ? (
                      <Icon name="Forward" size="md" />
                    ) : mode === 'note' ? (
                      noteKind === 'public' && email
                        ? <Icon name="GlobalInternet" size="md" color="var(--color-icon-semantic-info)" />
                        : <Icon name="Lock" size="md" color="var(--color-icon-semantic-warning)" />
                    ) : (
                      <span
                        className="tr-o2-compose-title-sparkle"
                        style={{ WebkitMaskImage: `url("${FREDDY_AI_ICON}")`, maskImage: `url("${FREDDY_AI_ICON}")` }}
                      />
                    )}
                  </span>
                  {email && mode === 'note' ? (
                    <Menu
                      aria-label="Mark note as"
                      classNames={{ popup: `tr-o2-note-menu is-${noteKind}` }}
                      options={NOTE_MENU.map((group) => ({
                        ...group,
                        options: group.options.map((option) => ({ ...option, suffixIcon: option.value === noteKind ? ('Tick' as const) : undefined }))
                      }))}
                      onClick={(option) => setNoteKind(option.value as NoteKind)}
                      slots={{
                        trigger: (
                          <button type="button" className="tr-o2-note-kind">
                            {NOTE_TITLE[noteKind]}
                            <Icon name="ChevronDown" size="sm" color="var(--color-icon-secondary)" />
                          </button>
                        )
                      }}
                    />
                  ) : LABEL[mode](requester)}
                </span>
                <IconButton iconName="CrossMedium" aria-label="Close editor, keeping your draft" size="mini" onClick={close} />
              </header>

              {layout.fromRow && (
                <div className="tr-o2-compose-row">
                  <span className="tr-o2-compose-row-label">From</span>
                  <div className="tr-o2-compose-row-field">
                    <Select
                      aria-label="Send from"
                      options={MAILBOXES}
                      value={MAILBOXES.find((box) => box.value === from)}
                      onValueChange={(option) => option && setFrom(String(option.value))}
                    />
                  </div>
                </div>
              )}

              {layout.replyToRow && (
                <>
                  <div className="tr-o2-compose-row">
                    <span className="tr-o2-compose-row-label">{mode === 'forward' ? 'To' : 'Reply to'}</span>
                    <div className="tr-o2-compose-row-field">
                      <RecipientField label={mode === 'forward' ? 'Forward to' : 'Reply to'} value={mail.to} onChange={(next) => setMail('to', next)} />
                    </div>
                    <div className="tr-o2-compose-row-links">
                      <TextButton type="button" variant="link" aria-pressed={showCc} onClick={() => setShown((current) => ({ ...current, cc: !current.cc }))}>Cc</TextButton>
                      <TextButton type="button" variant="link" aria-pressed={showBcc} onClick={() => setShown((current) => ({ ...current, bcc: !current.bcc }))}>Bcc</TextButton>
                    </div>
                  </div>
                  {showCc && (
                    <div className="tr-o2-compose-row">
                      <span className="tr-o2-compose-row-label">Cc</span>
                      <div className="tr-o2-compose-row-field"><RecipientField label="Cc" value={mail.cc} onChange={(next) => setMail('cc', next)} /></div>
                    </div>
                  )}
                  {showBcc && (
                    <div className="tr-o2-compose-row">
                      <span className="tr-o2-compose-row-label">Bcc</span>
                      <div className="tr-o2-compose-row-field"><RecipientField label="Bcc" value={mail.bcc} onChange={(next) => setMail('bcc', next)} /></div>
                    </div>
                  )}
                </>
              )}

              {email && mode === 'note' && (
                <div className="tr-o2-compose-row">
                  <span className="tr-o2-compose-row-label">Notify</span>
                  <div className="tr-o2-compose-row-field">
                    <RecipientField label="Notify" value={notify} onChange={setNotify} placeholder="Add agents or email addresses to notify" />
                  </div>
                </div>
              )}

              {layout.toolbar && <FormatToolbar set={layout.toolbar} editorRef={editorRef} />}

              {/* The one part of the card that gives and takes: everything
                  around it is fixed, so the card never rescales between modes. */}
              <div className="tr-o2-compose-body" onClick={(event) => { if (event.target === event.currentTarget && editorRef.current) placeCaretAtEnd(editorRef.current); }}>
                <div
                  ref={editorRef}
                  className="tr-o2-compose-editor"
                  contentEditable
                  suppressContentEditableWarning
                  role="textbox"
                  aria-multiline="true"
                  aria-label={LABEL[mode](requester)}
                  data-placeholder={PLACEHOLDER[mode](requester)}
                  onInput={onInput}
                  onPaste={(event) => {
                    event.preventDefault();
                    document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) send();
                  }}
                />
                {layout.signature && <div className="tr-o2-compose-signature">{signature}</div>}
                {layout.quoted && (mode === 'forward' ? original ?? quoted : quoted) && (
                  <div className="tr-o2-compose-quoted">
                    {mode !== 'forward' && <button
                      type="button"
                      className="tr-o2-compose-quoted-toggle"
                      aria-expanded={showQuoted}
                      aria-label={showQuoted ? 'Hide the earlier message' : 'Show the earlier message'}
                      onClick={() => setShowQuoted((value) => !value)}
                    >
                      ···
                    </button>}
                    {(showQuoted || mode === 'forward') && (
                      <blockquote className="tr-o2-compose-quote">
                        <span>{mode === 'forward' ? `Forwarded email from ${(original ?? quoted)!.from}:` : `${quoted!.from} wrote:`}</span>
                        {mode === 'forward' ? (original ?? quoted)!.text : quoted!.text}
                      </blockquote>
                    )}
                  </div>
                )}
              </div>

              {/* Always here, so Ask AI keeps the same height; it swaps the
                  writing tools for a few starting questions. */}
              <div className="tr-o2-compose-ai-strip" aria-label={layout.promptChips ? 'Suggested questions' : 'AI writing tools'}>
                <img className="tr-o2-compose-ai-mark" src={FREDDY_AI_ICON} alt="Freddy AI" />
                {layout.promptChips ? (
                  ASK_PROMPTS.map((prompt) => (
                    <TextButton key={prompt} type="button" variant="secondary" onClick={() => startAsk(prompt)}>{prompt}</TextButton>
                  ))
                ) : (
                  <>
                    <span className="tr-o2-compose-ai-inactive"><Icon name="MagicWand" size="sm" />Refine<Icon name="ChevronDown" size="sm" /></span>
                    {mode === 'reply' && (
                      <div className="tr-o2-reply-suggester">
                        <button type="button" className="tr-o2-compose-ai" aria-expanded={suggestionsOpen} aria-haspopup="menu" onClick={() => setSuggestionsOpen((value) => !value)}>
                          <Icon name="Reply" size="sm" />
                          Reply using AI
                          <Icon name={suggestionsOpen ? 'ChevronUp' : 'ChevronDown'} size="sm" color="var(--color-icon-secondary)" />
                        </button>
                        {suggestionsOpen && (
                          <div className="tr-o2-reply-suggester-menu" role="menu" aria-label="Reply using AI" onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); setSuggestionsOpen(false); } }}>
                            <div className="tr-o2-reply-suggester-heading">Insert instantly</div>
                            <div className="tr-o2-reply-suggester-group">
                              <button type="button" role="menuitem" className="tr-o2-reply-suggester-smart" onClick={() => insertSuggestion('smart')}>Insert smart reply <span aria-hidden="true">•</span></button>
                            </div>
                            <div className="tr-o2-reply-suggester-heading">Chat with Copilot</div>
                            <div className="tr-o2-reply-suggester-group">
                              <button type="button" role="menuitem" onClick={() => insertSuggestion('steps')}>Suggest resolution steps</button>
                              <button type="button" role="menuitem" onClick={() => insertSuggestion('acknowledge')}>Acknowledge</button>
                              <button type="button" role="menuitem" onClick={() => insertSuggestion('information')}>Request more information</button>
                              <button type="button" role="menuitem" onClick={() => insertSuggestion('follow-up')}>Follow up</button>
                              <button type="button" role="menuitem" onClick={() => insertSuggestion('close')}>Request confirmation to close</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="tr-o2-compose-foot">
                {/* Pressing these keeps the caret where it was in the text. */}
                <div className="tr-o2-compose-tools" onMouseDown={(event) => event.preventDefault()}>
                  {layout.attach && <IconButton iconName="Attachment" aria-label="Attach a file" size="default" />}
                  {layout.solutions && (
                    <Menu
                      aria-label="Insert a solution article"
                      options={SOLUTIONS}
                      onClick={(option) => insertIntoEditor(`<a href="#">${option.label}</a>`, true)}
                      slots={{ trigger: <IconButton iconName="BookGuide" aria-label="Insert a solution article" size="default" /> }}
                    />
                  )}
                  {layout.canned && (
                    <Menu
                      aria-label="Insert a canned response"
                      options={CANNED}
                      onClick={(option) => insertIntoEditor(CANNED.find((item) => item.value === option.value)?.text ?? '')}
                      slots={{ trigger: <IconButton iconName="CannedResponse" aria-label="Insert a canned response" size="default" /> }}
                    />
                  )}
                </div>
                <span style={{ flex: 1 }} />
                <span className="tr-o2-compose-saved" aria-live="polite">{saved === 'saving' ? 'Saving…' : saved === 'saved' ? 'Saved' : ''}</span>
                <TextButton type="button" variant="secondary" onClick={() => { clearDraft(); close(); }}>
                  Cancel
                </TextButton>
                {layout.sendMenu ? (
                  <SplitButton
                    variant="primary"
                    prefixIcon="Send"
                    options={SEND_OPTIONS}
                    disabled={!canSend}
                    triggerAriaLabel="Send options"
                    onClick={send}
                    onOptionSelect={send}
                  >
                    Send
                  </SplitButton>
                ) : (
                  <TextButton type="button" variant="primary" prefixIcon="Send" disabled={!canSend} onClick={send}>
                    Send
                  </TextButton>
                )}
              </div>
            </section>
            </div>
          </div>

          {/* While the Digit has the ticket, the dock says so in a strip stacked
              on top of it (like a queued message above an input), visible
              from anywhere on the page. */}
          {SHOW_LOCK_STRIP && locked && (
            <div role="status" className="tr-o2-dock-ext">
              <ActorAvatar actor={LOCK_DIGIT} size="xxs" pixelSize={20} />
              <span><strong>{LOCK_DIGIT.name}</strong> is working on this ticket. Pick it up to make changes.</span>
            </div>
          )}

          <div
            ref={toolbarRef}
            className={`tr-o2-reply-dock-actions${SHOW_LOCK_STRIP && locked ? ' has-ext' : ''}`}
            role="toolbar"
            aria-label="Respond to this ticket"
            data-open-mode={open ? mode : undefined}
            data-open-note={open && email && mode === 'note' ? noteKind : undefined}
          >
            <span className="tr-o2-reply-dock-avatar"><ActorAvatar actor={agent} size="sm" /></span>
            {modes.map((m) => {
              const selected = open && mode === m;
              /* Only while every editor is folded, so switching between open
                 editors never makes a dot pop in or out. */
              const hasDraft = !open && !isBlank(drafts[m]);
              const button = (
                <TextButton
                  key={m}
                  type="button"
                  variant="secondary"
                  prefixIcon={buttonIcon(m)}
                  data-mode={m}
                  aria-pressed={selected}
                  aria-label={hasDraft ? `${buttonLabel[m]}, draft saved` : undefined}
                  onClick={() => (m === 'ask' ? onAskAi?.() : takeover(() => choose(m)))}
                >
                  {buttonLabel[m]}
                  {hasDraft && <span className="tr-o2-draft-dot" aria-hidden />}
                </TextButton>
              );
              /* Ask AI is the AI Design System's action button (from the
                 reference build). It only reads, so it stays live while locked,
                 and it opens and closes the Ask AI pane. */
              if (m === 'ask') {
                return (
                  <ActionButton
                    key={m}
                    label="Ask AI"
                    icon={<SparkleIcon size="sm" />}
                    active={askPaneOpen}
                    onClick={() => (onToggleAskPane ? onToggleAskPane() : onAskAi?.())}
                  />
                );
              }
              if (m !== 'reply') return button;
              /* Reply is a split button: the main part opens the editor, the
                 chevron offers drafts to start from. */
              return (
                <div key={m} className={`tr-o2-split${selected ? ' is-selected' : ''}`}>
                  {button}
                  <Menu
                    aria-label="Reply using AI"
                    options={REPLY_AI_MENU}
                    onClick={(option) => takeover(() => replyUsingAi(option.value as ReplySuggestion))}
                    slots={{
                      trigger: (
                        <TextButton type="button" variant="secondary" aria-label="Reply using AI">
                          <SparkleIcon size="sm" />
                        </TextButton>
                      )
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

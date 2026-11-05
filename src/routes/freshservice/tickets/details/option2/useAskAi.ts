import { useCallback, useEffect, useRef, useState } from 'react';
import type { Actor, MessageNode } from '../types';
import { AI_FOLLOW_UPS, ASK_NOTE, ASK_THREAD, type ScenarioId, type ThreadMessage } from './scenarios';

/**
 * Option 2 · Ask AI, a new pattern (21 Oct review).
 *
 * Ask AI is offered on private notes and on what the AI generated, never on a
 * public reply. Asking opens a thread in the side pane, in place of
 * Properties. The first question also lands in the main conversation as the
 * agent's private note, carrying a reply count; the back-and-forth itself
 * stays in the side pane so the conversation does not fill with it.
 *
 * Answers are canned — the prototype has no model behind it.
 */

export interface AskThread {
  id: string;
  /** What the thread is about: "Root cause", "Jordan Reyes's note". */
  about: string;
  /** What it was asked from: an artifact entry, the top card, a note. */
  anchorId?: string;
  /** The private note in the main pane, once the first question is sent. */
  note?: MessageNode;
  /** Started from an existing note, so every message is a reply to it. */
  seeded?: boolean;
  messages: ThreadMessage[];
}

export interface AskAi {
  threads: AskThread[];
  openThread?: AskThread;
  pending: boolean;
  /**
   * Start (or reopen) a thread about something on the page. Asking from a
   * private note threads off that note rather than adding a second one.
   */
  ask: (about: string, options?: { anchorId?: string; note?: MessageNode }) => void;
  open: (threadId: string) => void;
  send: (text: string) => void;
  /**
   * Ask from the bottom composer: the question lands as a private note at
   * once, and the side pane opens only when the answer arrives.
   */
  askFromComposer: (text: string) => void;
  /** Open the side pane on the running ticket conversation, empty if there is none yet. */
  openPanel: () => void;
  /** Bumps every time the pane is asked for, so it can focus its text box again. */
  focusKey: number;
  close: () => void;
}

function presetThreads(scenario: ScenarioId): AskThread[] {
  /* S2 starts before the question is asked; S3 and S4 come after it. */
  if (!['3', '4'].includes(scenario)) return [];
  return [{ id: ASK_NOTE.id, about: 'Root cause', anchorId: 'card-root-cause', note: ASK_NOTE, messages: ASK_THREAD }];
}

export default function useAskAi(scenario: ScenarioId, viewer: Actor, enabled: boolean): AskAi {
  const [threads, setThreads] = useState<AskThread[]>(() => (enabled ? presetThreads(scenario) : []));
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [focusKey, setFocusKey] = useState(0);
  const answered = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  /* A different scenario is a different moment in the story: start over. */
  useEffect(() => {
    setThreads(enabled ? presetThreads(scenario) : []);
    setOpenId(null);
    setPending(false);
    answered.current = 0;
    window.clearTimeout(timer.current);
  }, [scenario, enabled]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const ask = useCallback((about: string, { anchorId, note }: { anchorId?: string; note?: MessageNode } = {}) => {
    const key = note?.id ?? anchorId;
    const existing = key ? threads.find((thread) => thread.anchorId === key || thread.note?.id === key) : undefined;
    if (existing) {
      setOpenId(existing.id);
      return;
    }
    const id = `o2-ask-${Date.now()}`;
    setThreads((current) => [...current, { id, about, anchorId: key, note, seeded: Boolean(note), messages: [] }]);
    setOpenId(id);
  }, [threads]);

  /* Adds the agent's question to a thread, then answers it after a beat.
     The answer opens that thread in the side pane. */
  const sendTo = useCallback((threadId: string, text: string, fresh?: AskThread) => {
    const body = text.trim();
    if (!body) return;
    const at = new Date().toISOString();
    setThreads((current) => (fresh ? [...current, fresh] : current).map((thread) => {
      if (thread.id !== threadId) return thread;
      const note: MessageNode | undefined = thread.note ?? {
        kind: 'message',
        id: `${thread.id}-note`,
        at,
        actor: viewer,
        variant: 'private-note',
        channel: 'portal',
        body: [body]
      };
      return { ...thread, note, messages: [...thread.messages, { id: `${thread.id}-${thread.messages.length}`, from: 'agent', at, body }] };
    }));
    setPending(true);
    setOpenId(threadId);
    timer.current = window.setTimeout(() => {
      const reply = AI_FOLLOW_UPS[answered.current % AI_FOLLOW_UPS.length];
      answered.current += 1;
      setThreads((current) => current.map((thread) => thread.id === threadId
        ? { ...thread, messages: [...thread.messages, { id: `${thread.id}-${thread.messages.length}`, from: 'ai', at: new Date().toISOString(), body: reply }] }
        : thread));
      setPending(false);
      setOpenId(threadId);
    }, 1400);
  }, [viewer]);

  const send = useCallback((text: string) => {
    if (openId) sendTo(openId, text);
  }, [openId, sendTo]);

  const askFromComposer = useCallback((text: string) => {
    const id = `o2-ask-${Date.now()}`;
    sendTo(id, text, { id, about: 'This ticket', anchorId: 'ticket', messages: [] });
  }, [sendTo]);

  const openPanel = useCallback(() => {
    setFocusKey((key) => key + 1);
    if (openId) return;
    const last = threads[threads.length - 1];
    if (last) {
      setOpenId(last.id);
      return;
    }
    const id = 'o2-ask-ticket';
    setThreads([{ id, about: 'This ticket', anchorId: 'ticket', messages: [] }]);
    setOpenId(id);
  }, [openId, threads]);

  return {
    threads,
    openThread: threads.find((thread) => thread.id === openId),
    pending,
    ask,
    open: setOpenId,
    send,
    askFromComposer,
    openPanel,
    focusKey,
    close: () => setOpenId(null)
  };
}

/** "3 replies" — everything after the question that opened the thread. */
export function replyCount(thread: AskThread): number {
  return thread.seeded ? thread.messages.length : Math.max(0, thread.messages.length - 1);
}

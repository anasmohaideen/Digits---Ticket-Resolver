import { DIGIT_AVATAR } from '../details.tokens';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import {
  AIResponse,
  AiInputBox,
  CHIP_LOADING_MS,
  MORPH_MS,
  PromptSuggestions,
  REDUCED_MOTION_LOADING_MS,
  SliderContainer,
  UserMessage,
  WelcomeContent,
  sliderStyles,
  userMorphLayoutProps,
  type PromptSelection
} from '../../../../../dewai';
import type { Actor } from '../types';
import type { AskAi } from './useAskAi';

const PROMPTS = ['Why did this fail?', 'Summarize what has happened', 'What should I do next?'];

/**
 * Ask AI, built from the AI Design System's slider: Slider Container chrome
 * (Dew AI wordmark, new conversation, minimize, close), the welcome block, prompt
 * suggestions and the AI input box, with AI Response and User Message in the thread.
 */
export default function AskAiPanel({ askAi, viewer }: { askAi: AskAi; viewer: Actor }) {
  const thread = askAi.openThread;
  const reduceMotion = useReducedMotion() ?? false;
  const [draft, setDraft] = useState('');
  const [minimized, setMinimized] = useState(false);
  const [selection, setSelection] = useState<PromptSelection | null>(null);
  const timers = useRef<number[]>([]);
  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  useEffect(() => {
    setDraft('');
    setMinimized(false);
    setSelection(null);
    clearTimers();
  }, [thread?.id]);
  useEffect(() => clearTimers, []);

  if (!thread) return null;

  const empty = thread.messages.length === 0;
  const submit = (text = draft) => {
    if (!text.trim() || askAi.pending) return;
    askAi.send(text);
    setDraft('');
  };
  /* A suggestion loads on its chip, then morphs into your message. */
  const selectPrompt = (prompt: string) => {
    if (selection) return;
    setSelection({ prompt, stage: 'chip-loading' });
    if (reduceMotion) {
      timers.current.push(window.setTimeout(() => { setSelection(null); submit(prompt); }, REDUCED_MOTION_LOADING_MS));
      return;
    }
    timers.current.push(
      window.setTimeout(() => {
        setSelection({ prompt, stage: 'morphing' });
        submit(prompt);
        timers.current.push(window.setTimeout(() => setSelection(null), MORPH_MS + 120));
      }, CHIP_LOADING_MS)
    );
  };
  const morphPrompt = selection?.stage === 'morphing' ? selection.prompt : null;
  const showPrompts = (empty || selection != null) && !minimized;
  const lastAiId = [...thread.messages].reverse().find((message) => message.from === 'ai')?.id;

  return (
    <LayoutGroup id="ai-slider-prompt-morph">
      <SliderContainer
        className="tr-o2-ai-slider"
        aria-label="Agent Concierge"
        title="Agent Concierge"
        titleIcon={DIGIT_AVATAR['workplace-concierge']}
        state={minimized ? 'minimize' : 'default'}
        showGlow
        glowKey={thread.id.length}
        showNewConversation
        newConversationDisabled={empty}
        onNewConversation={() => askAi.ask('This ticket', { anchorId: `ticket-${Date.now()}` })}
        onMinimize={() => setMinimized((value) => !value)}
        onClose={askAi.close}
        footer={
          minimized ? undefined : (
            <div className={sliderStyles.footerStack}>
              <AnimatePresence initial={false}>
                {showPrompts && (
                  <motion.div
                    key="prompt-suggestions"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <PromptSuggestions prompts={PROMPTS} selection={selection} onSelectPrompt={selectPrompt} reduceMotion={reduceMotion} />
                  </motion.div>
                )}
              </AnimatePresence>
              <AiInputBox
                value={draft}
                onChange={setDraft}
                onSend={() => submit()}
                placeholder="Ask me anything"
                showDisclaimer
                state={askAi.pending ? 'thinking' : undefined}
              />
            </div>
          )
        }
      >
        {!minimized && (
          <>
            {empty && selection == null && <WelcomeContent userName={viewer.name.split(' ')[0]} introKey={thread.id.length} />}
            {!empty && (
              <div className={sliderStyles.conversationStack} aria-live="polite">
                {thread.messages.map((message) => {
                  if (message.from === 'ai') {
                    return (
                      <motion.div key={message.id} initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: morphPrompt ? MORPH_MS / 1000 + 0.1 : 0 }}>
                        <AIResponse showSources={false} isLatest={message.id === lastAiId}>
                          <p className="tr-o2-ai-text">{message.body}</p>
                        </AIResponse>
                      </motion.div>
                    );
                  }
                  const morph = userMorphLayoutProps(morphPrompt, message.body, reduceMotion, () => setSelection(null));
                  return (
                    <motion.div key={message.id} {...morph}>
                      <UserMessage message={message.body} senderName="You" showActions={false} isLatest />
                    </motion.div>
                  );
                })}
                {askAi.pending && (
                  <AIResponse state="loading" thinkingText="Thinking…" showSources={false} isLatest />
                )}
              </div>
            )}
          </>
        )}
      </SliderContainer>
    </LayoutGroup>
  );
}

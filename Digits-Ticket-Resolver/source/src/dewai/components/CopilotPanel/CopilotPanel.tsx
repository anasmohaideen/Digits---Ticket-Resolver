import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { AiInputBox } from '../dew/AiInputBox/AiInputBox'
import { AIResponse } from '../dew/AIResponse/AIResponse'
import { AiGeneratingText } from '../dew/AiGeneratingText/AiGeneratingText'
import { Button } from '../dew/Button/Button'
import { UserMessage } from '../dew/UserMessage/UserMessage'
import { SliderContainer } from '../dew/SliderContainer/SliderContainer'
import { PlusIcon } from '../dew/shared/IllustrationIcons'
import type { CopilotAssistantMessage, CopilotMessage, CopilotPanelProps } from '../../features/reply-editor/types'
import styles from './CopilotPanel.module.css'

function isLatestDoneAssistant(messages: CopilotMessage[], message: CopilotAssistantMessage) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const current = messages[index]
    if (current.role === 'assistant') {
      return current.id === message.id && current.status === 'done'
    }
  }
  return false
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    /* clipboard may be unavailable in some environments */
  }
}

const ENTER_EASE = [0.25, 1, 0.5, 1] as const

function scrollThreadToEndIfNeeded(endNode: HTMLElement | null) {
  const scroller = endNode?.parentElement
  if (!scroller || !endNode) return
  if (scroller.scrollHeight <= scroller.clientHeight) return
  endNode.scrollIntoView({ block: 'end', behavior: 'auto' })
}

export function CopilotPanel({
  className = '',
  open,
  state = 'default',
  messages,
  inputQuotedText,
  prompt,
  isGenerating,
  clearConversationDisabled = true,
  inputAutoFocus = false,
  showGlow = false,
  glowKey = 0,
  onGlowEnd,
  onPromptChange,
  onGenerate,
  onStop,
  onRegenerate,
  onAccept,
  onMinimize,
  onClearConversation,
  onClose,
}: CopilotPanelProps) {
  const reduceMotion = useReducedMotion() ?? false
  const [accepting, setAccepting] = useState(false)
  const acceptTimerRef = useRef<number | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(
    () => () => {
      if (acceptTimerRef.current !== null) window.clearTimeout(acceptTimerRef.current)
    },
    [],
  )

  useEffect(() => {
    if (!open) setAccepting(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    let followUp: number | undefined
    let innerFrame = 0
    const outerFrame = window.requestAnimationFrame(() => {
      innerFrame = window.requestAnimationFrame(() => {
        if (cancelled) return
        scrollThreadToEndIfNeeded(endRef.current)
        if (!reduceMotion) {
          followUp = window.setTimeout(() => {
            if (!cancelled) scrollThreadToEndIfNeeded(endRef.current)
          }, 220)
        }
      })
    })
    return () => {
      cancelled = true
      window.cancelAnimationFrame(outerFrame)
      window.cancelAnimationFrame(innerFrame)
      if (followUp != null) window.clearTimeout(followUp)
    }
  }, [open, messages, isGenerating, reduceMotion])

  if (!open) return null

  const hasThread = messages.length > 0
  const latestDoneAssistant = [...messages]
    .reverse()
    .find((message): message is CopilotAssistantMessage => message.role === 'assistant' && message.status === 'done')
  const canAccept = !isGenerating && !accepting && Boolean(latestDoneAssistant?.text.trim())

  const handleAccept = () => {
    if (!canAccept) return
    setAccepting(true)
    if (acceptTimerRef.current !== null) window.clearTimeout(acceptTimerRef.current)
    acceptTimerRef.current = window.setTimeout(() => {
      acceptTimerRef.current = null
      onAccept()
    }, reduceMotion ? 0 : 220)
  }

  const turnTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: ENTER_EASE }

  return (
    <SliderContainer
      className={[styles.panel, className].filter(Boolean).join(' ')}
      aria-label="Agent Concierge"
      state={state}
      showGlow={showGlow && state === 'default'}
      glowKey={glowKey}
      onGlowEnd={onGlowEnd}
      showNewConversation
      newConversationDisabled={clearConversationDisabled}
      onNewConversation={onClearConversation}
      onMinimize={onMinimize}
      onClose={onClose}
      footer={
        <AiInputBox
          value={prompt}
          quotedText={inputQuotedText}
          quoteVariant="chip"
          autoFocus={inputAutoFocus}
          placeholder="Ask me anything"
          showDisclaimer
          state={isGenerating ? 'thinking' : undefined}
          onChange={onPromptChange}
          onSend={onGenerate}
          onStop={onStop}
        />
      }
    >
      <div className={styles.thread}>
        {!hasThread && (
          <p className={styles.hint}>
            Add instructions below to rewrite the selected text from your reply.
          </p>
        )}

        {messages.map((message, index) => {
          const staggerDelay = reduceMotion ? 0 : Math.min(index, 6) * 0.04
          const turnMotion = {
            initial: reduceMotion ? false : { opacity: 0, y: 6 },
            animate: { opacity: 1, y: 0 },
            transition: { ...turnTransition, delay: staggerDelay },
          } as const

          if (message.role === 'user') {
            return (
              <motion.div key={message.id} {...turnMotion}>
                <UserMessage
                  message={message.prompt}
                  quotedText={message.quotedText}
                  senderName="You"
                  showActions={false}
                  isLatest
                />
              </motion.div>
            )
          }

          if (message.status === 'loading') {
            return (
              <motion.div key={message.id} {...turnMotion}>
                <AIResponse
                  state="loading"
                  thinkingText="Rewriting your selection…"
                  showSources={false}
                  loadingSparkleRotation="full"
                  isLatest
                />
              </motion.div>
            )
          }

          const showActions = isLatestDoneAssistant(messages, message)

          return (
            <motion.div key={message.id} {...turnMotion}>
              <AIResponse
                showSources={false}
                onCopy={() => void copyText(message.text)}
                onRetry={showActions ? onRegenerate : undefined}
                isLatest
              >
                <div className={styles.rewriteBody}>
                  <p className={styles.rewriteIntro}>
                    Here&apos;s the <strong>refined</strong> version:
                  </p>
                  <hr className={styles.divider} />
                  <p className={styles.rewriteText}>
                    <AiGeneratingText key={message.id} text={message.text} active />
                  </p>
                  {showActions && (
                    <>
                      <Button
                        variant="primary"
                        prefixIcon={<PlusIcon className={styles.addIcon} />}
                        className={styles.addToComposerBtn}
                        disabled={!canAccept && !accepting}
                        onClick={handleAccept}
                      >
                        {accepting ? 'Added' : 'Add to composer'}
                      </Button>
                      <hr className={styles.divider} />
                      <p className={styles.rewriteFollowUp}>
                        Would you like me to generate a concise or elaborated version of this draft?
                      </p>
                    </>
                  )}
                </div>
              </AIResponse>
            </motion.div>
          )
        })}
        <div ref={endRef} aria-hidden="true" />
      </div>
    </SliderContainer>
  )
}

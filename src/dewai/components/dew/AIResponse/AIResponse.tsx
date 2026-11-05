import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { IconButton } from '../IconButton/IconButton'
import { SparkleThinkingLogo } from '../SparkleThinkingLogo/SparkleThinkingLogo'
import {
  CopyIcon,
  DownvoteIcon,
  ErrorIcon,
  RefreshIcon,
  ShareIcon,
  SourcesIcon,
  UpvoteIcon,
} from '../shared/IllustrationIcons'
import { useHoverMotion } from '../../../providers/HoverMotionProvider'
import { useThinkingTextClass } from '../../ActionBanner/useThinkingTextClass'
import {
  AiGeneratingText,
  GeneratingActivityProvider,
} from '../AiGeneratingText/AiGeneratingText'
import styles from './AIResponse.module.css'

export type AIResponseState = 'default' | 'hover' | 'loading' | 'error' | 'error-hover'

export interface AIResponseProps {
  text?: string
  thinkingText?: string
  errorMessage?: string
  timestamp?: string
  showSources?: boolean
  /** Controlled visual state override */
  state?: AIResponseState
  children?: ReactNode
  onPointerEnter?: () => void
  onPointerLeave?: () => void
  onLike?: () => void
  onDislike?: () => void
  onCopy?: () => void
  onRetry?: () => void
  onShare?: () => void
  /** Main sparkle rotation while loading — Copilot uses full 360° spin. */
  loadingSparkleRotation?: 'think' | 'full'
  /**
   * Latest turn in a thread keeps the toolbar visible. Prior turns recede it
   * until hover or focus. Standalone usage defaults to latest.
   */
  isLatest?: boolean
}

function ReplySparkle({
  loadingSparkleRotation,
}: {
  loadingSparkleRotation: 'think' | 'full'
}) {
  return (
    <span className={styles.iconSlot} aria-hidden="true">
      <SparkleThinkingLogo
        size={20}
        fitSize={20}
        animation="loop"
        rotate={loadingSparkleRotation}
        tone="mono"
      />
    </span>
  )
}

function CopiedCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.25L6.5 11.25L12.5 4.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AIResponse({
  text = 'Your report is currently under review by the team. We expect to have feedback ready for you by the end of the day.',
  thinkingText = 'Analysing the content',
  errorMessage = 'An error occurred while generating the AI response. Please try again later.',
  timestamp = 'Just now',
  showSources = true,
  state,
  children,
  onPointerEnter,
  onPointerLeave,
  onLike,
  onDislike,
  onCopy,
  onRetry,
  onShare,
  loadingSparkleRotation = 'think',
  isLatest = true,
}: AIResponseProps) {
  const { hoverMotion, isTonedChrome } = useHoverMotion()
  const thinkingTextClass = useThinkingTextClass()
  const [isHovered, setIsHovered] = useState(false)
  const [copied, setCopied] = useState(false)
  const copiedTimerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (copiedTimerRef.current !== null) window.clearTimeout(copiedTimerRef.current)
    },
    [],
  )

  const visualState: AIResponseState = (() => {
    if (state === 'error' && isHovered) return 'error-hover'
    if (state) return state
    return isHovered ? 'hover' : 'default'
  })()

  const isError = visualState === 'error' || visualState === 'error-hover'
  const isLoading = visualState === 'loading'
  const showActions = isTonedChrome ? true : visualState === 'hover' || visualState === 'error-hover'

  const handleBubbleEnter = (_event: PointerEvent<HTMLDivElement>) => {
    setIsHovered(true)
    onPointerEnter?.()
  }

  const handleBubbleLeave = () => {
    setIsHovered(false)
    onPointerLeave?.()
  }

  const bubbleClass = [
    styles.bubble,
    isError ? styles.bubbleError : '',
    isLoading ? styles.bubbleLoading : '',
  ]
    .filter(Boolean)
    .join(' ')
  const rowClass = styles.messageRow

  const actionsClass = [
    styles.actions,
    isLoading ? (isTonedChrome ? styles.actionsHidden : styles.actionsLoading) : '',
    isTonedChrome && isError ? styles.actionsError : '',
    !isTonedChrome && !showActions ? styles.actionsHidden : '',
  ]
    .filter(Boolean)
    .join(' ')

  const handleCopy = () => {
    onCopy?.()
    setCopied(true)
    if (copiedTimerRef.current !== null) window.clearTimeout(copiedTimerRef.current)
    copiedTimerRef.current = window.setTimeout(() => {
      setCopied(false)
      copiedTimerRef.current = null
    }, 1000)
  }

  const bodyContent = children ?? (
    <p
      className={[
        styles.text,
        isError ? styles.textError : '',
        isLoading ? `${styles.textLoading} ${thinkingTextClass}` : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isError ? (
        errorMessage
      ) : isLoading ? (
        thinkingText
      ) : (
        <AiGeneratingText key={text} text={text} active />
      )}
    </p>
  )

  const copyButton = (
    <IconButton
      label={copied ? 'Copied' : isError ? 'Copy error message' : 'Copy response'}
      tone={isTonedChrome ? 'secondary' : 'default'}
      className={styles.actionButton}
      style={copied ? { color: 'var(--color-text-success)' } : undefined}
      onClick={handleCopy}
    >
      {copied ? (
        <CopiedCheckIcon className={styles.actionIcon} />
      ) : (
        <CopyIcon className={styles.actionIcon} />
      )}
    </IconButton>
  )

  return (
    <GeneratingActivityProvider>
    <article
      className={styles.root}
      data-state={visualState}
      data-motion={hoverMotion}
      data-latest={isLatest ? 'true' : 'false'}
      onPointerEnter={handleBubbleEnter}
      onPointerLeave={handleBubbleLeave}
    >
      <div className={[styles.bubbleWrap, isLoading ? styles.bubbleWrapLoading : ''].filter(Boolean).join(' ')}>
        <div className={bubbleClass}>
          <div className={rowClass}>
            {isError ? (
              <span className={styles.errorIconSlot} aria-hidden="true">
                <ErrorIcon className={isTonedChrome ? styles.errorIcon : styles.actionIcon} />
              </span>
            ) : isLoading ? (
              <ReplySparkle loadingSparkleRotation={loadingSparkleRotation} />
            ) : null}
            {bodyContent}
          </div>
        </div>
      </div>

      <footer className={actionsClass} aria-hidden={isLoading || undefined}>
        {isTonedChrome ? (
          !isError ? (
            <>
              <span className={styles.timestamp}>{timestamp}</span>
              <div className={styles.actionButtons}>
                <IconButton
                  label="Like response"
                  tone="secondary"
                  className={styles.actionButton}
                  onClick={onLike}
                >
                  <UpvoteIcon className={styles.actionIcon} />
                </IconButton>
                <IconButton
                  label="Dislike response"
                  tone="secondary"
                  className={styles.actionButton}
                  onClick={onDislike}
                >
                  <DownvoteIcon className={styles.actionIcon} />
                </IconButton>
                {copyButton}
                <IconButton
                  label="Retry response"
                  tone="secondary"
                  className={styles.actionButton}
                  onClick={onRetry}
                >
                  <RefreshIcon className={styles.actionIcon} />
                </IconButton>
              </div>
              {showSources && (
                <span className={styles.sourcesTag}>
                  <SourcesIcon className={styles.sourcesIcon} />
                  Sources
                </span>
              )}
            </>
          ) : (
            <>
              <div className={styles.actionButtons}>
                {copyButton}
                <IconButton
                  label="Retry response"
                  tone="secondary"
                  className={styles.actionButton}
                  onClick={onRetry}
                >
                  <RefreshIcon className={styles.actionIcon} />
                </IconButton>
                <IconButton
                  label="Support"
                  tone="secondary"
                  className={styles.actionButton}
                  onClick={onShare}
                >
                  <ShareIcon className={styles.actionIcon} />
                </IconButton>
              </div>
              <span className={styles.timestamp}>{timestamp}</span>
            </>
          )
        ) : !isError ? (
          <>
            <IconButton label="Like response" className={styles.actionButton} onClick={onLike}>
              <UpvoteIcon className={styles.actionIcon} />
            </IconButton>
            <IconButton label="Dislike response" className={styles.actionButton} onClick={onDislike}>
              <DownvoteIcon className={styles.actionIcon} />
            </IconButton>
            <IconButton label="Copy response" className={styles.actionButton} onClick={onCopy}>
              <CopyIcon className={styles.actionIcon} />
            </IconButton>
            <IconButton label="Retry response" className={styles.actionButton} onClick={onRetry}>
              <RefreshIcon className={styles.actionIcon} />
            </IconButton>
            {showSources && (
              <span className={styles.sourcesTag}>
                <SourcesIcon className={styles.sourcesIcon} />
                Sources
              </span>
            )}
            <span className={styles.timestamp}>{timestamp}</span>
          </>
        ) : (
          <>
            <IconButton label="Copy error message" className={styles.actionButton} onClick={onCopy}>
              <CopyIcon className={styles.actionIcon} />
            </IconButton>
            <IconButton label="Retry response" className={styles.actionButton} onClick={onRetry}>
              <RefreshIcon className={styles.actionIcon} />
            </IconButton>
            <IconButton label="Support" className={styles.actionButton} onClick={onShare}>
              <ShareIcon className={styles.actionIcon} />
            </IconButton>
            <span className={styles.timestamp}>{timestamp}</span>
          </>
        )}
      </footer>
    </article>
    </GeneratingActivityProvider>
  )
}

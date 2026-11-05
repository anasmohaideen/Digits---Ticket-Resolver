import { useEffect, type ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import { DewAiIcon } from '../DewAiIcon/DewAiIcon'
import { IconButton } from '../IconButton/IconButton'
import {
  CrossLargeIcon,
  ExpandIcon,
  MinimizeIcon,
  NewConversationIcon,
} from '../shared/IllustrationIcons'
import { isMotionLikeMotion, useHoverMotion } from '../../../providers/HoverMotionProvider'
import styles from './SliderContainer.module.css'

/** Hold hover chrome through panel fade-in, then opacity-settle (~200ms + 900ms). */
const ENTER_CHROME_MS = 1100
const LEGACY_GLOW_MS = 2400

export type SliderContainerState = 'default' | 'minimize'

export interface SliderContainerProps {
  state?: SliderContainerState
  showGlow?: boolean
  glowKey?: number
  onGlowEnd?: () => void
  showNewConversation?: boolean
  newConversationDisabled?: boolean
  onNewConversation?: () => void
  onMinimize?: () => void
  onClose?: () => void
  children?: ReactNode
  footer?: ReactNode
  className?: string
  'aria-label'?: string
  /** Header name; the Dew AI wordmark when omitted. */
  title?: string
  titleIcon?: string
}

function SliderEnterEffect({
  active,
  durationMs,
  onEnd,
  children,
}: {
  active: boolean
  durationMs: number
  onEnd?: () => void
  children?: ReactNode
}) {
  useEffect(() => {
    if (!active) return
    const timer = window.setTimeout(() => onEnd?.(), durationMs)
    return () => window.clearTimeout(timer)
  }, [active, durationMs, onEnd])

  if (!active) return null
  return <>{children}</>
}

function SliderHeader({
  title,
  titleIcon,
  minimized,
  showNewConversation = true,
  newConversationDisabled = false,
  onNewConversation,
  onMinimize,
  onClose,
}: {
  title?: string
  titleIcon?: string
  minimized?: boolean
  showNewConversation?: boolean
  newConversationDisabled?: boolean
  onNewConversation?: () => void
  onMinimize?: () => void
  onClose?: () => void
}) {
  return (
    <header className={styles.header}>
      <DewAiIcon size={20} bg="dew" showName showDewLogo={false} title={title} titleIcon={titleIcon} />
      <div className={styles.headerActions}>
        {!minimized && showNewConversation && (
          <IconButton
            label="New conversation"
            tone="default"
            className={styles.headerAction}
            disabled={newConversationDisabled}
            onClick={onNewConversation}
          >
            <NewConversationIcon className={styles.headerIcon} />
          </IconButton>
        )}
        <IconButton
          label={minimized ? 'Expand' : 'Minimize'}
          tone="default"
          className={styles.headerAction}
          onClick={onMinimize}
        >
          {minimized ? (
            <ExpandIcon className={styles.headerIcon} />
          ) : (
            <MinimizeIcon className={styles.headerIcon} />
          )}
        </IconButton>
        <IconButton label="Close" tone="default" className={styles.headerAction} onClick={onClose}>
          <CrossLargeIcon className={styles.headerIcon} />
        </IconButton>
      </div>
    </header>
  )
}

export function SliderContainer({
  state = 'default',
  showGlow = false,
  glowKey = 0,
  onGlowEnd,
  showNewConversation = true,
  newConversationDisabled = false,
  onNewConversation,
  onMinimize,
  onClose,
  children,
  footer,
  className = '',
  'aria-label': ariaLabel = 'Freshworks AI',
  title,
  titleIcon,
}: SliderContainerProps) {
  const isMinimized = state === 'minimize'
  const { hoverMotion } = useHoverMotion()
  const reduceMotion = useReducedMotion() ?? false
  const useHoverEnterChrome = isMotionLikeMotion(hoverMotion) && !reduceMotion
  const enterActive = showGlow && !isMinimized && !reduceMotion

  return (
    <aside
      className={[
        styles.container,
        isMinimized && styles.isMinimized,
        enterActive && useHoverEnterChrome && styles.enterChrome,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel}
      data-state={state}
    >
      {!isMinimized && (
        <SliderEnterEffect
          key={glowKey}
          active={enterActive}
          durationMs={useHoverEnterChrome ? ENTER_CHROME_MS : LEGACY_GLOW_MS}
          onEnd={onGlowEnd}
        >
          {useHoverEnterChrome ? (
            <div className={styles.enterChromeOverlay} aria-hidden="true" />
          ) : (
            <>
              <div className={styles.glowBorder} aria-hidden="true" />
              <div className={styles.glowAmbient} aria-hidden="true">
                <div className={styles.glowTop} />
                <div className={styles.glowBottom} />
              </div>
            </>
          )}
        </SliderEnterEffect>
      )}
      <SliderHeader
        title={title}
        titleIcon={titleIcon}
        minimized={isMinimized}
        showNewConversation={showNewConversation}
        newConversationDisabled={newConversationDisabled}
        onNewConversation={onNewConversation}
        onMinimize={onMinimize}
        onClose={onClose}
      />
      <div className={styles.body} aria-hidden={isMinimized}>
        {children ? <div className={styles.content}>{children}</div> : null}
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </aside>
  )
}

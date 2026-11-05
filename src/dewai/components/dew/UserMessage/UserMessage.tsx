import { useState, type PointerEvent } from 'react'
import { IconButton } from '../IconButton/IconButton'
import { AiInputQuoteChip } from '../AiInputBox/AiInputQuoteChip'
import { CopyIcon, EditIcon } from '../shared/IllustrationIcons'
import { useHoverMotion } from '../../../providers/HoverMotionProvider'
import styles from './UserMessage.module.css'

export type UserMessageState = 'default' | 'hover'

export interface UserMessageProps {
  message?: string
  timestamp?: string
  /** Small sender label above the prompt — replaces the avatar. */
  senderName?: string
  /** Quoted selection shown above the prompt (Copilot rewrite). */
  quotedText?: string
  /** Hide edit/copy footer — e.g. Copilot instruction turns. */
  showActions?: boolean
  /** Controlled visual state override */
  state?: UserMessageState
  /**
   * Latest turn in a thread keeps the toolbar visible. Prior turns recede it
   * until hover or focus. Standalone usage defaults to latest.
   */
  isLatest?: boolean
  onPointerEnter?: () => void
  onPointerLeave?: () => void
  onEdit?: () => void
  onCopy?: () => void
}

export function UserMessage({
  message = 'Could you provide an update on the current status of my report?',
  timestamp = '10 mins ago',
  senderName = 'You',
  quotedText,
  showActions = true,
  state,
  isLatest = true,
  onPointerEnter,
  onPointerLeave,
  onEdit,
  onCopy,
}: UserMessageProps) {
  const { hoverMotion, isTonedChrome } = useHoverMotion()
  const [isHovered, setIsHovered] = useState(false)
  const visualState: UserMessageState = state ?? (isHovered ? 'hover' : 'default')

  const handleEnter = (_event: PointerEvent<HTMLElement>) => {
    setIsHovered(true)
    onPointerEnter?.()
  }

  const handleLeave = () => {
    setIsHovered(false)
    onPointerLeave?.()
  }

  return (
    <article
      className={styles.root}
      data-state={visualState}
      data-motion={hoverMotion}
      data-latest={isLatest ? 'true' : 'false'}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      <div className={styles.bubbleWrap}>
        <div className={styles.bubble}>
          {quotedText?.trim() ? (
            <div className={styles.quoteSlot}>
              <AiInputQuoteChip text={quotedText} surface />
            </div>
          ) : null}
          <div className={styles.messageRow}>
            <span className={styles.senderName}>{senderName}</span>
            <p className={styles.text}>{message}</p>
          </div>
        </div>
      </div>

      {showActions ? (
        <footer className={styles.actions}>
        <span className={styles.timestamp}>{timestamp}</span>
        {isTonedChrome ? (
          <div className={styles.actionButtons}>
            <IconButton
              label="Edit message"
              tone="secondary"
              className={styles.actionButton}
              onClick={onEdit}
            >
              <EditIcon className={styles.actionIcon} />
            </IconButton>
            <IconButton
              label="Copy message"
              tone="secondary"
              className={styles.actionButton}
              onClick={onCopy}
            >
              <CopyIcon className={styles.actionIcon} />
            </IconButton>
          </div>
        ) : (
          <>
            <IconButton label="Edit message" className={styles.actionButton} onClick={onEdit}>
              <EditIcon className={styles.actionIcon} />
            </IconButton>
            <IconButton label="Copy message" className={styles.actionButton} onClick={onCopy}>
              <CopyIcon className={styles.actionIcon} />
            </IconButton>
          </>
        )}
      </footer>
      ) : null}
    </article>
  )
}

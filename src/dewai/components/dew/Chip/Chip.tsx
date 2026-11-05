import { useState, type ReactNode } from 'react'
import { ChipAvatar, type ChipAvatarShape } from './ChipAvatar'
import { ChipCloseButton } from './ChipCloseButton'
import styles from './Chip.module.css'

/** Figma Chip · Size */
export type ChipSize = 'default' | 'mini'
/** Figma Chip · Style */
export type ChipShape = 'circular' | 'rectangle'
/**
 * Figma Chip · State
 * Er_hover maps to `errorHover`
 */
export type ChipState =
  | 'default'
  | 'hover'
  | 'selected'
  | 'error'
  | 'errorHover'
  | 'focus'
  | 'disabled'

export interface ChipProps {
  /** Figma `mainText` */
  mainText?: string
  /** Alias for ticket-style labels */
  label?: string
  /** Figma `subText` — e.g. `+8` */
  subText?: string
  /** Convenience: renders `subText` as `+N` when `showSubText` is unset */
  count?: number
  size?: ChipSize
  shape?: ChipShape
  /** Controlled visual state; omit for interactive hover/focus */
  state?: ChipState
  showAvatar?: boolean
  showMainText?: boolean
  showSubText?: boolean
  showCloseButton?: boolean
  /** Figma `badge` — reserved for Code Connect parity; not rendered without asset */
  badge?: boolean
  avatar?: ReactNode
  avatarShape?: ChipAvatarShape
  onClick?: () => void
  onClose?: () => void
  onPointerEnter?: () => void
  onPointerLeave?: () => void
  className?: string
}

function formatCount(count: number): string {
  return count > 99 ? '+99+' : `+${count}`
}

export function Chip({
  mainText,
  label,
  subText,
  count,
  size = 'default',
  shape = 'circular',
  state,
  showAvatar = true,
  showMainText = true,
  showSubText,
  showCloseButton = false,
  badge: _badge = false,
  avatar,
  avatarShape,
  onClick,
  onClose,
  onPointerEnter,
  onPointerLeave,
  className = '',
}: ChipProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const isDisabled = state === 'disabled'

  const resolvedMain = mainText ?? label ?? ''
  const resolvedSub =
    subText ?? (count != null && count > 0 ? formatCount(count) : undefined)
  const shouldShowSub =
    showSubText ?? (resolvedSub != null && resolvedSub.length > 0)

  let visualState: ChipState = 'default'
  if (state) {
    visualState = state
  } else if (isDisabled) {
    visualState = 'disabled'
  } else if (isFocused) {
    visualState = 'focus'
  } else if (isHovered) {
    visualState = 'hover'
  }

  const resolvedAvatarShape = avatarShape ?? shape
  const avatarSize = size === 'mini' ? 16 : 24

  return (
    <button
      type="button"
      className={[
        styles.chip,
        size === 'mini' ? styles.sizeMini : styles.sizeDefault,
        shape === 'rectangle' ? styles.shapeRectangle : styles.shapeCircular,
        styles[`state_${visualState}`],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={isDisabled}
      aria-pressed={visualState === 'selected' || undefined}
      onClick={onClick}
      onPointerEnter={() => {
        if (!state && !isDisabled) setIsHovered(true)
        onPointerEnter?.()
      }}
      onPointerLeave={() => {
        if (!state) setIsHovered(false)
        onPointerLeave?.()
      }}
      onFocus={() => {
        if (!state && !isDisabled) setIsFocused(true)
      }}
      onBlur={() => {
        if (!state) setIsFocused(false)
      }}
    >
      {showAvatar &&
        (avatar ?? (
          <ChipAvatar
            shape={resolvedAvatarShape}
            type="text"
            initials={resolvedMain.slice(0, 1) || 'U'}
            size={avatarSize}
          />
        ))}

      {(showMainText && resolvedMain) || (shouldShowSub && resolvedSub) ? (
        <span className={styles.textBlock}>
          {showMainText && resolvedMain ? (
            <span className={styles.mainText}>{resolvedMain}</span>
          ) : null}
          {shouldShowSub && resolvedSub ? (
            <span className={styles.subText}>{resolvedSub}</span>
          ) : null}
        </span>
      ) : null}

      {showCloseButton ? (
        <ChipCloseButton disabled={isDisabled} onClick={() => onClose?.()} />
      ) : null}
    </button>
  )
}

export { ChipAvatar } from './ChipAvatar'
export { ChipCloseButton } from './ChipCloseButton'

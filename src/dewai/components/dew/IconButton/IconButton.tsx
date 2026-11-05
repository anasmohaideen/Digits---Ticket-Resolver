import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Tooltip } from '../Tooltip/Tooltip'
import type { TooltipPlacement } from '../Tooltip/tooltipTypes'
import styles from './IconButton.module.css'

export type IconButtonTone = 'default' | 'secondary'
export type IconButtonBadgeVariant = 'superscript' | 'dot'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  tone?: IconButtonTone
  /** Surface + border treatment — off by default (fw-dew TopNavigation icon cluster). */
  withBackground?: boolean
  tooltipPlacement?: TooltipPlacement
  /**
   * Count or dot indicator on the icon corner.
   * Use `badgeVariant="dot"` for TopNavigation notifications (fw-dew Badge dot mode).
   */
  badge?: ReactNode
  badgeVariant?: IconButtonBadgeVariant
  children: ReactNode
}

export function IconButton({
  label,
  tone = 'default',
  withBackground = false,
  tooltipPlacement = 'Top Centre',
  badge,
  badgeVariant = 'superscript',
  children,
  className = '',
  disabled,
  ...props
}: IconButtonProps) {
  const toneClass = tone === 'secondary' ? styles.secondary : styles.defaultTone
  const isDotBadge = badgeVariant === 'dot'
  const showBadge =
    badge != null &&
    badge !== false &&
    !(isDotBadge && typeof badge === 'number' && badge <= 0)

  const ariaLabel =
    isDotBadge && typeof badge === 'number' && badge > 0
      ? `${label}, ${badge} unread`
      : label

  const badgeClass = [styles.badge, isDotBadge ? styles.badgeDot : styles.badgeSuperscript]
    .filter(Boolean)
    .join(' ')

  return (
    <Tooltip content={label} disabled={disabled} placement={tooltipPlacement}>
      <button
        type="button"
        aria-label={ariaLabel}
        disabled={disabled}
        className={[
          styles.iconButton,
          toneClass,
          withBackground ? styles.withBackground : '',
          showBadge ? styles.hasBadge : '',
          'ai-pressable',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <span className={styles.iconContent}>{children}</span>
        {showBadge && (
          <span className={badgeClass} aria-hidden={isDotBadge ? true : undefined}>
            {!isDotBadge ? badge : null}
          </span>
        )}
      </button>
    </Tooltip>
  )
}

import { useState, type MouseEvent } from 'react'
import { CrossLargeIcon } from '../shared/IllustrationIcons'
import styles from './Chip.module.css'

/** Figma: Chip → `_Close Button` · State=Default | Hover · 70011:25502 */
export type ChipCloseButtonState = 'default' | 'hover'

export interface ChipCloseButtonProps {
  state?: ChipCloseButtonState
  disabled?: boolean
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  'aria-label'?: string
}

export function ChipCloseButton({
  state,
  disabled = false,
  onClick,
  'aria-label': ariaLabel = 'Remove',
}: ChipCloseButtonProps) {
  const [hovered, setHovered] = useState(false)
  const visualState: ChipCloseButtonState =
    state ?? (hovered && !disabled ? 'hover' : 'default')

  return (
    <button
      type="button"
      className={[
        styles.closeButton,
        visualState === 'hover' ? styles.closeHover : styles.closeDefault,
      ].join(' ')}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onClick?.(event)
      }}
      onPointerEnter={() => {
        if (!state && !disabled) setHovered(true)
      }}
      onPointerLeave={() => {
        if (!state) setHovered(false)
      }}
    >
      <CrossLargeIcon className={styles.closeIcon} />
    </button>
  )
}

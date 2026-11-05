import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { CoreChevronDownIcon } from '../shared/CoreIcons'
import styles from './Button.module.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'link'
type ButtonSize = 'default' | 'compact' | 'mini'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  prefixIcon?: ReactNode
  dropdown?: boolean
  /** Rotates the dropdown chevron when the menu is open */
  dropdownOpen?: boolean
  splitDropdown?: boolean
  onSplitDropdownClick?: () => void
  children: ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'default',
  prefixIcon,
  dropdown = false,
  dropdownOpen = false,
  splitDropdown = false,
  onSplitDropdownClick,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const sizeClass =
    size === 'compact' ? styles.compact : size === 'mini' ? styles.mini : styles.defaultSize

  const content = (
    <>
      {prefixIcon && <span className={styles.prefixIcon}>{prefixIcon}</span>}
      <span className={styles.label}>{children}</span>
      {dropdown && (
        <CoreChevronDownIcon className={styles.dropdownChevron} aria-hidden="true" />
      )}
    </>
  )

  if (splitDropdown) {
    return (
      <span className={[styles.splitRoot, className].filter(Boolean).join(' ')}>
        <button
          type="button"
          className={[styles.button, styles[variant], sizeClass, styles.splitMain].join(' ')}
          {...props}
        >
          {content}
        </button>
        <button
          type="button"
          className={[styles.button, styles[variant], sizeClass, styles.splitDropdownBtn].join(' ')}
          aria-label={`${typeof children === 'string' ? children : 'Send'} options`}
          onClick={onSplitDropdownClick}
        >
          <CoreChevronDownIcon className={styles.dropdownChevron} aria-hidden="true" />
        </button>
      </span>
    )
  }

  return (
    <button
      type="button"
      className={[styles.button, styles[variant], sizeClass, 'ai-pressable', className]
        .filter(Boolean)
        .join(' ')}
      data-dropdown={dropdown ? 'true' : undefined}
      data-dropdown-open={dropdown ? (dropdownOpen ? 'true' : 'false') : undefined}
      {...props}
    >
      {content}
    </button>
  )
}

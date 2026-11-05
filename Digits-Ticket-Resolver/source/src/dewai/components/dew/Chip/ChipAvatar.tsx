import type { ReactNode } from 'react'
import styles from './Chip.module.css'

/**
 * Nested Avatar used by Core Dew Chip (Code Connect → Dew Avatar).
 * Figma Chip props: Style=Circular | Rectangle · Size=Default uses 24px.
 */
export type ChipAvatarShape = 'circular' | 'rectangle'
export type ChipAvatarType = 'image' | 'icon' | 'text'

export interface ChipAvatarProps {
  shape?: ChipAvatarShape
  type?: ChipAvatarType
  src?: string
  alt?: string
  initials?: string
  icon?: ReactNode
  size?: 24 | 16
}

export function ChipAvatar({
  shape = 'circular',
  type = 'text',
  src,
  alt = '',
  initials = 'U',
  icon,
  size = 24,
}: ChipAvatarProps) {
  const shapeClass = shape === 'rectangle' ? styles.avatarRectangle : styles.avatarCircular
  const sizeClass = size === 16 ? styles.avatarMini : styles.avatarDefault

  return (
    <span className={[styles.avatar, shapeClass, sizeClass].join(' ')} aria-hidden={!alt}>
      {type === 'image' && src ? (
        <img className={styles.avatarImage} src={src} alt={alt} />
      ) : type === 'icon' && icon ? (
        <span className={styles.avatarIcon}>{icon}</span>
      ) : (
        <span className={styles.avatarText}>{initials.slice(0, 1).toUpperCase()}</span>
      )}
    </span>
  )
}

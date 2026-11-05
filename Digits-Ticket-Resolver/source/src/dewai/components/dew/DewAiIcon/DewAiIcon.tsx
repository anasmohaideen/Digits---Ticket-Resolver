import type { CSSProperties } from 'react'
import { DewAiWordmark } from './DewAiWordmark'
import styles from './DewAiIcon.module.css'
import sparkleUrl from '../../../assets/dew-ai/sparkle.svg'
import dewMarkUrl from '../../../assets/dew-ai/dew-mark.svg'

export type DewAiIconSize = 12 | 14 | 16 | 20 | 24 | 32 | 48 | 64
export type DewAiIconBg = 'blank' | 'dew'
export type DewAiIconTone = 'default' | 'inverse'

/** Figma Dew AI Icon BG=Dew itemSpacing per size (2600:5547). */
const SIZE_GAP: Record<DewAiIconSize, number> = {
  12: 2.667,
  14: 3.111,
  16: 4,
  20: 4,
  24: 5.333,
  32: 7.111,
  48: 10.667,
  64: 14.222,
}

export interface DewAiIconProps {
  size?: DewAiIconSize
  bg?: DewAiIconBg
  tone?: DewAiIconTone
  showName?: boolean
  /** Replaces the wordmark with a text name, e.g. "Agent Concierge". */
  title?: string
  /** Image shown before the title (e.g. a Digit avatar). */
  titleIcon?: string
  showDewLogo?: boolean
  className?: string
  alt?: string
}

export function DewAiIcon({
  size = 16,
  bg = 'blank',
  tone = 'default',
  showName = true,
  title,
  titleIcon,
  showDewLogo = true,
  className = '',
  alt = '',
}: DewAiIconProps) {
  const rootClass = [
    styles.root,
    bg === 'blank' ? styles.blank : styles.dew,
    tone === 'inverse' ? styles.toneInverse : styles.toneDefault,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const style = {
    '--dew-ai-size': `${size}px`,
    '--dew-ai-gap': `${SIZE_GAP[size]}px`,
  } as CSSProperties

  if (bg === 'blank') {
    return (
      <span className={rootClass} style={style} aria-hidden={alt ? undefined : true}>
        <img src={sparkleUrl} alt={alt} className={styles.sparkle} />
      </span>
    )
  }

  return (
    <span className={rootClass} style={style} aria-hidden={alt ? undefined : true}>
      {showDewLogo && (
        <img src={dewMarkUrl} alt={alt} className={styles.mark} />
      )}
      {title
        ? <>{titleIcon && <img src={titleIcon} alt="" width={size} height={size} className={styles.titleIcon} />}<span className={styles.title}>{title}</span></>
        : showName && <DewAiWordmark className={styles.wordmark} />}
    </span>
  )
}

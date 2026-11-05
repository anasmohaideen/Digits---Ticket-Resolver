import { useEffect, useId } from 'react'
import styles from './SparkleThinkingLogo.module.css'

/** Matches `--sparkle-once-duration` in SparkleThinkingLogo.module.css */
export const SPARKLE_INTRO_ONCE_MS = 5000

export type SparkleThinkingLogoSize = 20 | 24 | 64

export type SparkleThinkingLogoAnimation = 'loop' | 'once'
export type SparkleThinkingLogoRotate = 'think' | 'full'
export type SparkleThinkingLogoTone = 'brand' | 'mono'

export interface SparkleThinkingLogoProps {
  size?: SparkleThinkingLogoSize
  /** Scales the full animation (including halo/orbits) to fit this box size. */
  fitSize?: number
  /** `loop` — continuous thinking motion. `once` — intro cycle for empty/welcome states. */
  animation?: SparkleThinkingLogoAnimation
  /** Main sparkle rotation — `full` is a continuous 360° spin (Copilot loading). */
  rotate?: SparkleThinkingLogoRotate
  /** `mono` — black/gray for active thinking; `brand` — purple gradient (welcome, etc.). */
  tone?: SparkleThinkingLogoTone
  /** Fires when `animation="once"` finishes (welcome / empty state → static logo). */
  onIntroComplete?: () => void
  className?: string
}

const SIZE_CLASS: Record<SparkleThinkingLogoSize, string> = {
  20: styles.size20,
  24: styles.size24,
  64: styles.size64,
}

const SPARKLE_PATH =
  'M12 0 C12.4 6.2 17.8 11.6 24 12 C17.8 12.4 12.4 17.8 12 24 C11.6 17.8 6.2 12.4 0 12 C6.2 11.6 11.6 6.2 12 0 Z'

/** Companion sparkle from the static dew-ai lockup */
const MINI_SPARKLE_PATH =
  'M8.09925 0.666667C8.21586 1.29162 8.70841 1.7842 9.33333 1.90091V1.95116L9.33322 1.95105C8.7083 2.06766 8.21575 2.56024 8.09914 3.18519H8.04889C7.93229 2.56023 7.43974 2.06766 6.81481 1.95105V1.9008C7.43974 1.78419 7.9323 1.29162 8.04901 0.666667H8.09925Z'

export function SparkleThinkingLogo({
  size = 64,
  fitSize,
  animation = 'loop',
  rotate = 'think',
  tone = 'brand',
  onIntroComplete,
  className = '',
}: SparkleThinkingLogoProps) {
  const gradientId = useId().replace(/:/g, '')

  useEffect(() => {
    if (animation !== 'once' || !onIntroComplete) return
    const timer = window.setTimeout(onIntroComplete, SPARKLE_INTRO_ONCE_MS)
    return () => window.clearTimeout(timer)
  }, [animation, onIntroComplete])
  const wrapSize = size * 1.5
  const scale = fitSize ? fitSize / wrapSize : 1
  const innerStyle = scale !== 1 ? { transform: `scale(${scale})` } : undefined

  const innerClass = [
    styles.inner,
    animation === 'once' ? styles.playOnce : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      className={[
        styles.root,
        SIZE_CLASS[size],
        tone === 'mono' ? styles.mono : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <span className={innerClass} style={innerStyle}>
        <svg className={styles.defs} aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--sparkle-bright)" />
              <stop offset="55%" stopColor="var(--sparkle-core)" />
              <stop offset="100%" stopColor="var(--sparkle-deep)" />
            </linearGradient>
          </defs>
        </svg>

        <span className={styles.halo} />

        <span className={styles.orbit}>
          <svg className={styles.miniSparkle} viewBox="0 0 10 3.2" aria-hidden="true">
            <path d={MINI_SPARKLE_PATH} fill={`url(#${gradientId})`} />
          </svg>
        </span>

        <span className={[styles.orbit, styles.orbitReverse].join(' ')}>
          <svg className={[styles.miniSparkle, styles.miniSparkleSmall].join(' ')} viewBox="0 0 10 3.2" aria-hidden="true">
            <path d={MINI_SPARKLE_PATH} fill={`url(#${gradientId})`} />
          </svg>
        </span>

        <svg className={styles.sparkle} viewBox="0 0 24 24" aria-hidden="true">
          <path
            className={[
              animation === 'once' || rotate === 'think' ? styles.sparklePath : styles.sparklePathFull,
            ].join(' ')}
            d={SPARKLE_PATH}
            fill={`url(#${gradientId})`}
          />
        </svg>
      </span>
    </span>
  )
}

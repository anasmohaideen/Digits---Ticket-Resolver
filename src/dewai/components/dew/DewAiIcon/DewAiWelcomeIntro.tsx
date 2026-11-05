import { useEffect } from 'react'
import styles from './DewAiWelcomeIntro.module.css'

/** Matches intro CSS duration — settle into static DewAiIcon after. */
export const DEW_AI_WELCOME_INTRO_MS = 2800

export interface DewAiWelcomeIntroProps {
  size?: 64
  onIntroComplete?: () => void
  className?: string
}

/**
 * Welcome intro using the static Dew AI sparkle lockup (main + mini from sparkle.svg).
 * Animates within a 64px box and settles to the same geometry as DewAiIcon blank.
 * Main sparkle: full 360° rotation with ease-out; no spring.
 * Tweak mode settles at 90° (see DewAiWelcomeIntro.module.css).
 */
export function DewAiWelcomeIntro({
  size = 64,
  onIntroComplete,
  className = '',
}: DewAiWelcomeIntroProps) {
  useEffect(() => {
    if (!onIntroComplete) return
    const timer = window.setTimeout(onIntroComplete, DEW_AI_WELCOME_INTRO_MS)
    return () => window.clearTimeout(timer)
  }, [onIntroComplete])

  return (
    <span
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg className={styles.svg} viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <g className={styles.mainGroup}>
          <path
            className={styles.mainSparkle}
            d="M5.09988 0C5.56286 2.48144 7.51867 4.43733 10 4.90075V5.1001L9.9996 5.09971C7.51827 5.56271 5.56246 7.51856 5.09948 10H4.90012C4.43714 7.51856 2.48133 5.56271 0 5.09971V4.90029C2.48133 4.43729 4.43712 2.48144 4.90052 0H5.09988Z"
            fill="var(--ai-logo)"
          />
        </g>
        <g className={styles.miniGroup}>
          <path
            className={styles.miniSparkle}
            d="M8.09925 0.666667C8.21586 1.29162 8.70841 1.7842 9.33333 1.90091V1.95116L9.33322 1.95105C8.7083 2.06766 8.21575 2.56024 8.09914 3.18519H8.04889C7.93229 2.56023 7.43974 2.06766 6.81481 1.95105V1.9008C7.43974 1.78419 7.9323 1.29162 8.04901 0.666667H8.09925Z"
            fill="var(--ai-logo)"
          />
        </g>
      </svg>
    </span>
  )
}

import motionStyles from './bannerHoverMotion.module.css'

export type MotionBorderShineTone = 'hover' | 'thinking' | 'loading'

const TONE_CLASS: Record<MotionBorderShineTone, string> = {
  hover: motionStyles.motionBorderShineRingHover,
  thinking: motionStyles.motionBorderShineRingThinking,
  loading: motionStyles.motionBorderShineRingLoading,
}

/** Motion-only conic shine that travels along the border (hover, thinking, loading). */
export function HoverMotionBorderShineOverlay({ tone = 'hover' }: { tone?: MotionBorderShineTone }) {
  return (
    <div className={motionStyles.motionBorderShineRoot} aria-hidden="true">
      <div className={TONE_CLASS[tone]} />
    </div>
  )
}

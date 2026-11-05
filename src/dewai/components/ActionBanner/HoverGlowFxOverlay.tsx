import { useRef, type CSSProperties, type TransitionEvent } from 'react'
import glowStyles from './bannerHoverGlow.module.css'
import type { HoverGlowMode } from './useBannerHoverSweep'
import { useSweepDuration } from './useSweepDuration'

interface HoverGlowFxOverlayProps {
  active: boolean
  fading?: boolean
  variant: HoverGlowMode
  /** Continuous chip glow — used for prompt loading until response completes */
  loop?: boolean
  onTransitionEnd?: (event: TransitionEvent<HTMLDivElement>) => void
}

export function HoverGlowFxOverlay({
  active,
  fading = false,
  variant,
  loop = false,
  onTransitionEnd,
}: HoverGlowFxOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const sweepDuration = useSweepDuration(rootRef)

  if (!active && !fading && !loop) return null

  const variantClass =
    variant === 'banner'
      ? glowStyles.glowFxBanner
      : variant === 'button'
        ? glowStyles.glowFxButton
        : glowStyles.glowFxChip

  const showSweep = (active && !fading) || loop

  const rootClass = [
    glowStyles.glowFxRoot,
    variantClass,
    active && !fading ? glowStyles.glowFxActive : '',
    loop && !fading ? glowStyles.glowFxLoop : '',
    fading ? glowStyles.glowFxFading : '',
  ]
    .filter(Boolean)
    .join(' ')

  const sweepStyle = {
    '--sweep-duration': `${sweepDuration}s`,
  } as CSSProperties

  return (
    <div
      ref={rootRef}
      className={rootClass}
      style={sweepStyle}
      onTransitionEnd={onTransitionEnd}
      aria-hidden="true"
    >
      <div className={glowStyles.glowFxOverlay} />
      {showSweep && (
        <>
          <div className={glowStyles.glowFxSweepRing} />
          <div className={glowStyles.glowFxSweepRingInner} />
        </>
      )}
    </div>
  )
}

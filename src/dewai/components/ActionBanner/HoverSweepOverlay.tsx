import { useRef, type AnimationEvent, type TransitionEvent } from 'react'
import hoverStyles from './bannerHover.module.css'
import type { HoverGlowMode } from './useBannerHoverSweep'

interface HoverSweepOverlayProps {
  active: boolean
  fading?: boolean
  sweepKey: number
  variant: HoverGlowMode
  /** Continuous chip sweep — used for prompt loading until response completes */
  loop?: boolean
  onAnimationEnd?: (event: AnimationEvent<HTMLDivElement>) => void
  onTransitionEnd?: (event: TransitionEvent<HTMLDivElement>) => void
}

export function HoverSweepOverlay({
  active,
  fading = false,
  variant,
  loop = false,
  onTransitionEnd,
}: HoverSweepOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  if (!active && !fading && !loop) return null

  const softRotating = (active && !fading) || loop

  /* Button + chip share the same soft sweep sizing; banner uses default */
  const compactClass =
    variant === 'button' || variant === 'chip' ? hoverStyles.softSweepButton : ''

  const rootClass = [
    hoverStyles.sweepRoot,
    fading ? hoverStyles.sweepFading : '',
  ]
    .filter(Boolean)
    .join(' ')

  const softClass = [
    hoverStyles.softSweep,
    compactClass,
    softRotating ? hoverStyles.softSweepActive : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={rootRef} className={rootClass} onTransitionEnd={onTransitionEnd}>
      <div className={softClass}>
        <div className={hoverStyles.softSweepHalo} aria-hidden="true" />
        <div className={hoverStyles.softSweepRing} aria-hidden="true" />
      </div>
    </div>
  )
}

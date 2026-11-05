import { useEffect, useState, type PointerEvent } from 'react'
import { HoverMotionOverlay } from '../../ActionBanner/HoverMotionOverlay'
import { useBannerHoverSweep } from '../../ActionBanner/useBannerHoverSweep'
import { useMotionSurface } from '../../ActionBanner/useMotionSurface'
import { isMotionLikeMotion, useHoverMotion } from '../../../providers/HoverMotionProvider'
import styles from './PrimaryButton.module.css'
import sparklePurple from '../../../assets/primary-button/sparkle-purple.svg'

export type PrimaryButtonState = 'default' | 'hover' | 'active'

export interface PrimaryButtonProps {
  /** Controlled visual state override for playground / docs */
  state?: PrimaryButtonState
  /** Keeps active styling while AI panel is open */
  active?: boolean
  ariaLabel?: string
  disabled?: boolean
  onClick?: () => void
}

export function PrimaryButton({
  state,
  active: activeProp = false,
  ariaLabel = 'Open Freshworks AI',
  disabled = false,
  onClick,
}: PrimaryButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { hoverMotion, isTonedChrome } = useHoverMotion()
  const sweep = useBannerHoverSweep({ mode: 'button' })

  const isActive = state === 'active' || activeProp
  const isHoverVisual = !isActive && (state === 'hover' || (state === undefined && isHovered))
  const visualState: PrimaryButtonState = isActive ? 'active' : isHoverVisual ? 'hover' : 'default'
  const isMotion = isMotionLikeMotion(hoverMotion)

  /* Magnet (lift + violet drop-shadow) is hover-only — active latches hover chrome without it. */
  const motionHoverActive = isMotion && isHoverVisual
  const motionSurface = useMotionSurface(
    motionHoverActive,
    !isActive && sweep.sweepFading,
    false,
    sweep.motionOriginStyle,
  )

  const showStaticBorder =
    isTonedChrome &&
    (visualState === 'default' || isHoverVisual || isActive) &&
    !(hoverMotion === 'glow' && !isActive && (sweep.borderSweep || sweep.sweepFading))

  const showSweepOverlay =
    !isMotion &&
    !isActive &&
    (sweep.borderSweep || sweep.sweepFading || (isHoverVisual && state === undefined))

  const iconSrc = sparklePurple

  useEffect(() => {
    if (isActive) sweep.stopImmediately()
  }, [isActive, sweep.stopImmediately])

  const handleEnter = (event: PointerEvent<HTMLSpanElement>) => {
    setIsHovered(true)
    if (!isActive && !state && !disabled) {
      sweep.handlePointerEnter(event)
    }
  }

  const handleLeave = () => {
    setIsHovered(false)
    sweep.handlePointerLeave()
  }

  return (
    <span
      className={styles.wrap}
      style={motionSurface.motionOriginStyle}
      {...motionSurface.motionWrapProps}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      {showStaticBorder && <span className={styles.staticBorder} aria-hidden="true" />}
      {showSweepOverlay && (
        <HoverMotionOverlay
          active={sweep.borderSweep}
          fading={sweep.sweepFading}
          sweepKey={sweep.sweepKey}
          variant="button"
          onAnimationEnd={sweep.handleBorderAnimationEnd}
          onTransitionEnd={sweep.handleSweepTransitionEnd}
        />
      )}
      <button
        type="button"
        className={[styles.button, styles[visualState], 'ai-pressable'].join(' ')}
        aria-label={ariaLabel}
        aria-pressed={isActive}
        disabled={disabled}
        onClick={onClick}
      >
        <img src={iconSrc} alt="" className={styles.icon} />
      </button>
    </span>
  )
}

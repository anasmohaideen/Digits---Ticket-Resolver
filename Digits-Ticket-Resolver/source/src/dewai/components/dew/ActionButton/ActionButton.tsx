import { useState, type PointerEvent, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { HoverMotionOverlay } from '../../ActionBanner/HoverMotionOverlay'
import { useBannerHoverSweep } from '../../ActionBanner/useBannerHoverSweep'
import { useGlowSurface } from '../../ActionBanner/useGlowSurface'
import { useMotionSurface } from '../../ActionBanner/useMotionSurface'
import { isMotionLikeMotion, useHoverMotion } from '../../../providers/HoverMotionProvider'
import { AiResponseIcon, ArrowRightIcon, ChevronDownIcon } from '../shared/IllustrationIcons'
import styles from './ActionButton.module.css'

const ICON_SCALE_EASE = [0.25, 1, 0.5, 1] as const

export type ActionButtonState = 'default' | 'hover' | 'active'
export type ActionButtonSize = 'default' | 'mini'
export type ActionButtonAppearance = 'default' | 'rte'

const STATE_CLASS: Record<ActionButtonState, string> = {
  default: 'stateDefault',
  hover: 'hover',
  active: 'active',
}

export interface ActionButtonProps {
  label: string
  size?: ActionButtonSize
  appearance?: ActionButtonAppearance
  /** Controlled visual state override */
  state?: ActionButtonState
  /** Keeps active styling while AI slider is open */
  active?: boolean
  disabled?: boolean
  prefixIcon?: boolean
  icon?: ReactNode
  suffixIcon?: boolean
  dropdown?: boolean
  splitDropdown?: boolean
  menuOpen?: boolean
  onClick?: () => void
  onDropdownClick?: () => void
  onSplitDropdownClick?: () => void
  onPointerEnter?: () => void
  onPointerLeave?: () => void
  /** When true, skip Sweep/Glow overlays — banner already owns those */
  containedInBanner?: boolean
}

export function ActionButton({
  label,
  size = 'default',
  appearance = 'default',
  state,
  active: activeProp = false,
  disabled = false,
  prefixIcon = false,
  icon,
  suffixIcon = false,
  dropdown = false,
  splitDropdown = false,
  menuOpen = false,
  onClick,
  onDropdownClick,
  onSplitDropdownClick,
  onPointerEnter,
  onPointerLeave,
  containedInBanner = false,
}: ActionButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { hoverMotion, isTonedChrome } = useHoverMotion()
  const reduceMotion = useReducedMotion() ?? false
  const isRte = appearance === 'rte'
  const isMotion = isMotionLikeMotion(hoverMotion)
  const allowHoverOverlay = !containedInBanner && (!isRte || isMotion)

  /* Banner CTA: ignore slider-open `active` for visuals until direct hover */
  const isActive = containedInBanner
    ? state === 'active' || menuOpen
    : state === 'active' || activeProp || menuOpen
  const isHoverVisual = !isActive && (state === 'hover' || (state === undefined && isHovered))
  const visualState: ActionButtonState = isActive ? 'active' : isHoverVisual ? 'hover' : 'default'

  const sweep = useBannerHoverSweep({ mode: 'button' })
  const glow = useGlowSurface(
    !containedInBanner && sweep.borderSweep,
    !containedInBanner && sweep.sweepFading,
  )
  const motionHoverActive = isMotion && isHoverVisual && !isActive
  const motionSurface = useMotionSurface(
    motionHoverActive || (!containedInBanner && sweep.borderSweep),
    (isMotion || !containedInBanner) && sweep.sweepFading,
    false,
    sweep.motionOriginStyle,
  )
  const showSweepOverlay =
    allowHoverOverlay &&
    (sweep.borderSweep || sweep.sweepFading || (isHoverVisual && state === undefined))

  const handleEnter = (event: PointerEvent<HTMLSpanElement>) => {
    setIsHovered(true)
    onPointerEnter?.()
    if (!isActive && !state && !disabled && (allowHoverOverlay || isMotion)) {
      sweep.handlePointerEnter(event)
    }
  }

  const handleLeave = () => {
    setIsHovered(false)
    onPointerLeave?.()
    if (allowHoverOverlay || isMotion) {
      sweep.handlePointerLeave()
    }
  }

  const sizeClass = size === 'mini' ? styles.mini : styles.defaultSize
  const stateClass = styles[STATE_CLASS[visualState]]
  const appearanceClass = isRte ? styles.rte : ''
  /* RTE — Presentation always uses Mono→Medium static ring (no Sweep/Glow overlays) */
  const showStaticBorder = isRte
    ? true
    : ((visualState === 'default' ||
        visualState === 'active' ||
        (isTonedChrome && isHoverVisual)) &&
      !(hoverMotion === 'glow' && (sweep.borderSweep || sweep.sweepFading)))
  const isEngaged = visualState === 'hover' || visualState === 'active'
  const iconScaleTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: ICON_SCALE_EASE }
  const prefix = (() => {
    if (icon) return icon
    if (!prefixIcon) return null
    const glyph = <AiResponseIcon className={styles.icon} />
    if (!isMotion) return glyph
    return (
      <motion.span
        className={styles.iconScale}
        initial={false}
        animate={{ scale: isEngaged ? 1.1 : 1 }}
        transition={iconScaleTransition}
        aria-hidden="true"
      >
        {glyph}
      </motion.span>
    )
  })()

  const rootClass = [
    styles.root,
    sizeClass,
    appearanceClass,
    stateClass,
    splitDropdown ? styles.splitRoot : '',
  ]
    .filter(Boolean)
    .join(' ')

  const labelContent = (
    <>
      {prefix}
      <span className={styles.text}>{label}</span>
      {dropdown && !splitDropdown && (
        <ChevronDownIcon className={[styles.icon, styles.dropdownChevron].join(' ')} aria-hidden="true" />
      )}
      {suffixIcon && <ArrowRightIcon className={styles.icon} />}
    </>
  )

  return (
    <span
      className={[styles.wrap, sizeClass, appearanceClass].filter(Boolean).join(' ')}
      data-motion-size={size}
      style={motionSurface.motionOriginStyle}
      {...(isRte || containedInBanner ? {} : glow.glowWrapProps)}
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

      {splitDropdown ? (
        <span className={rootClass}>
          <button
            type="button"
            className={[styles.mainArea, styles.buttonElement, 'ai-pressable'].join(' ')}
            onClick={onClick}
            disabled={disabled}
          >
            {labelContent}
          </button>
          <button
            type="button"
            className={[styles.splitArea, 'ai-pressable'].join(' ')}
            aria-label={`${label} menu`}
            onClick={onSplitDropdownClick ?? onDropdownClick}
          >
            <ChevronDownIcon className={[styles.icon, styles.dropdownChevron].join(' ')} />
          </button>
        </span>
      ) : (
        <button
          type="button"
          className={[rootClass, 'ai-pressable'].join(' ')}
          onClick={onClick}
          disabled={disabled}
          aria-expanded={dropdown ? menuOpen : undefined}
        >
          <span className={styles.buttonElement}>{labelContent}</span>
        </button>
      )}
    </span>
  )
}

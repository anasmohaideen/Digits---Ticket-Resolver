import { useState, type AnimationEvent, type CSSProperties, type PointerEvent } from 'react'
import { TicketsIcon } from '../shared/IllustrationIcons'
import { HoverMotionOverlay } from '../../ActionBanner/HoverMotionOverlay'
import { useGlowSurface } from '../../ActionBanner/useGlowSurface'
import { useMotionSurface } from '../../ActionBanner/useMotionSurface'
import { isMotionLikeMotion, useHoverMotion } from '../../../providers/HoverMotionProvider'
import styles from './AIChip.module.css'

export type AIChipState = 'default' | 'hover' | 'focus'

function formatBadgeCount(count: number): string {
  return count > 99 ? '99+' : String(count)
}

interface AIChipProps {
  label: string
  count: number
  /** Optional italic sub-label (Figma SubText atom) */
  subText?: string
  state?: AIChipState
  /** When true, skip Motion float/glow — banner already elevates */
  containedInBanner?: boolean
  sweepActive?: boolean
  sweepFading?: boolean
  sweepKey?: number
  onSweepAnimationEnd?: (event: AnimationEvent<HTMLDivElement>) => void
  onClick?: () => void
  onPointerEnter?: (event: PointerEvent) => void
  onPointerLeave?: () => void
  motionOriginStyle?: CSSProperties
}

export function AIChip({
  label,
  count,
  subText,
  state,
  containedInBanner = false,
  sweepActive = false,
  sweepFading = false,
  sweepKey = 0,
  onSweepAnimationEnd,
  onClick,
  onPointerEnter,
  onPointerLeave,
  motionOriginStyle,
}: AIChipProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { hoverMotion, isTonedChrome } = useHoverMotion()
  const isMotion = isMotionLikeMotion(hoverMotion)
  const visualState: AIChipState = state ?? (isHovered ? 'hover' : 'default')
  const motionHoverActive =
    isMotion && !containedInBanner && (visualState === 'hover' || visualState === 'focus')
  const glow = useGlowSurface(!containedInBanner && sweepActive, !containedInBanner && sweepFading)
  const motionSurface = useMotionSurface(
    !containedInBanner && (sweepActive || motionHoverActive),
    !containedInBanner && sweepFading,
    false,
    motionOriginStyle,
  )

  const wrapClass = [
    styles.chipWrap,
    sweepActive || sweepFading ? styles.sweeping : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      className={wrapClass}
      style={motionSurface.motionOriginStyle}
      data-banner-contained={containedInBanner ? 'true' : undefined}
      {...(containedInBanner ? {} : glow.glowWrapProps)}
      {...(containedInBanner ? {} : motionSurface.motionWrapProps)}
    >
      {isTonedChrome && <span className={styles.staticBorder} aria-hidden="true" />}
      {!containedInBanner && (
        <HoverMotionOverlay
          active={sweepActive}
          fading={sweepFading}
          sweepKey={sweepKey}
          variant="chip"
          onAnimationEnd={onSweepAnimationEnd}
        />
      )}
      <button
        type="button"
        className={[styles.chip, styles[visualState], 'ai-pressable'].join(' ')}
        onClick={onClick}
        onPointerEnter={(event) => {
          setIsHovered(true)
          onPointerEnter?.(event)
        }}
        onPointerLeave={() => {
          setIsHovered(false)
          onPointerLeave?.()
        }}
      >
        <TicketsIcon className={styles.icon} />
        <span className={styles.content}>
          <span className={styles.label}>{label}</span>
          {subText ? <span className={styles.subText}>{subText}</span> : null}
        </span>
        <span className={styles.badge}>{formatBadgeCount(count)}</span>
      </button>
    </span>
  )
}

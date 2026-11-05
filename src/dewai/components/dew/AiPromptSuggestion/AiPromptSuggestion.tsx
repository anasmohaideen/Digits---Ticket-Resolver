import { useState, type PointerEvent } from 'react'
import { HoverMotionOverlay } from '../../ActionBanner/HoverMotionOverlay'
import { HoverMotionBorderShineOverlay } from '../../ActionBanner/HoverMotionBorderShineOverlay'
import { useBannerHoverSweep } from '../../ActionBanner/useBannerHoverSweep'
import { useGlowSurface } from '../../ActionBanner/useGlowSurface'
import { useThinkingTextClass } from '../../ActionBanner/useThinkingTextClass'
import { isMotionLikeMotion, useHoverMotion } from '../../../providers/HoverMotionProvider'
import { SparkleThinkingLogo } from '../SparkleThinkingLogo/SparkleThinkingLogo'
import { SuggestIcon } from '../shared/IllustrationIcons'
import styles from './AiPromptSuggestion.module.css'

export type AiPromptSuggestionState = 'default' | 'hover' | 'disabled' | 'loading'
export type AiPromptSuggestionSize = 'default' | 'mini'

export interface AiPromptSuggestionProps {
  label: string
  /** Controlled visual state override */
  state?: AiPromptSuggestionState
  size?: AiPromptSuggestionSize
  showIcon?: boolean
  onClick?: () => void
  onPointerEnter?: () => void
  onPointerLeave?: () => void
}

function resolveIconClass(
  size: AiPromptSuggestionSize,
  visualState: AiPromptSuggestionState,
  isTonedChrome: boolean,
) {
  const elevated = !isTonedChrome && (visualState === 'hover' || visualState === 'loading')
  if (size === 'mini') {
    return elevated ? styles.iconHoverMini : styles.iconMini
  }
  return elevated ? styles.iconHoverDefault : styles.iconDefault
}

export function AiPromptSuggestion({
  label,
  state,
  size = 'default',
  showIcon = true,
  onClick,
  onPointerEnter,
  onPointerLeave,
}: AiPromptSuggestionProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { hoverMotion, isTonedChrome } = useHoverMotion()
  const isQuiet = hoverMotion === 'quiet'
  const isMotion = isMotionLikeMotion(hoverMotion)
  const isDisabled = state === 'disabled'
  const isLoading = state === 'loading'
  const hoverSweep = useBannerHoverSweep({ mode: 'chip' })
  const loadingGlow = useGlowSurface(isLoading && hoverMotion === 'glow', false, isLoading && hoverMotion === 'glow')
  const visualState: AiPromptSuggestionState =
    state ?? (isHovered && !isDisabled && !isLoading ? 'hover' : 'default')

  const wrapClass = [
    styles.chipWrap,
    size === 'mini' ? styles.wrapMini : styles.wrapDefault,
    isLoading ? styles.chipWrapLoading : '',
  ]
    .filter(Boolean)
    .join(' ')

  const chipClass = [
    styles.chip,
    size === 'mini' ? styles.mini : '',
    styles[visualState],
  ]
    .filter(Boolean)
    .join(' ')

  const thinkingTextClass = useThinkingTextClass()
  const labelClass = [
    styles.label,
    isLoading && isQuiet ? styles.labelQuietLoading : '',
    isLoading && isMotion ? thinkingTextClass : '',
    isLoading && !isTonedChrome ? `${styles.labelLoading} ${thinkingTextClass}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const handleEnter = (event: PointerEvent<HTMLButtonElement>) => {
    if (!state && !isDisabled && !isLoading) {
      setIsHovered(true)
      hoverSweep.handlePointerEnter(event)
    }
    onPointerEnter?.()
  }

  const handleLeave = () => {
    if (!state) setIsHovered(false)
    hoverSweep.handlePointerLeave()
    onPointerLeave?.()
  }

  const iconSizeClass = resolveIconClass(size, visualState, isTonedChrome)

  return (
    <span className={wrapClass} {...loadingGlow.glowWrapProps}>
      {isLoading && !isMotion && <HoverMotionOverlay active loop sweepKey={0} variant="chip" />}
      {!isLoading && !isMotion && (hoverSweep.borderSweep || hoverSweep.sweepFading) && (
        <HoverMotionOverlay
          active={hoverSweep.borderSweep}
          fading={hoverSweep.sweepFading}
          sweepKey={hoverSweep.sweepKey}
          variant="chip"
          onTransitionEnd={hoverSweep.handleSweepTransitionEnd}
        />
      )}
      {isLoading && isMotion && <HoverMotionBorderShineOverlay tone="loading" />}
      {isTonedChrome && (visualState === 'hover' || (isLoading && isMotion)) && (
        <span className={styles.staticBorder} aria-hidden="true" />
      )}
      <button
        type="button"
        className={[chipClass, !isDisabled && !isLoading ? 'ai-pressable' : ''].filter(Boolean).join(' ')}
        disabled={isDisabled || isLoading}
        onClick={onClick}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
      >
        {showIcon &&
          (isMotion ? (
            <span className={[styles.iconSlot, iconSizeClass].join(' ')} aria-hidden="true">
              <SuggestIcon className={styles.icon} />
            </span>
          ) : isLoading && !isQuiet ? (
            <span className={styles.sparkleIconSlot} aria-hidden="true">
              <SparkleThinkingLogo size={20} animation="loop" />
            </span>
          ) : isLoading && isQuiet ? (
            <SuggestIcon className={[styles.icon, iconSizeClass].join(' ')} />
          ) : (
            <SuggestIcon className={[styles.icon, iconSizeClass].join(' ')} />
          ))}
        <span className={labelClass}>{label}</span>
      </button>
    </span>
  )
}

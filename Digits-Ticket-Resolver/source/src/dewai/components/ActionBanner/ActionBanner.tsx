import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { InfoIcon } from '../dew/shared/IllustrationIcons'
import { ActionButton } from '../dew/ActionButton/ActionButton'
import { AIChip, type AIChipState } from '../dew/AIChip/AIChip'
import { SparkleThinkingLogo } from '../dew/SparkleThinkingLogo/SparkleThinkingLogo'
import { isMotionLikeMotion, useHoverMotion } from '../../providers/HoverMotionProvider'
import { BannerInsightRow } from './BannerInsightRow'
import { HoverMotionOverlay } from './HoverMotionOverlay'
import { HoverMotionBorderShineOverlay } from './HoverMotionBorderShineOverlay'
import { HoverSweepOverlay } from './HoverSweepOverlay'
import styles from './ActionBanner.module.css'
import { useBannerHoverSweep } from './useBannerHoverSweep'
import { useGlowSurface } from './useGlowSurface'
import { useMotionSurface } from './useMotionSurface'
import { useThinkingSweep } from './useThinkingSweep'
import { useThinkingTextClass } from './useThinkingTextClass'
import { AiGeneratingText } from '../dew/AiGeneratingText/AiGeneratingText'
import { estimateGeneratingRevealMs } from '../../hooks/useGeneratingTextReveal'

export type BannerState = 'default' | 'hover' | 'thinking' | 'output'

export interface BannerChip {
  id: string
  label: string
  count: number
}

interface ActionBannerProps {
  state: BannerState
  /** Figma Style=Default | Style=Subtle — Quiet Subtle uses Surface-only fill */
  appearance?: 'default' | 'subtle'
  title: string
  thinkingLabel?: string
  summaryTitle?: string
  summaryIntro?: string
  summaryBullets?: string[]
  description?: string
  showChips?: boolean
  showActionButton?: boolean
  chips?: BannerChip[]
  cta?: string
  ctaActive?: boolean
  onPointerEnter?: () => void
  onPointerLeave?: () => void
  onSummarize?: () => void
  onViewInsights?: () => void
  onChipClick?: (chipId: string) => void
  onFeedback?: (helpful: boolean) => void
}

function getChipState(hoveredChipId: string | null, chipId: string): AIChipState {
  if (hoveredChipId === chipId) return 'hover'
  return 'default'
}

export function ActionBanner({
  state,
  appearance = 'default',
  title,
  thinkingLabel = 'Summarising the ticket',
  summaryTitle = 'Summary',
  summaryIntro = '',
  summaryBullets = [],
  description,
  showChips = false,
  showActionButton = false,
  chips = [],
  cta = 'View Insights',
  ctaActive = false,
  onPointerEnter,
  onPointerLeave,
  onSummarize,
  onViewInsights,
  onChipClick,
  onFeedback,
}: ActionBannerProps) {
  const isHeroLayout = !showChips && !showActionButton
  const isCompact = state !== 'output'
  const isInteractive = isHeroLayout && (state === 'default' || state === 'hover')
  const visibleChips = showChips ? chips : []

  const { hoverMotion, isTonedChrome } = useHoverMotion()
  const useMotionInsightRow = hoverMotion === 'motion' || hoverMotion === 'tweak'
  const isThinking = state === 'thinking'
  const showTweakOutputSparkle = hoverMotion === 'tweak' && state === 'output'
  const quietThinkingSweep = useThinkingSweep(isThinking && hoverMotion === 'quiet')
  const bannerSweep = useBannerHoverSweep({ mode: 'banner' })
  const motionThinkingSweep = isThinking && isMotionLikeMotion(hoverMotion)
  const { stopImmediately: stopBannerSweep } = bannerSweep

  const [hoveredChipId, setHoveredChipId] = useState<string | null>(null)
  const [feedbackChoice, setFeedbackChoice] = useState<'yes' | 'no' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | 'auto'>('auto')
  const shouldReduceMotion = useReducedMotion()

  const heightTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }
  const textTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.25, 1, 0.5, 1] as const }
  const contentTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: [0.25, 1, 0.5, 1] as const }

  useEffect(() => {
    if (state !== 'output') {
      setFeedbackChoice(null)
    }
    setHoveredChipId(null)
  }, [state])

  useEffect(() => {
    if (state === 'thinking' || state === 'output' || !isInteractive) {
      stopBannerSweep()
    }
  }, [state, isInteractive, stopBannerSweep])

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver(() => {
      setHeight(el.offsetHeight)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleHeroPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    onPointerEnter?.()
    if (isInteractive) {
      bannerSweep.handlePointerEnter(event)
    }
  }

  const handleHeroPointerLeave = () => {
    onPointerLeave?.()
    bannerSweep.handlePointerLeave()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onSummarize?.()
    }
  }

  const handleFeedback = (helpful: boolean) => {
    setFeedbackChoice(helpful ? 'yes' : 'no')
    onFeedback?.(helpful)
  }

  const displayTitle = state === 'thinking' ? thinkingLabel : state === 'output' ? summaryTitle : title
  const thinkingTextClass = useThinkingTextClass()

  const titleClassName = [
    styles.title,
    state === 'thinking' ? `${styles.titleThinking} ${thinkingTextClass}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const rootClassName = [
    styles.root,
    'motionBannerRoot',
    state === 'output' ? 'motionBannerOutput' : '',
    styles[state],
    appearance === 'subtle' ? styles.subtle : '',
    state === 'thinking' || (isHeroLayout && isCompact) ? styles.compact : '',
    state !== 'thinking' && !isHeroLayout && visibleChips.length > 0 ? styles.withChips : '',
    state !== 'thinking' && !isCompact ? styles.expanded : '',
    isInteractive ? styles.interactive : '',
  ]
    .filter(Boolean)
    .join(' ')

  const bannerGlow = useGlowSurface(bannerSweep.borderSweep, bannerSweep.sweepFading)
  const bannerMotion = useMotionSurface(
    bannerSweep.borderSweep,
    bannerSweep.sweepFading,
    false,
    bannerSweep.motionOriginStyle,
  )

  const surfaceClassName = [
    styles.surface,
    state !== 'output' &&
    (bannerSweep.isSweepVisible || quietThinkingSweep.showSweep || motionThinkingSweep)
      ? styles.surfaceDuringSweep
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  const headerContent = (
    <div
      className={[
        styles.headerRow,
        showActionButton && state !== 'thinking' ? styles.headerRowWithAction : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.leading}>
        {(isThinking || showTweakOutputSparkle) && (
          <span
            className={[
              styles.headerSparkle,
              showTweakOutputSparkle ? styles.headerSparkleReveal : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden="true"
          >
            {isThinking ? (
              <SparkleThinkingLogo
                size={20}
                fitSize={20}
                animation="loop"
                tone="mono"
              />
            ) : (
              <span className={styles.headerSparkleGlyph} />
            )}
          </span>
        )}
        <div className={styles.textContainer}>
          {isHeroLayout ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={displayTitle}
                className={titleClassName}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={textTransition}
              >
                {displayTitle}
              </motion.p>
            </AnimatePresence>
          ) : (
            <>
              <p className={titleClassName}>{displayTitle}</p>
              {description && state !== 'thinking' && (
                <p className={styles.description}>{description}</p>
              )}
            </>
          )}
        </div>
        <InfoIcon className={styles.headerInfoIcon} aria-hidden="true" />
      </div>
      {showActionButton && state !== 'thinking' && (
        <ActionButton
          label={cta}
          prefixIcon
          suffixIcon
          containedInBanner
          active={ctaActive}
          onClick={onViewInsights}
        />
      )}
    </div>
  )

  const outputContent = (
    <AnimatePresence>
      {state === 'output' && (() => {
        let revealOffset = 0
        const nextDelay = (text: string) => {
          const delay = revealOffset
          revealOffset = estimateGeneratingRevealMs(text, revealOffset) + 80
          return delay
        }
        const introDelay = nextDelay(summaryIntro)

        return (
        <>
          <motion.div
            key="output-slot"
            className={styles.slot}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={contentTransition}
          >
            <div className={styles.summaryBody}>
              <p className={styles.summaryIntro}>
                <AiGeneratingText
                  text={summaryIntro}
                  active
                  startDelayMs={introDelay}
                />
              </p>
              {summaryBullets.length > 0 && (
                <ul className={styles.summaryList}>
                  {summaryBullets.map((bullet) => (
                    <AiGeneratingText
                      key={bullet}
                      as="li"
                      className={styles.summaryListItem}
                      text={bullet}
                      active
                      startDelayMs={nextDelay(bullet)}
                      gateUntilStarted
                    />
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
          <motion.div
            key="output-footer"
            className={styles.footer}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={contentTransition}
          >
            <div className={styles.disclaimer}>
              <span>Generated by Freshworks AI</span>
              <InfoIcon className={styles.infoIcon} />
            </div>
            <div className={styles.feedback} aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                {feedbackChoice === null ? (
                  <motion.div
                    key="ask"
                    className={styles.feedbackAsk}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={textTransition}
                  >
                    <span className={styles.feedbackLabel}>Helpful?</span>
                    <button
                      type="button"
                      className={[styles.feedbackBtn, 'ai-pressable'].join(' ')}
                      onClick={() => handleFeedback(true)}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={[styles.feedbackBtn, 'ai-pressable'].join(' ')}
                      onClick={() => handleFeedback(false)}
                    >
                      No
                    </button>
                  </motion.div>
                ) : (
                  <motion.p
                    key="thanks"
                    className={styles.feedbackThanks}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={textTransition}
                  >
                    Thanks for your feedback!
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
        )
      })()}
    </AnimatePresence>
  )

  const chipRow =
    visibleChips.length > 0 && state !== 'thinking' ? (
      <div className={styles.chipRow}>
        {useMotionInsightRow ? (
          <BannerInsightRow chips={visibleChips} onChipClick={onChipClick} />
        ) : (
          visibleChips.map((chip, index) => (
            <Fragment key={chip.id}>
              {index > 0 && <span className={styles.divider} aria-hidden="true" />}
              <AIChip
                label={chip.label}
                count={chip.count}
                containedInBanner
                state={getChipState(hoveredChipId, chip.id)}
                sweepActive={false}
                sweepFading={false}
                onClick={() => onChipClick?.(chip.id)}
                onPointerEnter={() => setHoveredChipId(chip.id)}
                onPointerLeave={() => {
                  setHoveredChipId((id) => (id === chip.id ? null : id))
                }}
              />
            </Fragment>
          ))
        )}
      </div>
    ) : null

  return (
    <motion.div
      className={rootClassName}
      style={bannerMotion.motionOriginStyle}
      {...bannerGlow.glowWrapProps}
      {...bannerMotion.motionWrapProps}
      animate={{ height }}
      transition={heightTransition}
      onPointerEnter={isInteractive ? handleHeroPointerEnter : undefined}
      onPointerLeave={isInteractive ? handleHeroPointerLeave : undefined}
      onClick={isInteractive ? onSummarize : undefined}
      onKeyDown={handleKeyDown}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-busy={state === 'thinking'}
      aria-live={state === 'thinking' ? 'polite' : undefined}
    >
      <HoverMotionOverlay
        active={bannerSweep.borderSweep}
        fading={bannerSweep.sweepFading}
        sweepKey={bannerSweep.sweepKey}
        variant="banner"
        onAnimationEnd={bannerSweep.handleBorderAnimationEnd}
        onTransitionEnd={bannerSweep.handleSweepTransitionEnd}
      />
      {quietThinkingSweep.showSweep && (
        <HoverSweepOverlay
          active={quietThinkingSweep.showSweep}
          loop={quietThinkingSweep.showSweep}
          sweepKey={quietThinkingSweep.sweepKey}
          variant="banner"
        />
      )}
      {motionThinkingSweep && hoverMotion !== 'tweak' && (
        <HoverMotionBorderShineOverlay tone="hover" />
      )}
      {/* Static border at rest/hover/output/thinking; hidden only during Sweep/Glow stroke pass */}
      {!(
        (hoverMotion === 'sweep' || hoverMotion === 'glow') &&
        state !== 'thinking' &&
        (bannerSweep.borderSweep || bannerSweep.sweepFading)
      ) && (
          <div
            className={[
              isTonedChrome ? styles.quietStaticBorder : styles.outputBorder,
              state === 'thinking' ? styles.thinkingBorderRing : '',
              'gradient-ring-mask',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden="true"
          />
        )}
      <div ref={containerRef} className={surfaceClassName}>
        <div className={styles.container}>
          {headerContent}
          {chipRow}
          {outputContent}
        </div>
      </div>
    </motion.div>
  )
}

export interface ThinkingSequenceState {
  label: string | undefined
  stepIndex: number
}

export function useThinkingSequence(
  active: boolean,
  steps: readonly string[],
  stepDurationMs = 1200,
  onComplete?: () => void,
): ThinkingSequenceState {
  const [stepIndex, setStepIndex] = useState(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!active) {
      setStepIndex(0)
      return
    }

    if (stepIndex >= steps.length - 1) {
      const timer = window.setTimeout(() => onCompleteRef.current?.(), stepDurationMs)
      return () => window.clearTimeout(timer)
    }

    const timer = window.setTimeout(() => {
      setStepIndex((i) => i + 1)
    }, stepDurationMs)

    return () => window.clearTimeout(timer)
  }, [active, stepIndex, steps.length, stepDurationMs])

  return {
    label: steps[stepIndex] ?? steps[0],
    stepIndex,
  }
}

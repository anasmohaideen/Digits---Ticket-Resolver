import { SparkleThinkingLogo } from '../SparkleThinkingLogo/SparkleThinkingLogo'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  StopColoredIcon,
} from '../shared/IllustrationIcons'
import {
  AIThinkingStep,
  type AIThinkingStepStage,
} from '../AIThinkingStep/AIThinkingStep'
import { useThinkingTextClass } from '../../ActionBanner/useThinkingTextClass'
import { useState } from 'react'
import styles from './AIThinking.module.css'

export type AIThinkingPhase = 'active' | 'complete'

export interface AIThinkingStepItem {
  id?: string
  label: string
  stage: AIThinkingStepStage
}

export interface AIThinkingProps {
  phase?: AIThinkingPhase
  /** When false: status + stop only (quick think). When true: chevron + steps disclosure. */
  details?: boolean
  /** Collapsed active status, or complete summary (e.g. "Ran 6 tools"). */
  thinkingText?: string
  steps?: readonly AIThinkingStepItem[]
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  onStop?: () => void
  className?: string
}

/**
 * Messages Think — Processing shows Dew AI Icon 20 + Stop; Completed hides both (Figma 4015:21788).
 * Details on: whole header row toggles expand/collapse; Stop stays a separate control.
 */
export function AIThinking({
  phase = 'active',
  details = false,
  thinkingText = 'Analysing the content',
  steps,
  expanded: expandedProp,
  onExpandedChange,
  onStop,
  className = '',
}: AIThinkingProps) {
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(false)
  const isControlled = expandedProp !== undefined
  const expanded = isControlled ? expandedProp : uncontrolledExpanded

  const isActive = phase === 'active'
  const showSteps = details && expanded && (steps?.length ?? 0) > 0
  const showStop = isActive && typeof onStop === 'function'
  const showIcon = isActive

  const setExpanded = (next: boolean) => {
    if (!isControlled) setUncontrolledExpanded(next)
    onExpandedChange?.(next)
  }

  const headerLabel = details && expanded && isActive ? 'Thinking' : thinkingText
  const thinkingTextClass = useThinkingTextClass()

  const labelClass = [
    styles.label,
    details && expanded && isActive
      ? styles.labelQuiet
      : isActive
        ? thinkingTextClass
        : styles.labelComplete,
  ]
    .filter(Boolean)
    .join(' ')

  const icon = showIcon ? (
    <span className={styles.iconSlot} aria-hidden="true">
      <SparkleThinkingLogo size={20} fitSize={20} animation="loop" tone="mono" />
    </span>
  ) : null

  const chevron = (
    <span className={styles.chevronButton} aria-hidden="true">
      {expanded ? (
        <ChevronDownIcon className={styles.chevronDown} />
      ) : (
        <ChevronRightIcon className={styles.chevronRight} />
      )}
    </span>
  )

  const headerBody = (
    <>
      {icon}
      <div className={styles.textContainer}>
        <p className={labelClass}>{headerLabel}</p>
        {details ? chevron : null}
      </div>
    </>
  )

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-phase={phase}
      data-details={details ? 'true' : 'false'}
      data-expanded={expanded ? 'true' : 'false'}
      aria-busy={isActive || undefined}
    >
      <div className={styles.snippet}>
        {details ? (
          <button
            type="button"
            className={styles.headerToggle}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse thinking steps' : 'Expand thinking steps'}
            onClick={() => setExpanded(!expanded)}
          >
            {headerBody}
          </button>
        ) : (
          <div className={styles.message}>{headerBody}</div>
        )}
        {showStop && (
          <button
            type="button"
            className={styles.stopButton}
            aria-label="Stop generating"
            onClick={onStop}
          >
            <StopColoredIcon className={styles.stopIcon} />
          </button>
        )}
      </div>

      {showSteps && (
        <div className={styles.steps} role="list">
          {steps!.map((step, index) => (
            <AIThinkingStep
              key={step.id ?? `${step.label}-${index}`}
              label={step.label}
              stage={step.stage}
            />
          ))}
        </div>
      )}
    </div>
  )
}

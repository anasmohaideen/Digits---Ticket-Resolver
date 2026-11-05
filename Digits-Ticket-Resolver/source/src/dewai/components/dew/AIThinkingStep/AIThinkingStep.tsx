import {
  SpinnerLoaderIcon,
  TickIcon,
} from '../shared/IllustrationIcons'
import { useThinkingTextClass } from '../../ActionBanner/useThinkingTextClass'
import styles from './AIThinkingStep.module.css'

export type AIThinkingStepStage = 'completed' | 'thinking'

export interface AIThinkingStepProps {
  label: string
  stage?: AIThinkingStepStage
  className?: string
}

/** Internal atom for AI Thinking compositions — Dew Tick 16 or Spinner Loader 12. */
export function AIThinkingStep({
  label,
  stage = 'completed',
  className = '',
}: AIThinkingStepProps) {
  const isThinking = stage === 'thinking'
  const thinkingTextClass = useThinkingTextClass()

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-stage={stage}
    >
      <span
        className={[
          styles.iconSlot,
          isThinking ? styles.iconSlotThinking : styles.iconSlotCompleted,
        ].join(' ')}
        aria-hidden="true"
      >
        <span
          className={[
            styles.iconLayer,
            isThinking ? styles.iconLayerVisible : styles.iconLayerHidden,
          ].join(' ')}
        >
          <SpinnerLoaderIcon className={styles.spinner} />
        </span>
        <span
          className={[
            styles.iconLayer,
            isThinking ? styles.iconLayerHidden : styles.iconLayerVisible,
          ].join(' ')}
        >
          <TickIcon className={styles.tick} />
        </span>
      </span>
      <p
        className={[
          styles.label,
          isThinking ? `${styles.labelThinking} ${thinkingTextClass}` : styles.labelCompleted,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {label}
      </p>
    </div>
  )
}

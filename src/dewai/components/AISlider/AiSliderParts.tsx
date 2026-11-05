import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { AiPromptSuggestion } from '../dew/AiPromptSuggestion/AiPromptSuggestion'
import { DewAiIcon } from '../dew/DewAiIcon/DewAiIcon'
import { DewAiWelcomeIntro } from '../dew/DewAiIcon/DewAiWelcomeIntro'
import styles from './AISlider.module.css'

/* Ported from the AI Design System's AISlider: welcome block, prompt suggestions and the chip-to-message morph. */
export const CHIP_LOADING_MS = 1600
export const REDUCED_MOTION_LOADING_MS = 200
export const MORPH_MS = 480
export const morphLayoutEase = [0.22, 1, 0.36, 1] as const

export type PromptSelection = { prompt: string; stage: 'chip-loading' | 'morphing' }
export const promptFlyId = (prompt: string) => `prompt-fly-${prompt}`
export const sliderStyles = styles

export function userMorphLayoutProps(
  morphPrompt: string | null | undefined,
  turnText: string,
  reduceMotion: boolean | null,
  onMorphComplete?: () => void,
) {
  if (reduceMotion || !morphPrompt || morphPrompt !== turnText) return {}
  return {
    layoutId: promptFlyId(morphPrompt),
    className: styles.promptMorphTarget,
    transition: { layout: { duration: MORPH_MS / 1000, ease: morphLayoutEase } },
    onLayoutAnimationComplete: onMorphComplete,
  }
}


export function WelcomeContent({ userName, introKey = 0 }: { userName: string; introKey?: number }) {
  const reduceMotion = useReducedMotion()
  const [logoReady, setLogoReady] = useState(Boolean(reduceMotion))

  useEffect(() => {
    setLogoReady(Boolean(reduceMotion))
  }, [introKey, reduceMotion])

  return (
    <div className={styles.welcomeContent}>
      <div className={styles.welcomeBlock}>
        <div className={styles.welcomeLogoSlot}>
          {logoReady ? (
            <DewAiIcon size={64} bg="blank" showName={false} showDewLogo={false} />
          ) : (
            <DewAiWelcomeIntro
              key={introKey}
              size={64}
              onIntroComplete={() => setLogoReady(true)}
            />
          )}
        </div>
        <div className={styles.welcomeTextBlock}>
          <p className={styles.welcomePrefix}>Welcome,</p>
          <p className={styles.welcomeName}>{userName}</p>
        </div>
      </div>
    </div>
  )
}

export function PromptSuggestions({
  prompts,
  selection,
  onSelectPrompt,
  reduceMotion,
}: {
  prompts: readonly string[]
  selection: PromptSelection | null
  onSelectPrompt: (prompt: string) => void
  reduceMotion: boolean
}) {
  return (
    <div className={styles.promptList} aria-busy={selection != null || undefined}>
      {prompts.map((prompt) => {
        const isSelected = selection?.prompt === prompt
        const isBusy = selection != null
        // Unmount selected chip on morph so layoutId can FLIP into UserMessage
        if (isSelected && selection.stage === 'morphing' && !reduceMotion) {
          return null
        }

        const chipState = isSelected
          ? 'loading'
          : isBusy
            ? 'disabled'
            : undefined

        const layoutId =
          !reduceMotion && isSelected && selection.stage === 'chip-loading'
            ? promptFlyId(prompt)
            : undefined

        // Only clip collapsing siblings — selected loading needs overflow visible for softSweep
        const clipForCollapse =
          isBusy && !isSelected && selection?.stage === 'morphing'

        return (
          <motion.div
            key={prompt}
            className={styles.promptItem}
            layoutId={layoutId}
            initial={false}
            animate={{
              opacity: isBusy && !isSelected ? 0 : 1,
              height: clipForCollapse ? 0 : 'auto',
            }}
            transition={{ duration: 0.28, ease: morphLayoutEase }}
            style={{ overflow: clipForCollapse ? 'hidden' : 'visible' }}
          >
            <AiPromptSuggestion
              label={prompt}
              state={chipState}
              onClick={isBusy ? undefined : () => onSelectPrompt(prompt)}
            />
          </motion.div>
        )
      })}
    </div>
  )
}


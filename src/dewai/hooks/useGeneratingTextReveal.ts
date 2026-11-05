import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

export const GENERATING_MS_PER_CHAR = 11
/** Characters at the leading edge that carry the generation glow. */
export const GENERATING_GLOW_TAIL = 16
const MS_PER_CHAR = GENERATING_MS_PER_CHAR
const MIN_REVEAL_MS = 280
const GLOW_TAIL = GENERATING_GLOW_TAIL

export interface GeneratingTextReveal {
  solidText: string
  glowText: string
  isComplete: boolean
  isGenerating: boolean
  /** True once startDelayMs has elapsed and characters begin revealing */
  hasStarted: boolean
}

export function useGeneratingTextReveal(
  text: string,
  active: boolean,
  startDelayMs = 0,
): GeneratingTextReveal {
  const reduceMotion = useReducedMotion() ?? false
  const [length, setLength] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (!active || !text) {
      setLength(0)
      setHasStarted(false)
      return
    }

    if (reduceMotion) {
      setLength(text.length)
      setHasStarted(true)
      return
    }

    setLength(0)
    setHasStarted(false)
    let frame = 0
    let startTime: number | null = null
    const durationMs = Math.max(text.length * MS_PER_CHAR, MIN_REVEAL_MS)

    const tick = (now: number) => {
      if (startTime === null) startTime = now
      const elapsed = now - startTime - startDelayMs
      if (elapsed < 0) {
        frame = window.requestAnimationFrame(tick)
        return
      }
      setHasStarted(true)
      const progress = Math.min(1, elapsed / durationMs)
      setLength(Math.max(1, Math.ceil(progress * text.length)))
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick)
      }
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [active, reduceMotion, startDelayMs, text])

  const clampedLength = Math.min(length, text.length)
  const solidEnd = Math.max(0, clampedLength - GLOW_TAIL)
  const isComplete = !active || clampedLength >= text.length

  return {
    solidText: text.slice(0, solidEnd),
    glowText: text.slice(solidEnd, clampedLength),
    isComplete,
    isGenerating: active && !isComplete && clampedLength > 0,
    hasStarted: active && (reduceMotion || hasStarted),
  }
}

/** Rough duration for staggering multi-block AI output (intro → bullets, sections). */
export function estimateGeneratingRevealMs(text: string, startDelayMs = 0): number {
  return startDelayMs + Math.max(text.length * MS_PER_CHAR, MIN_REVEAL_MS)
}

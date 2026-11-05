import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react'
import { useThinkingTextClass } from '../../ActionBanner/useThinkingTextClass'
import { useGeneratingTextReveal } from '../../../hooks/useGeneratingTextReveal'
import styles from './AiGeneratingText.module.css'

const GeneratingActivityContext = createContext<{
  generating: boolean
  report: (id: string, generating: boolean) => void
} | null>(null)

/** Lets a parent (AIResponse sparkle) know when nested reply text is still streaming. */
export function GeneratingActivityProvider({ children }: { children: ReactNode }) {
  const [activeIds, setActiveIds] = useState<ReadonlySet<string>>(() => new Set())

  const report = useCallback((id: string, generating: boolean) => {
    setActiveIds((prev) => {
      const has = prev.has(id)
      if (generating === has) return prev
      const next = new Set(prev)
      if (generating) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ generating: activeIds.size > 0, report }),
    [activeIds, report],
  )

  return (
    <GeneratingActivityContext.Provider value={value}>{children}</GeneratingActivityContext.Provider>
  )
}

export function useGeneratingActivity() {
  return useContext(GeneratingActivityContext)?.generating ?? false
}

function useReportGenerating(generating: boolean) {
  const report = useContext(GeneratingActivityContext)?.report
  const id = useId()

  useEffect(() => {
    if (!report) return
    report(id, generating)
    return () => report(id, false)
  }, [generating, id, report])
}

export interface AiGeneratingTextProps {
  text: string
  /** When false, reveal resets. Set true when content should stream in. */
  active?: boolean
  /** Stagger multi-block output (e.g. summary bullets). */
  startDelayMs?: number
  /**
   * When true, render nothing until startDelayMs elapses —
   * prevents empty bullet markers / chips before text begins.
   */
  gateUntilStarted?: boolean
  className?: string
  as?: ElementType
  children?: never
}

/**
 * Streams AI output — all revealed text carries a mild shimmer sweep until complete.
 */
export function AiGeneratingText({
  text,
  active = true,
  startDelayMs = 0,
  gateUntilStarted = false,
  className = '',
  as: Tag = 'span',
}: AiGeneratingTextProps) {
  const shimmerClass = useThinkingTextClass()
  const { solidText, glowText, isComplete, hasStarted } = useGeneratingTextReveal(
    text,
    active,
    startDelayMs,
  )
  useReportGenerating(Boolean(text) && active && !isComplete)

  const shimmerStyle = {
    '--ai-text-shimmer-duration': '2.4s',
    '--ai-text-shine-duration': '2.8s',
  } as CSSProperties

  const visibleText = `${solidText}${glowText}`

  if (!text) return null
  if (gateUntilStarted && !hasStarted) return null

  return (
    <Tag className={className}>
      {isComplete ? (
        text
      ) : (
        <span
          className={[styles.track, styles.generating, shimmerClass].filter(Boolean).join(' ')}
          style={shimmerStyle}
        >
          {visibleText}
        </span>
      )}
    </Tag>
  )
}

/** Hook wrapper for siblings (e.g. ticket chips) that must wait for text reveal. */
export function useRevealGate(text: string, active = true, startDelayMs = 0) {
  return useGeneratingTextReveal(text, active, startDelayMs)
}

export type { GeneratingTextReveal } from '../../../hooks/useGeneratingTextReveal'

import { isMotionLikeMotion, useHoverMotion } from '../../providers/HoverMotionProvider'

/**
 * Thinking-label utility —
 * Motion: mild white shine over Primary.
 * Sweep/Glow/Quiet: mild AI palette over Primary (readable base).
 */
export function useThinkingTextClass(): 'ai-text-shimmer-over-base' | 'ai-text-shine' {
  const { hoverMotion } = useHoverMotion()
  return isMotionLikeMotion(hoverMotion) ? 'ai-text-shine' : 'ai-text-shimmer-over-base'
}

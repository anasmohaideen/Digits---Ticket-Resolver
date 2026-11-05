import type { ComponentProps } from 'react'
import { isMotionLikeMotion, useHoverMotion } from '../../providers/HoverMotionProvider'
import { HoverGlowFxOverlay } from './HoverGlowFxOverlay'
import { HoverSweepOverlay } from './HoverSweepOverlay'

type HoverSweepOverlayProps = ComponentProps<typeof HoverSweepOverlay>

export function HoverMotionOverlay(props: HoverSweepOverlayProps) {
  const { hoverMotion } = useHoverMotion()

  if (hoverMotion === 'quiet' && !props.loop) {
    return null
  }

  if (hoverMotion === 'glow') {
    return <HoverGlowFxOverlay {...props} />
  }

  /* Motion — border-only hover; no Fill R-L wash overlay (prompt loading uses CSS ring). */
  if (isMotionLikeMotion(hoverMotion)) {
    return null
  }

  return <HoverSweepOverlay {...props} />
}

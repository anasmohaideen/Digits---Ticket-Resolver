import type { CSSProperties } from 'react'
import { isMotionLikeMotion, useHoverMotion } from '../../providers/HoverMotionProvider'

interface MotionWrapResult {
  isMotionMode: boolean
  motionWrapProps: Record<string, string | boolean | undefined>
  motionOriginStyle?: CSSProperties
}

export function useMotionSurface(
  active: boolean,
  fading = false,
  loop = false,
  originStyle?: CSSProperties,
): MotionWrapResult {
  const { hoverMotion } = useHoverMotion()
  const isMotionMode = isMotionLikeMotion(hoverMotion)
  const isOn = isMotionMode && (active || fading || loop)

  return {
    isMotionMode,
    motionWrapProps: isOn
      ? {
          'data-motion-hover': 'true',
          ...(fading ? { 'data-motion-fading': 'true' } : {}),
        }
      : {},
    motionOriginStyle: isMotionMode ? originStyle : undefined,
  }
}

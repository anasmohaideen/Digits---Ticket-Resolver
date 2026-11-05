import { useHoverMotion } from '../../providers/HoverMotionProvider'

interface GlowWrapResult {
  isGlowMode: boolean
  glowWrapProps: Record<string, string | boolean | undefined>
}

export function useGlowSurface(
  active: boolean,
  fading = false,
  loop = false,
): GlowWrapResult {
  const { hoverMotion } = useHoverMotion()
  const isGlowMode = hoverMotion === 'glow'
  const isOn = isGlowMode && (active || fading || loop)

  return {
    isGlowMode,
    glowWrapProps: isOn
      ? {
          'data-glow-active': 'true',
          ...(fading ? { 'data-glow-fading': 'true' } : {}),
        }
      : {},
  }
}

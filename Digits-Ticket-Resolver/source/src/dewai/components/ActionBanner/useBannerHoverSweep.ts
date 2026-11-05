import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type AnimationEvent,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent,
} from 'react'
import { isAnimatedHoverMotion, isMotionLikeMotion, useHoverMotion } from '../../providers/HoverMotionProvider'

export type HoverGlowMode = 'chip' | 'banner' | 'button'

interface UseHoverGlowSweepOptions {
  mode: HoverGlowMode
}

const SWEEP_MOTION_END_ANIMATIONS = ['borderRingSweep', 'chipRingSweep'] as const

function originFromPointer(event: ReactPointerEvent<Element>): { x: string; y: string } {
  const target = event.currentTarget
  if (!(target instanceof HTMLElement)) return { x: '50%', y: '50%' }
  const rect = target.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return { x: '50%', y: '50%' }
  const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100))
  const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100))
  return { x: `${x}%`, y: `${y}%` }
}

export function useBannerHoverSweep({ mode }: UseHoverGlowSweepOptions) {
  void mode
  const { hoverMotion } = useHoverMotion()
  const [borderSweep, setBorderSweep] = useState(false)
  const [sweepFading, setSweepFading] = useState(false)
  const [sweepKey, setSweepKey] = useState(0)
  const [entryOrigin, setEntryOrigin] = useState({ x: '50%', y: '50%' })

  const handlePointerEnter = useCallback(
    (event?: ReactPointerEvent<Element>) => {
      if (!isAnimatedHoverMotion(hoverMotion)) return
      if (isMotionLikeMotion(hoverMotion) && event) {
        setEntryOrigin(originFromPointer(event))
      }
      setSweepFading(false)
      setSweepKey((key) => key + 1)
      setBorderSweep(true)
    },
    [hoverMotion],
  )

  const handlePointerLeave = useCallback(() => {
    if (!isAnimatedHoverMotion(hoverMotion)) return
    setBorderSweep((sweep) => {
      setSweepFading((fading) => {
        if (!sweep && !fading) return fading
        return true
      })
      return sweep
    })
  }, [hoverMotion])

  const stopImmediately = useCallback(() => {
    setBorderSweep(false)
    setSweepFading(false)
  }, [])

  const handleBorderAnimationEnd = useCallback(
    (event: AnimationEvent<HTMLDivElement>) => {
      if (hoverMotion === 'glow') return
      if (event.animationName.includes('Loop')) return
      if (!SWEEP_MOTION_END_ANIMATIONS.some((name) => event.animationName.includes(name))) return
      setBorderSweep(false)
      setSweepFading(false)
    },
    [hoverMotion],
  )

  const handleSweepTransitionEnd = useCallback((event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'opacity') return
    setSweepFading((fading) => {
      if (!fading) return fading
      setBorderSweep(false)
      return false
    })
  }, [])

  /* Soft sweep (all variants) + glow use infinite rotation — clear after fade */
  useEffect(() => {
    if (!sweepFading) return
    const timer = window.setTimeout(() => {
      setBorderSweep(false)
      setSweepFading(false)
    }, isMotionLikeMotion(hoverMotion) ? 420 : 350)
    return () => window.clearTimeout(timer)
  }, [sweepFading, hoverMotion])

  const isSweepVisible = borderSweep || sweepFading

  const motionOriginStyle = useMemo((): CSSProperties | undefined => {
    if (!isMotionLikeMotion(hoverMotion)) return undefined
    return {
      ['--motion-ox' as string]: entryOrigin.x,
      ['--motion-oy' as string]: entryOrigin.y,
    }
  }, [hoverMotion, entryOrigin.x, entryOrigin.y])

  return {
    borderSweep,
    sweepFading,
    isSweepVisible,
    sweepKey,
    motionOriginStyle,
    handlePointerEnter,
    handlePointerLeave,
    stopImmediately,
    handleBorderAnimationEnd,
    handleSweepTransitionEnd,
  }
}

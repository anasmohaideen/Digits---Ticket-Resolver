import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type HoverMotion = 'sweep' | 'glow' | 'quiet' | 'motion' | 'tweak'

const HOVER_MOTIONS: readonly HoverMotion[] = ['sweep', 'glow', 'quiet', 'motion', 'tweak']

export const DEFAULT_HOVER_MOTION: HoverMotion = 'tweak'

const STORAGE_KEY = 'dew-ai-hover-motion'

interface HoverMotionContextValue {
  hoverMotion: HoverMotion
  setHoverMotion: (motion: HoverMotion) => void
  isAnimatedHover: boolean
  isTonedChrome: boolean
}

const HoverMotionContext = createContext<HoverMotionContextValue | null>(null)

function getInitialHoverMotion(): HoverMotion {
  if (typeof window === 'undefined') return DEFAULT_HOVER_MOTION

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (HOVER_MOTIONS.includes(stored as HoverMotion)) return stored as HoverMotion

  return DEFAULT_HOVER_MOTION
}

function applyHoverMotion(motion: HoverMotion) {
  if (typeof document === 'undefined') return

  document.documentElement.setAttribute('data-ai-motion', motion)

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, motion)
  }
}

if (typeof document !== 'undefined') {
  applyHoverMotion(getInitialHoverMotion())
}

export function isAnimatedHoverMotion(motion: HoverMotion): boolean {
  return motion === 'sweep' || motion === 'glow' || motion === 'motion' || motion === 'tweak'
}

/** Motion + Tweak — border-only hover chrome (no Fill R-L wash overlay). */
export function isMotionLikeMotion(motion: HoverMotion): boolean {
  return motion === 'motion' || motion === 'tweak'
}

/** Quiet chrome shared by Quiet + Motion + Tweak (Fill R-L / Static ladder / messaging layout). */
export function isTonedChromeMotion(motion: HoverMotion): boolean {
  return motion === 'quiet' || motion === 'motion' || motion === 'tweak'
}

interface HoverMotionProviderProps {
  children: ReactNode
}

export function HoverMotionProvider({ children }: HoverMotionProviderProps) {
  const [hoverMotion, setHoverMotionState] = useState<HoverMotion>(getInitialHoverMotion)

  useEffect(() => {
    applyHoverMotion(hoverMotion)
  }, [hoverMotion])

  const setHoverMotion = useCallback((motion: HoverMotion) => {
    setHoverMotionState(motion)
  }, [])

  const value = useMemo(
    () => ({
      hoverMotion,
      setHoverMotion,
      isAnimatedHover: isAnimatedHoverMotion(hoverMotion),
      isTonedChrome: isTonedChromeMotion(hoverMotion),
    }),
    [hoverMotion, setHoverMotion],
  )

  return <HoverMotionContext.Provider value={value}>{children}</HoverMotionContext.Provider>
}

export function useHoverMotion() {
  const context = useContext(HoverMotionContext)
  if (!context) {
    throw new Error('useHoverMotion must be used within HoverMotionProvider')
  }
  return context
}

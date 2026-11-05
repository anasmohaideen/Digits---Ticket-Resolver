import { useLayoutEffect, useState, type RefObject } from 'react'
import { measureSweepDuration, SWEEP_REFERENCE_DURATION } from './sweepDuration'

export function useSweepDuration(elementRef: RefObject<HTMLElement | null>): number {
  const [duration, setDuration] = useState(SWEEP_REFERENCE_DURATION)

  useLayoutEffect(() => {
    const element = elementRef.current
    if (!element) return

    const update = () => {
      setDuration(measureSweepDuration(element))
    }

    update()

    const observer = new ResizeObserver(update)
    observer.observe(element)

    return () => observer.disconnect()
  }, [elementRef])

  return duration
}

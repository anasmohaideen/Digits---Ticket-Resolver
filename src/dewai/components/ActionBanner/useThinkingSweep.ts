import { useEffect, useState } from 'react'

/** Drives V1 soft Sweep overlay while a component is in a thinking / loading state. */
export function useThinkingSweep(active: boolean) {
  const [sweepKey, setSweepKey] = useState(0)

  useEffect(() => {
    if (active) {
      setSweepKey((key) => key + 1)
    }
  }, [active])

  return { showSweep: active, sweepKey }
}

import {
  measureRoundedRectDimensions,
  perimeterOf,
  roundedRectPerimeter,
  borderAngleAtLength,
  buildArcLengthTable,
  monotonicAngleAtLength,
  type ArcLengthSample,
  type RoundedRectDimensions,
} from './sweepGeometry'

export {
  roundedRectPerimeter,
  measureRoundedRectDimensions,
  perimeterOf,
  borderAngleAtLength,
  buildArcLengthTable,
  monotonicAngleAtLength,
  type ArcLengthSample,
  type RoundedRectDimensions,
}

/** Reference button-sized control — calibrates 2.25s baseline duration. */
export const SWEEP_REFERENCE_PERIMETER = 320

/** Baseline hover sweep duration at reference perimeter (seconds). */
export const SWEEP_REFERENCE_DURATION = 2.25

/** Total rotation during one hover pass (540deg = 1.5 laps). */
export const SWEEP_ROTATION_LAPS = 1.5

export const SWEEP_DURATION_MIN = 1.5
export const SWEEP_DURATION_MAX = 8

/** Scale duration with perimeter so linear stroke speed stays constant. */
export function perimeterToSweepDuration(perimeter: number): number {
  const scaled = SWEEP_REFERENCE_DURATION * (perimeter / SWEEP_REFERENCE_PERIMETER)
  return Math.min(SWEEP_DURATION_MAX, Math.max(SWEEP_DURATION_MIN, scaled))
}

export function measureSweepDuration(element: HTMLElement): number {
  const perimeter = perimeterOf(measureRoundedRectDimensions(element))
  return perimeterToSweepDuration(perimeter)
}

export function measurePerimeter(element: HTMLElement): number {
  return perimeterOf(measureRoundedRectDimensions(element))
}

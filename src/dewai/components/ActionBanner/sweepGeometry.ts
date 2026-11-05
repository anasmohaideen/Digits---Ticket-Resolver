export interface RoundedRectDimensions {
  width: number
  height: number
  radius: number
}

export interface ArcLengthSample {
  length: number
  angle: number
}

export function clampCornerRadius(width: number, height: number, radius: number): number {
  return Math.max(0, Math.min(radius, width / 2, height / 2))
}

export function roundedRectPerimeter(width: number, height: number, radius: number): number {
  const r = clampCornerRadius(width, height, radius)
  return 2 * (width + height - 2 * r) + 2 * Math.PI * r
}

export function perimeterOf(dims: RoundedRectDimensions): number {
  return roundedRectPerimeter(dims.width, dims.height, dims.radius)
}

function readCornerRadius(style: CSSStyleDeclaration, width: number, height: number): number {
  const corners = [
    style.borderTopLeftRadius,
    style.borderTopRightRadius,
    style.borderBottomRightRadius,
    style.borderBottomLeftRadius,
  ]

  const radii = corners
    .map((value) => parseFloat(value))
    .filter((value) => Number.isFinite(value) && value > 0)

  if (radii.length === 0) return 0

  return clampCornerRadius(width, height, Math.max(...radii))
}

export function measureRoundedRectDimensions(element: HTMLElement): RoundedRectDimensions {
  const { width, height } = element.getBoundingClientRect()
  if (width <= 0 || height <= 0) {
    return { width: 320, height: 40, radius: 8 }
  }

  const radius = readCornerRadius(getComputedStyle(element), width, height)
  return { width, height, radius }
}

function normalizeArcLength(s: number, perimeter: number): number {
  if (perimeter <= 0) return 0
  return ((s % perimeter) + perimeter) % perimeter
}

/** Border point at arc distance s, clockwise from top-center. */
export function pointOnBorderAtLength(s: number, dims: RoundedRectDimensions): { x: number; y: number } {
  const { width: w, height: h, radius: r } = dims
  const perimeter = perimeterOf(dims)
  const d = normalizeArcLength(s, perimeter)

  const topHalf = w / 2 - r
  const topFull = w - 2 * r
  const side = h - 2 * r
  const arc = (Math.PI * r) / 2

  const segments = [topHalf, arc, side, arc, topFull, arc, side, arc, topHalf]
  let traveled = 0

  for (let index = 0; index < segments.length; index += 1) {
    const segLen = segments[index]
    if (d <= traveled + segLen) {
      const t = d - traveled
      return pointOnSegment(index, t, r, w, h, arc)
    }
    traveled += segLen
  }

  return { x: w / 2, y: 0 }
}

function pointOnSegment(
  index: number,
  t: number,
  r: number,
  w: number,
  h: number,
  arc: number,
): { x: number; y: number } {
  switch (index) {
    case 0:
      return { x: w / 2 + t, y: 0 }
    case 1: {
      const angle = -Math.PI / 2 + (t / arc) * (Math.PI / 2)
      return { x: w - r + r * Math.cos(angle), y: r + r * Math.sin(angle) }
    }
    case 2:
      return { x: w, y: r + t }
    case 3: {
      const angle = (t / arc) * (Math.PI / 2)
      return { x: w - r + r * Math.cos(angle), y: h - r + r * Math.sin(angle) }
    }
    case 4:
      return { x: w - r - t, y: h }
    case 5: {
      const angle = Math.PI / 2 + (t / arc) * (Math.PI / 2)
      return { x: r + r * Math.cos(angle), y: h - r + r * Math.sin(angle) }
    }
    case 6:
      return { x: 0, y: h - r - t }
    case 7: {
      const angle = Math.PI + (t / arc) * (Math.PI / 2)
      return { x: r + r * Math.cos(angle), y: r + r * Math.sin(angle) }
    }
    case 8:
      return { x: r + t, y: 0 }
    default:
      return { x: w / 2, y: 0 }
  }
}

/** CSS conic-gradient `from` angle so the highlight leader sits at arc distance s. */
export function borderAngleAtLength(s: number, dims: RoundedRectDimensions): number {
  const { x, y } = pointOnBorderAtLength(s, dims)
  const cx = dims.width / 2
  const cy = dims.height / 2
  return (Math.atan2(x - cx, cy - y) * 180) / Math.PI
}

function interpolateAngleTable(table: ArcLengthSample[], arcLength: number): number {
  if (table.length === 0) return 0
  if (arcLength <= table[0].length) return table[0].angle

  for (let i = 1; i < table.length; i += 1) {
    const next = table[i]
    if (arcLength <= next.length) {
      const prev = table[i - 1]
      const span = next.length - prev.length
      if (span <= 0) return next.angle
      const t = (arcLength - prev.length) / span
      return prev.angle + (next.angle - prev.angle) * t
    }
  }

  return table[table.length - 1].angle
}

/**
 * Arc-length table with monotonically increasing conic angles.
 * Raw border atan2 angles wrap (0→180→0); unwrapping keeps the highlight
 * moving forward at constant px/s without pausing mid-animation.
 */
export function buildArcLengthTable(dims: RoundedRectDimensions, stepPx = 2): ArcLengthSample[] {
  const perimeter = perimeterOf(dims)
  if (perimeter <= 0) return [{ length: 0, angle: 0 }]

  const samples: ArcLengthSample[] = [{ length: 0, angle: 0 }]
  let cumulativeAngle = 0
  let prevRaw = borderAngleAtLength(0, dims)

  for (let length = stepPx; length < perimeter; length += stepPx) {
    const raw = borderAngleAtLength(length, dims)
    let delta = raw - prevRaw
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    cumulativeAngle += delta
    prevRaw = raw
    samples.push({ length, angle: cumulativeAngle })
  }

  let delta = borderAngleAtLength(0, dims) - prevRaw
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  cumulativeAngle += delta
  samples.push({ length: perimeter, angle: cumulativeAngle })

  return samples
}

/** Monotonic conic angle for unwrapped arc distance (supports multi-lap sweeps). */
export function monotonicAngleAtLength(
  unwrappedS: number,
  table: ArcLengthSample[],
  perimeter: number,
): number {
  if (table.length === 0 || perimeter <= 0) return 0

  const laps = Math.floor(unwrappedS / perimeter)
  const localS = unwrappedS - laps * perimeter
  const anglePerLap = table[table.length - 1].angle

  return interpolateAngleTable(table, localS) + laps * anglePerLap
}

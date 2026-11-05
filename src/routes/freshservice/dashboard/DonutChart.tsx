import { chartColor, type Slice } from './dashboard.data';

/**
 * The donut the two "Unresolved Tickets by ..." widgets draw.
 *
 * Geometry read straight off the live chart's arc path, which starts at
 * y = 42.25 on a radius of 85.25 and picks its inner edge up at y = 76.35:
 *
 *   plot area 527 x 280      centre (253.5, 127.5)
 *   outer radius 85.25       inner radius 51.15  (60%, so a 34.1px ring)
 *
 * Drawn as one stroked circle per slice rather than as wedge paths. A wedge
 * path degenerates when a slice is the whole circle, which is precisely the
 * case the live tenant shows, so the stroke-dasharray form is both shorter and
 * the one that survives the single-slice case.
 */
const W = 527;
const H = 280;
const CX = 253.5;
const CY = 127.5;
const R_OUTER = 85.25;
const R_INNER = 51.15;
/** Mid-line of the ring, and the stroke width that reproduces its two edges. */
const R_MID = (R_OUTER + R_INNER) / 2;
const THICKNESS = R_OUTER - R_INNER;
const CIRCUMFERENCE = 2 * Math.PI * R_MID;

/** Where a callout's elbow sits, and how long its horizontal stub runs. */
const ELBOW = R_OUTER + 22;
const STUB = 10;

export default function DonutChart({ slices, unit = 'tickets' }: { slices: Slice[]; unit?: string }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (!total) return null;

  let consumed = 0;
  const arcs = slices.map((slice, index) => {
    const fraction = slice.value / total;
    const start = consumed;
    consumed += fraction;
    return { ...slice, index, fraction, mid: 2 * Math.PI * (start + fraction / 2), start };
  });

  return (
    /* Boxed to the plot area's own 527px rather than stretched to the card.
       Left to fill a 578px card the ring would come out ~9% oversized, which
       reads as a different chart next to the live one. */
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
      }}
    >
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${total} ${unit}: ${slices.map((s) => `${s.label} ${s.value}`).join(', ')}`}
      style={{ display: 'block', width: '100%', maxWidth: `${W}px`, height: 'auto' }}
    >
      {/* Rotated so slice one begins at twelve o'clock, matching the live chart. */}
      <g transform={`rotate(-90 ${CX} ${CY})`}>
        {arcs.map((arc) => (
          <circle
            key={arc.label}
            cx={CX}
            cy={CY}
            r={R_MID}
            fill="none"
            stroke={chartColor(arc.index)}
            strokeWidth={THICKNESS}
            strokeDasharray={`${arc.fraction * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={-arc.start * CIRCUMFERENCE}
          />
        ))}
      </g>

      {arcs.map((arc) => (
        <Callout key={arc.label} label={arc.label} value={arc.value} mid={arc.mid} />
      ))}

      {/* 22px/700 over 14px/500, both --color-text-primary, as measured. */}
      <text
        x={CX}
        y={CY - 2}
        textAnchor="middle"
        style={{ fontSize: '22px', fontWeight: 700, fill: 'var(--color-text-primary)' }}
      >
        {total}
      </text>
      <text
        x={CX}
        y={CY + 22}
        textAnchor="middle"
        style={{ fontSize: '14px', fontWeight: 500, fill: 'var(--color-text-primary)' }}
      >
        {unit}
      </text>
    </svg>
    </div>
  );
}

/**
 * A leader line out of the ring and the two-line label it carries. Live puts
 * the label and its count on separate lines — "Low" over "(5)".
 */
function Callout({ label, value, mid }: { label: string; value: number; mid: number }) {
  const sin = Math.sin(mid);
  const cos = Math.cos(mid);
  // Near the top or the bottom of the ring a horizontal stub would double back
  // over the chart, so those callouts run straight out and centre themselves.
  const dir = Math.abs(sin) < 0.25 ? 0 : Math.sign(sin);

  const from = { x: CX + R_OUTER * sin, y: CY - R_OUTER * cos };
  const elbow = { x: CX + ELBOW * sin, y: CY - ELBOW * cos };
  const end = { x: elbow.x + dir * STUB, y: elbow.y };

  const textX = end.x + dir * 4;
  const anchor = dir > 0 ? 'start' : dir < 0 ? 'end' : 'middle';
  // Straight-out callouts sit below the ring when they point down, above it
  // when they point up, so the text never overlaps the arc it belongs to.
  const textY = dir === 0 ? (cos < 0 ? end.y + 14 : end.y - 20) : end.y - 3;

  return (
    <g>
      <path
        d={`M ${from.x} ${from.y} L ${elbow.x} ${elbow.y}${dir ? ` L ${end.x} ${end.y}` : ''}`}
        fill="none"
        stroke="var(--color-boundary-divider)"
        strokeWidth={1}
      />
      <text
        x={textX}
        y={textY}
        textAnchor={anchor}
        style={{ fontSize: '14px', fontWeight: 600, fill: 'var(--color-text-primary)' }}
      >
        {label}
      </text>
      <text
        x={textX}
        y={textY + 17}
        textAnchor={anchor}
        style={{ fontSize: '14px', fontWeight: 600, fill: 'var(--color-text-primary)' }}
      >
        ({value})
      </text>
    </g>
  );
}

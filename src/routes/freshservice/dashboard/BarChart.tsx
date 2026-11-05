import { chartColor, type Slice } from './dashboard.data';

/**
 * The horizontal bar widget.
 *
 * Measured off the live chart's rects: a 12px bar on rx 8, so fully rounded,
 * running over a track filled with --color-fill-base, with the bars pitched
 * 62.5px apart. One series across four categories, which is why every bar
 * takes the same colour rather than cycling the palette.
 *
 * The live series fills with --color-chart-category-15; that is index 2 of the
 * palette run, and the default below.
 *
 * One deliberate departure: live's category labels render in Highcharts' own
 * #666 default rather than a Dew token, so the rebuild uses
 * --color-text-secondary and lets the theme own the colour.
 */
const BAR_THICKNESS = 12;

export default function BarChart({ slices, colorIndex = 2 }: { slices: Slice[]; colorIndex?: number }) {
  // Live scales to the tallest bar, not to a rounded axis maximum, so the
  // largest category always runs the full width of its track.
  const max = Math.max(...slices.map((s) => s.value), 1);

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '20px',
        padding: '0 24px 24px',
      }}
    >
      {slices.map((slice) => (
        <div key={slice.label} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--spacing-100)' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>{slice.label}</span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>{slice.value}</span>
          </div>
          <div
            role="img"
            aria-label={`${slice.label}: ${slice.value}`}
            style={{
              height: `${BAR_THICKNESS}px`,
              borderRadius: '999px',
              background: 'var(--color-fill-base)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(slice.value / max) * 100}%`,
                height: '100%',
                borderRadius: '999px',
                background: chartColor(colorIndex),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

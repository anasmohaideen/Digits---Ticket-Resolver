import { ActionBanner } from '../../../../../dewai';
import { SparkleIcon } from '../AiCardChrome';
import { elapsed } from '../format';

/**
 * Option 2 · what a person can ask for when the Digit did not produce it, under
 * the top card ("Find the likely cause and resolution steps", "Generate a
 * resolution note"). They are ambient, not history: they sit there until used,
 * and what they produce lands in the card and, once it exists, in the timeline.
 *
 * Each is the AI Design System's subtle action banner (from the reference
 * build), with the Freddy logo before the title and no info icon. While it
 * works it shows the banner's thinking state, with the seconds so far.
 */
export interface AmbientRow {
  id: string;
  label: string;
  /** Shown while it works, with the seconds so far. */
  busyLabel?: string;
  busy?: boolean;
  seconds?: number;
  onClick: () => void;
}

export default function AmbientRows({ rows }: { rows: AmbientRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="tr-o2-ambient">
      {rows.map((row) => (
        <ActionBanner
          key={row.id}
          appearance="subtle"
          state={row.busy ? 'thinking' : 'default'}
          title={row.label}
          thinkingLabel={`${row.busyLabel ?? row.label} ${elapsed(row.seconds ?? 0)}`}
          onSummarize={row.busy ? undefined : row.onClick}
          leadingIcon={<SparkleIcon size="md" />}
          hideInfoIcon
        />
      ))}
    </div>
  );
}

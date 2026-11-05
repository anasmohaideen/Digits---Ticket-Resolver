import { ActionBanner } from '../../../../../dewai';

/**
 * Option 2 · what a person can ask for when the Digit did not produce it
 * ("Find the likely cause and resolution steps", "Generate a resolution
 * note"). Each is a Dew AI action banner: a hero that starts the work on click,
 * then the thinking state while it runs. What it produces lands in the top card.
 */
export interface AmbientRow {
  id: string;
  label: string;
  /** Shown while it works. */
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
          thinkingLabel={row.busyLabel}
          onSummarize={row.onClick}
        />
      ))}
    </div>
  );
}

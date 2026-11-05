import { Select, TextField } from '@freshworks/dew-components';
import { ASSET_FILTERS, ASSET_TYPE_OPTIONS, PERIOD_PLACEHOLDER } from './assets.data';

/**
 * The asset filter panel.
 *
 * An INLINE panel, not a sheet. Measured at 342 wide against a 1px
 * --color-boundary-border-mildest left edge, running the full height beside
 * the table, with its controls at 232x32. The page keeps its own width behind
 * it and nothing dims, which is what separates it from the Tickets export
 * sheet and the Knowledge Base filter.
 *
 * Eleven fields, in live's order. Three kinds: a select, a plain text box, and
 * a period picker that reads "Select a time period" until it is set.
 *
 * TextField owns its label; Select does not have one (its `labels` prop is an
 * option accessor, not a caption), so those get a span styled to match, plus an
 * aria-label so the control is still named for a screen reader.
 */
/** Matched to what TextField renders above its own input. */
const LABEL = {
  display: 'block',
  marginBlockEnd: 'var(--spacing-050)',
  fontSize: '14px',
  color: 'var(--color-text-primary)',
} as const;

export default function AssetFilterPanel({
  values,
  onChange,
}: {
  values: Record<string, string>;
  onChange: (label: string, value: string) => void;
}) {
  const typeOptions = ASSET_TYPE_OPTIONS.map((t) => ({ value: t, label: t }));
  const yesNo = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
  ];

  return (
    <aside
      aria-label="Filter assets"
      style={{
        width: '342px',
        flexShrink: 0,
        boxSizing: 'border-box',
        borderInlineStart: '1px solid var(--color-boundary-border-mildest)',
        padding: 'var(--spacing-300)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-250)',
        overflowY: 'auto',
      }}
    >
      {ASSET_FILTERS.map((field) =>
        field.kind === 'text' ? (
          <TextField
            key={field.label}
            label={field.label}
            placeholder={
              field.label === 'Used By' ? 'Name or Email' : field.label === 'Location' ? 'Select Location' : ''
            }
            value={values[field.label] ?? ''}
            onChange={(next) => onChange(field.label, String(next ?? ''))}
          />
        ) : (
          <div key={field.label}>
            <span style={LABEL}>{field.label}</span>
            <Select
              aria-label={field.label}
              placeholder={field.kind === 'period' ? PERIOD_PLACEHOLDER : undefined}
              options={field.label === 'Asset Type' ? typeOptions : yesNo}
              /* Asset Type is the only one that starts set, on "All Assets". */
              value={
                field.label === 'Asset Type'
                  ? typeOptions.find((o) => o.value === (values[field.label] ?? typeOptions[0].value)) ?? typeOptions[0]
                  : yesNo.find((o) => o.value === values[field.label]) ?? null
              }
              onValueChange={(next) => onChange(field.label, String(next?.value ?? ''))}
            />
          </div>
        )
      )}
    </aside>
  );
}

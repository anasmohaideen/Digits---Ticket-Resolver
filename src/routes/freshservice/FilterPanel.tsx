import { useState } from 'react';
import { Checkbox, Icon, Search, Select, TextButton, TextField } from '@freshworks/dew-components';
import AdvancedFilter from './changes/AdvancedFilter';
import {
  ADVANCED_APPLY,
  type ChangeFilter,
  CREATED_OPTIONS,
  FILTER_APPLY,
  FILTER_MODES,
  FILTER_SEARCH_PLACEHOLDER,
  PERIOD_PLACEHOLDER,
} from './changes/changes.data';

/**
 * The filter panel shared by Changes and Problems.
 *
 * Same 342 wide inline panel as Assets, on the same 1px left edge, but a richer
 * one: a field search over a field list, closing with Apply rather than
 * filtering as you type.
 *
 * Changes leads with Basic and Advanced modes; Problems has no modes at all,
 * and renders Status as checkboxes where Changes renders it as chips. So the
 * field list and the modes are both passed in rather than assumed.
 *
 * Three fields arrive with values already set, shown as removable chips. That
 * is what makes the view "New & My Open" rather than everything, so they are
 * part of the page rather than decoration.
 */
export default function FilterPanel({
  fields,
  label,
  withModes = false,
}: {
  fields: ChangeFilter[];
  label: string;
  /** Changes has Basic and Advanced; Problems has neither. */
  withModes?: boolean;
}) {
  const [mode, setMode] = useState(FILTER_MODES[0]);
  const advanced = withModes && mode === FILTER_MODES[1];

  /* The applied values are removable. A visible cross that does nothing is
     worse than no cross, so the chips carry state rather than decoration. */
  const [chips, setChips] = useState<Record<string, string[]>>(
    Object.fromEntries(fields.filter((f) => f.chips).map((f) => [f.label, f.chips ?? []]))
  );
  const removeChip = (label: string, chip: string) =>
    setChips((prev) => ({ ...prev, [label]: (prev[label] ?? []).filter((c) => c !== chip) }));

  return (
    <aside
      aria-label={label}
      style={{
        width: '342px',
        flexShrink: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        borderInlineStart: '1px solid var(--color-boundary-border-mildest)',
      }}
    >
      <div style={{ padding: 'var(--spacing-200)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)', overflowY: 'auto', flex: 1 }}>
        {/* Two halves of one control, so they share a track rather than sitting
            as separate buttons. Changes has them; Problems does not. */}
        {withModes && (
          <div style={{ display: 'flex', borderRadius: '8px', border: '1px solid var(--color-boundary-border-mildest)', overflow: 'hidden' }}>
          {FILTER_MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              /* Unselected halves take the container fill on hover, like every
                 other unselected control in the app. */
              className={mode === m ? undefined : 'fs-kb-row'}
              style={{
                flex: 1,
                height: '32px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: mode === m ? 'var(--font-weight-semi-bold)' : 400,
                // Left undefined when not current: an inline background outranks
                // .fs-kb-row:hover and would kill the hover.
                background: mode === m ? 'var(--color-fill-semantic-info-mildest)' : undefined,
                color: mode === m ? 'var(--color-text-brand)' : 'var(--color-text-primary)',
              }}
            >
              {m}
            </button>
          ))}
        </div>
        )}

        {advanced ? (
          <AdvancedFilter />
        ) : (
          <>
            <div className="fs-changes-search">
              <Search placeholder={FILTER_SEARCH_PLACEHOLDER} />
            </div>

            {fields.map((field) => (
              <div key={field.label}>
                {/* TextField renders its own label; a span above it would print
                    every text field's name twice. Only the controls that have no
                    label of their own get one here. */}
                {field.kind !== 'text' && (
                  <span style={{ display: 'block', marginBlockEnd: 'var(--spacing-050)', fontSize: '13px', color: 'var(--color-text-primary)' }}>
                    {field.label}
                  </span>
                )}

                {field.kind === 'chips' ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--spacing-050)', minHeight: '36px', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--color-boundary-border-milder)' }}>
                    {(chips[field.label] ?? []).map((chip) => (
                      <span key={chip} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', height: '24px', paddingInline: '8px', borderRadius: '4px', background: 'var(--color-fill-container)', fontSize: '13px', color: 'var(--color-text-primary)' }}>
                        {chip}
                        <button
                          type="button"
                          aria-label={`Remove ${chip}`}
                          onClick={() => removeChip(field.label, chip)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                        >
                          <Icon name="CrossSmall" size="2xs" color="var(--color-icon-secondary)" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : field.kind === 'checkbox' ? (
                  /* Problems lists its statuses as ticks rather than chips. */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-100)' }}>
                    {(field.options ?? []).map((option) => (
                      <Checkbox
                        key={option}
                        label={option}
                        checked={(field.checked ?? []).includes(option)}
                        onChange={() => undefined}
                      />
                    ))}
                  </div>
                ) : field.kind === 'text' ? (
                  <TextField label={field.label} placeholder={field.placeholder} onChange={() => undefined} />
                ) : (
                  <Select
                    aria-label={field.label}
                    placeholder={field.kind === 'period' ? PERIOD_PLACEHOLDER : field.placeholder}
                    options={(field.label === 'Created' ? CREATED_OPTIONS : []).map((o) => ({ value: o, label: o }))}
                    value={field.value ? { value: field.value, label: field.value } : null}
                    onValueChange={() => undefined}
                  />
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pinned foot: this panel applies on demand, unlike Assets' which
          narrows as you type. */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 'var(--spacing-200)', borderBlockStart: '1px solid var(--color-boundary-border-mildest)' }}>
        <TextButton variant="primary" size="default">
          {advanced ? ADVANCED_APPLY : FILTER_APPLY}
        </TextButton>
      </div>
    </aside>
  );
}

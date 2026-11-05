import { useState } from 'react';
import { Icon } from '@freshworks/dew-components';
import {
  ADVANCED_ADD,
  ADVANCED_ADD_ASSOCIATION,
  ADVANCED_BLURB,
  ADVANCED_CONDITIONS,
  ADVANCED_GROUP,
  ADVANCED_MATCH,
  type Condition,
} from './changes.data';

/**
 * The Advanced half of the change filter.
 *
 * Not a variant of Basic: a condition builder holding the same three applied
 * values as rows. Each row is a field chip, an operator, and either a set of
 * removable value chips or a plain value. A minus removes the row, and Add
 * appends one.
 */
export default function AdvancedFilter() {
  const [conditions, setConditions] = useState<Condition[]>(ADVANCED_CONDITIONS);

  const removeChip = (rowId: string, chip: string) =>
    setConditions((prev) =>
      prev.map((c) => (c.id === rowId ? { ...c, chips: (c.chips ?? []).filter((x) => x !== chip) } : c))
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
      <p style={{ margin: 0, fontSize: '13px', lineHeight: '18px', color: 'var(--color-text-secondary)' }}>
        {ADVANCED_BLURB}
      </p>

      <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', alignSelf: 'flex-start', border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '14px', color: 'var(--color-text-primary)' }}>
        {ADVANCED_MATCH}
        <Icon name="ChevronDown" size="sm" color="var(--color-icon-secondary)" />
      </button>

      <div style={{ borderRadius: '12px', border: '1px solid var(--color-boundary-border-mildest)', padding: 'var(--spacing-200)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-150)' }}>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          Filter by <strong style={{ color: 'var(--color-text-primary)' }}>{ADVANCED_GROUP}</strong>
        </p>

        {conditions.map((c) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-100)' }}>
            <button
              type="button"
              aria-label={`Remove ${c.field} condition`}
              onClick={() => setConditions((prev) => prev.filter((x) => x.id !== c.id))}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, marginBlockStart: '10px', display: 'flex' }}
            >
              <Icon name="CircleMinus" size="sm" color="var(--color-icon-semantic-error)" />
            </button>

            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--spacing-050)', padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--color-boundary-border-milder)' }}>
              <span style={CHIP}>{c.field}</span>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{c.operator}</span>
              {(c.chips ?? []).map((chip) => (
                <span key={chip} style={CHIP}>
                  {chip}
                  <button
                    type="button"
                    aria-label={`Remove ${chip}`}
                    onClick={() => removeChip(c.id, chip)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    <Icon name="CrossSmall" size="2xs" color="var(--color-icon-secondary)" />
                  </button>
                </span>
              ))}
              {c.value && <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>{c.value}</span>}
            </div>
          </div>
        ))}

        <button type="button" style={LINK}>
          <Icon name="CirclePlus" size="sm" color="var(--color-icon-selected)" />
          {ADVANCED_ADD}
        </button>
      </div>

      <button type="button" style={LINK}>
        <Icon name="CirclePlus" size="sm" color="var(--color-icon-selected)" />
        {ADVANCED_ADD_ASSOCIATION}
      </button>
    </div>
  );
}

const CHIP = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  height: '24px',
  paddingInline: '8px',
  borderRadius: '4px',
  background: 'var(--color-fill-container)',
  fontSize: '13px',
  color: 'var(--color-text-primary)',
} as const;

const LINK = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--spacing-100)',
  alignSelf: 'flex-start',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  padding: 0,
  fontSize: '14px',
  fontWeight: 'var(--font-weight-semi-bold)',
  color: 'var(--color-text-brand)',
} as const;

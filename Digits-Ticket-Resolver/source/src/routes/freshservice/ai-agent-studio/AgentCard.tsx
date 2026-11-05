import { useState } from 'react';
import { IconButton, TextButton } from '@freshworks/dew-components';
import type { PrebuiltAgent } from './aiStudio.data';

/** 360x210 with a 12px radius, measured; the avatar sits 20px in. */
export default function AgentCard({ agent }: { agent: PrebuiltAgent }) {
  // Measured: the card LIFTS on hover — a soft drop shadow, and the border
  // drops out rather than staying under it. It had no hover state at all.
  const [hovered, setHovered] = useState(false);
  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '360px',
        minHeight: '210px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-150)',
        padding: 'var(--spacing-250)',
        border: `1px solid ${hovered ? 'transparent' : 'var(--color-boundary-border-mildest)'}`,
        borderRadius: 'var(--border-radius-large)',
        backgroundColor: 'var(--color-fill-surface)',
        boxShadow: hovered ? 'var(--shadow-lg)' : 'none',
        transition: 'box-shadow 120ms ease, border-color 120ms ease'
      }}
    >
      <span aria-hidden style={{ fontSize: '28px', lineHeight: '40px' }}>
        {agent.avatar}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ margin: 0, fontSize: '16px', lineHeight: '20px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
          {agent.name}
        </h3>
        <p style={{ margin: 'var(--spacing-100) 0 0', fontSize: '14px', lineHeight: '20px', color: 'var(--color-text-secondary)' }}>
          {agent.description}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)' }}>
          {agent.integrations.map((name) => (
            <span key={name} title={name} style={INTEGRATION_TILE}>
              {name[0]}
            </span>
          ))}
          {agent.moreIntegrations > 0 && (
            <span style={{ ...INTEGRATION_TILE, color: 'var(--color-text-secondary)' }}>+{agent.moreIntegrations}</span>
          )}
        </div>
        {/* Measured: the label is hidden at rest and revealed on hover — the
            button goes from 25px (arrow only) to 78px. */}
        <span
          style={{
            display: 'inline-flex',
            overflow: 'hidden',
            maxWidth: hovered ? '120px' : '0px',
            opacity: hovered ? 1 : 0,
            transition: 'max-width 140ms ease, opacity 140ms ease'
          }}
        >
          <TextButton type="button" variant="secondary" size="mini" suffixIcon="ArrowRight">
            Preview
          </TextButton>
        </span>
        {!hovered && (
          <IconButton iconName="ArrowRight" aria-label={`Preview ${agent.name}`} size="mini" />
        )}
      </div>
    </article>
  );
}

/**
 * The product shows each vendor's own logo. Dew carries none of them —
 * Datadog, Azure DevOps and BambooHR have no icon in the set — so an initial
 * tile stands in rather than an invented mark.
 */
const INTEGRATION_TILE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '24px',
  height: '24px',
  padding: '0 var(--spacing-050)',
  borderRadius: 'var(--border-radius-xsmall)',
  border: '1px solid var(--color-boundary-border-mildest)',
  backgroundColor: 'var(--color-fill-container)',
  fontSize: '11px',
  fontWeight: 'var(--font-weight-semi-bold)',
  color: 'var(--color-text-primary)'
};

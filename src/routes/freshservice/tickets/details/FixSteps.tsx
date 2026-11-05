import { Icon, Spinner } from '@freshworks/dew-components';
import type { FixStep } from './types';
import { FIX_STEP_COLOR, FIX_STEP_ICON } from './details.tokens';
import { BODY_COMPACT, META } from './details.styles';

/**
 * The step list shared by the Suggested fix section (B2) and the
 * `workflow-executed` event (B5). One component so a failed step reads the same
 * in both places.
 *
 * Status is carried by the icon *and* by the detail text ("permission denied",
 * "not run"), never by colour alone.
 */
export default function FixSteps({ steps }: { steps: FixStep[] }) {
  return (
    <ul
      style={{
        width: '100%',
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-050)'
      }}
    >
      {steps.map((step, i) => (
        <li
          key={`${step.label}-${i}`}
          style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-100)' }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '16px',
              height: '18px',
              flexShrink: 0
            }}
          >
            {step.status === 'running' ? (
              <Spinner size="sm" aria-label="Running" />
            ) : (
              <Icon
                name={FIX_STEP_ICON[step.status]}
                size="sm"
                color={FIX_STEP_COLOR[step.status]}
                title={step.status}
              />
            )}
          </span>
          <span
            style={{
              ...BODY_COMPACT,
              color:
                step.status === 'skipped' ? 'var(--color-text-secondary)' : 'var(--color-text-primary)'
            }}
          >
            {step.label}
            {step.detail && <span style={{ ...META, marginInlineStart: 'var(--spacing-050)' }}>· {step.detail}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

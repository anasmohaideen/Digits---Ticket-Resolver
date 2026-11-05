import { type ReactNode } from 'react';
import { DropdownButton, Tag, type IMenuOption } from '@freshworks/dew-components';

const sampleOptions: IMenuOption[] = [
  { label: 'Option one', value: 'one' },
  { label: 'Option two', value: 'two' },
  { label: 'Option three', value: 'three', disabled: true },
];

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-050)' }}>
        <h2
          style={{
            margin: 0,
            fontSize: '16px',
            lineHeight: '24px',
            fontWeight: 'var(--font-weight-semi-bold)',
            color: 'var(--color-text-primary)',
          }}
        >
          {title}
        </h2>
        {description && (
          <p style={{ margin: 0, fontSize: '13px', lineHeight: '18px', color: 'var(--color-text-secondary)' }}>
            {description}
          </p>
        )}
      </div>
      <div
        style={{
          background: 'var(--color-fill-surface)',
          border: '1px solid var(--color-boundary-border-mildest)',
          borderRadius: 'var(--border-radius-medium, 12px)',
          padding: 'var(--spacing-300)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--spacing-300)',
        }}
      >
        {children}
      </div>
    </section>
  );
}

export default function Dropdown() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'var(--color-fill-container)',
        fontFamily: 'var(--base-font-family)',
        color: 'var(--color-text-primary)',
      }}
    >
      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: 'var(--spacing-500, 40px) var(--spacing-300)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-500, 40px)',
        }}
      >
        <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-150)' }}>
          <Tag variant="blue">Freshworks Dew</Tag>
          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              lineHeight: '36px',
              fontWeight: 'var(--font-weight-semi-bold)',
              color: 'var(--color-text-primary)',
            }}
          >
            Dropdown
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: '640px',
              fontSize: '14px',
              lineHeight: '20px',
              color: 'var(--color-text-secondary)',
            }}
          >
            Core <code>DropdownButton</code> variants from <code>@freshworks/dew-components</code>, rendered with
            Dew semantic tokens. Each trigger opens a menu of related actions.
          </p>
        </header>

        <Section title="Variants" description="Primary, secondary, link, destructive, and custom menu triggers.">
          <div className="delight-open-v1">
            <DropdownButton variant="primary" options={sampleOptions}>
              Primary
            </DropdownButton>
          </div>
          <DropdownButton variant="secondary" options={sampleOptions}>
            Secondary
          </DropdownButton>
          <DropdownButton variant="link" options={sampleOptions}>
            Link
          </DropdownButton>
          <DropdownButton variant="destructive" options={sampleOptions}>
            Delete
          </DropdownButton>
          <DropdownButton variant="custom" options={sampleOptions}>
            Custom
          </DropdownButton>
          <DropdownButton variant="secondary" prefixIcon="CirclePlus" options={sampleOptions}>
            Create
          </DropdownButton>
        </Section>

        <Section title="Sizes" description="Default and mini density.">
          <DropdownButton variant="secondary" size="default" options={sampleOptions}>
            Default
          </DropdownButton>
          <DropdownButton variant="secondary" size="mini" options={sampleOptions}>
            Mini
          </DropdownButton>
        </Section>
      </div>
    </div>
  );
}

import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  TextButton,
  IconButton,
  Tag,
  Badge,
  Avatar,
  Banner,
  InlineMessage,
  Checkbox,
  RadioGroup,
  Toggle,
  Tooltip,
  Card,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionContent,
  Icon,
} from '@freshworks/dew-components';

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

export default function Overview() {
  const [notify, setNotify] = useState(true);
  const [compact, setCompact] = useState(false);

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
            Component overview
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
            A quick tour of the vendored <code>@freshworks/dew-components</code> library, rendered with Dew
            semantic tokens. Explore the building blocks below, then open the Freshservice app shell demo.
          </p>
        </header>

        <Card
          as={Link}
          to="/freshservice"
          variant="outlined"
          padding="lg"
          interactive
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-300)',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--color-fill-semantic-info-mildest)',
              flexShrink: 0,
            }}
          >
            <Icon name="LeftNavBar/Inventory" color="var(--color-icon-selected)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '15px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
              Freshservice app shell demo
            </span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              A Dew-powered Freshservice look-a-like: rail nav, top navigation, and a welcome state.
            </span>
          </div>
          <Icon name="Actions/ArrowRight" color="var(--color-icon-secondary)" />
        </Card>

        <Section title="Buttons" description="TextButton variants plus icon-only actions.">
          <TextButton variant="primary">Primary</TextButton>
          <TextButton variant="secondary">Secondary</TextButton>
          <TextButton variant="link">Link</TextButton>
          <TextButton variant="destructive">Delete</TextButton>
          <TextButton variant="secondary" prefixIcon="CirclePlus">
            Create
          </TextButton>
          <Tooltip content="More options">
            <IconButton iconName="MoreVertical" aria-label="More options" />
          </Tooltip>
        </Section>

        <Section title="Status & identity" description="Tags, badges, and avatars.">
          <Tag variant="green">Active</Tag>
          <Tag variant="yellow">Pending</Tag>
          <Tag variant="red">Blocked</Tag>
          <Tag variant="gray">Draft</Tag>
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <Icon name="Notification" size="lg" color="var(--color-icon-secondary)" />
            <Badge count={3} style={{ position: 'absolute', top: '-6px', right: '-8px' }} />
          </div>
          <Avatar name="Sam Taylor" colorVariant="info" />
          <Avatar name="Riya Kapoor" colorVariant="success" />
        </Section>

        <Section title="Messaging" description="Inline and page-level feedback.">
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
            <Banner message={{ variant: 'info', content: 'A new Dew release is available.' }} />
            <InlineMessage variant="success">Your changes were saved.</InlineMessage>
            <InlineMessage variant="warning">This journey is still a draft.</InlineMessage>
          </div>
        </Section>

        <Section title="Selection controls" description="Toggles, checkboxes, and radios.">
          <Toggle
            checked={notify}
            onChange={setNotify}
            label="Email notifications"
            subtext="Send a summary every morning"
          />
          <Toggle checked={compact} onChange={setCompact} label="Compact density" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-150)' }}>
            <Checkbox defaultChecked label="Assign to me" description="You will be the owner" />
            <Checkbox label="Notify watchers" />
          </div>
          <RadioGroup
            name="priority"
            label="Priority"
            defaultValue="medium"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
          />
        </Section>

        <Section title="Disclosure" description="Accordion for grouped content.">
          <div style={{ width: '100%' }}>
            <Accordion type="single" defaultValue="overview" isCollapsible>
              <AccordionItem value="overview">
                <AccordionHeader>What is Dew?</AccordionHeader>
                <AccordionContent>
                  Dew is the Freshworks design system. This starter vendors its component and style packages
                  so you can build without registry access.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="tokens">
                <AccordionHeader>Why semantic tokens?</AccordionHeader>
                <AccordionContent>
                  Semantic <code>fw-</code> tokens carry meaning, dark-mode, and theming, so components stay
                  on-system across products.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </Section>
      </div>
    </div>
  );
}

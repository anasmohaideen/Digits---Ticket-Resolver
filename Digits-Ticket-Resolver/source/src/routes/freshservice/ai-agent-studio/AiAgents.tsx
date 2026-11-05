import { useState } from 'react';
import { Icon, InlineMessage, Popover, TextButton } from '@freshworks/dew-components';
import { AGENT_TYPES, AI_AGENTS_COPY, PREBUILT_AGENTS, type AgentType } from './aiStudio.data';
import AgentCard from './AgentCard';
import CreateAgentModal from './CreateAgentModal';

/**
 * The studio's landing screen.
 *
 * Measured off the live page: an h1 at 24px/700 over a subtitle, the offer
 * banner, a dismissible demo card on a left-to-right gradient, then the
 * pre-built agents as 360x210 cards on a 384px pitch.
 */
export default function AiAgents() {
  const [showDemo, setShowDemo] = useState(true);

  return (
    <div style={{ padding: 'var(--spacing-400)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-300)' }}>
      <header>
        <h1 style={{ margin: 0, fontSize: '24px', lineHeight: '30px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
          {AI_AGENTS_COPY.title}
        </h1>
        <p style={{ margin: 'var(--spacing-100) 0 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          {AI_AGENTS_COPY.subtitle}{' '}
          <a href="#" style={{ color: 'var(--color-text-brand)', fontWeight: 'var(--font-weight-semi-bold)', textDecoration: 'none' }}>
            Learn more
          </a>
        </p>
      </header>

      <InlineMessage variant="info">
        {AI_AGENTS_COPY.promoBanner}{' '}
        <a href="#" style={{ color: 'var(--color-text-brand)', fontWeight: 'var(--font-weight-semi-bold)', textDecoration: 'none' }}>
          Learn more
        </a>
      </InlineMessage>

      {showDemo && (
        <div style={DEMO_CARD}>
          <span aria-hidden style={DEMO_THUMB}>
            <Icon name="CirclePlay" size="lg" color="var(--color-icon-brand)" />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: '16px', lineHeight: '20px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
              {AI_AGENTS_COPY.demoTitle}
            </h3>
            <p style={{ margin: 'var(--spacing-100) 0 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              {AI_AGENTS_COPY.demoBody}
            </p>
          </div>
          <button type="button" aria-label="Dismiss demo" onClick={() => setShowDemo(false)} style={DISMISS}>
            <Icon name="CircleCross" size="md" color="var(--color-icon-secondary)" />
          </button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-300)' }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: '18px', lineHeight: '23px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
            {AI_AGENTS_COPY.exploreTitle}
          </h2>
          <p style={{ margin: 'var(--spacing-100) 0 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {AI_AGENTS_COPY.exploreSubtitle}
          </p>
        </div>
        <CreateAgentButton />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-300)' }}>
        {PREBUILT_AGENTS.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}

/**
 * "Create new Agent" opens a PANEL, not a menu — measured at 590x251 with a
 * 16px radius, headed "Choose a type", holding the two agent types side by
 * side. Each carries its own Create action, so the choice is made inside the
 * panel rather than by picking a menu row.
 */
function CreateAgentButton() {
  const [open, setOpen] = useState(false);
  // Measured: choosing a type opens the modal IN PLACE on /ai-agents — the
  // product does not navigate first, which is what carries the chosen type
  // into the modal's heading.
  const [creating, setCreating] = useState<AgentType | null>(null);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen} placement="bottom-end" mode="click">
      {/* asChild, so the trigger binds to the button rather than wrapping it
          in its own element — without it the click never reaches the popover. */}
      <Popover.Trigger asChild>
        <TextButton
          type="button"
          variant="primary"
          size="default"
          prefixIcon="CirclePlus"
          suffixIcon="ChevronDown"
          onClick={() => setOpen((isOpen) => !isOpen)}
        >
          Create new Agent
        </TextButton>
      </Popover.Trigger>
      <Popover.Content>
        {/* Measured: 590 wide, 16px radius. The radius and shadow sit here
            rather than on Dew's wrapper, which carries neither. */}
        <div
          style={{
            width: '590px',
            boxSizing: 'border-box',
            padding: 'var(--spacing-250)',
            backgroundColor: 'var(--color-fill-surface)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)', marginBlockEnd: 'var(--spacing-200)' }}>
            Choose a type
          </div>
          {/* 20px between the two options, measured. */}
          <div style={{ display: 'flex', gap: 'var(--spacing-250)' }}>
            {AGENT_TYPES.map((type) => (
              <AgentTypeOption
                key={type.id}
                type={type}
                onCreate={() => {
                  setOpen(false);
                  setCreating(type);
                }}
              />
            ))}
          </div>
        </div>
      </Popover.Content>
      </Popover>

      {/* Outside the Popover: it takes only its Trigger and Content, and a
          third child stops the panel opening at all. */}
      <CreateAgentModal
        type={creating}
        open={creating !== null}
        onOpenChange={(next) => !next && setCreating(null)}
      />
    </>
  );
}

/**
 * One option. Measured at 264x172 with a 16px radius and 16px padding, a
 * bordered card in its own right — the first pass drew it as bare text.
 * The emoji sits INLINE with the title rather than on a line above it, and
 * Create is an outlined button (85x32, 8px radius), not a link.
 */
function AgentTypeOption({ type, onCreate }: { type: AgentType; onCreate: () => void }) {
  // Measured: the border turns blue on hover; the fill stays white.
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '264px',
        minHeight: '172px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-150)',
        padding: 'var(--spacing-200)',
        border: `1px solid ${hovered ? 'var(--color-fill-semantic-info-mild)' : 'var(--color-boundary-border-mildest)'}`,
        borderRadius: '16px',
        backgroundColor: 'var(--color-fill-surface)',
        transition: 'border-color 120ms ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)' }}>
        <span aria-hidden style={{ fontSize: '20px', lineHeight: '24px' }}>
          {type.emoji}
        </span>
        <span style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
          {type.name}
        </span>
      </div>

      <p style={{ margin: 0, flex: 1, fontSize: '12px', lineHeight: '18px', color: 'var(--color-text-secondary)' }}>
        {type.description}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-100)' }}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Works with</span>
        {type.channels.map((channel) => (
          <Icon key={channel} name={channel} size="sm" color="var(--color-icon-secondary)" />
        ))}
      </div>

      <span style={{ alignSelf: 'flex-start' }}>
        <TextButton type="button" variant="secondary" size="default" suffixIcon="ArrowRight" onClick={onCreate}>
          Create
        </TextButton>
      </span>
    </div>
  );
}

const DEMO_CARD: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-250)',
  padding: 'var(--spacing-250)',
  borderRadius: 'var(--border-radius-large)',
  // Measured on the live card, and a product gradient rather than decoration.
  background: 'linear-gradient(90deg, var(--color-fill-semantic-info-mildest) 0%, var(--color-fill-semantic-success-mildest) 80%)'
};

const DEMO_THUMB: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '64px',
  height: '64px',
  flexShrink: 0,
  borderRadius: 'var(--border-radius-medium)',
  backgroundColor: 'var(--color-fill-semantic-info-mildest)'
};

const DISMISS: React.CSSProperties = {
  alignSelf: 'flex-start',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  display: 'flex'
};


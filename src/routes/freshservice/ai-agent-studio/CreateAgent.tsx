import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, IconButton } from '@freshworks/dew-components';
import { AGENT_TYPES, CREATE_PAGE_COPY as C, PREBUILT_AGENTS } from './aiStudio.data';
import AgentCard from './AgentCard';
import CreateAgentModal from './CreateAgentModal';

/**
 * "Create new" — reached from the chooser panel's Create action.
 *
 * Two routes into an agent: a Start from scratch panel on an info-mildest
 * fill, then an OR rule, then the same pre-built cards the landing page
 * shows. Choosing scratch opens the create modal.
 */
export default function CreateAgent() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div style={{ padding: 'var(--spacing-400)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-300)' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-200)' }}>
        <IconButton
          iconName="ChevronLeft"
          aria-label="Back to AI agents"
          size="default"
          onClick={() => navigate('/freshservice/agent-studio/ai-agents')}
        />
        <h1 style={{ margin: 0, fontSize: '24px', lineHeight: '30px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>
          {C.title}
        </h1>
      </header>

      <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>{C.subtitle}</p>

      <button type="button" onClick={() => setModalOpen(true)} style={SCRATCH}>
        <span aria-hidden style={PLUS}>
          <Icon name="Plus" size="md" color="var(--color-icon-inverse)" />
        </span>
        <span style={{ flex: 1, textAlign: 'start' }}>
          <span style={{ display: 'block', fontSize: '16px', lineHeight: '22px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
            {C.scratchTitle}
          </span>
          <span style={{ display: 'block', marginBlockStart: 'var(--spacing-050)', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {C.scratchBody}
          </span>
        </span>
        <Icon name="ChevronRight" size="md" color="var(--color-icon-secondary)" />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-200)' }}>
        <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-boundary-divider)' }} />
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{C.or}</span>
        <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-boundary-divider)' }} />
      </div>

      <div>
        <h2 style={{ margin: 0, fontSize: '18px', lineHeight: '23px', fontWeight: 'var(--font-weight-semi-bold)', color: 'var(--color-text-primary)' }}>
          {C.libraryTitle}
        </h2>
        <p style={{ margin: 'var(--spacing-100) 0 var(--spacing-300)', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          {C.librarySubtitle}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-300)' }}>
          {PREBUILT_AGENTS.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* Scratch has no type of its own, so it opens as a Chat agent. */}
      <CreateAgentModal type={AGENT_TYPES[0]} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}

const SCRATCH: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-250)',
  width: '600px',
  maxWidth: '100%',
  padding: 'var(--spacing-250)',
  border: 'none',
  borderRadius: 'var(--border-radius-large)',
  backgroundColor: 'var(--color-fill-semantic-info-mildest)',
  cursor: 'pointer'
};

const PLUS: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  flexShrink: 0,
  borderRadius: '50%',
  backgroundColor: 'var(--color-fill-brand)'
};

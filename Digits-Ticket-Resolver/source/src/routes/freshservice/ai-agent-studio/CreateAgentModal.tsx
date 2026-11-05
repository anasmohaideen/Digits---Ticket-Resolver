import { useState } from 'react';
import { Icon, Modal, Select, TextButton, TextField } from '@freshworks/dew-components';
import {
  AGENT_AVATAR_TINTS,
  AGENT_LANGUAGES,
  CREATE_AGENT_COPY as C,
  type AgentType
} from './aiStudio.data';

/**
 * Create new <type> AI Agent.
 *
 * Measured at 600px wide. The heading pairs "Create new" with the chosen
 * type in its own chip, so the modal says which of the two you picked. Name
 * and Avatar are required and Continue stays disabled until a name is typed —
 * on the live modal it renders pale before that.
 */
export default function CreateAgentModal({
  type,
  open,
  onOpenChange
}: {
  type: AgentType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(0);
  const [language, setLanguage] = useState(AGENT_LANGUAGES[0]);

  if (!type) return null;

  const close = () => {
    onOpenChange(false);
    setName('');
    setAvatar(0);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <Modal.Content containerHTMLProps={{ style: { width: '600px', maxWidth: 'calc(100vw - 32px)' } }}>
        <Modal.Header>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-150)' }}>
            {C.heading}
            <span style={TYPE_CHIP}>
              <span aria-hidden style={{ fontSize: '18px', lineHeight: '22px' }}>{type.emoji}</span>
              {type.name}
            </span>
          </span>
        </Modal.Header>

        <Modal.Body>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-300)' }}>
            <TextField
              label={C.nameLabel}
              required
              value={name}
              placeholder={C.namePlaceholder}
              onChange={(value) => setName(String(value ?? ''))}
            />

            <div>
              <div style={{ marginBlockEnd: 'var(--spacing-150)', fontSize: '14px', color: 'var(--color-text-primary)' }}>
                {C.avatarLabel} <span style={{ color: 'var(--color-text-semantic-error)' }}>*</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-250)' }}>
                {AGENT_AVATAR_TINTS.map((tint, i) => (
                  <button
                    key={tint}
                    type="button"
                    aria-label={`Avatar ${i + 1}`}
                    aria-pressed={avatar === i}
                    onClick={() => setAvatar(i)}
                    style={{
                      position: 'relative',
                      width: '56px',
                      height: '56px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      backgroundColor: tint,
                      border: `2px solid ${avatar === i ? 'var(--color-boundary-brand)' : 'transparent'}`,
                      cursor: 'pointer'
                    }}
                  >
                    <Icon name="LeftNavBar/Chatbot" size="lg" color="var(--color-icon-primary)" />
                    {avatar === i && (
                      <span aria-hidden style={TICK}>
                        <Icon name="Tick" size="2xs" color="var(--color-icon-inverse)" />
                      </span>
                    )}
                  </button>
                ))}
                <button type="button" aria-label="Upload an avatar" style={UPLOAD}>
                  <Icon name="Export" size="md" color="var(--color-icon-secondary)" />
                </button>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-050)', marginBlockEnd: 'var(--spacing-150)', fontSize: '14px', color: 'var(--color-text-primary)' }}>
                {C.languageLabel}
                <Icon name="CircleInfo" size="sm" color="var(--color-icon-secondary)" />
              </div>
              {/* The live select carries the language CODE in a chip before
                  its name — "EN English". Dew renders an option's startIcon in
                  the LIST but not on the trigger, and replacing the trigger via
                  slots drops its accessible name, so the chip shows when the
                  list is open and the trigger reads the language alone. */}
              <Select
                aria-label={C.languageLabel}
                options={AGENT_LANGUAGES.map((l) => ({
                  value: l.code,
                  label: l.label,
                  startIcon: <span style={LANG_CHIP}>{l.code}</span>
                }))}
                value={{
                  value: language.code,
                  label: language.label,
                  startIcon: <span style={LANG_CHIP}>{language.code}</span>
                }}
                onValueChange={(next) => {
                  const found = AGENT_LANGUAGES.find((l) => l.code === next?.value);
                  if (found) setLanguage(found);
                }}
              />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <span style={{ marginInlineEnd: 'auto', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            {C.terms}{' '}
            <a href="#" style={{ color: 'var(--color-text-brand)', textDecoration: 'none' }}>
              {C.termsLink}
            </a>
          </span>
          <TextButton type="button" variant="secondary" onClick={close}>
            {C.cancel}
          </TextButton>
          {/* Disabled until a name exists — the live button renders pale. */}
          <TextButton type="button" variant="primary" disabled={name.trim().length === 0} onClick={close}>
            {C.continue}
          </TextButton>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

const LANG_CHIP: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '28px',
  height: '20px',
  padding: '0 var(--spacing-050)',
  borderRadius: 'var(--border-radius-xsmall)',
  backgroundColor: 'var(--color-fill-semantic-info-mildest)',
  fontSize: '12px',
  fontWeight: 'var(--font-weight-semi-bold)',
  color: 'var(--color-text-brand)'
};

const TYPE_CHIP: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--spacing-100)',
  padding: 'var(--spacing-050) var(--spacing-150)',
  borderRadius: 'var(--border-radius-large)',
  backgroundColor: 'var(--color-fill-container)',
  fontSize: '18px',
  fontWeight: 'var(--font-weight-semi-bold)',
  color: 'var(--color-text-primary)'
};

const TICK: React.CSSProperties = {
  position: 'absolute',
  insetBlockStart: '-2px',
  insetInlineEnd: '-2px',
  width: '18px',
  height: '18px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  backgroundColor: 'var(--color-fill-brand)'
};

const UPLOAD: React.CSSProperties = {
  width: '56px',
  height: '56px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  backgroundColor: 'var(--color-fill-container)',
  border: 'none',
  cursor: 'pointer'
};

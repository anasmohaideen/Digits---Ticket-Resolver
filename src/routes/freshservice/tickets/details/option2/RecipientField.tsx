import { useState, type KeyboardEvent } from 'react';
import { Tag } from '@freshworks/dew-components';

/**
 * Option 2 · a row of email recipients: each address becomes a removable tag
 * once it is typed and confirmed (Enter, comma, space or leaving the field),
 * as in the help desk's own mail editor.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RecipientField({
  label,
  value,
  onChange,
  placeholder = 'Add recipients',
  autoFocus = false
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [text, setText] = useState('');
  const [invalid, setInvalid] = useState(false);

  /* Takes whatever is typed; anything that is not an address stays in the field. */
  const commit = (raw: string) => {
    const parts = raw.split(/[\s,;]+/).filter(Boolean);
    if (parts.length === 0) {
      setText('');
      return;
    }
    const good = parts.filter((part) => EMAIL.test(part) && !value.includes(part));
    const bad = parts.filter((part) => !EMAIL.test(part));
    if (good.length) onChange([...value, ...good]);
    setText(bad.join(' '));
    setInvalid(bad.length > 0);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', ',', ';', ' '].includes(event.key) && text.trim()) {
      event.preventDefault();
      event.stopPropagation();
      commit(text);
    } else if (event.key === 'Backspace' && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className={`tr-o2-recipients${invalid ? ' is-invalid' : ''}`}>
      {value.map((address) => (
        <Tag key={address} variant="gray" onClose={() => onChange(value.filter((item) => item !== address))} closeAriaLabel={`Remove ${address}`}>
          {address}
        </Tag>
      ))}
      <input
        className="tr-o2-recipients-input"
        type="text"
        inputMode="email"
        aria-label={label}
        aria-invalid={invalid || undefined}
        placeholder={value.length ? '' : placeholder}
        value={text}
        autoFocus={autoFocus}
        onChange={(event) => {
          setText(event.target.value);
          setInvalid(false);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => commit(text)}
      />
    </div>
  );
}

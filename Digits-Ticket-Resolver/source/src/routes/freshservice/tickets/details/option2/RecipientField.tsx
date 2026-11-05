import { useState } from 'react';
import { Select } from '@freshworks/dew-components';

/**
 * Option 2 · a row of email recipients: each address becomes a removable tag
 * once it is created from the typed text. Built on Dew's multi Select with
 * "create new", the nearest Dew equivalent of a recipient / tag input.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RecipientField({
  label,
  value,
  onChange,
  placeholder = 'Add recipients'
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  /* Addresses typed in this session are offered back as options. */
  const [known, setKnown] = useState<string[]>([]);
  const options = [...new Set([...known, ...value])].map((address) => ({ value: address, label: address }));

  return (
    <div className="tr-o2-recipients-select">
      <Select
        aria-label={label}
        multiple
        searchable
        showCreateNew
        closeOnSelect={false}
        placeholder={value.length ? '' : placeholder}
        options={options}
        value={value.map((address) => ({ value: address, label: address }))}
        onValueChange={(next, meta) => {
          const list = (Array.isArray(next) ? next : next ? [next] : []).map((item) => item.value);
          if (meta.action === 'create') {
            const typed = (meta.inputValue ?? '').split(/[\s,;]+/).filter((part) => EMAIL.test(part));
            if (typed.length === 0) return;
            setKnown((current) => [...new Set([...current, ...typed])]);
            onChange([...new Set([...value, ...typed])]);
            return;
          }
          onChange(list);
        }}
      />
    </div>
  );
}

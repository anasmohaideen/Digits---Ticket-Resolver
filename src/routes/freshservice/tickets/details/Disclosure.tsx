import { useId, useState, type ReactNode } from 'react';
import { TextButton } from '@freshworks/dew-components';
import { DISCLOSURE_PANEL } from './details.styles';

/**
 * The "Why" toggle and every expandable event row.
 *
 * Dew's `Accordion` is used for the phase rows, where its fixed header padding
 * suits a full row. It does not suit a one-line stream row or a trailing "Why"
 * button, so those use a `TextButton` — the same primitive, wired by hand to
 * `aria-expanded` / `aria-controls` so the affordance is identical to the
 * accordion's for a screen reader and for the keyboard.
 *
 * The hook exists because the trigger and the panel are not always siblings:
 * in a card footer the button belongs in the row and the panel below it.
 */

export interface DisclosureState {
  open: boolean;
  panelId: string;
  toggle: () => void;
}

export function useDisclosure(defaultOpen = false): DisclosureState {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  return { open, panelId, toggle: () => setOpen((value) => !value) };
}

export function DisclosureButton({
  disclosure,
  label,
  openLabel,
  size = 'mini',
  variant = 'link'
}: {
  disclosure: DisclosureState;
  label: string;
  /** Label once open, when it differs ("Collapse" vs "Expand"). */
  openLabel?: string;
  size?: 'default' | 'mini';
  variant?: 'link' | 'secondary';
}) {
  return (
    <TextButton
      type="button"
      variant={variant}
      size={size}
      suffixIcon={disclosure.open ? 'ChevronUp' : 'ChevronDown'}
      aria-expanded={disclosure.open}
      aria-controls={disclosure.panelId}
      onClick={disclosure.toggle}
    >
      {disclosure.open ? openLabel ?? label : label}
    </TextButton>
  );
}

export function DisclosurePanel({
  disclosure,
  children
}: {
  disclosure: DisclosureState;
  children: ReactNode;
}) {
  /* Rendered even when closed, with `hidden`, so the `aria-controls` on the
     trigger always points at an element that exists. */
  return (
    <div id={disclosure.panelId} hidden={!disclosure.open} style={disclosure.open ? DISCLOSURE_PANEL : undefined}>
      {disclosure.open ? children : null}
    </div>
  );
}

/** Trigger and panel stacked, for the common case. */
export default function Disclosure({
  label,
  openLabel,
  children,
  defaultOpen = false,
  size = 'mini',
  variant = 'link'
}: {
  label: string;
  openLabel?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  size?: 'default' | 'mini';
  variant?: 'link' | 'secondary';
}) {
  const disclosure = useDisclosure(defaultOpen);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-050)', alignItems: 'flex-start' }}>
      <DisclosureButton disclosure={disclosure} label={label} openLabel={openLabel} size={size} variant={variant} />
      <DisclosurePanel disclosure={disclosure}>{children}</DisclosurePanel>
    </div>
  );
}

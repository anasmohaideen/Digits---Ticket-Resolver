import { createContext, useContext } from 'react';
import { Modal, TextButton } from '@freshworks/dew-components';

/**
 * The one confirmation for changing a ticket a digital worker is working on,
 * whatever the change and wherever it's made: Pick up, a reply or note, a
 * property, the top card, or a status, priority or assignee in the list.
 * Nothing is disabled while the worker has the ticket; the first change asks
 * this, in the same words every time, and Continue goes ahead with it.
 */
export default function HandOverDialog({
  open,
  digit,
  onConfirm,
  onCancel
}: {
  open: boolean;
  /** The digital worker that has the ticket. */
  digit: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onOpenChange={(next) => !next && onCancel()}>
      <Modal.Content size="sm">
        <Modal.Header title={`Take over from ${digit}`} hideCloseBtn />
        <Modal.Body>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: '20px', color: 'var(--color-text-primary)' }}>
            {digit} is working on this ticket. If you make a change now, it stops its resolution steps and is
            unassigned. It can’t be assigned back later.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <TextButton type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </TextButton>
          <TextButton type="button" variant="primary" onClick={onConfirm}>
            Continue
          </TextButton>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

/**
 * The ticket page's guard: `takeover(action)` runs the action straight away
 * when no digital worker has the ticket; otherwise it asks first and, on
 * Continue, takes the ticket over and then runs it. Anything that changes the
 * ticket goes through it; reading, copying and Ask AI don't.
 */
export type Takeover = (action?: () => void) => void;
export const TakeoverContext = createContext<Takeover>((action) => action?.());
export const useTakeover = () => useContext(TakeoverContext);

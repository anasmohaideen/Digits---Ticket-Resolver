import { Modal, TextButton } from '@freshworks/dew-components';

/**
 * The one confirmation for taking a ticket away from a digital worker, wherever
 * it happens: Pick up on the ticket page, or a new assignee chosen in the list
 * or in the ticket's properties. The worker stops, and it can't be put back,
 * so every route asks first, in the same words.
 *
 *   pickup     "Pick up this ticket"            [Cancel] [Pick up]
 *   assign     "Assign to Sarah Kim"            [Cancel] [Assign]
 *   unassign   "Unassign Ticket Resolver"       [Cancel] [Unassign]
 *
 * The body is the same everywhere: "Ticket Resolver will stop its current
 * resolution steps and can't be assigned back later."
 */
export type HandOver =
  | { kind: 'pickup' }
  | { kind: 'assign'; to: string }
  | { kind: 'unassign' };

export function handOverCopy(handOver: HandOver, digit: string) {
  switch (handOver.kind) {
    case 'pickup':
      return { title: 'Pick up this ticket', confirm: 'Pick up' };
    case 'assign':
      return { title: `Assign to ${handOver.to}`, confirm: 'Assign' };
    case 'unassign':
      return { title: `Unassign ${digit}`, confirm: 'Unassign' };
  }
}

export default function HandOverDialog({
  handOver,
  digit,
  onConfirm,
  onCancel
}: {
  /** What the person is about to do; nothing open when undefined. */
  handOver: HandOver | undefined;
  /** The digital worker that holds the ticket. */
  digit: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  /* Keep the last words on screen while the dialog closes. */
  const copy = handOverCopy(handOver ?? { kind: 'pickup' }, digit);
  return (
    <Modal open={Boolean(handOver)} onOpenChange={(open) => !open && onCancel()}>
      <Modal.Content size="sm">
        <Modal.Header title={copy.title} hideCloseBtn />
        <Modal.Body>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: '20px', color: 'var(--color-text-primary)' }}>
            {digit} will stop its current resolution steps and can’t be assigned back later.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <TextButton type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </TextButton>
          <TextButton type="button" variant="primary" onClick={onConfirm}>
            {copy.confirm}
          </TextButton>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

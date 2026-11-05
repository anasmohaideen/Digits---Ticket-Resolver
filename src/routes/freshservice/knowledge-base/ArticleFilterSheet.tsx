import { useState } from 'react';
import { Modal, Select, TextButton } from '@freshworks/dew-components';
import { ARTICLE_STATUS_OPTIONS, REVIEW_DATE_OPTIONS } from './kb.data';

/**
 * The Filter sheet behind the toolbar's Filter button.
 *
 * A right-docked sheet like the Tickets export panel, measured at 342 wide
 * running the full height. Two fields only — article status, which starts
 * empty on "Select", and a review-date status that starts on "All articles" —
 * over a footer holding Cancel and Apply.
 */
export default function ArticleFilterSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [reviewDate, setReviewDate] = useState<string>(REVIEW_DATE_OPTIONS[0]);

  /* Dew's Select portals to the body, and the Modal then reads a click on an
     option as a click OUTSIDE itself, so the choice never commits. Portalling
     into the sheet keeps it inside. Held in state, not a ref: a ref is still
     null on the render that passes it down and the popup never opens. */
  const [sheetEl, setSheetEl] = useState<HTMLDivElement | null>(null);

  const statusOptions = ARTICLE_STATUS_OPTIONS.map((s) => ({ value: s, label: s }));
  const reviewOptions = REVIEW_DATE_OPTIONS.map((s) => ({ value: s, label: s }));
  const label = { display: 'block', marginBlockEnd: 'var(--spacing-100)', fontSize: '14px', color: 'var(--color-text-primary)' } as const;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <Modal.Content
        placement="right"
        containerHTMLProps={{
          style: {
            width: '342px',
            maxWidth: 'calc(100vw - 16px)',
            height: 'calc(100vh - 16px)',
            maxHeight: 'calc(100vh - 16px)',
            marginInlineEnd: '8px',
            marginBlock: '8px',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Modal.Header>
          <span style={{ fontSize: '24px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>
            Filter
          </span>
        </Modal.Header>
        <Modal.Body>
          <div ref={setSheetEl} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-300)' }}>
            <div>
              <span style={label}>Article status</span>
              <Select
                aria-label="Article status"
                placeholder="Select"
                portalTarget={sheetEl}
                options={statusOptions}
                value={statusOptions.find((o) => o.value === status) ?? null}
                onValueChange={(next) => setStatus((next?.value as string) ?? null)}
              />
            </div>
            <div>
              <span style={label}>Article review date status</span>
              <Select
                aria-label="Article review date status"
                portalTarget={sheetEl}
                options={reviewOptions}
                value={reviewOptions.find((o) => o.value === reviewDate) ?? null}
                onValueChange={(next) => next && setReviewDate(next.value as string)}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <TextButton type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </TextButton>
          <TextButton type="button" variant="primary" onClick={() => onOpenChange(false)}>
            Apply
          </TextButton>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

import { Icon } from '@freshworks/dew-components';
import type { Attachment } from './types';
import { attachmentIcon } from './details.tokens';
import { BODY_COMPACT, META, SECTION_LABEL } from './details.styles';

/**
 * Read-only attachment rows, for the Description block and message cards.
 *
 * Dew's `Attachment` component is an upload widget — it owns file state, drag
 * and drop, validation and removal — so it is the wrong component for showing
 * what is already attached. These rows are the `Docutype` icon plus the file's
 * own name and size, which is what the reference shows.
 */
export default function AttachmentList({
  attachments,
  heading = true
}: {
  attachments: Attachment[];
  heading?: boolean;
}) {
  if (attachments.length === 0) return null;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-050)' }}>
      {heading && <div style={SECTION_LABEL}>Attachments ({attachments.length})</div>}
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-100)' }}>
        {attachments.map((attachment) => (
          <li
            key={attachment.name}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--spacing-050)',
              padding: 'var(--spacing-050) var(--spacing-100)',
              border: '1px solid var(--color-boundary-border-mildest)',
              borderRadius: 'var(--border-radius-small)',
              backgroundColor: 'var(--color-fill-surface)'
            }}
          >
            <Icon category="docutype" name={attachmentIcon(attachment.name)} size="sm" title="" />
            <span style={BODY_COMPACT}>{attachment.name}</span>
            <span style={META}>({attachment.sizeLabel})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

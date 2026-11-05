import { Icon } from '@freshworks/dew-components';
import type { Attachment } from '../types';
import { attachmentIcon } from '../details.tokens';

/**
 * Files on a message, as tiles: the type's icon, the name (cut short with the
 * full name on hover) and the size. The same tile the handoff log uses for its
 * list of attachments, so a file looks the same wherever it appears.
 *
 * A pasted snippet can be shown in full under the tiles (`showSnippets`), as
 * the log does under its message line.
 */
export default function AttachmentTiles({
  attachments,
  showSnippets = false
}: {
  attachments: Attachment[];
  showSnippets?: boolean;
}) {
  if (attachments.length === 0) return null;

  return (
    <>
      <ul className="tr-o2-log-grid">
        {attachments.map((attachment) => (
          <li key={attachment.name} className="tr-o2-log-file" title={attachment.name}>
            <Icon category="docutype" name={attachmentIcon(attachment.name)} size="md" title="" />
            <span className="tr-o2-log-file-text">
              <span className="tr-o2-log-file-name">{attachment.name}</span>
              <span className="tr-o2-log-file-size">({attachment.sizeLabel})</span>
            </span>
          </li>
        ))}
      </ul>
      {showSnippets &&
        attachments.map((attachment) =>
          attachment.snippet ? (
            <pre key={`${attachment.name}-snippet`} className="tr-o2-log-snippet" aria-label={`Contents of ${attachment.name}`}>
              {attachment.snippet}
            </pre>
          ) : null
        )}
    </>
  );
}

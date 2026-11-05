import { Attachment as DewAttachment, Icon } from '@freshworks/dew-components';
import { attachmentIcon } from '../details.tokens';
import type { Attachment } from '../types';

const IMAGE = /\.(png|jpe?g|gif|webp|svg)$/i;
const noop = () => undefined;
/** "142 KB" → bytes, so Dew formats the size itself. */
function toBytes(label: string): number {
  const match = /([\d.]+)\s*(B|KB|MB|GB)/i.exec(label);
  if (!match) return 0;
  const unit = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 }[match[2].toUpperCase() as 'B' | 'KB' | 'MB' | 'GB'];
  return Math.round(parseFloat(match[1]) * unit);
}

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
  const images = attachments.filter((attachment) => IMAGE.test(attachment.name));
  const files = attachments.filter((attachment) => !IMAGE.test(attachment.name));

  return (
    <>
      {/* Dew's Attachment, read-only: the file rows only, remove buttons hidden. */}
      {images.length > 0 && (
        <ul className="tr-att-thumbs" aria-label="Images">
          {images.map((image) => (
            <li key={image.name} className="tr-att-thumb" title={`${image.name} (${image.sizeLabel})`}>
              <span className="tr-att-thumb-art">
                {image.url
                  ? <img src={image.url} alt={image.name} />
                  : <Icon category="docutype" name={attachmentIcon(image.name)} size="lg" title="" />}
              </span>
              <span className="tr-att-thumb-name">{image.name}</span>
            </li>
          ))}
        </ul>
      )}
      {files.length > 0 && <div className="tr-att-readonly">
        <DewAttachment
          files={files.map((attachment, index) => ({ id: `${attachment.name}-${index}`, name: attachment.name, size: toBytes(attachment.sizeLabel) }))}
          onFilesChange={noop}
          onRemove={noop}
          multiple
          aria-label="Attachments"
        />
      </div>}
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

import type { Description } from './types';
import RichTextView from './RichTextView';

/**
 * B3 · Description.
 *
 * Zone 2, the reference zone: the requester's own words and whatever came with
 * them. The only addition the spec asks for is the `origin` meta beside the
 * heading, for tickets a Digit opened from a chat.
 */
export default function DescriptionBlock({
  description,
  ticketCode
}: {
  description: Description;
  ticketCode?: string;
}) {
  return (
    <section className="tr-description-card">
      <h3>Description</h3>
      <div>
        <RichTextView value={description.body} ticketCode={ticketCode} />
      </div>
    </section>
  );
}

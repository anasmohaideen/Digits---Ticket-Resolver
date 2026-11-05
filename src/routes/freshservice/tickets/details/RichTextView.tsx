import { Fragment } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import type { CSSProperties } from 'react';
import type { Link, RichText } from './types';
import { linkHref } from './details.tokens';
import { useTabNavigation } from './tabNavigation';

/**
 * Renders the data contract's `RichText` — plain strings with inline links.
 *
 * Links go through `react-router-dom`'s `Link`, the same as every other
 * in-app link in this repo, rather than Dew's `HyperlinkButton`: these sit
 * mid-sentence, and `HyperlinkButton` is a button-sized affordance with its own
 * padding and focus ring, which breaks the line it is set in.
 */

const LINK_STYLE: CSSProperties = {
  color: 'var(--color-text-brand)',
  fontWeight: 'var(--font-weight-medium)',
  textDecoration: 'none'
};

export function InlineLink({ link, ticketCode }: { link: Link; ticketCode?: string }) {
  const tabs = useTabNavigation();
  /* Where tabs can be switched (Option 2): "similar tickets" opens the Related
     tickets tab on this page, and every other link opens a blank page in a new tab. */
  if (tabs) {
    if (link.to.type === 'related-tickets') {
      return (
        <a
          href="#related-tickets"
          style={LINK_STYLE}
          onClick={(event) => {
            event.preventDefault();
            tabs.openTab('Related tickets');
          }}
        >
          {link.label}
        </a>
      );
    }
    return (
      <a href="about:blank" target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>
        {link.label}
      </a>
    );
  }
  return (
    <RouterLink to={linkHref(link, ticketCode)} style={LINK_STYLE}>
      {link.label}
    </RouterLink>
  );
}

export default function RichTextView({
  value,
  ticketCode
}: {
  value: RichText;
  ticketCode?: string;
}) {
  return (
    <>
      {value.map((part, i) =>
        typeof part === 'string' ? (
          <Fragment key={i}>{part}</Fragment>
        ) : (
          <InlineLink key={i} link={part} ticketCode={ticketCode} />
        )
      )}
    </>
  );
}

/** Keep links and whitespace intact while revealing an incoming reply in reading order. */
export function StreamingRichTextView({ value, ticketCode }: { value: RichText; ticketCode?: string }) {
  let wordIndex = 0;
  const streamPart = (part: string) => part.split(/(\s+)/).map((chunk, index) => {
    if (!chunk) return null;
    if (/^\s+$/.test(chunk)) return <Fragment key={index}>{chunk}</Fragment>;
    const delay = Math.min(120 + wordIndex++ * 42, 2600);
    return <span className="tr-stream-word" style={{ animationDelay: `${delay}ms` }} key={index}>{chunk}</span>;
  });

  return <>{value.map((part, index) => typeof part === 'string'
    ? <Fragment key={index}>{streamPart(part)}</Fragment>
    : <RouterLink key={index} to={linkHref(part, ticketCode)} style={LINK_STYLE}>{streamPart(part.label)}</RouterLink>)}</>;
}

import { useRef } from 'react';
import { Icon, useToast } from '@freshworks/dew-components';
import { sanitizeHtml } from './richHtml';

/**
 * Renders a message's HTML in a neutral content well: card colours never leak
 * in or out, code scrolls sideways, images and tables stay inside the card,
 * a broken image degrades to its alt text, and code blocks copy in one click.
 */
export default function RichHtmlView({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { addSuccessToast } = useToast();
  const safe = sanitizeHtml(html);

  if (html.trim() && !safe.replace(/<[^>]*>/g, '').trim() && !/<(img|table|pre)/i.test(safe)) {
    return (
      <p className="tr-rich-removed">
        <Icon name="Actions/Warning" size="sm" color="var(--color-icon-default)" /> Content removed — it contained unsupported or unsafe elements.
      </p>
    );
  }

  return (
    <div
      ref={ref}
      className="tr-rich"
      // Sanitised above: allow-listed tags and attributes only.
      dangerouslySetInnerHTML={{ __html: safe }}
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.matches('[data-rich-copy]')) {
          const code = target.closest('.tr-rich-code')?.querySelector('pre')?.getAttribute('data-raw') ?? '';
          void navigator.clipboard?.writeText(code).catch(() => undefined);
          addSuccessToast({ message: 'Code copied to clipboard', autoClose: true, timeout: 5000 });
        }
      }}
      onErrorCapture={(event) => {
        const img = event.target as HTMLElement;
        if (img.tagName !== 'IMG') return;
        const chip = document.createElement('span');
        chip.className = 'tr-rich-broken';
        chip.textContent = `Image unavailable: ${img.getAttribute('alt') || 'image'}`;
        img.replaceWith(chip);
      }}
    />
  );
}

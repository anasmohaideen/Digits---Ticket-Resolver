/**
 * Option 2 · the editor's text, as pure helpers.
 *
 * The editable body holds HTML (bold, lists, links), so a draft is stored as
 * HTML. What is sent into the conversation is plain text for now.
 */

const ENTITIES: Array<[RegExp, string]> = [
  [/&nbsp;/g, ' '],
  [/&lt;/g, '<'],
  [/&gt;/g, '>'],
  [/&quot;/g, '"'],
  [/&#39;/g, "'"],
  [/&amp;/g, '&']
];

/** The words in a draft, with line breaks and list bullets kept. */
export function htmlToText(html: string): string {
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/(div|p|li|h[1-6]|blockquote|ul|ol)>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  for (const [pattern, replacement] of ENTITIES) text = text.replace(pattern, replacement);
  return text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Plain text, as editable HTML: escaped, with line breaks kept. */
export function textToHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

/** A draft with no words in it, whatever markup is left behind. */
export function isBlank(html: string): boolean {
  if (/<(img|table|hr)[\s>]/i.test(html)) return false;
  return htmlToText(html) === '';
}

/** A requester's address, when the data has none: "Megan Brooks" → megan.brooks@acme.com. */
export function emailFor(name: string): string {
  const local = name.trim().toLowerCase().replace(/[^a-z\s.-]/g, '').split(/\s+/).filter(Boolean).join('.');
  return `${local || 'requester'}@acme.com`;
}

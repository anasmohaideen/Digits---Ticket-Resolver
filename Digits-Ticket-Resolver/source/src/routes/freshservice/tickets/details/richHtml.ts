/**
 * Rich message bodies: a small allow-list sanitizer.
 *
 * Replies, pasted email and editor output arrive as HTML. Before it is shown
 * in a card it is reduced to structure only: no scripts, no inline styles, no
 * colours or backgrounds (so pasted content can never clash with the card
 * surface), no event handlers, and only http(s)/mailto links and http(s)/data
 * images. Code blocks get a copy button, tables a scroll wrapper.
 */

const TAGS = new Set([
  'p', 'br', 'div', 'span', 'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'del', 'sub', 'sup', 'mark',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'h1', 'h2', 'h3', 'h4', 'hr',
  'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
]);
const DROP_WITH_CONTENT = new Set(['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'link', 'meta', 'svg', 'math']);
const ATTRS: Record<string, string[]> = {
  a: ['href', 'title'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  td: ['colspan', 'rowspan'],
  th: ['colspan', 'rowspan'],
  ol: ['start'],
  code: ['class']
};

const safeUrl = (value: string, image: boolean): boolean => {
  const v = value.trim().toLowerCase();
  if (v.startsWith('https://') || v.startsWith('http://')) return true;
  if (!image && v.startsWith('mailto:')) return true;
  return image && /^data:image\/(png|jpe?g|gif|webp);/.test(v);
};

function clean(node: Node, out: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) return out.createTextNode(node.textContent ?? '');
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  if (DROP_WITH_CONTENT.has(tag)) return null;

  /* Unknown wrappers (font, o:p, section...) keep their children. */
  const frag = tag === 'div' || TAGS.has(tag) ? out.createElement(tag === 'div' ? 'div' : tag) : out.createDocumentFragment();
  if (frag instanceof Element) {
    for (const name of ATTRS[tag] ?? []) {
      const value = el.getAttribute(name);
      if (value == null) continue;
      if ((name === 'href' || name === 'src') && !safeUrl(value, tag === 'img')) continue;
      frag.setAttribute(name, value);
    }
    if (tag === 'a' && frag.getAttribute('href')) {
      frag.setAttribute('target', '_blank');
      frag.setAttribute('rel', 'noopener noreferrer');
    }
    if (tag === 'img') {
      frag.setAttribute('loading', 'lazy');
      if (!frag.getAttribute('alt')) frag.setAttribute('alt', 'Image');
    }
    if (tag === 'img' && !frag.getAttribute('src')) return null;
  }
  el.childNodes.forEach((child) => {
    const cleaned = clean(child, out);
    if (cleaned) frag.appendChild(cleaned);
  });
  return frag;
}

export function sanitizeHtml(html: string): string {
  if (typeof DOMParser === 'undefined') return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const out = document.implementation.createHTMLDocument('');
  const root = out.createElement('div');
  doc.body.childNodes.forEach((child) => {
    const cleaned = clean(child, out);
    if (cleaned) root.appendChild(cleaned);
  });

  root.querySelectorAll('pre').forEach((pre) => {
    const raw = (pre.textContent ?? '').replace(/\n$/, '');
    const lines = raw.split('\n');
    const lang = (pre.querySelector('code')?.className.match(/language-([\w+-]+)/)?.[1] ?? guessLanguage(raw)).toLowerCase();

    const wrap = out.createElement('div');
    wrap.className = 'tr-rich-code';
    if (lines.length > 3) wrap.setAttribute('data-numbered', '');

    const head = out.createElement('div');
    head.className = 'tr-rich-code-head';
    const label = out.createElement('span');
    label.className = 'tr-rich-code-lang';
    label.textContent = LANG_LABEL[lang] ?? lang;
    const btn = out.createElement('button');
    btn.type = 'button';
    btn.className = 'tr-rich-copy';
    btn.setAttribute('data-rich-copy', '');
    btn.textContent = 'Copy';
    head.append(label, btn);

    const body = out.createElement('pre');
    body.setAttribute('data-raw', raw);
    body.tabIndex = 0;
    lines.forEach((line) => {
      const row = out.createElement('span');
      row.className = 'tr-rich-ln';
      highlight(line, out).forEach((node) => row.appendChild(node));
      if (!line) row.appendChild(out.createTextNode(' '));
      body.appendChild(row);
    });

    pre.replaceWith(wrap);
    wrap.append(head, body);
  });
  root.querySelectorAll('table').forEach((table) => {
    const wrap = out.createElement('div');
    wrap.className = 'tr-rich-table';
    table.replaceWith(wrap);
    wrap.appendChild(table);
  });
  return root.innerHTML;
}

/** True when the editor holds more than plain lines of text. */
export function hasRichMarkup(html: string): boolean {
  return /<(b|strong|i|em|u|s|strike|del|ul|ol|li|a|img|table|pre|code|blockquote|h[1-4]|mark|sub|sup|hr)[\s>]/i.test(html) || /style=/.test(html);
}

const LANG_LABEL: Record<string, string> = { powershell: 'PowerShell', bash: 'Shell', shell: 'Shell', sh: 'Shell', js: 'JavaScript', javascript: 'JavaScript', ts: 'TypeScript', json: 'JSON', sql: 'SQL', log: 'Log', text: 'Text', python: 'Python', py: 'Python' };

function guessLanguage(code: string): string {
  if (/\b(Get|Set|Select|Where|Format|Out)-[A-Z]\w+|\$[A-Za-z_]\w*\s*=/.test(code)) return 'powershell';
  if (/^\s*\$ |^\s*(curl|sudo|openssl|ls|cd|grep|echo)\b/m.test(code)) return 'bash';
  if (/^\s*[{\[]/.test(code) && /":\s*/.test(code)) return 'json';
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/m.test(code)) return 'log';
  return 'text';
}

/** A deliberately small tokenizer: comments, strings, numbers, flags, keywords. Colours live in CSS. */
const TOKEN =
  /(^\s*(?:#|\/\/|--)\s.*$|\s#\s.*$)|("(?:[^"\\]|\\.)*"|'[^']*'|`[^`]*`)|(\b\d+(?:[.:]\d+)*\b)|((?<![\w-])--?[A-Za-z][\w-]*)|(\b(?:if|else|elseif|for|foreach|while|return|function|const|let|var|import|from|export|class|def|try|catch|throw|true|false|null|ERROR|WARN|INFO|Write-Error|Get-[A-Za-z]+|Set-[A-Za-z]+|Select-Object|Where-Object|Format-Table|Out-String|curl|openssl|sudo)\b)/g;
const CLASSES = ['', 'tr-tok-comment', 'tr-tok-string', 'tr-tok-number', 'tr-tok-flag', 'tr-tok-keyword'];

function highlight(line: string, doc: Document): Node[] {
  const nodes: Node[] = [];
  let last = 0;
  for (const match of line.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    const group = match.slice(1).findIndex((part) => part !== undefined) + 1;
    if (index > last) nodes.push(doc.createTextNode(line.slice(last, index)));
    const span = doc.createElement('span');
    span.className = CLASSES[group];
    span.textContent = match[0];
    nodes.push(span);
    last = index + match[0].length;
  }
  if (last < line.length) nodes.push(doc.createTextNode(line.slice(last)));
  return nodes;
}

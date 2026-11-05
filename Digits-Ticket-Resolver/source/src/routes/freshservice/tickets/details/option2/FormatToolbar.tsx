import { Fragment, useEffect, useRef, useState, type RefObject } from 'react';
import { IconButton, Menu, TextButton, useToast } from '@freshworks/dew-components';
import type { IconName, IMenuOption } from '@freshworks/dew-components';
import type { ToolbarSet } from './composerLayout';

/**
 * Option 2 · the editor's formatting toolbar.
 *
 * Always on, at the top of the editor, as in the email editor — there is no
 * toggle to find. Every button works on the editor's HTML: styles, colour, alignment,
 * lists, links, code, images, tables and clear formatting. Chat tickets get the short set
 * Slack and Teams messages are written with; everything else gets the full one.
 */

type Command = 'bold' | 'italic' | 'underline' | 'strikeThrough' | 'insertOrderedList' | 'insertUnorderedList';
type Tool = { id: string; label: string; icon: IconName; command?: Command };

const BOLD: Tool = { id: 'bold', label: 'Bold', icon: 'Bold', command: 'bold' };
const ITALIC: Tool = { id: 'italic', label: 'Italic', icon: 'Italic', command: 'italic' };
const UNDERLINE: Tool = { id: 'underline', label: 'Underline', icon: 'Underline1', command: 'underline' };
const STRIKE: Tool = { id: 'strike', label: 'Strikethrough', icon: 'Strike', command: 'strikeThrough' };
const NUMBERED: Tool = { id: 'ol', label: 'Numbered list', icon: 'Numbering', command: 'insertOrderedList' };
const BULLETED: Tool = { id: 'ul', label: 'Bulleted list', icon: 'Bullets', command: 'insertUnorderedList' };
const LINK: Tool = { id: 'link', label: 'Insert link', icon: 'Link' };
const CODE: Tool = { id: 'code', label: 'Code', icon: 'Code' };

/** Groups, separated by a hairline. */
const SETS: Record<ToolbarSet, Tool[][]> = {
  basic: [[BOLD, ITALIC, UNDERLINE, STRIKE], [NUMBERED, BULLETED], [LINK, CODE]],
  full: [
    [{ id: 'paragraph', label: 'Paragraph style', icon: 'Paragraph' }],
    [BOLD, ITALIC, UNDERLINE, STRIKE],
    [
      { id: 'color', label: 'Text colour', icon: 'ColorPicker' },
      { id: 'highlight', label: 'Highlight', icon: 'ColorFill' }
    ],
    [
      { id: 'align', label: 'Align', icon: 'AlignLeft' },
      { id: 'outdent', label: 'Decrease indent', icon: 'IntentLeft' },
      { id: 'indent', label: 'Increase indent', icon: 'IndentRight' }
    ],
    [NUMBERED, BULLETED],
    [
      LINK,
      { id: 'image', label: 'Insert image', icon: 'Image' },
      { id: 'table', label: 'Insert table', icon: 'Table' },
      CODE
    ],
    [{ id: 'clear', label: 'Clear formatting', icon: 'ClearFormatting' }]
  ]
};

const PARAGRAPH: IMenuOption[] = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'blockquote', label: 'Quote' },
  { value: 'pre', label: 'Code block' }
];
/* Swatches are Dew tokens, resolved to the live theme colour when applied. */
const COLOURS: IMenuOption[] = [
  { value: '--color-text-primary', label: 'Default' },
  { value: '--color-text-semantic-error', label: 'Red' },
  { value: '--color-text-semantic-info', label: 'Blue' },
  { value: '--color-text-semantic-success', label: 'Green' },
  { value: '--color-text-semantic-warning', label: 'Orange' }
];
const HIGHLIGHTS: IMenuOption[] = [
  { value: 'transparent', label: 'None' },
  { value: '--color-fill-semantic-warning-mild', label: 'Yellow' },
  { value: '--color-fill-semantic-success-mild', label: 'Green' },
  { value: '--color-fill-semantic-info-mild', label: 'Blue' },
  { value: '--color-fill-semantic-error-mild', label: 'Red' }
];
const resolveToken = (value: string) =>
  value.startsWith('--') ? getComputedStyle(document.documentElement).getPropertyValue(value).trim() || value : value;
const ALIGN: IMenuOption[] = [
  { value: 'justifyLeft', label: 'Align left' },
  { value: 'justifyCenter', label: 'Align centre' },
  { value: 'justifyRight', label: 'Align right' }
];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const COMMANDS: Command[] = ['bold', 'italic', 'underline', 'strikeThrough', 'insertOrderedList', 'insertUnorderedList'];

export default function FormatToolbar({
  set,
  editorRef,
  onChange
}: {
  set: ToolbarSet;
  editorRef: RefObject<HTMLElement | null>;
  /** The editor's content changed through a toolbar action. */
  onChange?: () => void;
}) {
  const [on, setOn] = useState<Record<string, boolean>>({});
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState('https://');
  const saved = useRef<Range | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { addErrorToast } = useToast();

  /* Which of the toggle styles the caret is inside. */
  useEffect(() => {
    const read = () => {
      const editor = editorRef.current;
      const anchor = document.getSelection()?.anchorNode;
      if (!editor || !anchor || !editor.contains(anchor)) {
        setOn({});
        return;
      }
      setOn(Object.fromEntries(COMMANDS.map((command) => [command, document.queryCommandState(command)])));
    };
    document.addEventListener('selectionchange', read);
    return () => document.removeEventListener('selectionchange', read);
  }, [editorRef]);

  const focusEditor = () => editorRef.current?.focus({ preventScroll: true });
  const exec = (command: string, value?: string) => {
    focusEditor();
    document.execCommand(command, false, value);
    onChange?.();
  };
  const remember = () => {
    const sel = document.getSelection();
    saved.current = sel && sel.rangeCount && editorRef.current?.contains(sel.anchorNode) ? sel.getRangeAt(0).cloneRange() : null;
  };
  const restore = () => {
    focusEditor();
    const sel = document.getSelection();
    if (saved.current && sel) {
      sel.removeAllRanges();
      sel.addRange(saved.current);
    }
  };
  const escapeHtml = (text: string) => text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string);

  const insertCode = () => {
    focusEditor();
    const text = document.getSelection()?.toString() ?? '';
    if (text.includes('\n')) exec('insertHTML', `<pre><code>${escapeHtml(text)}</code></pre><p><br></p>`);
    else exec('insertHTML', `<code>${escapeHtml(text || 'code')}</code>&nbsp;`);
  };

  const applyLink = () => {
    restore();
    const href = url.trim();
    if (/^(https?:\/\/|mailto:)/i.test(href) && href !== 'https://') {
      const hasSelection = !(document.getSelection()?.isCollapsed ?? true);
      if (hasSelection) exec('createLink', href);
      else exec('insertHTML', `<a href="${href.replace(/"/g, '&quot;')}">${escapeHtml(href)}</a>&nbsp;`);
    }
    setLinkOpen(false);
    setUrl('https://');
  };

  const pickImage = (file?: File) => {
    if (!file) return;
    if (!/^image\/(png|jpe?g|gif|webp)$/.test(file.type)) {
      addErrorToast({ message: 'Only PNG, JPG, GIF or WebP images can be inserted', autoClose: true, timeout: 5000 });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      addErrorToast({ message: 'Image is larger than 2 MB. Attach it as a file instead', autoClose: true, timeout: 5000 });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      restore();
      exec('insertHTML', `<img src="${reader.result as string}" alt="${escapeHtml(file.name)}"><p><br></p>`);
    };
    reader.readAsDataURL(file);
  };

  const insertTable = () =>
    exec(
      'insertHTML',
      '<table><tbody><tr><th>Column 1</th><th>Column 2</th><th>Column 3</th></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table><p><br></p>'
    );

  const clear = () => {
    focusEditor();
    document.execCommand('removeFormat');
    document.execCommand('unlink');
    document.execCommand('formatBlock', false, 'p');
    onChange?.();
  };

  const menuFor = (tool: Tool, options: IMenuOption[], pick: (value: string) => void) => (
    <Menu
      key={tool.id}
      aria-label={tool.label}
      options={options}
      onClick={(option: IMenuOption) => {
        restore();
        pick(String(option.value));
      }}
      slots={{ trigger: <IconButton iconName={tool.icon} aria-label={tool.label} size="mini" onClick={remember} /> }}
    />
  );

  const render = (tool: Tool) => {
    switch (tool.id) {
      case 'paragraph':
        return menuFor(tool, PARAGRAPH, (value) => exec('formatBlock', value === 'p' ? 'p' : value));
      case 'color':
        return menuFor(tool, COLOURS, (value) => exec('foreColor', resolveToken(value)));
      case 'highlight':
        return menuFor(tool, HIGHLIGHTS, (value) => exec('hiliteColor', resolveToken(value)));
      case 'align':
        return menuFor(tool, ALIGN, (value) => exec(value));
      default:
        break;
    }
    const onClick = () => {
      if (tool.command) return exec(tool.command);
      switch (tool.id) {
        case 'outdent': return exec('outdent');
        case 'indent': return exec('indent');
        case 'code': return insertCode();
        case 'table': return insertTable();
        case 'clear': return clear();
        case 'link':
          remember();
          return setLinkOpen((open) => !open);
        case 'image':
          remember();
          return fileRef.current?.click();
        default:
      }
    };
    return (
      <IconButton
        key={tool.id}
        iconName={tool.icon}
        aria-label={tool.label}
        aria-pressed={tool.command ? Boolean(on[tool.command]) : tool.id === 'link' ? linkOpen : undefined}
        active={tool.command ? Boolean(on[tool.command]) : undefined}
        size="mini"
        onClick={onClick}
      />
    );
  };

  return (
    <>
      <div
        className="tr-o2-compose-toolbar"
        role="toolbar"
        aria-label="Text formatting"
        /* Keeps the caret and selection in the text while a button is pressed. */
        onMouseDown={(event) => {
          if (!(event.target as HTMLElement).closest('input')) event.preventDefault();
        }}
      >
        {SETS[set].map((group, index) => (
          <Fragment key={group[0].id}>
            {index > 0 && <span className="tr-o2-compose-toolbar-sep" aria-hidden />}
            {group.map(render)}
          </Fragment>
        ))}
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          hidden
          onChange={(event) => {
            pickImage(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </div>
      {linkOpen && (
        <div className="tr-o2-compose-linkrow" style={{ display: 'flex', gap: 'var(--spacing-100)', alignItems: 'center', padding: 'var(--spacing-100) var(--spacing-150)' }}>
          <input
            aria-label="Link address"
            value={url}
            autoFocus
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') applyLink();
              if (event.key === 'Escape') setLinkOpen(false);
            }}
            style={{ flex: 1, minWidth: 0, padding: 'var(--spacing-075) var(--spacing-100)', font: 'inherit', border: '1px solid var(--color-boundary-border-mild)', borderRadius: 8, background: 'var(--color-fill-surface)', color: 'var(--color-text-primary)' }}
          />
          <TextButton variant="secondary" size="mini" onClick={() => setLinkOpen(false)}>Cancel</TextButton>
          <TextButton variant="primary" size="mini" onClick={applyLink}>Apply</TextButton>
        </div>
      )}
    </>
  );
}

import { Fragment, useEffect, useState, type RefObject } from 'react';
import { IconButton } from '@freshworks/dew-components';
import type { IconName } from '@freshworks/dew-components';
import type { ToolbarSet } from './composerLayout';

/**
 * Option 2 · the editor's formatting toolbar.
 *
 * Always on, at the top of the editor, as in the email editor — there is no
 * toggle to find. Bold, italic and underline work; every other button is a
 * placeholder for the product's own editor. Chat tickets get the short set
 * Slack and Teams messages are written with; everything else gets the full one.
 */

type Tool = { id: string; label: string; icon: IconName; command?: 'bold' | 'italic' | 'underline' };

const BOLD: Tool = { id: 'bold', label: 'Bold', icon: 'Bold', command: 'bold' };
const ITALIC: Tool = { id: 'italic', label: 'Italic', icon: 'Italic', command: 'italic' };
const UNDERLINE: Tool = { id: 'underline', label: 'Underline', icon: 'Underline1', command: 'underline' };
const STRIKE: Tool = { id: 'strike', label: 'Strikethrough', icon: 'Strike' };
const NUMBERED: Tool = { id: 'ol', label: 'Numbered list', icon: 'Numbering' };
const BULLETED: Tool = { id: 'ul', label: 'Bulleted list', icon: 'Bullets' };
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

export default function FormatToolbar({
  set,
  editorRef
}: {
  set: ToolbarSet;
  editorRef: RefObject<HTMLElement | null>;
}) {
  const [on, setOn] = useState<Record<string, boolean>>({});

  /* Which of bold / italic / underline the caret is inside. */
  useEffect(() => {
    const read = () => {
      const editor = editorRef.current;
      const anchor = document.getSelection()?.anchorNode;
      if (!editor || !anchor || !editor.contains(anchor)) {
        setOn({});
        return;
      }
      setOn({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline')
      });
    };
    document.addEventListener('selectionchange', read);
    return () => document.removeEventListener('selectionchange', read);
  }, [editorRef]);

  const run = (tool: Tool) => {
    if (!tool.command) return;
    editorRef.current?.focus({ preventScroll: true });
    document.execCommand(tool.command);
  };

  return (
    <div
      className="tr-o2-compose-toolbar"
      role="toolbar"
      aria-label="Text formatting"
      /* Keeps the caret and selection in the text while a button is pressed. */
      onMouseDown={(event) => event.preventDefault()}
    >
      {SETS[set].map((group, index) => (
        <Fragment key={group[0].id}>
          {index > 0 && <span className="tr-o2-compose-toolbar-sep" aria-hidden />}
          {group.map((tool) => (
            <IconButton
              key={tool.id}
              iconName={tool.icon}
              aria-label={tool.label}
              aria-pressed={tool.command ? Boolean(on[tool.command]) : undefined}
              active={tool.command ? Boolean(on[tool.command]) : undefined}
              size="mini"
              onClick={() => run(tool)}
            />
          ))}
        </Fragment>
      ))}
    </div>
  );
}

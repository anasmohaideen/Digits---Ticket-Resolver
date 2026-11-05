/** The reply editor's AI menus, from the AI Design System (`features/reply-editor/drafts.ts`). */
/** `sparkle` is the Dew-AI mark; every other value is a Dew icon name from the illustration library. */
export type AiMenuIcon = 'sparkle' | (string & {})

export type AiMenuItem =
  | { type: 'item'; label: string; prompt: string; icon?: AiMenuIcon; variant?: 'default' | 'ai' }
  | { type: 'divider' }
  | { type: 'header'; label: string }

/** Refine dropdown (RTE AI action bar). */
export const REFINE_MENU_OPTIONS: AiMenuItem[] = [
  { type: 'item', label: 'Expand text', prompt: 'Expand text', icon: 'TextAreaExpand' },
  { type: 'item', label: 'Rephrase', prompt: 'Rephrase', icon: 'Refresh' },
  { type: 'divider' },
  { type: 'header', label: 'Enhance tone' },
  { type: 'item', label: 'Professional', prompt: 'Make tone professional', icon: 'MyWork' },
  { type: 'item', label: 'Casual', prompt: 'Make tone casual', icon: 'Conversation' },
  { type: 'item', label: 'Friendly', prompt: 'Make tone friendly', icon: 'CSATHappy' },
]

/** Reply using AI dropdown (RTE and the reply bar). */
export const REPLY_USING_AI_MENU_OPTIONS: AiMenuItem[] = [
  { type: 'item', label: 'Generate reply', prompt: 'Generate reply', icon: 'sparkle', variant: 'ai' },
  { type: 'item', label: 'Suggest resolution steps', prompt: 'Suggest resolution steps' },
  { type: 'item', label: 'Acknowledge', prompt: 'Acknowledge' },
  { type: 'item', label: 'Request more information', prompt: 'Request more information' },
  { type: 'item', label: 'Follow up', prompt: 'Follow up' },
  { type: 'item', label: 'Request confirmation to close', prompt: 'Request confirmation to close' },
]

import type { SliderContainerState } from '../../components/dew/SliderContainer/SliderContainer'

export type ReplyEditorMode = 'closed' | 'open'

export interface TextSelection {
  start: number
  end: number
  text: string
}

export type CopilotIntent = 'refine' | 'reply-using-ai' | 'edit-with-copilot'

export type InlineAiPhase = 'idle' | 'loading' | 'ready'

export type InlineReplaceMode = 'selection' | 'greeting' | 'insert'

export interface CopilotUserMessage {
  id: string
  role: 'user'
  prompt: string
  quotedText?: string
}

export interface CopilotAssistantMessage {
  id: string
  role: 'assistant'
  text: string
  status: 'loading' | 'done'
}

export type CopilotMessage = CopilotUserMessage | CopilotAssistantMessage

export interface CopilotPanelProps {
  className?: string
  open: boolean
  state?: SliderContainerState
  messages: CopilotMessage[]
  /** Quoted selection shown in the input before the first message is sent. */
  inputQuotedText?: string
  prompt: string
  isGenerating: boolean
  clearConversationDisabled?: boolean
  inputAutoFocus?: boolean
  showGlow?: boolean
  glowKey?: number
  onGlowEnd?: () => void
  onPromptChange: (value: string) => void
  onGenerate: () => void
  onStop: () => void
  onRegenerate: () => void
  onAccept: () => void
  onMinimize?: () => void
  onClearConversation?: () => void
  onClose: () => void
}

import { useCallback, useEffect, useRef, useState } from 'react'
import type { SliderContainerState } from '../../components/dew/SliderContainer/SliderContainer'
import { mockCopilotRewrite } from './drafts'
import type { CopilotAssistantMessage, CopilotMessage, CopilotUserMessage, TextSelection } from './types'

interface UseCopilotPanelOptions {
  onAccept: (start: number, end: number, newText: string) => void
}

const GENERATION_MS = 1200

let messageIdCounter = 0

function nextMessageId() {
  messageIdCounter += 1
  return `copilot-msg-${messageIdCounter}`
}

function getGenerationSource(messages: CopilotMessage[], selectionText: string) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (message.role === 'assistant' && message.status === 'done' && message.text.trim()) {
      return message.text
    }
  }
  return selectionText
}

function getLatestAssistantText(messages: CopilotMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (message.role === 'assistant' && message.status === 'done') {
      return message.text
    }
  }
  return ''
}

function getLastUserMessage(messages: CopilotMessage[]): CopilotUserMessage | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (message.role === 'user') return message
  }
  return null
}

export function useCopilotPanel({ onAccept }: UseCopilotPanelOptions) {
  const [open, setOpen] = useState(false)
  const [selectionRange, setSelectionRange] = useState<TextSelection | null>(null)
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<CopilotMessage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [inputAutoFocus, setInputAutoFocus] = useState(false)
  const [sliderState, setSliderState] = useState<SliderContainerState>('default')
  const [sliderGlow, setSliderGlow] = useState(false)
  const [sliderGlowKey, setSliderGlowKey] = useState(0)
  const generationRef = useRef<number | null>(null)

  const clearGenerationTimer = useCallback(() => {
    if (generationRef.current !== null) {
      window.clearTimeout(generationRef.current)
      generationRef.current = null
    }
  }, [])

  useEffect(() => () => clearGenerationTimer(), [clearGenerationTimer])

  const triggerSliderGlow = useCallback(() => {
    setSliderGlowKey((key) => key + 1)
    setSliderGlow(true)
  }, [])

  const handleSliderGlowEnd = useCallback(() => {
    setSliderGlow(false)
  }, [])

  const runGeneration = useCallback(
    (assistantId: string, sourceText: string, userPrompt: string) => {
      clearGenerationTimer()
      setIsGenerating(true)
      setInputAutoFocus(false)

      generationRef.current = window.setTimeout(() => {
        const result = mockCopilotRewrite(sourceText, userPrompt)
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId && message.role === 'assistant'
              ? { ...message, text: result, status: 'done' as const }
              : message,
          ),
        )
        setIsGenerating(false)
        setInputAutoFocus(true)
        generationRef.current = null
      }, GENERATION_MS)
    },
    [clearGenerationTimer],
  )

  const openForEdit = useCallback(
    (selection: TextSelection) => {
      clearGenerationTimer()
      setSelectionRange(selection)
      setPrompt('')
      setMessages([])
      setIsGenerating(false)
      setSliderState('default')
      setInputAutoFocus(true)
      setOpen(true)
      triggerSliderGlow()
    },
    [clearGenerationTimer, triggerSliderGlow],
  )

  const handlePromptChange = useCallback((value: string) => {
    setPrompt(value)
  }, [])

  const handleGenerate = useCallback(() => {
    if (!selectionRange || !prompt.trim() || isGenerating) return

    const trimmedPrompt = prompt.trim()
    const isFirstUserMessage = !messages.some((message) => message.role === 'user')
    const sourceText = getGenerationSource(messages, selectionRange.text)

    const userMessage: CopilotUserMessage = {
      id: nextMessageId(),
      role: 'user',
      prompt: trimmedPrompt,
      quotedText: isFirstUserMessage ? selectionRange.text : undefined,
    }

    const assistantId = nextMessageId()
    const assistantMessage: CopilotAssistantMessage = {
      id: assistantId,
      role: 'assistant',
      text: '',
      status: 'loading',
    }

    setMessages((current) => [...current, userMessage, assistantMessage])
    setPrompt('')
    runGeneration(assistantId, sourceText, trimmedPrompt)
  }, [isGenerating, messages, prompt, runGeneration, selectionRange])

  const handleStop = useCallback(() => {
    clearGenerationTimer()
    setIsGenerating(false)
    setInputAutoFocus(true)
    setMessages((current) => {
      const last = current[current.length - 1]
      if (last?.role === 'assistant' && last.status === 'loading') {
        return current.slice(0, -1)
      }
      return current
    })
  }, [clearGenerationTimer])

  const handleRegenerate = useCallback(() => {
    if (isGenerating) return

    const lastUser = getLastUserMessage(messages)
    if (!lastUser || !selectionRange) return

    const sourceText = getGenerationSource(
      messages.slice(0, -1),
      selectionRange.text,
    )

    const assistantId = nextMessageId()
    const assistantMessage: CopilotAssistantMessage = {
      id: assistantId,
      role: 'assistant',
      text: '',
      status: 'loading',
    }

    setMessages((current) => {
      const last = current[current.length - 1]
      const withoutLastAssistant = last?.role === 'assistant' ? current.slice(0, -1) : current
      return [...withoutLastAssistant, assistantMessage]
    })

    runGeneration(assistantId, sourceText, lastUser.prompt)
  }, [isGenerating, messages, runGeneration, selectionRange])

  const handleAccept = useCallback(() => {
    const candidateText = getLatestAssistantText(messages)
    if (!selectionRange || !candidateText.trim() || isGenerating) return

    onAccept(selectionRange.start, selectionRange.end, candidateText)
    clearGenerationTimer()
    setOpen(false)
    setSelectionRange(null)
    setPrompt('')
    setMessages([])
    setIsGenerating(false)
    setSliderState('default')
    setInputAutoFocus(false)
    setSliderGlow(false)
  }, [clearGenerationTimer, isGenerating, messages, onAccept, selectionRange])

  const handleMinimize = useCallback(() => {
    setSliderState((state) => (state === 'minimize' ? 'default' : 'minimize'))
  }, [])

  const handleClearConversation = useCallback(() => {
    if (messages.length === 0 && !isGenerating) return

    clearGenerationTimer()
    setPrompt('')
    setMessages([])
    setIsGenerating(false)
    setInputAutoFocus(true)
    triggerSliderGlow()
  }, [clearGenerationTimer, isGenerating, messages.length, triggerSliderGlow])

  const handleClose = useCallback(() => {
    clearGenerationTimer()
    setOpen(false)
    setSelectionRange(null)
    setPrompt('')
    setMessages([])
    setIsGenerating(false)
    setSliderState('default')
    setInputAutoFocus(false)
    setSliderGlow(false)
  }, [clearGenerationTimer])

  const reset = useCallback(() => {
    handleClose()
  }, [handleClose])

  const hasUserMessages = messages.some((message) => message.role === 'user')
  const inputQuotedText = hasUserMessages ? undefined : selectionRange?.text
  const clearConversationDisabled = messages.length === 0 && !isGenerating

  const buildCopilotPanelProps = useCallback(
    () => ({
      open,
      state: sliderState,
      messages,
      inputQuotedText,
      prompt,
      isGenerating,
      clearConversationDisabled,
      inputAutoFocus,
      showGlow: sliderGlow,
      glowKey: sliderGlowKey,
      onGlowEnd: handleSliderGlowEnd,
      onPromptChange: handlePromptChange,
      onGenerate: handleGenerate,
      onStop: handleStop,
      onRegenerate: handleRegenerate,
      onAccept: handleAccept,
      onMinimize: handleMinimize,
      onClearConversation: handleClearConversation,
      onClose: handleClose,
    }),
    [
      clearConversationDisabled,
      handleAccept,
      handleClearConversation,
      handleClose,
      handleGenerate,
      handleMinimize,
      handlePromptChange,
      handleRegenerate,
      handleSliderGlowEnd,
      handleStop,
      inputAutoFocus,
      inputQuotedText,
      isGenerating,
      messages,
      open,
      prompt,
      sliderGlow,
      sliderGlowKey,
      sliderState,
    ],
  )

  return {
    open,
    openForEdit,
    reset,
    buildCopilotPanelProps,
  }
}

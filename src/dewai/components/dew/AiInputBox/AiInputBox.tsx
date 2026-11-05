import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent } from 'react'
import { IconButton } from '../IconButton/IconButton'
import { PlusIcon, SendIcon, StopIcon } from '../shared/IllustrationIcons'
import { AiInputQuoteChip } from './AiInputQuoteChip'
import styles from './AiInputBox.module.css'

export type AiInputBoxState = 'default' | 'filled' | 'thinking'

export interface AiInputBoxProps {
  value?: string
  placeholder?: string
  /** Selected text quoted above the prompt (Edit with Copilot) — Figma chip style. */
  quotedText?: string
  quoteVariant?: 'chip' | 'bar'
  /** Focus the textarea when mounted or when this flips true. */
  autoFocus?: boolean
  /** Controlled visual state override */
  state?: AiInputBoxState
  disabled?: boolean
  showDisclaimer?: boolean
  onChange?: (value: string) => void
  onSend?: () => void
  onStop?: () => void
  onAttach?: () => void
  onKnowMore?: () => void
}

const DEFAULT_PLACEHOLDER = 'Ask me anything'

function resolveVisualState(
  state: AiInputBoxState | undefined,
  hasValue: boolean,
): AiInputBoxState {
  if (state) return state
  if (hasValue) return 'filled'
  return 'default'
}

export function AiInputBox({
  value = '',
  placeholder = DEFAULT_PLACEHOLDER,
  quotedText,
  quoteVariant = 'chip',
  autoFocus = false,
  state,
  disabled = false,
  showDisclaimer = true,
  onChange,
  onSend,
  onStop,
  onAttach,
  onKnowMore,
}: AiInputBoxProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [internalValue, setInternalValue] = useState('')

  const isControlled = onChange !== undefined
  const inputValue = isControlled ? value : internalValue
  const hasValue = inputValue.trim().length > 0
  const hasQuote = Boolean(quotedText?.trim())
  const visualState = resolveVisualState(state, hasValue || hasQuote)
  const isThinking = visualState === 'thinking'
  const isInteractive = state === undefined
  const showTextarea =
    isInteractive || visualState === 'filled' || hasQuote || visualState === 'thinking'

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 80)}px`
  }, [inputValue, visualState, quotedText])

  useEffect(() => {
    if (!autoFocus || disabled || isThinking) return
    const id = window.requestAnimationFrame(() => {
      textareaRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(id)
  }, [autoFocus, disabled, isThinking, quotedText])

  const inputBoxClass = [
    styles.inputBox,
    isThinking ? styles.thinking : '',
    disabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ')

  const wrapClass = [
    styles.inputWrap,
    isThinking ? styles.thinking : '',
    disabled ? styles.disabled : '',
    isInteractive && (hasValue || hasQuote) ? styles.hasText : '',
    visualState === 'filled' ? styles.filled : '',
  ]
    .filter(Boolean)
    .join(' ')

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value
    if (isControlled) {
      onChange?.(next)
    } else {
      setInternalValue(next)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!disabled && !isThinking && hasValue) onSend?.()
    }
  }

  const handleBoxClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return
    if (!isInteractive || disabled || isThinking) return
    textareaRef.current?.focus()
  }

  return (
    <div className={styles.wrapper} ref={rootRef}>
      <div
        className={wrapClass}
        data-interactive={isInteractive && !disabled && !isThinking ? true : undefined}
        onClick={handleBoxClick}
      >
        <div className={styles.staticBorder} aria-hidden="true" />
        <div className={styles.focusBorder} aria-hidden="true" />
        <div className={inputBoxClass}>
          <div className={styles.textFrame}>
            {quotedText?.trim() &&
              (quoteVariant === 'chip' ? (
                <AiInputQuoteChip text={quotedText} />
              ) : (
                <div className={styles.quoteBlock}>
                  <span className={styles.quoteBar} aria-hidden="true" />
                  <p className={styles.quoteText}>{quotedText}</p>
                </div>
              ))}
            {showTextarea ? (
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                value={inputValue}
                placeholder={placeholder}
                disabled={disabled || isThinking}
                readOnly={!isInteractive}
                rows={1}
                aria-label="AI prompt"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <p className={styles.placeholder}>{placeholder}</p>
            )}
          </div>

          <div className={styles.actionRow}>
            <IconButton
              label="Add attachment"
              className={styles.actionButton}
              disabled={disabled || isThinking}
              onClick={onAttach}
            >
              <PlusIcon className={styles.actionIcon} />
            </IconButton>

            {isThinking ? (
              <IconButton
                label="Stop generating"
                className={[styles.actionButton, styles.stopButton].join(' ')}
                disabled={disabled}
                onClick={onStop}
              >
                <StopIcon className={styles.stopIcon} />
              </IconButton>
            ) : (
              <IconButton
                label="Send"
                className={styles.actionButton}
                disabled={disabled || !hasValue}
                onClick={onSend}
              >
                <SendIcon className={styles.actionIcon} />
              </IconButton>
            )}
          </div>
        </div>
      </div>

      {showDisclaimer && (
        <p className={styles.disclaimer}>
          Review AI answers carefully.{' '}
          <button type="button" onClick={onKnowMore}>
            Know more
          </button>
        </p>
      )}
    </div>
  )
}

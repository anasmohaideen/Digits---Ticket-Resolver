import { useState } from 'react'
import { ChevronDownIcon } from '../shared/IllustrationIcons'
import styles from './AiInputBox.module.css'

interface AiInputQuoteChipProps {
  text: string
  defaultExpanded?: boolean
  /** White chip surface — used inside thread bubbles. */
  surface?: boolean
}

export function AiInputQuoteChip({
  text,
  defaultExpanded = false,
  surface = false,
}: AiInputQuoteChipProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  if (!text.trim()) return null

  return (
    <button
      type="button"
      className={[styles.quoteChip, surface ? styles.quoteChipSurface : ''].join(' ')}
      aria-expanded={expanded}
      onClick={() => setExpanded((current) => !current)}
    >
      <span className={[styles.quoteChipText, expanded ? styles.quoteChipTextExpanded : ''].join(' ')}>
        {text}
      </span>
      <ChevronDownIcon
        className={[styles.quoteChipChevron, expanded ? styles.quoteChipChevronExpanded : ''].join(' ')}
      />
    </button>
  )
}

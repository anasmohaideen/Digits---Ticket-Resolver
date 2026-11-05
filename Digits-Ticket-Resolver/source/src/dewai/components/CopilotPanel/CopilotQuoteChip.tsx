import { AiInputQuoteChip } from '../dew/AiInputBox/AiInputQuoteChip'

interface CopilotQuoteChipProps {
  text: string
  defaultExpanded?: boolean
}

/** Quote chip for Copilot thread bubbles — white surface on gray bubble. */
export function CopilotQuoteChip({ text, defaultExpanded = false }: CopilotQuoteChipProps) {
  return <AiInputQuoteChip text={text} defaultExpanded={defaultExpanded} surface />
}

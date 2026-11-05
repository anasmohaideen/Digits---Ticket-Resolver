import conciergeAvatar from '../../../../Assets/Digits Avatar/Workplace Concierge.svg'
import { DewAiIcon } from '../dew/DewAiIcon/DewAiIcon'
import { IconButton } from '../dew/IconButton/IconButton'
import {
  CrossLargeIcon,
  ExpandIcon,
  MinimizeIcon,
  NewConversationIcon,
} from '../dew/shared/IllustrationIcons'
import sliderStyles from '../dew/SliderContainer/SliderContainer.module.css'

export interface CopilotPanelHeaderProps {
  minimized?: boolean
  showNewConversation?: boolean
  newConversationDisabled?: boolean
  onNewConversation?: () => void
  onMinimize?: () => void
  onClose?: () => void
}

/** Figma panel header — Dew wordmark on, dew mark off (matches Insights slider). */
export function CopilotPanelHeader({
  minimized = false,
  showNewConversation = true,
  newConversationDisabled = false,
  onNewConversation,
  onMinimize,
  onClose,
}: CopilotPanelHeaderProps) {
  return (
    <header className={sliderStyles.header}>
      <DewAiIcon size={20} bg="dew" showName showDewLogo={false} title="Agent Concierge" titleIcon={conciergeAvatar} />
      <div className={sliderStyles.headerActions}>
        {!minimized && showNewConversation && (
          <IconButton
            label="New conversation"
            tone="default"
            className={sliderStyles.headerAction}
            disabled={newConversationDisabled}
            onClick={onNewConversation}
          >
            <NewConversationIcon className={sliderStyles.headerIcon} />
          </IconButton>
        )}
        <IconButton
          label={minimized ? 'Expand' : 'Minimize'}
          tone="default"
          className={sliderStyles.headerAction}
          onClick={onMinimize}
        >
          {minimized ? (
            <ExpandIcon className={sliderStyles.headerIcon} />
          ) : (
            <MinimizeIcon className={sliderStyles.headerIcon} />
          )}
        </IconButton>
        <IconButton label="Close" tone="default" className={sliderStyles.headerAction} onClick={onClose}>
          <CrossLargeIcon className={sliderStyles.headerIcon} />
        </IconButton>
      </div>
    </header>
  )
}

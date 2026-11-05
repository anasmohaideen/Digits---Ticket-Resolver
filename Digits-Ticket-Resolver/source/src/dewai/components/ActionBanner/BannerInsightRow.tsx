import { Fragment, useState } from 'react'
import { TicketsIcon } from '../dew/shared/IllustrationIcons'
import { useHoverMotion } from '../../providers/HoverMotionProvider'
import { useMotionSurface } from './useMotionSurface'
import type { BannerChip } from './ActionBanner'
import styles from './BannerInsightRow.module.css'

function formatBadgeCount(count: number): string {
  return count > 99 ? '99+' : String(count)
}

interface BannerInsightChipProps {
  chip: BannerChip
  onSelect?: () => void
}

function BannerInsightMotionChip({ chip, onSelect }: BannerInsightChipProps) {
  const [isHovered, setIsHovered] = useState(false)
  const motionSurface = useMotionSurface(isHovered, false)

  return (
    <span
      className={styles.chipWrap}
      data-banner-insight-segment="true"
      {...motionSurface.motionWrapProps}
    >
      <span className={styles.staticBorder} aria-hidden="true" />
      <button
        type="button"
        className={[styles.motionChip, 'ai-pressable'].join(' ')}
        onClick={onSelect}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
      >
        <TicketsIcon className={styles.icon} aria-hidden="true" />
        <span className={styles.label}>{chip.label}</span>
        {chip.count > 0 && <span className={styles.badge}>{formatBadgeCount(chip.count)}</span>}
      </button>
    </span>
  )
}

function BannerInsightTweakChip({ chip, onSelect }: BannerInsightChipProps) {
  return (
    <button type="button" className={styles.tweakChip} onClick={onSelect}>
      <TicketsIcon className={styles.icon} aria-hidden="true" />
      <span className={styles.label}>{chip.label}</span>
      {chip.count > 0 && <span className={styles.badge}>{formatBadgeCount(chip.count)}</span>}
    </button>
  )
}

export interface BannerInsightRowProps {
  chips: BannerChip[]
  onChipClick?: (chipId: string) => void
}

/** Motion — AI chrome insight chips. Tweak — clean surface face + AI chip anatomy (icon, label, badge). */
export function BannerInsightRow({ chips, onChipClick }: BannerInsightRowProps) {
  const { hoverMotion } = useHoverMotion()
  const isTweak = hoverMotion === 'tweak'
  const ChipComponent = isTweak ? BannerInsightTweakChip : BannerInsightMotionChip

  return (
    <div className={styles.row} role="group" aria-label="Related insights">
      {chips.map((chip, index) => (
        <Fragment key={chip.id}>
          {index > 0 && <span className={styles.divider} aria-hidden="true" />}
          <ChipComponent chip={chip} onSelect={() => onChipClick?.(chip.id)} />
        </Fragment>
      ))}
    </div>
  )
}

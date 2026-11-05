import type { CSSProperties } from 'react'

export type TooltipPlacement =
  | 'Top Left'
  | 'Top Centre'
  | 'Top Right'
  | 'Left'
  | 'Right'
  | 'Bottom Left'
  | 'Bottom Centre'
  | 'Bottom Right'

export interface TooltipSurfaceProps {
  content: string
  placement?: TooltipPlacement
  showArrow?: boolean
  multiLine?: boolean
  className?: string
  style?: CSSProperties
  arrowStyle?: CSSProperties
}

export function getTooltipPlacementClass(
  placement: TooltipPlacement,
  styles: Record<string, string>,
): string {
  switch (placement) {
    case 'Top Left':
      return styles.placementTopLeft
    case 'Top Centre':
      return styles.placementTopCentre
    case 'Top Right':
      return styles.placementTopRight
    case 'Left':
      return styles.placementLeft
    case 'Right':
      return styles.placementRight
    case 'Bottom Left':
      return styles.placementBottomLeft
    case 'Bottom Centre':
      return styles.placementBottomCentre
    case 'Bottom Right':
      return styles.placementBottomRight
    default:
      return styles.placementTopCentre
  }
}

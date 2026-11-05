import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
  type ReactElement,
  type Ref,
} from 'react'
import { createPortal } from 'react-dom'
import styles from './Tooltip.module.css'
import {
  getTooltipPlacementClass,
  type TooltipPlacement,
} from './tooltipTypes'

const VIEWPORT_PAD = 8
const TOOLTIP_GAP = 8

interface TooltipProps {
  content: string
  disabled?: boolean
  placement?: TooltipPlacement
  showArrow?: boolean
  multiLine?: boolean
  children: ReactElement<Record<string, unknown>>
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') {
    ref(value)
    return
  }

  if (ref && typeof ref === 'object') {
    (ref as { current: unknown }).current = value
  }
}

function getPosition(
  placement: TooltipPlacement,
  anchorRect: DOMRect,
  tooltipRect: DOMRect,
): { top: number; left: number; arrowLeft?: number; arrowTop?: number } {
  const anchorCenterX = anchorRect.left + anchorRect.width / 2
  const anchorCenterY = anchorRect.top + anchorRect.height / 2

  let top = 0
  let left = 0

  switch (placement) {
    case 'Top Left':
      top = anchorRect.top - tooltipRect.height - TOOLTIP_GAP
      left = anchorRect.left
      break
    case 'Top Right':
      top = anchorRect.top - tooltipRect.height - TOOLTIP_GAP
      left = anchorRect.right - tooltipRect.width
      break
    case 'Top Centre':
      top = anchorRect.top - tooltipRect.height - TOOLTIP_GAP
      left = anchorCenterX - tooltipRect.width / 2
      break
    case 'Bottom Left':
      top = anchorRect.bottom + TOOLTIP_GAP
      left = anchorRect.left
      break
    case 'Bottom Right':
      top = anchorRect.bottom + TOOLTIP_GAP
      left = anchorRect.right - tooltipRect.width
      break
    case 'Bottom Centre':
      top = anchorRect.bottom + TOOLTIP_GAP
      left = anchorCenterX - tooltipRect.width / 2
      break
    case 'Left':
      top = anchorCenterY - tooltipRect.height / 2
      left = anchorRect.left - tooltipRect.width - TOOLTIP_GAP
      break
    case 'Right':
      top = anchorCenterY - tooltipRect.height / 2
      left = anchorRect.right + TOOLTIP_GAP
      break
    default:
      top = anchorRect.top - tooltipRect.height - TOOLTIP_GAP
      left = anchorCenterX - tooltipRect.width / 2
  }

  const clampedLeft = Math.max(
    VIEWPORT_PAD,
    Math.min(left, window.innerWidth - tooltipRect.width - VIEWPORT_PAD),
  )
  const clampedTop = Math.max(
    VIEWPORT_PAD,
    Math.min(top, window.innerHeight - tooltipRect.height - VIEWPORT_PAD),
  )

  const arrowLeft =
    placement === 'Top Centre' ||
    placement === 'Bottom Centre' ||
    placement === 'Top Left' ||
    placement === 'Top Right' ||
    placement === 'Bottom Left' ||
    placement === 'Bottom Right'
      ? anchorCenterX - clampedLeft
      : undefined

  const arrowTop =
    placement === 'Left' || placement === 'Right'
      ? anchorCenterY - clampedTop
      : undefined

  return { top: clampedTop, left: clampedLeft, arrowLeft, arrowTop }
}

export function Tooltip({
  content,
  disabled = false,
  placement = 'Top Centre',
  showArrow = true,
  multiLine = false,
  children,
}: TooltipProps) {
  const triggerRef = useRef<HTMLElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<{
    top: number
    left: number
    arrowLeft?: number
    arrowTop?: number
  } | null>(null)

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    const tooltip = tooltipRef.current
    if (!trigger || !tooltip) return

    setPosition(getPosition(placement, trigger.getBoundingClientRect(), tooltip.getBoundingClientRect()))
  }, [placement])

  useLayoutEffect(() => {
    if (!visible) {
      setPosition(null)
      return
    }

    updatePosition()
  }, [visible, content, placement, updatePosition])

  useEffect(() => {
    if (!visible) return

    const handleReposition = () => updatePosition()
    window.addEventListener('scroll', handleReposition, true)
    window.addEventListener('resize', handleReposition)

    return () => {
      window.removeEventListener('scroll', handleReposition, true)
      window.removeEventListener('resize', handleReposition)
    }
  }, [visible, updatePosition])

  const show = () => {
    if (!disabled) setVisible(true)
  }

  const hide = () => setVisible(false)

  if (!isValidElement(children)) {
    return children
  }

  const child = cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node
      assignRef(children.props.ref as Ref<HTMLElement> | undefined, node)
    },
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      show()
      ;(children.props.onMouseEnter as ((event: MouseEvent<HTMLElement>) => void) | undefined)?.(event)
    },
    onMouseLeave: (event: MouseEvent<HTMLElement>) => {
      hide()
      ;(children.props.onMouseLeave as ((event: MouseEvent<HTMLElement>) => void) | undefined)?.(event)
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      show()
      ;(children.props.onFocus as ((event: FocusEvent<HTMLElement>) => void) | undefined)?.(event)
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      hide()
      ;(children.props.onBlur as ((event: FocusEvent<HTMLElement>) => void) | undefined)?.(event)
    },
  })

  const placementClass = getTooltipPlacementClass(placement, styles)
  const lineClass = multiLine ? styles.multiLine : styles.singleLine

  const arrowStyle: CSSProperties | undefined =
    showArrow && position?.arrowLeft != null
      ? { left: `${position.arrowLeft}px`, transform: 'translateX(-50%) rotate(45deg)' }
      : showArrow && position?.arrowTop != null
        ? { top: `${position.arrowTop}px`, transform: 'translateY(-50%) rotate(45deg)' }
        : undefined

  const tooltip =
    visible && !disabled
      ? createPortal(
          <div
            ref={tooltipRef}
            className={[styles.tooltip, placementClass, lineClass].filter(Boolean).join(' ')}
            role="tooltip"
            style={
              position
                ? { top: `${position.top}px`, left: `${position.left}px`, visibility: 'visible' }
                : { top: 0, left: 0, visibility: 'hidden' }
            }
          >
            {content}
            {showArrow ? <span aria-hidden="true" className={styles.arrow} style={arrowStyle} /> : null}
          </div>,
          document.body,
        )
      : null

  return (
    <>
      {child}
      {tooltip}
    </>
  )
}

export type { TooltipPlacement } from './tooltipTypes'

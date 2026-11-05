import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Icon } from '@freshworks/dew-components'
import { SparkleIcon } from '../dew/shared/IllustrationIcons'
import type { AiMenuIcon, AiMenuItem } from '../../features/reply-editor/menus'
import styles from './ReplyEditorAiMenu.module.css'

interface ReplyEditorAiMenuProps {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  items: AiMenuItem[]
  onSelect: (prompt: string) => void
  onClose: () => void
}

function MenuItemIcon({ icon }: { icon: AiMenuIcon }) {
  if (icon === 'sparkle') return <SparkleIcon className={[styles.itemIcon, styles.itemIconAi].join(' ')} />
  return (
    <span className={styles.itemIcon} aria-hidden="true">
      <Icon name={icon as never} size="xs" color="var(--color-icon-default)" />
    </span>
  )
}

export function ReplyEditorAiMenu({ open, anchorRef, items, onSelect, onClose }: ReplyEditorAiMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const reduceMotion = useReducedMotion() ?? false

  useLayoutEffect(() => {
    if (!open || !anchorRef.current || !menuRef.current) {
      if (!open) setPosition(null)
      return
    }

    const updatePosition = () => {
      const anchor = anchorRef.current
      const menu = menuRef.current
      if (!anchor || !menu) return

      const anchorRect = anchor.getBoundingClientRect()
      const menuRect = menu.getBoundingClientRect()
      const gap = 8

      setPosition({
        left: anchorRect.left,
        top: anchorRect.top - menuRect.height - gap,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [anchorRef, open, items])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (menuRef.current?.contains(target) || anchorRef.current?.contains(target)) return
      onClose()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [anchorRef, onClose, open])

  const menu = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          className={styles.menu}
          role="menu"
          onMouseDown={(event) => event.preventDefault()}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.18, ease: [0.25, 1, 0.5, 1] }
          }
          style={
            position
              ? { position: 'fixed', top: position.top, left: position.left, visibility: 'visible' }
              : { position: 'fixed', top: -9999, left: -9999, visibility: 'hidden' }
          }
        >
          {items.map((item, index) => {
            if (item.type === 'divider') {
              return <div key={`divider-${index}`} className={styles.divider} role="separator" />
            }

            if (item.type === 'header') {
              return (
                <div key={`header-${item.label}`} className={styles.header}>
                  {item.label}
                </div>
              )
            }

            const isAi = item.variant === 'ai'
            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={[styles.item, isAi ? styles.itemAi : '', 'ai-pressable']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => {
                  onSelect(item.prompt)
                  onClose()
                }}
              >
                {item.icon ? (
                  <MenuItemIcon icon={item.icon} />
                ) : (
                  <span className={styles.itemIconSpacer} aria-hidden="true" />
                )}
                <span className={isAi ? styles.itemLabelAi : styles.itemLabel}>{item.label}</span>
              </button>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(menu, document.body)
}

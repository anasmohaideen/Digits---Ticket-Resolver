import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react'
import styles from './AiShimmer.module.css'

/** Figma AI Shimmer · State variant (01 compact, 02 media-left, 03 paragraph). */
export type AiShimmerPattern = '01' | '02' | '03'

export interface AiShimmerProps {
  /** Figma State property — three preset skeleton layouts. */
  pattern?: AiShimmerPattern
  /** Container width in px or any CSS length. Defaults to 104px (Figma artboard). */
  width?: number | string
  /** Square block size for pattern 01 avatar and pattern 02 media tile. */
  blockSize?: number
  /** Line count for pattern 03 (right-aligned paragraph lines). */
  lines?: number
  /** Stretch lines to the full container width (pattern 03). */
  fullWidth?: boolean
  className?: string
  'aria-label'?: string
}

function toCssLength(value: number | string | undefined) {
  if (value === undefined) return undefined
  return typeof value === 'number' ? `${value}px` : value
}

/** Alternating paragraph line widths for full-width pattern 03. */
const FULL_WIDTH_LINE_WIDTHS = ['100%', '88%', '72%', '94%', '66%', '82%', '78%', '100%'] as const

function getFullWidthLineWidth(index: number) {
  return FULL_WIDTH_LINE_WIDTHS[index % FULL_WIDTH_LINE_WIDTHS.length]
}

function createPatternVariants(stagger: number): Variants {
  return {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: stagger,
        delayChildren: stagger > 0 ? stagger * 0.6 : 0,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        when: 'afterChildren',
        staggerChildren: stagger > 0 ? stagger * 0.7 : 0,
        staggerDirection: -1,
      },
    },
  }
}

function createLineVariants(shouldReduceMotion: boolean, originEnd = false): Variants {
  if (shouldReduceMotion) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
    }
  }

  return {
    initial: {
      opacity: 0,
      scaleX: 0.94,
      transformOrigin: originEnd ? 'right center' : 'left center',
    },
    animate: {
      opacity: 1,
      scaleX: 1,
      transition: { duration: 0.22, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      scaleX: 0.94,
      transition: { duration: 0.16, ease: 'easeIn' },
    },
  }
}

function createBlockVariants(shouldReduceMotion: boolean): Variants {
  if (shouldReduceMotion) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
    }
  }

  return {
    initial: { opacity: 0, scale: 0.88 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.24, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      scale: 0.88,
      transition: { duration: 0.16, ease: 'easeIn' },
    },
  }
}

function ShimmerBar({
  className,
  style,
  variants,
}: {
  className?: string
  style?: CSSProperties
  variants?: Variants
}) {
  return (
    <motion.span
      className={[styles.bar, className].filter(Boolean).join(' ')}
      style={style}
      variants={variants}
      aria-hidden="true"
    />
  )
}

function Pattern01({
  blockSize,
  lineVariants,
  blockVariants,
}: {
  blockSize?: number
  lineVariants: Variants
  blockVariants: Variants
}) {
  return (
    <>
      <ShimmerBar className={styles.line} variants={lineVariants} />
      <ShimmerBar
        className={styles.block}
        style={
          blockSize !== undefined
            ? ({
                '--ai-shimmer-block-size': `${blockSize}px`,
              } as CSSProperties)
            : undefined
        }
        variants={blockVariants}
      />
      <ShimmerBar className={styles.line} variants={lineVariants} />
      <ShimmerBar className={styles.line} variants={lineVariants} />
      <ShimmerBar className={[styles.line, styles.lineShort].join(' ')} variants={lineVariants} />
    </>
  )
}

function Pattern02({
  blockSize,
  lineVariants,
  blockVariants,
}: {
  blockSize?: number
  lineVariants: Variants
  blockVariants: Variants
}) {
  const mediaSize = blockSize ?? 40

  return (
    <div className={styles.row}>
      <div className={styles.linesColumn}>
        <ShimmerBar className={styles.line} variants={lineVariants} />
        <ShimmerBar className={styles.line} variants={lineVariants} />
        <ShimmerBar className={styles.line} variants={lineVariants} />
      </div>
      <ShimmerBar
        className={styles.blockMedia}
        style={{ '--ai-shimmer-media-size': `${mediaSize}px` } as CSSProperties}
        variants={blockVariants}
      />
    </div>
  )
}

function Pattern03({
  lines,
  lineVariants,
  fullWidth = false,
}: {
  lines: number
  lineVariants: Variants
  fullWidth?: boolean
}) {
  const safeLines = Math.max(1, lines)

  return (
    <div
      className={[
        styles.linesColumn,
        fullWidth ? styles.linesVariable : styles.linesEnd,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {Array.from({ length: safeLines }, (_, index) => {
        const isLast = !fullWidth && index === safeLines - 1 && safeLines > 1
        return (
          <ShimmerBar
            key={index}
            className={[
              styles.line,
              fullWidth ? styles.lineVariable : '',
              isLast ? styles.lineShort : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={
              fullWidth
                ? ({ '--ai-shimmer-line-width': getFullWidthLineWidth(index) } as CSSProperties)
                : undefined
            }
            variants={lineVariants}
          />
        )
      })}
    </div>
  )
}

export function AiShimmer({
  pattern = '01',
  width = 104,
  blockSize,
  lines = 3,
  fullWidth = false,
  className,
  'aria-label': ariaLabel = 'Loading content',
}: AiShimmerProps) {
  const shouldReduceMotion = useReducedMotion() ?? false
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | 'auto'>('auto')

  const stagger = shouldReduceMotion ? 0 : 0.045
  const patternVariants = createPatternVariants(stagger)
  const lineVariants = createLineVariants(shouldReduceMotion)
  const endLineVariants = createLineVariants(shouldReduceMotion, true)
  const blockVariants = createBlockVariants(shouldReduceMotion)

  const heightTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.38, ease: [0.4, 0, 0.2, 1] as const }

  useLayoutEffect(() => {
    const el = contentRef.current
    if (!el) return

    const observer = new ResizeObserver(() => {
      setHeight(el.offsetHeight)
    })

    observer.observe(el)
    setHeight(el.offsetHeight)

    return () => observer.disconnect()
  }, [pattern, blockSize, fullWidth, lines, width])

  const rootStyle = {
    '--ai-shimmer-width': toCssLength(fullWidth ? '100%' : width),
  } as CSSProperties

  return (
    <div
      className={[styles.root, fullWidth && styles.rootFullWidth, className].filter(Boolean).join(' ')}
      style={rootStyle}
      role="status"
      aria-busy="true"
      aria-label={ariaLabel}
    >
      <motion.div
        className={styles.patternViewport}
        animate={{ height }}
        transition={heightTransition}
      >
        <div ref={contentRef} className={styles.patternMeasure}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={pattern}
              className={[styles.patternStage, fullWidth && styles.patternStageFullWidth]
                .filter(Boolean)
                .join(' ')}
              variants={patternVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {pattern === '01' && (
                <Pattern01
                  blockSize={blockSize}
                  lineVariants={lineVariants}
                  blockVariants={blockVariants}
                />
              )}
              {pattern === '02' && (
                <Pattern02
                  blockSize={blockSize}
                  lineVariants={lineVariants}
                  blockVariants={blockVariants}
                />
              )}
              {pattern === '03' && (
                <Pattern03
                  lines={lines}
                  lineVariants={fullWidth ? lineVariants : endLineVariants}
                  fullWidth={fullWidth}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

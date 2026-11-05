/**
 * Dew product icon library — UI chrome (not Illustration Library).
 * Paths from @freshworks/dew-components / Figma Icons/*
 *
 * Size tokens (Dew Icon): 2xs 12 · xs 14 · sm 16 · md 20 · lg 24 · xl 32
 */
import type { ReactNode } from 'react'

export const CORE_ICON_SIZE = {
  '2xs': 12,
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const

type IconProps = { className?: string }

function CoreIcon({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

/** Dew Icons/Search — Search field prefix */
export function CoreSearchIcon({ className }: IconProps) {
  return (
    <CoreIcon className={className}>
      <path d="M14.45 11.79L11.79 9.12C12.14 8.36 12.33 7.53 12.33 6.68C12.33 3.55 9.79 1 6.67 1C3.55 1 1 3.55 1 6.68C1 9.81 3.54 12.36 6.67 12.36C7.52 12.36 8.36 12.16 9.13 11.78L11.79 14.45C12.15 14.8 12.61 15 13.11 15C13.61 15 14.08 14.81 14.43 14.46L14.45 14.44C15.18 13.7 15.18 12.52 14.45 11.79ZM8.93 10.53C8.25 10.94 7.47 11.16 6.67 11.16C4.2 11.16 2.2 9.15 2.2 6.68C2.2 4.21 4.2 2.2 6.67 2.2C9.14 2.2 11.13 4.21 11.13 6.68C11.13 7.47 10.92 8.25 10.54 8.92C10.14 9.59 9.59 10.15 8.93 10.53ZM13.6 13.59H13.59C13.46 13.73 13.29 13.8 13.11 13.8C12.94 13.8 12.77 13.73 12.64 13.6L10.18 11.13C10.18 11.13 10.21 11.1 10.23 11.09C10.35 10.99 10.46 10.89 10.57 10.79C10.61 10.76 10.64 10.72 10.68 10.68C10.72 10.64 10.76 10.6 10.8 10.55C10.9 10.45 10.99 10.36 11.07 10.25C11.09 10.22 11.11 10.2 11.14 10.17L13.6 12.64C13.87 12.9 13.87 13.32 13.6 13.59Z" />
    </CoreIcon>
  )
}

/** Dew Icons/ChevronLeft — PageNavigation, pagination */
export function CoreChevronLeftIcon({ className }: IconProps) {
  return (
    <CoreIcon className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.69995 7.99501C5.70146 7.80924 5.77282 7.63084 5.89985 7.49528L9.1981 4.20701C9.37664 4.02848 9.63687 3.95875 9.88075 4.0241C10.1246 4.08945 10.3151 4.27995 10.3805 4.52383C10.4458 4.76772 10.3761 5.02795 10.1976 5.20649L7.38906 7.99501L10.1976 10.7935C10.4736 11.0695 10.4736 11.517 10.1976 11.793C9.92158 12.069 9.4741 12.069 9.1981 11.793L5.89985 8.49475C5.77282 8.35919 5.70146 8.18078 5.69995 7.99501Z"
      />
    </CoreIcon>
  )
}

/** Dew Icons/ChevronRight — Breadcrumb separator */
export function CoreChevronRightIcon({ className }: IconProps) {
  return (
    <CoreIcon className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.4 8.00499C10.3985 8.19076 10.3272 8.36916 10.2003 8.50473L6.90531 11.793C6.72695 11.9715 6.46698 12.0413 6.22333 11.9759C5.97968 11.9106 5.78937 11.7201 5.72409 11.4762C5.6588 11.2323 5.72846 10.9721 5.90682 10.7935L8.71257 8.00499L5.90682 5.20647C5.6311 4.93047 5.6311 4.48299 5.90682 4.207C6.18255 3.931 6.62958 3.931 6.90531 4.207L10.2003 7.50525C10.3272 7.64082 10.3985 7.81922 10.4 8.00499Z"
      />
    </CoreIcon>
  )
}

/** Dew Icons/ChevronDown — Accordion, Select, Button dropdown */
export function CoreChevronDownIcon({ className }: IconProps) {
  return (
    <CoreIcon className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.99501 10.4046C7.80924 10.4031 7.63084 10.3318 7.49528 10.2048L4.20701 6.9065C4.02848 6.72796 3.95875 6.46773 4.0241 6.22385C4.08945 5.97996 4.27995 5.78946 4.52383 5.72411C4.76772 5.65876 5.02795 5.72849 5.20649 5.90703L7.99501 8.71554L10.7935 5.90703C11.0695 5.63103 11.517 5.63103 11.793 5.90703C12.069 6.18302 12.069 6.6305 11.793 6.9065L8.49475 10.2048C8.35919 10.3318 8.18078 10.4031 7.99501 10.4046Z"
      />
    </CoreIcon>
  )
}

/** Dew Icons/ChevronUp — Accordion expanded state */
export function CoreChevronUpIcon({ className }: IconProps) {
  return (
    <CoreIcon className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.00499 5.70001C8.19076 5.70151 8.36916 5.77281 8.50472 5.89971L11.793 9.19472C11.9715 9.37308 12.0413 9.63305 11.9759 9.87669C11.9106 10.1203 11.7201 10.3107 11.4762 10.3759C11.2323 10.4412 10.9721 10.3716 10.7935 10.1932L8.00499 7.38745L5.20647 10.1932C4.93047 10.4689 4.48299 10.4689 4.207 10.1932C3.931 9.91748 3.931 9.47044 4.207 9.19472L7.50525 5.89971C7.64082 5.77281 7.81922 5.70151 8.00499 5.70001Z"
      />
    </CoreIcon>
  )
}

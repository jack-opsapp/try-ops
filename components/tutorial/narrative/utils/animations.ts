import type { Variants, Transition } from 'framer-motion'

// ─── Timing Constants ──────────────────────────────────────────────
// Per spec §4: 0.2-0.4s for all transitions. Military precision.
// Things arrive with purpose and leave without lingering.

export const TIMING = {
  /** Snappy elements — status badge changes, dot fills */
  fast: 0.2,
  /** Card transitions, step crossfades */
  standard: 0.3,
  /** Sequential item reveals (line items, task cards) */
  stagger: 0.15,
  /** ms — pause after auto-advance animation finishes before next step */
  autoAdvanceDelay: 1500,
  /** ms — after auto-advance animation, stage becomes clickable as fallback */
  clickFallbackDelay: 1500,
  /** Step-to-step crossfade duration */
  stepTransition: 0.3,
  /** Ambient panel crossfade (slightly behind main content for depth) */
  ambientLag: 0.4,
  /** Perimeter shimmer — one full border circuit */
  shimmerDuration: 0.6,
  /** Staggered text reveal (Step 6 finale) — per line */
  textRevealInterval: 0.5,
} as const

// ─── Easing ────────────────────────────────────────────────────────
// Sharp ease-out for entries (things arrive with decisiveness)
// Clean ease-in for exits (things leave without lingering)
// From system.md: [0.22, 1, 0.36, 1] for scroll reveals

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]
export const EASE_IN: [number, number, number, number] = [0.4, 0, 1, 1]
export const EASE_IN_OUT: [number, number, number, number] = [0.4, 0, 0.2, 1]

// ─── Spring Configs ────────────────────────────────────────────────

export const SPRING_CARD: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
}

export const SPRING_SWIPE_SETTLE: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
}

export const SPRING_SNAP: Transition = {
  type: 'spring',
  stiffness: 600,
  damping: 35,
}

// ─── Reusable Variants ─────────────────────────────────────────────

/** Card enters from top (notification style) */
export const cardEnterFromTop: Variants = {
  hidden: { y: -40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: TIMING.standard, ease: EASE_OUT },
  },
  exit: {
    y: -20,
    opacity: 0,
    transition: { duration: TIMING.fast, ease: EASE_IN },
  },
}

/** Card scales up from center */
export const cardScaleUp: Variants = {
  hidden: { scale: 0.92, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: TIMING.standard, ease: EASE_OUT },
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    transition: { duration: TIMING.fast, ease: EASE_IN },
  },
}

/** Container that staggers its children */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: TIMING.stagger },
  },
}

/** Individual staggered item — slides up from 12px below */
export const staggerItem: Variants = {
  hidden: { y: 12, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: TIMING.standard, ease: EASE_OUT },
  },
}

/** Simple fade */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: TIMING.standard, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    transition: { duration: TIMING.fast, ease: EASE_IN },
  },
}

/** Dispatch animation — card sends away (like an envelope) */
export const dispatch: Variants = {
  visible: { y: 0, opacity: 1, scale: 1 },
  exit: {
    y: -60,
    opacity: 0,
    scale: 0.95,
    transition: { duration: TIMING.standard, ease: EASE_IN },
  },
}

/** Slide right into pipeline column */
export const slideRightDock: Variants = {
  center: { x: 0 },
  docked: {
    x: 80,
    transition: { duration: TIMING.standard, ease: EASE_OUT },
  },
}

// ─── Reduced Motion ───────────────────────────────────────────────

/** Returns true if user prefers reduced motion */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Returns a crossfade-only transition when reduced motion is active */
export function safeTransition(transition: Transition): Transition {
  if (prefersReducedMotion()) {
    return { duration: 0.3, ease: 'easeInOut' }
  }
  return transition
}

/** Returns static variants for reduced motion (no movement, just opacity) */
export const reducedMotionFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

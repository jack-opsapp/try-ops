import type { Variants, Transition } from 'framer-motion'

// ─── Brand Motion Tokens ───────────────────────────────────────────
// Source: .claude/animation-studio.local.md
// Character: Military tactical minimalist. Every motion is deliberate,
// precise, earned. The confidence of a tool that doesn't prove itself.

/** Sharp ease-out — things arrive at their destination and stop. No settling. */
export const EASE_ENTER: [number, number, number, number] = [0.16, 1, 0.3, 1]

/** Clean ease-in — fast departure, no lingering. */
export const EASE_EXIT: [number, number, number, number] = [0.4, 0, 1, 1]

/** Smooth ease-in-out for transitions between states */
export const EASE_TRANSITION: [number, number, number, number] = [0.4, 0, 0.2, 1]

// ─── Duration Scale ────────────────────────────────────────────────
export const DURATION = {
  fast: 0.2,       // Snappy feedback (badge changes, dot fills)
  normal: 0.3,     // Standard transitions (cards, fades)
  slow: 0.6,       // Deliberate reveals (important moments)
  stagger: 0.12,   // Between sequential items
  text: 0.5,       // Between staggered text lines (finale)
} as const

// ─── Decisive Transitions ──────────────────────────────────────────
// Brand rule: no spring physics. Things arrive and stop. No settling.

/** Snappy settle — card drops, element snaps to position */
export const SETTLE: Transition = {
  duration: DURATION.fast,
  ease: EASE_ENTER,
}

/** Card appearance — slightly more deliberate than settle */
export const CARD_ENTER: Transition = {
  duration: DURATION.normal,
  ease: EASE_ENTER,
}

// ─── Reusable Variants ─────────────────────────────────────────────

/** Card enters from top — notification style. Arrives with decisiveness. */
export const enterFromTop: Variants = {
  hidden: { y: -50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: DURATION.normal, ease: EASE_ENTER },
  },
  exit: {
    y: -30,
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASE_EXIT },
  },
}

/** Scale up from center — estimate/invoice card appearance */
export const scaleUp: Variants = {
  hidden: { scale: 0.92, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: DURATION.normal, ease: EASE_ENTER },
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASE_EXIT },
  },
}

/** Container that orchestrates staggered children */
export const staggerParent: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: DURATION.stagger,
      delayChildren: 0.1,
    },
  },
}

/** Individual item within a stagger group */
export const staggerChild: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: DURATION.normal, ease: EASE_ENTER },
  },
}

/** Simple opacity fade */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.normal, ease: EASE_ENTER },
  },
  exit: {
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASE_EXIT },
  },
}

/** Dispatch — card sends away like a dispatched envelope */
export const dispatch: Variants = {
  visible: { y: 0, opacity: 1, scale: 1 },
  exit: {
    y: -80,
    opacity: 0,
    scale: 0.92,
    transition: { duration: DURATION.normal, ease: EASE_EXIT },
  },
}

/** Narrative text — appears with slight upward movement */
export const narrativeText: Variants = {
  hidden: { y: 8, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: DURATION.slow, ease: EASE_ENTER },
  },
  exit: {
    opacity: 0,
    transition: { duration: DURATION.fast, ease: EASE_EXIT },
  },
}

// ─── Reduced Motion ───────────────────────────────────────────────
// Brand rule: provide a DIFFERENT animation that serves the same
// emotional beat — not a disabled state.

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Gentle fade alternative for reduced motion users */
export const reducedFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

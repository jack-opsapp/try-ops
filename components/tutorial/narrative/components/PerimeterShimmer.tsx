'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DURATION } from '../utils/animations'

interface PerimeterShimmerProps {
  /** Set to true to trigger one shimmer pass. Changes in value re-trigger. */
  trigger: boolean
  /** Border radius to match parent card (default: 8) */
  borderRadius?: number
  /** Shimmer point color (default: white at 40%) */
  color?: string
}

/**
 * A single bright point that traces the card's border perimeter in 0.6s.
 * Linear easing — constant speed. Plays once per trigger, never loops.
 *
 * Implementation: CSS conic-gradient rotated via Framer Motion.
 * The gradient has a narrow bright wedge (~15deg) against transparent,
 * masked to only show the border region (2px ring).
 *
 * This is THE signature visual feedback — replaces iOS haptics.
 * Earned at specific moments: card settle, estimate sent, project assembly,
 * PAID stamp, ALL CAUGHT UP.
 */
export function PerimeterShimmer({
  trigger,
  borderRadius = 8,
  color = 'rgba(255,255,255,0.4)',
}: PerimeterShimmerProps) {
  const [playCount, setPlayCount] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (trigger) {
      setPlayCount((c) => c + 1)
      setIsPlaying(true)
      const timer = setTimeout(
        () => setIsPlaying(false),
        DURATION.slow * 1000 + 100, // small buffer
      )
      return () => clearTimeout(timer)
    }
  }, [trigger])

  return (
    <AnimatePresence>
      {isPlaying && (
        <motion.div
          key={playCount}
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ borderRadius }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          <motion.div
            className="absolute"
            style={{
              inset: -2,
              borderRadius: borderRadius + 2,
              // Narrow bright wedge in a conic gradient
              background: `conic-gradient(from 0deg, transparent 0deg, ${color} 8deg, transparent 16deg)`,
              // Mask trick: show only the 2px border ring
              WebkitMaskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              padding: 2,
            }}
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: DURATION.slow,
              ease: 'linear',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

'use client'

import { motion } from 'framer-motion'
import { OPSStyle } from '@/lib/styles/OPSStyle'
import { TOTAL_STEPS } from '../NarrativeTutorialData'
import { DURATION, EASE_ENTER } from '../utils/animations'

interface TutorialProgressDotsProps {
  currentStep: number
}

/**
 * Minimal 6-dot progress indicator.
 * Current = accent, completed = white 50%, upcoming = white 15%.
 * 6px dots, 8px spacing. Animated fill on step transition.
 */
export function TutorialProgressDots({ currentStep }: TutorialProgressDotsProps) {
  return (
    <div className="flex items-center gap-2" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemax={TOTAL_STEPS}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const fill =
          i === currentStep
            ? OPSStyle.Colors.primaryAccent
            : i < currentStep
              ? 'rgba(255,255,255,0.5)'
              : 'rgba(255,255,255,0.15)'

        return (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 6, height: 6 }}
            animate={{ backgroundColor: fill }}
            transition={{ duration: DURATION.fast, ease: EASE_ENTER }}
          />
        )
      })}
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'

interface BreakpointButtonsProps {
  variant: 'gotit' | 'begin' | 'back-only'
  onContinue: () => void
  onBack: () => void
}

export function BreakpointButtons({ variant, onContinue, onBack }: BreakpointButtonsProps) {
  const continueLabel = variant === 'gotit' ? 'GOT IT' : 'BEGIN TUTORIAL'
  const backLabel = variant === 'gotit' ? 'BACK' : variant === 'begin' ? 'SKIP' : 'BACK'
  const showContinue = variant !== 'back-only'

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-4 pb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
    >
      {/* Continue button */}
      {showContinue && (
        <button
          onClick={onContinue}
          className="font-mohave font-medium text-[16px] uppercase tracking-wider text-white px-8 py-3 border-2 border-white rounded-[5px] transition-all hover:bg-white hover:text-black"
        >
          {continueLabel}
        </button>
      )}

      {/* Back/Skip button */}
      <button
        onClick={onBack}
        className="font-mohave font-medium text-[14px] uppercase tracking-wider text-white/50 px-6 py-2 border border-white/30 rounded-[5px] transition-all hover:text-white/70 hover:border-white/50"
      >
        {backLabel}
      </button>
    </motion.div>
  )
}

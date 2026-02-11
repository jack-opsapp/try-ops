'use client'

import { motion } from 'framer-motion'

interface BreakpointButtonsProps {
  message?: string
  largeMessage?: boolean
  continueLabel?: string
  onContinue?: () => void
  onBack?: () => void
  skipLabel?: string
  onSkip?: () => void
}

export function BreakpointButtons({ message, largeMessage, continueLabel, onContinue, onBack, skipLabel, onSkip }: BreakpointButtonsProps) {
  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-4 pb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      style={{ paddingBottom: 'max(3.5rem, env(safe-area-inset-bottom))' }}
    >
      {/* Message above buttons */}
      {message && (
        <p className={`font-mohave uppercase tracking-wider text-white text-center mb-4 ${
          largeMessage
            ? 'font-bold text-[28px] md:text-[36px] leading-[36px]'
            : 'font-medium text-[20px] leading-[24px]'
        }`}>
          {message}
        </p>
      )}

      {/* Button row — BACK and CONTINUE side by side */}
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="font-mohave font-medium text-[14px] uppercase tracking-wider text-white/50 px-6 py-3 border border-white/30 rounded-[5px] transition-all hover:text-white/70 hover:border-white/50"
          >
            BACK
          </button>
        )}

        {continueLabel && onContinue && (
          <button
            onClick={onContinue}
            className="font-mohave font-medium text-[16px] uppercase tracking-wider text-white px-8 py-3 border-2 border-white rounded-[5px] transition-all hover:bg-white hover:text-black"
          >
            {continueLabel}
          </button>
        )}
      </div>

      {/* Skip link — smaller, below buttons */}
      {skipLabel && onSkip && (
        <button
          onClick={onSkip}
          className="font-mohave font-medium text-[12px] uppercase tracking-wider text-white/30 px-4 py-2 transition-all hover:text-white/50 mt-2"
        >
          {skipLabel}
        </button>
      )}
    </motion.div>
  )
}

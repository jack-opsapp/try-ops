'use client'

import { motion } from 'framer-motion'
import { OPSStyle, fontStyle } from '@/lib/styles/OPSStyle'
import { fadeIn } from '../utils/animations'

interface TutorialCTAButtonProps {
  primaryLabel: string
  secondaryLabel: string
  onPrimary: () => void
  onSecondary: () => void
}

/**
 * Final CTA — full-width accent button + secondary skip text below.
 * The last thing the user sees. Must feel earned, not pushy.
 */
export function TutorialCTAButton({
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}: TutorialCTAButtonProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-3 w-full"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      {/* Primary CTA */}
      <motion.button
        onClick={onPrimary}
        className="w-full cursor-pointer"
        style={{
          ...fontStyle(OPSStyle.Typography.button),
          height: 56,
          backgroundColor: OPSStyle.Colors.primaryAccent,
          color: '#FFFFFF',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          border: `1px solid ${OPSStyle.Colors.primaryAccent}`,
          borderRadius: OPSStyle.Layout.buttonRadius,
        }}
        whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        {primaryLabel}
      </motion.button>

      {/* Secondary skip */}
      <button
        onClick={onSecondary}
        className="cursor-pointer bg-transparent border-none"
        style={{
          ...fontStyle(OPSStyle.Typography.caption),
          color: OPSStyle.Colors.tertiaryText,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {secondaryLabel}
      </button>
    </motion.div>
  )
}

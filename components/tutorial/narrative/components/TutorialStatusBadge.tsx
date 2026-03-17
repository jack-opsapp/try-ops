'use client'

import { motion } from 'framer-motion'
import { fontStyle, OPSStyle } from '@/lib/styles/OPSStyle'
import { DURATION, EASE_ENTER } from '../utils/animations'

interface TutorialStatusBadgeProps {
  text: string
  color: string
  /** Animate color transitions when status changes */
  animate?: boolean
}

/**
 * All-caps status badge with tinted background and subtle border.
 * Used for NEW LEAD, BOOKED, IN PROGRESS, COMPLETE, etc.
 */
export function TutorialStatusBadge({ text, color, animate = true }: TutorialStatusBadgeProps) {
  const Component = animate ? motion.span : 'span'

  const style = {
    ...fontStyle(OPSStyle.Typography.status),
    color,
    backgroundColor: `${color}26`,
    border: `1px solid ${color}4D`,
    padding: '2px 8px',
    borderRadius: OPSStyle.Layout.smallCornerRadius,
    display: 'inline-flex',
    textTransform: 'uppercase' as const,
  }

  if (animate) {
    return (
      <motion.span
        style={style}
        animate={{ color, backgroundColor: `${color}26`, borderColor: `${color}4D` }}
        transition={{ duration: DURATION.fast, ease: EASE_ENTER }}
      >
        {text}
      </motion.span>
    )
  }

  return <span style={style}>{text}</span>
}

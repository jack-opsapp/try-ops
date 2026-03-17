'use client'

import { type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { OPSStyle } from '@/lib/styles/OPSStyle'

interface TutorialCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  /** Override border color (default: OPSStyle.Colors.cardBorder) */
  borderColor?: string
  className?: string
}

/**
 * Stylized card used across all tutorial steps.
 * Dark surface, 1px border at 12% white, 8px radius.
 * Matches OPS Web card treatment: surface elevation via lightness shift.
 */
export function TutorialCard({
  children,
  borderColor,
  className,
  ...motionProps
}: TutorialCardProps) {
  return (
    <motion.div
      className={cn('w-full relative', className)}
      style={{
        padding: `${OPSStyle.Layout.spacing3}px`,
        backgroundColor: OPSStyle.Colors.cardBackground,
        border: `1px solid ${borderColor || OPSStyle.Colors.cardBorder}`,
        borderRadius: OPSStyle.Layout.cardCornerRadius,
      }}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
}

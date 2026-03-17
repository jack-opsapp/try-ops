'use client'

import { OPSStyle, fontStyle } from '@/lib/styles/OPSStyle'
import { STATUS_COLORS } from '../NarrativeTutorialData'

interface TutorialSwipeStampProps {
  type: 'complete' | 'skip'
}

const STAMP_CONFIG = {
  complete: {
    text: 'COMPLETE',
    color: OPSStyle.Colors.successStatus,
    rotation: -15,
    borderWidth: 3,
  },
  skip: {
    text: 'SKIP',
    color: STATUS_COLORS.inactive,
    rotation: 15,
    borderWidth: 3,
  },
} as const

/**
 * COMPLETE / SKIP stamp overlay for swipe cards.
 * Rendered at full opacity — parent motion.div controls actual visibility
 * via MotionValue-driven opacity tied to drag progress.
 */
export function TutorialSwipeStamp({ type }: TutorialSwipeStampProps) {
  const config = STAMP_CONFIG[type]

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <span
        className="uppercase"
        style={{
          ...fontStyle(OPSStyle.Typography.largeTitle),
          color: config.color,
          border: `${config.borderWidth}px solid ${config.color}`,
          padding: '8px 20px',
          borderRadius: OPSStyle.Layout.smallCornerRadius,
          transform: `rotate(${config.rotation}deg)`,
          letterSpacing: '0.1em',
        }}
      >
        {config.text}
      </span>
    </div>
  )
}

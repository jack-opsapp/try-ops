'use client'

import { useCallback, useRef } from 'react'
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { OPSStyle, fontStyle } from '@/lib/styles/OPSStyle'
import { TutorialSwipeStamp } from './TutorialSwipeStamp'
import { EASE_ENTER } from '../utils/animations'
import type { ReviewCard } from '../NarrativeTutorialData'

const SWIPE_THRESHOLD = 120
const FLY_OUT_X = 600

interface TutorialSwipeCardProps {
  card: ReviewCard
  onSwipe: (direction: 'left' | 'right') => void
  /** Only the top card in the stack is interactive */
  isTop: boolean
  /** Stack position offset for cards beneath (0 = top) */
  stackIndex: number
}

/**
 * Draggable review card with rotation, directional stamps, and commit threshold.
 *
 * The Tinder mechanic — this is the hook of the tutorial.
 * Must feel responsive, tactile, satisfying. The card follows the cursor
 * with zero lag, rotates naturally, and the stamps appear gradually as
 * drag progresses — building anticipation before the commit.
 *
 * Desktop: click-drag, cursor grab/grabbing.
 * Mobile: touch-drag via Framer Motion drag.
 * Keyboard: arrow keys for accessibility.
 */
export function TutorialSwipeCard({ card, onSwipe, isTop, stackIndex }: TutorialSwipeCardProps) {
  const x = useMotionValue(0)
  const hasExited = useRef(false)

  // Card rotation follows drag position — feels natural, like tilting a card
  const rotate = useTransform(x, (val) => val / 20)

  // Stamp opacity ramps from 0 to 1 as drag approaches threshold
  const completeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1])
  const skipOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0])

  // Stack visual: cards beneath are slightly scaled down and offset
  const stackScale = 1 - stackIndex * 0.05
  const stackY = stackIndex * 12

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (hasExited.current) return
      const offset = info.offset.x
      if (Math.abs(offset) > SWIPE_THRESHOLD) {
        hasExited.current = true
        onSwipe(offset > 0 ? 'right' : 'left')
      }
    },
    [onSwipe],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isTop || hasExited.current) return
      if (e.key === 'ArrowRight') {
        hasExited.current = true
        onSwipe('right')
      } else if (e.key === 'ArrowLeft') {
        hasExited.current = true
        onSwipe('left')
      }
    },
    [isTop, onSwipe],
  )

  const daysColor = card.daysAgo >= 7 ? OPSStyle.Colors.errorStatus : OPSStyle.Colors.warningStatus

  return (
    <motion.div
      className="absolute inset-0 select-none"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        scale: stackScale,
        y: stackY,
        backgroundColor: OPSStyle.Colors.cardBackground,
        border: `1px solid ${OPSStyle.Colors.cardBorder}`,
        borderRadius: OPSStyle.Layout.cardCornerRadius,
        touchAction: 'none',
        cursor: isTop ? 'grab' : 'default',
        zIndex: 10 - stackIndex,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      // Fly-out animation when swiped past threshold
      exit={{
        x: x.get() > 0 ? FLY_OUT_X : -FLY_OUT_X,
        opacity: 0,
        transition: { duration: 0.3, ease: EASE_ENTER },
      }}
      whileDrag={{ cursor: 'grabbing' }}
      tabIndex={isTop ? 0 : -1}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label={`${card.task} — ${card.project}. Drag right to complete, left to skip.`}
    >
      {/* Task type color stripe at top */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: 3,
          backgroundColor: card.color,
          borderRadius: `${OPSStyle.Layout.cardCornerRadius}px ${OPSStyle.Layout.cardCornerRadius}px 0 0`,
        }}
      />

      {/* Card content */}
      <div className="flex flex-col gap-1.5 p-5 pt-6">
        {/* Task name — the primary info */}
        <span style={{ ...fontStyle(OPSStyle.Typography.cardTitle), color: '#FFFFFF' }}>
          {card.task}
        </span>

        {/* Project name */}
        <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText }}>
          {card.project}
        </span>

        {/* Client name */}
        <span style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText }}>
          {card.client}
        </span>

        {/* Days ago badge — amber if recent, red if stale */}
        <span
          className="inline-flex self-start mt-1 uppercase"
          style={{
            ...fontStyle(OPSStyle.Typography.status),
            color: daysColor,
            backgroundColor: `${daysColor}26`,
            padding: '2px 8px',
            borderRadius: OPSStyle.Layout.smallCornerRadius,
          }}
        >
          {card.daysAgo} {card.daysAgo === 1 ? 'DAY' : 'DAYS'} AGO
        </span>
      </div>

      {/* Direction hints — subtle cues at the bottom */}
      <div className="absolute bottom-4 left-5 right-5 flex justify-between">
        <span style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: 'rgba(255,255,255,0.25)' }}>
          ← SKIP
        </span>
        <span style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: `${OPSStyle.Colors.successStatus}80` }}>
          COMPLETE →
        </span>
      </div>

      {/* Stamps — wrapped in motion.div for reactive opacity from drag MotionValue */}
      {isTop && (
        <>
          <motion.div style={{ opacity: completeOpacity }} className="absolute inset-0 pointer-events-none">
            <TutorialSwipeStamp type="complete" />
          </motion.div>
          <motion.div style={{ opacity: skipOpacity }} className="absolute inset-0 pointer-events-none">
            <TutorialSwipeStamp type="skip" />
          </motion.div>
        </>
      )}
    </motion.div>
  )
}

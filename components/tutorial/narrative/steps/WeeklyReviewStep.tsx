'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { OPSStyle, fontStyle } from '@/lib/styles/OPSStyle'
import { TutorialSwipeCard } from '../components/TutorialSwipeCard'
import { PerimeterShimmer } from '../components/PerimeterShimmer'
import { REVIEW_CARDS } from '../NarrativeTutorialData'
import { useNarrativeTutorialStore } from '../NarrativeTutorialState'
import { narrativeText, fade, DURATION, EASE_ENTER } from '../utils/animations'

interface WeeklyReviewStepProps {
  onAdvance: () => void
}

/**
 * Step 5: "End-of-Week Review"
 *
 * Emotional beat: COMMITMENT (gamified)
 * User feels: engaged, active — the first truly interactive moment
 * Animation must: make cleanup satisfying and fast
 *
 * THIS IS THE HOOK. The Tinder swipe mechanic is what users remember.
 * But they need CONTEXT first — they need to understand they're
 * reviewing completed tasks from the week.
 *
 * Narrative: "Friday. Review your week in 30 seconds."
 * Scene: 4 swipe cards. Drag right = complete. Drag left = skip.
 * Sell: "All caught up. That's your whole week."
 */
export function WeeklyReviewStep({ onAdvance }: WeeklyReviewStepProps) {
  const [phase, setPhase] = useState<'narrative' | 'swiping' | 'allDone' | 'sellLine'>('narrative')
  const [swipedCount, setSwipedCount] = useState(0)
  const [shimmerFired, setShimmerFired] = useState(false)
  const recordSwipe = useNarrativeTutorialStore((s) => s.recordSwipe)

  // When all cards swiped → all done
  useEffect(() => {
    if (swipedCount >= REVIEW_CARDS.length && phase === 'swiping') {
      requestAnimationFrame(() => setTimeout(() => {
        setPhase('allDone')
        setShimmerFired(true)
      }, 400))
    }
  }, [swipedCount, phase])

  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      recordSwipe(swipedCount, direction)
      setSwipedCount((c) => c + 1)
    },
    [swipedCount, recordSwipe],
  )

  const remainingCards = REVIEW_CARDS.slice(swipedCount)

  return (
    <div className="flex flex-col gap-6 min-h-[420px] justify-center">
      <AnimatePresence mode="wait">

        {/* ─── Narrative — CRITICAL for user understanding ─── */}
        {phase === 'narrative' && (
          <motion.div
            key="narrative"
            className="flex flex-col gap-3"
            variants={narrativeText}
            initial="hidden"
            animate="visible"
            exit="exit"
            onAnimationComplete={() => {
              requestAnimationFrame(() => setTimeout(() => setPhase('swiping'), 1500))
            }}
          >
            <span className="uppercase tracking-widest" style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText, letterSpacing: '0.2em' }}>
              STEP 5
            </span>
            <span className="uppercase tracking-wide" style={{ ...fontStyle(OPSStyle.Typography.title), color: '#FFFFFF' }}>
              Friday. Review your week.
            </span>
            <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText, lineHeight: 1.5 }}>
              Swipe through completed tasks. Drag right to confirm, left to skip. Clean up your entire week in 30 seconds.
            </span>
          </motion.div>
        )}

        {/* ─── Swipe cards ─── */}
        {phase === 'swiping' && (
          <motion.div
            key="cards"
            className="flex flex-col gap-4"
            variants={fade}
            initial="hidden"
            animate="visible"
          >
            {/* Context header */}
            <div className="flex items-center justify-between">
              <span className="uppercase tracking-widest" style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText, letterSpacing: '0.15em' }}>
                WEEKLY REVIEW
              </span>
              <span style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText }}>
                {swipedCount} / {REVIEW_CARDS.length}
              </span>
            </div>

            {/* Card stack */}
            <div className="relative w-full" style={{ height: 240 }}>
              {/* Render in reverse so top card renders last (highest z-index) */}
              {remainingCards.map((card, i) => {
                const reversedIndex = remainingCards.length - 1 - i
                return (
                  <TutorialSwipeCard
                    key={card.id}
                    card={card}
                    onSwipe={handleSwipe}
                    isTop={reversedIndex === 0}
                    stackIndex={reversedIndex}
                  />
                )
              }).reverse()}
            </div>

            {/* Instruction — visible until first swipe */}
            {swipedCount === 0 && (
              <motion.div
                className="flex items-center justify-center gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: DURATION.slow }}
              >
                <span style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: 'rgba(255,255,255,0.3)' }}>
                  ← SKIP
                </span>
                <span className="uppercase tracking-widest" style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText }}>
                  DRAG TO REVIEW
                </span>
                <span style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: `${OPSStyle.Colors.successStatus}80` }}>
                  COMPLETE →
                </span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ─── All caught up ─── */}
        {phase === 'allDone' && (
          <motion.div
            key="done"
            className="flex flex-col items-start gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DURATION.normal }}
            onAnimationComplete={() => {
              requestAnimationFrame(() => setTimeout(() => setPhase('sellLine'), 2000))
            }}
          >
            <div className="relative inline-block p-6 rounded-lg" style={{ border: `1px solid ${OPSStyle.Colors.cardBorder}` }}>
              <PerimeterShimmer trigger={shimmerFired} borderRadius={OPSStyle.Layout.cardCornerRadius} />
              <span className="uppercase tracking-wide" style={{ ...fontStyle(OPSStyle.Typography.title), color: '#FFFFFF' }}>
                ALL CAUGHT UP
              </span>
            </div>
            <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText }}>
              Four tasks reviewed. Your week is clean.
            </span>
          </motion.div>
        )}

        {/* ─── Sell line ─── */}
        {phase === 'sellLine' && (
          <motion.div
            key="sellLine"
            className="flex flex-col gap-2"
            variants={narrativeText}
            initial="hidden"
            animate="visible"
            onAnimationComplete={() => {
              requestAnimationFrame(() => setTimeout(() => onAdvance(), 1500))
            }}
          >
            <span className="uppercase tracking-wide" style={{ ...fontStyle(OPSStyle.Typography.subtitle), color: OPSStyle.Colors.primaryAccent, letterSpacing: '0.08em' }}>
              Every Friday. 30 seconds.
            </span>
            <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText }}>
              No spreadsheets. No whiteboard. Just swipe.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

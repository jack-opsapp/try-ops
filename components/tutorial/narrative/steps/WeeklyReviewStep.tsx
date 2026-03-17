'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { OPSStyle, fontStyle } from '@/lib/styles/OPSStyle'
import { TutorialSwipeCard } from '../components/TutorialSwipeCard'
import { PerimeterShimmer } from '../components/PerimeterShimmer'
import { REVIEW_CARDS } from '../NarrativeTutorialData'
import { useNarrativeTutorialStore } from '../NarrativeTutorialState'
import {
  fadeIn,
  TIMING,
  EASE_OUT,
  prefersReducedMotion,
} from '../utils/animations'

interface WeeklyReviewStepProps {
  onAdvance: () => void
}

type StepPhase = 'intro' | 'swiping' | 'allDone'

/**
 * Step 5: "End-of-Week Review"
 *
 * "FRIDAY. LET'S CLEAN UP." — then 4 Tinder-style swipe cards.
 * Swipe right to complete, left to skip. The mechanic is satisfying,
 * fast, and shows how OPS makes end-of-week cleanup effortless.
 *
 * This is the hook. "I want to do this every Friday."
 *
 * Card 2 (Final Inspection / Kitchen Renovation / Sarah Chen) connects
 * back to the main narrative — regardless of swipe direction, the
 * invoice in Step 6 will be for Kitchen Renovation.
 */
export function WeeklyReviewStep({ onAdvance }: WeeklyReviewStepProps) {
  const [phase, setPhase] = useState<StepPhase>('intro')
  const [swipedCount, setSwipedCount] = useState(0)
  const [shimmerTrigger, setShimmerTrigger] = useState(false)
  const recordSwipe = useNarrativeTutorialStore((s) => s.recordSwipe)
  const reduced = typeof window !== 'undefined' && prefersReducedMotion()

  // Intro text: "FRIDAY. LET'S CLEAN UP." — hold 1.5s, then show cards
  useEffect(() => {
    if (reduced) {
      setPhase('swiping')
      return
    }
    const timer = setTimeout(() => setPhase('swiping'), 2000)
    return () => clearTimeout(timer)
  }, [reduced])

  // When all cards swiped → "ALL CAUGHT UP"
  useEffect(() => {
    if (swipedCount >= REVIEW_CARDS.length && phase === 'swiping') {
      setTimeout(() => {
        setPhase('allDone')
        setShimmerTrigger(true)
      }, reduced ? 100 : 400)
    }
  }, [swipedCount, phase, reduced])

  // Auto-advance after "ALL CAUGHT UP"
  useEffect(() => {
    if (phase !== 'allDone') return
    const timer = setTimeout(onAdvance, reduced ? 500 : 2000)
    return () => clearTimeout(timer)
  }, [phase, onAdvance, reduced])

  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      recordSwipe(swipedCount, direction)
      setSwipedCount((c) => c + 1)
    },
    [swipedCount, recordSwipe],
  )

  // Cards remaining in the stack (newest swipes removed from front)
  const remainingCards = REVIEW_CARDS.slice(swipedCount)

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <AnimatePresence mode="wait">
        {/* Intro text */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="text-center"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <span
              className="uppercase tracking-widest"
              style={{
                ...fontStyle(OPSStyle.Typography.title),
                color: OPSStyle.Colors.secondaryText,
                letterSpacing: '0.15em',
              }}
            >
              FRIDAY. LET&apos;S CLEAN UP.
            </span>
          </motion.div>
        )}

        {/* Swipe cards */}
        {phase === 'swiping' && (
          <motion.div
            key="cards"
            className="w-full max-w-sm relative"
            style={{ height: 280 }}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            {/* Render remaining cards in reverse so top card renders last (highest z) */}
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

            {/* Count indicator */}
            <div className="absolute -bottom-8 left-0 right-0 text-center">
              <span
                style={{
                  ...fontStyle(OPSStyle.Typography.smallCaption),
                  color: OPSStyle.Colors.tertiaryText,
                }}
              >
                {swipedCount} / {REVIEW_CARDS.length}
              </span>
            </div>
          </motion.div>
        )}

        {/* ALL CAUGHT UP */}
        {phase === 'allDone' && (
          <motion.div
            key="done"
            className="text-center relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: TIMING.standard, ease: EASE_OUT }}
          >
            <div className="relative inline-block p-8">
              <PerimeterShimmer trigger={shimmerTrigger} borderRadius={12} />
              <span
                className="uppercase tracking-wide"
                style={{
                  ...fontStyle(OPSStyle.Typography.title),
                  color: '#FFFFFF',
                }}
              >
                ALL CAUGHT UP
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { OPSStyle, fontStyle } from '@/lib/styles/OPSStyle'
import { TutorialCard } from '../components/TutorialCard'
import { TutorialLineItem } from '../components/TutorialLineItem'
import {
  CLIENT_NAME,
  PROJECT_TITLE,
  LINE_ITEMS,
  ESTIMATE_TOTAL,
  formatCurrency,
} from '../NarrativeTutorialData'
import {
  cardScaleUp,
  staggerContainer,
  staggerItem,
  fadeIn,
  dispatch,
  TIMING,
  EASE_OUT,
  EASE_IN,
  prefersReducedMotion,
} from '../utils/animations'

interface SendEstimateStepProps {
  onAdvance: () => void
}

type StepState = 'building' | 'ready' | 'sending'

/**
 * Step 2: "Send the Estimate"
 *
 * Estimate card scales up from center. Line items stagger in one by one.
 * Divider draws itself. Total counter rolls up to $12,000.
 * "SEND ESTIMATE" button fades in. Click it — card dispatches.
 *
 * What this sells: Professional estimates in seconds. Not handwritten quotes on napkins.
 */
export function SendEstimateStep({ onAdvance }: SendEstimateStepProps) {
  const [state, setState] = useState<StepState>('building')
  const [showDivider, setShowDivider] = useState(false)
  const [showTotal, setShowTotal] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const reduced = typeof window !== 'undefined' && prefersReducedMotion()

  // Animated counter for the total
  const totalValue = useMotionValue(0)
  const totalDisplay = useTransform(totalValue, (v) => formatCurrency(Math.round(v)))
  const totalRef = useRef<HTMLSpanElement>(null)

  // Orchestrate the build-up sequence
  useEffect(() => {
    if (reduced) {
      setShowDivider(true)
      setShowTotal(true)
      totalValue.set(ESTIMATE_TOTAL)
      setShowButton(true)
      setState('ready')
      return
    }

    // Line items stagger in (handled by Framer Motion staggerContainer)
    // After all 4 items: divider + total + button
    const lineItemsDuration = LINE_ITEMS.length * TIMING.stagger * 1000 + TIMING.standard * 1000

    const dividerTimer = setTimeout(() => setShowDivider(true), lineItemsDuration)

    const totalTimer = setTimeout(() => {
      setShowTotal(true)
      // Roll up the counter from 0 to 12,000
      animate(totalValue, ESTIMATE_TOTAL, {
        duration: 0.8,
        ease: EASE_OUT,
      })
    }, lineItemsDuration + 300)

    const buttonTimer = setTimeout(() => {
      setShowButton(true)
      setState('ready')
    }, lineItemsDuration + 1200)

    return () => {
      clearTimeout(dividerTimer)
      clearTimeout(totalTimer)
      clearTimeout(buttonTimer)
    }
  }, [reduced, totalValue])

  const handleSend = () => {
    if (state !== 'ready') return
    setState('sending')
    setTimeout(() => onAdvance(), reduced ? 200 : 600)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <AnimatePresence mode="wait">
        {state !== 'sending' ? (
          <motion.div
            key="estimate"
            className="w-full max-w-sm"
            variants={cardScaleUp}
            initial="hidden"
            animate="visible"
          >
            <TutorialCard>
              <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="flex flex-col gap-0.5">
                  <span
                    className="uppercase tracking-wide"
                    style={{
                      ...fontStyle(OPSStyle.Typography.cardTitle),
                      color: '#FFFFFF',
                    }}
                  >
                    {PROJECT_TITLE}
                  </span>
                  <span
                    style={{
                      ...fontStyle(OPSStyle.Typography.caption),
                      color: OPSStyle.Colors.secondaryText,
                    }}
                  >
                    {CLIENT_NAME}
                  </span>
                </div>

                {/* Line items — stagger in one by one */}
                <motion.div
                  className="flex flex-col gap-2.5"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  role="list"
                >
                  {LINE_ITEMS.map((item) => (
                    <motion.div key={item.id} variants={staggerItem}>
                      <TutorialLineItem item={item} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Divider — draws itself from left to right */}
                <div className="relative h-px overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0"
                    style={{ backgroundColor: OPSStyle.Colors.cardBorder }}
                    initial={{ width: '0%' }}
                    animate={{ width: showDivider ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: EASE_OUT }}
                  />
                </div>

                {/* Total — rolls up from 0 */}
                <AnimatePresence>
                  {showTotal && (
                    <motion.div
                      className="flex items-baseline justify-between"
                      variants={fadeIn}
                      initial="hidden"
                      animate="visible"
                    >
                      <span
                        className="uppercase tracking-wider"
                        style={{
                          ...fontStyle(OPSStyle.Typography.caption),
                          color: OPSStyle.Colors.secondaryText,
                        }}
                      >
                        TOTAL
                      </span>
                      <motion.span
                        ref={totalRef}
                        style={{
                          ...fontStyle(OPSStyle.Typography.largeTitle),
                          color: '#FFFFFF',
                        }}
                      >
                        {totalDisplay}
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Send button */}
                <AnimatePresence>
                  {showButton && (
                    <motion.button
                      className="w-full cursor-pointer mt-1"
                      onClick={handleSend}
                      variants={fadeIn}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        ...fontStyle(OPSStyle.Typography.button),
                        height: 48,
                        backgroundColor: OPSStyle.Colors.primaryAccent,
                        color: '#FFFFFF',
                        border: `1px solid ${OPSStyle.Colors.primaryAccent}`,
                        borderRadius: OPSStyle.Layout.buttonRadius,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      SEND ESTIMATE
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </TutorialCard>
          </motion.div>
        ) : (
          // Dispatch animation — card sends away like an envelope
          <motion.div
            key="dispatching"
            className="w-full max-w-sm"
            variants={dispatch}
            initial="visible"
            animate="exit"
          >
            <TutorialCard>
              <div className="flex flex-col gap-2 opacity-60">
                <span style={{ ...fontStyle(OPSStyle.Typography.cardTitle), color: '#FFFFFF' }}>
                  {PROJECT_TITLE}
                </span>
                <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText }}>
                  {CLIENT_NAME} — {formatCurrency(ESTIMATE_TOTAL)}
                </span>
              </div>
            </TutorialCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

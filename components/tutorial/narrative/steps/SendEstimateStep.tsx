'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion'
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
  narrativeText,
  scaleUp,
  staggerParent,
  staggerChild,
  fade,
  dispatch,
  DURATION,
  EASE_ENTER,
  EASE_EXIT,
} from '../utils/animations'

interface SendEstimateStepProps {
  onAdvance: () => void
}

/**
 * Step 2: "Send the Estimate"
 *
 * Emotional beat: DISCOVERY
 * User feels: curious, testing the waters
 * Animation must: reward exploration instantly — show that estimates build themselves
 *
 * Narrative: "Build a professional estimate in seconds."
 * Scene: Estimate card scales up. Line items stagger in. Total rolls up.
 * Action: Click "SEND ESTIMATE" — card dispatches.
 * Sell: "Sent. Professional. In seconds."
 */
export function SendEstimateStep({ onAdvance }: SendEstimateStepProps) {
  const [phase, setPhase] = useState<'narrative' | 'building' | 'ready' | 'sending' | 'sellLine'>('narrative')
  const [buildStage, setBuildStage] = useState(0) // 0=header, 1=items, 2=divider, 3=total, 4=button

  // Animated counter for the total — springs from 0 to 12,000
  const totalMotion = useMotionValue(0)
  const totalRef = useRef<HTMLSpanElement>(null)

  // Update the DOM directly from motion value (avoids React re-renders)
  useEffect(() => {
    const unsubscribe = totalMotion.on('change', (v) => {
      if (totalRef.current) {
        totalRef.current.textContent = formatCurrency(Math.round(v))
      }
    })
    return unsubscribe
  }, [totalMotion])

  // Build-up orchestration — each stage triggers the next via onAnimationComplete
  const advanceBuild = useCallback(() => {
    setBuildStage((s) => {
      const next = s + 1
      if (next === 3) {
        // Stage 3: animate the total counter
        animate(totalMotion, ESTIMATE_TOTAL, {
          duration: 0.8,
          ease: EASE_ENTER,
        })
      }
      if (next >= 5) {
        setPhase('ready')
      }
      return next
    })
  }, [totalMotion])

  const handleSend = useCallback(() => {
    if (phase !== 'ready') return
    setPhase('sending')
  }, [phase])

  return (
    <div className="flex flex-col gap-6 min-h-[420px] justify-center">
      <AnimatePresence mode="wait">

        {/* ─── Narrative ─── */}
        {phase === 'narrative' && (
          <motion.div
            key="narrative"
            className="flex flex-col gap-2"
            variants={narrativeText}
            initial="hidden"
            animate="visible"
            exit="exit"
            onAnimationComplete={() => {
              requestAnimationFrame(() => {
                setTimeout(() => {
                  setPhase('building')
                  setBuildStage(1)
                }, 1200)
              })
            }}
          >
            <span
              className="uppercase tracking-widest"
              style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText, letterSpacing: '0.2em' }}
            >
              STEP 2
            </span>
            <span
              className="uppercase tracking-wide"
              style={{ ...fontStyle(OPSStyle.Typography.title), color: '#FFFFFF' }}
            >
              Build a professional estimate.
            </span>
            <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText, lineHeight: 1.5 }}>
              Line items, labor rates, materials — assembled automatically from your price book.
            </span>
          </motion.div>
        )}

        {/* ─── Estimate card building ─── */}
        {(phase === 'building' || phase === 'ready') && (
          <motion.div
            key="estimate"
            className="flex flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit="exit"
          >
            {/* Context label */}
            <span
              className="uppercase tracking-widest"
              style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText, letterSpacing: '0.15em' }}
            >
              ESTIMATE
            </span>

            <motion.div variants={scaleUp} initial="hidden" animate="visible">
              <TutorialCard>
                <div className="flex flex-col gap-3">
                  {/* Header */}
                  <div className="flex flex-col gap-0.5">
                    <span className="uppercase tracking-wide" style={{ ...fontStyle(OPSStyle.Typography.cardTitle), color: '#FFFFFF' }}>
                      {PROJECT_TITLE}
                    </span>
                    <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText }}>
                      {CLIENT_NAME}
                    </span>
                  </div>

                  {/* Line items — stagger in */}
                  <motion.div
                    className="flex flex-col gap-2.5"
                    variants={staggerParent}
                    initial="hidden"
                    animate={buildStage >= 1 ? 'visible' : 'hidden'}
                    onAnimationComplete={() => {
                      if (buildStage === 1) advanceBuild() // → stage 2 (divider)
                    }}
                    role="list"
                  >
                    {LINE_ITEMS.map((item) => (
                      <motion.div key={item.id} variants={staggerChild}>
                        <TutorialLineItem item={item} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Divider — draws left to right */}
                  {buildStage >= 2 && (
                    <motion.div
                      className="h-px"
                      style={{ backgroundColor: OPSStyle.Colors.cardBorder }}
                      initial={{ scaleX: 0, transformOrigin: 'left' }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.4, ease: EASE_ENTER }}
                      onAnimationComplete={advanceBuild} // → stage 3 (total)
                    />
                  )}

                  {/* Total */}
                  {buildStage >= 3 && (
                    <motion.div
                      className="flex items-baseline justify-between"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: DURATION.normal, ease: EASE_ENTER }}
                      onAnimationComplete={advanceBuild} // → stage 4 (button)
                    >
                      <span className="uppercase tracking-wider" style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText }}>
                        TOTAL
                      </span>
                      <span ref={totalRef} style={{ ...fontStyle(OPSStyle.Typography.largeTitle), color: '#FFFFFF' }}>
                        $0
                      </span>
                    </motion.div>
                  )}

                  {/* Send button */}
                  {buildStage >= 4 && (
                    <motion.button
                      className="w-full cursor-pointer mt-1"
                      onClick={handleSend}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: DURATION.normal, ease: EASE_ENTER }}
                      onAnimationComplete={advanceBuild} // → stage 5 → ready
                      whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
                      whileTap={{ scale: 0.95 }}
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
                </div>
              </TutorialCard>
            </motion.div>
          </motion.div>
        )}

        {/* ─── Dispatching ─── */}
        {phase === 'sending' && (
          <motion.div
            key="sending"
            className="w-full"
            variants={dispatch}
            initial="visible"
            animate="exit"
            onAnimationComplete={() => setPhase('sellLine')}
          >
            <TutorialCard>
              <div className="opacity-60 flex flex-col gap-1">
                <span style={{ ...fontStyle(OPSStyle.Typography.cardTitle), color: '#FFFFFF' }}>{PROJECT_TITLE}</span>
                <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText }}>
                  {CLIENT_NAME} — {formatCurrency(ESTIMATE_TOTAL)}
                </span>
              </div>
            </TutorialCard>
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
            <span
              className="uppercase tracking-wide"
              style={{ ...fontStyle(OPSStyle.Typography.subtitle), color: OPSStyle.Colors.primaryAccent, letterSpacing: '0.08em' }}
            >
              Sent. Professional. Instant.
            </span>
            <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText }}>
              Not a napkin quote. A real estimate, from your price book, in seconds.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

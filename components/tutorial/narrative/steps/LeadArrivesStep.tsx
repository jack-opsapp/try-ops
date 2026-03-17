'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail } from 'lucide-react'
import { OPSStyle, fontStyle } from '@/lib/styles/OPSStyle'
import { TutorialCard } from '../components/TutorialCard'
import { TutorialStatusBadge } from '../components/TutorialStatusBadge'
import { PerimeterShimmer } from '../components/PerimeterShimmer'
import { CLIENT_NAME, PROJECT_TITLE, STATUS_COLORS } from '../NarrativeTutorialData'
import { enterFromTop, narrativeText, fade, DURATION, EASE_ENTER, EASE_EXIT } from '../utils/animations'

interface LeadArrivesStepProps {
  onAdvance: () => void
}

/**
 * Step 1: "The Lead Arrives"
 *
 * Emotional beat: ENTRY
 * User feels: skepticism, curiosity
 * Animation must: counter skepticism with precision
 *
 * Narrative: The user sees explanatory text first ("A new lead just came in")
 * THEN the card arrives with purpose. They click it. It docks into a
 * pipeline column. A sell line reinforces the value.
 *
 * The user should think: "Wait — it catches leads automatically?"
 */
export function LeadArrivesStep({ onAdvance }: LeadArrivesStepProps) {
  const [phase, setPhase] = useState<'narrative' | 'card' | 'docked' | 'sellLine'>('narrative')
  const [shimmerFired, setShimmerFired] = useState(false)

  const handleCardClick = useCallback(() => {
    if (phase !== 'card') return
    setPhase('docked')
  }, [phase])

  return (
    <div className="flex flex-col gap-6 min-h-[420px] justify-center">

      {/* ─── Narrative text — appears first, sets context ─── */}
      <AnimatePresence mode="wait">
        {phase === 'narrative' && (
          <motion.div
            key="narrative"
            className="flex flex-col gap-2"
            variants={narrativeText}
            initial="hidden"
            animate="visible"
            exit="exit"
            onAnimationComplete={() => {
              // After narrative text is readable (~1.2s), bring in the card
              const id = requestAnimationFrame(() => {
                setTimeout(() => setPhase('card'), 1200)
              })
              return () => cancelAnimationFrame(id)
            }}
          >
            <span
              className="uppercase tracking-widest"
              style={{
                ...fontStyle(OPSStyle.Typography.smallCaption),
                color: OPSStyle.Colors.tertiaryText,
                letterSpacing: '0.2em',
              }}
            >
              STEP 1
            </span>
            <span
              className="uppercase tracking-wide"
              style={{
                ...fontStyle(OPSStyle.Typography.title),
                color: '#FFFFFF',
              }}
            >
              A new lead just came in.
            </span>
            <span
              style={{
                ...fontStyle(OPSStyle.Typography.caption),
                color: OPSStyle.Colors.secondaryText,
                lineHeight: 1.5,
              }}
            >
              OPS detects leads from your email automatically. No manual entry.
            </span>
          </motion.div>
        )}

        {/* ─── Lead notification card ─── */}
        {phase === 'card' && (
          <motion.div
            key="card"
            className="flex flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: DURATION.fast } }}
          >
            {/* Contextual label */}
            <span
              className="uppercase tracking-widest"
              style={{
                ...fontStyle(OPSStyle.Typography.smallCaption),
                color: OPSStyle.Colors.tertiaryText,
                letterSpacing: '0.15em',
              }}
            >
              INCOMING LEAD
            </span>

            {/* The card — arrives from top with precision */}
            <motion.div
              className="cursor-pointer"
              variants={enterFromTop}
              initial="hidden"
              animate="visible"
              onClick={handleCardClick}
              onAnimationComplete={() => {
                // Shimmer fires after card lands — earned, not gratuitous
                setShimmerFired(true)
              }}
              whileHover={{ scale: 1.01, transition: { duration: 0.12 } }}
              whileTap={{ scale: 0.99 }}
            >
              <TutorialCard borderColor={`${OPSStyle.Colors.primaryAccent}30`}>
                <PerimeterShimmer trigger={shimmerFired} borderRadius={OPSStyle.Layout.cardCornerRadius} />

                <div className="flex flex-col gap-2.5">
                  <TutorialStatusBadge text="NEW LEAD" color={STATUS_COLORS.warning} />

                  <span style={{ ...fontStyle(OPSStyle.Typography.cardTitle), color: '#FFFFFF' }}>
                    {CLIENT_NAME}
                  </span>

                  <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText }}>
                    {PROJECT_TITLE}
                  </span>

                  {/* Source badge — sells the auto-detection */}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Mail size={12} color={OPSStyle.Colors.primaryAccent} strokeWidth={1.5} />
                    <span
                      className="uppercase"
                      style={{
                        ...fontStyle(OPSStyle.Typography.status),
                        color: OPSStyle.Colors.primaryAccent,
                      }}
                    >
                      DETECTED FROM GMAIL
                    </span>
                  </div>
                </div>
              </TutorialCard>
            </motion.div>

            {/* Interaction hint — subtle, not pushy */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: DURATION.slow }}
              style={{
                ...fontStyle(OPSStyle.Typography.smallCaption),
                color: OPSStyle.Colors.tertiaryText,
                letterSpacing: '0.1em',
              }}
              className="uppercase"
            >
              TAP THE LEAD TO CAPTURE IT
            </motion.span>
          </motion.div>
        )}

        {/* ─── Docked state — card shrinks, pipeline column appears ─── */}
        {phase === 'docked' && (
          <motion.div
            key="docked"
            className="flex flex-col gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DURATION.fast }}
            onAnimationComplete={() => {
              // Show sell line briefly, then advance
              requestAnimationFrame(() => {
                setTimeout(() => setPhase('sellLine'), 600)
              })
            }}
          >
            {/* Mini pipeline visualization — card docked in first column */}
            <div className="flex gap-2 items-start">
              {/* Pipeline column with card */}
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-full h-[2px] rounded-full" style={{ backgroundColor: '#BCBCBC' }} />
                </div>
                <span
                  className="uppercase tracking-widest"
                  style={{ ...fontStyle(OPSStyle.Typography.status), color: 'rgba(255,255,255,0.35)', fontSize: 9 }}
                >
                  NEW LEAD
                </span>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: DURATION.normal, ease: EASE_ENTER }}
                >
                  <TutorialCard borderColor={`${STATUS_COLORS.warning}30`}>
                    <div className="flex flex-col gap-1">
                      <span style={{ ...fontStyle(OPSStyle.Typography.status), color: '#FFFFFF' }}>
                        {CLIENT_NAME}
                      </span>
                      <span style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText }}>
                        {PROJECT_TITLE}
                      </span>
                    </div>
                  </TutorialCard>
                </motion.div>
              </div>

              {/* Empty pipeline columns — hint at the full pipeline */}
              {['ESTIMATED', 'ACCEPTED', 'IN PROGRESS'].map((label, i) => (
                <motion.div
                  key={label}
                  className="flex flex-col gap-1.5 flex-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.25 }}
                  transition={{ delay: i * 0.1 + 0.2, duration: DURATION.normal }}
                >
                  <div className="h-[2px] rounded-full" style={{ backgroundColor: ['#B5A381', '#9DB582', '#8195B5'][i] }} />
                  <span
                    className="uppercase tracking-widest"
                    style={{ ...fontStyle(OPSStyle.Typography.status), color: 'rgba(255,255,255,0.2)', fontSize: 8 }}
                  >
                    {label}
                  </span>
                  <div className="h-16 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── Sell line — the emotional payoff ─── */}
        {phase === 'sellLine' && (
          <motion.div
            key="sellLine"
            className="flex flex-col gap-2"
            variants={narrativeText}
            initial="hidden"
            animate="visible"
            onAnimationComplete={() => {
              // Hold the sell line for 1.5s, then advance
              requestAnimationFrame(() => {
                setTimeout(() => onAdvance(), 1500)
              })
            }}
          >
            <span
              className="uppercase tracking-wide"
              style={{
                ...fontStyle(OPSStyle.Typography.subtitle),
                color: OPSStyle.Colors.primaryAccent,
                letterSpacing: '0.08em',
              }}
            >
              Captured. In your pipeline.
            </span>
            <span
              style={{
                ...fontStyle(OPSStyle.Typography.caption),
                color: OPSStyle.Colors.secondaryText,
              }}
            >
              No copy-paste. No missed leads. It just works.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

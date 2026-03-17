'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail } from 'lucide-react'
import { OPSStyle, fontStyle } from '@/lib/styles/OPSStyle'
import { TutorialCard } from '../components/TutorialCard'
import { TutorialStatusBadge } from '../components/TutorialStatusBadge'
import { PerimeterShimmer } from '../components/PerimeterShimmer'
import {
  CLIENT_NAME,
  PROJECT_TITLE,
  STATUS_COLORS,
} from '../NarrativeTutorialData'
import {
  cardEnterFromTop,
  fadeIn,
  TIMING,
  EASE_OUT,
  prefersReducedMotion,
} from '../utils/animations'

interface LeadArrivesStepProps {
  onAdvance: () => void
}

type StepState = 'waiting' | 'cardVisible' | 'docked'

/**
 * Step 1: "The Lead Arrives"
 *
 * Dark canvas. Empty. Still. Then — a notification card enters from the top
 * with a precise ease-out. Not a bounce. An arrival.
 *
 * The user clicks the card. It slides right into a mini pipeline column.
 * The column materializes as the card docks. Brief pause. Next step.
 *
 * What this sells: Leads come to you. The system catches them.
 */
export function LeadArrivesStep({ onAdvance }: LeadArrivesStepProps) {
  const [state, setState] = useState<StepState>('waiting')
  const [shimmerTrigger, setShimmerTrigger] = useState(false)
  const reduced = typeof window !== 'undefined' && prefersReducedMotion()

  // Card enters after a brief beat — the emptiness is intentional
  useEffect(() => {
    const delay = reduced ? 100 : 500
    const timer = setTimeout(() => {
      setState('cardVisible')
      // Shimmer plays after card settles
      setTimeout(() => setShimmerTrigger(true), reduced ? 100 : 400)
    }, delay)
    return () => clearTimeout(timer)
  }, [reduced])

  const handleCardClick = useCallback(() => {
    if (state !== 'cardVisible') return
    setState('docked')
    // Brief pause to show the docking, then advance
    setTimeout(() => onAdvance(), reduced ? 300 : 800)
  }, [state, onAdvance, reduced])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] relative">
      <AnimatePresence mode="wait">
        {state === 'waiting' && (
          <motion.div
            key="empty"
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}

        {state === 'cardVisible' && (
          <motion.div
            key="card"
            className="w-full max-w-sm cursor-pointer"
            onClick={handleCardClick}
            variants={cardEnterFromTop}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.99 }}
          >
            <TutorialCard
              borderColor={`${OPSStyle.Colors.primaryAccent}40`}
            >
              {/* Shimmer wraps the card */}
              <PerimeterShimmer
                trigger={shimmerTrigger}
                borderRadius={OPSStyle.Layout.cardCornerRadius}
              />

              <div className="flex flex-col gap-2">
                {/* NEW LEAD badge — amber, demands attention */}
                <TutorialStatusBadge text="NEW LEAD" color={STATUS_COLORS.warning} />

                {/* Client name — the human */}
                <span
                  style={{
                    ...fontStyle(OPSStyle.Typography.cardTitle),
                    color: '#FFFFFF',
                  }}
                >
                  {CLIENT_NAME}
                </span>

                {/* Project description */}
                <span
                  style={{
                    ...fontStyle(OPSStyle.Typography.caption),
                    color: OPSStyle.Colors.secondaryText,
                  }}
                >
                  {PROJECT_TITLE}
                </span>

                {/* Source badge — sells the auto-detection */}
                <div className="flex items-center gap-1.5 mt-1">
                  <Mail size={12} color={OPSStyle.Colors.primaryAccent} strokeWidth={1.5} />
                  <span
                    className="uppercase"
                    style={{
                      ...fontStyle(OPSStyle.Typography.status),
                      color: OPSStyle.Colors.primaryAccent,
                    }}
                  >
                    GMAIL
                  </span>
                </div>
              </div>
            </TutorialCard>
          </motion.div>
        )}

        {state === 'docked' && (
          <motion.div
            key="docked"
            className="w-full max-w-sm flex gap-3 items-start"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
          >
            {/* The card slides right and shrinks slightly */}
            <motion.div
              className="flex-1"
              initial={{ x: 0, scale: 1 }}
              animate={{ x: 40, scale: 0.92, opacity: 0.7 }}
              transition={{ duration: TIMING.standard, ease: EASE_OUT }}
            >
              <TutorialCard borderColor={`${OPSStyle.Colors.primaryAccent}30`}>
                <div className="flex flex-col gap-1.5">
                  <TutorialStatusBadge text="NEW LEAD" color={STATUS_COLORS.warning} animate={false} />
                  <span style={{ ...fontStyle(OPSStyle.Typography.cardTitle), color: '#FFFFFF' }}>
                    {CLIENT_NAME}
                  </span>
                  <span style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.secondaryText }}>
                    {PROJECT_TITLE}
                  </span>
                </div>
              </TutorialCard>
            </motion.div>

            {/* Pipeline column materializes */}
            <motion.div
              className="flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: TIMING.standard, ease: EASE_OUT, delay: 0.1 }}
              style={{ width: 80 }}
            >
              {/* Column header stripe — RFQ color */}
              <div
                className="w-full rounded-sm"
                style={{
                  height: 2,
                  backgroundColor: '#BCBCBC',
                }}
              />
              {/* Column label */}
              <span
                className="uppercase tracking-widest"
                style={{
                  ...fontStyle(OPSStyle.Typography.status),
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 9,
                }}
              >
                NEW LEAD
              </span>
              {/* Column body */}
              <div
                className="w-full rounded-sm"
                style={{
                  height: 80,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

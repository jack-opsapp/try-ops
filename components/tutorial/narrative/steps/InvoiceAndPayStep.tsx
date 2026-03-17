'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { OPSStyle, fontStyle } from '@/lib/styles/OPSStyle'
import { TutorialCard } from '../components/TutorialCard'
import { TutorialLineItem } from '../components/TutorialLineItem'
import { TutorialStatusBadge } from '../components/TutorialStatusBadge'
import { TutorialCTAButton } from '../components/TutorialCTAButton'
import { PerimeterShimmer } from '../components/PerimeterShimmer'
import {
  PROJECT_TITLE,
  CLIENT_NAME,
  LINE_ITEMS,
  INVOICE_NUMBER,
  ESTIMATE_TOTAL,
  STATUS_COLORS,
  formatCurrency,
} from '../NarrativeTutorialData'
import {
  cardEnterFromTop,
  staggerContainer,
  staggerItem,
  fadeIn,
  dispatch,
  TIMING,
  EASE_OUT,
  prefersReducedMotion,
} from '../utils/animations'

interface InvoiceAndPayStepProps {
  onGetStarted: () => void
  onSkip: () => void
}

type StepPhase =
  | 'projectCard'   // Completed project card shown
  | 'invoice'       // Card transforms into invoice with line items
  | 'sending'       // Invoice dispatches
  | 'paid'          // Payment received notification + PAID stamp
  | 'finalText'     // Staggered text reveal
  | 'cta'           // GET STARTED button

/**
 * Step 6: "Invoice & Get Paid"
 *
 * The full circle. Lead in, money out. Everything connected.
 *
 * Project card → invoice → send → payment received → staggered text
 * revealing the complete lifecycle → CTA.
 *
 * The staggered text is the emotional climax:
 * LEAD. ESTIMATE. PROJECT. INVOICE. REVENUE. NO PAPERWORK.
 */
export function InvoiceAndPayStep({ onGetStarted, onSkip }: InvoiceAndPayStepProps) {
  const [phase, setPhase] = useState<StepPhase>('projectCard')
  const [shimmerTrigger, setShimmerTrigger] = useState(false)
  const [visibleLines, setVisibleLines] = useState(0)
  const reduced = typeof window !== 'undefined' && prefersReducedMotion()

  // Auto-progress from projectCard to invoice
  useEffect(() => {
    if (reduced) {
      setPhase('cta')
      return
    }
    const timer = setTimeout(() => setPhase('invoice'), 1200)
    return () => clearTimeout(timer)
  }, [reduced])

  const handleSendInvoice = useCallback(() => {
    if (phase !== 'invoice') return
    setPhase('sending')

    if (reduced) {
      setPhase('paid')
      setTimeout(() => {
        setPhase('finalText')
        setVisibleLines(7)
        setTimeout(() => setPhase('cta'), 500)
      }, 500)
      return
    }

    // Invoice dispatches → beat → payment
    setTimeout(() => {
      setPhase('paid')
      setShimmerTrigger(true)
    }, 800)

    // Payment holds → staggered text
    setTimeout(() => {
      setPhase('finalText')
    }, 2500)
  }, [phase, reduced])

  // Staggered text reveal
  useEffect(() => {
    if (phase !== 'finalText') return
    if (reduced) {
      setVisibleLines(7)
      setTimeout(() => setPhase('cta'), 500)
      return
    }

    const FINAL_LINES = [
      'LEAD.',
      'ESTIMATE.',
      'PROJECT.',
      'INVOICE.',
      'REVENUE.',
      '', // beat
      'NO PAPERWORK.',
    ]

    let lineIndex = 0
    const interval = setInterval(() => {
      lineIndex++
      setVisibleLines(lineIndex)
      if (lineIndex >= FINAL_LINES.length) {
        clearInterval(interval)
        // Show CTA after last line
        setTimeout(() => setPhase('cta'), 1000)
      }
    }, TIMING.textRevealInterval * 1000)

    return () => clearInterval(interval)
  }, [phase, reduced])

  const FINAL_LINES = [
    { text: 'LEAD.', color: OPSStyle.Colors.secondaryText, size: false },
    { text: 'ESTIMATE.', color: OPSStyle.Colors.secondaryText, size: false },
    { text: 'PROJECT.', color: OPSStyle.Colors.secondaryText, size: false },
    { text: 'INVOICE.', color: OPSStyle.Colors.secondaryText, size: false },
    { text: 'REVENUE.', color: '#FFFFFF', size: true },
    { text: '', color: 'transparent', size: false }, // beat
    { text: 'NO PAPERWORK.', color: OPSStyle.Colors.primaryAccent, size: false },
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <AnimatePresence mode="wait">
        {/* Project card */}
        {phase === 'projectCard' && (
          <motion.div
            key="project"
            className="w-full max-w-sm"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <TutorialCard borderColor={`${STATUS_COLORS.success}40`}>
              <div className="flex items-center justify-between">
                <span style={{ ...fontStyle(OPSStyle.Typography.cardTitle), color: '#FFFFFF' }}>
                  {PROJECT_TITLE}
                </span>
                <TutorialStatusBadge text="COMPLETE" color={STATUS_COLORS.success} />
              </div>
            </TutorialCard>
          </motion.div>
        )}

        {/* Invoice */}
        {phase === 'invoice' && (
          <motion.div
            key="invoice"
            className="w-full max-w-sm"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: TIMING.standard, ease: EASE_OUT }}
          >
            <TutorialCard>
              <div className="flex flex-col gap-3">
                {/* Invoice header */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <TutorialStatusBadge text="INVOICE" color={OPSStyle.Colors.primaryAccent} />
                    <span style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText }}>
                      {INVOICE_NUMBER}
                    </span>
                  </div>
                  <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText }}>
                    {CLIENT_NAME}
                  </span>
                </div>

                {/* Line items — same as the estimate, full circle */}
                <motion.div
                  className="flex flex-col gap-2"
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

                {/* Divider */}
                <div className="h-px" style={{ backgroundColor: OPSStyle.Colors.cardBorder }} />

                {/* Total */}
                <div className="flex items-baseline justify-between">
                  <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText }}>
                    TOTAL
                  </span>
                  <span style={{ ...fontStyle(OPSStyle.Typography.largeTitle), color: '#FFFFFF' }}>
                    {formatCurrency(ESTIMATE_TOTAL)}
                  </span>
                </div>

                {/* Send Invoice button */}
                <motion.button
                  onClick={handleSendInvoice}
                  className="w-full cursor-pointer mt-1"
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
                  SEND INVOICE
                </motion.button>
              </div>
            </TutorialCard>
          </motion.div>
        )}

        {/* Sending — dispatch animation */}
        {phase === 'sending' && (
          <motion.div
            key="sending"
            className="w-full max-w-sm"
            variants={dispatch}
            initial="visible"
            animate="exit"
          >
            <TutorialCard>
              <div className="opacity-60">
                <span style={{ ...fontStyle(OPSStyle.Typography.cardTitle), color: '#FFFFFF' }}>
                  {INVOICE_NUMBER} — {formatCurrency(ESTIMATE_TOTAL)}
                </span>
              </div>
            </TutorialCard>
          </motion.div>
        )}

        {/* Payment received */}
        {phase === 'paid' && (
          <motion.div
            key="paid"
            className="w-full max-w-sm relative"
            variants={cardEnterFromTop}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <TutorialCard borderColor={`${STATUS_COLORS.success}40`}>
              <PerimeterShimmer
                trigger={shimmerTrigger}
                borderRadius={OPSStyle.Layout.cardCornerRadius}
              />
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${STATUS_COLORS.success}26` }}
                  >
                    <Check size={16} color={STATUS_COLORS.success} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <TutorialStatusBadge text="PAYMENT RECEIVED" color={STATUS_COLORS.success} />
                    <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText }}>
                      {CLIENT_NAME} — {formatCurrency(ESTIMATE_TOTAL)}
                    </span>
                  </div>
                </div>

                {/* PAID stamp — crisp, no fanfare */}
                <div className="flex justify-center py-2">
                  <span
                    className="uppercase"
                    style={{
                      ...fontStyle(OPSStyle.Typography.title),
                      color: STATUS_COLORS.success,
                      border: `2px solid ${STATUS_COLORS.success}`,
                      padding: '4px 16px',
                      borderRadius: OPSStyle.Layout.smallCornerRadius,
                      letterSpacing: '0.15em',
                    }}
                  >
                    PAID
                  </span>
                </div>
              </div>
            </TutorialCard>
          </motion.div>
        )}

        {/* Final text reveal + CTA */}
        {(phase === 'finalText' || phase === 'cta') && (
          <motion.div
            key="final"
            className="w-full max-w-sm flex flex-col items-start gap-1"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            {/* Staggered text — each line appears one at a time */}
            <div className="flex flex-col gap-1 mb-8 w-full">
              {FINAL_LINES.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{
                    opacity: i < visibleLines ? 1 : 0,
                    y: i < visibleLines ? 0 : 8,
                  }}
                  transition={{ duration: TIMING.standard, ease: EASE_OUT }}
                >
                  {line.text && (
                    <span
                      className="uppercase tracking-wide"
                      style={{
                        ...fontStyle(line.size ? OPSStyle.Typography.largeTitle : OPSStyle.Typography.title),
                        color: line.color,
                        letterSpacing: '0.08em',
                      }}
                    >
                      {line.text}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <AnimatePresence>
              {phase === 'cta' && (
                <motion.div
                  className="w-full"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: TIMING.standard, ease: EASE_OUT }}
                >
                  <TutorialCTAButton
                    primaryLabel="GET STARTED"
                    secondaryLabel="SKIP"
                    onPrimary={onGetStarted}
                    onSecondary={onSkip}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

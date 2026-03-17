'use client'

import { useState, useCallback, useEffect } from 'react'
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
  narrativeText,
  enterFromTop,
  staggerParent,
  staggerChild,
  fade,
  dispatch,
  DURATION,
  EASE_ENTER,
} from '../utils/animations'

interface InvoiceAndPayStepProps {
  onGetStarted: () => void
  onSkip: () => void
}

/**
 * Step 6: "Invoice & Get Paid"
 *
 * Emotional beat: ACHIEVEMENT + COMMITMENT
 * User feels: the full circle closing — lead in, money out
 * Animation must: close the loop with weight and gravitas
 *
 * This is the emotional climax. The staggered text at the end is
 * the moment where skepticism transforms to conviction:
 * LEAD. ESTIMATE. PROJECT. INVOICE. REVENUE. NO PAPERWORK.
 *
 * The CTA must feel earned — the user just watched their entire
 * business lifecycle in under 90 seconds.
 */
export function InvoiceAndPayStep({ onGetStarted, onSkip }: InvoiceAndPayStepProps) {
  const [phase, setPhase] = useState<'narrative' | 'invoice' | 'sending' | 'paid' | 'finalText' | 'cta'>('narrative')
  const [shimmerFired, setShimmerFired] = useState(false)
  const [visibleLines, setVisibleLines] = useState(0)

  // Staggered text reveal — each line appears after the previous
  useEffect(() => {
    if (phase !== 'finalText') return

    const TOTAL_LINES = 7 // LEAD, ESTIMATE, PROJECT, INVOICE, REVENUE, (beat), NO PAPERWORK
    let line = 0

    const advance = () => {
      line++
      setVisibleLines(line)
      if (line >= TOTAL_LINES) {
        // All lines shown → show CTA after a beat
        requestAnimationFrame(() => setTimeout(() => setPhase('cta'), 1000))
      } else {
        // Next line after interval (longer pause before "NO PAPERWORK")
        const delay = line === 5 ? 800 : DURATION.text * 1000
        requestAnimationFrame(() => setTimeout(advance, delay))
      }
    }

    // Start the reveal after a beat of dark canvas
    requestAnimationFrame(() => setTimeout(advance, 600))
  }, [phase])

  const handleSend = useCallback(() => {
    if (phase !== 'invoice') return
    setPhase('sending')
  }, [phase])

  const FINAL_LINES = [
    { text: 'LEAD.', color: OPSStyle.Colors.secondaryText, large: false },
    { text: 'ESTIMATE.', color: OPSStyle.Colors.secondaryText, large: false },
    { text: 'PROJECT.', color: OPSStyle.Colors.secondaryText, large: false },
    { text: 'INVOICE.', color: OPSStyle.Colors.secondaryText, large: false },
    { text: 'REVENUE.', color: '#FFFFFF', large: true },
    { text: '', color: 'transparent', large: false }, // beat
    { text: 'NO PAPERWORK.', color: OPSStyle.Colors.primaryAccent, large: false },
  ]

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
              requestAnimationFrame(() => setTimeout(() => setPhase('invoice'), 1200))
            }}
          >
            <span className="uppercase tracking-widest" style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText, letterSpacing: '0.2em' }}>
              STEP 6
            </span>
            <span className="uppercase tracking-wide" style={{ ...fontStyle(OPSStyle.Typography.title), color: '#FFFFFF' }}>
              Invoice and get paid.
            </span>
            <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText, lineHeight: 1.5 }}>
              The project is complete. One tap to invoice — same line items, same totals. Full circle.
            </span>
          </motion.div>
        )}

        {/* ─── Invoice card ─── */}
        {phase === 'invoice' && (
          <motion.div
            key="invoice"
            className="flex flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="uppercase tracking-widest" style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText, letterSpacing: '0.15em' }}>
              INVOICE
            </span>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: DURATION.normal, ease: EASE_ENTER }}
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
                    <div className="flex flex-col items-end gap-0.5">
                      <span style={{ ...fontStyle(OPSStyle.Typography.bodyBold), color: '#FFFFFF' }}>{CLIENT_NAME}</span>
                      <span style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText }}>{PROJECT_TITLE}</span>
                    </div>
                  </div>

                  {/* Same line items as the estimate — full circle traceability */}
                  <motion.div className="flex flex-col gap-2" variants={staggerParent} initial="hidden" animate="visible" role="list">
                    {LINE_ITEMS.map((item) => (
                      <motion.div key={item.id} variants={staggerChild}>
                        <TutorialLineItem item={item} />
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="h-px" style={{ backgroundColor: OPSStyle.Colors.cardBorder }} />

                  <div className="flex items-baseline justify-between">
                    <span className="uppercase tracking-wider" style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText }}>TOTAL</span>
                    <span style={{ ...fontStyle(OPSStyle.Typography.largeTitle), color: '#FFFFFF' }}>{formatCurrency(ESTIMATE_TOTAL)}</span>
                  </div>

                  <motion.button
                    className="w-full cursor-pointer mt-1"
                    onClick={handleSend}
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
          </motion.div>
        )}

        {/* ─── Dispatching ─── */}
        {phase === 'sending' && (
          <motion.div
            key="sending"
            variants={dispatch}
            initial="visible"
            animate="exit"
            onAnimationComplete={() => {
              // Beat of silence, then payment
              requestAnimationFrame(() => setTimeout(() => setPhase('paid'), 600))
            }}
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

        {/* ─── Payment received ─── */}
        {phase === 'paid' && (
          <motion.div
            key="paid"
            className="flex flex-col gap-4"
            variants={enterFromTop}
            initial="hidden"
            animate="visible"
            onAnimationComplete={() => {
              setShimmerFired(true)
              // Hold payment card, then transition to final text
              requestAnimationFrame(() => setTimeout(() => setPhase('finalText'), 2500))
            }}
          >
            <TutorialCard borderColor={`${STATUS_COLORS.success}40`}>
              <PerimeterShimmer trigger={shimmerFired} borderRadius={OPSStyle.Layout.cardCornerRadius} />
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${STATUS_COLORS.success}26` }}
                  >
                    <Check size={16} color={STATUS_COLORS.success} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <TutorialStatusBadge text="PAYMENT RECEIVED" color={STATUS_COLORS.success} />
                    <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText }}>
                      {CLIENT_NAME} — {formatCurrency(ESTIMATE_TOTAL)}
                    </span>
                  </div>
                </div>

                {/* PAID stamp — crisp, no fanfare */}
                <div className="flex justify-start py-1">
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

        {/* ─── Final text reveal — the emotional climax ─── */}
        {(phase === 'finalText' || phase === 'cta') && (
          <motion.div
            key="final"
            className="flex flex-col gap-1.5 w-full"
            variants={fade}
            initial="hidden"
            animate="visible"
          >
            {/* Staggered text lines */}
            <div className="flex flex-col gap-1 mb-8">
              {FINAL_LINES.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{
                    opacity: i < visibleLines ? 1 : 0,
                    y: i < visibleLines ? 0 : 6,
                  }}
                  transition={{ duration: DURATION.normal, ease: EASE_ENTER }}
                >
                  {line.text && (
                    <span
                      className="uppercase tracking-wide"
                      style={{
                        ...fontStyle(line.large ? OPSStyle.Typography.largeTitle : OPSStyle.Typography.title),
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

            {/* CTA — appears after all text is revealed */}
            <AnimatePresence>
              {phase === 'cta' && (
                <motion.div
                  className="w-full"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: DURATION.normal, ease: EASE_ENTER }}
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

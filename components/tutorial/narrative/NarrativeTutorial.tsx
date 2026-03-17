'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useNarrativeTutorialStore } from './NarrativeTutorialState'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { OPSStyle, fontStyle } from '@/lib/styles/OPSStyle'
import { PHASE_CONFIG, TOTAL_STEPS } from './NarrativeTutorialData'
import { DURATION, EASE_ENTER } from './utils/animations'

// Components
import { TutorialProgressDots } from './components/TutorialProgressDots'
import { AmbientContext } from './components/AmbientContext'

// Steps
import { LeadArrivesStep } from './steps/LeadArrivesStep'
import { SendEstimateStep } from './steps/SendEstimateStep'
import { EstimateApprovedStep } from './steps/EstimateApprovedStep'
import { CrewExecutesStep } from './steps/CrewExecutesStep'
import { WeeklyReviewStep } from './steps/WeeklyReviewStep'
import { InvoiceAndPayStep } from './steps/InvoiceAndPayStep'

/**
 * NarrativeTutorial — Root orchestrator
 *
 * Mounts the active step, progress dots, skip button, and ambient panels.
 * Full-screen dark canvas. Desktop: 3-zone layout (ambient | stage | ambient).
 * Mobile: full-bleed centered stage.
 *
 * This is a 60-90 second conversion tool. The user watches their chaotic
 * workflow become effortless — lead in, money out, no paperwork.
 */
export function NarrativeTutorial() {
  const router = useRouter()
  const store = useNarrativeTutorialStore()
  const {
    trackTutorialPhaseStart,
    trackTutorialComplete,
    trackTutorialSkip,
  } = useAnalytics()
  const { setTutorialCompleted, setTutorialStartTime } = useOnboardingStore()

  // Start tutorial on mount
  useEffect(() => {
    store.start()
    setTutorialStartTime(Date.now())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Track phase changes via gtag
  useEffect(() => {
    if (store.isActive) {
      trackTutorialPhaseStart(
        store.phase,
        PHASE_CONFIG[store.phase].index,
        TOTAL_STEPS,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.phase, store.isActive])

  const handleAdvance = useCallback(() => {
    store.advancePhase()
  }, [store])

  const handleSkip = useCallback(() => {
    trackTutorialSkip(store.phase, PHASE_CONFIG[store.phase].index)
    store.skip()
    router.push('/signup/credentials')
  }, [store, router, trackTutorialSkip])

  const handleGetStarted = useCallback(() => {
    // Fire completed_v2 analytics (advancePhase does this when phase is last)
    store.advancePhase()
    store.ctaTapped('getStarted')
    trackTutorialComplete(Math.round(store.totalElapsedMs() / 1000))
    setTutorialCompleted()
    router.push('/signup/credentials')
  }, [store, router, trackTutorialComplete, setTutorialCompleted])

  const handleCTASkip = useCallback(() => {
    store.ctaTapped('skip')
    setTutorialCompleted()
    router.push('/signup/credentials')
  }, [store, router, setTutorialCompleted])

  const currentIndex = PHASE_CONFIG[store.phase].index

  const renderStep = () => {
    switch (store.phase) {
      case 'leadArrives':
        return <LeadArrivesStep key="lead" onAdvance={handleAdvance} />
      case 'sendEstimate':
        return <SendEstimateStep key="estimate" onAdvance={handleAdvance} />
      case 'estimateApproved':
        return <EstimateApprovedStep key="approved" onAdvance={handleAdvance} />
      case 'crewExecutes':
        return <CrewExecutesStep key="crew" onAdvance={handleAdvance} />
      case 'weeklyReview':
        return <WeeklyReviewStep key="review" onAdvance={handleAdvance} />
      case 'invoiceAndPay':
        return (
          <InvoiceAndPayStep
            key="invoice"
            onGetStarted={handleGetStarted}
            onSkip={handleCTASkip}
          />
        )
      default:
        return null
    }
  }

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col"
      style={{ backgroundColor: OPSStyle.Colors.background }}
    >
      {/* Top bar: progress dots centered, skip button right */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2 relative z-10">
        <div className="flex-1" />
        <TutorialProgressDots currentStep={currentIndex} />
        <div className="flex-1 flex justify-end">
          {/* Skip — hidden on final step (CTA handles exit there) */}
          {store.phase !== 'invoiceAndPay' && (
            <button
              onClick={handleSkip}
              className="cursor-pointer bg-transparent border-none"
              style={{
                ...fontStyle(OPSStyle.Typography.caption),
                color: OPSStyle.Colors.tertiaryText,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              SKIP
            </button>
          )}
        </div>
      </div>

      {/* Main: ambient panels + center stage */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left ambient — desktop only (≥1024px) */}
        <div className="hidden lg:block w-[280px] flex-shrink-0">
          <AmbientContext phase={store.phase} side="left" />
        </div>

        {/* Center stage — max 560px, vertically centered */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-[560px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={store.phase}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.normal, ease: EASE_ENTER }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right ambient — desktop only */}
        <div className="hidden lg:block w-[280px] flex-shrink-0">
          <AmbientContext phase={store.phase} side="right" />
        </div>
      </div>
    </div>
  )
}

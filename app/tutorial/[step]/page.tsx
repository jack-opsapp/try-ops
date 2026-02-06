'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { TypewriterText } from '@/components/ui/TypewriterText'
import { OPSButton } from '@/components/ui/OPSButton'
import { PhasedContent } from '@/components/ui/PhasedContent'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { TutorialVideo } from '@/components/tutorial/TutorialVideo'
import { useVariant } from '@/lib/hooks/useVariant'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import {
  TUTORIAL_STEPS_A,
  TUTORIAL_STEPS_B,
} from '@/lib/constants/tutorial-steps'

export default function TutorialStepPage() {
  const router = useRouter()
  const params = useParams()
  const variant = useVariant()
  const {
    trackTutorialStepView,
    trackTutorialStepComplete,
    trackTutorialSkip,
    trackTutorialComplete,
  } = useAnalytics()
  const {
    setHighestTutorialStep,
    setTutorialCompleted,
    tutorialStartTime,
  } = useOnboardingStore()

  const steps = variant === 'a' ? TUTORIAL_STEPS_A : TUTORIAL_STEPS_B
  const stepIndex = parseInt(params.step as string, 10) - 1
  const step = steps[stepIndex]
  const isLastStep = stepIndex === steps.length - 1

  const [titleDone, setTitleDone] = useState(false)

  // Track step view
  useEffect(() => {
    if (step) {
      setHighestTutorialStep(stepIndex + 1)
      trackTutorialStepView(step.id, stepIndex + 1, steps.length)
    }
  }, [step, stepIndex, steps.length, setHighestTutorialStep, trackTutorialStepView])

  const handleContinue = useCallback(() => {
    if (!step) return
    trackTutorialStepComplete(step.id, stepIndex + 1)

    if (isLastStep) {
      const totalTime = tutorialStartTime
        ? Math.round((Date.now() - tutorialStartTime) / 1000)
        : 0
      trackTutorialComplete(totalTime)
      setTutorialCompleted()
      router.push('/tutorial/complete')
    } else {
      router.push(`/tutorial/${stepIndex + 2}`)
    }
  }, [step, stepIndex, isLastStep, tutorialStartTime, trackTutorialStepComplete, trackTutorialComplete, setTutorialCompleted, router])

  const handleSkip = () => {
    if (step) {
      trackTutorialSkip(step.id, stepIndex + 1)
    }
    setTutorialCompleted()
    router.push('/tutorial/complete')
  }

  if (!step) {
    router.push('/tutorial/1')
    return null
  }

  return (
    <div className="min-h-screen bg-ops-background flex flex-col">
      {/* Progress bar */}
      <div className="px-6 pt-6">
        <ProgressBar
          currentStep={stepIndex}
          totalSteps={steps.length}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pt-8 pb-6 max-w-2xl mx-auto w-full">
        {/* Title */}
        <h2 className="text-ops-title font-mohave font-semibold tracking-wide mb-2">
          <TypewriterText
            key={step.id}
            text={step.title}
            typingSpeed={30}
            onComplete={() => setTitleDone(true)}
          />
        </h2>

        {/* Description */}
        <PhasedContent delay={step.title.length * 30 + 200} key={`desc-${step.id}`}>
          <p className="font-kosugi text-ops-body text-ops-text-secondary mb-8">
            {step.description}
          </p>
        </PhasedContent>

        {/* Video or summary content */}
        {step.videoSrc && step.durationMs ? (
          <PhasedContent delay={step.title.length * 30 + 500} key={`video-${step.id}`}>
            <TutorialVideo
              src={step.videoSrc}
              durationMs={step.durationMs}
              autoAdvance={step.autoAdvance}
              onComplete={step.autoAdvance ? handleContinue : undefined}
              className="flex-1"
            />
          </PhasedContent>
        ) : (
          // Summary step - no video
          <PhasedContent delay={step.title.length * 30 + 500} key={`summary-${step.id}`}>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-ops-accent/10 border border-ops-accent/30 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-ops-accent">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </PhasedContent>
        )}

        {/* Spacer */}
        <div className="flex-1 min-h-4" />

        {/* Buttons */}
        <PhasedContent delay={step.title.length * 30 + 800} key={`btns-${step.id}`}>
          <div className="space-y-3 pt-4">
            {!step.autoAdvance && (
              <OPSButton onClick={handleContinue}>
                {isLastStep ? 'CONTINUE' : 'CONTINUE'}
              </OPSButton>
            )}
            {!isLastStep && (
              <OPSButton variant="ghost" onClick={handleSkip}>
                SKIP TUTORIAL
              </OPSButton>
            )}
          </div>
        </PhasedContent>
      </div>
    </div>
  )
}

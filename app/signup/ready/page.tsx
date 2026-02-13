'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TypewriterText } from '@/components/ui/TypewriterText'
import { OnboardingScaffold } from '@/components/layout/OnboardingScaffold'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { useAnalytics } from '@/lib/hooks/useAnalytics'

/**
 * Matches iOS BillingInfoView companyCreatorView exactly:
 * - Left-aligned VStack
 * - "30 DAYS FREE" typewriter title
 * - "Full access. No card required." subtitle
 * - Benefit rows with "→" prefix and divider lines
 * - "SEE PLANS" link
 * - "START TRIAL" button at bottom
 *
 * Plus user-requested additions:
 * - "Upgrade anytime."
 * - Contact message with jack@opsapp.co
 */

const BENEFITS = [
  'Every feature unlocked',
  'Up to 10 team members',
  'Unlimited projects',
]

export default function ReadyPage() {
  const router = useRouter()
  const {
    trackSignupStepView,
    trackSignupStepComplete,
    trackSignupComplete,
    trackAppDownload,
  } = useAnalytics()
  const { userId, companyId, authMethod, setSignupStep, setSignupCompleted } =
    useOnboardingStore()

  const [marked, setMarked] = useState(false)
  const [showTitle, setShowTitle] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (!userId) {
      router.push('/signup/credentials')
      return
    }
    setSignupStep(6)
    trackSignupStepView('ready', 6)

    // iOS: start title typing after 0.2s delay
    setTimeout(() => setShowTitle(true), 200)
  }, [userId, router, setSignupStep, trackSignupStepView])

  // Mark onboarding as complete on the backend
  useEffect(() => {
    if (!userId || marked) return

    const markComplete = async () => {
      try {
        await fetch(`/api/user/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hasCompletedAppTutorial: true,
          }),
        })
        setMarked(true)
        setSignupCompleted()
        trackSignupStepComplete('ready', 6)
        trackSignupComplete(authMethod || 'email')
      } catch {
        // Non-critical, continue anyway
      }
    }

    markComplete()
  }, [
    userId,
    marked,
    setSignupCompleted,
    trackSignupStepComplete,
    trackSignupComplete,
    authMethod,
  ])

  const handleDownload = () => {
    trackAppDownload(userId || undefined, companyId || undefined)
    router.push('/download')
  }

  return (
    <OnboardingScaffold>
      {/* iOS BillingInfoView companyCreatorView layout: left-aligned VStack */}
      <div className="flex flex-col flex-1">
        {/* Spacer — iOS: Spacer().frame(height: 60) */}
        <div className="h-[60px]" />

        {/* Title — iOS: TypewriterText("30 DAYS FREE", font: .title, typingSpeed: 28) */}
        <div className="px-10 pt-4">
          <div className="relative">
            <h1 className="font-mohave font-semibold text-ops-title tracking-wide text-transparent select-none">
              30 DAYS FREE
            </h1>
            {showTitle && (
              <span className="absolute inset-0">
                <TypewriterText
                  text="30 DAYS FREE"
                  className="font-mohave font-semibold text-ops-title tracking-wide text-white"
                  typingSpeed={36}
                  onComplete={() => {
                    // iOS: 0.25s delay then show content
                    setTimeout(() => setShowContent(true), 250)
                  }}
                />
              </span>
            )}
          </div>
        </div>

        {/* Spacer — iOS: Spacer().frame(height: 48) */}
        <div className="h-12" />

        {/* Content — iOS: fades in with .easeOut(duration: 0.4) */}
        <div
          className="px-10 transition-all duration-[400ms] ease-out"
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          {/* iOS: "Full access. No card required." */}
          <p className="font-mohave text-ops-body text-ops-text-secondary">
            Full access. No card required.
          </p>

          {/* Spacer — iOS: Spacer().frame(height: 8) */}
          <div className="h-2" />

          {/* iOS: VStack(alignment: .leading, spacing: 0) with trialBenefitRow */}
          <div className="flex flex-col mt-4">
            {BENEFITS.map((benefit, i) => (
              <div key={benefit}>
                {/* iOS: HStack(spacing: 12) with "→" + text, .padding(.vertical, 12) */}
                <div className="flex items-center gap-3 py-3">
                  <span className="font-kosugi text-ops-caption text-ops-text-tertiary">
                    →
                  </span>
                  <span className="font-kosugi text-ops-caption text-white">
                    {benefit}
                  </span>
                </div>
                {/* iOS: Rectangle().fill(Color.white.opacity(0.08)).frame(height: 1) — not on last */}
                {i < BENEFITS.length - 1 && (
                  <div className="h-px" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
                )}
              </div>
            ))}
          </div>

          {/* Spacer — iOS: Spacer().frame(height: 24) */}
          <div className="h-6" />

          {/* iOS: "SEE PLANS" button with chevron.right */}
          <button className="flex items-center gap-2">
            <span className="font-kosugi font-bold text-ops-caption text-ops-text-secondary">
              SEE PLANS
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-ops-text-tertiary">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* User-requested: "Upgrade anytime." */}
          <p className="font-kosugi text-ops-caption text-ops-text-secondary mt-6">
            Upgrade anytime.
          </p>

          {/* User-requested: Contact message */}
          <p className="font-kosugi text-ops-small text-ops-text-tertiary mt-4 leading-relaxed">
            Get in touch with us if you have any trouble, or if the app is missing any features you need:{' '}
            <a
              href="mailto:jack@opsapp.co"
              className="text-ops-accent hover:underline"
            >
              jack@opsapp.co
            </a>
          </p>
        </div>

        {/* Spacer — pushes button to bottom */}
        <div className="flex-1" />

        {/* Button — iOS: OnboardingPrimaryButton("START TRIAL") .padding(.horizontal, 40) .padding(.bottom, 50) */}
        <div className="px-10 pb-[50px] pt-4">
          <button
            onClick={handleDownload}
            className="w-full h-14 rounded-ops bg-white flex items-center px-5 active:scale-[0.98] transition-transform"
          >
            <span className="font-mohave font-bold text-ops-body text-black">
              START TRIAL
            </span>
            <div className="flex-1" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-black">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </OnboardingScaffold>
  )
}

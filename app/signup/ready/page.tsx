'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TypewriterText } from '@/components/ui/TypewriterText'
import { OPSButton } from '@/components/ui/OPSButton'
import { PhasedContent } from '@/components/ui/PhasedContent'
import { OnboardingScaffold } from '@/components/layout/OnboardingScaffold'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { useAnalytics } from '@/lib/hooks/useAnalytics'

const BENEFITS = [
  'Every feature unlocked',
  'Up to 10 team members',
  'Unlimited projects',
]

export default function ReadyPage() {
  const router = useRouter()
  const { trackSignupStepView, trackSignupStepComplete, trackSignupComplete, trackAppDownload } =
    useAnalytics()
  const { userId, companyId, authMethod, setSignupStep, setSignupCompleted } =
    useOnboardingStore()

  const [marked, setMarked] = useState(false)

  useEffect(() => {
    if (!userId) {
      router.push('/signup/credentials')
      return
    }
    setSignupStep(6)
    trackSignupStepView('ready', 6)
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
  }, [userId, marked, setSignupCompleted, trackSignupStepComplete, trackSignupComplete, authMethod])

  const handleDownload = () => {
    trackAppDownload(userId || undefined, companyId || undefined)
    router.push('/download')
  }

  return (
    <OnboardingScaffold>
      <div className="max-w-md mx-auto w-full flex flex-col items-center justify-center min-h-[70vh]">
        <h1 className="text-ops-large-title font-mohave font-bold tracking-wide mb-3 text-center">
          <TypewriterText text="30 DAYS FREE" typingSpeed={50} />
        </h1>

        <PhasedContent delay={800}>
          <p className="font-kosugi text-ops-body text-ops-text-secondary text-center mb-10">
            Full access. No card required.
          </p>
        </PhasedContent>

        <PhasedContent delay={1200}>
          <div className="space-y-4 mb-10 w-full">
            {BENEFITS.map((benefit, i) => (
              <div
                key={benefit}
                className="flex items-center gap-3"
                style={{ animationDelay: `${1200 + i * 200}ms` }}
              >
                <div className="w-6 h-6 rounded-full bg-ops-success/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-ops-success"
                  >
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="font-mohave text-ops-body text-white">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </PhasedContent>

        <PhasedContent delay={2000}>
          <OPSButton onClick={handleDownload} className="w-full">
            DOWNLOAD OPS
          </OPSButton>
        </PhasedContent>
      </div>
    </OnboardingScaffold>
  )
}

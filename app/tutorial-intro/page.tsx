'use client'

import { useEffect } from 'react'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { TutorialIntroShell } from '@/components/tutorial/intro/TutorialIntroShell'

export default function TutorialIntroPage() {
  const tutorialStartTime = useOnboardingStore((s) => s.tutorialStartTime)
  const setTutorialStartTime = useOnboardingStore((s) => s.setTutorialStartTime)

  // Reset start time if stale (>1hr) or missing
  useEffect(() => {
    const ONE_HOUR = 60 * 60 * 1000
    if (!tutorialStartTime || Date.now() - tutorialStartTime > ONE_HOUR) {
      setTutorialStartTime(Date.now())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-ops-background flex items-center justify-center">
      <TutorialIntroShell />
    </div>
  )
}

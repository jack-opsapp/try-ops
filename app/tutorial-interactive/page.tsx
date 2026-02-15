'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TutorialProvider } from '@/lib/tutorial/TutorialContext'
import { TutorialShell } from '@/components/tutorial/interactive/TutorialShell'
import { TypewriterText } from '@/components/ui/TypewriterText'
import { OPSButton } from '@/components/ui/OPSButton'
import { PhasedContent } from '@/components/ui/PhasedContent'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'

export default function InteractiveTutorialPage() {
  const router = useRouter()
  const { track, trackTutorialComplete } = useAnalytics()
  const { setTutorialCompleted, tutorialStartTime, setTutorialStartTime } =
    useOnboardingStore()
  const [completionTime, setCompletionTime] = useState<number | null>(null)
  const [titleDone, setTitleDone] = useState(false)

  // Set start time if not already set
  useEffect(() => {
    if (!tutorialStartTime) {
      setTutorialStartTime(Date.now())
    }
    track('tutorial_step_view', {
      step_id: 'interactive',
      step_index: 1,
      total_steps: 1,
      tutorial_type: 'interactive',
    })
  }, [tutorialStartTime, setTutorialStartTime, track])

  const handleComplete = useCallback(
    (elapsedSeconds: number, stepDurations: string[]) => {
      setCompletionTime(elapsedSeconds)

      const totalTime = tutorialStartTime
        ? Math.round((Date.now() - tutorialStartTime) / 1000)
        : elapsedSeconds

      trackTutorialComplete(totalTime)
      setTutorialCompleted()

      // Post per-phase timing data
      fetch('/api/tutorial-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepDuration: stepDurations,
          totalTime,
          variant: 'interactive',
        }),
      }).catch(() => {}) // fire-and-forget
    },
    [tutorialStartTime, trackTutorialComplete, setTutorialCompleted]
  )

  const handleLetsGo = () => {
    router.push('/signup/credentials')
  }

  // Completion screen
  if (completionTime !== null) {
    const minutes = Math.floor(completionTime / 60)
    const seconds = completionTime % 60
    const isQuick = completionTime < 120

    const timeDisplay =
      minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`

    const headlineText = isQuick
      ? `DONE IN ${timeDisplay}. NOT BAD.`
      : "YOU'RE READY."

    const subtitleText =
      'Now build your first real project and run your crew right.'

    return (
      <div className="min-h-screen bg-ops-background flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          {/* Checkmark */}
          <PhasedContent delay={0}>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-ops-accent/10 border border-ops-accent/30 flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                className="text-ops-accent"
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
          </PhasedContent>

          <h1 className="text-ops-large-title font-mohave font-bold tracking-wide mb-4">
            <TypewriterText
              text={headlineText}
              typingSpeed={35}
              onComplete={() => setTitleDone(true)}
            />
          </h1>

          <PhasedContent delay={headlineText.length * 35 + 400}>
            <p className="font-kosugi text-ops-body text-ops-text-secondary mb-12">
              {subtitleText}
            </p>
          </PhasedContent>

          <PhasedContent delay={headlineText.length * 35 + 1000}>
            <OPSButton onClick={handleLetsGo}>{"LET'S GO"}</OPSButton>
          </PhasedContent>
        </div>
      </div>
    )
  }

  // Interactive tutorial
  return (
    <div className="h-screen bg-ops-background overflow-hidden flex items-center justify-center">
      {/* iPhone frame — only visible on desktop (md+) */}
      <div
        className="relative w-full overflow-hidden
                   md:border-[3px] md:border-[#2A2A2A] md:rounded-[44px] md:shadow-2xl"
        style={{
          maxWidth: 430,
          maxHeight: 'min(calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)), 932px)',
          height: '100%',
        }}
      >
        {/* Dynamic Island — desktop only */}
        <div className="hidden md:flex absolute top-3 left-1/2 -translate-x-1/2 items-center justify-center"
          style={{ zIndex: 70, width: 126, height: 36, borderRadius: 18, background: '#000000' }}
        />
        <TutorialProvider>
          <TutorialShell onComplete={handleComplete} />
        </TutorialProvider>
      </div>
    </div>
  )
}

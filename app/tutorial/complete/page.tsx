'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TypewriterText } from '@/components/ui/TypewriterText'
import { Button } from '@/components/ui/Button'
import { PhasedContent } from '@/components/ui/PhasedContent'
import { useAnalytics } from '@/lib/hooks/useAnalytics'

export default function TutorialCompletePage() {
  const router = useRouter()
  const { track } = useAnalytics()
  const [titleDone, setTitleDone] = useState(false)

  useEffect(() => {
    track('page_view', { page: 'tutorial_complete' })
  }, [track])

  return (
    <div className="min-h-screen bg-ops-background flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-ops-large-title font-mohave font-bold tracking-wide mb-4">
          <TypewriterText
            text="NOW LET'S MAKE IT REAL."
            typingSpeed={40}
            onComplete={() => setTitleDone(true)}
          />
        </h1>

        <PhasedContent delay={1200}>
          <p className="font-kosugi text-ops-body text-ops-text-secondary mb-12">
            Set up your company and start managing real projects.
          </p>
        </PhasedContent>

        <PhasedContent delay={1800}>
          <Button variant="primary" onClick={() => router.push('/signup/credentials')} className="w-full">
            CREATE YOUR ACCOUNT
          </Button>
        </PhasedContent>
      </div>
    </div>
  )
}

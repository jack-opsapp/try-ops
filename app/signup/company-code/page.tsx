'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TypewriterText } from '@/components/ui/TypewriterText'
import { OPSButton } from '@/components/ui/OPSButton'
import { PhasedContent } from '@/components/ui/PhasedContent'
import { OnboardingScaffold } from '@/components/layout/OnboardingScaffold'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { useAnalytics } from '@/lib/hooks/useAnalytics'

export default function CompanyCodePage() {
  const router = useRouter()
  const { trackSignupStepView, trackSignupStepComplete } = useAnalytics()
  const { userId, companyName, companyCode, companyId, setSignupStep } =
    useOnboardingStore()

  const [copied, setCopied] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)

  useEffect(() => {
    if (!userId) {
      router.push('/signup/credentials')
      return
    }
    setSignupStep(5)
    trackSignupStepView('company-code', 5)
  }, [userId, router, setSignupStep, trackSignupStepView])

  const handleCopy = async () => {
    if (!companyCode) return
    try {
      await navigator.clipboard.writeText(companyCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers that don't support clipboard API
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !companyId) return

    setInviteSending(true)
    try {
      await fetch('/api/company/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: [inviteEmail.trim()],
          company: companyId,
        }),
      })
      setInviteSuccess(true)
      setInviteEmail('')
      setTimeout(() => setInviteSuccess(false), 3000)
    } catch {
      // Silently fail invite - non-critical
    } finally {
      setInviteSending(false)
    }
  }

  const handleContinue = () => {
    trackSignupStepComplete('company-code', 5)
    router.push('/signup/ready')
  }

  return (
    <OnboardingScaffold showBack>
      <div className="max-w-md mx-auto w-full">
        <h1 className="text-ops-title font-mohave font-semibold tracking-wide mb-2">
          <TypewriterText text="YOU'RE SET UP." typingSpeed={30} />
        </h1>

        <PhasedContent delay={600}>
          <p className="font-kosugi text-ops-body text-ops-text-secondary mb-10">
            {companyName
              ? `${companyName} is ready.`
              : 'Your company is ready.'}
          </p>
        </PhasedContent>

        <PhasedContent delay={1000}>
          <div className="space-y-6">
            {/* Crew code display */}
            {companyCode && (
              <div className="bg-ops-card rounded-ops border border-white/10 p-6 text-center">
                <p className="font-kosugi text-ops-caption text-ops-text-secondary uppercase tracking-wider mb-3">
                  YOUR CREW CODE
                </p>
                <button
                  onClick={handleCopy}
                  className="group"
                >
                  <p className="font-mohave text-4xl font-bold tracking-[0.3em] text-white mb-2">
                    {companyCode}
                  </p>
                  <p className="font-kosugi text-ops-small text-ops-text-tertiary group-hover:text-ops-accent transition-colors">
                    {copied ? 'Copied!' : 'Tap to copy'}
                  </p>
                </button>
              </div>
            )}

            {/* Invite crew button */}
            <OPSButton
              variant="secondary"
              onClick={() => setShowInvite(!showInvite)}
            >
              INVITE CREW
            </OPSButton>

            {/* Invite modal */}
            {showInvite && (
              <div className="bg-ops-card rounded-ops border border-white/10 p-4 space-y-3">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="crew@email.com"
                  className="w-full h-12 px-4 rounded-ops bg-ops-background font-mohave text-ops-body text-white border border-white/10 outline-none focus:border-ops-accent placeholder:text-ops-text-tertiary"
                />
                <OPSButton
                  onClick={handleInvite}
                  loading={inviteSending}
                  disabled={!inviteEmail.trim()}
                >
                  {inviteSuccess ? 'SENT!' : 'SEND INVITE'}
                </OPSButton>
              </div>
            )}

            <OPSButton onClick={handleContinue}>CONTINUE</OPSButton>
          </div>
        </PhasedContent>
      </div>
    </OnboardingScaffold>
  )
}

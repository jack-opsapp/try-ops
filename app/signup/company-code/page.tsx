'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingScaffold } from '@/components/layout/OnboardingScaffold'
import { PhasedOnboardingHeader } from '@/components/ui/PhasedOnboardingHeader'
import { PhasedContent } from '@/components/ui/PhasedContent'
import { PhasedLabel } from '@/components/ui/PhasedLabel'
import { PhasedPrimaryButton } from '@/components/ui/PhasedPrimaryButton'
import { useOnboardingAnimation } from '@/lib/hooks/useOnboardingAnimation'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { useAnalytics } from '@/lib/hooks/useAnalytics'

export default function CompanyCodePage() {
  const router = useRouter()
  const { trackSignupStepView, trackSignupStepComplete } = useAnalytics()
  const { userId, companyName, companyCode, companyId, setSignupStep } =
    useOnboardingStore()
  const animation = useOnboardingAnimation()

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
    animation.start()
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
    <OnboardingScaffold>
      {/* Title — iOS: .padding(.horizontal, 40) .padding(.top, 60) */}
      <div className="px-10 pt-[60px]">
        <PhasedOnboardingHeader
          title="YOU'RE SET UP."
          subtitle={companyName ? `${companyName} is ready.` : 'Your company is ready.'}
          animation={animation}
        />
      </div>

      {/* Spacer — iOS: Spacer().frame(height: 48) */}
      <div className="h-12" />

      {/* Content — fades in upward during contentFadeIn */}
      <PhasedContent animation={animation}>
        <div className="px-10 space-y-0">
          {/* Crew Code Section — iOS: VStack(alignment: .leading, spacing: 16) */}
          <div className="flex flex-col gap-4">
            <PhasedLabel text="CREW CODE" index={0} isLast animation={animation} />

            {/* Code display — iOS: Button with [CODE] in captionBold */}
            {companyCode && (
              <button onClick={handleCopy} className="w-full group">
                <div
                  className="p-4 rounded-ops border transition-colors"
                  style={{
                    backgroundColor: 'rgba(13, 13, 13, 0.8)',
                    borderColor: copied
                      ? 'rgba(165, 179, 104, 0.5)'
                      : 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    {/* iOS: Text("[CODE]").font(captionBold) — Kosugi Bold 14pt */}
                    <span
                      className="font-kosugi font-bold text-ops-caption transition-colors"
                      style={{
                        color: copied ? '#A5B368' : '#F5F5F5',
                      }}
                    >
                      {copied ? 'CODE COPIED' : `[${companyCode}]`}
                    </span>

                    {/* iOS: Text("TAP TO COPY CODE").font(.system(size: 10, weight: .medium, design: .monospaced)) */}
                    <span
                      className="transition-opacity"
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '10px',
                        fontWeight: 500,
                        color: '#777777',
                        opacity: copied ? 0 : 1,
                      }}
                    >
                      TAP TO COPY CODE
                    </span>
                  </div>
                </div>
              </button>
            )}

            {/* iOS: "Share this with your crew so they can join." */}
            <p className="font-kosugi text-ops-caption text-ops-text-tertiary">
              Share this with your crew so they can join.
            </p>
          </div>

          {/* Spacer — iOS: Spacer().frame(height: 32) */}
          <div className="h-8" />

          {/* Invite Crew Button — iOS: secondary button with person.2 icon */}
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="w-full h-14 flex items-center justify-center gap-2 rounded-ops border border-white/10"
            style={{ backgroundColor: 'rgba(13, 13, 13, 0.8)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-mohave font-bold text-ops-body text-white">
              INVITE CREW
            </span>
          </button>

          {/* Invite modal */}
          {showInvite && (
            <div className="bg-[#0D0D0D]/60 rounded-ops border border-white/20 p-4 space-y-3 mt-4">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="crew@email.com"
                className="w-full h-12 px-4 rounded-ops bg-[#0D0D0D]/60 font-mohave text-ops-body text-white border border-white/20 outline-none focus:border-white/40 placeholder:text-ops-text-tertiary"
              />
              <button
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || inviteSending}
                className="w-full h-14 rounded-ops bg-white text-black font-mohave font-semibold text-ops-body disabled:opacity-40"
              >
                {inviteSuccess ? 'SENT!' : inviteSending ? 'SENDING...' : 'SEND INVITE'}
              </button>
            </div>
          )}
        </div>
      </PhasedContent>

      {/* Spacer — pushes button to bottom */}
      <div className="flex-1" />

      {/* Info text — iOS: "You'll find this code in Settings anytime." */}
      <p className="px-10 font-kosugi text-ops-caption text-ops-text-tertiary pb-6">
        You&apos;ll find this code in Settings anytime.
      </p>

      {/* Button — iOS: PhasedPrimaryButton("LET'S GO") */}
      <PhasedPrimaryButton
        title="LET'S GO"
        animation={animation}
        onClick={handleContinue}
      />
    </OnboardingScaffold>
  )
}

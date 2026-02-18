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

export default function ProfilePage() {
  const router = useRouter()
  const { trackSignupStepView, trackSignupStepComplete } = useAnalytics()
  const store = useOnboardingStore()
  const { userId, setProfile, setSignupStep } = store
  const animation = useOnboardingAnimation()

  const [firstName, setFirstName] = useState(store.firstName || '')
  const [lastName, setLastName] = useState(store.lastName || '')
  const [phone, setPhone] = useState(store.phone || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) {
      router.push('/signup/credentials')
      return
    }
    setSignupStep(2)
    trackSignupStepView('profile', 2)
    animation.start()
  }, [userId, router, setSignupStep, trackSignupStepView])

  const handleContinue = async () => {
    if (!firstName.trim() || !lastName.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/user/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameFirst: firstName.trim(),
          nameLast: lastName.trim(),
          phone: phone.trim() || undefined,
          userType: 'Company',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save profile')
        setLoading(false)
        return
      }

      setProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      })
      trackSignupStepComplete('profile', 2)
      router.push('/signup/company-setup')
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingScaffold showBack>
      {/* Title — iOS: .padding(.horizontal, 40) .padding(.top, 16) */}
      <div className="px-10 pt-4">
        <PhasedOnboardingHeader
          title="YOUR INFO"
          subtitle="Your crew will see this."
          animation={animation}
        />
      </div>

      {/* Spacer — iOS: Spacer().frame(height: 32) */}
      <div className="h-8" />

      {/* Content — fades in upward during contentFadeIn */}
      <PhasedContent animation={animation}>
        <div className="px-10 space-y-5">
          {/* First Name */}
          <div className="flex flex-col gap-2">
            <PhasedLabel text="FIRST NAME" index={0} animation={animation} />
            <input
              type="text"
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); setError('') }}
              autoComplete="given-name"
              className="w-full h-12 px-4 rounded-ops bg-ops-surface font-mohave text-ops-body text-ops-text-primary border border-ops-border outline-none placeholder:text-ops-text-tertiary"
            />
          </div>

          {/* Last Name */}
          <div className="flex flex-col gap-2">
            <PhasedLabel text="LAST NAME" index={1} animation={animation} />
            <input
              type="text"
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); setError('') }}
              autoComplete="family-name"
              className="w-full h-12 px-4 rounded-ops bg-ops-surface font-mohave text-ops-body text-ops-text-primary border border-ops-border outline-none placeholder:text-ops-text-tertiary"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-2">
            <PhasedLabel text="PHONE" index={2} isLast animation={animation} />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              placeholder="(555) 123-4567"
              className="w-full h-12 px-4 rounded-ops bg-ops-surface font-mohave text-ops-body text-ops-text-primary border border-ops-border outline-none placeholder:text-ops-text-tertiary"
            />
          </div>

          {error && (
            <p className="font-kosugi text-ops-small text-ops-error text-center">
              {error}
            </p>
          )}
        </div>
      </PhasedContent>

      {/* Spacer — pushes button to bottom */}
      <div className="flex-1" />

      {/* Button — iOS: PhasedPrimaryButton .padding(.horizontal, 40) .padding(.bottom, 50) */}
      <PhasedPrimaryButton
        title="CONTINUE"
        isEnabled={!!firstName.trim() && !!lastName.trim()}
        isLoading={loading}
        loadingText="SAVING..."
        animation={animation}
        onClick={handleContinue}
      />
    </OnboardingScaffold>
  )
}

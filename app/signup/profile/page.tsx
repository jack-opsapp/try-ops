'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TypewriterText } from '@/components/ui/TypewriterText'
import { OPSButton } from '@/components/ui/OPSButton'
import { OPSInput } from '@/components/ui/OPSInput'
import { PhasedContent } from '@/components/ui/PhasedContent'
import { OnboardingScaffold } from '@/components/layout/OnboardingScaffold'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { useAnalytics } from '@/lib/hooks/useAnalytics'

export default function ProfilePage() {
  const router = useRouter()
  const { trackSignupStepView, trackSignupStepComplete } = useAnalytics()
  const store = useOnboardingStore()
  const { userId, setProfile, setSignupStep } = store

  // Pre-fill from store if Google sign-in already set these
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
      <div className="max-w-md mx-auto w-full">
        <h1 className="text-ops-title font-mohave font-semibold tracking-wide mb-2">
          <TypewriterText text="YOUR INFO" typingSpeed={30} />
        </h1>

        <PhasedContent delay={500}>
          <p className="font-kosugi text-ops-body text-ops-text-secondary mb-8">
            Your crew will see this.
          </p>
        </PhasedContent>

        <PhasedContent delay={900}>
          <div className="space-y-4">
            <OPSInput
              label="First Name"
              value={firstName}
              onChange={(v) => {
                setFirstName(v)
                setError('')
              }}
              placeholder="John"
              required
              autoComplete="given-name"
            />

            <OPSInput
              label="Last Name"
              value={lastName}
              onChange={(v) => {
                setLastName(v)
                setError('')
              }}
              placeholder="Smith"
              required
              autoComplete="family-name"
            />

            <OPSInput
              label="Phone"
              type="tel"
              value={phone}
              onChange={setPhone}
              placeholder="(555) 123-4567"
              autoComplete="tel"
            />

            {error && (
              <p className="font-kosugi text-ops-small text-ops-error text-center">
                {error}
              </p>
            )}

            <OPSButton
              onClick={handleContinue}
              loading={loading}
              loadingText="SAVING..."
              disabled={!firstName.trim() || !lastName.trim()}
            >
              CONTINUE
            </OPSButton>
          </div>
        </PhasedContent>
      </div>
    </OnboardingScaffold>
  )
}

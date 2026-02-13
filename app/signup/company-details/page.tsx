'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingScaffold } from '@/components/layout/OnboardingScaffold'
import { PhasedOnboardingHeader } from '@/components/ui/PhasedOnboardingHeader'
import { PhasedContent } from '@/components/ui/PhasedContent'
import { PhasedLabel } from '@/components/ui/PhasedLabel'
import { PhasedPrimaryButton } from '@/components/ui/PhasedPrimaryButton'
import { IndustryPicker } from '@/components/signup/IndustryPicker'
import { PillSelector } from '@/components/signup/PillSelector'
import { useOnboardingAnimation } from '@/lib/hooks/useOnboardingAnimation'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { COMPANY_SIZES, COMPANY_AGES } from '@/lib/constants/industries'

export default function CompanyDetailsPage() {
  const router = useRouter()
  const { trackSignupStepView, trackSignupStepComplete } = useAnalytics()
  const {
    userId,
    firstName,
    lastName,
    phone,
    companyName,
    companyEmail,
    companyPhone,
    setCompanyDetails,
    setCompanyId,
    setCompanyCode,
    setSignupStep,
  } = useOnboardingStore()
  const animation = useOnboardingAnimation()

  const [industry, setIndustry] = useState('')
  const [customIndustry, setCustomIndustry] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [companyAge, setCompanyAge] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) {
      router.push('/signup/credentials')
      return
    }
    setSignupStep(4)
    trackSignupStepView('company-details', 4)
    animation.start()
  }, [userId, router, setSignupStep, trackSignupStepView])

  const effectiveIndustry =
    industry === 'Other' ? customIndustry.trim() || 'Other' : industry

  const handleContinue = async () => {
    if (!industry || !companySize || !companyAge) return
    if (industry === 'Other' && !customIndustry.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/company/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: companyName,
          email: companyEmail || '',
          phone: companyPhone || undefined,
          industry: effectiveIndustry,
          size: companySize,
          age: companyAge,
          address: '',
          user: userId,
          name_first: firstName,
          name_last: lastName,
          user_phone: phone || '',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to save company details')
        setLoading(false)
        return
      }

      if (data.companyId) setCompanyId(data.companyId)
      if (data.companyCode) setCompanyCode(data.companyCode)

      setCompanyDetails({
        industry: effectiveIndustry,
        size: companySize,
        age: companyAge,
      })
      trackSignupStepComplete('company-details', 4)
      router.push('/signup/company-code')
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/company/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: companyName,
          email: companyEmail || '',
          phone: companyPhone || undefined,
          industry: '',
          size: '',
          age: '',
          address: '',
          user: userId,
          name_first: firstName,
          name_last: lastName,
          user_phone: phone || '',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to save company')
        setLoading(false)
        return
      }
      if (data.companyId) setCompanyId(data.companyId)
      if (data.companyCode) setCompanyCode(data.companyCode)
      trackSignupStepComplete('company-details', 4)
      router.push('/signup/company-code')
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isValid =
    industry &&
    companySize &&
    companyAge &&
    (industry !== 'Other' || customIndustry.trim())

  return (
    <OnboardingScaffold showBack>
      {/* Title — iOS: .padding(.horizontal, 40) .padding(.top, 16) */}
      <div className="px-10 pt-4">
        <PhasedOnboardingHeader
          title="ALMOST DONE"
          subtitle="Quick details to set you up right."
          animation={animation}
        />
      </div>

      {/* Spacer — iOS: Spacer().frame(height: 32) */}
      <div className="h-8" />

      {/* Content — fades in upward during contentFadeIn */}
      <PhasedContent animation={animation}>
        <div className="px-10 space-y-6">
          <div>
            <PhasedLabel text="INDUSTRY" index={0} animation={animation} />
            <div className="mt-2">
              <IndustryPicker
                value={industry}
                onChange={setIndustry}
                customIndustry={customIndustry}
                onCustomChange={setCustomIndustry}
              />
            </div>
          </div>

          <div>
            <PhasedLabel text="COMPANY SIZE" index={1} animation={animation} />
            <div className="mt-2">
              <PillSelector
                label=""
                options={COMPANY_SIZES}
                value={companySize}
                onChange={setCompanySize}
              />
            </div>
          </div>

          <div>
            <PhasedLabel text="YEARS IN BUSINESS" index={2} isLast animation={animation} />
            <div className="mt-2">
              <PillSelector
                label=""
                options={COMPANY_AGES}
                value={companyAge}
                onChange={setCompanyAge}
              />
            </div>
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

      {/* Skip link */}
      <button
        onClick={handleSkip}
        disabled={loading}
        className="font-kosugi text-ops-caption text-ops-text-tertiary hover:text-ops-text-secondary transition-colors pb-2 disabled:opacity-40"
      >
        SKIP FOR NOW
      </button>

      {/* Button — iOS: PhasedPrimaryButton .padding(.horizontal, 40) .padding(.bottom, 50) */}
      <PhasedPrimaryButton
        title="CONTINUE"
        isEnabled={!!isValid}
        isLoading={loading}
        loadingText="SAVING..."
        animation={animation}
        onClick={handleContinue}
      />
    </OnboardingScaffold>
  )
}

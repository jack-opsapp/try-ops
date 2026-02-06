'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TypewriterText } from '@/components/ui/TypewriterText'
import { OPSButton } from '@/components/ui/OPSButton'
import { PhasedContent } from '@/components/ui/PhasedContent'
import { OnboardingScaffold } from '@/components/layout/OnboardingScaffold'
import { IndustryPicker } from '@/components/signup/IndustryPicker'
import { PillSelector } from '@/components/signup/PillSelector'
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
          email: companyEmail || undefined,
          phone: companyPhone || undefined,
          industry: effectiveIndustry,
          size: companySize,
          age: companyAge,
          user: userId,
          name_first: firstName,
          name_last: lastName,
          user_phone: phone || undefined,
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

  const isValid =
    industry &&
    companySize &&
    companyAge &&
    (industry !== 'Other' || customIndustry.trim())

  return (
    <OnboardingScaffold showBack>
      <div className="max-w-md mx-auto w-full">
        <h1 className="text-ops-title font-mohave font-semibold tracking-wide mb-2">
          <TypewriterText text="ALMOST DONE" typingSpeed={30} />
        </h1>

        <PhasedContent delay={500}>
          <p className="font-kosugi text-ops-body text-ops-text-secondary mb-8">
            Quick details to set you up right.
          </p>
        </PhasedContent>

        <PhasedContent delay={900}>
          <div className="space-y-6">
            <IndustryPicker
              value={industry}
              onChange={setIndustry}
              customIndustry={customIndustry}
              onCustomChange={setCustomIndustry}
            />

            <PillSelector
              label="COMPANY SIZE"
              options={COMPANY_SIZES}
              value={companySize}
              onChange={setCompanySize}
            />

            <PillSelector
              label="YEARS IN BUSINESS"
              options={COMPANY_AGES}
              value={companyAge}
              onChange={setCompanyAge}
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
              disabled={!isValid}
            >
              CONTINUE
            </OPSButton>
          </div>
        </PhasedContent>
      </div>
    </OnboardingScaffold>
  )
}

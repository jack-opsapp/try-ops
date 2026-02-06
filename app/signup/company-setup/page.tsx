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

export default function CompanySetupPage() {
  const router = useRouter()
  const { trackSignupStepView, trackSignupStepComplete } = useAnalytics()
  const { userId, setCompanyBasic, setSignupStep } = useOnboardingStore()

  const [companyName, setCompanyName] = useState('')
  const [officeEmail, setOfficeEmail] = useState('')
  const [officePhone, setOfficePhone] = useState('')

  useEffect(() => {
    if (!userId) {
      router.push('/signup/credentials')
      return
    }
    setSignupStep(3)
    trackSignupStepView('company-setup', 3)
  }, [userId, router, setSignupStep, trackSignupStepView])

  const handleContinue = () => {
    if (!companyName.trim()) return

    setCompanyBasic({
      name: companyName.trim(),
      email: officeEmail.trim(),
      phone: officePhone.trim(),
    })
    trackSignupStepComplete('company-setup', 3)
    router.push('/signup/company-details')
  }

  return (
    <OnboardingScaffold showBack>
      <div className="max-w-md mx-auto w-full">
        <h1 className="text-ops-title font-mohave font-semibold tracking-wide mb-2">
          <TypewriterText text="YOUR COMPANY" typingSpeed={30} />
        </h1>

        <PhasedContent delay={600}>
          <p className="font-kosugi text-ops-body text-ops-text-secondary mb-8">
            This is how you&apos;ll appear to your crew.
          </p>
        </PhasedContent>

        <PhasedContent delay={1000}>
          <div className="space-y-4">
            <OPSInput
              label="Company Name"
              value={companyName}
              onChange={setCompanyName}
              placeholder="Your company name"
              required
              autoComplete="organization"
            />

            <OPSInput
              label="Office Email"
              type="email"
              value={officeEmail}
              onChange={setOfficeEmail}
              placeholder="office@company.com"
              autoComplete="email"
            />

            <OPSInput
              label="Office Phone"
              type="tel"
              value={officePhone}
              onChange={setOfficePhone}
              placeholder="(555) 123-4567"
              autoComplete="tel"
            />

            <OPSButton
              onClick={handleContinue}
              disabled={!companyName.trim()}
            >
              CONTINUE
            </OPSButton>
          </div>
        </PhasedContent>
      </div>
    </OnboardingScaffold>
  )
}

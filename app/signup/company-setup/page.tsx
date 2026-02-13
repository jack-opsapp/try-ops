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

export default function CompanySetupPage() {
  const router = useRouter()
  const { trackSignupStepView, trackSignupStepComplete } = useAnalytics()
  const { userId, email: userEmail, phone: userPhone, setCompanyBasic, setSignupStep } =
    useOnboardingStore()
  const animation = useOnboardingAnimation()

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
    animation.start()
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

  // iOS: "Use mine" shows when user email/phone exists and differs from field
  const showUseMyEmail = !!userEmail && officeEmail !== userEmail
  const showUseMyPhone = !!userPhone && officePhone !== userPhone

  return (
    <OnboardingScaffold showBack>
      {/* Title — iOS: .padding(.horizontal, 40) .padding(.top, 16) */}
      <div className="px-10 pt-4">
        <PhasedOnboardingHeader
          title="YOUR COMPANY"
          subtitle="This is how you'll appear to your crew."
          animation={animation}
        />
      </div>

      {/* Spacer — iOS: Spacer().frame(height: 32) */}
      <div className="h-8" />

      {/* Content — fades in upward during contentFadeIn */}
      <PhasedContent animation={animation}>
        <div className="px-10 space-y-5">
          {/* Company Name — iOS: index 1 (index 0 is logo label) */}
          <div className="flex flex-col gap-2">
            <PhasedLabel text="COMPANY NAME" index={0} animation={animation} />
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              autoComplete="organization"
              className="w-full h-12 px-4 rounded-ops bg-[#0D0D0D]/80 font-mohave text-ops-body text-white border border-white/10 outline-none placeholder:text-ops-text-tertiary"
            />
          </div>

          {/* Office Email — iOS: HStack { PhasedLabel + Spacer + "Use mine" } */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <PhasedLabel text="OFFICE EMAIL" index={1} animation={animation} />
              {showUseMyEmail && (
                <button
                  type="button"
                  onClick={() => setOfficeEmail(userEmail)}
                  className="font-kosugi text-ops-caption text-ops-accent hover:text-ops-accent/80 transition-colors"
                >
                  Use mine
                </button>
              )}
            </div>
            <input
              type="email"
              value={officeEmail}
              onChange={(e) => setOfficeEmail(e.target.value)}
              autoComplete="email"
              className="w-full h-12 px-4 rounded-ops bg-[#0D0D0D]/80 font-mohave text-ops-body text-white border border-white/10 outline-none placeholder:text-ops-text-tertiary"
            />
          </div>

          {/* Office Phone — iOS: HStack { PhasedLabel(isLast: true) + Spacer + "Use mine" } */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <PhasedLabel text="OFFICE PHONE" index={2} isLast animation={animation} />
              {showUseMyPhone && (
                <button
                  type="button"
                  onClick={() => setOfficePhone(userPhone)}
                  className="font-kosugi text-ops-caption text-ops-accent hover:text-ops-accent/80 transition-colors"
                >
                  Use mine
                </button>
              )}
            </div>
            <input
              type="tel"
              value={officePhone}
              onChange={(e) => setOfficePhone(e.target.value)}
              autoComplete="tel"
              placeholder="(555) 123-4567"
              className="w-full h-12 px-4 rounded-ops bg-[#0D0D0D]/80 font-mohave text-ops-body text-white border border-white/10 outline-none placeholder:text-ops-text-tertiary"
            />
          </div>
        </div>
      </PhasedContent>

      {/* Spacer — pushes button to bottom */}
      <div className="flex-1" />

      {/* Button — iOS: PhasedPrimaryButton .padding(.horizontal, 40) .padding(.bottom, 50) */}
      <PhasedPrimaryButton
        title="CONTINUE"
        isEnabled={!!companyName.trim()}
        animation={animation}
        onClick={handleContinue}
      />
    </OnboardingScaffold>
  )
}

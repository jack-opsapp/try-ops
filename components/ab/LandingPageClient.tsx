'use client'

import { useEffect, useCallback } from 'react'
import { MotionConfig } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { isMobile } from '@/lib/utils/device-detection'

import { HamburgerMenu } from '@/components/landing/HamburgerMenu'
import { StickyCTA } from '@/components/landing/StickyCTA'
import { Footer } from '@/components/landing/Footer'
import { SectionTracker } from '@/components/ab/SectionTracker'
import { SECTION_REGISTRY } from '@/lib/ab/registry'
import { sendDiagnostic } from '@/lib/ab/client-events'
import { trackABClick } from '@/lib/ab/track-click'
import { getTutorialRoute } from '@/lib/utils/tutorial-routes'
import { CtaModeProvider, WEB_SIGNUP_URL, type CtaMode } from '@/lib/landing/cta-mode'
import type { VariantConfig } from '@/lib/ab/types'

const APP_STORE_URL = 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078'

interface Props {
  config: VariantConfig
  variantId: string
  assignmentId?: string
  /**
   * `app-store` is the organic page. `web-signup` is a paid landing page: one
   * CTA, straight to the web signup, no tutorial detour and no second choice.
   */
  ctaMode?: CtaMode
}

export function LandingPageClient({ config, variantId, assignmentId, ctaMode = 'web-signup' }: Props) {
  const webSignup = ctaMode === 'web-signup'
  const router = useRouter()
  const { trackLandingPageView } = useAnalytics()
  const setUTMData = useOnboardingStore((s) => s.setUTMData)
  const setTutorialStartTime = useOnboardingStore((s) => s.setTutorialStartTime)

  // Capture UTM params, fire page_view to A/B event API, and fire GA page view
  useEffect(() => {
    try {
      sessionStorage.setItem('ops_ab_variant',variantId)
      if(assignmentId)sessionStorage.setItem('ops_ab_assignment',assignmentId)
      else sessionStorage.removeItem('ops_ab_assignment')
    }catch{}

    const params = new URLSearchParams(window.location.search)
    const utmSource = params.get('utm_source')
    const utmMedium = params.get('utm_medium')
    const utmCampaign = params.get('utm_campaign')
    const utmContent = params.get('utm_content')
    const utmTerm = params.get('utm_term')
    const referrer = document.referrer || null

    // Persist UTMs into onboarding store (used downstream in signup flow)
    setUTMData({
      source: utmSource,
      medium: utmMedium,
      campaign: utmCampaign,
      content: utmContent,
      term: utmTerm,
      referrer,
      landingPage: window.location.pathname,
    })

    // GA landing page view
    trackLandingPageView({
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_term: utmTerm,
      utm_content: utmContent,
    })

    sendDiagnostic(variantId,assignmentId,'page_view')
    let exposed=false
    const expose=()=>{if(!exposed&&assignmentId&&document.visibilityState==='visible'){exposed=true;sendDiagnostic(variantId,assignmentId,'exposure')}}
    expose();document.addEventListener('visibilitychange',expose)
    return ()=>document.removeEventListener('visibilitychange',expose)
  }, [variantId, assignmentId, setUTMData, trackLandingPageView])

  // ── CTA handlers ──────────────────────────────────────────────────────────

  const handleDownloadClick = useCallback(() => {
    trackABClick('HamburgerMenu', webSignup ? 'signup_btn' : 'download_btn')
    if (webSignup) {
      window.location.href = WEB_SIGNUP_URL
    } else if (isMobile()) {
      window.location.href = APP_STORE_URL
    } else {
      window.location.href = APP_STORE_URL
    }
  }, [webSignup])

  const handleTryClick = useCallback(() => {
    trackABClick('HamburgerMenu', 'try_btn')
    setTutorialStartTime(Date.now())
    const variant = document.cookie.split(';').find(c => c.trim().startsWith('ops_variant='))?.split('=')[1]?.trim() || 'a'
    router.push(getTutorialRoute(variant))
  }, [setTutorialStartTime, router])

  const handleStickyDownloadClick = useCallback(() => {
    trackABClick('StickyCTA', webSignup ? 'signup_btn' : 'download_btn')
    if (webSignup) {
      window.location.href = WEB_SIGNUP_URL
    } else if (isMobile()) {
      window.location.href = APP_STORE_URL
    } else {
      window.location.href = APP_STORE_URL
    }
  }, [webSignup])

  const handleStickyTryClick = useCallback(() => {
    trackABClick('StickyCTA', 'try_btn')
    setTutorialStartTime(Date.now())
    const variant = document.cookie.split(';').find(c => c.trim().startsWith('ops_variant='))?.split('=')[1]?.trim() || 'a'
    router.push(getTutorialRoute(variant))
  }, [setTutorialStartTime, router])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    // globals.css already zeroes CSS animations under prefers-reduced-motion,
    // but Framer animates inline in JS and never saw that rule. `reducedMotion
    // = "user"` is what actually honours the setting on these pages.
    <MotionConfig reducedMotion="user">
    <CtaModeProvider mode={ctaMode}>
    <main className="landing-page">
      <HamburgerMenu
        onDownloadClick={handleDownloadClick}
        onTryClick={webSignup ? undefined : handleTryClick}
      />

      <StickyCTA
        onDownloadClick={handleStickyDownloadClick}
        onTryClick={webSignup ? undefined : handleStickyTryClick}
        primaryLabel={webSignup ? 'START MY FREE TRIAL' : undefined}
      />

      {config.sections.map((section, i) => {
        const Component = SECTION_REGISTRY[section.type]
        const isInterstitial = section.type === 'InlineSignupForm' || section.type === 'Starburst' || section.type === 'FounderQuote'
        return (
          <SectionTracker
            key={`${section.type}-${i}`}
            sectionName={section.type}
            variantId={variantId}
            assignmentId={assignmentId}
            isInterstitial={isInterstitial}
          >
            {i > 0 && !isInterstitial && (
              <div className="border-t border-ops-border-emphasis mx-6 md:mx-6 lg:mx-10" />
            )}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Component {...(section.props as any)} />
          </SectionTracker>
        )
      })}

      <Footer />
    </main>
    </CtaModeProvider>
    </MotionConfig>
  )
}

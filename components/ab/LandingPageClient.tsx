'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { isMobile } from '@/lib/utils/device-detection'

import { HamburgerMenu } from '@/components/landing/HamburgerMenu'
import { StickyCTA } from '@/components/landing/StickyCTA'
import { Footer } from '@/components/landing/Footer'
import { SectionTracker } from '@/components/ab/SectionTracker'
import { SECTION_REGISTRY } from '@/lib/ab/registry'
import type { VariantConfig } from '@/lib/ab/types'

const APP_STORE_URL = 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078'

interface Props {
  config: VariantConfig
  variantId: string
}

export function LandingPageClient({ config, variantId }: Props) {
  const router = useRouter()
  const { trackLandingPageView } = useAnalytics()
  const setUTMData = useOnboardingStore((s) => s.setUTMData)
  const setTutorialStartTime = useOnboardingStore((s) => s.setTutorialStartTime)

  // Capture UTM params, fire page_view to A/B event API, and fire GA page view
  useEffect(() => {
    // Resolve session ID inline to avoid race with a separate useEffect
    const existingId = sessionStorage.getItem('ops_ab_session')
    const sid = existingId ?? crypto.randomUUID()
    if (!existingId) sessionStorage.setItem('ops_ab_session', sid)

    // Persist variantId so signup flow can attribute the conversion
    sessionStorage.setItem('ops_ab_variant', variantId)

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

    // A/B event: page_view
    const deviceType = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
    fetch('/api/ab-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        variant_id: variantId,
        session_id: sid,
        event_type: 'page_view',
        device_type: deviceType,
        referrer,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
      }),
    }).catch(() => {}) // fire-and-forget
  }, [variantId, setUTMData, trackLandingPageView])

  // ── CTA handlers ──────────────────────────────────────────────────────────

  const handleDownloadClick = useCallback(() => {
    if (isMobile()) {
      window.location.href = APP_STORE_URL
    } else {
      document.getElementById('desktop-download')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const handleTryClick = useCallback(() => {
    setTutorialStartTime(Date.now())
    router.push('/tutorial-intro')
  }, [setTutorialStartTime, router])

  const handleStickyDownloadClick = useCallback(() => {
    if (isMobile()) {
      window.location.href = APP_STORE_URL
    } else {
      document.getElementById('desktop-download')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const handleStickyTryClick = useCallback(() => {
    setTutorialStartTime(Date.now())
    router.push('/tutorial-intro')
  }, [setTutorialStartTime, router])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="relative bg-ops-background min-h-screen snap-y snap-mandatory overflow-y-auto overflow-x-hidden h-screen md:h-auto md:overflow-visible md:snap-none">
      {/* Ambient edge glows */}
      <div className="pointer-events-none fixed inset-0 z-[990]">
        <div className="absolute -top-[200px] -left-[200px] w-[600px] h-[600px] rounded-full bg-ops-accent/[0.04] blur-[120px]" />
        <div className="absolute -top-[100px] -right-[200px] w-[500px] h-[500px] rounded-full bg-ops-accent/[0.03] blur-[100px]" />
        <div className="absolute -bottom-[200px] -left-[100px] w-[500px] h-[500px] rounded-full bg-ops-accent/[0.03] blur-[100px]" />
        <div className="absolute -bottom-[100px] -right-[200px] w-[400px] h-[400px] rounded-full bg-ops-accent/[0.04] blur-[120px]" />
      </div>

      {/* Noise texture overlay */}
      <div className="noise-overlay">
        <svg>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.80" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      <HamburgerMenu
        onDownloadClick={handleDownloadClick}
        onTryClick={handleTryClick}
      />

      <StickyCTA
        onDownloadClick={handleStickyDownloadClick}
        onTryClick={handleStickyTryClick}
      />

      {config.sections.map((section, i) => {
        const Component = SECTION_REGISTRY[section.type]
        return (
          <SectionTracker
            key={`${section.type}-${i}`}
            sectionName={section.type}
            variantId={variantId}
          >
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Component {...(section.props as any)} />
          </SectionTracker>
        )
      })}

      <Footer />
    </main>
  )
}

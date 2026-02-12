'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { isMobile } from '@/lib/utils/device-detection'

import { HamburgerMenu } from '@/components/landing/HamburgerMenu'
import { Hero } from '@/components/landing/Hero'
import { DesktopDownload } from '@/components/landing/DesktopDownload'
import { PainSection } from '@/components/landing/PainSection'
import { SolutionSection } from '@/components/landing/SolutionSection'
import { RoadmapSection } from '@/components/landing/RoadmapSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { ClosingCTA } from '@/components/landing/ClosingCTA'
import { Footer } from '@/components/landing/Footer'
import { StickyCTA } from '@/components/landing/StickyCTA'

const APP_STORE_URL = 'https://apps.apple.com/app/ops-app/id6503204873'

export default function LandingPage() {
  const router = useRouter()
  const {
    trackLandingPageView,
    trackLandingCTAClick,
    trackScrollDepth,
    trackSectionView,
    trackFAQInteraction,
  } = useAnalytics()
  const setTutorialStartTime = useOnboardingStore((s) => s.setTutorialStartTime)
  const setUTMData = useOnboardingStore((s) => s.setUTMData)

  const pageLoadTime = useRef(Date.now())
  const trackedDepths = useRef(new Set<number>())
  const trackedSections = useRef(new Set<string>())

  const getTimeOnPage = useCallback(() => {
    return Math.round((Date.now() - pageLoadTime.current) / 1000)
  }, [])

  const getScrollDepth = useCallback(() => {
    if (typeof window === 'undefined') return 0
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    return docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0
  }, [])

  // Capture UTM params and fire page view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const utmData = {
      source: params.get('utm_source'),
      medium: params.get('utm_medium'),
      campaign: params.get('utm_campaign'),
      content: params.get('utm_content'),
      term: params.get('utm_term'),
      referrer: document.referrer || null,
      landingPage: window.location.pathname,
    }
    setUTMData(utmData)

    trackLandingPageView({
      utm_source: utmData.source,
      utm_medium: utmData.medium,
      utm_campaign: utmData.campaign,
      utm_term: utmData.term,
      utm_content: utmData.content,
    })
  }, [setUTMData, trackLandingPageView])

  // Scroll depth tracking
  useEffect(() => {
    const milestones = [25, 50, 75, 100]
    const sectionMap: Record<string, string> = {
      hero: 'hero',
      pain: 'pain',
      solution: 'solution',
      roadmap: 'roadmap',
      pricing: 'pricing',
      faq: 'faq',
      closing: 'closing',
    }

    const handleScroll = () => {
      const depth = getScrollDepth()
      const time = getTimeOnPage()

      // Track milestones
      for (const m of milestones) {
        if (depth >= m && !trackedDepths.current.has(m)) {
          trackedDepths.current.add(m)
          let currentSection = 'hero'
          for (const id of Object.keys(sectionMap)) {
            const el = document.getElementById(id)
            if (el) {
              const rect = el.getBoundingClientRect()
              if (rect.top < window.innerHeight / 2) {
                currentSection = sectionMap[id]
              }
            }
          }
          trackScrollDepth(m, currentSection, time)
        }
      }

      // Track section views
      for (const [id, name] of Object.entries(sectionMap)) {
        if (trackedSections.current.has(id)) continue
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top < window.innerHeight * 0.8) {
            trackedSections.current.add(id)
            trackSectionView(name, time)
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [getScrollDepth, getTimeOnPage, trackScrollDepth, trackSectionView])

  const handleDownloadClick = useCallback(() => {
    trackLandingCTAClick(
      'primary',
      'DOWNLOAD FREE - iOS',
      'hero',
      getScrollDepth(),
      getTimeOnPage()
    )
    if (isMobile()) {
      window.location.href = APP_STORE_URL
    } else {
      document.getElementById('desktop-download')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [trackLandingCTAClick, getScrollDepth, getTimeOnPage])

  const handleTryClick = useCallback(() => {
    trackLandingCTAClick(
      'secondary',
      'TRY IT FIRST',
      'hero',
      getScrollDepth(),
      getTimeOnPage()
    )
    setTutorialStartTime(Date.now())
    router.push('/tutorial-intro')
  }, [trackLandingCTAClick, getScrollDepth, getTimeOnPage, setTutorialStartTime, router])

  const handleStickyDownloadClick = useCallback(() => {
    trackLandingCTAClick(
      'primary',
      'DOWNLOAD FREE - iOS',
      'sticky',
      getScrollDepth(),
      getTimeOnPage()
    )
    window.location.href = APP_STORE_URL
  }, [trackLandingCTAClick, getScrollDepth, getTimeOnPage])

  const handleClosingDownloadClick = useCallback(() => {
    trackLandingCTAClick(
      'primary',
      'DOWNLOAD FREE',
      'closing',
      getScrollDepth(),
      getTimeOnPage()
    )
    if (isMobile()) {
      window.location.href = APP_STORE_URL
    } else {
      document.getElementById('desktop-download')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [trackLandingCTAClick, getScrollDepth, getTimeOnPage])

  const handleClosingTryClick = useCallback(() => {
    trackLandingCTAClick(
      'secondary',
      'TRY IT FIRST',
      'closing',
      getScrollDepth(),
      getTimeOnPage()
    )
    setTutorialStartTime(Date.now())
    router.push('/tutorial-intro')
  }, [trackLandingCTAClick, getScrollDepth, getTimeOnPage, setTutorialStartTime, router])

  const handlePricingDownloadClick = useCallback(() => {
    trackLandingCTAClick(
      'primary',
      'DOWNLOAD NOW',
      'pricing',
      getScrollDepth(),
      getTimeOnPage()
    )
    if (isMobile()) {
      window.location.href = APP_STORE_URL
    } else {
      document.getElementById('desktop-download')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [trackLandingCTAClick, getScrollDepth, getTimeOnPage])

  const handleFAQToggle = useCallback(
    (question: string, expanded: boolean) => {
      trackFAQInteraction(question, expanded ? 'expand' : 'collapse')
    },
    [trackFAQInteraction]
  )

  return (
    <main className="bg-ops-background min-h-screen">
      <HamburgerMenu
        onDownloadClick={handleDownloadClick}
        onTryClick={handleTryClick}
      />

      <Hero
        onDownloadClick={handleDownloadClick}
        onTryClick={handleTryClick}
      />

      <DesktopDownload />

      <PainSection />

      <SolutionSection />

      <RoadmapSection />

      <PricingSection
        onDownloadClick={handlePricingDownloadClick}
      />

      <FAQSection onFAQToggle={handleFAQToggle} />

      <ClosingCTA
        onDownloadClick={handleClosingDownloadClick}
        onTryClick={handleClosingTryClick}
      />

      <Footer />

      <StickyCTA onDownloadClick={handleStickyDownloadClick} />
    </main>
  )
}

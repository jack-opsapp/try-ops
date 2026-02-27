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
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { InlineSignupForm } from '@/components/landing/InlineSignupForm'

const APP_STORE_URL = 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078'

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
    if (isMobile()) {
      window.location.href = APP_STORE_URL
    } else {
      document.getElementById('desktop-download')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [trackLandingCTAClick, getScrollDepth, getTimeOnPage])

  const handleStickyTryClick = useCallback(() => {
    trackLandingCTAClick(
      'secondary',
      'TRY IT ONLINE',
      'sticky',
      getScrollDepth(),
      getTimeOnPage()
    )
    setTutorialStartTime(Date.now())
    router.push('/tutorial-intro')
  }, [trackLandingCTAClick, getScrollDepth, getTimeOnPage, setTutorialStartTime, router])

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
    trackLandingCTAClick('primary', 'GET STARTED', 'pricing', getScrollDepth(), getTimeOnPage())
    router.push('/signup/credentials')
  }, [trackLandingCTAClick, getScrollDepth, getTimeOnPage, router])

  const handleInlineSignup = useCallback(() => {
    setTutorialStartTime(Date.now())
    router.push('/tutorial-intro')
  }, [setTutorialStartTime, router])

  const handleFAQToggle = useCallback(
    (question: string, expanded: boolean) => {
      trackFAQInteraction(question, expanded ? 'expand' : 'collapse')
    },
    [trackFAQInteraction]
  )

  return (
    <main className="relative bg-ops-background min-h-screen snap-y snap-mandatory overflow-y-auto overflow-x-hidden h-screen md:h-auto md:overflow-visible md:snap-none">
      {/* Ambient edge glows */}
      <div className="pointer-events-none fixed inset-0 z-[990]">
        {/* Top-left glow */}
        <div className="absolute -top-[200px] -left-[200px] w-[600px] h-[600px] rounded-full bg-ops-accent/[0.04] blur-[120px]" />
        {/* Top-right glow */}
        <div className="absolute -top-[100px] -right-[200px] w-[500px] h-[500px] rounded-full bg-ops-accent/[0.03] blur-[100px]" />
        {/* Bottom-left glow */}
        <div className="absolute -bottom-[200px] -left-[100px] w-[500px] h-[500px] rounded-full bg-ops-accent/[0.03] blur-[100px]" />
        {/* Bottom-right glow */}
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

      <Hero
        onDownloadClick={handleDownloadClick}
        onTryClick={handleTryClick}
      />

      <div className="border-t border-ops-border-emphasis mx-6 md:mx-6 lg:mx-10" />

      <DesktopDownload />

      <div className="border-t border-ops-border-emphasis mx-6 md:mx-6 lg:mx-10" />

      <TestimonialsSection />

      <div className="border-t border-ops-border-emphasis mx-6 md:mx-6 lg:mx-10" />

      <PainSection />

      <div className="border-t border-ops-border-emphasis mx-6 md:mx-6 lg:mx-10" />

      <SolutionSection />

      <div className="border-t border-ops-border-emphasis mx-6 md:mx-6 lg:mx-10" />

      {/* Mid-page inline signup */}
      <section className="py-20 lg:py-28 snap-start">
        <div className="max-w-[600px] mx-auto px-6 md:px-6 lg:px-10 flex flex-col items-center text-center">
          <p className="font-mohave font-medium text-[11px] text-ops-gray-400 uppercase tracking-[0.3em] mb-4">
            [ GET STARTED ]
          </p>
          <h2 className="font-mohave font-bold text-[36px] lg:text-[48px] text-ops-gray-50 uppercase leading-[1.1] tracking-[0.05em] mb-4">
            GET STARTED IN 30 SECONDS
          </h2>
          <p className="font-kosugi text-[14px] lg:text-[16px] text-ops-gray-200 mb-10">
            Create your free account. Then try OPS for yourself.
          </p>
          <InlineSignupForm location="midpage" onSuccess={handleInlineSignup} />
          <p className="font-kosugi text-[13px] text-ops-gray-400 mt-6">
            Or{' '}
            <button
              onClick={handleTryClick}
              className="text-ops-gray-200 underline hover:text-white transition-colors cursor-pointer"
            >
              try it without an account
            </button>
          </p>
        </div>
      </section>

      <div className="border-t border-ops-border-emphasis mx-6 md:mx-6 lg:mx-10" />

      <RoadmapSection />

      <div className="border-t border-ops-border-emphasis mx-6 md:mx-6 lg:mx-10" />

      <PricingSection
        onDownloadClick={handlePricingDownloadClick}
      />

      <div className="border-t border-ops-border-emphasis mx-6 md:mx-6 lg:mx-10" />

      <FAQSection onFAQToggle={handleFAQToggle} />

      <div className="border-t border-ops-border-emphasis mx-6 md:mx-6 lg:mx-10" />

      <ClosingCTA
        onDownloadClick={handleClosingDownloadClick}
        onTryClick={handleClosingTryClick}
      />

      <Footer />

      <StickyCTA onDownloadClick={handleStickyDownloadClick} onTryClick={handleStickyTryClick} />
    </main>
  )
}

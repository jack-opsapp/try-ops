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
        headline="JOB MANAGEMENT YOUR CREW WILL ACTUALLY USE"
        subtext="Built by trades, for trades. Your software should handle the chaos so you don't have to."
        primaryCtaLabel="DOWNLOAD FREE - iOS"
        secondaryCtaLabel="TRY IT FIRST"
      />

      <div className="border-t border-ops-border-emphasis mx-6 md:mx-6 lg:mx-10" />

      <DesktopDownload />

      <div className="border-t border-ops-border-emphasis mx-6 md:mx-6 lg:mx-10" />

      <TestimonialsSection />

      <div className="border-t border-ops-border-emphasis mx-6 md:mx-6 lg:mx-10" />

      <PainSection
        heading="YOU'RE EITHER DROWNING IN CHAOS OR PAYING FOR SOFTWARE NOBODY USES"
        cards={[
          {
            id: 'messages',
            title: 'GROUP TEXT HELL',
            bullets: [
              '"What\'s the address?"',
              '"Who\'s going where?"',
              '"Did anyone update the client?"',
              'Messages lost in scroll',
            ],
            forLine: 'For 1-10 person crews with no software',
          },
          {
            id: 'dashboard',
            title: 'ENTERPRISE OVERKILL',
            bullets: [
              'Training takes days',
              'Features you\'ll never use',
              '"It\'s just somewhat complicated"',
              'Your crew avoids opening it',
            ],
            forLine: 'For crews who tried Jobber/ServiceTitan and it\'s too much',
          },
          {
            id: 'scattered',
            title: 'TOOL SPRAWL',
            bullets: [
              'Spreadsheets for scheduling',
              'Whiteboard for crew assignments',
              'Group texts for updates',
              'Sticky notes for everything else',
            ],
            forLine: 'For operations duct-taping manual solutions together',
          },
        ]}
      />

      <div className="border-t border-ops-border-emphasis mx-6 md:mx-6 lg:mx-10" />

      <SolutionSection
        heading="BUILT BY SOMEONE WHO ACTUALLY RUNS CREWS"
        features={[
          {
            title: 'NO TRAINING REQUIRED',
            copy: 'Your crew opens it once. They see their jobs. They know what to do. That\'s it.',
            why: 'Every other tool requires days of training. Your guys won\'t use software they don\'t understand. OPS is obvious from the first tap.',
          },
          {
            title: 'PHOTO DOCUMENTATION THAT WORKS',
            copy: 'Before/after shots. Progress updates. Damage documentation. Markup with arrows and notes. All organized by job.',
            why: 'No more hunting through text chains for that one photo. Everything lives with the job it belongs to.',
          },
          {
            title: 'A SCHEDULE YOUR CREW ACTUALLY READS',
            copy: 'An intuitive job board and clean daily schedule. Your crew sees what\'s coming up, who\'s assigned where, and what needs to get done — all in one glance.',
            why: 'No more morning phone calls asking "where am I going today?" Your crew opens the app and they\'re read in.',
          },
          {
            title: 'DIRECT LINE TO THE BUILDER',
            copy: 'Missing a feature? Speak directly to the founder. We listen. We build what you actually need.',
            why: 'No support tickets. No chatbots. You talk to the person who built it and uses it every day.',
          },
        ]}
      />

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

      <PricingSection />

      <div className="border-t border-ops-border-emphasis mx-6 md:mx-6 lg:mx-10" />

      <FAQSection
        faqs={[
          {
            question: 'Why should I switch from Jobber?',
            answer:
              "Honestly? If Jobber works for you and your crew uses it, don't switch. OPS is for crews who tried Jobber and found it too complicated, or who are still using group texts and need something simple.",
          },
          {
            question: "What if you're missing a feature I need?",
            answer:
              "Tell me. If it makes sense for crews like yours, we'll build it. We're not trying to be everything to everyone - we're building exactly what field crews need, in the order they need it.",
          },
          {
            question: "How do I know you won't shut down?",
            answer:
              "Fair question. Here's the honest answer: I built this because I needed it. It's solving my problem and yours. I'm not going anywhere. Month-to-month pricing means no risk for you. Your data exports anytime.",
          },
          {
            question: 'Can my crew actually use this without training?',
            answer:
              "Download it right now. Open it. If you can't figure out how to create a job in 60 seconds, it failed. That's the standard.",
          },
          {
            question: 'Can I import my Jobber data?',
            answer:
              "Manual import available now with our help. One-click import coming Q3 2026. Either way, you don't lose your history.",
          },
          {
            question: 'Why should I try the tutorial first?',
            answer:
              "Two reasons: (1) You see exactly how OPS works before downloading anything. (2) You stay warm through the download - when you open the app, you already know what you're doing. Users who complete the tutorial are significantly more likely to become active users.",
          },
        ]}
        onFAQToggle={handleFAQToggle}
      />

      <div className="border-t border-ops-border-emphasis mx-6 md:mx-6 lg:mx-10" />

      <ClosingCTA
        headline="YOUR CREW DESERVES SOFTWARE THAT WORKS AS HARD AS YOU DO"
        subtext="Stop coordinating through chaos. Get OPS."
        primaryCtaLabel="DOWNLOAD FREE"
        secondaryCtaLabel="TRY IT FIRST"
      />

      <Footer />

      <StickyCTA onDownloadClick={handleStickyDownloadClick} onTryClick={handleStickyTryClick} />
    </main>
  )
}

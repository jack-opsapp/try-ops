'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { TypewriterText } from '@/components/ui/TypewriterText'
import { OPSButton } from '@/components/ui/OPSButton'
import { PhasedContent } from '@/components/ui/PhasedContent'
import { useVariant } from '@/lib/hooks/useVariant'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { useAnalytics } from '@/lib/hooks/useAnalytics'

const HERO_IMAGES = [
  '/images/hero_1.png',
  '/images/hero_2.png',
  '/images/hero_3.png',
  '/images/hero_4.png',
  '/images/hero_5.png',
  '/images/hero_6.png',
]

export default function LandingPage() {
  const router = useRouter()
  const variant = useVariant()
  const { track } = useAnalytics()
  const setTutorialStartTime = useOnboardingStore((s) => s.setTutorialStartTime)
  const [currentImage, setCurrentImage] = useState(0)
  const [titleDone, setTitleDone] = useState(false)

  // Rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Track page view
  useEffect(() => {
    track('page_view', { page: 'landing' })
  }, [track])

  const handleGetStarted = () => {
    setTutorialStartTime(Date.now())
    router.push('/tutorial-intro')
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Hero image slideshow */}
      {HERO_IMAGES.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === currentImage ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={src}
            alt=""
            fill
            className="object-cover"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Logo */}
        <div className="px-6 pt-8">
          <Image
            src="/images/ops-logo-white.png"
            alt="OPS"
            width={80}
            height={32}
            className="object-contain"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom content */}
        <div className="px-6 pb-10 max-w-lg mx-auto w-full">
          {/* Title */}
          <h1 className="text-ops-large-title font-mohave font-bold tracking-wide mb-3">
            <TypewriterText
              text="BUILT BY TRADES. FOR TRADES."
              typingSpeed={35}
              onComplete={() => setTitleDone(true)}
            />
          </h1>

          {/* Subtitle */}
          <PhasedContent delay={1400}>
            <p className="font-kosugi text-ops-body text-ops-text-secondary mb-10">
              Job management your crew will actually use.
            </p>
          </PhasedContent>

          {/* CTAs */}
          <PhasedContent delay={1800}>
            <div className="space-y-3">
              <OPSButton onClick={handleGetStarted}>
                GET STARTED
              </OPSButton>
              <OPSButton
                variant="ghost"
                onClick={() => {
                  // Redirect to app for sign in
                  window.location.href = 'https://apps.apple.com/app/ops-app/id6503204873'
                }}
              >
                SIGN IN
              </OPSButton>
            </div>
          </PhasedContent>
        </div>
      </div>
    </div>
  )
}

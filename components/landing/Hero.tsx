'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { z } from 'zod'
import type { HeroPropsSchema } from '@/lib/ab/types'
import dynamic from 'next/dynamic'
import { Button } from '@/components/shared/Button'
import { HeroAnimation } from '@/components/landing/HeroAnimation'
import PhoneSceneFallback from '@/components/platform/phone-scene/PhoneSceneFallback'
import { trackABClick } from '@/lib/ab/track-click'
import { getTutorialRoute } from '@/lib/utils/tutorial-routes'

const PhoneSceneWrapper = dynamic(
  () => import('@/components/platform/phone-scene/PhoneSceneWrapper'),
  { ssr: false, loading: () => <PhoneSceneFallback /> },
)

type HeroProps = z.infer<typeof HeroPropsSchema>

const APP_STORE_URL = 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

function HeroVisual({ mode, imageSrc }: { mode: 'animation' | 'image' | 'phone3d'; imageSrc?: string }) {
  if (mode === 'phone3d') {
    return (
      <div className="relative w-full h-[340px] sm:h-[400px] lg:h-[520px]">
        <PhoneSceneWrapper />
      </div>
    )
  }
  if (mode === 'image' && imageSrc) {
    return (
      <div className="relative w-full h-[260px] lg:h-[400px] rounded-[8px] overflow-hidden">
        <Image
          src={imageSrc}
          alt="Trade crew using OPS"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 400px"
          priority
        />
        {/* Subtle vignette overlay to blend with dark theme */}
        <div className="absolute inset-0 bg-gradient-to-t from-ops-background/60 via-transparent to-transparent" />
      </div>
    )
  }
  return <HeroAnimation />
}

export function Hero({ headline, subtext, primaryCtaLabel, secondaryCtaLabel, heroMode, heroImageSrc }: HeroProps) {
  const router = useRouter()
  const mode = heroMode ?? 'animation'

  const handleDownloadClick = () => {
    trackABClick('Hero', 'download_btn')
    window.open(APP_STORE_URL, '_blank')
  }

  const handleTryClick = () => {
    trackABClick('Hero', 'try_btn')
    const variant = document.cookie.split(';').find(c => c.trim().startsWith('ops_variant='))?.split('=')[1]?.trim() || 'a'
    router.push(getTutorialRoute(variant))
  }

  // ── Phone3D layout: phone is a full background, text overlays on top ──
  if (mode === 'phone3d') {
    return (
      <section id="hero" className="relative min-h-[100svh] flex items-center snap-start snap-always pointer-events-none">
        {/* 3D Phone — full viewport canvas (no WebGL clipping), shifted right on md+ */}
        <div className="absolute inset-0 z-0 pointer-events-auto md:translate-x-[20%]">
          <PhoneSceneWrapper />
        </div>

        {/* Text content — overlaid, transparent to pointer events except buttons */}
        <div className="relative z-[2] w-full max-w-[1400px] mx-auto px-6 md:px-10 py-10 md:py-20">
          <div className="flex flex-col justify-end md:justify-center min-h-[80svh]">
            <div className="max-w-[500px]">
              <motion.h1
                className="font-mohave font-bold text-[40px] lg:text-[64px] text-ops-gray-50 uppercase leading-[1.1] tracking-[0.05em] mb-4 lg:mb-6"
                {...fadeInUp}
              >
                {headline}
              </motion.h1>

              <motion.p
                className="font-mono text-[14px] lg:text-[20px] text-ops-gray-200 leading-relaxed max-w-[500px] mb-8"
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: 0.1 }}
              >
                {subtext}
              </motion.p>

              {/* CTAs — pointer-events-auto so they're clickable */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 mb-4 pointer-events-auto"
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: 0.2 }}
              >
                <Button
                  variant="primary"
                  onClick={handleDownloadClick}
                  fullWidth
                  className="sm:w-auto"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  {primaryCtaLabel}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTryClick}
                  fullWidth
                  className="sm:w-auto"
                >
                  {secondaryCtaLabel}
                </Button>
              </motion.div>

              {/* Trust line */}
              <motion.p
                className="font-mono text-[12px] text-ops-gray-400"
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: 0.25 }}
              >
                Get started for free &middot; No credit card &middot; Rated 5.0&#9733;
              </motion.p>
            </div>
          </div>
        </div>

        {/* Mobile hint — two-finger orbit, fades out after 4s */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[3] md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0.6, 0] }}
          transition={{ duration: 5, times: [0, 0.15, 0.7, 1], delay: 3 }}
        >
          <p className="font-mono text-[11px] text-ops-gray-400 tracking-wider uppercase whitespace-nowrap">
            Use two fingers to orbit
          </p>
        </motion.div>
      </section>
    )
  }

  // ── Standard layout: side-by-side (animation / image modes) ──
  return (
    <section id="hero" className="relative min-h-[100svh] flex items-center snap-start snap-always">
      <div className="w-full max-w-[1200px] mx-auto px-6 md:px-6 lg:px-10 py-10 lg:py-20">
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-16">
          {/* Mobile: title first, then visual */}
          <div className="lg:hidden w-full">
            <motion.h1
              className="font-mohave font-bold text-[40px] text-ops-gray-50 uppercase leading-[1.1] tracking-[0.05em] mb-4"
              {...fadeInUp}
            >
              {headline}
            </motion.h1>
          </div>

          {/* Visual — below title on mobile, right side on desktop */}
          <motion.div
            className="flex-shrink-0 w-full lg:hidden"
            {...fadeInUp}
          >
            <HeroVisual mode={mode} imageSrc={heroImageSrc} />
          </motion.div>

          {/* Text content — left-aligned */}
          <div className="flex-1">
            <motion.h1
              className="hidden lg:block font-mohave font-bold text-[64px] text-ops-gray-50 uppercase leading-[1.1] tracking-[0.05em] max-w-[600px] mb-6"
              {...fadeInUp}
            >
              {headline}
            </motion.h1>

            <motion.p
              className="font-mono text-[14px] lg:text-[20px] text-ops-gray-200 leading-relaxed max-w-[500px] mb-8"
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.1 }}
            >
              {subtext}
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-4"
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.2 }}
            >
              <Button
                variant="primary"
                onClick={handleDownloadClick}
                fullWidth
                className="sm:w-auto"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                {primaryCtaLabel}
              </Button>
              <Button
                variant="outline"
                onClick={handleTryClick}
                fullWidth
                className="sm:w-auto"
              >
                {secondaryCtaLabel}
              </Button>
            </motion.div>

            {/* Trust line */}
            <motion.p
              className="font-mono text-[12px] text-ops-gray-400"
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.25 }}
            >
              Get started for free &middot; No credit card &middot; Rated 5.0&#9733;
            </motion.p>
          </div>

          {/* Visual — desktop only (mobile is above) */}
          <motion.div
            className="hidden lg:block flex-shrink-0 w-[400px]"
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.2 }}
          >
            <HeroVisual mode={mode} imageSrc={heroImageSrc} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

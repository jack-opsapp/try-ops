'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/shared/Button'
import { HeroAnimation } from '@/components/landing/HeroAnimation'

interface HeroProps {
  onDownloadClick: () => void
  onTryClick: () => void
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

export function Hero({ onDownloadClick, onTryClick }: HeroProps) {
  return (
    <section id="hero" className="relative min-h-[100svh] flex items-center snap-start snap-always">
      <div className="w-full max-w-[1200px] mx-auto px-6 md:px-6 lg:px-10 py-4 lg:py-20">
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-16">
          {/* Mobile: title first, then animation */}
          <div className="lg:hidden w-full">
            <motion.h1
              className="font-bebas text-[40px] text-ops-gray-50 uppercase leading-[1.1] tracking-[0.05em] mb-4"
              {...fadeInUp}
            >
              JOB MANAGEMENT YOUR CREW WILL ACTUALLY USE
            </motion.h1>
          </div>

          {/* Wireframe animation — below title on mobile, right side on desktop */}
          <motion.div
            className="flex-shrink-0 w-full lg:hidden"
            {...fadeInUp}
          >
            <HeroAnimation />
          </motion.div>

          {/* Text content — left-aligned */}
          <div className="flex-1">
            <motion.h1
              className="hidden lg:block font-bebas text-[64px] text-ops-gray-50 uppercase leading-[1.1] tracking-[0.05em] max-w-[600px] mb-6"
              {...fadeInUp}
            >
              JOB MANAGEMENT YOUR CREW WILL ACTUALLY USE
            </motion.h1>

            <motion.p
              className="font-kosugi text-[18px] lg:text-[20px] text-ops-gray-200 leading-relaxed max-w-[500px] mb-10"
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.1 }}
            >
              Built by trades, for trades. Your software should handle the chaos so you don&apos;t have to.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-8"
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.2 }}
            >
              <Button
                variant="primary"
                onClick={onDownloadClick}
                fullWidth
                className="sm:w-auto"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                DOWNLOAD FREE - iOS
              </Button>
              <Button
                variant="outline"
                onClick={onTryClick}
                fullWidth
                className="sm:w-auto"
              >
                TRY IT FIRST
              </Button>
            </motion.div>

            {/* Trust line */}
            <motion.p
              className="font-kosugi text-[14px] text-ops-gray-300"
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.3 }}
            >
              Get started for free &middot; No credit card &middot; Rated 5.0&#9733;
            </motion.p>

            {/* Founder quote — desktop only */}
            <motion.div
              className="hidden lg:block border-l-2 border-white/20 pl-6 mt-10"
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.4 }}
            >
              <p className="font-kosugi text-[16px] text-ops-gray-200 leading-relaxed mb-2 max-w-[500px]">
                &ldquo;I scaled a deck and railing business from 0 to $1.6M in 4 years. Tried Jobber, ServiceTitan, Housecall Pro.
                None of them worked the way my crew actually works. So I built OPS.&rdquo;
              </p>
              <p className="font-mohave font-medium text-[13px] text-ops-gray-400 uppercase tracking-wider">
                &mdash; Jack, Founder
              </p>
            </motion.div>
          </div>

          {/* Wireframe animation — desktop only (mobile is above) */}
          <motion.div
            className="hidden lg:block flex-shrink-0 w-[400px]"
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.2 }}
          >
            <HeroAnimation />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

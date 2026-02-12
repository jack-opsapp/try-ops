'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/shared/Button'
import { PhoneMockup } from '@/components/shared/PhoneMockup'

const APP_STORE_URL = 'https://apps.apple.com/app/ops-app/id6503204873'

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
    <section id="hero" className="relative min-h-screen flex items-center">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.h1
              className="font-bebas text-[48px] lg:text-[64px] text-white uppercase leading-[1.1] tracking-[0.05em] max-w-[600px] mx-auto lg:mx-0 mb-6"
              {...fadeInUp}
            >
              JOB MANAGEMENT YOUR CREW WILL ACTUALLY USE
            </motion.h1>

            <motion.p
              className="font-kosugi text-[18px] lg:text-[20px] text-ops-text-secondary leading-relaxed max-w-[500px] mx-auto lg:mx-0 mb-10"
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.1 }}
            >
              No training. No complexity. Built by a crew lead who needed something that just works.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
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
              className="font-kosugi text-[14px] text-ops-text-secondary text-center lg:text-left"
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.3 }}
            >
              Free for crew members &middot; Rated 4.8&#9733; &middot; No credit card needed
            </motion.p>
          </div>

          {/* Phone mockup */}
          <motion.div
            className="flex-shrink-0 w-[280px] lg:w-[320px]"
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.2 }}
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

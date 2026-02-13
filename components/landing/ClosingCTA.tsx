'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/shared/Button'

interface ClosingCTAProps {
  onDownloadClick: () => void
  onTryClick: () => void
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

export function ClosingCTA({ onDownloadClick, onTryClick }: ClosingCTAProps) {
  return (
    <section id="closing" className="bg-ops-card border-t-2 border-ops-gray-500 min-h-[100svh] md:min-h-0 flex flex-col justify-center md:block py-6 lg:py-[120px] snap-start snap-always">
      <div className="max-w-[700px] mx-auto px-4 md:px-6 lg:px-10">
        <motion.h2
          className="font-bebas text-[40px] lg:text-[56px] text-ops-gray-50 uppercase leading-[1.1] tracking-[0.05em] mb-6"
          {...fadeInUp}
        >
          YOUR CREW DESERVES SOFTWARE THAT WORKS AS HARD AS YOU DO
        </motion.h2>

        <motion.p
          className="font-kosugi text-[18px] text-ops-gray-200 mb-12 max-w-[600px]"
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.1 }}
        >
          Stop coordinating through chaos. Get OPS.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-8"
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.2 }}
        >
          <Button variant="primary" onClick={onDownloadClick} className="max-w-[280px] w-full">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            DOWNLOAD FREE
          </Button>
          <Button variant="outline" onClick={onTryClick} className="max-w-[280px] w-full">
            TRY IT FIRST
          </Button>
        </motion.div>

        <motion.p
          className="font-kosugi text-[14px] text-ops-gray-300"
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.3 }}
        >
          Get started for free &middot; No credit card &middot; No training required
        </motion.p>
      </div>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

export function FounderQuote() {
  return (
    <section className="min-h-[100svh] md:min-h-0 flex items-center py-6 lg:py-[160px] snap-start snap-always">
      <div className="max-w-[700px] mx-auto px-4 md:px-6 lg:px-10">
        <motion.div
          className="border-l-2 border-white/20 pl-6 lg:pl-8"
          {...fadeInUp}
        >
          <p className="font-kosugi text-[18px] lg:text-[22px] text-ops-gray-200 leading-relaxed mb-4">
            &ldquo;I scaled a deck and railing business to $1.6M. Tried Jobber, ServiceTitan, Housecall Pro.
            None of them worked the way my crew actually works. So I built OPS.&rdquo;
          </p>
          <p className="font-mohave font-medium text-[14px] lg:text-[16px] text-ops-gray-400 uppercase tracking-wider">
            &mdash; Jack, Founder
          </p>
        </motion.div>
      </div>
    </section>
  )
}

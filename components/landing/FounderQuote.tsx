'use client'

import { motion } from 'framer-motion'
import type { z } from 'zod'
import type { FounderQuotePropsSchema } from '@/lib/ab/types'

type FounderQuoteProps = z.infer<typeof FounderQuotePropsSchema>

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

export function FounderQuote({ quote, name, title }: FounderQuoteProps) {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-[700px] mx-auto px-6 lg:px-10">
        <motion.div
          className="border-l-2 border-ops-border-emphasis pl-6 lg:pl-8"
          {...fadeInUp}
        >
          <p className="font-mono text-[18px] lg:text-[22px] text-ops-gray-200 leading-relaxed mb-4 max-w-[560px]">
            &ldquo;{quote}&rdquo;
          </p>
          <p className="font-mohave font-medium text-[14px] lg:text-[16px] text-ops-gray-400 uppercase tracking-wider">
            &mdash; {name}{title ? `, ${title}` : ''}
          </p>
        </motion.div>
      </div>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'
import { z } from 'zod'
import { AccordionItem } from '@/components/shared/AccordionItem'
import { FAQSectionPropsSchema } from '@/lib/ab/types'

type FAQSectionProps = z.infer<typeof FAQSectionPropsSchema> & {
  onFAQToggle?: (question: string, expanded: boolean) => void
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

export function FAQSection({ heading, faqs, onFAQToggle }: FAQSectionProps) {
  return (
    <section id="faq" className="min-h-[100svh] flex flex-col justify-center py-6 lg:py-[120px] snap-start snap-always">
      <div className="w-full max-w-[900px] mx-auto px-6 md:px-6 lg:px-10">
        <motion.p
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-ops-text-secondary mb-4"
          {...fadeInUp}
        >
          [ FAQ ]
        </motion.p>
        <motion.h2
          className="font-mohave font-bold text-[26px] lg:text-[32px] text-ops-gray-50 uppercase tracking-[0.05em] mb-4 lg:mb-12"
          {...fadeInUp}
        >
          {heading ?? "QUESTIONS YOU\u2019RE PROBABLY ASKING"}
        </motion.h2>

        <div className="w-full lg:max-h-none" style={{ maxHeight: '70svh', overflowY: 'auto' }}>
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <AccordionItem
                question={faq.question}
                answer={faq.answer}
                onToggle={(expanded) => onFAQToggle?.(faq.question, expanded)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'
import { AccordionItem } from '@/components/shared/AccordionItem'

interface FAQSectionProps {
  onFAQToggle?: (question: string, expanded: boolean) => void
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

const faqs = [
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
      "Two reasons: (1) You see exactly how OPS works before downloading anything. (2) You stay warm through the download - when you open the app, you already know what you're doing. Users who complete the tutorial activate 3x more than cold downloads.",
  },
]

export function FAQSection({ onFAQToggle }: FAQSectionProps) {
  return (
    <section id="faq" className="py-20 lg:py-[120px]">
      <div className="max-w-[800px] mx-auto px-4 md:px-6 lg:px-10">
        <motion.h2
          className="font-bebas text-[32px] text-ops-gray-50 uppercase tracking-[0.05em] mb-12"
          {...fadeInUp}
        >
          QUESTIONS YOU&apos;RE PROBABLY ASKING
        </motion.h2>

        <motion.div {...fadeInUp}>
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              onToggle={(expanded) => onFAQToggle?.(faq.question, expanded)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

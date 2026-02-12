'use client'

import { motion } from 'framer-motion'
import { Carousel } from '@/components/shared/Carousel'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

const features = [
  {
    title: 'NO TRAINING REQUIRED',
    copy: 'Your crew opens it once. They see their jobs. They know what to do. That\'s it.',
    why: 'Eliminates manual data entry. Every other tool requires days of training. OPS is obvious from the first tap.',
  },
  {
    title: 'PHOTO DOCUMENTATION THAT WORKS',
    copy: 'Before/after shots. Progress updates. Damage documentation. Markup with arrows and notes. All organized by job.',
    why: 'No more hunting through text chains for that one photo. Everything lives with the job it belongs to.',
  },
  {
    title: 'TIME TRACKING YOUR CREW WON\'T FIGHT',
    copy: 'Clock in when you arrive. Clock out when you leave. Automatic GPS verification. Exports for payroll.',
    why: 'Eliminates manual hour calculations. Your crew clocks in with one tap. Payroll exports are instant.',
  },
  {
    title: 'DIRECT LINE TO THE BUILDER',
    copy: 'Missing a feature? Speak directly to the founder. We listen. We build what you actually need.',
    why: 'No support tickets. No chatbots. You talk to the person who built it and uses it every day.',
  },
]

export function SolutionSection() {
  return (
    <section id="solution" className="py-12 lg:py-[120px] snap-start snap-always">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10">
        <motion.h2
          className="font-bebas text-[26px] lg:text-[40px] text-ops-gray-50 uppercase tracking-[0.05em] mb-8 lg:mb-16"
          {...fadeInUp}
        >
          BUILT BY SOMEONE WHO ACTUALLY RUNS CREWS
        </motion.h2>

        {/* Founder quote */}
        <motion.div
          className="border-l-2 border-white/20 pl-6 mb-16 max-w-[700px]"
          {...fadeInUp}
        >
          <p className="font-kosugi text-[18px] text-ops-gray-200 leading-relaxed mb-3">
            &ldquo;I scaled a deck and railing business to $1.6M. Tried Jobber, ServiceTitan, Housecall Pro.
            None of them worked the way my crew actually works. So I built OPS.&rdquo;
          </p>
          <p className="font-kosugi text-[14px] text-ops-gray-300">
            &mdash; Jackson Sweet, Founder
          </p>
        </motion.div>

        {/* Feature carousel */}
        <motion.div {...fadeInUp}>
          <Carousel gap={16}>
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-ops-card border border-ops-border rounded-ops-card p-8 transition-all duration-300 hover:border-ops-gray-300 h-full"
              >
                <h3 className="font-mohave font-medium text-[20px] uppercase text-ops-gray-50 mb-4">
                  {feature.title}
                </h3>
                <p className="font-kosugi text-[16px] text-ops-gray-200 leading-relaxed mb-3">
                  {feature.copy}
                </p>
                <p className="font-kosugi text-[16px] text-ops-text-secondary leading-relaxed">
                  <span className="text-ops-gray-100 font-medium">Why it matters:</span> {feature.why}
                </p>
              </div>
            ))}
          </Carousel>
        </motion.div>
      </div>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'

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
    why: 'Every other tool requires days of training. Your guys won\'t use software they don\'t understand. OPS is obvious.',
  },
  {
    title: 'PHOTO DOCUMENTATION THAT WORKS',
    copy: 'Before/after shots. Progress updates. Damage documentation. Markup with arrows and notes. All organized by job.',
    why: '7 out of 8 trades crews we surveyed said this is critical. OPS makes it stupid simple.',
  },
  {
    title: 'TIME TRACKING YOUR CREW WON\'T FIGHT',
    copy: 'Clock in when you arrive. Clock out when you leave. Automatic GPS verification. Exports for payroll.',
    why: 'You need hours for billing. Your crew hates complicated time tracking. OPS does it without interrupting their day.',
  },
  {
    title: 'DIRECT LINE TO THE BUILDER',
    copy: 'Missing a feature? Speak directly to the founder. We listen. We build what you actually need.',
    why: 'Jobber has 300,000 users and a support ticket system. OPS has you, and you talk to the person who built it.',
  },
]

export function SolutionSection() {
  return (
    <section id="solution" className="py-20 lg:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10">
        <motion.h2
          className="font-bebas text-[32px] lg:text-[40px] text-white uppercase text-center tracking-[0.05em] mb-16"
          {...fadeInUp}
        >
          BUILT BY SOMEONE WHO ACTUALLY RUNS CREWS
        </motion.h2>

        {/* Founder credibility block */}
        <motion.div
          className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16"
          {...fadeInUp}
        >
          {/* Founder photo placeholder */}
          <div className="flex-shrink-0 w-[200px] h-[200px] rounded-[4px] border-2 border-ops-accent bg-ops-card overflow-hidden grayscale contrast-[1.2] hover:grayscale-0 transition-all duration-500">
            <div className="w-full h-full flex items-center justify-center text-ops-text-secondary font-kosugi text-sm">
              <div className="text-center">
                <div className="text-ops-accent font-bebas text-2xl mb-1">JS</div>
                <div className="text-xs">Founder Photo</div>
              </div>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <p className="font-kosugi text-[18px] text-ops-text-secondary leading-relaxed mb-4">
              &ldquo;I scaled a deck and railing business to $1.6M. Tried Jobber, ServiceTitan, Housecall Pro.
              None of them worked the way my crew actually works. So I built OPS.&rdquo;
            </p>
            <p className="font-kosugi text-[16px] text-ops-accent italic">
              &mdash; Jackson Sweet, Founder
            </p>
          </div>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="bg-ops-card border border-ops-border rounded-ops-card p-8 transition-all duration-300 hover:border-ops-accent"
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: i * 0.1 }}
            >
              <h3 className="font-mohave font-medium text-[20px] uppercase text-white mb-4">
                {feature.title}
              </h3>
              {/* Screenshot placeholder */}
              <div className="w-full aspect-video bg-ops-background rounded-[4px] border border-ops-border mb-4 flex items-center justify-center">
                <span className="font-kosugi text-ops-text-tertiary text-sm">Screenshot placeholder</span>
              </div>
              <p className="font-kosugi text-[16px] text-ops-text-secondary leading-relaxed mb-3">
                {feature.copy}
              </p>
              <p className="font-kosugi text-[16px] text-ops-text-secondary leading-relaxed">
                <span className="text-white font-medium">Why it matters:</span> {feature.why}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

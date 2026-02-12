'use client'

import { motion } from 'framer-motion'
import { FeatureCard } from '@/components/shared/FeatureCard'
import { TangledMessagesIcon, DashboardOverloadIcon, ScatteredAppsIcon } from '@/components/shared/WireframeIcon'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

const painCards = [
  {
    icon: <TangledMessagesIcon />,
    title: 'GROUP TEXT HELL',
    bullets: [
      '"What\'s the address?"',
      '"Who\'s going where?"',
      '"Did anyone update the client?"',
      'Messages lost in scroll',
    ],
    forLine: 'For 1-10 person crews with no software',
  },
  {
    icon: <DashboardOverloadIcon />,
    title: 'ENTERPRISE OVERKILL',
    bullets: [
      'Training takes days',
      'Features you\'ll never use',
      '"It\'s just somewhat complicated"',
      'Your crew avoids opening it',
    ],
    forLine: 'For crews who tried Jobber/ServiceTitan and it\'s too much',
  },
  {
    icon: <ScatteredAppsIcon />,
    title: 'TOOL SPRAWL',
    bullets: [
      'Jobber for scheduling',
      'Something else for photos',
      'Another tool for time tracking',
      'Paying for 3+ subscriptions',
    ],
    forLine: 'For operations duct-taping solutions together',
  },
]

export function PainSection() {
  return (
    <section id="pain" className="py-20 lg:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10">
        <motion.h2
          className="font-bebas text-[32px] lg:text-[40px] text-white uppercase text-center tracking-[0.05em] max-w-[800px] mx-auto mb-12 lg:mb-16"
          {...fadeInUp}
        >
          YOU&apos;RE EITHER DROWNING IN CHAOS OR PAYING FOR SOFTWARE NOBODY USES
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {painCards.map((card, i) => (
            <motion.div
              key={card.title}
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: i * 0.1 }}
            >
              <FeatureCard
                icon={card.icon}
                title={card.title}
                description=""
                bullets={card.bullets}
                forLine={card.forLine}
              />
            </motion.div>
          ))}
        </div>

        {/* Solution callout */}
        <motion.div
          className="border-t-2 border-ops-accent pt-8 mt-12 lg:mt-16"
          {...fadeInUp}
        >
          <p className="font-kosugi text-[18px] text-white text-center max-w-[700px] mx-auto">
            One app. Your crew opens it and knows what to do. No manual. No training. No IT department.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

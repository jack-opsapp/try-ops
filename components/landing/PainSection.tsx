'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FeatureCard } from '@/components/shared/FeatureCard'
import {
  AnimatedTangledMessages,
  AnimatedDashboardOverload,
  AnimatedScatteredApps,
} from '@/components/shared/AnimatedWireframeIcon'
import { TangledMessagesIcon, DashboardOverloadIcon, ScatteredAppsIcon } from '@/components/shared/WireframeIcon'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

const painCards = [
  {
    id: 'messages',
    icon: <TangledMessagesIcon />,
    animatedIcon: AnimatedTangledMessages,
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
    id: 'dashboard',
    icon: <DashboardOverloadIcon />,
    animatedIcon: AnimatedDashboardOverload,
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
    id: 'scattered',
    icon: <ScatteredAppsIcon />,
    animatedIcon: AnimatedScatteredApps,
    title: 'TOOL SPRAWL',
    bullets: [
      'Spreadsheets for scheduling',
      'Whiteboard for crew assignments',
      'Group texts for updates',
      'Sticky notes for everything else',
    ],
    forLine: 'For operations duct-taping manual solutions together',
  },
]

export function PainSection() {
  const [activeCard, setActiveCard] = useState<string | null>(null)

  return (
    <section id="pain" className="min-h-[100svh] md:min-h-0 flex flex-col justify-center md:block py-6 lg:py-[120px] snap-start snap-always">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10">
        <motion.h2
          className="font-bebas text-[26px] lg:text-[40px] text-ops-gray-50 uppercase tracking-[0.05em] max-w-[800px] mb-8 lg:mb-16"
          {...fadeInUp}
        >
          YOU&apos;RE EITHER DROWNING IN CHAOS OR PAYING FOR SOFTWARE NOBODY USES
        </motion.h2>

        {/* Mobile compact grid */}
        <div className="md:hidden">
          <div className="grid grid-cols-3 gap-3 mb-6">
            {painCards.map((card) => {
              const isActive = activeCard === card.id
              const AnimIcon = card.animatedIcon
              return (
                <button
                  key={card.id}
                  onClick={() => setActiveCard(isActive ? null : card.id)}
                  className={`flex flex-col items-center p-3 rounded-ops-card border transition-all duration-300 ${
                    isActive
                      ? 'border-ops-gray-300 bg-ops-card'
                      : 'border-ops-border bg-ops-card/50'
                  }`}
                >
                  <AnimIcon isActive={isActive} size={48} />
                  <span className="font-mohave font-medium text-[11px] uppercase text-ops-gray-200 mt-2 text-center leading-tight">
                    {card.title}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Expanded card details */}
          <AnimatePresence mode="wait">
            {activeCard && (
              <motion.div
                key={activeCard}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                {painCards
                  .filter((c) => c.id === activeCard)
                  .map((card) => (
                    <div
                      key={card.id}
                      className="bg-ops-card border border-ops-border rounded-ops-card p-6"
                    >
                      <ul className="font-kosugi text-[14px] text-ops-text-secondary leading-relaxed space-y-1 mb-3">
                        {card.bullets.map((bullet, i) => (
                          <li key={i}>&#8226; {bullet}</li>
                        ))}
                      </ul>
                      <p className="font-kosugi text-[12px] text-ops-gray-300 italic">
                        {card.forLine}
                      </p>
                    </div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop full grid */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
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
          className="border-t-2 border-ops-gray-500 pt-8 mt-12 lg:mt-16"
          {...fadeInUp}
        >
          <p className="font-kosugi text-[18px] text-ops-gray-100 max-w-[700px]">
            One app. Your crew opens it and knows what to do. No manual. No training. No IT department.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

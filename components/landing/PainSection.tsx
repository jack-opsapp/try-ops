'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AnimatedTangledMessages,
  AnimatedDashboardOverload,
  AnimatedScatteredApps,
} from '@/components/shared/AnimatedWireframeIcon'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

const painCards = [
  {
    id: 'messages',
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

function HoverPainCard({ card, delay }: { card: typeof painCards[number]; delay: number }) {
  const [hovered, setHovered] = useState(false)
  const AnimIcon = card.animatedIcon

  return (
    <motion.div
      className="h-full"
      {...fadeInUp}
      transition={{ ...fadeInUp.transition, delay }}
    >
      <div
        className="bg-ops-card border border-ops-border rounded-ops-card p-8 h-full transition-all duration-300 hover:border-ops-gray-300 hover:-translate-y-1"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="mb-4">
          <AnimIcon isActive={hovered} size={56} />
        </div>
        <h3 className="font-mohave font-medium text-[18px] uppercase text-ops-gray-50 mb-4">
          {card.title}
        </h3>
        <ul className="font-kosugi text-[16px] text-ops-text-secondary leading-relaxed mb-4 space-y-1">
          {card.bullets.map((bullet, i) => (
            <li key={i}>&#8226; {bullet}</li>
          ))}
        </ul>
        <p className="font-kosugi text-[14px] text-ops-gray-200 italic">
          {card.forLine}
        </p>
      </div>
    </motion.div>
  )
}

export function PainSection() {
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const hasAutoExpanded = useRef(false)

  // Auto-expand first card on mobile when section enters viewport
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth >= 768) return
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAutoExpanded.current) {
          hasAutoExpanded.current = true
          setActiveCard(painCards[0].id)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="pain" className="min-h-[100svh] flex flex-col justify-center py-6 lg:py-[120px] snap-start snap-always">
      <div className="max-w-[1200px] mx-auto px-6 md:px-6 lg:px-10">
        <motion.h2
          className="font-bebas text-[26px] lg:text-[40px] text-ops-gray-50 uppercase tracking-[0.05em] max-w-[800px] mb-4 lg:mb-16"
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
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {painCards.map((card, i) => (
            <HoverPainCard key={card.title} card={card} delay={i * 0.1} />
          ))}
        </div>

        {/* Solution callout */}
        <motion.div
          className="border-t-2 border-ops-gray-500 pt-6 mt-6 lg:mt-16"
          {...fadeInUp}
        >
          <p className="font-kosugi text-[18px] text-ops-gray-100 max-w-[700px]">
            One app. Your crew opens it and knows what to do.{' '}
            <span className="inline-block">No manual.</span>{' '}
            <span className="inline-block">No training.</span>{' '}
            <span className="inline-block">No dedicated IT guy necessary.</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

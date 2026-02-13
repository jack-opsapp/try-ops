'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

const builtItems = ['Multiple Project Tasks']

const inDevItems = [
  'Auto Time Tracking',
  'Team Locations',
  'Expense Tracking',
  'Client Portal',
  'Estimating & Invoices',
  'Request for Google Review',
  'Client Booking Portal',
  'Inventory Tracking',
]

const roadmapItems = [
  'Calendar Request System',
  'Weather Integration',
  'Apple Watch',
  'Work Analytics',
  'Project Analytics',
  'Team Member Notes',
  'In-App Messaging',
  'Project Note Notifications',
  'AI Quoting System',
  'Apple CarPlay',
  'QuickBooks Integration',
]

function CategoryHeader({ label, description }: { label: string; description: string }) {
  return (
    <div className="px-4 md:px-5 py-2 md:py-2.5 bg-white/[0.03]">
      <span className="font-mohave font-medium text-[10px] md:text-[11px] uppercase tracking-wider text-ops-gray-300">
        {label}
      </span>
      <span className="font-kosugi text-[10px] md:text-[11px] text-ops-gray-400 ml-2">
        &mdash; {description}
      </span>
    </div>
  )
}

function RoadmapRow({ text, variant }: { text: string; variant: 'built' | 'indev' | 'planned' }) {
  return (
    <div className="flex items-center gap-3 px-4 md:px-5 py-2 md:py-3">
      <span className="flex-shrink-0 w-5 text-center">
        {variant === 'built' ? (
          <svg className="w-4 h-4 text-ops-success" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : variant === 'indev' ? (
          <span className="w-2 h-2 rounded-full bg-white inline-block" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-ops-gray-400 inline-block" />
        )}
      </span>

      <span
        className={`font-kosugi text-[13px] md:text-[15px] flex-1 ${
          variant === 'built'
            ? 'text-ops-gray-400 line-through'
            : variant === 'indev'
            ? 'text-ops-gray-100'
            : 'text-ops-gray-300'
        }`}
      >
        {text}
      </span>

      {variant === 'built' && (
        <span className="flex-shrink-0 font-mohave text-[10px] uppercase tracking-wider text-ops-gray-400">
          SHIPPED
        </span>
      )}
      {variant === 'indev' && (
        <span className="flex-shrink-0 font-mohave text-[10px] uppercase tracking-wider text-ops-gray-300 border border-white/10 rounded-[3px] px-2 py-0.5">
          IN DEV
        </span>
      )}
    </div>
  )
}

export function RoadmapSection() {
  const [showAll, setShowAll] = useState(false)

  return (
    <section id="roadmap" className="min-h-[100svh] flex flex-col justify-center py-6 lg:py-[120px] snap-start snap-always">
      <div className="max-w-[700px] mx-auto px-6 md:px-6 lg:px-10">
        <motion.h2
          className="font-bebas text-[26px] lg:text-[40px] text-ops-gray-50 uppercase tracking-[0.05em] mb-2 lg:mb-3"
          {...fadeInUp}
        >
          WE&apos;RE BUILDING WHAT YOU ACTUALLY NEED
        </motion.h2>

        <motion.p
          className="font-kosugi text-[13px] lg:text-[16px] text-ops-gray-300 mb-4 lg:mb-12"
          {...fadeInUp}
        >
          Every feature gets built based on what real crews actually need. Not what looks good in a demo.
        </motion.p>

        <motion.div
          className="bg-ops-card border border-ops-border rounded-ops-card overflow-hidden"
          {...fadeInUp}
        >
          {/* Built */}
          <CategoryHeader label="Customer Requested (Built)" description="Features you asked for that we shipped" />
          {builtItems.map((item, i) => (
            <div key={item} className={i > 0 ? 'border-t border-white/5' : ''}>
              <RoadmapRow text={item} variant="built" />
            </div>
          ))}

          {/* In Development */}
          <div className="border-t border-white/10">
            <CategoryHeader label="Customer Requested (In Development)" description="Features you asked for that we're building now" />
          </div>
          {inDevItems.map((item, i) => (
            <div key={item} className={i > 0 ? 'border-t border-white/5' : ''}>
              <RoadmapRow text={item} variant="indev" />
            </div>
          ))}

          {/* On the Roadmap — always visible on desktop, collapsible on mobile */}
          <div className="border-t border-white/10">
            <CategoryHeader label="On the Roadmap" description="Planned features based on crew needs" />
          </div>

          <div className="hidden lg:block">
            {roadmapItems.map((item, i) => (
              <div key={item} className={i > 0 ? 'border-t border-white/5' : ''}>
                <RoadmapRow text={item} variant="planned" />
              </div>
            ))}
          </div>

          {/* Mobile: collapsible */}
          <div className="lg:hidden">
            <AnimatePresence>
              {showAll && roadmapItems.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`overflow-hidden ${i > 0 ? 'border-t border-white/5' : ''}`}
                >
                  <RoadmapRow text={item} variant="planned" />
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-3 border-t border-white/5 font-mohave text-[13px] uppercase tracking-wider text-ops-gray-300 hover:text-ops-gray-100 transition-colors"
            >
              {showAll ? 'SHOW LESS' : `SHOW ALL FEATURES (+${roadmapItems.length})`}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

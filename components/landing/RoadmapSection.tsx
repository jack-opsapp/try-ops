'use client'

import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

interface RoadmapItem {
  text: string
  priority: boolean
  completed: boolean
}

const roadmapItems: RoadmapItem[] = [
  { text: 'Multiple Project Tasks', priority: true, completed: true },
  { text: 'Auto Time Tracking', priority: true, completed: false },
  { text: 'Team Locations', priority: true, completed: false },
  { text: 'Expense Tracking', priority: true, completed: false },
  { text: 'Client Portal', priority: true, completed: false },
  { text: 'Estimating & Invoices', priority: true, completed: false },
  { text: 'Request for Google Review', priority: true, completed: false },
  { text: 'Client Booking Portal', priority: true, completed: false },
  { text: 'Calendar Request System', priority: false, completed: false },
  { text: 'Weather Integration', priority: false, completed: false },
  { text: 'Apple Watch', priority: false, completed: false },
  { text: 'Work Analytics', priority: false, completed: false },
  { text: 'Project Analytics', priority: false, completed: false },
  { text: 'Team Member Notes', priority: false, completed: false },
  { text: 'In-App Messaging', priority: false, completed: false },
  { text: 'Project Note Notifications', priority: false, completed: false },
  { text: 'AI Quoting System', priority: false, completed: false },
  { text: 'Apple CarPlay', priority: false, completed: false },
  { text: 'QuickBooks Integration', priority: false, completed: false },
]

export function RoadmapSection() {
  return (
    <section id="roadmap" className="py-20 lg:py-[120px]">
      <div className="max-w-[800px] mx-auto px-4 md:px-6 lg:px-10">
        <motion.h2
          className="font-bebas text-[32px] lg:text-[40px] text-ops-gray-50 uppercase tracking-[0.05em] mb-4"
          {...fadeInUp}
        >
          WE&apos;RE BUILDING WHAT YOU ACTUALLY NEED
        </motion.h2>

        <motion.p
          className="font-kosugi text-[16px] text-ops-gray-300 mb-12 lg:mb-16"
          {...fadeInUp}
        >
          Every feature gets built based on what real crews actually need. Not what looks good in a demo.
        </motion.p>

        <motion.div
          className="space-y-0"
          {...fadeInUp}
        >
          {roadmapItems.map((item, i) => (
            <motion.div
              key={item.text}
              className={`flex items-center gap-4 py-3 border-b border-ops-border ${
                item.priority && !item.completed ? 'border-l-2 border-l-ops-accent pl-4' : 'pl-6'
              }`}
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: i * 0.03 }}
            >
              {/* Status indicator */}
              <span className="flex-shrink-0 w-5 text-center">
                {item.completed ? (
                  <svg className="w-5 h-5 text-ops-success" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : item.priority ? (
                  <span className="text-ops-accent font-mohave font-bold text-[14px]">!</span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-ops-gray-400 inline-block" />
                )}
              </span>

              {/* Feature name */}
              <span
                className={`font-kosugi text-[16px] ${
                  item.completed
                    ? 'text-ops-gray-400 line-through'
                    : item.priority
                    ? 'text-ops-gray-100'
                    : 'text-ops-gray-200'
                }`}
              >
                {item.text}
              </span>

              {/* Priority badge */}
              {item.priority && !item.completed && (
                <span className="ml-auto font-mohave text-[11px] uppercase tracking-wider text-ops-accent">
                  PRIORITY
                </span>
              )}
              {item.completed && (
                <span className="ml-auto font-mohave text-[11px] uppercase tracking-wider text-ops-gray-400">
                  DONE
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

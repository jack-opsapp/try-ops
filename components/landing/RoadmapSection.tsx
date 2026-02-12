'use client'

import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

const roadmapBlocks = [
  {
    title: 'CURRENT (FREE)',
    items: [
      { icon: '✅', text: 'Job scheduling' },
      { icon: '✅', text: 'Photo documentation' },
      { icon: '✅', text: 'Time tracking' },
      { icon: '✅', text: 'Works offline' },
    ],
  },
  {
    title: 'COMING Q2 2026',
    items: [
      { icon: '🚧', text: 'Estimating & quoting' },
      { icon: '🚧', text: 'Invoicing & payments' },
      { icon: '🚧', text: 'Full CRM' },
      { icon: '🚧', text: 'Commission tracking' },
    ],
  },
  {
    title: 'COMING Q3 2026',
    items: [
      { icon: '🚧', text: 'QuickBooks integration' },
      { icon: '🚧', text: 'Stripe/Square payments' },
      { icon: '🚧', text: 'Import from Jobber/ServiceTitan' },
    ],
  },
]

export function RoadmapSection() {
  return (
    <section id="roadmap" className="py-20 lg:py-[120px]">
      <div className="max-w-[800px] mx-auto px-4 md:px-6 lg:px-10">
        <motion.h2
          className="font-bebas text-[32px] lg:text-[40px] text-white uppercase text-center tracking-[0.05em] mb-12 lg:mb-16"
          {...fadeInUp}
        >
          WE&apos;RE BUILDING WHAT YOU ACTUALLY NEED
        </motion.h2>

        <div className="space-y-6">
          {roadmapBlocks.map((block, i) => (
            <motion.div
              key={block.title}
              className="bg-ops-card border border-ops-border rounded-ops-card p-6"
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: i * 0.1 }}
            >
              <h3 className="font-mohave font-medium text-[16px] uppercase text-ops-accent mb-4">
                {block.title}
              </h3>
              <ul className="space-y-2">
                {block.items.map((item) => (
                  <li
                    key={item.text}
                    className="font-kosugi text-[16px] text-ops-text-secondary leading-8"
                  >
                    {item.icon} {item.text}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="font-kosugi text-[18px] text-white italic text-center max-w-[600px] mx-auto mt-10 pt-8"
          {...fadeInUp}
        >
          &ldquo;Every feature gets built based on what real crews actually need. Not what looks good in a demo.&rdquo;
        </motion.p>
      </div>
    </section>
  )
}

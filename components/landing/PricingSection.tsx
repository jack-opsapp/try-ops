'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/shared/Button'

const APP_STORE_URL = 'https://apps.apple.com/app/ops-app/id6503204873'

interface PricingSectionProps {
  onDownloadClick: () => void
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

const freeFeatures = [
  'See your assigned jobs',
  'Clock in/out with GPS',
  'Take photos with markup',
  'Navigate to job sites',
  'Update job status',
  'Works offline',
]

const leadFeatures = [
  'Everything in Free',
  'Create and schedule jobs',
  'Assign crew members',
  'Manage up to 5 seats',
  'Client management',
  'Export time tracking',
]

const comparisonRows = [
  { feature: 'Monthly cost', jobber: '$169-329', ops: '$90' },
  { feature: 'Training time', jobber: '2+ days', ops: '2 minutes' },
  { feature: 'Learning curve', jobber: 'Steep', ops: 'None' },
  { feature: 'Talk to founder', jobber: '❌', ops: '✅' },
  { feature: 'Full feature set', jobber: '✅ Now', ops: '✅ Q2 2026' },
  { feature: 'Works offline', jobber: '❌', ops: '✅' },
]

export function PricingSection({ onDownloadClick }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-20 lg:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10">
        <motion.h2
          className="font-bebas text-[32px] lg:text-[40px] text-white uppercase text-center tracking-[0.05em] mb-16"
          {...fadeInUp}
        >
          START FREE. UPGRADE WHEN YOU&apos;RE READY.
        </motion.h2>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 mb-16">
          {/* Free tier */}
          <motion.div
            className="bg-ops-card border border-ops-border rounded-ops-card p-10 transition-all duration-300 hover:border-ops-accent"
            {...fadeInUp}
          >
            <p className="font-mohave font-medium text-[14px] uppercase text-ops-accent mb-2">
              CREW MEMBER
            </p>
            <p className="font-bebas text-[48px] text-white leading-none mb-6">
              FREE FOREVER
            </p>
            <ul className="space-y-2 mb-8">
              {freeFeatures.map((feature) => (
                <li key={feature} className="font-kosugi text-[16px] text-ops-text-secondary leading-8">
                  &#8226; {feature}
                </li>
              ))}
            </ul>
            <Button variant="primary" onClick={onDownloadClick} fullWidth>
              DOWNLOAD NOW
            </Button>
            <p className="font-kosugi text-[14px] text-ops-text-secondary italic mt-4">
              Best for: Crew members who need to know where they&apos;re going and what they&apos;re doing
            </p>
          </motion.div>

          {/* Paid tier */}
          <motion.div
            className="relative bg-ops-card border border-ops-border rounded-ops-card p-10 transition-all duration-300 hover:border-ops-accent"
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.1 }}
          >
            {/* Recommended badge */}
            <div className="absolute top-4 right-4 bg-ops-accent text-white font-mohave font-medium text-[12px] uppercase px-3 py-1 rounded-[4px]">
              RECOMMENDED
            </div>
            <p className="font-mohave font-medium text-[14px] uppercase text-ops-accent mb-2">
              CREW LEAD
            </p>
            <p className="font-bebas text-[48px] text-white leading-none mb-1">
              $90/MONTH
            </p>
            <p className="font-mohave text-[12px] text-ops-text-secondary mb-6">
              (Coming Q2 2026)
            </p>
            <ul className="space-y-2 mb-8">
              {leadFeatures.map((feature) => (
                <li key={feature} className="font-kosugi text-[16px] text-ops-text-secondary leading-8">
                  &#8226; {feature}
                </li>
              ))}
            </ul>
            <Button variant="outline" onClick={() => {}} fullWidth>
              JOIN WAITLIST
            </Button>
            <p className="font-kosugi text-[14px] text-ops-text-secondary italic mt-4">
              Best for: Crew leads managing 1-5 person teams
            </p>
          </motion.div>
        </div>

        {/* Comparison table */}
        <motion.div {...fadeInUp}>
          <h3 className="font-bebas text-[24px] text-white uppercase text-center mb-8">
            THE HONEST COMPARISON
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-ops-card border border-ops-border rounded-ops-card overflow-hidden">
              <thead>
                <tr className="bg-ops-background">
                  <th className="text-left font-mohave font-medium text-[14px] uppercase text-ops-text-secondary p-4" />
                  <th className="text-left font-mohave font-medium text-[14px] uppercase text-ops-text-secondary p-4">
                    Jobber (5 users)
                  </th>
                  <th className="text-left font-mohave font-medium text-[14px] uppercase text-ops-accent p-4">
                    OPS (5 users)
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={i % 2 === 1 ? 'bg-white/[0.02]' : ''}
                  >
                    <td className="font-kosugi text-[14px] text-white p-4">{row.feature}</td>
                    <td className="font-kosugi text-[14px] text-ops-text-secondary p-4">{row.jobber}</td>
                    <td className="font-kosugi text-[14px] text-white p-4">{row.ops}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-kosugi text-[16px] text-ops-text-secondary italic text-center max-w-[700px] mx-auto mt-8">
            Jobber is great if you need everything today and have time to learn it.
            OPS is great if you want something your crew will actually use.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

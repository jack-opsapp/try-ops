'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/shared/Button'
import { Carousel } from '@/components/shared/Carousel'

interface PricingSectionProps {
  onDownloadClick: () => void
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

const tiers = [
  {
    name: 'FREE TRIAL',
    price: 'FREE',
    period: '30 days',
    users: 10,
    highlight: false,
    features: [
      'Full feature access',
      'Up to 10 users',
      'No credit card required',
      'Task management & scheduling',
      'Photo storage & upload',
      'Full project database',
    ],
    cta: 'START FREE TRIAL',
    ctaVariant: 'primary' as const,
    bestFor: 'Try everything before you commit',
  },
  {
    name: 'STARTER',
    price: '$90',
    period: '/mo or $864/yr (20% off)',
    users: 3,
    highlight: false,
    features: [
      'Full feature access',
      'Task management & crew scheduling',
      'Photo storage & upload',
      'Full project database',
      'Client database management',
      'Unlimited project & photo storage',
    ],
    cta: 'GET STARTED',
    ctaVariant: 'primary' as const,
    bestFor: 'Owner-operator or small crew. 1-3 people, looking to get organized.',
  },
  {
    name: 'TEAM',
    price: '$140',
    period: '/mo or $1,344/yr (20% off)',
    users: 5,
    highlight: true,
    features: [
      'Full feature access',
      'Task management & crew scheduling',
      'Photo storage & upload',
      'Full project database',
      'Client database management',
      'Unlimited project & photo storage',
    ],
    cta: 'GET STARTED',
    ctaVariant: 'primary' as const,
    bestFor: 'Growing operation. 4-5 team members, ready to streamline coordination.',
  },
  {
    name: 'BUSINESS',
    price: '$190',
    period: '/mo or $1,824/yr (20% off)',
    users: 10,
    highlight: false,
    features: [
      'Full feature access',
      'Task management & crew scheduling',
      'Photo storage & upload',
      'Full project database',
      'Client database management',
      'Unlimited project & photo storage',
    ],
    cta: 'GET STARTED',
    ctaVariant: 'primary' as const,
    bestFor: 'Established operation running many jobs concurrently. 6-10 team members, looking to optimize performance and dial in their workflow.',
  },
]

function PricingCard({ tier, onCTAClick }: { tier: typeof tiers[number]; onCTAClick: () => void }) {
  return (
    <div
      className={`relative bg-ops-card border rounded-ops-card p-5 md:p-8 h-full flex flex-col ${
        tier.highlight ? 'border-white/30' : 'border-ops-border'
      }`}
    >
      {tier.highlight && (
        <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-white/10 text-white border border-white/20 font-mohave font-medium text-[11px] uppercase px-3 py-1 rounded-[4px]">
          MOST POPULAR
        </div>
      )}

      <p className="font-mohave font-medium text-[14px] uppercase text-ops-gray-300 mb-1 md:mb-2">
        {tier.name}
      </p>
      <p className="font-bebas text-[40px] md:text-[48px] text-ops-gray-50 leading-none mb-1">
        {tier.price}
      </p>
      <p className="font-mohave text-[12px] text-ops-gray-400 mb-3 md:mb-4">
        {tier.period}
      </p>

      {/* User count badge */}
      <div className="inline-flex items-center gap-1.5 bg-ops-gray-500 rounded-[4px] px-3 py-1 mb-3 md:mb-4 w-fit">
        <svg className="w-3.5 h-3.5 text-ops-gray-200" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
        <span className="font-mohave text-[12px] text-ops-gray-200">
          {tier.users} {tier.users === 1 ? 'user' : 'users'}
        </span>
      </div>

      {/* Best for */}
      <p className="font-kosugi text-[11px] md:text-[12px] text-ops-gray-400 italic mb-4 md:mb-6">
        Best for: {tier.bestFor}
      </p>

      <ul className="space-y-1 md:space-y-2 mb-5 md:mb-8 flex-1">
        {tier.features.map((feature) => (
          <li key={feature} className="font-kosugi text-[13px] md:text-[14px] text-ops-gray-200 leading-6 md:leading-7">
            &#8226; {feature}
          </li>
        ))}
      </ul>

      <Button variant={tier.ctaVariant} fullWidth onClick={onCTAClick}>
        {tier.cta}
      </Button>
    </div>
  )
}

export function PricingSection({ onDownloadClick }: PricingSectionProps) {
  return (
    <section id="pricing" className="min-h-[100svh] flex flex-col justify-center py-6 lg:py-[120px] snap-start snap-always overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 md:px-6 lg:px-10">
        <motion.h2
          className="font-bebas text-[26px] lg:text-[40px] text-ops-gray-50 uppercase tracking-[0.05em] mb-2 lg:mb-3"
          {...fadeInUp}
        >
          START FREE. UPGRADE WHEN YOU&apos;RE READY.
        </motion.h2>

        <motion.p
          className="font-kosugi text-[14px] lg:text-[16px] text-ops-gray-300 mb-4 lg:mb-16"
          {...fadeInUp}
        >
          No credit card. No commitment. Cancel anytime.
        </motion.p>
      </div>

      <div className="max-w-[1200px] mx-auto w-full px-6 md:px-6 lg:px-10">
        {/* Pricing carousel */}
        <motion.div {...fadeInUp}>
          <Carousel gap={16}>
            {tiers.map((tier) => (
              <PricingCard key={tier.name} tier={tier} onCTAClick={onDownloadClick} />
            ))}
          </Carousel>
        </motion.div>

        {/* Callout */}
        <motion.p
          className="font-kosugi text-[13px] md:text-[14px] text-ops-gray-300 text-center mt-4 lg:mt-12 max-w-[700px] mx-auto"
          {...fadeInUp}
        >
          After your free trial, pick the plan that fits your crew size. All plans include the same features &mdash; you only pay based on how many people you&apos;re managing.
        </motion.p>
      </div>
    </section>
  )
}

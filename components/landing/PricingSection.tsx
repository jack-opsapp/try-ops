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
    name: 'TRIAL',
    price: 'FREE',
    period: '30 days',
    users: 10,
    highlight: false,
    features: [
      'Full access to all features',
      'Up to 10 users',
      'No credit card required',
      'Unlimited projects & tasks',
      'Photo documentation',
      'Calendar & scheduling',
    ],
    cta: 'START FREE TRIAL',
    ctaVariant: 'primary' as const,
  },
  {
    name: 'STARTER',
    price: '$90',
    period: '/mo or $864/yr (20% off)',
    users: 3,
    highlight: false,
    features: [
      'Up to 3 users',
      'Job scheduling & dispatch',
      'One-tap time tracking',
      'Photo documentation',
      'Client & sub-client management',
      'Calendar views',
    ],
    cta: 'GET STARTED',
    ctaVariant: 'primary' as const,
  },
  {
    name: 'TEAM',
    price: '$140',
    period: '/mo or $1,344/yr (20% off)',
    users: 5,
    highlight: true,
    features: [
      'Up to 5 users',
      'Everything in Starter',
      'Team calendar & scheduling',
      'Project notes & updates',
      'Task assignments per crew',
      'Priority support',
    ],
    cta: 'GET STARTED',
    ctaVariant: 'primary' as const,
  },
  {
    name: 'BUSINESS',
    price: '$190',
    period: '/mo or $1,824/yr (20% off)',
    users: 10,
    highlight: false,
    features: [
      'Up to 10 users',
      'Everything in Team',
      'Multi-crew management',
      'Admin controls & roles',
      'Dedicated support',
      'Company-wide dashboard',
    ],
    cta: 'GET STARTED',
    ctaVariant: 'primary' as const,
  },
]

function PricingCard({ tier }: { tier: typeof tiers[number] }) {
  return (
    <div
      className={`relative bg-ops-card border rounded-ops-card p-8 h-full flex flex-col ${
        tier.highlight ? 'border-white/30' : 'border-ops-border'
      }`}
    >
      {tier.highlight && (
        <div className="absolute top-4 right-4 bg-white/10 text-white border border-white/20 font-mohave font-medium text-[11px] uppercase px-3 py-1 rounded-[4px]">
          POPULAR
        </div>
      )}

      <p className="font-mohave font-medium text-[14px] uppercase text-ops-gray-300 mb-2">
        {tier.name}
      </p>
      <p className="font-bebas text-[48px] text-ops-gray-50 leading-none mb-1">
        {tier.price}
      </p>
      <p className="font-mohave text-[12px] text-ops-gray-400 mb-4">
        {tier.period}
      </p>

      {/* User count badge */}
      <div className="inline-flex items-center gap-1.5 bg-ops-gray-500 rounded-[4px] px-3 py-1 mb-6 w-fit">
        <svg className="w-3.5 h-3.5 text-ops-gray-200" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
        <span className="font-mohave text-[12px] text-ops-gray-200">
          {tier.users} {tier.users === 1 ? 'user' : 'users'}
        </span>
      </div>

      <ul className="space-y-2 mb-8 flex-1">
        {tier.features.map((feature) => (
          <li key={feature} className="font-kosugi text-[14px] text-ops-gray-200 leading-7">
            &#8226; {feature}
          </li>
        ))}
      </ul>

      <Button variant={tier.ctaVariant} fullWidth>
        {tier.cta}
      </Button>
    </div>
  )
}

export function PricingSection({ onDownloadClick }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-12 lg:py-[120px] snap-start snap-always">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10">
        <motion.h2
          className="font-bebas text-[26px] lg:text-[40px] text-ops-gray-50 uppercase tracking-[0.05em] mb-3"
          {...fadeInUp}
        >
          START FREE. UPGRADE WHEN YOU&apos;RE READY.
        </motion.h2>

        <motion.p
          className="font-kosugi text-[14px] lg:text-[16px] text-ops-gray-300 mb-8 lg:mb-16"
          {...fadeInUp}
        >
          No credit card. No commitment. Cancel anytime.
        </motion.p>

        {/* Pricing carousel */}
        <motion.div {...fadeInUp}>
          <Carousel gap={16}>
            {tiers.map((tier) => (
              <PricingCard key={tier.name} tier={tier} />
            ))}
          </Carousel>
        </motion.div>
      </div>
    </section>
  )
}

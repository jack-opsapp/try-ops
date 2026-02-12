'use client'

import { motion } from 'framer-motion'

interface FeatureCardProps {
  icon?: React.ReactNode
  title: string
  description: string
  forLine?: string
  bullets?: string[]
  children?: React.ReactNode
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

export function FeatureCard({ icon, title, description, forLine, bullets, children }: FeatureCardProps) {
  return (
    <motion.div
      className="bg-ops-card border border-ops-border rounded-ops-card p-8 transition-all duration-300 hover:border-ops-gray-300 hover:-translate-y-1"
      {...fadeInUp}
    >
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="font-mohave font-medium text-[18px] uppercase text-ops-gray-50 mb-4">
        {title}
      </h3>
      {bullets && bullets.length > 0 ? (
        <ul className="font-kosugi text-[16px] text-ops-text-secondary leading-relaxed mb-4 space-y-1">
          {bullets.map((bullet, i) => (
            <li key={i}>&#8226; {bullet}</li>
          ))}
        </ul>
      ) : (
        <p className="font-kosugi text-[16px] text-ops-text-secondary leading-relaxed mb-4">
          {description}
        </p>
      )}
      {forLine && (
        <p className="font-kosugi text-[14px] text-ops-gray-200 italic">
          {forLine}
        </p>
      )}
      {children}
    </motion.div>
  )
}

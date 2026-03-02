'use client'

import { motion } from 'framer-motion'
import { Carousel } from '@/components/shared/Carousel'
import type { z } from 'zod'
import type { SolutionSectionPropsSchema } from '@/lib/ab/types'

type SolutionSectionProps = z.infer<typeof SolutionSectionPropsSchema>

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

type FeatureType = SolutionSectionProps['features'][number]

function FeatureCard({ feature }: { feature: FeatureType }) {
  return (
    <div className="bg-ops-card border border-ops-border rounded-ops-card p-6 md:p-8 transition-all duration-300 hover:border-ops-gray-300 h-full">
      <h3 className="font-mohave font-medium text-[20px] uppercase text-ops-gray-50 mb-4">
        {feature.title}
      </h3>
      <p className="font-kosugi text-[16px] text-ops-gray-200 leading-relaxed mb-3">
        {feature.copy}
      </p>
      <p className="font-kosugi text-[16px] text-ops-text-secondary leading-relaxed">
        <span className="text-ops-gray-100 font-medium">Why it matters:</span> {feature.why}
      </p>
    </div>
  )
}

export function SolutionSection({ heading, features }: SolutionSectionProps) {
  return (
    <section id="solution" className="min-h-[100svh] flex flex-col justify-center py-6 lg:py-[120px] snap-start snap-always">
      <div className="max-w-[1200px] mx-auto px-6 md:px-6 lg:px-10">
        <motion.p
          className="font-kosugi text-[11px] uppercase tracking-[0.2em] text-ops-text-secondary mb-4"
          {...fadeInUp}
        >
          [ THE SOLUTION ]
        </motion.p>
        {heading && (
          <motion.h2
            className="font-mohave font-bold text-[26px] lg:text-[40px] text-ops-gray-50 uppercase tracking-[0.05em] mb-4 lg:mb-16"
            {...fadeInUp}
          >
            {heading}
          </motion.h2>
        )}

        {/* Feature grid (desktop) / carousel (mobile) */}
        <div>
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <FeatureCard feature={feature} />
              </motion.div>
            ))}
          </div>
          <div className="lg:hidden">
            <Carousel gap={16}>
              {features.map((feature) => (
                <FeatureCard key={feature.title} feature={feature} />
              ))}
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  )
}

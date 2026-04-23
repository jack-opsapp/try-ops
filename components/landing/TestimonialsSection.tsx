'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Carousel } from '@/components/shared/Carousel'
import { z } from 'zod'
import { TestimonialsSectionPropsSchema } from '@/lib/ab/types'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

// Founder quote always prepended to the display cards array
const founderQuote = {
  quote: 'I scaled a deck and railing business from 0 to $1.6M in 4 years. Tried Jobber, ServiceTitan, Housecall Pro. None of them worked the way my crew actually works. So I built OPS.',
  name: 'Jack',
  trade: 'Founder',
  location: '',
}

type Testimonial = z.infer<typeof TestimonialsSectionPropsSchema>['testimonials'][number]

const GLOW_COLOR = 'rgba(111, 148, 176, 0.8)'
const GLOW_DURATION = 0.8

function TestimonialCard({ testimonial: t }: { testimonial: Testimonial }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [glowKey, setGlowKey] = useState(0)
  const [isGlowing, setIsGlowing] = useState(false)

  useEffect(() => {
    if (!cardRef.current) return
    const measure = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }
    measure()
    const ro = new ResizeObserver(() => measure())
    ro.observe(cardRef.current)
    return () => ro.disconnect()
  }, [])

  const triggerGlow = useCallback(() => {
    if (isGlowing) return
    setIsGlowing(true)
    setGlowKey(k => k + 1)
  }, [isGlowing])

  const perimeter = 2 * (dimensions.width + dimensions.height)
  const dashLength = perimeter * 0.15
  const borderRadius = 5

  return (
    <div
      ref={cardRef}
      className="relative bg-ops-card border border-white/10 rounded-ops-card p-8 h-full flex flex-col cursor-pointer"
      onMouseEnter={triggerGlow}
      onClick={triggerGlow}
    >
      <p className="font-mono text-[16px] text-ops-gray-200 leading-relaxed flex-1 mb-6">
        &ldquo;{t.quote}&rdquo;
      </p>
      <div>
        <p className="font-mohave font-medium text-[14px] text-ops-gray-100 uppercase">
          {t.name}
        </p>
        {t.location ? (
          <p className="font-mono text-[12px] text-ops-gray-400">
            {t.trade}, {t.location}
          </p>
        ) : (
          <p className="font-mono text-[12px] text-ops-gray-400">
            {t.trade}
          </p>
        )}
      </div>

      {/* Racing glow border effect */}
      <AnimatePresence>
        {isGlowing && dimensions.width > 0 && (
          <motion.svg
            key={glowKey}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            style={{ overflow: 'visible' }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.rect
              x={0.5}
              y={0.5}
              width={dimensions.width - 1}
              height={dimensions.height - 1}
              rx={borderRadius}
              fill="none"
              stroke={GLOW_COLOR}
              strokeWidth={2}
              strokeDasharray={`${dashLength} ${perimeter - dashLength}`}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 6px ${GLOW_COLOR}) drop-shadow(0 0 14px rgba(111, 148, 176, 0.4))`,
              }}
              initial={{ strokeDashoffset: perimeter }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: GLOW_DURATION, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={() => setIsGlowing(false)}
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  )
}

type TestimonialsSectionProps = z.infer<typeof TestimonialsSectionPropsSchema>

export function TestimonialsSection({ heading, testimonials }: TestimonialsSectionProps) {
  const cards = [founderQuote, ...testimonials]

  return (
    <section id="testimonials" className="min-h-[100svh] flex flex-col justify-center py-6 lg:py-[120px] snap-start snap-always">
      <div className="max-w-[1200px] mx-auto px-6 md:px-6 lg:px-10">
        <motion.p
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-ops-text-secondary mb-4"
          {...fadeInUp}
        >
          [ THE TRADES ]
        </motion.p>
        <motion.h2
          className="font-mohave font-bold text-[26px] lg:text-[40px] text-ops-gray-50 uppercase tracking-[0.05em] mb-8 lg:mb-16"
          {...fadeInUp}
        >
          {heading ?? 'CREWS THAT SWITCHED AREN\u2019T GOING BACK'}
        </motion.h2>
      </div>

      <div className="max-w-[1200px] mx-auto w-full px-6 md:px-6 lg:px-10">
        <div>
          {/* Grid on desktop, carousel on mobile */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4">
            {cards.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <TestimonialCard testimonial={t} />
              </motion.div>
            ))}
          </div>
          <div className="lg:hidden">
            <Carousel gap={16}>
              {cards.map((t) => (
                <TestimonialCard key={t.name} testimonial={t} />
              ))}
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  )
}

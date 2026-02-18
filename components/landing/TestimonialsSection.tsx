'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Carousel } from '@/components/shared/Carousel'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

const testimonials = [
  {
    quote: 'I came to OPS from Jobber. We went from our crew ignoring the app, to being excited to use it.',
    name: 'Ryan M.',
    trade: 'HVAC',
    location: 'Fraser Valley',
  },
  {
    quote: 'OPS is saving me likely 2 hours daily of coordination and back & forth, which has impressed me, but more surprising is how much more efficient my crew is. Can\'t explain it, but they are getting jobs done faster, and we are getting less callbacks. No complaints here.',
    name: 'Jorge R.',
    trade: 'Painting Contractor',
    location: 'Kelowna',
  },
  {
    quote: 'It\'s an absolute game changer.',
    name: 'Harrison S.',
    trade: 'Landscaping',
    location: 'Victoria',
  },
  {
    quote: 'I was quite literally on the verge of firing my foreman on one of my crews; we might\'ve been less organized than we could, but his complaining was getting deafening. At a team meeting we decided to adopt a new software and Jack set us up with OPS, since then he\'s happy as a dog with two tails - if that\'s not proof I don\'t know what is.',
    name: 'Bobby L.',
    trade: 'Plumbing',
    location: 'Kamloops',
  },
]

// Founder quote shown only on mobile (desktop shows it in Hero)
const founderQuote = {
  quote: 'I scaled a deck and railing business from 0 to $1.6M in 4 years. Tried Jobber, ServiceTitan, Housecall Pro. None of them worked the way my crew actually works. So I built OPS.',
  name: 'Jack',
  trade: 'Founder',
  location: '',
}

function TestimonialCard({ testimonial: t }: { testimonial: typeof testimonials[number] }) {
  return (
    <div className="bg-ops-card rounded-ops-card p-8 h-full flex flex-col">
      <p className="font-kosugi text-[16px] text-ops-gray-200 leading-relaxed flex-1 mb-6">
        &ldquo;{t.quote}&rdquo;
      </p>
      <div>
        <p className="font-mohave font-medium text-[14px] text-ops-gray-100 uppercase">
          {t.name}
        </p>
        {t.location ? (
          <p className="font-kosugi text-[12px] text-ops-gray-400">
            {t.trade}, {t.location}
          </p>
        ) : (
          <p className="font-kosugi text-[12px] text-ops-gray-400">
            {t.trade}
          </p>
        )}
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  // Include founder quote first on mobile/tablet (desktop shows it in Hero)
  const [cards, setCards] = useState(testimonials)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setCards([founderQuote, ...testimonials])
    }
  }, [])

  return (
    <section id="testimonials" className="min-h-[100svh] flex flex-col justify-center py-6 lg:py-[120px] snap-start snap-always">
      <div className="max-w-[1200px] mx-auto px-6 md:px-6 lg:px-10">
        <motion.h2
          className="font-bebas text-[26px] lg:text-[40px] text-ops-gray-50 uppercase tracking-[0.05em] mb-8 lg:mb-16"
          {...fadeInUp}
        >
          CREWS THAT SWITCHED AREN&apos;T GOING BACK
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

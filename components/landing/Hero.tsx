'use client'

import type { z } from 'zod'
import type { HeroPropsSchema } from '@/lib/ab/types'
import { ProductProof } from './ProductProof'
import { PrimaryAction } from './PrimaryAction'
import { ComparisonPreview } from './CompareTable'
import { useCtaHandlers } from '@/lib/landing/cta-mode'
import { APPROVED_CTA_LABELS, APPROVED_OFFER } from '@/lib/landing/content-registry'

type HeroProps = z.infer<typeof HeroPropsSchema>

export function Hero({ headline, subtext, comparisonRival }: HeroProps) {
  const { secondary } = useCtaHandlers('Hero')
  return <section id="hero" className={`landing-hero${comparisonRival ? ' landing-hero-comparison' : ''}`}>
    <div className="landing-container hero-grid">
      <div className="hero-copy">
        <p className="landing-label">JOB MANAGEMENT FOR THE TRADES</p>
        <h1>{headline}</h1>
        <p className="hero-subtext">{subtext}</p>
        {comparisonRival && <ComparisonPreview rival={comparisonRival} />}
        <div className="hero-actions"><PrimaryAction section="Hero" />{secondary && <button type="button" className="landing-button landing-button-secondary" onClick={secondary}>{APPROVED_CTA_LABELS.tutorial}</button>}</div>
        <p className="hero-offer"><span className="landing-number">{APPROVED_OFFER.trialDays}</span> days free. No credit card.</p>
        <p className="hero-price">Plans from <span className="landing-number">${APPROVED_OFFER.plans[0].monthly} {APPROVED_OFFER.currency}/month</span> for up to <span className="landing-number">{APPROVED_OFFER.plans[0].seats}</span> people.</p>
        <a className="hero-details-link" href="#pricing">See all crew sizes</a>
      </div>
      <ProductProof />
    </div>
  </section>
}

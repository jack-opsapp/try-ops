'use client'

import type { z } from 'zod'
import type { PricingSectionPropsSchema } from '@/lib/ab/types'
import { APPROVED_OFFER } from '@/lib/landing/content-registry'
import { PrimaryAction } from './PrimaryAction'

type PricingSectionProps = z.infer<typeof PricingSectionPropsSchema>

export function PricingSection({ heading = 'THE RIGHT SIZE FOR YOUR CREW.', subtext = 'Job management, scheduling and photo documentation in every plan.' }: PricingSectionProps) {
  return <section id="pricing" className="landing-section">
    <div className="landing-container pricing-layout">
      <div className="section-intro"><p className="landing-label">CREW-SIZE PRICING</p><h2>{heading}</h2><p>{subtext}</p><p className="pricing-terms">Canadian dollars. Billed monthly. Taxes additional.</p><PrimaryAction section="PricingSection" /><p className="offer-note"><span className="landing-number">{APPROVED_OFFER.trialDays}</span> days free. No credit card.</p></div>
      <div className="pricing-table-wrap"><table className="pricing-table"><caption>OPS monthly plans</caption><thead><tr><th scope="col">Your crew</th><th scope="col">Monthly price</th></tr></thead><tbody>{APPROVED_OFFER.plans.map(plan => <tr key={plan.name} data-plan={plan.name}><th scope="row"><span>Up to <span className="landing-number">{plan.seats}</span> people</span><small>{plan.name}</small></th><td><strong className="landing-number">${plan.monthly}</strong><span className="landing-label"> CAD / month</span></td></tr>)}</tbody></table><p className="pricing-footnote">Choose a paid plan after your trial. Payment processing and optional services may carry separate fees. <a href="https://opsapp.co/plans">Full plan details</a>.</p></div>
    </div>
  </section>
}

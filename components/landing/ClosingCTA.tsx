'use client'
import type { z } from 'zod'
import type { ClosingCTAPropsSchema } from '@/lib/ab/types'
import { APPROVED_OFFER } from '@/lib/landing/content-registry'
import { PrimaryAction } from './PrimaryAction'

export function ClosingCTA({ headline, subtext }: z.infer<typeof ClosingCTAPropsSchema>) {
  return <section id="closing" className="landing-section landing-closing"><div className="landing-container"><p className="landing-label">PUT IT TO WORK</p><h2>{headline}</h2><p>{subtext}</p><PrimaryAction section="ClosingCTA" /><p className="offer-note"><span className="landing-number">{APPROVED_OFFER.trialDays}</span> days free. No credit card.</p></div></section>
}

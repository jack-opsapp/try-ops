import type { Metadata } from 'next'
import { LandingPageClient } from '@/components/ab/LandingPageClient'
import { PAID_PAGE_CONFIGS, paidVariantId } from '@/lib/landing/page-configs'

const SLUG = 'for/roofing' as const

export const metadata: Metadata = {
  title: 'Roofing software that runs the job from quote to invoice',
  description:
    'Quote it, schedule it, photograph it, invoice it, from the app your crew already has open. 30 days free, no credit card.',
  alternates: { canonical: 'https://try.opsapp.co/for/roofing' },
}

/**
 * Paid landing page for the "for/roofing" ad group. Fixed content, one CTA, and
 * the web signup at the end of it — the rotating A/B experiment stays on `/`.
 */
export default function Page() {
  return (
    <LandingPageClient
      config={PAID_PAGE_CONFIGS[SLUG]}
      variantId={paidVariantId(SLUG)}
      ctaMode="web-signup"
    />
  )
}

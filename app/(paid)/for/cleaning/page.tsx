import type { Metadata } from 'next'
import { LandingPageClient } from '@/components/ab/LandingPageClient'
import { PAID_PAGE_CONFIGS, paidVariantId } from '@/lib/landing/page-configs'

const SLUG = 'for/cleaning' as const

export const metadata: Metadata = {
  title: 'Cleaning business software for the crew on the route',
  description:
    'The route, the crew, the photos and the invoice in one app. Every feature on every plan. 30 days free, no credit card.',
  alternates: { canonical: 'https://try.opsapp.co/for/cleaning' },
}

/**
 * Paid landing page for the "for/cleaning" ad group. Fixed content, one CTA, and
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

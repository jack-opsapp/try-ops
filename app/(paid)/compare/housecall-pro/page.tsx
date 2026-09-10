import type { Metadata } from 'next'
import { LandingPageClient } from '@/components/ab/LandingPageClient'
import { PAID_PAGE_CONFIGS, paidVariantId } from '@/lib/landing/page-configs'

const SLUG = 'compare/housecall-pro' as const

export const metadata: Metadata = {
  title: 'OPS vs Housecall Pro — the prices, side by side',
  description:
    'Both prices read from the published pricing pages and labelled with the currency they are billed in. Decide from the numbers.',
  alternates: { canonical: 'https://try.opsapp.co/compare/housecall-pro' },
}

/**
 * Paid landing page for the "compare/housecall-pro" ad group. Fixed content, one CTA, and
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

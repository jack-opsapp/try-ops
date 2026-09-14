import type { Metadata } from 'next'
import { LandingPageClient } from '@/components/ab/LandingPageClient'
import { PAID_PAGE_CONFIGS, paidVariantId } from '@/lib/landing/page-configs'

const SLUG = 'compare/jobber' as const

export const metadata: Metadata = {
  title: 'OPS vs Jobber — the prices, side by side',
  description: 'Job details, crew scheduling and project photos for trades crews. Plans from $90 CAD/month. Try OPS free for 30 days. No credit card.',
  alternates: { canonical: 'https://try.opsapp.co/compare/jobber' },
}

/**
 * Paid landing page for the "compare/jobber" ad group. Fixed content, one CTA, and
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

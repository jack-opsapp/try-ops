import type { Metadata } from 'next'
import { LandingPageClient } from '@/components/ab/LandingPageClient'
import { PAID_PAGE_CONFIGS, paidVariantId } from '@/lib/landing/page-configs'

const SLUG = 'compare/servicetitan' as const

export const metadata: Metadata = {
  title: 'OPS vs ServiceTitan — a price you can actually read',
  description:
    'Built for crews of one to ten, with no rollout, no onboarding fee and no sales call. The price is on the page.',
  alternates: { canonical: 'https://try.opsapp.co/compare/servicetitan' },
}

/**
 * Paid landing page for the "compare/servicetitan" ad group. Fixed content, one CTA, and
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

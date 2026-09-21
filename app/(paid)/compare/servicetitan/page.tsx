import type { Metadata } from 'next'
import { LandingPageClient } from '@/components/ab/LandingPageClient'
import { PAID_PAGE_CONFIGS, paidVariantId } from '@/lib/landing/page-configs'

const SLUG = 'compare/servicetitan' as const

export const metadata: Metadata = {
  title: "A ServiceTitan alternative for a small trades crew — OPS",
  description: "OPS publishes monthly prices for crews of up to ten people. Compare your requirements, then try the job workflow free for 30 days. No credit card.",
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

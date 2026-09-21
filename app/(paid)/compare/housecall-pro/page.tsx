import type { Metadata } from 'next'
import { LandingPageClient } from '@/components/ab/LandingPageClient'
import { PAID_PAGE_CONFIGS, paidVariantId } from '@/lib/landing/page-configs'

const SLUG = 'compare/housecall-pro' as const

export const metadata: Metadata = {
  title: "OPS vs Housecall Pro — make the work the test",
  description: "Compare published crew prices and billing terms. Try the quote-to-invoice workflow with your crew in OPS. Free for 30 days. No credit card.",
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

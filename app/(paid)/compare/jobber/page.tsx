import type { Metadata } from 'next'
import { LandingPageClient } from '@/components/ab/LandingPageClient'
import { PAID_PAGE_CONFIGS, paidVariantId } from '@/lib/landing/page-configs'

const SLUG = 'compare/jobber' as const

export const metadata: Metadata = {
  title: "OPS vs Jobber — compare price and the everyday job workflow",
  description: "Compare published crew pricing, then try estimates, scheduling, job photos and invoices in OPS. A 30-day trial with no credit card.",
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

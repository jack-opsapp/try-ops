import type { Metadata } from 'next'
import { LandingPageClient } from '@/components/ab/LandingPageClient'
import { PAID_PAGE_CONFIGS, paidVariantId } from '@/lib/landing/page-configs'

const SLUG = 'for/roofing' as const

export const metadata: Metadata = {
  title: "Roofing job management — a plan and a record for every roof",
  description: "Keep the scope, crew schedule and tear-off, flashing and finish photos with the roof. Estimates and invoices on the web. Try OPS free for 30 days.",
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

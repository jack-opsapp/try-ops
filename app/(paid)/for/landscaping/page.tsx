import type { Metadata } from 'next'
import { LandingPageClient } from '@/components/ab/LandingPageClient'
import { PAID_PAGE_CONFIGS, paidVariantId } from '@/lib/landing/page-configs'

const SLUG = 'for/landscaping' as const

export const metadata: Metadata = {
  title: "Landscaping job management — a clear plan for your crew",
  description: "Property details, scheduled work and progress photos in one place. Plan and invoice on the web, with iPhone access for the crew. Try OPS free.",
  alternates: { canonical: 'https://try.opsapp.co/for/landscaping' },
}

/**
 * Paid landing page for the "for/landscaping" ad group. Fixed content, one CTA, and
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

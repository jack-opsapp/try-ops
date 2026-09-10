import type { Metadata } from 'next'
import { LandingPageClient } from '@/components/ab/LandingPageClient'
import { PAID_PAGE_CONFIGS, paidVariantId } from '@/lib/landing/page-configs'

const SLUG = 'job-management' as const

export const metadata: Metadata = {
  title: 'Job management software your crew will actually use',
  description:
    'Jobs, schedule, quotes and invoices in one app for trades crews of one to ten. Every feature on every plan. 30 days free, no credit card.',
  alternates: { canonical: 'https://try.opsapp.co/job-management' },
}

/**
 * Paid landing page for the "job-management" ad group. Fixed content, one CTA, and
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

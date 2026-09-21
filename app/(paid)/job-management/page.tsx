import type { Metadata } from 'next'
import { LandingPageClient } from '@/components/ab/LandingPageClient'
import { PAID_PAGE_CONFIGS, paidVariantId } from '@/lib/landing/page-configs'

const SLUG = 'job-management' as const

export const metadata: Metadata = {
  title: "Job management for trades — run the job with OPS",
  description: "Leads, estimates, crew schedules, project photos and invoices in one place. Web and iPhone. Plans from $90 CAD/month. Try OPS free for 30 days.",
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

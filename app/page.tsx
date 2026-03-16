import { cookies, headers } from 'next/headers'
import { fetchActiveVariant } from '@/lib/ab/fetch-config'
import { detectAudienceSignals, hasAudienceSignal } from '@/lib/ab/audience-signals'
import { applyAudienceOverrides } from '@/lib/ab/audience-overrides'
import { LandingPageClient } from '@/components/ab/LandingPageClient'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ searchParams }: PageProps) {
  const [cookieStore, headerStore, params] = await Promise.all([
    cookies(),
    headers(),
    searchParams,
  ])

  // Landing page A/B content uses 2 slots. Variant C (animation tutorial) uses A's landing content.
  // The A/B/C split only affects which tutorial the CTA routes to, not landing page content.
  const cookieVal = cookieStore.get('ops_variant')?.value
  const slot = cookieVal === 'b' ? 'b' : 'a'
  const { variantId, config: baseConfig } = await fetchActiveVariant(slot)

  // Detect audience signals from UTM params + referrer
  const referrer = headerStore.get('referer') ?? null
  const signal = detectAudienceSignals(params, referrer)

  // Apply audience-specific content overrides if any signals detected
  const config = hasAudienceSignal(signal)
    ? applyAudienceOverrides(baseConfig, signal)
    : baseConfig

  return <LandingPageClient config={config} variantId={variantId} />
}

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

  const slot = cookieStore.get('ops_variant')?.value === 'b' ? 'b' : 'a'
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

import { cookies } from 'next/headers'
import { fetchActiveVariant } from '@/lib/ab/fetch-config'
import { LandingPageClient } from '@/components/ab/LandingPageClient'

export const revalidate = 300

export default async function Page() {
  const cookieStore = await cookies()
  const slot = cookieStore.get('ops_variant')?.value === 'a' ? 'a' : 'b'
  const { variantId, config } = await fetchActiveVariant(slot)

  return <LandingPageClient config={config} variantId={variantId} />
}

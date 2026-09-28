import type { Metadata } from 'next'
import { DemoExperience } from '@/components/demo/DemoExperience'
import { safeDemoExit, type LegacySearch } from '@/lib/demo/navigation'

export const metadata: Metadata = {
  title: 'Try a sample job | OPS',
  description: 'Follow one sample job from customer email to site visit, crew work, and completion photos in OPS. Try free for 30 days. No credit card.',
  alternates: { canonical: 'https://try.opsapp.co/demo' },
  robots: { index: false, follow: true },
}

export default async function DemoPage({ searchParams }: { searchParams: Promise<LegacySearch> }) {
  const search = await searchParams
  return <DemoExperience exitHref={safeDemoExit(search.from)} />
}

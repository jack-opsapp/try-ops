import { redirect } from 'next/navigation'
import { demoDestination, type LegacySearch } from '@/lib/demo/navigation'

export default function LegacyTutorial({ searchParams }: { searchParams: LegacySearch }) {
  redirect(demoDestination(searchParams))
}

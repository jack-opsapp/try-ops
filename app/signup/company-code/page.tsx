import { redirect } from 'next/navigation'
import { legacySignupDestination, type LegacySearch } from '@/lib/demo/navigation'

export default function LegacySignup({ searchParams }: { searchParams: LegacySearch }) {
  redirect(legacySignupDestination('company-code', searchParams))
}

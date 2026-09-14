import { cookies, headers } from 'next/headers'
import { fetchActiveVariant } from '@/lib/ab/fetch-config'
import { ASSIGNMENT_COOKIE } from '@/lib/ab/identity'
import { LandingPageClient } from '@/components/ab/LandingPageClient'
export default async function Page() {
 const cookieStore=cookies(), headerStore=headers()
 const excluded=headerStore.get('x-tryops-excluded')==='1'
 const {variantId,config,assignmentId}=await fetchActiveVariant(excluded?undefined:cookieStore.get(ASSIGNMENT_COOKIE)?.value)
 return <LandingPageClient config={config} variantId={variantId} assignmentId={excluded?undefined:assignmentId} ctaMode="web-signup" />
}

import { redirect } from 'next/navigation'
// Preserve the HTTP Location header; Next 14 static redirect output can cache
// only the redirect status and the client navigation payload.
export const dynamic = 'force-dynamic'
export default function Download() {
  redirect('https://apps.apple.com/us/app/ops-job-crew-management/id6746662078')
}

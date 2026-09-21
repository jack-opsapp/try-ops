/**
 * Customer words are editorial evidence, never generated content.
 * An entry needs the original wording, correct attribution, and a documented
 * basis for publication. Historical copy with conflicting identities stays out.
 */
export interface ApprovedTestimonial {
  id: string
  quote: string
  name: string
  role: string
  sourceUrl?: string
  sourceReference: string
  approvalReference: string
}

const historicalVerification = 'Jackson-verified 2026-07-06, recorded in ops-site/docs/plans/2026-07-06-platform-redesign.md and ops-site/src/components/platform/ProofSection.tsx; commit f341761fc69ec14628139571de85b6e48256f9a8. Original customer messages were not re-inspected in this revision.'

export const APPROVED_TESTIMONIALS: Readonly<Record<string, ApprovedTestimonial>> = {
  'ryan-crew-adoption-2026-07-06': {
    id: 'ryan-crew-adoption-2026-07-06',
    quote: 'I came to OPS from Jobber. We went from our crew ignoring the app, to being excited to use it.',
    name: 'Ryan M.',
    role: 'HVAC · Fraser Valley',
    sourceUrl: 'https://opsapp.co/platform',
    sourceReference: 'ops-site/src/components/platform/ProofSection.tsx:30-37',
    approvalReference: historicalVerification,
  },
  'jorge-coordination-2026-07-06': {
    id: 'jorge-coordination-2026-07-06',
    quote: "OPS is saving me likely 2 hours daily of coordination and back & forth, which has impressed me, but more surprising is how much more efficient my crew is. Can't explain it, but they are getting jobs done faster, and we are getting less callbacks. No complaints here.",
    name: 'Jorge R.',
    role: 'Painting · Kelowna',
    sourceUrl: 'https://opsapp.co/platform',
    sourceReference: 'ops-site/src/components/platform/ProofSection.tsx:38-44',
    approvalReference: historicalVerification,
  },
}

export function isApprovedTestimonialId(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(APPROVED_TESTIMONIALS, id)
}

/** Fail closed when an old or malformed page refers to missing evidence. */
export function getApprovedTestimonials(ids: readonly string[]): ApprovedTestimonial[] {
  return Array.from(new Set(ids))
    .filter(isApprovedTestimonialId)
    .map(id => APPROVED_TESTIMONIALS[id])
}

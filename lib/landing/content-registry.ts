/** Approved product facts. A generator selects references; it cannot add claims. */
export const CONTENT_REGISTRY_VERSION = 'tryops-content:2026-09-14.v1'
export const CONTENT_CHECKED_AT = '2026-09-14'

export const APPROVED_OFFER = {
  id: 'offer.trial-monthly-cad.v1',
  trialDays: 30,
  cardRequired: false,
  trialSeats: 10,
  currency: 'CAD',
  billing: 'monthly',
  taxBehavior: 'exclusive',
  plans: [
    { name: 'Starter', monthly: 90, seats: 3 },
    { name: 'Team', monthly: 140, seats: 5 },
    { name: 'Business', monthly: 190, seats: 10 },
  ],
  checkedAt: CONTENT_CHECKED_AT,
  sources: ['https://opsapp.co/plans', 'docs/artifacts/tryops-conversion-build-2026-09-14/stripe-price-evidence.json', 'ops-web/src/lib/subscription.ts:TIER_CONFIG', 'ops-web/src/lib/stripe/subscription-mapping.ts:MAX_SEATS_BY_PLAN', 'ops-web/supabase/migrations_legacy_archive/066_refine_company_trial_trigger.sql:initialize_company_trial'],
  limits: 'Published subscription amounts. Payment processing and other usage-based services are not promised free. No lifetime free plan or universal feature parity claim.',
} as const

export const APPROVED_CTA_LABELS = {
  webTrial: 'START MY FREE TRIAL',
  appStore: 'DOWNLOAD FOR iOS',
  tutorial: 'TRY THE TUTORIAL',
} as const

export const APPROVED_CAPABILITIES = {
  'jobs.details': {
    claim: 'Keep the address, job notes and crew assignment with the job.',
    platforms: ['web', 'ios'],
    sources: ['ops-software-bible/02_USER_EXPERIENCE_AND_WORKFLOWS.md', 'ops-web/src/lib/api/services/project-service.ts'],
    limits: 'Access follows company membership and permissions. No guaranteed adoption or time-saving result.',
  },
  'jobs.schedule': {
    claim: 'See scheduled jobs and assigned work in OPS.',
    platforms: ['web', 'ios'],
    sources: ['ops-software-bible/07_SPECIALIZED_FEATURES.md:Calendar', 'ops-ios/OPS/ViewModels/CalendarViewModel.swift'],
    limits: 'No route optimization or automatic crew dispatch claim.',
  },
  'jobs.photos': {
    claim: 'Keep site photos with the project.',
    platforms: ['web', 'ios'],
    sources: ['ops-software-bible/07_SPECIALIZED_FEATURES.md:Photo Management', 'ops-web/src/lib/api/services/project-photo-service.ts'],
    limits: 'No guaranteed retention duration or universal unlimited storage claim.',
  },
  'access.web-ios': {
    claim: 'Start on the web. Use OPS for iPhone in the field.',
    platforms: ['web', 'ios'],
    sources: ['https://app.opsapp.co/register', 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078'],
    limits: 'No native Android release promise. Internet is required for web signup and shared updates. iOS offline support is workflow-specific, not a blanket promise.',
  },
  'setup.next-job': {
    claim: 'Start with one job and invite the people doing it.',
    platforms: ['web', 'ios'],
    sources: ['ops-software-bible/02_USER_EXPERIENCE_AND_WORKFLOWS.md', 'ops-web/src/app/api/setup/progress/route.ts'],
    limits: 'No migration service, import coverage or setup-time guarantee.',
  },
} as const

/** Names in old copy are not provenance. No original consent/source was provided. */
export const APPROVED_TESTIMONIALS: Record<string, never> = {}

export const APPROVED_IMAGES = {
  'ios.schedule': {
    src: '/images/product/ios-schedule.png',
    alt: 'OPS for iPhone schedule showing example jobs, dates, addresses and task types.',
    width: 1170,
    height: 2532,
    source: 'ops-site/public/dev/ref-schedule.png',
    provenance: 'Existing iOS UI reference used by ops-site phone-scene/screens/schedule-screen.ts. Fictional Miramar demonstration job data; no customer account queried.',
  },
  'ios.job-board': {
    src: '/images/product/ios-job-board.png',
    alt: 'OPS for iPhone job board showing example projects grouped by status.',
    width: 1170,
    height: 2532,
    source: 'ops-site/public/dev/ref-jobboard-1.png',
    provenance: 'Existing iOS UI reference used by ops-site phone-scene/screens/jobboard-screen.ts. Fictional demonstration jobs; no customer account queried.',
  },
} as const

export const COMPARISON_VALID_UNTIL = '2026-10-14T00:00:00.000Z'
export const APPROVED_COMPARISONS = {
  jobber: {
    name: 'Jobber', plan: 'Connect', seats: 5, monthly: 199, currency: 'USD',
    source: 'https://www.getjobber.com/pricing/',
    basis: 'Connect, includes 5 users, no commitment. Annual billing has a different price.',
    checkedAt: CONTENT_CHECKED_AT, validUntil: COMPARISON_VALID_UNTIL,
  },
  'housecall-pro': {
    name: 'Housecall Pro', plan: 'Essentials', seats: 5, monthly: 189, currency: 'USD',
    source: 'https://www.housecallpro.com/pricing/',
    basis: 'Essentials, includes 5 users, monthly billing. Annual and promotional prices differ.',
    checkedAt: CONTENT_CHECKED_AT, validUntil: COMPARISON_VALID_UNTIL,
  },
  servicetitan: {
    name: 'ServiceTitan', plan: 'Custom quote', seats: null, monthly: null, currency: null,
    source: 'https://www.servicetitan.com/pricing',
    basis: 'Per-technician pricing. Request a quote for your team and requirements.',
    checkedAt: CONTENT_CHECKED_AT, validUntil: COMPARISON_VALID_UNTIL,
  },
} as const

export type ComparisonRival = keyof typeof APPROVED_COMPARISONS

export function isComparisonCurrent(rival: ComparisonRival, now = Date.now()): boolean {
  return Number.isFinite(now) && now >= Date.parse(`${CONTENT_CHECKED_AT}T00:00:00.000Z`) && now < Date.parse(APPROVED_COMPARISONS[rival].validUntil)
}

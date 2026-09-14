import type { SectionEntry, VariantConfig } from '@/lib/ab/types'
import { APPROVED_CTA_LABELS, COMPARISON_VALID_UNTIL, type ComparisonRival } from './content-registry'

const hero = (headline: string, subtext: string, comparisonRival?: ComparisonRival): SectionEntry => ({
  type: 'Hero', props: { headline, subtext, primaryCtaLabel: APPROVED_CTA_LABELS.webTrial, secondaryCtaLabel: '', heroMode: 'product-proof', ...(comparisonRival ? { comparisonRival } : {}) },
})
const pricing: SectionEntry = { type: 'PricingSection', props: { heading: 'THE RIGHT SIZE FOR YOUR CREW.', subtext: 'Choose by team size. Job management, scheduling and photo documentation are included in every plan.' } }
const closing: SectionEntry = { type: 'ClosingCTA', props: { headline: 'START WITH THE NEXT JOB.', subtext: 'Add the job. Invite your crew. Put the plan in their hands.', primaryCtaLabel: APPROVED_CTA_LABELS.webTrial, secondaryCtaLabel: '' } }
const solution = (features: Array<{ title: string; copy: string; why: string }>): SectionEntry => ({ type: 'SolutionSection', props: { heading: 'LESS CHASING. MORE WORK DONE.', features } })
const coreFeatures = [
  { title: 'STOP REPEATING THE PLAN.', copy: 'The address, job notes and crew assignment stay with the job. Open the schedule and see what is coming up.', why: 'The day does not have to start with “where am I going?”' },
  { title: 'KEEP PHOTOS WITH THE JOB.', copy: 'Progress shots and site photos belong with the work. Find them in the project when you need them.', why: 'The right record, without searching the group chat.' },
  { title: 'START WITH ONE JOB.', copy: 'Set up the next job and invite the people doing it. Use the trial to see how OPS fits your working day.', why: 'Make the decision with your crew on real work.' },
]
const trial = { question: 'What do I get in the free trial?', answer: 'Use OPS for 30 days with up to 10 people. No credit card is required to start. After the trial, choose a paid plan to keep using OPS.' }
const devices = { question: 'Where can my crew use OPS?', answer: 'Start your account on the web. Your crew can use OPS for iPhone in the field. There is no native Android app available. Web signup and shared updates need an internet connection.' }
const switching = { question: 'How should I bring my crew across?', answer: 'Start with the next job and the people doing it. Keep your existing records while you try the workflow. If you need to import data, check the available options with support before committing to a move.' }
const faq = (questions: Array<{ question: string; answer: string }>): SectionEntry => ({ type: 'FAQSection', props: { heading: 'BEFORE YOU START.', faqs: questions } })

export const GENERAL_CONFIG: VariantConfig = { sections: [
  hero('JOB MANAGEMENT YOUR CREW WILL ACTUALLY USE', 'Put the address, schedule, job notes and photos in one place. Your crew knows what to do. You stop chasing updates.'),
  solution(coreFeatures), pricing,
  faq([trial, devices, switching, { question: 'How do I know my crew will use it?', answer: 'Try OPS together on a real job. The schedule and job details give them a clear place to start. The trial gives you time to decide whether it works for your crew.' }]), closing,
] }

function compare(rival: ComparisonRival, headline: string, subtext: string, fit: string): VariantConfig {
  return { sections: [hero(headline, subtext, rival), pricing, solution(coreFeatures), faq([
    { question: 'How should I compare the prices?', answer: 'Compare the number of people, billing commitment and features you need. OPS prices are in Canadian dollars. The published US prices are not converted. Taxes, payment fees and optional add-ons can affect your final bill.' },
    { question: 'Will OPS replace everything I use today?', answer: fit }, switching, trial, devices,
  ]), closing] }
}

function trade(headline: string, subtext: string, feature: typeof coreFeatures[number], question: { question: string; answer: string }): VariantConfig {
  return { sections: [hero(headline, subtext), solution([feature, coreFeatures[1], coreFeatures[2]]), pricing, faq([question, trial, devices, switching]), closing] }
}

export const PAID_PAGE_CONFIGS = {
  'job-management': GENERAL_CONFIG,
  'compare/jobber': compare('jobber', 'JOBBER OR OPS. SEE WHAT FITS YOUR CREW.', 'Start with the price for five people. Then look at the job screen your crew will use.', 'If Jobber already works for your crew, keep that in the decision. Try your essential jobs, scheduling and photo workflow in OPS before switching. Check any integration you rely on separately.'),
  'compare/housecall-pro': compare('housecall-pro', 'HOUSECALL PRO OR OPS. YOUR CREW, YOUR CALL.', 'Compare the price for five people, with the billing terms in plain sight.', 'List the tools your business relies on, including payments and integrations. Try the jobs, scheduling and photo workflow with your crew. Do not assume identical features because the prices are side by side.'),
  'compare/servicetitan': compare('servicetitan', 'SERVICETITAN ALTERNATIVE. A CLEAR PRICE FOR YOUR CREW.', 'OPS publishes plans for up to ten people. Start with the numbers, then try it on a real job.', 'ServiceTitan and OPS have different scopes. If you need call-centre operations or a particular enterprise integration, confirm that requirement first. Test your daily crew workflow before replacing an established system.'),
  'for/cleaning': trade('EVERY CLEAN. A CLEAR PLAN FOR YOUR CREW.', 'Put the property address, visit notes and assigned crew with each job. Keep the photos there too.', { title: 'SEND THE CREW WITH THE DETAILS.', copy: 'Put access instructions and the work to be done in the job notes. Assign the crew and schedule the visit.', why: 'Less back-and-forth before the first clean.' }, { question: 'Can I keep instructions for each property?', answer: 'Yes. Keep the address and job notes with the project, and add site photos. Check the scheduled work with your crew before the visit.' }),
  'for/landscaping': trade('EVERY PROPERTY. A CLEAR PLAN FOR YOUR CREW.', 'Know which property is next, who is on the job and what needs doing before the trailer leaves the yard.', { title: 'PUT THE PROPERTY ON THE PLAN.', copy: 'Schedule the work, assign the crew and keep site instructions on the job. Progress photos stay with the project.', why: 'The plan travels with the people doing the work.' }, { question: 'Can I organize work across several properties?', answer: 'Yes. Keep each project’s address, notes, scheduled tasks and photos together. Use the schedule to review what is planned across your properties.' }),
  'for/roofing': trade('EVERY ROOF. A CLEAR PLAN FOR YOUR CREW.', 'The address, work schedule, job notes and site photos together. Less chasing updates from the ground.', { title: 'KEEP THE RECORD WITH THE ROOF.', copy: 'Add tear-off, flashing and finish photos to the project. Keep the job notes alongside the work your crew is doing.', why: 'Find the record when a client asks about the job.' }, { question: 'Can I keep progress photos with each roof?', answer: 'Yes. Add site photos to the project so they stay with that job. Your team’s access follows the permissions set in OPS.' }),
} as const satisfies Record<string, VariantConfig>

export type PaidPageSlug = keyof typeof PAID_PAGE_CONFIGS
export const paidVariantId = (slug: PaidPageSlug): string => `paid:${slug}`

export interface ApprovedSection {
  section: SectionEntry
  factIds: string[]
  validUntil: string | null
}

/** Exact approved sections. A change to any section requires a new content version. */
export const APPROVED_SECTIONS: Record<string, ApprovedSection> = {}
for (const [route, config] of Object.entries({ general: GENERAL_CONFIG, ...PAID_PAGE_CONFIGS })) {
  for (const section of config.sections) {
    const id = `${route.replaceAll('/', '.')}.${section.type}`
    APPROVED_SECTIONS[id] = {
      section,
      factIds: ['jobs.details', 'jobs.schedule', 'jobs.photos', 'access.web-ios', 'setup.next-job', 'offer.trial-monthly-cad.v1'],
      validUntil: section.type === 'Hero' && 'comparisonRival' in section.props ? COMPARISON_VALID_UNTIL : null,
    }
  }
}
// One deliberately narrow future hypothesis; never enrolled automatically.
APPROVED_SECTIONS['general.Hero.crew-plan'] = {
  section: hero('YOUR CREW KNOWS THE PLAN. YOU GET BACK TO WORK.', 'Job management for trades crews. Put the address, schedule, job notes and photos in one place.'),
  factIds: ['jobs.details', 'jobs.schedule', 'jobs.photos'], validUntil: null,
}
export const APPROVED_SECTION_CONTENT = Object.fromEntries(Object.entries(APPROVED_SECTIONS).map(([id, entry]) => [id, entry.section]))

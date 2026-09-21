import type { SectionEntry, VariantConfig } from '@/lib/ab/types'
import { APPROVED_CTA_LABELS, COMPARISON_VALID_UNTIL, type ComparisonRival } from './content-registry'
import { APPROVED_TESTIMONIALS } from './testimonials'

const hero = (headline: string, subtext: string, comparisonRival?: ComparisonRival): SectionEntry => ({
  type: 'Hero', props: { headline, subtext, primaryCtaLabel: APPROVED_CTA_LABELS.webTrial, secondaryCtaLabel: '', heroMode: 'product-proof', ...(comparisonRival ? { comparisonRival } : {}) },
})
const pricing: SectionEntry = { type: 'PricingSection', props: { heading: 'KNOW WHAT IT COSTS BEFORE YOU START.', subtext: 'Monthly plans in Canadian dollars, sized by the people on your team.' } }
const closing: SectionEntry = { type: 'ClosingCTA', props: { headline: 'LET THE NEXT JOB PROVE IT.', subtext: 'Put a real job in OPS. See what your crew does with a clear plan.', primaryCtaLabel: APPROVED_CTA_LABELS.webTrial, secondaryCtaLabel: '' } }

// Never create a proof section from historical names or generated quotations.
const proofIds = Object.keys(APPROVED_TESTIMONIALS).slice(0, 3)
const customerProof: SectionEntry[] = proofIds.length ? [{ type: 'CustomerProofSection', props: { heading: 'FROM THE PEOPLE DOING THE WORK.', proofIds } }] : []

const coreSteps = [
  { stage: 'Quote', title: 'KNOW WHAT NEEDS A FOLLOW-UP.', copy: 'Keep client details and follow-up notes with the lead. Build the estimate with line items and review its status before the job starts.', platform: 'Owner · Web' },
  { stage: 'Plan', title: 'GIVE THE CREW THE SAME PLAN.', copy: 'Put the address, scope and assigned work on the job. Give the task a date so the crew can see where to go and what is next.', platform: 'Owner + crew · Web and iPhone' },
  { stage: 'Work', title: 'KEEP THE PHOTOS WITH THE WORK.', copy: 'Add site photos and job notes to the project. Open that record when the crew or client needs an update.', platform: 'Crew in the field · iPhone' },
  { stage: 'Invoice', title: 'SEE WHAT IS STILL OWED.', copy: 'Turn an approved estimate into an invoice. Record payments and track the outstanding balance.', platform: 'Owner · Web' },
]
const workflow = (intro: string, steps = coreSteps): SectionEntry => ({ type: 'WorkflowSection', props: { heading: 'THE JOB MOVES FORWARD. THE DETAILS STAY WITH IT.', intro, steps } })
const generalWorkflow = workflow('The enquiry is in your inbox. The plan is in a text. The photos are on someone else’s phone. OPS gives the work a place to live.')
const gettingStarted: SectionEntry = { type: 'GettingStartedSection', props: {
  heading: 'ONE JOB. YOUR CREW. SEE FOR YOURSELF.',
  intro: 'Use one real job to find out whether OPS fits. Start on the web; your crew uses the iPhone app in the field. There is no native Android app.',
  steps: [
    { title: 'Choose the next job.', copy: 'Create your company, add one project and put the address and scope in it. Keep your existing records while you try it.' },
    { title: 'Put the plan in their hands.', copy: 'Invite the people doing the work. Give a task a date and an assigned crew, then open the plan together.' },
    { title: 'Make it earn its place.', copy: 'Use the job to check the schedule, notes and photos. Decide with your crew whether the next job belongs in OPS too.' },
  ],
} }
const trial = { question: 'What happens after the free trial?', answer: 'Try OPS for 30 days with up to 10 people. No credit card is required to start. After the trial, choose a paid plan to keep using OPS. Published prices are monthly in Canadian dollars, plus tax.' }
const devices = { question: 'Which phones does my crew need?', answer: 'OPS has an iPhone app for the field and a web app for running the business. There is no native Android app. Web signup and shared updates need an internet connection.' }
const switching = { question: 'Do I have to move everything over?', answer: 'Start with the next job and the people doing it. Keep your existing records while you try the workflow. If you need to import data, check the available options with support before committing to a move.' }
const adoption = { question: 'What if my crew will not use another app?', answer: 'Give them one real job to try. Check whether they can find the address, see the assigned work and add the job photos. Use the trial to judge the handoff together before moving more work into OPS.' }
const scope = { question: 'Can I use OPS for estimates and invoices too?', answer: 'Yes. Create estimates, convert approved estimates to invoices, record payments and track what is owed. Check any payment, accounting or specialist integration you rely on before moving those workflows.' }
const faq = (questions: Array<{ question: string; answer: string }>): SectionEntry => ({ type: 'FAQSection', props: { heading: 'THE QUESTIONS BEFORE THE SWITCH.', faqs: questions } })

export const GENERAL_CONFIG: VariantConfig = { sections: [
  hero('RUN THE JOB. STOP CHASING THE DETAILS.', 'Keep leads, estimates, crew schedules and invoices in one place. Run the business on the web. Put job details and photos in your crew’s hands on iPhone.'),
  ...customerProof, generalWorkflow, gettingStarted, pricing,
  faq([adoption, switching, scope, devices, trial]), closing,
] }

function compare(rival: ComparisonRival, headline: string, subtext: string, fit: string): VariantConfig {
  return { sections: [hero(headline, subtext, rival), pricing, ...customerProof, generalWorkflow, gettingStarted, faq([
    { question: 'What would make OPS worth switching to?', answer: fit },
    adoption,
    { question: 'How should I compare the prices?', answer: 'Compare the number of people, billing commitment and features you need. OPS prices are in Canadian dollars. The published US prices are not converted. Taxes, payment fees and optional add-ons can affect your final bill.' },
    switching, scope, trial,
  ]), closing] }
}

function trade(headline: string, subtext: string, intro: string, work: typeof coreSteps[number], question: { question: string; answer: string }): VariantConfig {
  return { sections: [hero(headline, subtext), ...customerProof, workflow(intro, [coreSteps[0], coreSteps[1], work, coreSteps[3]]), gettingStarted, pricing, faq([question, adoption, switching, scope, trial]), closing] }
}

export const PAID_PAGE_CONFIGS = {
  'job-management': GENERAL_CONFIG,
  'compare/jobber': compare('jobber', 'JOBBER OR OPS. WHAT WORKS ON YOUR JOBS?', 'Compare the price for your crew, then test the everyday handoff. Estimates and invoices on the web. The job plan and photos on iPhone.', 'If Jobber works for you and your crew uses it, keep that in the decision. Test a real estimate, job handoff and invoice in OPS. A lower subscription price only helps if the tools your business depends on are there.'),
  'compare/housecall-pro': compare('housecall-pro', 'HOUSECALL PRO OR OPS. MAKE THE WORK THE TEST.', 'Put the prices beside the workflow. Plan and bill on the web. Give your crew the job details and photos on iPhone.', 'Start with the work you do every day. Try the estimate, crew schedule, job photos and invoice. Confirm any payment or integration requirement separately before replacing the system you use now.'),
  'compare/servicetitan': compare('servicetitan', 'A SERVICETITAN ALTERNATIVE FOR YOUR SMALL CREW.', 'Clear prices for crews of up to ten people. Run the business on the web and put the job plan in their hands on iPhone.', 'OPS and ServiceTitan have different scopes. Test your daily job workflow in OPS. If you need call-centre operations or a particular enterprise integration, confirm that requirement before making a switch.'),
  'for/cleaning': trade('KNOW EVERY CLEAN IS ON THE PLAN.', 'Keep property notes, assigned work and job photos together. Plan and invoice on the web. Give the cleaning crew the details on iPhone.', 'An access code in a text. A special request in your inbox. A client asking how the clean went. Keep the job details where the crew can find them.', { stage: 'Work', title: 'KEEP A RECORD OF THE CLEAN.', copy: 'Put access instructions and the agreed work in the job notes. Add site photos to the project so you have the record when a client asks.', platform: 'Crew in the field · iPhone' }, { question: 'Can I keep different instructions for each property?', answer: 'Yes. Keep the address, access instructions and work to be done in that project’s notes. Assign and date the tasks, and add site photos to the same project.' }),
  'for/landscaping': trade('SEND THE CREW OUT WITH A CLEAR PLAN.', 'The right property, scope and assigned work in your crew’s hands. Plan and invoice on the web. Keep the field crew connected on iPhone.', 'The trailer is loaded. The scope changed yesterday. Someone needs the address. Put the property details, scheduled work and photos with the job.', { stage: 'Work', title: 'KEEP THE PROPERTY DETAILS TOGETHER.', copy: 'Put site instructions and the agreed work on the project. Add progress photos as the job moves forward, so the record is there for the next conversation.', platform: 'Crew in the field · iPhone' }, { question: 'Can I organize work across several properties?', answer: 'Yes. Keep each project’s address, notes, scheduled tasks and photos together. Use the schedule to review what is planned across your properties. OPS does not promise route optimization.' }),
  'for/roofing': trade('EVERY ROOF. A PLAN AND A RECORD.', 'Give the crew the scope. Keep the photos with the roof. Plan and invoice on the web, with job details on iPhone in the field.', 'The tear-off photos are in one text thread. The flashing detail is in another. When the client calls, open the project record.', { stage: 'Work', title: 'HAVE THE PHOTOS WHEN THEY ASK.', copy: 'Add tear-off, flashing and finish photos to the project. Keep the scope and job notes alongside the record of the work.', platform: 'Crew in the field · iPhone' }, { question: 'Can I keep progress photos with each roof?', answer: 'Yes. Add site photos to the project so they stay with that roof. Keep the scope and notes there too. Your team’s access follows the permissions set in OPS.' }),
} as const satisfies Record<string, VariantConfig>

export type PaidPageSlug = keyof typeof PAID_PAGE_CONFIGS
export const paidVariantId = (slug: PaidPageSlug): string => `paid:${slug}`

export interface ApprovedSection {
  section: SectionEntry
  factIds: string[]
  validUntil: string | null
}

const workflowFacts = ['leads.tracking', 'estimates.line-items', 'jobs.details', 'jobs.schedule', 'jobs.photos', 'invoices.balances', 'access.web-ios']
function factIdsFor(section: SectionEntry): string[] {
  if (section.type === 'CustomerProofSection') return section.props.proofIds.map(id => `testimonial.${id}`)
  if (section.type === 'PricingSection') return ['offer.trial-monthly-cad.v1']
  if (section.type === 'GettingStartedSection' || section.type === 'ClosingCTA') return ['setup.next-job', 'jobs.details', 'jobs.schedule', 'jobs.photos', 'access.web-ios', 'offer.trial-monthly-cad.v1']
  return [...workflowFacts, 'offer.trial-monthly-cad.v1']
}

/** Exact approved sections. A change to any section requires a new content version. */
export const APPROVED_SECTIONS: Record<string, ApprovedSection> = {}
for (const [route, config] of Object.entries({ general: GENERAL_CONFIG, ...PAID_PAGE_CONFIGS })) {
  for (const section of config.sections) {
    const id = `${route.replaceAll('/', '.')}.${section.type}`
    APPROVED_SECTIONS[id] = {
      section,
      factIds: factIdsFor(section),
      validUntil: section.type === 'Hero' && 'comparisonRival' in section.props ? COMPARISON_VALID_UNTIL : null,
    }
  }
}
// A distinct owner-control hypothesis; never enrolled automatically.
APPROVED_SECTIONS['general.Hero.crew-plan'] = {
  section: hero('GET THE JOB OUT OF YOUR HEAD.', 'Leads, estimates, schedules and invoices on the web. Job details and photos on iPhone. Give the work a place to live, from the first enquiry to the final invoice.'),
  factIds: workflowFacts, validUntil: null,
}
export const APPROVED_SECTION_CONTENT = Object.fromEntries(Object.entries(APPROVED_SECTIONS).map(([id, entry]) => [id, entry.section]))

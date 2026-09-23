import { SAMPLE, money } from './lifecycle-data'
import type { LifecycleState } from './lifecycle-state'

export const CUTSCENE_IDS = ['inquiry', 'site-visit', 'quote-ready', 'approval', 'crew-briefing', 'workday', 'billing'] as const
export type CutsceneId = typeof CUTSCENE_IDS[number]

export interface CutsceneBeat {
  id: string
  kind: 'email' | 'record' | 'photo' | 'calendar' | 'estimate' | 'payment'
  actor: string
  actorRole: string
  eyebrow: string
  title: string
  body: string
  detail?: string
  image?: string
  direction?: 'incoming' | 'outgoing'
  emailSignature?: string[]
  messageTime?: string
  facts?: Array<{ label: string; value: string }>
  duration: number
}

export interface CutsceneScript {
  title: string
  body: string
  beats: CutsceneBeat[]
}

export const CUTSCENE_LENGTHS: Record<CutsceneId, number> = {
  inquiry: 5,
  'site-visit': 3,
  'quote-ready': 2,
  approval: 3,
  'crew-briefing': 2,
  workday: 3,
  billing: 3,
}

function selectedAssignee(state: LifecycleState) {
  return state.visitAssignee ?? SAMPLE.estimator
}

function assignedCrew(state: LifecycleState) {
  return state.assignedCrew.length > 0 ? state.assignedCrew.join(' + ') : SAMPLE.crew
}

export function cutsceneScript(id: CutsceneId, state: LifecycleState): CutsceneScript {
  const assignee = selectedAssignee(state)
  const crew = assignedCrew(state)
  const updateAuthor = state.assignedCrew[0] ?? SAMPLE.crew
  const preparesQuote = assignee === 'You' ? 'You prepare' : `${assignee} prepares`
  const quotePricing = assignee === 'You'
    ? `You set the labor and materials, then prepare ${SAMPLE.estimateNumber} for review.`
    : `${assignee} sets the labor and materials, then prepares ${SAMPLE.estimateNumber} for your review.`

  const scripts: Record<CutsceneId, CutsceneScript> = {
    inquiry: {
      title: 'From inquiry to booked visit.',
      body: 'An email comes in. Watch the conversation become a booked visit.',
      beats: [
        {
          id: 'customer-inquiry',
          kind: 'email',
          actor: SAMPLE.client,
          actorRole: 'Homeowner',
          eyebrow: 'MONDAY · 9:08 AM · EMAIL',
          title: 'Deck at Cedar Lane',
          body: `Could you replace the worn boards on our deck? The address is ${SAMPLE.address}.`,
          direction: 'incoming',
          emailSignature: ['Alex Morgan'],
          messageTime: '9:08 AM',
          duration: 4200,
        },
        {
          id: 'lead-linked',
          kind: 'record',
          actor: 'OPS',
          actorRole: 'Lead record',
          eyebrow: 'MONDAY · 9:08 AM · LEAD',
          title: 'Lead created',
          body: 'OPS creates the Cedar Lane lead and keeps Alex’s email attached to it.',
          facts: [
            { label: 'Client', value: SAMPLE.client },
            { label: 'Project', value: SAMPLE.project },
          ],
          duration: 2700,
        },
        {
          id: 'visit-proposed',
          kind: 'email',
          actor: 'You',
          actorRole: 'Operator',
          eyebrow: 'MONDAY · 9:14 AM · SENT',
          title: 'Re: Deck at Cedar Lane',
          body: 'We can visit Tuesday, Sep 22 at 10:00 AM, to look at the deck. Does that work?',
          direction: 'outgoing',
          emailSignature: ['You', 'Site visits & estimates'],
          messageTime: '9:14 AM',
          duration: 4400,
        },
        {
          id: 'visit-confirmed',
          kind: 'email',
          actor: SAMPLE.client,
          actorRole: 'Homeowner',
          eyebrow: 'MONDAY · 9:16 AM · EMAIL',
          title: 'Re: Deck at Cedar Lane',
          body: 'Yes, Tuesday at 10:00 AM works. I’ll be home to show you the deck.',
          direction: 'incoming',
          emailSignature: ['Alex Morgan'],
          messageTime: '9:16 AM',
          duration: 3700,
        },
        {
          id: 'visit-booked',
          kind: 'calendar',
          actor: 'OPS',
          actorRole: 'Schedule',
          eyebrow: 'MONDAY · 9:16 AM · CALENDAR',
          title: 'OPS booked the site visit',
          body: 'Alex confirms the time. OPS books the visit on Tuesday’s schedule.',
          facts: [
            { label: 'When', value: SAMPLE.visit },
            { label: 'Where', value: SAMPLE.address },
          ],
          duration: 3000,
        },
      ],
    },
    'site-visit': {
      title: 'The site visit comes back complete.',
      body: `${assignee} handles the delegated Tuesday visit and sends the site record back to you.`,
      beats: [
        {
          id: 'assignee-on-site',
          kind: 'calendar',
          actor: assignee,
          actorRole: 'Site visit assignee',
          eyebrow: 'TUESDAY · 10:00 AM · ON SITE',
          title: `${assignee} arrives at Cedar Lane`,
          body: `${assignee} opens the assigned visit with the address, access note and resurfacing scope.`,
          facts: [
            { label: 'Address', value: SAMPLE.address },
            { label: 'Access', value: SAMPLE.access },
          ],
          duration: 2800,
        },
        {
          id: 'visit-evidence',
          kind: 'photo',
          actor: assignee,
          actorRole: 'Site visit assignee',
          eyebrow: 'TUESDAY · 10:34 AM · SITE EVIDENCE',
          title: 'Photo and checklist captured',
          body: 'The existing deck, measurements and confirmed scope stay together in the visit record.',
          image: SAMPLE.beforePhoto,
          facts: [
            { label: 'Measure', value: SAMPLE.measurement },
            { label: 'Scope', value: 'Existing sound frame retained' },
          ],
          duration: 4000,
        },
        {
          id: 'visit-submitted',
          kind: 'record',
          actor: assignee,
          actorRole: 'Site visit assignee',
          eyebrow: 'TUESDAY · 10:41 AM · SUBMITTED',
          title: 'Completed visit sent to you',
          body: `${assignee} submits the completed form, checklist and site photo to your Operator view.`,
          direction: 'incoming',
          duration: 2800,
        },
      ],
    },
    'quote-ready': {
      title: 'Scope in. Quote ready.',
      body: `The site record is ready. ${preparesQuote} the quote for review.`,
      beats: [
        {
          id: 'scope-ready',
          kind: 'record',
          actor: assignee,
          actorRole: assignee === 'You' ? 'Operator' : 'Visit and estimate assignee',
          eyebrow: 'TUESDAY · 11:05 AM · SCOPE READY',
          title: 'Resurfacing scope ready',
          body: 'The worn boards and fascia will be replaced. The sound frame, stairs and railing stay.',
          facts: [
            { label: 'Area', value: SAMPLE.measurement },
            { label: 'Access', value: SAMPLE.access },
          ],
          duration: 3000,
        },
        {
          id: 'quote-prepared',
          kind: 'estimate',
          actor: assignee,
          actorRole: 'Estimate preparer',
          eyebrow: 'TUESDAY · 1:20 PM · QUOTE PREPARED',
          title: `${money(SAMPLE.total)} quote ready`,
          body: quotePricing,
          facts: [
            { label: 'Estimate', value: SAMPLE.estimateNumber },
            { label: 'Labor', value: money(SAMPLE.labor) },
            { label: 'Materials', value: money(SAMPLE.materials) },
          ],
          duration: 3400,
        },
      ],
    },
    approval: {
      title: 'Sent. Accepted. Ready to plan.',
      body: 'Your estimate is with Alex. Watch the customer response arrive.',
      beats: [
        {
          id: 'estimate-sent',
          kind: 'estimate',
          actor: 'You',
          actorRole: 'Operator',
          eyebrow: 'TUESDAY · 1:28 PM · SENT',
          title: 'Estimate sent to Alex',
          body: `You send ${SAMPLE.estimateNumber} for ${money(SAMPLE.total)} to Alex for review.`,
          direction: 'outgoing',
          facts: [{ label: 'Total', value: money(SAMPLE.total) }],
          duration: 2800,
        },
        {
          id: 'estimate-accepted',
          kind: 'email',
          actor: SAMPLE.client,
          actorRole: 'Homeowner',
          eyebrow: 'WEDNESDAY · 9:06 AM · EMAIL',
          title: 'Alex accepts the estimate',
          body: 'The estimate looks good. Let’s go ahead.',
          direction: 'incoming',
          duration: 3300,
        },
        {
          id: 'project-ready',
          kind: 'record',
          actor: 'OPS',
          actorRole: 'Project record',
          eyebrow: 'WEDNESDAY · 9:06 AM · PROJECT READY',
          title: 'Project and labor tasks ready',
          body: 'After acceptance, the Cedar Lane project opens with the visit record and two labor tasks attached.',
          facts: [
            { label: 'Project', value: SAMPLE.project },
            { label: 'Tasks', value: 'Deck preparation · Deck resurfacing' },
          ],
          duration: 3500,
        },
      ],
    },
    'crew-briefing': {
      title: 'Your Thursday brief.',
      body: 'The Cedar Lane task arrives with the site record and everything you need for Thursday.',
      beats: [
        {
          id: 'resurfacing-assigned',
          kind: 'record',
          actor: 'Operator',
          actorRole: 'OPS operator',
          eyebrow: 'WEDNESDAY · 4:20 PM · ASSIGNMENT',
          title: 'Resurfacing assigned to you',
          body: `The Operator assigns ${SAMPLE.task.toLowerCase()} to you with the site record, scope and access note attached.`,
          direction: 'incoming',
          facts: [
            { label: 'When', value: SAMPLE.workday },
            { label: 'Where', value: SAMPLE.address },
          ],
          duration: 3200,
        },
        {
          id: 'crew-work-finished',
          kind: 'calendar',
          actor: 'You',
          actorRole: 'Crew member',
          eyebrow: 'THURSDAY · 3:40 PM · WORK FINISHED',
          title: 'Your update is ready',
          body: 'The resurfacing is finished on site. Mark your task complete, then add the finished photo and note.',
          duration: 3300,
        },
      ],
    },
    workday: {
      title: 'The work moves forward.',
      body: 'The schedule advances. Your crew completes the tasks and keeps the project up to date.',
      beats: [
        {
          id: 'preparation-underway', kind: 'calendar', actor: SAMPLE.estimator, actorRole: 'Assigned crew',
          eyebrow: 'WEDNESDAY · SEP 23 · ON SITE', title: 'Deck preparation begins',
          body: `Mike handles deck preparation at ${SAMPLE.project}. ${crew} ${state.assignedCrew.length > 1 ? 'have' : 'has'} resurfacing on Thursday.`,
          duration: 3300,
        },
        {
          id: 'preparation-complete', kind: 'calendar', actor: crew, actorRole: 'Assigned crew',
          eyebrow: 'THURSDAY · SEP 24 · NEXT TASK', title: 'Preparation complete. Resurfacing underway',
          body: 'The preparation is checked off. The calendar moves to Thursday as the crew starts resurfacing.',
          duration: 3300,
        },
        {
          id: 'resurfacing-complete', kind: 'calendar', actor: updateAuthor, actorRole: 'Crew member',
          eyebrow: 'THURSDAY · 3:40 PM · COMPLETE', title: 'Every task complete',
          body: `${updateAuthor} finishes the resurfacing task and posts the completed photo and note.`,
          duration: 3000,
        },
      ],
    },
    billing: {
      title: 'Finished work to recorded payment.',
      body: 'All work is complete. Watch the billing record move forward.',
      beats: [
        {
          id: 'ready-to-bill',
          kind: 'record',
          actor: 'OPS',
          actorRole: 'Billing record',
          eyebrow: 'THURSDAY · 3:41 PM · READY TO BILL',
          title: 'All tasks complete',
          body: `Both labor tasks are complete. The approved ${money(SAMPLE.total)} estimate is ready to bill.`,
          facts: [
            { label: 'Estimate', value: SAMPLE.estimateNumber },
            { label: 'Total', value: money(SAMPLE.total) },
          ],
          duration: 2900,
        },
        {
          id: 'invoice-sent',
          kind: 'estimate',
          actor: 'OPS',
          actorRole: 'Invoice record',
          eyebrow: 'THURSDAY · 3:42 PM · INVOICE SENT',
          title: 'Invoice sent',
          body: 'Alex receives the invoice for the completed work.',
          direction: 'outgoing',
          facts: [
            { label: 'Invoice', value: SAMPLE.invoiceNumber },
            { label: 'Amount', value: money(SAMPLE.total) },
          ],
          duration: 3100,
        },
        {
          id: 'payment-recorded',
          kind: 'payment',
          actor: SAMPLE.client,
          actorRole: 'Customer · paid outside OPS',
          eyebrow: 'FRIDAY · 9:17 AM · PAYMENT RECORDED',
          title: 'Bank transfer recorded',
          body: `Alex pays ${money(SAMPLE.total)} by bank transfer, outside OPS. The received payment is recorded against the invoice.`,
          direction: 'incoming',
          facts: [
            { label: 'Received', value: money(SAMPLE.total) },
            { label: 'Balance', value: money(0) },
          ],
          duration: 4500,
        },
      ],
    },
  }

  return scripts[id]
}

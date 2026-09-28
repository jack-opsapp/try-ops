import { describe, expect, it } from 'vitest'
import { SAMPLE } from '@/components/demo/lifecycle-data'
import {
  initialLifecycleState, lifecycleReducer as rawLifecycleReducer, restoreLifecycleState, LIFECYCLE_REVISION, LIFECYCLE_STORAGE_KEY,
  type LifecycleAction, type LifecycleState, type Scene, type VisitAssignee,
} from '@/components/demo/lifecycle-state'

const crewNote = 'Deck finished. Side gate locked.'
const selfJourney: LifecycleAction[] = [
  { type: 'SELECT_ROLE', role: 'operator' }, { type: 'OPEN_BOOKING' },
  { type: 'ASSIGN_VISIT', member: 'You' }, { type: 'CONFIRM_SCOPE' },
  { type: 'ADD_SITE_PHOTO' }, { type: 'REVIEW_VISIT' }, { type: 'COMPLETE_VISIT' },
  { type: 'SET_DECK_WIDTH', value: 20 }, { type: 'SEND_ESTIMATE' },
  { type: 'APPROVE_ESTIMATE' }, { type: 'ASSIGN_CREW', members: ['Nick'] },
  { type: 'OPEN_COMPLETED_PROJECT' }, { type: 'OPEN_BILLING' },
  { type: 'CREATE_INVOICE' }, { type: 'RECORD_PAYMENT' },
]
const delegatedJourney: LifecycleAction[] = [
  { type: 'SELECT_ROLE', role: 'operator' }, { type: 'OPEN_BOOKING' },
  { type: 'ASSIGN_VISIT', member: 'Mike' }, { type: 'COMPLETE_VISIT' },
  { type: 'SEND_ESTIMATE' }, { type: 'APPROVE_ESTIMATE' },
  { type: 'ASSIGN_CREW', members: ['Pete'] }, { type: 'OPEN_COMPLETED_PROJECT' },
  { type: 'OPEN_BILLING' }, { type: 'CREATE_INVOICE' }, { type: 'RECORD_PAYMENT' },
]
const crewJourney: LifecycleAction[] = [
  { type: 'SELECT_ROLE', role: 'crew' }, { type: 'COMPLETE_TASK' },
  { type: 'OPEN_COMPOSER' }, { type: 'ADD_COMPLETION_PHOTO' },
  { type: 'SET_NOTE', value: `  ${crewNote}  ` }, { type: 'POST_NOTE' },
]
function lifecycleReducer(state: LifecycleState, action: LifecycleAction): LifecycleState {
  const next = rawLifecycleReducer(state, action)
  return next.cutscene ? rawLifecycleReducer(next, { type: 'SKIP_CUTSCENE' }) : next
}
function through(journey: LifecycleAction[], type: LifecycleAction['type']) {
  let state = initialLifecycleState()
  for (const action of journey) {
    state = lifecycleReducer(state, action)
    if (action.type === type) return state
  }
  throw new Error(`Missing action ${type}`)
}
function saved(state: LifecycleState) { return restoreLifecycleState(JSON.stringify(state)) }
function restoredWith(state: LifecycleState, fields: Record<string, unknown>) {
  return restoreLifecycleState(JSON.stringify({ ...state, ...fields }))
}

// Exercise each branch as a visitor would: assignments and completed actions
// decide the route, while navigation can only revisit that actual route.
describe('role-based sample job lifecycle', () => {
  it('starts with a role choice and blocks work before a role is selected', () => {
    const state = initialLifecycleState()
    expect(state).toMatchObject({ role: null, scene: 'role', visited: ['role'], furthest: 0 })
    for (const type of ['OPEN_BOOKING', 'START_VISIT', 'COMPLETE_TASK', 'SEND_ESTIMATE', 'OPEN_BILLING'] as const) {
      expect(lifecycleReducer(state, { type })).toBe(state)
    }
    expect(lifecycleReducer(state, { type: 'BACK' })).toBe(state)
    expect(lifecycleReducer(state, { type: 'SELECT_ROLE', role: 'unknown' as 'operator' })).toBe(state)
  })

  it('starts Operators at the inquiry and Crew at their assigned work', () => {
    expect(through(selfJourney, 'SELECT_ROLE')).toMatchObject({ role: 'operator', scene: 'inquiry', visited: ['role', 'inquiry'], visitAssignee: null, estimateSent: false })
    const crew = through(crewJourney, 'SELECT_ROLE')
    expect(crew).toMatchObject({
      role: 'crew', scene: 'crew', visited: ['role', 'crew'], visitAssignee: 'Mike',
      scopeConfirmed: true, visitPhoto: true, visitCompleted: true,
      estimateSent: true, estimateApproved: true, crewAssigned: true, assignedCrew: ['Pete'],
      taskCompleted: false, completionPhoto: false, postedNote: '', invoiceCreated: false,
    })
    expect(crew.visited).not.toContain('estimate')
    expect(saved(crew)).toEqual(crew)
  })

  it.each(['Mike', 'Nick'] as VisitAssignee[])('preserves the exact delegated assignee %s without making the Operator capture the visit', member => {
    const booked = through(selfJourney, 'OPEN_BOOKING')
    const review = lifecycleReducer(booked, { type: 'ASSIGN_VISIT', member })
    expect(review).toMatchObject({ role: 'operator', scene: 'review', visitAssignee: member, scopeConfirmed: true, visitPhoto: true, visitCompleted: true })
    expect(review.visited).toEqual(['role', 'inquiry', 'booked', 'review'])
    expect(review.visited).not.toContain('visit')
    expect(saved(review)).toEqual(review)
    expect(lifecycleReducer(review, { type: 'ADD_SITE_PHOTO' })).toBe(review)
    expect(lifecycleReducer(review, { type: 'CONFIRM_SCOPE' })).toBe(review)
    const estimate = lifecycleReducer(review, { type: 'COMPLETE_VISIT' })
    expect(estimate).toMatchObject({ scene: 'estimate', visitAssignee: member, role: 'operator' })
  })

  it('requires both scope and photo when the Operator assigns the visit to themselves', () => {
    const visit = through(selfJourney, 'ASSIGN_VISIT')
    expect(visit).toMatchObject({ role: 'operator', scene: 'visit', visitAssignee: 'You', scopeConfirmed: false, visitPhoto: false, visitCompleted: false })
    expect(lifecycleReducer(visit, { type: 'REVIEW_VISIT' })).toBe(visit)
    const scoped = lifecycleReducer(visit, { type: 'CONFIRM_SCOPE' })
    expect(lifecycleReducer(scoped, { type: 'REVIEW_VISIT' })).toBe(scoped)
    const photographed = lifecycleReducer(visit, { type: 'ADD_SITE_PHOTO' })
    expect(lifecycleReducer(photographed, { type: 'REVIEW_VISIT' })).toBe(photographed)
    const ready = lifecycleReducer(scoped, { type: 'ADD_SITE_PHOTO' })
    expect(lifecycleReducer(ready, { type: 'REVIEW_VISIT' })).toMatchObject({ scene: 'review', visitCompleted: false })
    expect(lifecycleReducer(lifecycleReducer(ready, { type: 'REVIEW_VISIT' }), { type: 'COMPLETE_VISIT' })).toMatchObject({ scene: 'estimate', visitCompleted: true })
  })

  it('allows an unfinished scope answer to be corrected without discarding the photo', () => {
    const ready = through(selfJourney, 'ADD_SITE_PHOTO')
    const unchecked = lifecycleReducer(ready, { type: 'CONFIRM_SCOPE' })
    expect(unchecked).toMatchObject({ scopeConfirmed: false, visitPhoto: true })
    expect(lifecycleReducer(unchecked, { type: 'REVIEW_VISIT' })).toBe(unchecked)
    expect(saved(unchecked)).toEqual(unchecked)
  })

  it('preserves a completed site visit when revisiting its checklist', () => {
    const completed = through(selfJourney, 'COMPLETE_VISIT')
    const revisit = lifecycleReducer(completed, { type: 'NAVIGATE', scene: 'visit' })
    const toggled = lifecycleReducer(revisit, { type: 'CONFIRM_SCOPE' })
    expect(toggled).toEqual(revisit)
    expect(saved(toggled)).toEqual(toggled)
  })

  it('requires an assignment before starting and prevents reassignment of a progressed visit', () => {
    const booked = through(selfJourney, 'OPEN_BOOKING')
    expect(lifecycleReducer(booked, { type: 'START_VISIT' })).toBe(booked)
    expect(lifecycleReducer(booked, { type: 'ASSIGN_VISIT', member: 'Unknown' as VisitAssignee })).toBe(booked)
    const review = through(delegatedJourney, 'ASSIGN_VISIT')
    const back = lifecycleReducer(review, { type: 'BACK' })
    expect(back.scene).toBe('booked')
    expect(lifecycleReducer(back, { type: 'ASSIGN_VISIT', member: 'You' })).toBe(back)
    expect(lifecycleReducer(back, { type: 'START_VISIT' })).toEqual(review)
  })

  it('sends the estimate before the accepted state can open the project', () => {
    const estimate = through(selfJourney, 'COMPLETE_VISIT')
    expect(lifecycleReducer(estimate, { type: 'APPROVE_ESTIMATE' })).toBe(estimate)
    expect(lifecycleReducer(estimate, { type: 'ASSIGN_CREW', members: ['Nick'] })).toBe(estimate)
    const accepted = rawLifecycleReducer(estimate, { type: 'SEND_ESTIMATE' })
    expect(accepted).toMatchObject({
      scene: 'accepted', estimateSent: true, estimateApproved: false,
      cutscene: { id: 'approval', beat: 0, replay: false },
    })
    expect(rawLifecycleReducer(accepted, { type: 'APPROVE_ESTIMATE' })).toBe(accepted)
    const project = rawLifecycleReducer(accepted, { type: 'SKIP_CUTSCENE' })
    expect(project).toMatchObject({ scene: 'project', estimateSent: true, estimateApproved: true, crewAssigned: false, cutscene: null })
  })

  it('keeps the custom-tool dimension within supported options and the estimate step', () => {
    const inquiry = through(selfJourney, 'SELECT_ROLE')
    expect(lifecycleReducer(inquiry, { type: 'SET_DECK_WIDTH', value: 20 })).toBe(inquiry)
    const estimate = through(selfJourney, 'COMPLETE_VISIT')
    for (const value of [12, 16, 20] as const) {
      const changed = lifecycleReducer(estimate, { type: 'SET_DECK_WIDTH', value })
      expect(changed.deckWidth).toBe(value)
      expect(saved(changed)).toEqual(changed)
    }
    expect(lifecycleReducer(estimate, { type: 'SET_DECK_WIDTH', value: 24 as 20 })).toBe(estimate)
  })

  it('preserves only the selected crew through incoming work and resume', () => {
    const project = through(selfJourney, 'APPROVE_ESTIMATE')
    const calendar = lifecycleReducer(project, { type: 'ASSIGN_CREW', members: ['Nick'] })
    expect(calendar).toMatchObject({ scene: 'calendar', assignedCrew: ['Nick'], taskCompleted: true, completionPhoto: true, postedNote: SAMPLE.note })
    expect(saved(calendar).assignedCrew).toEqual(['Nick'])
    for (const members of [[], ['Pete', 'Pete'], ['Unknown'], ['Pete', 'Nick', 'Pete']]) {
      expect(lifecycleReducer(project, { type: 'ASSIGN_CREW', members: members as ('Pete' | 'Nick')[] })).toBe(project)
    }
    expect(lifecycleReducer(calendar, { type: 'ASSIGN_CREW', members: ['Pete'] })).toBe(calendar)
  })

  it.each([['self-assigned', selfJourney], ['delegated', delegatedJourney]] as const)('%s Operators receive crew evidence without changing roles', (_name, journey) => {
    const project = through([...journey], 'APPROVE_ESTIMATE')
    expect(lifecycleReducer(project, { type: 'OPEN_COMPLETED_PROJECT' })).toBe(project)
    const calendar = through([...journey], 'ASSIGN_CREW')
    expect(lifecycleReducer(calendar, { type: 'VIEW_CREW' })).toBe(calendar)
    expect(lifecycleReducer(calendar, { type: 'COMPLETE_TASK' })).toBe(calendar)
    const activity = lifecycleReducer(calendar, { type: 'OPEN_COMPLETED_PROJECT' })
    expect(activity).toMatchObject({ role: 'operator', scene: 'activity', taskCompleted: true, completionPhoto: true, postedNote: SAMPLE.note, invoiceCreated: false })
    expect(activity.visited).not.toContain('crew')
    expect(activity.visited).not.toContain('compose')
  })

  it('moves assignment straight into a three-beat calendar workday and rejects an early completion tap', () => {
    const project = through(selfJourney, 'APPROVE_ESTIMATE')
    let calendar = rawLifecycleReducer(project, { type: 'ASSIGN_CREW', members: ['Nick'] })
    expect(calendar).toMatchObject({
      scene: 'calendar', visited: [...project.visited, 'calendar'], crewAssigned: true,
      assignedCrew: ['Nick'], taskCompleted: false, completionPhoto: false, postedNote: '',
      cutscene: { id: 'workday', beat: 0, replay: false },
    })
    expect(rawLifecycleReducer(calendar, { type: 'OPEN_COMPLETED_PROJECT' })).toBe(calendar)

    calendar = rawLifecycleReducer(calendar, { type: 'ADVANCE_CUTSCENE' })
    expect(calendar).toMatchObject({ scene: 'calendar', taskCompleted: false, cutscene: { id: 'workday', beat: 1, replay: false } })
    expect(saved(calendar)).toEqual(calendar)
    calendar = rawLifecycleReducer(calendar, { type: 'ADVANCE_CUTSCENE' })
    expect(calendar).toMatchObject({ scene: 'calendar', taskCompleted: false, cutscene: { id: 'workday', beat: 2, replay: false } })
    expect(saved(calendar)).toEqual(calendar)
    calendar = rawLifecycleReducer(calendar, { type: 'ADVANCE_CUTSCENE' })
    expect(calendar).toMatchObject({ scene: 'calendar', taskCompleted: true, completionPhoto: true, postedNote: SAMPLE.note, cutscene: null })
    expect(saved(calendar)).toEqual(calendar)
  })

  it('keeps completed calendar notification context durable and makes calendar and activity replay read-only', () => {
    const calendar = through(selfJourney, 'ASSIGN_CREW')
    expect(saved(calendar)).toEqual(calendar)

    const calendarReplay = rawLifecycleReducer(calendar, { type: 'REPLAY_CUTSCENE' })
    expect(calendarReplay).toMatchObject({ scene: 'calendar', cutscene: { id: 'workday', beat: 0, replay: true } })
    expect(rawLifecycleReducer(calendarReplay, { type: 'SKIP_CUTSCENE' })).toEqual(calendar)

    const activity = rawLifecycleReducer(calendar, { type: 'OPEN_COMPLETED_PROJECT' })
    expect(activity).toMatchObject({ scene: 'activity', taskCompleted: true, completionPhoto: true, postedNote: SAMPLE.note })
    const activityReplay = rawLifecycleReducer(activity, { type: 'REPLAY_CUTSCENE' })
    expect(activityReplay).toMatchObject({ scene: 'activity', cutscene: { id: 'workday', beat: 0, replay: true } })
    expect(rawLifecycleReducer(activityReplay, { type: 'SKIP_CUTSCENE' })).toEqual(activity)
  })

  it('returns from calendar to the assigned project and resumes unfinished workday context on revisit', () => {
    const project = through(selfJourney, 'APPROVE_ESTIMATE')
    const pending = rawLifecycleReducer(project, { type: 'ASSIGN_CREW', members: ['Pete'] })
    const back = rawLifecycleReducer(pending, { type: 'BACK' })
    expect(back).toMatchObject({ scene: 'project', crewAssigned: true, assignedCrew: ['Pete'], cutscene: null })
    const returned = rawLifecycleReducer(back, { type: 'NAVIGATE', scene: 'calendar' })
    expect(returned).toMatchObject({ scene: 'calendar', taskCompleted: false, cutscene: { id: 'workday', beat: 0, replay: false } })
  })

  it('does not mistake completing a Crew task for posting evidence', () => {
    const crew = through(crewJourney, 'SELECT_ROLE')
    expect(lifecycleReducer(crew, { type: 'OPEN_COMPOSER' })).toBe(crew)
    const complete = through(crewJourney, 'COMPLETE_TASK')
    expect(complete).toMatchObject({ role: 'crew', scene: 'crew', taskCompleted: true, completionPhoto: false, postedNote: '', paymentRecorded: false })
    const compose = lifecycleReducer(complete, { type: 'OPEN_COMPOSER' })
    expect(lifecycleReducer(compose, { type: 'POST_NOTE' })).toBe(compose)
    const blankNote = lifecycleReducer(through(crewJourney, 'ADD_COMPLETION_PHOTO'), { type: 'SET_NOTE', value: ' \n ' })
    expect(lifecycleReducer(blankNote, { type: 'POST_NOTE' })).toBe(blankNote)
    const posted = through(crewJourney, 'POST_NOTE')
    expect(posted).toMatchObject({ role: 'crew', scene: 'activity', postedNote: crewNote, completionPhoto: true })
  })

  it('keeps Crew out of Operator billing and assignment actions at every stage', () => {
    let state = initialLifecycleState()
    for (const action of crewJourney) {
      state = lifecycleReducer(state, action)
      for (const type of ['OPEN_BOOKING', 'OPEN_BILLING', 'CREATE_INVOICE', 'RECORD_PAYMENT', 'OPEN_COMPLETED_PROJECT'] as const) {
        expect(lifecycleReducer(state, { type })).toBe(state)
      }
      expect(lifecycleReducer(state, { type: 'ASSIGN_VISIT', member: 'You' })).toBe(state)
      expect(lifecycleReducer(state, { type: 'ASSIGN_CREW', members: ['Nick'] })).toBe(state)
    }
  })

  it('materializes the incoming invoice and external receipt when billing context finishes', () => {
    const readyToBill = through(selfJourney, 'OPEN_BILLING')
    expect(readyToBill).toMatchObject({ scene: 'billing', invoiceCreated: true, paymentRecorded: true, cutscene: null })
    expect(lifecycleReducer(readyToBill, { type: 'CREATE_INVOICE' })).toBe(readyToBill)
    expect(lifecycleReducer(readyToBill, { type: 'RECORD_PAYMENT' })).toBe(readyToBill)
    expect(readyToBill.postedNote).toBe(SAMPLE.note)
  })

  it.each([['self', selfJourney], ['delegated', delegatedJourney], ['crew', crewJourney]] as const)('makes duplicate one-way actions harmless on the %s path', (_name, journey) => {
    let state = initialLifecycleState()
    for (const action of journey) {
      state = lifecycleReducer(state, action)
      // CONFIRM_SCOPE is intentionally reversible while the visit is unfinished.
      if (action.type !== 'CONFIRM_SCOPE') expect(lifecycleReducer(state, action)).toEqual(state)
    }
  })

  it.each([['self', selfJourney], ['delegated', delegatedJourney], ['crew', crewJourney]] as const)('restores every reachable %s handoff, including revisiting an earlier screen', (_name, journey) => {
    let state = initialLifecycleState()
    expect(saved(state)).toEqual(state)
    for (const action of journey) {
      state = lifecycleReducer(state, action)
      expect(saved(state)).toEqual(state)
      for (const scene of state.visited) {
        const revisited = lifecycleReducer(state, { type: 'NAVIGATE', scene })
        expect(saved(revisited)).toEqual(revisited)
      }
    }
  })

  it.each([['self', selfJourney], ['delegated', delegatedJourney], ['crew', crewJourney]] as const)('Back follows only the visited %s branch and restart clears the record', (_name, journey) => {
    let state = journey.reduce(lifecycleReducer, initialLifecycleState())
    const end = state
    for (const scene of [...state.visited].reverse().slice(1)) {
      state = lifecycleReducer(state, { type: 'BACK' })
      expect(state).toEqual({ ...end, scene })
    }
    expect(state.scene).toBe('role')
    expect(lifecycleReducer(state, { type: 'BACK' })).toBe(state)
    expect(lifecycleReducer(state, { type: 'RESTART' })).toEqual(initialLifecycleState())
  })

  it('blocks forged future and cross-branch navigation even when the scene index is lower', () => {
    const inquiry = through(selfJourney, 'SELECT_ROLE')
    expect(lifecycleReducer(inquiry, { type: 'NAVIGATE', scene: 'billing' })).toBe(inquiry)
    const delegated = through(delegatedJourney, 'RECORD_PAYMENT')
    for (const scene of ['visit', 'crew', 'compose', 'unknown'] as Scene[]) {
      expect(lifecycleReducer(delegated, { type: 'NAVIGATE', scene })).toBe(delegated)
    }
    const crew = through(crewJourney, 'POST_NOTE')
    for (const scene of ['inquiry', 'booked', 'visit', 'review', 'estimate', 'accepted', 'project', 'calendar', 'billing'] as Scene[]) {
      expect(lifecycleReducer(crew, { type: 'NAVIGATE', scene })).toBe(crew)
    }
  })

  it('switching roles from the opening resets the previous role and job progress', () => {
    const paid = through(selfJourney, 'RECORD_PAYMENT')
    expect(lifecycleReducer(paid, { type: 'SELECT_ROLE', role: 'crew' })).toBe(paid)
    const role = lifecycleReducer(paid, { type: 'NAVIGATE', scene: 'role' })
    expect(lifecycleReducer(role, { type: 'SELECT_ROLE', role: 'crew' })).toEqual(through(crewJourney, 'SELECT_ROLE'))
  })

  it('persists an exact unsent Crew draft separately from the posted note', () => {
    const compose = through(crewJourney, 'OPEN_COMPOSER')
    const draft = lifecycleReducer(compose, { type: 'SET_NOTE', value: 'Not posted yet — leave the gate open.' })
    expect(saved(draft)).toMatchObject({ noteDraft: 'Not posted yet — leave the gate open.', postedNote: '', completionPhoto: false })
    const posted = through(crewJourney, 'POST_NOTE')
    const revisited = lifecycleReducer(posted, { type: 'BACK' })
    const editing = lifecycleReducer(revisited, { type: 'SET_NOTE', value: 'x'.repeat(300) })
    expect(editing.noteDraft).toHaveLength(280)
    expect(editing.postedNote).toBe(crewNote)
    expect(saved(editing)).toEqual(editing)
  })
})

describe('strict lifecycle resume validation', () => {
  it.each([null, '', '{broken', 'null', '[]', '42', '"inquiry"'])('starts over for unreadable storage: %s', raw => {
    expect(restoreLifecycleState(raw)).toEqual(initialLifecycleState())
  })

  it.each(['crew-job-v1', 'job-lifecycle-v2', 'job-lifecycle-v3', 'job-lifecycle-v4', 'job-lifecycle-v5', null])('resets another revision: %s', revision => {
    expect(LIFECYCLE_REVISION).toBe('job-lifecycle-v6')
    expect(LIFECYCLE_STORAGE_KEY).toBe('ops:demo:lifecycle:v6')
    expect(restoredWith(through(selfJourney, 'RECORD_PAYMENT'), { revision })).toEqual(initialLifecycleState())
  })

  it.each([
    { scene: ['inquiry'] }, { scene: 'unknown' }, { role: 'estimator' }, { role: null },
    { visitAssignee: 'Unknown' }, { visitAssignee: ['Mike'] }, { deckWidth: 24 }, { deckWidth: '16' },
    { furthest: -1 }, { furthest: 13 }, { furthest: '12' }, { furthest: 1.5 },
    { scopeConfirmed: 'true' }, { visitPhoto: 'true' }, { estimateSent: 1 }, { invoiceCreated: null },
    { noteDraft: null }, { noteDraft: 'x'.repeat(281) }, { postedNote: 'x'.repeat(281) },
    { assignedCrew: [] }, { assignedCrew: ['Unknown'] }, { assignedCrew: ['Nick', 'Nick'] },
    { assignedCrew: null }, { visited: null }, { visited: [] }, { visited: ['role', 'billing'] },
  ])('rejects malformed fields in a completed record: %j', fields => {
    expect(restoredWith(through(selfJourney, 'RECORD_PAYMENT'), fields)).toEqual(initialLifecycleState())
  })

  it.each([
    { scopeConfirmed: false }, { visitPhoto: false }, { visitCompleted: false },
    { estimateSent: false }, { estimateApproved: false }, { crewAssigned: false },
    { taskCompleted: false }, { completionPhoto: false }, { postedNote: '' },
    { postedNote: '   ' }, { invoiceCreated: false }, { scene: 'inquiry', furthest: 1 },
  ])('rejects downstream progress without its prerequisites: %j', fields => {
    expect(restoredWith(through(selfJourney, 'RECORD_PAYMENT'), fields)).toEqual(initialLifecycleState())
  })

  it('rejects future, reordered, duplicate or cross-branch visited history', () => {
    const paid = through(delegatedJourney, 'RECORD_PAYMENT')
    expect(restoredWith(paid, { visited: [...paid.visited, 'billing'] })).toEqual(initialLifecycleState())
    expect(restoredWith(paid, { visited: ['role', 'booked', 'inquiry', ...paid.visited.slice(3)] })).toEqual(initialLifecycleState())
    expect(restoredWith(paid, { visited: ['role', 'inquiry', 'booked', 'visit', ...paid.visited.slice(3)] })).toEqual(initialLifecycleState())
    expect(restoredWith(paid, { visited: paid.visited.slice(1) })).toEqual(initialLifecycleState())
    const inquiry = through(selfJourney, 'SELECT_ROLE')
    expect(restoredWith(inquiry, { scene: 'billing', furthest: 11, visited: ['role', 'inquiry', 'billing'] })).toEqual(initialLifecycleState())
    const crew = through(crewJourney, 'POST_NOTE')
    expect(restoredWith(crew, { scene: 'billing', furthest: 11, visited: [...crew.visited, 'billing'] })).toEqual(initialLifecycleState())
  })

  it('rejects substituted prepared Crew context and invented Crew financial work', () => {
    const crew = through(crewJourney, 'POST_NOTE')
    for (const fields of [{ assignedCrew: ['Nick'] }, { assignedCrew: ['Pete', 'Nick'] }, { visitAssignee: 'You' }, { invoiceCreated: true }, { paymentRecorded: true }]) {
      expect(restoredWith(crew, fields)).toEqual(initialLifecycleState())
    }
    expect(restoredWith(through(crewJourney, 'COMPLETE_TASK'), { completionPhoto: true })).toEqual(initialLifecycleState())
  })

  it('rejects invoice creation or payment outside the billing path', () => {
    const activity = through(selfJourney, 'OPEN_COMPLETED_PROJECT')
    expect(restoredWith(activity, { invoiceCreated: true })).toEqual(initialLifecycleState())
    expect(restoredWith(activity, { paymentRecorded: true })).toEqual(initialLifecycleState())
    expect(restoredWith(through(selfJourney, 'OPEN_BILLING'), { invoiceCreated: false })).toEqual(initialLifecycleState())
  })
})

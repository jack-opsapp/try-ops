import { describe, expect, it } from 'vitest'
import {
  initialLifecycleState, lifecycleReducer, restoreLifecycleState,
  type LifecycleAction, type LifecycleState,
} from '@/components/demo/lifecycle-state'

const journey: LifecycleAction[] = [
  { type: 'OPEN_BOOKING' }, { type: 'START_VISIT' }, { type: 'ADD_SITE_PHOTO' },
  { type: 'REVIEW_VISIT' }, { type: 'COMPLETE_VISIT' }, { type: 'APPROVE_ESTIMATE' },
  { type: 'ASSIGN_CREW' }, { type: 'VIEW_CREW' }, { type: 'COMPLETE_TASK' },
  { type: 'OPEN_COMPOSER' }, { type: 'ADD_COMPLETION_PHOTO' },
  { type: 'SET_NOTE', value: '  Patio finished. Side gate locked.  ' },
  { type: 'POST_NOTE' }, { type: 'OPEN_BILLING' }, { type: 'RECORD_PAYMENT' },
]
function through(type: LifecycleAction['type']) {
  let state = initialLifecycleState()
  for (const action of journey) {
    state = lifecycleReducer(state, action)
    if (action.type === type) return state
  }
  throw new Error(`Missing action ${type}`)
}
function saved(state: LifecycleState) { return restoreLifecycleState(JSON.stringify(state)) }

describe('sample job lifecycle integrity', () => {
  it('requires captured evidence, assignment and a real crew update before each handoff', () => {
    const inquiry = initialLifecycleState()
    expect(lifecycleReducer(inquiry, { type: 'START_VISIT' })).toEqual(inquiry)
    expect(lifecycleReducer(inquiry, { type: 'NAVIGATE', scene: 'billing' })).toEqual(inquiry)
    const visit = through('START_VISIT')
    expect(lifecycleReducer(visit, { type: 'REVIEW_VISIT' })).toEqual(visit)
    const project = through('APPROVE_ESTIMATE')
    expect(lifecycleReducer(project, { type: 'VIEW_CREW' })).toEqual(project)
    const crew = through('VIEW_CREW')
    expect(lifecycleReducer(crew, { type: 'OPEN_COMPOSER' })).toEqual(crew)
    const compose = through('OPEN_COMPOSER')
    expect(lifecycleReducer(compose, { type: 'POST_NOTE' })).toEqual(compose)
    const blankNote = lifecycleReducer(through('ADD_COMPLETION_PHOTO'), { type: 'SET_NOTE', value: ' \n ' })
    expect(lifecycleReducer(blankNote, { type: 'POST_NOTE' })).toEqual(blankNote)
  })

  it('does not mistake completing a task for posting evidence or receiving money', () => {
    const complete = through('COMPLETE_TASK')
    expect(complete).toMatchObject({ scene: 'crew', taskCompleted: true, completionPhoto: false, postedNote: '', paymentRecorded: false })
    expect(lifecycleReducer(complete, { type: 'OPEN_BILLING' })).toEqual(complete)
    expect(lifecycleReducer(complete, { type: 'RECORD_PAYMENT' })).toEqual(complete)
    const posted = through('POST_NOTE')
    expect(posted).toMatchObject({ scene: 'activity', postedNote: 'Patio finished. Side gate locked.', completionPhoto: true, paymentRecorded: false })
  })

  it('makes repeated task actions idempotent, including a second payment recording', () => {
    let state = initialLifecycleState()
    for (const action of journey) {
      state = lifecycleReducer(state, action)
      expect(lifecycleReducer(state, action)).toEqual(state)
    }
  })

  it('preserves completed work while navigating back and forward, and clears it only on restart', () => {
    const paid = through('RECORD_PAYMENT')
    const previous = lifecycleReducer(paid, { type: 'BACK' })
    expect(previous).toEqual({ ...paid, scene: 'activity' })
    const inquiry = lifecycleReducer(previous, { type: 'NAVIGATE', scene: 'inquiry' })
    expect(inquiry).toEqual({ ...paid, scene: 'inquiry' })
    expect(saved(inquiry)).toEqual(inquiry)
    expect(lifecycleReducer(inquiry, { type: 'NAVIGATE', scene: 'billing' })).toEqual(paid)
    expect(lifecycleReducer(paid, { type: 'RESTART' })).toEqual(initialLifecycleState())
  })

  it('records an external receipt without changing the crew post, photos or completed work', () => {
    const invoice = through('OPEN_BILLING')
    const receipt = lifecycleReducer(invoice, { type: 'RECORD_PAYMENT' })
    expect(receipt).toEqual({ ...invoice, paymentRecorded: true })
    expect(receipt.postedNote).toBe('Patio finished. Side gate locked.')
  })

  it('preserves the selected crew through handoff and resume, without assigning unselected people', () => {
    const project = through('APPROVE_ESTIMATE')
    const assigned = lifecycleReducer(project, { type: 'ASSIGN_CREW', members: ['Nick'] })
    expect(assigned.assignedCrew).toEqual(['Nick'])
    const crew = lifecycleReducer(assigned, { type: 'VIEW_CREW' })
    expect(saved(crew).assignedCrew).toEqual(['Nick'])
    expect(lifecycleReducer(project, { type: 'ASSIGN_CREW', members: [] })).toEqual(project)
    expect(lifecycleReducer(project, { type: 'ASSIGN_CREW', members: ['Pete', 'Pete'] })).toEqual(project)
    expect(restoreLifecycleState(JSON.stringify({ ...crew, assignedCrew: [] }))).toEqual(initialLifecycleState())
    expect(restoreLifecycleState(JSON.stringify({ ...crew, assignedCrew: ['Unknown'] }))).toEqual(initialLifecycleState())
  })

  it('restores each reachable handoff and the exact unsent note draft', () => {
    let state = initialLifecycleState()
    expect(saved(state)).toEqual(state)
    for (const action of journey) {
      state = lifecycleReducer(state, action)
      expect(saved(state)).toEqual(state)
      expect(saved(lifecycleReducer(state, { type: 'BACK' }))).toEqual(lifecycleReducer(state, { type: 'BACK' }))
    }
    const draft = lifecycleReducer(through('OPEN_COMPOSER'), { type: 'SET_NOTE', value: 'Not posted yet — leave the gate open.' })
    expect(saved(draft)).toMatchObject({ noteDraft: 'Not posted yet — leave the gate open.', postedNote: '', completionPhoto: false })
  })

  it('bounds note input and keeps an unsent edit distinct from an already-posted note', () => {
    const posted = through('POST_NOTE')
    const revisited = lifecycleReducer(posted, { type: 'BACK' })
    const editing = lifecycleReducer(revisited, { type: 'SET_NOTE', value: 'x'.repeat(300) })
    expect(editing.noteDraft).toHaveLength(280)
    expect(editing.postedNote).toBe('Patio finished. Side gate locked.')
    expect(saved(editing)).toEqual(editing)
  })

  it.each([null, '', '{broken', 'null', '[]', '42', '"inquiry"'])('safely starts over for unreadable storage: %s', raw => {
    expect(restoreLifecycleState(raw)).toEqual(initialLifecycleState())
  })

  it.each([
    { revision: 'crew-job-v1' }, { scene: ['inquiry'] }, { scene: 'unknown' },
    { furthest: -1 }, { furthest: 10 }, { furthest: '0' }, { furthest: 1.5 },
    { visitPhoto: 'true' }, { noteDraft: null }, { noteDraft: 'x'.repeat(281) },
    { postedNote: 'x'.repeat(281) },
  ])('rejects malformed state fields: %j', fields => {
    expect(restoreLifecycleState(JSON.stringify({ ...initialLifecycleState(), ...fields }))).toEqual(initialLifecycleState())
  })

  it.each([
    { visitPhoto: false }, { visitCompleted: false }, { estimateApproved: false },
    { crewAssigned: false }, { taskCompleted: false }, { completionPhoto: false },
    { postedNote: '' }, { postedNote: '   ' }, { scene: 'inquiry', furthest: 0 },
  ])('rejects invented downstream progress without its prerequisite history: %j', fields => {
    expect(restoreLifecycleState(JSON.stringify({ ...through('RECORD_PAYMENT'), ...fields }))).toEqual(initialLifecycleState())
  })

  it('rejects a visited future screen whose required actions never happened', () => {
    expect(restoreLifecycleState(JSON.stringify({ ...initialLifecycleState(), scene: 'activity', furthest: 8 }))).toEqual(initialLifecycleState())
    expect(restoreLifecycleState(JSON.stringify({ ...through('POST_NOTE'), paymentRecorded: true }))).toEqual(initialLifecycleState())
  })
})

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoExperience } from '@/components/demo/DemoExperience'
import { initialDemoState, restoreDemoState } from '@/components/demo/demo-state'
import { LIFECYCLE_STORAGE_KEY, initialLifecycleState, lifecycleReducer, type LifecycleAction } from '@/components/demo/lifecycle-state'
import type { DemoEvent } from '@/lib/demo/contracts'
import { DEMO_VERSION } from '@/lib/demo/contracts'
import { parseDemoEvent } from '@/lib/demo/server'

const diagnostics = vi.hoisted(() => ({ track: vi.fn() }))
vi.mock('@/lib/demo/use-demo-funnel', () => ({
  useDemoFunnel: () => ({ signupHref: '/demo/start-trial', track: diagnostics.track }),
}))
const crewActions: LifecycleAction[] = [
  { type: 'SELECT_ROLE', role: 'crew' }, { type: 'COMPLETE_TASK' },
  { type: 'OPEN_COMPOSER' }, { type: 'ADD_COMPLETION_PHOTO' }, { type: 'POST_NOTE' },
]
const operatorActions: LifecycleAction[] = [
  { type: 'SELECT_ROLE', role: 'operator' }, { type: 'OPEN_BOOKING' },
  { type: 'ASSIGN_VISIT', member: 'Nick' }, { type: 'COMPLETE_VISIT' },
  { type: 'SEND_ESTIMATE' }, { type: 'APPROVE_ESTIMATE' },
  { type: 'ASSIGN_CREW', members: ['Pete'] }, { type: 'ADVANCE_WORKDAY' },
  { type: 'OPEN_BILLING' }, { type: 'CREATE_INVOICE' }, { type: 'RECORD_PAYMENT' },
]
function snapshot(actions: LifecycleAction[], stop: LifecycleAction['type']) {
  let state = initialLifecycleState()
  for (const action of actions) {
    state = lifecycleReducer(state, action)
    if (state.cutscene) state = lifecycleReducer(state, { type: 'SKIP_CUTSCENE' })
    if (action.type === stop) return state
  }
  throw new Error('Missing snapshot action')
}
function click(name: string) { fireEvent.click(screen.getByRole('button', { name })) }
function skipScene() { click('Skip scene') }
function backTo(scene: string) {
  const position = Math.max(0, Number(window.history.state?.opsLifecyclePosition ?? 1) - 1)
  vi.spyOn(window.history, 'back').mockImplementationOnce(() => {
    window.dispatchEvent(new PopStateEvent('popstate', { state: { ...window.history.state, opsLifecycleScene: scene, opsLifecyclePosition: position } }))
  })
  click('Back')
}
function events() { return diagnostics.track.mock.calls.map(([event]) => event as DemoEvent) }
function expectCollectorAccepts(event: DemoEvent) {
  expect(parseDemoEvent({ ...event, version: DEMO_VERSION, eventId: 'bc2f9060-d8fa-41b1-a7da-8357b0625042' })).not.toBeNull()
}

beforeEach(() => {
  sessionStorage.clear()
  diagnostics.track.mockReset()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
  window.history.replaceState({}, '', '/demo')
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('independent persisted-demo acceptance', () => {
  it.each([
    { step: ['crew'], progress: 'assigned' },
    { step: 'crew', progress: ['assigned'] },
  ])('rejects malformed legacy state: %j', fields => {
    expect(restoreDemoState(JSON.stringify({ version: 'crew-job-v1', ...fields }))).toEqual(initialDemoState())
  })

  it.each(['SELECT_ROLE', 'POST_NOTE'] as const)('restores Crew %s without reporting invented actions', action => {
    sessionStorage.setItem(LIFECYCLE_STORAGE_KEY, JSON.stringify(snapshot(crewActions, action)))
    render(<DemoExperience />)
    expect(screen.getByText('Your sample job is where you left it.')).toBeTruthy()
    if (action === 'SELECT_ROLE') expect(screen.getByRole('button', { name: 'Complete' })).toBeTruthy()
    else expect(screen.getByRole('article', { name: 'Your completion update' })).toBeTruthy()
    for (const event of events()) expectCollectorAccepts(event)
    expect(events().filter(event => ['started', 'job_assigned', 'crew_viewed', 'task_completed'].includes(event.action))).toEqual([])
  })

  it.each(['ADVANCE_WORKDAY', 'CREATE_INVOICE', 'RECORD_PAYMENT'] as const)('restores Operator %s without reporting incoming fixture work as visitor actions', action => {
    sessionStorage.setItem(LIFECYCLE_STORAGE_KEY, JSON.stringify(snapshot(operatorActions, action)))
    render(<DemoExperience />)
    expect(screen.getByText('Your sample job is where you left it.')).toBeTruthy()
    expect(screen.getByText('YOU · OPERATOR')).toBeTruthy()
    if (action === 'ADVANCE_WORKDAY') expect(screen.getByRole('article', { name: "Pete's completion update" })).toBeTruthy()
    else expect(screen.getByRole('link', { name: 'Start my free trial' })).toBeTruthy()
    expect(events().filter(event => ['started', 'job_assigned', 'crew_viewed', 'task_completed'].includes(event.action))).toEqual([])
    for (const event of events()) expectCollectorAccepts(event)
  })

  it('reports only actual Operator assignment without inventing crew actions', () => {
    render(<DemoExperience />)
    click('Choose Operator'); skipScene(); click('Assign site visit'); click('Select Mike'); click('Assign to Mike'); skipScene()
    click('Review estimate'); skipScene(); click('Send estimate'); skipScene()
    fireEvent.click(screen.getByRole('tab', { name: 'details' }))
    click('Open resurfacing task'); click('Assign team to this task'); click('Select Pete'); click('Done')
    click('See the completed work'); skipScene()
    expect(events().map(event => [event.action, event.step])).toEqual([
      ['started', 'assign'], ['job_assigned', 'assign'],
    ])
    for (const event of events()) expectCollectorAccepts(event)
    backTo('project'); click('See the completed work'); click('View billing'); skipScene()
    expect(events().filter(event => event.action === 'job_assigned')).toHaveLength(1)
    expect(events().filter(event => ['crew_viewed', 'task_completed'].includes(event.action))).toEqual([])
  })

  it('reports Crew entry and completion once, without counting prepared assignment as a visitor action', () => {
    render(<DemoExperience />)
    click('Choose Crew'); skipScene(); click('Complete')
    expect(events().map(event => [event.action, event.step])).toEqual([
      ['started', 'assign'], ['crew_viewed', 'crew'], ['task_completed', 'complete'],
    ])
    for (const event of events()) expectCollectorAccepts(event)
    click('Post a photo update'); click('Attach completion photo'); click('Post crew update')
    backTo('compose'); click('Post crew update')
    expect(events().filter(event => event.action === 'task_completed')).toHaveLength(1)
    expect(events().filter(event => event.action === 'job_assigned')).toEqual([])
    for (const event of events()) expectCollectorAccepts(event)
  })
})

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
const actions: LifecycleAction[] = [
  { type: 'OPEN_BOOKING' }, { type: 'START_VISIT' }, { type: 'ADD_SITE_PHOTO' },
  { type: 'REVIEW_VISIT' }, { type: 'COMPLETE_VISIT' }, { type: 'APPROVE_ESTIMATE' },
  { type: 'ASSIGN_CREW' }, { type: 'VIEW_CREW' }, { type: 'COMPLETE_TASK' },
  { type: 'OPEN_COMPOSER' }, { type: 'ADD_COMPLETION_PHOTO' }, { type: 'POST_NOTE' },
]
function snapshot(stop: LifecycleAction['type']) {
  let state = initialLifecycleState()
  for (const action of actions) {
    state = lifecycleReducer(state, action)
    if (action.type === stop) return state
  }
  throw new Error('Missing snapshot action')
}
function click(name: string) { fireEvent.click(screen.getByRole('button', { name })) }
function events() { return diagnostics.track.mock.calls.map(([event]) => event as DemoEvent) }
function expectCollectorAccepts(event: DemoEvent) {
  expect(parseDemoEvent({ ...event, version: DEMO_VERSION, eventId: 'bc2f9060-d8fa-41b1-a7da-8357b0625042' })).not.toBeNull()
}

beforeEach(() => {
  sessionStorage.clear()
  diagnostics.track.mockReset()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
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

  it.each(['VIEW_CREW', 'POST_NOTE'] as const)('restores %s without reporting invented actions', action => {
    sessionStorage.setItem(LIFECYCLE_STORAGE_KEY, JSON.stringify(snapshot(action)))
    render(<DemoExperience />)
    expect(screen.getByText('Your sample job is where you left it.')).toBeTruthy()
    if (action === 'VIEW_CREW') expect(screen.getByRole('button', { name: 'Complete' })).toBeTruthy()
    else expect(screen.getByRole('article', { name: "Pete's completion update" })).toBeTruthy()
    for (const event of events()) expectCollectorAccepts(event)
    expect(events().filter(event => ['started', 'job_assigned', 'crew_viewed', 'task_completed'].includes(event.action))).toEqual([])
  })

  it('keeps diagnostic action boundaries compatible with the unchanged collector', () => {
    render(<DemoExperience />)
    click('Open booked visit'); click('Start site visit'); click('Photo'); click('Done')
    click('Complete visit'); click('Mark approved')
    fireEvent.click(screen.getByRole('tab', { name: 'details' }))
    click('Open patio installation task'); click('Assign team to this task'); click('Pete'); click('Done')
    click('View crew on the workday'); click('Complete')
    expect(events().map(event => [event.action, event.step])).toEqual([
      ['started', 'assign'], ['job_assigned', 'assign'], ['crew_viewed', 'crew'], ['task_completed', 'complete'],
    ])
    for (const event of events()) expectCollectorAccepts(event)
    click('Post a photo update'); click('Attach completion photo'); click('Post crew update')
    click('Back'); click('Post crew update')
    expect(events().filter(event => event.action === 'task_completed')).toHaveLength(1)
    for (const event of events()) expectCollectorAccepts(event)
  })
})

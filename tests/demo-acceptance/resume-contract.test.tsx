import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoExperience } from '@/components/demo/DemoExperience'
import { DEMO_STORAGE_KEY, initialDemoState, restoreDemoState } from '@/components/demo/demo-state'
import type { DemoEvent } from '@/lib/demo/contracts'
import { DEMO_VERSION } from '@/lib/demo/contracts'
import { parseDemoEvent } from '@/lib/demo/server'

const diagnostics = vi.hoisted(() => ({ track: vi.fn() }))
vi.mock('@/lib/demo/use-demo-funnel', () => ({
  useDemoFunnel: () => ({ signupHref: '/demo/start-trial', track: diagnostics.track }),
}))

beforeEach(() => {
  sessionStorage.clear()
  diagnostics.track.mockClear()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  window.history.replaceState({}, '', '/demo')
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('independent persisted-demo acceptance', () => {
  it.each([
    { step: ['crew'], progress: 'assigned' },
    { step: 'crew', progress: ['assigned'] },
  ])('rejects non-string state instead of restoring an unusable command state: %j', fields => {
    const raw = JSON.stringify({ version: 'crew-job-v1', ...fields })
    expect(restoreDemoState(raw)).toEqual(initialDemoState())
  })

  it.each(['crew', 'complete'] as const)('resumes %s with collector-compatible diagnostics and no fabricated completion', step => {
    sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({
      version: 'crew-job-v1', step, progress: step === 'crew' ? 'assigned' : 'completed',
    }))
    render(<DemoExperience />)
    expect(screen.getByText('Sample demo resumed.')).toBeTruthy()
    const events = diagnostics.track.mock.calls.map(([event]) => event as DemoEvent)
    for (const event of events) expect(parseDemoEvent({ ...event, version: DEMO_VERSION,
      eventId: 'bc2f9060-d8fa-41b1-a7da-8357b0625042' })).not.toBeNull()
    expect(events.filter(event => event.action === 'task_completed')).toEqual([])
  })

  it('sends the actual UI action boundaries in order and the real collector accepts each', () => {
    render(<DemoExperience />)
    fireEvent.click(screen.getByRole('button', { name: 'Assign crew' }))
    fireEvent.click(screen.getByRole('button', { name: 'Mark task done' }))
    const events = diagnostics.track.mock.calls.map(([event]) => event as DemoEvent)
    expect(events.map(event => [event.action, event.step])).toEqual([
      ['started', 'assign'], ['job_assigned', 'assign'], ['crew_viewed', 'crew'], ['task_completed', 'complete'],
    ])
    for (const event of events) expect(parseDemoEvent({ ...event, version: DEMO_VERSION,
      eventId: 'bc2f9060-d8fa-41b1-a7da-8357b0625042' })).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Back', exact: true }))
    fireEvent.click(screen.getByRole('button', { name: 'View completion' }))
    expect(diagnostics.track.mock.calls.filter(([event]) => event.action === 'task_completed')).toHaveLength(1)
  })
})

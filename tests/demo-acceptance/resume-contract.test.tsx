import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoExperience } from '@/components/demo/DemoExperience'
import { DEMO_STORAGE_KEY, initialDemoState, restoreDemoState } from '@/components/demo/demo-state'
import type { DemoEvent } from '@/lib/demo/contracts'

const diagnostics = vi.hoisted(() => ({ track: vi.fn() }))
vi.mock('@/lib/demo/use-demo-funnel', () => ({
  useDemoFunnel: () => ({ signupHref: '/demo/start-trial', track: diagnostics.track }),
}))

beforeEach(() => {
  sessionStorage.clear()
  diagnostics.track.mockClear()
  window.history.replaceState({}, '', '/demo')
})
afterEach(() => cleanup())

describe('independent persisted-demo acceptance', () => {
  it.each([
    { step: ['crew'], progress: 'assigned' },
    { step: 'crew', progress: ['assigned'] },
  ])('rejects non-string state instead of restoring an unusable command state: %j', fields => {
    const raw = JSON.stringify({ version: 'crew-job-v1', ...fields })
    expect(restoreDemoState(raw)).toEqual(initialDemoState())
  })

  it.each(['crew', 'complete'] as const)('resumes %s without emitting a start at a server-rejected step', step => {
    sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({
      version: 'crew-job-v1', step, progress: step === 'crew' ? 'assigned' : 'completed',
    }))
    render(<DemoExperience />)
    expect(screen.getByText('Sample demo resumed.')).toBeTruthy()
    const events = diagnostics.track.mock.calls.map(([event]) => event as DemoEvent)
    // The shared collector accepts "started" only at the assignment boundary.
    expect(events.filter(event => event.action === 'started' && event.step !== 'assign')).toEqual([])
    expect(events.filter(event => event.action === 'task_completed')).toEqual([])
  })
})

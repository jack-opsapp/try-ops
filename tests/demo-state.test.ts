import { describe, expect, it } from 'vitest'
import { initialDemoState, transitionDemo, restoreDemoState, readDemoState, saveDemoState } from '@/components/demo/demo-state'

describe('sample job state', () => {
  it('makes the crew plan available after a single assignment', () => {
    expect(transitionDemo(initialDemoState(), 'assign')).toMatchObject({ step: 'crew', progress: 'assigned' })
  })
  it('cannot complete before assignment', () => {
    const state = initialDemoState()
    expect(transitionDemo(state, 'complete')).toBe(state)
  })
  it('shows the owner completion only after the crew action', () => {
    const assigned = transitionDemo(initialDemoState(), 'assign')
    expect(transitionDemo(assigned, 'complete')).toMatchObject({ step: 'complete', progress: 'completed' })
  })
  it('ignores repeated actions from the previous screen', () => {
    const assigned = transitionDemo(initialDemoState(), 'assign')
    expect(transitionDemo(assigned, 'assign')).toBe(assigned)
    const done = transitionDemo(assigned, 'complete')
    expect(transitionDemo(done, 'complete')).toBe(done)
  })
  it('Back reviews the crew and assignment while preserving completed work', () => {
    const done = transitionDemo(transitionDemo(initialDemoState(), 'assign'), 'complete')
    const crew = transitionDemo(done, 'back')
    expect(crew).toMatchObject({ step: 'crew', progress: 'completed' })
    expect(transitionDemo(crew, 'back')).toMatchObject({ step: 'assign', progress: 'completed' })
    expect(transitionDemo(crew, 'complete')).toMatchObject({ step: 'complete', progress: 'completed' })
  })
  it('Restart resets only sample progress', () => {
    const done = transitionDemo(transitionDemo(initialDemoState(), 'assign'), 'complete')
    expect(transitionDemo(done, 'restart')).toEqual(initialDemoState())
  })
  it.each(['assign', 'crew', 'complete'] as const)('resumes a valid %s view', step => {
    const restored = restoreDemoState(JSON.stringify({ version: 'crew-job-v1', step, progress: 'completed' }))
    expect(restored).toMatchObject({ step, progress: 'completed' })
  })
  it.each([
    null, '{broken', '{}', 'null', '[]',
    '{"version":"crew-job-v1","step":["crew"],"progress":"assigned"}',
    '{"version":"crew-job-v1","step":"crew","progress":["assigned"]}',
    '{"version":"old","step":"complete","progress":"completed"}',
    '{"version":"crew-job-v1","step":"complete","progress":"unassigned"}',
    '{"version":"crew-job-v1","step":"crew","progress":"unassigned"}',
    '{"version":"crew-job-v1","step":"elsewhere","progress":"completed"}',
  ])('resets corrupt, outdated, or impossible persisted state: %s', raw => {
    expect(restoreDemoState(raw)).toEqual(initialDemoState())
  })
  it('stores and recovers the latest view without business data', () => {
    const values = new Map<string, string>()
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) } }
    const assigned = transitionDemo(initialDemoState(), 'assign')
    expect(saveDemoState(() => storage, assigned)).toBe(true)
    expect(readDemoState(() => storage)).toEqual({ state: assigned, available: true, resumed: true })
    expect([...values.values()][0]).not.toContain('Cedar')
  })
  it('works when reading or writing browser storage throws', () => {
    const blocked = () => { throw new Error('Storage blocked') }
    expect(readDemoState(blocked)).toEqual({ state: initialDemoState(), available: false, resumed: false })
    expect(saveDemoState(blocked, transitionDemo(initialDemoState(), 'assign'))).toBe(false)
  })
})

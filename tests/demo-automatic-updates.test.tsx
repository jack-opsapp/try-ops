import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoExperience } from '@/components/demo/DemoExperience'
import { initialLifecycleState, lifecycleReducer, LIFECYCLE_STORAGE_KEY, type LifecycleAction } from '@/components/demo/lifecycle-state'

vi.mock('@/lib/demo/use-demo-funnel', () => ({ useDemoFunnel: () => ({ signupHref: '/demo/start-trial', track: vi.fn() }) }))

const sequence: LifecycleAction[] = [
  { type: 'SELECT_ROLE', role: 'operator' }, { type: 'OPEN_BOOKING' }, { type: 'ASSIGN_VISIT', member: 'Mike' },
  { type: 'COMPLETE_VISIT' }, { type: 'SEND_ESTIMATE' }, { type: 'APPROVE_ESTIMATE' },
  { type: 'ASSIGN_CREW', members: ['Pete'] }, { type: 'OPEN_COMPLETED_PROJECT' }, { type: 'OPEN_BILLING' },
  { type: 'CREATE_INVOICE' }, { type: 'RECORD_PAYMENT' },
]

function seed(stop: LifecycleAction['type']) {
  let value = initialLifecycleState()
  for (const action of sequence) {
    value = lifecycleReducer(value, action)
    if (action.type === stop) break
    if (value.cutscene) value = lifecycleReducer(value, { type: 'SKIP_CUTSCENE' })
  }
  sessionStorage.setItem(LIFECYCLE_STORAGE_KEY, JSON.stringify(value))
}

function saved() { return JSON.parse(sessionStorage.getItem(LIFECYCLE_STORAGE_KEY) ?? '{}') }
function click(name: string) { fireEvent.click(screen.getByRole('button', { name })) }
function message() { return document.querySelector('[data-demo-notification]')?.textContent ?? '' }

beforeEach(() => {
  sessionStorage.clear()
  window.history.replaceState({}, '', '/demo')
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('automatic sample updates', () => {
  it('opens the project from the incoming approval scene without a manual approval action', () => {
    seed('SEND_ESTIMATE')
    render(<DemoExperience />)

    expect(saved()).toMatchObject({ scene: 'accepted', estimateSent: true, estimateApproved: false, cutscene: { id: 'approval' } })
    expect(screen.queryByRole('button', { name: 'Mark approved' })).toBeNull()
    expect(screen.queryByText('OPS ACCOUNTING — BETA TESTING')).toBeNull()

    click('Skip scene')

    expect(saved()).toMatchObject({ scene: 'project', estimateApproved: true, cutscene: null })
    expect(message()).toContain('Estimate approved')
    expect(screen.getByRole('tab', { name: 'details' })).toBeTruthy()
  })

  it('shows accounting only at billing and materializes external financial updates without financial buttons', () => {
    seed('OPEN_BILLING')
    render(<DemoExperience />)

    expect(screen.getByText('OPS ACCOUNTING — BETA TESTING')).toBeTruthy()
    for (const name of ['Create invoice', 'Record payment', 'Preview payment recording']) {
      expect(screen.queryByRole('button', { name })).toBeNull()
    }

    click('Skip scene')

    expect(saved()).toMatchObject({ scene: 'billing', invoiceCreated: true, paymentRecorded: true, cutscene: null })
    expect(message()).toContain('Payment recorded')
    expect(message()).toContain('received outside OPS')
    expect(screen.getByText('Paid in full')).toBeTruthy()
    expect(screen.getByText('$0 DUE')).toBeTruthy()
  })

  it('keeps the completed-work notification actionable across reload until the visitor opens the project', () => {
    seed('ASSIGN_CREW')
    const first = render(<DemoExperience />)

    expect(saved()).toMatchObject({ scene: 'calendar', taskCompleted: false, cutscene: { id: 'workday', beat: 0, replay: false } })
    expect(screen.queryByRole('button', { name: '184 Cedar Lane Complete' })).toBeNull()
    click('Skip scene')
    expect(saved()).toMatchObject({ scene: 'calendar', taskCompleted: true, completionPhoto: true, cutscene: null })
    expect(screen.getByRole('button', { name: '184 Cedar Lane Complete' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Dismiss notification' })).toBeNull()

    first.unmount()
    render(<DemoExperience />)
    expect(screen.getByText('Your sample job is where you left it.')).toBeTruthy()
    click('184 Cedar Lane Complete')

    expect(saved()).toMatchObject({ scene: 'activity', taskCompleted: true, completionPhoto: true })
    expect(screen.getByRole('article', { name: "Pete's completion update" })).toBeTruthy()
    expect(screen.queryByRole('button', { name: '184 Cedar Lane Complete' })).toBeNull()
  })

  it('lets the visitor pause and resume a scene without changing its lifecycle state', () => {
    seed('SEND_ESTIMATE')
    render(<DemoExperience />)
    const before = saved()

    click('Pause scene')
    expect(screen.getByRole('button', { name: 'Resume scene' })).toBeTruthy()
    expect(saved()).toEqual(before)
    click('Resume scene')
    expect(screen.getByRole('button', { name: 'Pause scene' })).toBeTruthy()
    expect(saved()).toEqual(before)
  })

  it('cancels pending playback on Back and resumes the unfinished billing handoff on return', () => {
    seed('OPEN_BILLING')
    render(<DemoExperience />)

    click('Back')
    expect(saved()).toMatchObject({ scene: 'activity', invoiceCreated: false, paymentRecorded: false, cutscene: null })
    click('View billing')
    expect(saved()).toMatchObject({ scene: 'billing', cutscene: { id: 'billing', beat: 0, replay: false } })
    click('Skip scene')
    expect(saved()).toMatchObject({ scene: 'billing', invoiceCreated: true, paymentRecorded: true, cutscene: null })
  })

  it('does not leak an unfinished approval into a restarted Crew journey', () => {
    seed('SEND_ESTIMATE')
    render(<DemoExperience />)

    click('Restart demo')
    click('Choose Crew')
    click('Skip scene')

    expect(saved()).toMatchObject({ role: 'crew', scene: 'crew', taskCompleted: false, invoiceCreated: false, cutscene: null })
    expect(message()).toBe('')
  })

  it('restores pending playback after reload and keeps completed replay read-only', () => {
    seed('OPEN_BILLING')
    const first = render(<DemoExperience />)
    click('Pause scene')
    first.unmount()
    render(<DemoExperience />)

    expect(screen.getByText('Your sample job is where you left it.')).toBeTruthy()
    expect(saved()).toMatchObject({ invoiceCreated: false, paymentRecorded: false, cutscene: { id: 'billing', replay: false } })
    click('Skip scene')
    click('Dismiss notification')
    const completed = saved()

    click('Replay scene')
    expect(saved()).toMatchObject({ invoiceCreated: true, paymentRecorded: true, cutscene: { id: 'billing', beat: 0, replay: true } })
    click('Skip scene')

    expect(saved()).toEqual(completed)
    expect(message()).toBe('')
    expect(screen.queryByRole('button', { name: /Create invoice|Record payment/ })).toBeNull()
  })
})

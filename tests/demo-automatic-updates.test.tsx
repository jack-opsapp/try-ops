import { StrictMode } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoExperience } from '@/components/demo/DemoExperience'
import { AUTOMATION_DELAYS } from '@/components/demo/useDemoAutomation'
import { initialLifecycleState, lifecycleReducer, LIFECYCLE_STORAGE_KEY, type LifecycleAction } from '@/components/demo/lifecycle-state'

vi.mock('@/lib/demo/use-demo-funnel', () => ({ useDemoFunnel: () => ({ signupHref: '/demo/start-trial', track: vi.fn() }) }))
const sequence: LifecycleAction[] = [
  { type: 'SELECT_ROLE', role: 'operator' }, { type: 'OPEN_BOOKING' }, { type: 'ASSIGN_VISIT', member: 'Mike' },
  { type: 'COMPLETE_VISIT' }, { type: 'SEND_ESTIMATE' }, { type: 'APPROVE_ESTIMATE' },
  { type: 'ASSIGN_CREW', members: ['Pete'] }, { type: 'ADVANCE_WORKDAY' }, { type: 'OPEN_BILLING' },
  { type: 'CREATE_INVOICE' }, { type: 'RECORD_PAYMENT' },
]
function seed(stop: LifecycleAction['type']) {
  let value = initialLifecycleState()
  for (const action of sequence) { value = lifecycleReducer(value, action); if (action.type === stop) break }
  sessionStorage.setItem(LIFECYCLE_STORAGE_KEY, JSON.stringify(value))
}
function saved() { return JSON.parse(sessionStorage.getItem(LIFECYCLE_STORAGE_KEY) ?? '{}') }
function tick(ms: number) { act(() => vi.advanceTimersByTime(ms)) }
function click(name: string) { fireEvent.click(screen.getByRole('button', { name })) }
function message() { return document.querySelector('[data-demo-notification]')?.textContent ?? '' }
let visible = true
function visibility(value: boolean) { visible = value; act(() => document.dispatchEvent(new Event('visibilitychange'))) }

beforeEach(() => {
  vi.useFakeTimers()
  sessionStorage.clear()
  window.history.replaceState({}, '', '/demo')
  visible = true
  vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visible ? 'visible' : 'hidden')
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks() })

describe('automatic sample updates', () => {
  it('opens the project on incoming client approval with no approval button', () => {
    seed('SEND_ESTIMATE'); render(<DemoExperience />)
    expect(screen.queryByRole('button', { name: 'Mark approved' })).toBeNull()
    expect(screen.queryByText('OPS ACCOUNTING — BETA TESTING')).toBeNull()
    tick(AUTOMATION_DELAYS.estimate - 1)
    expect(saved().estimateApproved).toBe(false)
    tick(1)
    expect(saved()).toMatchObject({ scene: 'project', estimateApproved: true })
    expect(message()).toContain('Estimate approved')
    expect(screen.getByRole('tab', { name: 'details' })).toBeTruthy()
  })

  it('sends the invoice before recording the later external payment without taking focus', () => {
    seed('OPEN_BILLING'); render(<DemoExperience />)
    for (const name of ['Create invoice', 'Record payment', 'Preview payment recording']) expect(screen.queryByRole('button', { name })).toBeNull()
    expect(screen.getByText('OPS ACCOUNTING — BETA TESTING')).toBeTruthy()
    const trial = screen.getByRole('link', { name: 'Start my free trial' })
    trial.focus()
    tick(AUTOMATION_DELAYS.invoice - 1); expect(saved().invoiceCreated).toBe(false)
    tick(1); expect(saved()).toMatchObject({ invoiceCreated: true, paymentRecorded: false })
    expect(message()).toContain('Invoice sent')
    tick(AUTOMATION_DELAYS.payment - 1); expect(saved().paymentRecorded).toBe(false)
    tick(1); expect(saved().paymentRecorded).toBe(true)
    expect(message()).toContain('Payment recorded')
    expect(message()).toContain('received outside OPS')
    expect(document.activeElement).toBe(trial)
  })

  it('preserves remaining reading time while hidden instead of catching up offscreen', () => {
    seed('OPEN_BILLING'); render(<DemoExperience />)
    tick(400); visibility(false); tick(30_000)
    expect(saved().invoiceCreated).toBe(false)
    visibility(true); tick(AUTOMATION_DELAYS.invoice - 401)
    expect(saved().invoiceCreated).toBe(false)
    tick(1); expect(saved().invoiceCreated).toBe(true)
    expect(saved().paymentRecorded).toBe(false)
  })

  it('lets the visitor pause and resume the remaining delay', () => {
    seed('OPEN_BILLING'); render(<DemoExperience />)
    tick(500); click('Pause updates'); tick(20_000)
    expect(saved().invoiceCreated).toBe(false)
    click('Resume updates'); tick(AUTOMATION_DELAYS.invoice - 501)
    expect(saved().invoiceCreated).toBe(false)
    tick(1); expect(message()).toContain('Invoice sent')
  })

  it('pauses payment while the visitor inspects accounting options', () => {
    seed('CREATE_INVOICE'); render(<DemoExperience />)
    tick(300); click('Connect accounting software'); tick(30_000)
    expect(saved().paymentRecorded).toBe(false)
    click('Close preview'); tick(AUTOMATION_DELAYS.payment - 301)
    expect(saved().paymentRecorded).toBe(false)
    tick(1); expect(saved().paymentRecorded).toBe(true)
  })

  it('cancels pending events on Back and only resumes after returning to billing', () => {
    seed('OPEN_BILLING'); render(<DemoExperience />)
    tick(300); click('Back'); tick(30_000)
    expect(saved()).toMatchObject({ scene: 'activity', invoiceCreated: false })
    click('View billing'); tick(AUTOMATION_DELAYS.invoice)
    expect(saved()).toMatchObject({ scene: 'billing', invoiceCreated: true })
  })

  it('does not leak an old approval into a restarted Crew journey', () => {
    seed('SEND_ESTIMATE'); render(<DemoExperience />)
    tick(300); click('Restart demo'); click('Choose Crew'); tick(30_000)
    expect(saved()).toMatchObject({ role: 'crew', scene: 'crew', taskCompleted: false, invoiceCreated: false })
    expect(message()).toBe('')
  })

  it('never replays a completed approval on review navigation', () => {
    seed('SEND_ESTIMATE'); render(<DemoExperience />); tick(AUTOMATION_DELAYS.estimate)
    click('Back'); tick(30_000)
    expect(saved().scene).toBe('accepted')
    expect(message()).toBe('')
    click('View project'); tick(30_000)
    expect(saved().scene).toBe('project')
    expect(message()).toBe('')
  })

  it('restores paid facts without replaying a notification or scheduling another event', () => {
    seed('RECORD_PAYMENT'); render(<DemoExperience />); tick(30_000)
    expect(saved()).toMatchObject({ invoiceCreated: true, paymentRecorded: true })
    expect(message()).toBe('')
    expect(screen.queryByRole('button', { name: 'Pause updates' })).toBeNull()
    expect(screen.getByText('Paid in full')).toBeTruthy()
  })

  it('keeps a restored pending sequence paused while hidden and runs once in StrictMode', () => {
    seed('OPEN_BILLING'); visibility(false)
    const first = render(<StrictMode><DemoExperience /></StrictMode>)
    tick(30_000); expect(saved().invoiceCreated).toBe(false)
    first.unmount(); tick(30_000); expect(saved().invoiceCreated).toBe(false)
    render(<StrictMode><DemoExperience /></StrictMode>)
    visibility(true); tick(AUTOMATION_DELAYS.invoice)
    expect(saved().invoiceCreated).toBe(true)
    expect(message()).toContain('Invoice sent')
    tick(AUTOMATION_DELAYS.payment)
    expect(saved().paymentRecorded).toBe(true)
    click('Dismiss notification'); tick(30_000)
    expect(message()).toBe('')
  })
})

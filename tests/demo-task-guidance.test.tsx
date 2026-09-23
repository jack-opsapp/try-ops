import { useReducer } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProjectScenes } from '@/components/demo/ProjectScenes'
import { initialLifecycleState, lifecycleReducer, type LifecycleAction, type LifecycleState } from '@/components/demo/lifecycle-state'

const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView')
const scrollCalls: Array<{ target: HTMLElement; options?: ScrollIntoViewOptions | boolean }> = []
const scrollIntoView = vi.fn(function (this: HTMLElement, options?: ScrollIntoViewOptions | boolean) {
  scrollCalls.push({ target: this, options })
})

beforeEach(() => {
  scrollCalls.length = 0
  scrollIntoView.mockClear()
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView })
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', originalScroll)
  else Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
})

function projectState(): LifecycleState {
  const actions: LifecycleAction[] = [
    { type: 'SELECT_ROLE', role: 'operator' },
    { type: 'OPEN_BOOKING' },
    { type: 'ASSIGN_VISIT', member: 'Mike' },
    { type: 'COMPLETE_VISIT' },
    { type: 'SEND_ESTIMATE' },
    { type: 'APPROVE_ESTIMATE' },
  ]
  return actions.reduce((state, action) => {
    const next = lifecycleReducer(state, action)
    return next.cutscene ? lifecycleReducer(next, { type: 'SKIP_CUTSCENE' }) : next
  }, initialLifecycleState())
}

function ProjectHarness({ initial = projectState(), onAssignmentComplete, revision = 0 }: {
  initial?: LifecycleState
  onAssignmentComplete?: () => void
  revision?: number
}) {
  const [state, dispatch] = useReducer(lifecycleReducer, initial)
  return <div data-revision={revision}><ProjectScenes state={state} dispatch={dispatch} onAssignmentComplete={onAssignmentComplete} /></div>
}

function clickButton(name: string) { fireEvent.click(screen.getByRole('button', { name })) }
function selectDetails() { fireEvent.click(screen.getByRole('tab', { name: 'details' })) }

describe('event-driven task guidance', () => {
  it('reveals the task, assignment and roster in sequence, then hands focus ownership to the timeline', () => {
    const onAssignmentComplete = vi.fn()
    const { container, rerender } = render(<ProjectHarness onAssignmentComplete={onAssignmentComplete} />)
    expect(scrollCalls).toHaveLength(0)

    const expectGuidance = (target: HTMLElement, block: ScrollLogicalPosition = 'center') => {
      expect(document.activeElement).toBe(target)
      expect(scrollCalls.at(-1)).toEqual({ target, options: { behavior: 'smooth', block, inline: 'nearest' } })
      expect(Array.from(container.querySelectorAll('[data-demo-next="true"]'))).toEqual([target])
    }

    selectDetails()
    expectGuidance(screen.getByRole('button', { name: 'Open resurfacing task' }))
    clickButton('Open resurfacing task')
    expectGuidance(screen.getByRole('button', { name: 'Assign team to this task' }))
    clickButton('Assign team to this task')
    expectGuidance(screen.getByRole('region', { name: 'Choose installation crew' }), 'start')
    clickButton('Select Nick')
    expectGuidance(screen.getByRole('button', { name: 'Done' }))
    const afterFirstSelection = scrollCalls.length
    clickButton('Select Pete')
    expect(scrollCalls).toHaveLength(afterFirstSelection)
    clickButton('Done')
    expect(onAssignmentComplete).toHaveBeenCalledOnce()
    expect(screen.getByText('Crew assigned. Ready to schedule.')).toBeTruthy()
    expect(screen.queryByRole('region', { name: 'Choose installation crew' })).toBeNull()
    rerender(<ProjectHarness onAssignmentComplete={onAssignmentComplete} revision={1} />)
    expect(onAssignmentComplete).toHaveBeenCalledOnce()
    expect(scrollCalls).toHaveLength(afterFirstSelection)
  })

  it('uses immediate scrolling when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
    render(<ProjectHarness />)
    selectDetails()
    expect(scrollCalls.at(-1)?.options).toEqual({ behavior: 'auto', block: 'center', inline: 'nearest' })
  })

  it('keeps keyboard tab navigation focused on the tab while revealing its next task', () => {
    render(<ProjectHarness />)
    const activity = screen.getByRole('tab', { name: 'activity' })
    activity.focus()
    fireEvent.keyDown(activity, { key: 'ArrowRight' })
    const details = screen.getByRole('tab', { name: 'details' })
    expect(document.activeElement).toBe(details)
    expect(scrollCalls.at(-1)?.target).toBe(screen.getByRole('button', { name: 'Open resurfacing task' }))
    const callsAfterDetails = scrollCalls.length
    fireEvent.keyDown(details, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'expenses' }))
    expect(scrollCalls).toHaveLength(callsAfterDetails)
    expect(screen.queryByRole('button', { name: 'Open resurfacing task' })).toBeNull()
  })

  it('returns to the assignment control when the roster is cancelled', () => {
    render(<ProjectHarness />)
    selectDetails()
    clickButton('Open resurfacing task')
    clickButton('Assign team to this task')
    clickButton('Cancel')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Assign team to this task' }))
    expect(scrollCalls.at(-1)?.target).toBe(document.activeElement)
  })

  it('does not scroll or change the selected tab during a read-only revisit or unrelated rerender', () => {
    const assigned = lifecycleReducer(projectState(), { type: 'ASSIGN_CREW', members: ['Pete'] })
    const { rerender } = render(<ProjectHarness initial={assigned} />)
    selectDetails()
    expect(scrollCalls).toHaveLength(0)
    const details = screen.getByRole('tab', { name: 'details' })
    expect(details.getAttribute('aria-selected')).toBe('true')
    rerender(<ProjectHarness initial={assigned} revision={1} />)
    expect(scrollCalls).toHaveLength(0)
    expect(details.getAttribute('aria-selected')).toBe('true')
  })

  it('drops guidance while the browser tab is hidden rather than jumping on return', () => {
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    const { rerender } = render(<ProjectHarness />)
    selectDetails()
    expect(scrollCalls).toHaveLength(0)
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
    rerender(<ProjectHarness revision={1} />)
    expect(scrollCalls).toHaveLength(0)
  })
})

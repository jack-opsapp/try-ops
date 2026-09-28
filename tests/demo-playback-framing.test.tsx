import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoExperience } from '@/components/demo/DemoExperience'
import { initialLifecycleState, lifecycleReducer, LIFECYCLE_STORAGE_KEY, type LifecycleAction } from '@/components/demo/lifecycle-state'

vi.mock('@/lib/demo/use-demo-funnel', () => ({ useDemoFunnel: () => ({ signupHref: '/demo/start-trial', track: vi.fn() }) }))
let advance: (action: LifecycleAction) => void
vi.mock('@/components/demo/useCutscenePlayback', () => ({ useCutscenePlayback: (_state: unknown, _ready: boolean, _paused: boolean, _surface: unknown, dispatch: typeof advance) => { advance = dispatch } }))

let phone = true
let productTop = 220
const scrollIntoView = vi.fn()

beforeEach(() => {
  phone = true
  productTop = 220
  sessionStorage.clear()
  window.history.replaceState({}, '', '/demo')
  scrollIntoView.mockClear()
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query === '(max-width: 760px)' && phone, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => new DOMRect(0, productTop, 390, 651))
  vi.stubGlobal('IntersectionObserver', undefined)
  Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView })
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); delete (Element.prototype as Partial<Element>).scrollIntoView })

function openCalendar() {
  const actions: LifecycleAction[] = [
    { type: 'SELECT_ROLE', role: 'operator' }, { type: 'OPEN_BOOKING' },
    { type: 'ASSIGN_VISIT', member: 'Mike' }, { type: 'COMPLETE_VISIT' },
    { type: 'SEND_ESTIMATE' }, { type: 'ASSIGN_CREW', members: ['Pete'] },
  ]
  let state = initialLifecycleState()
  for (const action of actions) {
    if (state.cutscene) state = lifecycleReducer(state, { type: 'SKIP_CUTSCENE' })
    state = lifecycleReducer(state, action)
  }
  sessionStorage.setItem(LIFECYCLE_STORAGE_KEY, JSON.stringify(state))
  render(<DemoExperience />)
}

describe('phone playback framing', () => {
  it('brings the app frame into view when a phone visitor starts a scene', () => {
    render(<DemoExperience />)
    fireEvent.click(screen.getByRole('button', { name: 'Choose Operator' }))
    const product = screen.getByRole('region', { name: 'Interactive OPS sample' })
    expect(product.getAttribute('data-playback')).toBe('true')
    expect(scrollIntoView.mock.contexts).toContain(product)
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'instant' })
    scrollIntoView.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Pause scene' }))
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('keeps the completion notification in the calendar frame without moving keyboard focus', () => {
    openCalendar()
    const before = document.activeElement
    scrollIntoView.mockClear()
    act(() => advance({ type: 'ADVANCE_CUTSCENE' }))
    act(() => advance({ type: 'ADVANCE_CUTSCENE' }))
    act(() => advance({ type: 'ADVANCE_CUTSCENE' }))
    expect(screen.getByRole('button', { name: '184 Cedar Lane Complete' })).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Interactive OPS sample' }).getAttribute('data-playback')).toBe('true')
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(document.activeElement).toBe(before)
  })

  it('does not pull a visitor back to playback they scrolled away from', () => {
    openCalendar()
    productTop = 1200
    scrollIntoView.mockClear()
    act(() => advance({ type: 'ADVANCE_CUTSCENE' }))
    act(() => advance({ type: 'ADVANCE_CUTSCENE' }))
    act(() => advance({ type: 'ADVANCE_CUTSCENE' }))
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('preserves the desktop chapter layout', () => {
    phone = false
    render(<DemoExperience />)
    fireEvent.click(screen.getByRole('button', { name: 'Choose Operator' }))
    expect(scrollIntoView).not.toHaveBeenCalled()
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' })
  })
})

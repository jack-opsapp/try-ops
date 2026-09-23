import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoExperience } from '@/components/demo/DemoExperience'

function motionPreference(initial: boolean) {
  const listeners = new Set<() => void>()
  let reduced = initial
  const media = {
    get matches() { return reduced },
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
    addListener: vi.fn(), removeListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => media))
  return {
    set(value: boolean) { act(() => { reduced = value; listeners.forEach(listener => listener()) }) },
    get subscriptions() { return listeners.size },
  }
}
function click(name: string) { fireEvent.click(screen.getByRole('button', { name })) }

beforeEach(() => {
  sessionStorage.clear()
  window.history.replaceState({}, '', '/demo')
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('lifecycle handoff presentation', () => {
  it('responds to live reduced-motion changes without losing evidence, focus or native signup', () => {
    const preference = motionPreference(false)
    const { container, unmount } = render(<DemoExperience />)
    click('Choose Operator'); click('Skip scene'); click('Assign site visit'); click('Select You'); click('Assign to me')
    fireEvent.click(screen.getByRole('checkbox', { name: 'Confirm the deck scope with Alex' })); click('Photo')
    const before = screen.getByRole('img', { name: /Sample site visit: the deck area/ }).getAttribute('src')
    preference.set(true)
    expect(container.querySelector('[data-motion]')?.getAttribute('data-motion')).toBe('reduced')
    expect(screen.getByRole('button', { name: 'Done' }).hasAttribute('disabled')).toBe(false)
    expect(screen.getByRole('link', { name: 'Try OPS free' }).getAttribute('href')).toBe('/demo/start-trial')
    vi.mocked(window.scrollTo).mockClear()
    click('Done')
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }))
    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }))
    expect(screen.getByRole('img', { name: /Sample site visit: the deck area/ }).getAttribute('src')).toBe(before)
    preference.set(false)
    expect(container.querySelector('[data-motion]')?.getAttribute('data-motion')).toBe('full')
    expect(screen.getByRole('button', { name: 'Complete visit' })).toBeTruthy()
    unmount()
    expect(preference.subscriptions).toBe(0)
  })

  it.each([false, true])('lets Restart and Back interrupt an active transition (reduced=%s)', async reduced => {
    motionPreference(reduced)
    render(<DemoExperience />)
    const open = screen.getByRole('button', { name: 'Choose Operator' })
    const restart = screen.getByRole('button', { name: 'Restart demo' })
    act(() => { fireEvent.click(open); fireEvent.click(restart) })
    expect(screen.getByRole('button', { name: 'Choose Operator' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Assign site visit' })).toBeNull()
    click('Choose Operator')
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }))
    vi.mocked(window.scrollTo).mockClear()
    click('Back')
    await waitFor(() => expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 })))
    expect(screen.getByRole('button', { name: 'Choose Operator' })).toBeTruthy()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Back' }).hasAttribute('disabled')).toBe(true)
  })
})

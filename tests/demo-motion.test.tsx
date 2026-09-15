import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
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

beforeEach(() => {
  sessionStorage.clear()
  window.history.replaceState({}, '', '/demo')
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('role handoff presentation', () => {
  it('responds to a live reduced-motion change without losing progress, focus or native signup', () => {
    const preference = motionPreference(false)
    const { container, unmount } = render(<DemoExperience />)
    fireEvent.click(screen.getByRole('button', { name: 'Assign crew' }))
    const job = screen.getByRole('heading', { name: 'Siding repair' })
    const task = screen.getByRole('heading', { name: 'Replace damaged siding panels' })
    preference.set(true)
    expect(container.querySelector('main')?.getAttribute('data-motion')).toBe('reduced')
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }))
    expect(screen.getByRole('button', { name: 'Mark task done' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Start my free trial' }).getAttribute('href')).toBe('/demo/start-trial')
    fireEvent.click(screen.getByRole('button', { name: 'Mark task done' }))
    expect(screen.getByText('SAMPLE TASK COMPLETE')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Siding repair' })).toBe(job)
    expect(screen.getByRole('heading', { name: 'Replace damaged siding panels' })).toBe(task)
    preference.set(false)
    expect(container.querySelector('main')?.getAttribute('data-motion')).toBe('full')
    expect(screen.getByText('Pete marked the task done.')).toBeTruthy()
    unmount()
    expect(preference.subscriptions).toBe(0)
  })

  it.each([false, true])('lets Back and Restart interrupt completion immediately (reduced=%s)', async reduced => {
    motionPreference(reduced)
    render(<DemoExperience />)
    fireEvent.click(screen.getByRole('button', { name: 'Assign crew' }))
    const complete = screen.getByRole('button', { name: 'Mark task done' })
    const back = screen.getByRole('button', { name: 'Back' })
    act(() => { fireEvent.click(complete); fireEvent.click(back) })
    expect(screen.getByText('CREW’S VIEW · PETE')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'View completion' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Restart demo' }))
    await act(async () => { await Promise.resolve() })
    expect(screen.getByRole('button', { name: 'Assign crew' })).toBeTruthy()
    expect(screen.queryByText('SAMPLE TASK COMPLETE')).toBeNull()
    expect(screen.queryByRole('button', { name: 'View completion' })).toBeNull()
    expect(screen.getAllByRole('heading', { name: 'Siding repair' })).toHaveLength(1)
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }))
  })
})

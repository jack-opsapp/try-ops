import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoExperience } from '@/components/demo/DemoExperience'
import DemoPage from '@/app/demo/page'
import DemoError from '@/app/demo/error'

beforeEach(() => {
  sessionStorage.clear()
  window.history.replaceState({}, '', '/demo')
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('the visitor sample job', () => {
  it.each([['/for/roofing', '/for/roofing'], ['https://example.com', '/'], ['//example.com', '/']])('exits safely from %s', async (from, destination) => {
    render(await DemoPage({ searchParams: Promise.resolve({ from }) }))
    expect(screen.getByRole('link', { name: 'Exit demo' }).getAttribute('href')).toBe(destination)
  })
  it('offers retry and a native trial link after a render failure', () => {
    const reset = vi.fn()
    render(<DemoError reset={reset} />)
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(reset).toHaveBeenCalledOnce()
    expect(screen.getByRole('link', { name: 'Start my free trial' }).getAttribute('href')).toBe('/demo/start-trial')
  })
  it('reaches useful crew details in one action, then owner task completion', () => {
    render(<DemoExperience />)
    fireEvent.click(screen.getByRole('button', { name: 'Assign crew' }))
    expect(screen.getByText('CREW’S VIEW · PETE')).toBeTruthy()
    expect(screen.getByText('184 Cedar Lane')).toBeTruthy()
    expect(screen.getByText(/Use the side gate/)).toBeTruthy()
    expect(screen.getByRole('img', { name: /Damaged metal siding/ })).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }))
    fireEvent.click(screen.getByRole('button', { name: 'Mark task done' }))
    expect(screen.getByText('SAMPLE TASK COMPLETE')).toBeTruthy()
    expect(screen.getByText('OWNER’S VIEW')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Start my free trial' }).getAttribute('href')).toBe('/demo/start-trial')
  })
  it('keeps completed task truth during Back, resume, and browser navigation', () => {
    const first = render(<DemoExperience />)
    fireEvent.click(screen.getByRole('button', { name: 'Assign crew' }))
    fireEvent.click(screen.getByRole('button', { name: 'Mark task done' }))
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('button', { name: 'View completion' })).toBeTruthy()
    first.unmount()
    render(<DemoExperience />)
    expect(screen.getByRole('button', { name: 'View completion' })).toBeTruthy()
    act(() => { window.dispatchEvent(new PopStateEvent('popstate', { state: { opsDemoStep: 'assign' } })) })
    expect(screen.getByRole('button', { name: 'View crew plan' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Restart demo' }))
    expect(screen.getByRole('button', { name: 'Assign crew' })).toBeTruthy()
  })
  it('still completes with blocked storage and a missing image', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    render(<DemoExperience />)
    fireEvent.click(screen.getByRole('button', { name: 'Assign crew' }))
    fireEvent.error(screen.getByRole('img', { name: /Damaged metal siding/ }))
    expect(screen.getByText('Sample photo unavailable.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Mark task done' }))
    expect(screen.getByText('SAMPLE TASK COMPLETE')).toBeTruthy()
  })
  it('does not skip crew details on a rapid repeated assignment', () => {
    render(<DemoExperience />)
    const button = screen.getByRole('button', { name: 'Assign crew' })
    act(() => { fireEvent.click(button); fireEvent.click(button) })
    expect(screen.getByRole('button', { name: 'Mark task done' })).toBeTruthy()
    expect(screen.queryByText('SAMPLE TASK COMPLETE')).toBeNull()
  })
  it('does not treat the second click of a double-click as task completion', () => {
    render(<DemoExperience />)
    fireEvent.click(screen.getByRole('button', { name: 'Assign crew' }), { detail: 1 })
    fireEvent.click(screen.getByRole('button', { name: 'Mark task done' }), { detail: 2 })
    expect(screen.getByRole('button', { name: 'Mark task done' })).toBeTruthy()
  })
})

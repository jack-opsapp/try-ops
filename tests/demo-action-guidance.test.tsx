import { useRef } from 'react'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ActionGuidance } from '@/components/demo/ActionGuidance'

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

function Harness({ next = 'first', disabled = false }: { next?: string; disabled?: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  return <div ref={root}><ActionGuidance root={root} />
    <button data-demo-next={next === 'first'} disabled={disabled}>First</button>
    <button data-demo-next={next === 'second'}>Second</button>
    <div><textarea aria-label="Note" data-demo-next={next === 'note'} /></div>
  </div>
}

describe('shared next-action border pulse', () => {
  it('moves to changed and removed action targets without changing their accessible names', async () => {
    const { rerender, container } = render(<Harness />)
    await waitFor(() => expect(screen.getByRole('button', { name: 'First' }).querySelector('svg')).not.toBeNull())
    rerender(<Harness next="second" />)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Second' }).querySelector('svg')).not.toBeNull())
    expect(screen.getByRole('button', { name: 'First' }).querySelector('svg')).toBeNull()
    rerender(<Harness next="none" />)
    await waitFor(() => expect(container.querySelector('svg')).toBeNull())
    rerender(<Harness disabled />)
    expect(container.querySelector('svg')).toBeNull()
  })

  it('draws beside a real textarea without changing its editable content', async () => {
    render(<Harness next="note" />)
    const field = screen.getByRole('textbox', { name: 'Note' }) as HTMLTextAreaElement
    await waitFor(() => expect(field.parentElement?.querySelector('svg')).not.toBeNull())
    expect(field.children).toHaveLength(0)
    expect(field.value).toBe('')
  })

  it('pauses offscreen and in hidden tabs, and releases its observer on unmount', async () => {
    let notify: IntersectionObserverCallback = () => {}
    const disconnect = vi.fn()
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) { notify = callback }
      observe() {}
      disconnect = disconnect
    })
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
    const { container, unmount } = render(<Harness />)
    await waitFor(() => expect(container.querySelector('svg')).not.toBeNull())
    const pulse = container.querySelector('svg')!
    const intersect = (isIntersecting: boolean) => act(() => notify([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver))
    expect(pulse.getAttribute('data-running')).toBe('false')
    intersect(true)
    expect(pulse.getAttribute('data-running')).toBe('true')
    visibility.mockReturnValue('hidden')
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(pulse.getAttribute('data-running')).toBe('false')
    visibility.mockReturnValue('visible')
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(pulse.getAttribute('data-running')).toBe('true')
    intersect(false)
    expect(pulse.getAttribute('data-running')).toBe('false')
    unmount()
    expect(disconnect).toHaveBeenCalledOnce()
  })
})

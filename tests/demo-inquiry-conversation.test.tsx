import React from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoCutscene } from '@/components/demo/DemoCutscene'
import { cutsceneScript } from '@/components/demo/cutscene-script'
import { initialLifecycleState, lifecycleReducer, restoreLifecycleState } from '@/components/demo/lifecycle-state'

const inquiry = () => cutsceneScript('inquiry', initialLifecycleState()).beats
const originalScrollTo = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollTo')
let scrolls: Array<{ element: HTMLElement; options: ScrollToOptions }> = []
function scene(index: number, props: { reduced?: boolean; paused?: boolean } = {}) {
  const beats = inquiry()
  return <DemoCutscene beat={beats[index]} conversation={beats} index={index} total={beats.length}
    paused={props.paused ?? false} reduced={props.reduced ?? false} onPause={vi.fn()} onSkip={vi.fn()} />
}

beforeEach(() => {
  // jsdom has no native scrolling; the browser pass checks actual bounds.
  scrolls = []
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: function(this: HTMLElement, options: ScrollToOptions) { scrolls.push({ element: this, options }) },
  })
})
afterEach(() => {
  cleanup(); vi.restoreAllMocks()
  if (originalScrollTo) Object.defineProperty(HTMLElement.prototype, 'scrollTo', originalScrollTo)
  else Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo')
})

describe('inquiry conversation', () => {
  it('reveals one arrival at a time while retaining earlier email nodes', () => {
    const beats = inquiry()
    const view = render(scene(0))
    const firstEmail = screen.getByRole('article', { name: 'Email from Alex Morgan' })
    expect(firstEmail.textContent).toContain(beats[0].body)
    expect(screen.queryByRole('article', { name: 'Email from You' })).toBeNull()
    expect(screen.queryByText(beats[4].title, { exact: true })).toBeNull()

    view.rerender(scene(1))
    expect(screen.getByRole('article', { name: 'Email from Alex Morgan' })).toBe(firstEmail)
    expect(screen.getByText(beats[1].title, { exact: true })).toBeTruthy()
    expect(screen.queryByRole('article', { name: 'Email from You' })).toBeNull()

    view.rerender(scene(2))
    const reply = screen.getByRole('article', { name: 'Email from You' })
    expect(reply.textContent).toContain(beats[2].body)
    expect(screen.getByRole('article', { name: 'Email from Alex Morgan' })).toBe(firstEmail)
    expect(screen.getAllByRole('article').some(node => node.textContent?.includes(beats[3].body))).toBe(false)

    view.rerender(scene(3))
    expect(screen.getAllByRole('article', { name: 'Email from Alex Morgan' })[0]).toBe(firstEmail)
    expect(screen.getByRole('article', { name: 'Email from You' })).toBe(reply)
    expect(screen.queryByText(beats[4].title, { exact: true })).toBeNull()

    view.rerender(scene(4))
    const thread = screen.getByRole('region', { name: 'Email conversation' })
    expect(within(thread).getAllByRole('article')).toHaveLength(3)
    expect(within(thread).getByText(beats[4].title, { exact: true })).toBeTruthy()
    expect(screen.getAllByRole('article', { name: 'Email from Alex Morgan' })[0]).toBe(firstEmail)
    expect(screen.getByRole('article', { name: 'Email from You' })).toBe(reply)
  })

  it('keeps the email subject, signatures and message times in the conversation', () => {
    render(scene(3))
    expect(screen.getByText('Deck at Cedar Lane', { exact: true })).toBeTruthy()
    for (const beat of inquiry().filter(beat => beat.kind === 'email')) {
      const message = screen.getAllByRole('article', { name: `Email from ${beat.actor}` })
        .find(node => node.textContent?.includes(beat.body))!
      expect(within(message).getByText(beat.messageTime!, { exact: true })).toBeTruthy()
      for (const line of beat.emailSignature!) {
        expect(within(message).getAllByText(line, { exact: true }).length).toBeGreaterThan(0)
      }
    }
  })

  it('reconstructs prior messages from a persisted beat and starts replay at the first message', () => {
    let state = lifecycleReducer(initialLifecycleState(), { type: 'SELECT_ROLE', role: 'operator' })
    for (let i = 0; i < 3; i++) state = lifecycleReducer(state, { type: 'ADVANCE_CUTSCENE' })
    state = restoreLifecycleState(JSON.stringify(state))
    const view = render(scene(state.cutscene!.beat, { reduced: true }))
    expect(screen.getByRole('region', { name: 'Email conversation' }).querySelectorAll('article')).toHaveLength(3)
    state = lifecycleReducer(state, { type: 'SKIP_CUTSCENE' })
    state = lifecycleReducer(state, { type: 'REPLAY_CUTSCENE' })
    view.rerender(scene(state.cutscene!.beat, { reduced: true }))
    expect(screen.getByRole('region', { name: 'Email conversation' }).querySelectorAll('article')).toHaveLength(1)
    expect(screen.queryByRole('article', { name: 'Email from You' })).toBeNull()
  })

  it('keeps pause and skip accessible without turning automatic arrivals into buttons', () => {
    const onPause = vi.fn(), onSkip = vi.fn()
    const beats = inquiry()
    const view = render(<DemoCutscene beat={beats[2]} conversation={beats} index={2} total={5}
      paused={false} reduced={false} onPause={onPause} onSkip={onSkip} />)
    expect(within(screen.getByRole('region', { name: 'Email conversation' })).queryAllByRole('button')).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: 'Pause scene' }))
    fireEvent.click(screen.getByRole('button', { name: 'Skip scene' }))
    expect(onPause).toHaveBeenCalledOnce()
    expect(onSkip).toHaveBeenCalledOnce()
    view.rerender(<DemoCutscene beat={beats[2]} conversation={beats} index={2} total={5}
      paused reduced={false} onPause={onPause} onSkip={onSkip} />)
    expect(screen.getByRole('button', { name: 'Resume scene' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('scrolls only the conversation on arrival, without scrolling again on pause or unrelated renders', () => {
    const view = render(scene(0))
    const thread = screen.getByRole('region', { name: 'Email conversation' })
    expect(scrolls).toHaveLength(1)
    expect(scrolls[0].element).toBe(thread)
    expect(scrolls[0].options.behavior).toBe('smooth')
    view.rerender(scene(1))
    expect(scrolls).toHaveLength(2)
    view.rerender(scene(1, { paused: true }))
    view.rerender(scene(1, { paused: false }))
    expect(scrolls).toHaveLength(2)
    expect(scrolls.every(request => request.element === thread)).toBe(true)
    expect(thread.getAttribute('tabindex')).toBe('0')
    expect(document.querySelectorAll('[aria-live="polite"]')).toHaveLength(1)
  })

  it('positions reduced-motion arrivals immediately and retains all restored messages', () => {
    const view = render(scene(2, { reduced: true }))
    const thread = screen.getByRole('region', { name: 'Email conversation' })
    expect(scrolls).toHaveLength(1)
    expect(scrolls[0].options.behavior).toBe('auto')
    view.rerender(scene(3, { reduced: true }))
    expect(scrolls).toHaveLength(2)
    expect(scrolls.every(request => request.element === thread && request.options.behavior === 'auto')).toBe(true)
    expect(within(thread).getAllByRole('article')).toHaveLength(3)
  })

  it('retains the single-event presentation for other context scenes', () => {
    const beats = cutsceneScript('approval', initialLifecycleState()).beats
    render(<DemoCutscene beat={beats[1]} index={1} total={beats.length}
      paused={false} reduced onPause={vi.fn()} onSkip={vi.fn()} />)
    expect(screen.queryByRole('region', { name: 'Email conversation' })).toBeNull()
    expect(screen.getByRole('article').textContent).toContain(beats[1].body)
  })
})

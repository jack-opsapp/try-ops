import React, { StrictMode, useReducer, useRef } from 'react'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cutsceneScript, CUTSCENE_IDS, CUTSCENE_LENGTHS } from '@/components/demo/cutscene-script'
import { initialLifecycleState, lifecycleReducer, restoreLifecycleState, type LifecycleAction, type LifecycleState } from '@/components/demo/lifecycle-state'
import { useCutscenePlayback } from '@/components/demo/useCutscenePlayback'

function apply(state: LifecycleState, action: LifecycleAction) {
  const next = lifecycleReducer(state, action)
  return next.cutscene ? lifecycleReducer(next, { type: 'SKIP_CUTSCENE' }) : next
}
function billing() {
  const actions: LifecycleAction[] = [
    { type: 'SELECT_ROLE', role: 'operator' }, { type: 'OPEN_BOOKING' }, { type: 'ASSIGN_VISIT', member: 'Mike' },
    { type: 'COMPLETE_VISIT' }, { type: 'SEND_ESTIMATE' }, { type: 'ASSIGN_CREW', members: ['Pete'] }, { type: 'ADVANCE_WORKDAY' },
  ]
  return lifecycleReducer(actions.reduce(apply, initialLifecycleState()), { type: 'OPEN_BILLING' })
}
const serialize = (state: LifecycleState) => restoreLifecycleState(JSON.stringify(state))

describe('context scene state', () => {
  it('introduces the inquiry before booking and keeps controls unavailable during context', () => {
    let state = lifecycleReducer(initialLifecycleState(), { type: 'SELECT_ROLE', role: 'operator' })
    expect(state.cutscene).toEqual({ id: 'inquiry', beat: 0, replay: false })
    expect(lifecycleReducer(state, { type: 'OPEN_BOOKING' })).toBe(state)
    const script = cutsceneScript('inquiry', state)
    expect(script.beats.map(beat => beat.kind)).toEqual(['email', 'record', 'email', 'email', 'calendar'])
    expect(script.beats[2].actor).toBe('You')
    expect(script.beats[2].direction).toBe('outgoing')
    expect(script.beats[3].direction).toBe('incoming')
    for (let beat = 0; beat < 5; beat++) {
      expect(state.cutscene?.beat).toBe(beat)
      expect(serialize(state)).toEqual(state)
      state = lifecycleReducer(state, { type: 'ADVANCE_CUTSCENE' })
    }
    expect(state.cutscene).toBeNull()
    expect(lifecycleReducer(state, { type: 'OPEN_BOOKING' }).scene).toBe('booked')
  })

  it('sets financial facts at the corresponding beat, preserves reload, and replay cannot change facts', () => {
    let state = billing()
    expect(state.invoiceCreated).toBe(false)
    expect(state.paymentRecorded).toBe(false)
    state = lifecycleReducer(state, { type: 'ADVANCE_CUTSCENE' })
    expect(state.cutscene?.beat).toBe(1)
    expect(state.invoiceCreated).toBe(true)
    expect(state.paymentRecorded).toBe(false)
    expect(serialize(state)).toEqual(state)
    state = lifecycleReducer(state, { type: 'ADVANCE_CUTSCENE' })
    expect(state.paymentRecorded).toBe(true)
    state = lifecycleReducer(state, { type: 'ADVANCE_CUTSCENE' })
    const paid = state
    expect(serialize(paid).cutscene).toBeNull()
    state = lifecycleReducer(state, { type: 'REPLAY_CUTSCENE' })
    expect(state.cutscene?.replay).toBe(true)
    expect(serialize(state)).toEqual(state)
    state = lifecycleReducer(state, { type: 'SKIP_CUTSCENE' })
    expect(state).toEqual(paid)
    expect(lifecycleReducer(state, { type: 'ADVANCE_CUTSCENE' })).toBe(state)
  })

  it('cancels on Back and resumes unfinished automatic billing when explicitly revisited', () => {
    const pending = lifecycleReducer(billing(), { type: 'ADVANCE_CUTSCENE' })
    const back = lifecycleReducer(pending, { type: 'BACK' })
    expect(back.scene).toBe('activity')
    expect(back.cutscene).toBeNull()
    const returned = lifecycleReducer(back, { type: 'NAVIGATE', scene: 'billing' })
    expect(returned.cutscene).toEqual({ id: 'billing', beat: 1, replay: false })
    expect(returned.paymentRecorded).toBe(false)
    expect(lifecycleReducer(returned, { type: 'RESTART' })).toEqual(initialLifecycleState())
  })

  it('keeps the Crew briefing in role without claiming task completion', () => {
    const state = lifecycleReducer(initialLifecycleState(), { type: 'SELECT_ROLE', role: 'crew' })
    expect(state.cutscene?.id).toBe('crew-briefing')
    const end = lifecycleReducer(state, { type: 'SKIP_CUTSCENE' })
    expect(end.role).toBe('crew')
    expect(end.taskCompleted).toBe(false)
    expect(end.postedNote).toBe('')
    expect(end.invoiceCreated).toBe(false)
  })

  it.each([
    { id: 'inquiry', beat: -1, replay: false }, { id: 'inquiry', beat: 5, replay: false },
    { id: 'inquiry', beat: 1.5, replay: false }, { id: 'billing', beat: 0, replay: false },
    { id: 'unknown', beat: 0, replay: false }, { id: 'inquiry', beat: 0, replay: 'yes' },
  ])('rejects malformed or cross-scene saved context %j', cutscene => {
    const state = lifecycleReducer(initialLifecycleState(), { type: 'SELECT_ROLE', role: 'operator' })
    expect(restoreLifecycleState(JSON.stringify({ ...state, cutscene }))).toEqual(initialLifecycleState())
  })

  it('gives every cutscene finite readable beats and a matching persisted bound', () => {
    const state = billing()
    for (const id of CUTSCENE_IDS) {
      const script = cutsceneScript(id, state)
      expect(script.beats.length).toBe(CUTSCENE_LENGTHS[id])
      expect(new Set(script.beats.map(beat => beat.id)).size).toBe(script.beats.length)
      for (const beat of script.beats) {
        expect(beat.duration).toBeGreaterThanOrEqual(2000)
        expect(beat.duration).toBeLessThanOrEqual(5000)
        expect(beat.actor).toBeTruthy()
      }
    }
  })
})

let time = 0
let serial = 0
let frames = new Map<number, FrameRequestCallback>()
let visibility = 'visible'
let observe: IntersectionObserverCallback | undefined
function tick(ms: number) {
  act(() => {
    time += ms
    const callbacks = Array.from(frames.values())
    frames.clear()
    callbacks.forEach(callback => callback(time))
  })
}
function Harness({ paused = false }: { paused?: boolean }) {
  const [state, dispatch] = useReducer(lifecycleReducer, undefined, () => lifecycleReducer(initialLifecycleState(), { type: 'SELECT_ROLE', role: 'operator' }))
  const surface = useRef<HTMLDivElement>(null)
  useCutscenePlayback(state, true, paused, surface, dispatch)
  return <div ref={surface}><img data-cutscene-photo alt="Scene photo" /><output data-testid="beat">{state.cutscene?.beat ?? 'complete'}</output><button onClick={() => dispatch({ type: 'RESTART' })}>Restart</button></div>
}
beforeEach(() => {
  time = 0; serial = 0; frames = new Map(); visibility = 'visible'; observe = undefined
  vi.spyOn(performance, 'now').mockImplementation(() => time)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.set(++serial, callback); return serial })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
  vi.stubGlobal('IntersectionObserver', undefined)
  vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility as DocumentVisibilityState)
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('visible cutscene reading time', () => {
  const firstDuration = () => cutsceneScript('inquiry', initialLifecycleState()).beats[0].duration
  it('retains remaining time across explicit pause and has one StrictMode clock', () => {
    const view = render(<StrictMode><Harness/></StrictMode>)
    expect(frames.size).toBe(1)
    tick(1000)
    view.rerender(<StrictMode><Harness paused/></StrictMode>)
    expect(frames.size).toBe(0)
    tick(10000)
    expect(screen.getByTestId('beat').textContent).toBe('0')
    view.rerender(<StrictMode><Harness/></StrictMode>)
    tick(firstDuration() - 1001)
    expect(screen.getByTestId('beat').textContent).toBe('0')
    tick(1)
    expect(screen.getByTestId('beat').textContent).toBe('1')
  })
  it('stops in hidden tabs and cancels its frame on unmount', () => {
    const view = render(<Harness/>)
    tick(1000)
    act(() => { visibility = 'hidden'; document.dispatchEvent(new Event('visibilitychange')) })
    expect(frames.size).toBe(0)
    tick(10000)
    act(() => { visibility = 'visible'; document.dispatchEvent(new Event('visibilitychange')) })
    tick(firstDuration() - 1000)
    expect(screen.getByTestId('beat').textContent).toBe('1')
    view.unmount()
    expect(frames.size).toBe(0)
  })
  it.each(['load', 'error'])('waits for scene photos before counting reading time (%s)', eventName => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(false)
    render(<Harness/>)
    expect(frames.size).toBe(0)
    tick(10000)
    expect(screen.getByTestId('beat').textContent).toBe('0')
    act(() => screen.getByRole('img', { name: 'Scene photo' }).dispatchEvent(new Event(eventName)))
    expect(frames.size).toBe(1)
    tick(firstDuration())
    expect(screen.getByTestId('beat').textContent).toBe('1')
  })
  it('waits until the scene is on screen and pauses when scrolled away', () => {
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) { observe = callback }
      observe() {} disconnect() {}
    })
    render(<Harness/>)
    expect(frames.size).toBe(0)
    const visible = (ratio: number) => act(() => observe?.([{ isIntersecting: ratio > 0, intersectionRatio: ratio } as IntersectionObserverEntry], {} as IntersectionObserver))
    visible(0.6); tick(1000); visible(0)
    tick(10000)
    expect(screen.getByTestId('beat').textContent).toBe('0')
    visible(1); tick(firstDuration() - 1000)
    expect(screen.getByTestId('beat').textContent).toBe('1')
  })
})

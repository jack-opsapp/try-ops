'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { cutsceneScript } from './cutscene-script'
import type { LifecycleAction, LifecycleState } from './lifecycle-state'

/** The clock only measures time spent looking at this beat. CSS owns motion;
 * React updates once per beat, never once per animation frame. */
export function useCutscenePlayback(state: LifecycleState, ready: boolean, paused: boolean, surface: RefObject<HTMLDivElement | null>, dispatch: (action: LifecycleAction) => void) {
  const cutscene = state.cutscene
  const key = cutscene ? `${cutscene.id}:${cutscene.beat}:${cutscene.replay}` : null
  const duration = cutscene ? cutsceneScript(cutscene.id, state).beats[cutscene.beat].duration : 0
  const clock = useRef<{ key: string; remaining: number } | null>(null)

  useEffect(() => {
    if (!ready || !key) { clock.current = null; return }
    if (clock.current?.key !== key) clock.current = { key, remaining: duration }
    let frame: number | undefined
    let started = 0
    let active = true
    let finished = false
    let inView = typeof IntersectionObserver === 'undefined'
    const pendingPhotos = new Set(Array.from(surface.current?.querySelectorAll<HTMLImageElement>('img[data-cutscene-photo]') ?? []).filter(photo => !photo.complete))
    const photoListeners = Array.from(pendingPhotos).map(photo => {
      const settled = () => { pendingPhotos.delete(photo); start() }
      photo.addEventListener('load', settled)
      photo.addEventListener('error', settled)
      return () => { photo.removeEventListener('load', settled); photo.removeEventListener('error', settled) }
    })

    function stop() {
      if (frame === undefined) return
      cancelAnimationFrame(frame)
      frame = undefined
      const current = clock.current
      if (current?.key === key) current.remaining = Math.max(0, current.remaining - (performance.now() - started))
    }
    function tick() {
      if (!active || finished) return
      if (document.visibilityState === 'hidden' || !inView) { stop(); return }
      const current = clock.current
      if (current && performance.now() - started >= current.remaining) {
        frame = undefined
        current.remaining = 0
        finished = true
        dispatch({ type: 'ADVANCE_CUTSCENE' })
        return
      }
      frame = requestAnimationFrame(tick)
    }
    function start() {
      if (!active || finished || paused || pendingPhotos.size > 0 || !inView || document.visibilityState === 'hidden' || frame !== undefined) return
      started = performance.now()
      frame = requestAnimationFrame(tick)
    }
    function visibilityChanged() { if (document.visibilityState === 'hidden') stop(); else start() }
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      inView = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.35)
      if (inView) start(); else stop()
    }, { threshold: [0, 0.35] })
    if (surface.current) observer?.observe(surface.current)
    document.addEventListener('visibilitychange', visibilityChanged)
    start()
    return () => { active = false; stop(); photoListeners.forEach(remove => remove()); observer?.disconnect(); document.removeEventListener('visibilitychange', visibilityChanged) }
  }, [key, duration, ready, paused, surface, dispatch])
}

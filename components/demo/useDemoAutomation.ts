'use client'

import { useEffect, useRef } from 'react'
import type { LifecycleAction, LifecycleState } from './lifecycle-state'

/** Reading time in the sample narrative, never a production service deadline. */
export const AUTOMATION_DELAYS = { estimate: 1600, invoice: 1400, payment: 4200 } as const

export function pendingDemoUpdate(state: LifecycleState) {
  if (state.role !== 'operator') return null
  if (state.scene === 'accepted' && !state.estimateApproved) return { key: 'estimate', delay: AUTOMATION_DELAYS.estimate, action: 'APPROVE_ESTIMATE' } as const
  if (state.scene === 'billing' && !state.invoiceCreated) return { key: 'invoice', delay: AUTOMATION_DELAYS.invoice, action: 'CREATE_INVOICE' } as const
  if (state.scene === 'billing' && !state.paymentRecorded) return { key: 'payment', delay: AUTOMATION_DELAYS.payment, action: 'RECORD_PAYMENT' } as const
  return null
}

/** Only visible reading time advances the story. Each effect owns one timer;
 * cleanup cancels it before navigation, restart, remount or a different event. */
export function useDemoAutomation(state: LifecycleState, ready: boolean, paused: boolean, dispatch: (action: LifecycleAction) => void) {
  const pending = pendingDemoUpdate(state)
  const key = pending?.key
  const delay = pending?.delay
  const action = pending?.action
  const clock = useRef<{ key: string; remaining: number } | null>(null)

  useEffect(() => {
    if (!ready || !key || !action || delay === undefined) { clock.current = null; return }
    if (clock.current?.key !== key) clock.current = { key, remaining: delay }
    let timer: ReturnType<typeof setTimeout> | undefined
    let started = 0
    let active = true
    let fired = false
    function stop() {
      if (timer === undefined) return
      clearTimeout(timer)
      timer = undefined
      const currentClock = clock.current
      if (currentClock && currentClock.key === key) currentClock.remaining = Math.max(0, currentClock.remaining - (Date.now() - started))
    }
    function schedule() {
      if (!active || fired || paused || document.visibilityState === 'hidden' || timer !== undefined) return
      started = Date.now()
      timer = setTimeout(() => {
        timer = undefined
        if (!active || document.visibilityState === 'hidden') return
        fired = true
        const currentClock = clock.current
        if (currentClock && currentClock.key === key) currentClock.remaining = 0
        dispatch({ type: action! })
      }, clock.current?.remaining ?? delay)
    }
    function visibilityChanged() { if (document.visibilityState === 'hidden') stop(); else schedule() }
    document.addEventListener('visibilitychange', visibilityChanged)
    schedule()
    return () => { active = false; stop(); document.removeEventListener('visibilitychange', visibilityChanged) }
  }, [key, delay, action, ready, paused, dispatch])
  return pending
}

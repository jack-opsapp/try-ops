'use client'
import { useEffect, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import styles from './action-guidance.module.css'

/** Follow the existing action markers, including targets revealed by child state.
 * Each SVG lives inside its target, so scrolling, clipping and resizing are native. */
export function ActionGuidance({ root }: { root: RefObject<HTMLDivElement | null> }) {
  const [targets, setTargets] = useState<HTMLElement[]>([])
  useEffect(() => {
    const surface = root.current
    if (!surface) return
    const refresh = () => {
      const next = Array.from(surface.querySelectorAll<HTMLElement>('[data-demo-next="true"]'))
        .filter(target => !target.matches(':disabled'))
      setTargets(previous => previous.length === next.length && previous.every((target, index) => target === next[index]) ? previous : next)
    }
    const observer = new MutationObserver(refresh)
    observer.observe(surface, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-demo-next', 'disabled'] })
    refresh()
    return () => observer.disconnect()
  }, [root])
  return <>{targets.map((target, index) => createPortal(<BorderPulse target={target} />, target.matches('textarea') ? target.parentElement! : target, String(index)))}</>
}

function BorderPulse({ target }: { target: HTMLElement }) {
  const [visible, setVisible] = useState(false)
  const [foreground, setForeground] = useState(true)
  const [radius, setRadius] = useState('0')
  useEffect(() => {
    setRadius(getComputedStyle(target).borderTopLeftRadius || '0')
    const updateVisibility = () => setForeground(document.visibilityState === 'visible')
    updateVisibility()
    document.addEventListener('visibilitychange', updateVisibility)
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      setVisible(entries.some(entry => entry.isIntersecting))
    })
    observer?.observe(target)
    if (!observer) setVisible(true)
    return () => {
      observer?.disconnect()
      document.removeEventListener('visibilitychange', updateVisibility)
    }
  }, [target])
  return <svg aria-hidden="true" focusable="false" className={styles.pulse} data-running={visible && foreground}
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', borderRadius: 'inherit', overflow: 'hidden', zIndex: 1, transform: 'none' }}>
    <rect className={styles.trail} pathLength="100" rx={radius} />
    <rect className={styles.head} pathLength="100" rx={radius} />
  </svg>
}

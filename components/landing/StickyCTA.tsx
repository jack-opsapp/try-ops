'use client'

import { useEffect, useState } from 'react'
import { PrimaryAction } from './PrimaryAction'
import { APPROVED_CTA_LABELS } from '@/lib/landing/content-registry'

interface StickyCTAProps { onDownloadClick: () => void; onTryClick?: () => void; primaryLabel?: string }

export function StickyCTA({ onTryClick }: StickyCTAProps) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const hero = document.getElementById('hero')
    const closing = document.getElementById('closing')
    const footer = document.getElementById('footer')
    if (!hero || typeof IntersectionObserver === 'undefined') return
    let pastHero = false
    const visibleEnd = new Set<Element>()
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === hero) pastHero = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0
        else if (entry.isIntersecting) visibleEnd.add(entry.target)
        else visibleEnd.delete(entry.target)
      }
      setVisible(pastHero && visibleEnd.size === 0)
    })
    observer.observe(hero)
    if (closing) observer.observe(closing)
    if (footer) observer.observe(footer)
    return () => observer.disconnect()
  }, [])
  if (!visible) return null
  return <aside className="landing-sticky" aria-label="Start your trial"><PrimaryAction section="StickyCTA" />{onTryClick && <button type="button" className="landing-button landing-button-secondary" onClick={onTryClick}>{APPROVED_CTA_LABELS.tutorial}</button>}</aside>
}

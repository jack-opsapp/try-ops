'use client'

import { useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { APPROVED_CTA_LABELS, APPROVED_IMAGES } from '@/lib/landing/content-registry'
import { demoDestination } from '@/lib/demo/navigation'
import { trackABClick } from '@/lib/ab/track-click'

export function ProductProof() {
  const [view, setView] = useState<'ios.schedule' | 'ios.job-board'>('ios.schedule')
  const screen = APPROVED_IMAGES[view]
  const pathname = usePathname()
  const demoHref = demoDestination({ from: pathname ?? undefined })
  return <figure className="product-proof" aria-label="See OPS for iPhone">
    <div className="proof-heading"><span className="landing-label">IN YOUR CREW’S HANDS</span><span className="landing-label">OPS / iPHONE</span></div>
    <a className="proof-demo-link" href={demoHref} onClick={() => {
      try { trackABClick('Hero', 'demo_link') } catch { /* Optional diagnostics never cancel native navigation. */ }
    }}>{APPROVED_CTA_LABELS.demo}</a>
    <div className="proof-options" aria-label="Product screenshots">
      <button type="button" aria-pressed={view === 'ios.schedule'} onClick={() => setView('ios.schedule')}>Schedule</button>
      <button type="button" aria-pressed={view === 'ios.job-board'} onClick={() => setView('ios.job-board')}>Job board</button>
    </div>
    <div className="proof-screen"><Image src={screen.src} alt={screen.alt} width={screen.width} height={screen.height} sizes="(max-width: 480px) calc(100vw - 48px), 400px" priority /></div>
    <a className="proof-full-link" href={screen.src} target="_blank" rel="noreferrer">View full screenshot<span className="sr-only"> of {view === 'ios.schedule' ? 'the schedule' : 'the job board'}</span></a>
    <figcaption>{view === 'ios.schedule' ? 'The job. The address. The plan.' : 'Every job has a place.'}<span>OPS for iPhone. Example jobs shown.</span></figcaption>
  </figure>
}

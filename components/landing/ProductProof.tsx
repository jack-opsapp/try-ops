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
  return <div className="product-proof">
    <div className="proof-heading"><span className="landing-label">IN YOUR CREW’S HANDS</span><a className="proof-full-link" href={screen.src} target="_blank" rel="noreferrer">View full screenshot<span className="sr-only"> of {view === 'ios.schedule' ? 'the schedule' : 'the job board'}</span></a></div>
    <a className="proof-demo-link" href={demoHref} onClick={() => {
      try { trackABClick('Hero', 'demo_link') } catch { /* Optional diagnostics never cancel native navigation. */ }
    }}>{APPROVED_CTA_LABELS.demo}</a>
    <figure className="proof-stage" aria-label="See OPS for iPhone">
      <div className="proof-screen"><Image src={screen.src} alt={screen.alt} width={screen.width} height={screen.height} sizes="(max-width: 800px) calc(100vw - 48px), (max-width: 1280px) 44vw, 536px" priority /></div>
      <figcaption>
        <span className="proof-caption-title">{view === 'ios.schedule' ? 'See the day’s jobs and addresses.' : 'See jobs by status.'}</span>
        <span className="proof-caption-note">OPS for iPhone. Example jobs shown.</span>
      </figcaption>
    </figure>
    <div className="proof-options" aria-label="Product screenshots">
      <button type="button" aria-pressed={view === 'ios.schedule'} onClick={() => setView('ios.schedule')}>Schedule</button>
      <button type="button" aria-pressed={view === 'ios.job-board'} onClick={() => setView('ios.job-board')}>Job board</button>
    </div>
  </div>
}

'use client'

import { useEffect, useState } from 'react'
import type { z } from 'zod'
import type { CompareTablePropsSchema } from '@/lib/ab/types'
import { APPROVED_COMPARISONS, APPROVED_OFFER, isComparisonCurrent, type ComparisonRival } from '@/lib/landing/content-registry'

/** Server HTML never freezes a time-sensitive claim. Check at mount and while open. */
export function ComparisonPreview({ rival }: { rival: ComparisonRival }) {
  const offer = APPROVED_COMPARISONS[rival]
  const [current, setCurrent] = useState(false)
  useEffect(() => {
    const check = () => setCurrent(isComparisonCurrent(rival))
    check()
    const timer = window.setInterval(check, 60_000)
    return () => window.clearInterval(timer)
  }, [rival])
  return <div className="comparison-preview">
    <p className="comparison-caption">For a <span className="landing-number">{APPROVED_OFFER.plans[1].seats}</span>-person crew</p>
    <dl className="comparison-rows">
      <div><dt>OPS <span>{APPROVED_OFFER.plans[1].name}</span></dt><dd><strong className="landing-number">${APPROVED_OFFER.plans[1].monthly}</strong><span className="landing-label"> CAD / month</span></dd></div>
      <div><dt>{offer.name}<span>{current ? offer.plan : 'Published pricing'}</span></dt><dd>{current && offer.monthly !== null ? <><strong className="landing-number">${offer.monthly}</strong><span className="landing-label"> USD / month</span></> : <a href={offer.source}>{offer.monthly === null ? 'Request pricing' : 'Check current price'}</a>}</dd></div>
    </dl>
    <p className="comparison-basis">{current ? offer.basis : 'See the current plans and billing terms before deciding.'} {offer.monthly !== null && 'Different currencies; no conversion. Features differ.'}</p>
    <p className="comparison-source"><a href={offer.source}>{offer.name} pricing</a>{current && <> · Checked <time dateTime={offer.checkedAt} className="landing-number">14 Sep 2026</time></>}</p>
  </div>
}

export function CompareTable({ rival, heading = 'COMPARE THE SAME CREW SIZE.' }: z.infer<typeof CompareTablePropsSchema>) {
  return <section className="landing-section"><div className="landing-container"><h2>{heading}</h2><ComparisonPreview rival={rival} /></div></section>
}

'use client'

import { motion } from 'framer-motion'
import { z } from 'zod'
import { CompareTablePropsSchema } from '@/lib/ab/types'

type CompareTableProps = z.infer<typeof CompareTablePropsSchema>

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  viewport: { once: true, amount: 0.2 },
}

/**
 * The honest arithmetic, for a five-person crew.
 *
 * Every competitor figure below is quoted from that company's own published
 * pricing page and carries the date it was read. Nothing is estimated, nothing
 * is converted between currencies, and nothing is rounded in our favour — a
 * comparison page that shades the numbers is worth less than no page at all.
 *
 * Sources, all read 2026-09-09:
 *   Jobber          https://www.getjobber.com/pricing/
 *                   Core $49/mo (1 user, +$29/user), Connect $139/mo
 *                   (includes 5 users), Grow $199/mo (includes 10). USD.
 *   Housecall Pro   https://www.housecallpro.com/pricing/
 *                   Basic $79/mo (1 user), Essentials $189/mo (includes 5,
 *                   +$100/user), Max $329/mo (includes 8, +$75/user). USD.
 *   ServiceTitan    https://www.servicetitan.com/pricing
 *                   No price published. Three tiers, each with a
 *                   "Request Pricing" button. Priced per technician.
 *   OPS             ops-site /plans — Starter $90, Team $140, Business $190,
 *                   every feature at every tier. CAD.
 *
 * Prices are month-to-month, the way a crew actually starts. Jobber and
 * Housecall Pro both publish lower rates on an annual commitment; those are
 * named in the footnote rather than buried.
 */
interface Rival {
  slug: 'jobber' | 'housecall-pro' | 'servicetitan'
  name: string
  /** Month-to-month price for a five-person crew, as published. */
  crewOfFive: string
  crewOfFiveNote: string
  /** What the same crew pays to add one more person. */
  sixthPerson: string
  /** What their cheapest plan actually gives you. */
  entryPlan: string
  annualNote: string | null
}

const RIVALS: Record<Rival['slug'], Rival> = {
  jobber: {
    slug: 'jobber',
    name: 'Jobber',
    crewOfFive: '$139 USD',
    crewOfFiveNote: 'Connect, month to month. Includes 5 users.',
    sixthPerson: '$168 USD',
    entryPlan: 'Core is $49 USD and covers 1 person. Every extra person is $29 USD.',
    annualNote: 'Jobber publishes $99 USD a month for Connect on a one-year commitment.',
  },
  'housecall-pro': {
    slug: 'housecall-pro',
    name: 'Housecall Pro',
    crewOfFive: '$189 USD',
    crewOfFiveNote: 'Essentials, month to month. Includes 5 users.',
    sixthPerson: '$289 USD',
    entryPlan: 'Basic is $79 USD and covers 1 person.',
    annualNote:
      'Housecall Pro publishes $149 USD a month for Essentials on a one-year commitment.',
  },
  servicetitan: {
    slug: 'servicetitan',
    name: 'ServiceTitan',
    crewOfFive: 'Not published',
    crewOfFiveNote: 'Three tiers, each with a "Request Pricing" button.',
    sixthPerson: 'Not published',
    entryPlan: 'Priced per technician, quoted by their sales team.',
    annualNote: null,
  },
}

const OPS = {
  crewOfFive: '$140 CAD',
  crewOfFiveNote: 'Team. Covers the crew, not the seat.',
  sixthPerson: '$190 CAD',
  sixthPersonNote: 'Business, and it covers up to 10.',
  entryPlan: 'Starter is $90 CAD and covers 3 people, with every feature.',
}

const HEAD =
  'font-mono text-[11px] uppercase tracking-[0.2em] text-text-tertiary text-left align-bottom pb-3 px-4 whitespace-nowrap'
const CELL = 'font-mohave text-[14px] md:text-[15px] text-text-secondary align-top py-4 px-4'
const CELL_OPS = 'font-mohave text-[14px] md:text-[15px] text-text-primary align-top py-4 px-4'
const FIGURE =
  'font-mono text-[18px] md:text-[20px] text-text-primary tabular-nums block mb-1'
const FIGURE_MUTED =
  'font-mono text-[18px] md:text-[20px] text-text-tertiary tabular-nums block mb-1'

export function CompareTable({ rival, heading }: CompareTableProps) {
  const them = RIVALS[rival]
  const published = them.crewOfFive !== 'Not published'

  const rows: Array<{ label: string; ops: React.ReactNode; theirs: React.ReactNode }> = [
    {
      label: 'A crew of 5, month to month',
      ops: (
        <>
          <span className={FIGURE}>{OPS.crewOfFive}</span>
          {OPS.crewOfFiveNote}
        </>
      ),
      theirs: (
        <>
          <span className={published ? FIGURE : FIGURE_MUTED}>{them.crewOfFive}</span>
          {them.crewOfFiveNote}
        </>
      ),
    },
    {
      label: 'Then you hire a 6th',
      ops: (
        <>
          <span className={FIGURE}>{OPS.sixthPerson}</span>
          {OPS.sixthPersonNote}
        </>
      ),
      theirs: (
        <>
          <span className={published ? FIGURE : FIGURE_MUTED}>{them.sixthPerson}</span>
          {published ? 'The seat is billed on top.' : 'Ask again.'}
        </>
      ),
    },
    {
      label: 'What the cheapest plan gives you',
      ops: <>{OPS.entryPlan}</>,
      theirs: <>{them.entryPlan}</>,
    },
    {
      label: 'Features held back for a higher tier',
      ops: <>None. Every feature is on every plan.</>,
      theirs: <>The entry plan is a smaller product than the one above it.</>,
    },
    {
      label: 'To see the price',
      ops: <>It is on this page.</>,
      theirs: published ? <>It is on their pricing page.</> : <>Book a call.</>,
    },
  ]

  return (
    <section
      id="compare"
      className="py-6 lg:py-[120px] snap-start snap-always"
      aria-labelledby="compare-heading"
    >
      <div className="max-w-[1000px] mx-auto px-6 md:px-6 lg:px-10">
        <motion.p
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-secondary mb-4"
          {...fadeInUp}
        >
          [ THE MATH ]
        </motion.p>
        <motion.h2
          id="compare-heading"
          className="font-mohave font-bold text-[26px] lg:text-[40px] text-text-primary uppercase tracking-[0.05em] mb-2 lg:mb-3"
          {...fadeInUp}
        >
          {heading ?? `OPS AND ${them.name.toUpperCase()}, SIDE BY SIDE`}
        </motion.h2>
        <motion.p
          className="font-mono text-[14px] lg:text-[16px] text-text-tertiary mb-8 lg:mb-12 max-w-[640px]"
          {...fadeInUp}
        >
          Read from their published pricing page on 2026-09-09. Their prices are in
          US dollars and ours are in Canadian, so both are labelled rather than
          converted.
        </motion.p>

        {/* Wide content scrolls inside its own box; the page never scrolls sideways. */}
        <motion.div className="overflow-x-auto" {...fadeInUp}>
          <table className="w-full min-w-[560px] border-collapse">
            <caption className="sr-only">
              OPS compared with {them.name} for a crew of five
            </caption>
            <thead>
              <tr className="border-b border-border-strong">
                <th scope="col" className={HEAD}>
                  <span className="sr-only">Comparison</span>
                </th>
                <th scope="col" className={HEAD}>
                  OPS
                </th>
                <th scope="col" className={HEAD}>
                  {them.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-border-separator">
                  <th
                    scope="row"
                    className="font-mono text-[12px] md:text-[13px] text-text-tertiary text-left align-top py-4 px-4 w-[30%]"
                  >
                    {row.label}
                  </th>
                  <td className={CELL_OPS}>{row.ops}</td>
                  <td className={CELL}>{row.theirs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.p
          className="font-mono text-[12px] md:text-[13px] text-text-tertiary mt-6 lg:mt-8 max-w-[720px] leading-6"
          {...fadeInUp}
        >
          {them.annualNote ? `${them.annualNote} ` : ''}
          OPS is $90, $140 or $190 a month depending on crew size, and every plan has
          every feature. The trial runs 30 days and takes no credit card.
        </motion.p>
      </div>
    </section>
  )
}

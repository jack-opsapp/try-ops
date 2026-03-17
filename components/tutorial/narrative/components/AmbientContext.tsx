'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { TIMING, EASE_OUT } from '../utils/animations'
import type { Phase } from '../NarrativeTutorialData'

interface AmbientContextProps {
  phase: Phase
  side: 'left' | 'right'
}

/**
 * Desktop-only ghosted OPS-Web side panels.
 *
 * These are NOT real components — they're simplified shapes that echo
 * the real product's visual language: pipeline columns, metric cards,
 * calendar grids, invoice tables.
 *
 * Very low opacity (0.08) — the user doesn't study them. Their peripheral
 * vision catches the product's shape language. When they sign up and see
 * the actual dashboard, there's subconscious familiarity.
 *
 * pointer-events: none — purely decorative.
 */

const AMBIENT_OPACITY = 0.08

// ─── Ghosted Components ────────────────────────────────────────────
// Each is a simplified silhouette of a real OPS-Web element.
// Colors are from the actual pipeline/status system — barely visible but correct.

function GhostedPipelineColumns() {
  const stages = [
    { color: '#BCBCBC', w: '100%' },
    { color: '#B5A381', w: '85%' },
    { color: '#9DB582', w: '70%' },
    { color: '#8195B5', w: '90%' },
    { color: '#B58289', w: '60%' },
    { color: '#E9E9E9', w: '40%' },
  ]

  return (
    <div className="flex gap-1.5 h-full px-3 pt-20">
      {stages.map((stage, i) => (
        <div key={i} className="flex-1 flex flex-col gap-1.5">
          {/* Colored top border — matches OPS-Web pipeline column headers */}
          <div className="h-[2px] rounded-full" style={{ backgroundColor: stage.color }} />
          {/* Column body */}
          <div className="flex-1 rounded-sm flex flex-col gap-1.5 pt-2">
            {/* 1-2 ghosted cards per column */}
            <div
              className="rounded-sm mx-0.5"
              style={{
                height: `${30 + i * 8}px`,
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.03)',
              }}
            />
            {i < 3 && (
              <div
                className="rounded-sm mx-0.5"
                style={{
                  height: '24px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.02)',
                }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function GhostedNotificationRail() {
  return (
    <div className="flex flex-col gap-2 px-4 pt-20">
      {[64, 52, 44].map((h, i) => (
        <div
          key={i}
          className="rounded-lg"
          style={{
            height: h,
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.03)',
          }}
        />
      ))}
    </div>
  )
}

function GhostedMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-lg p-3 flex flex-col gap-1.5"
      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.03)' }}
    >
      <span
        className="uppercase tracking-widest"
        style={{ fontFamily: 'var(--font-kosugi)', fontSize: 9, color: 'rgba(255,255,255,0.25)' }}
      >
        {label}
      </span>
      <span
        style={{ fontFamily: 'var(--font-mohave)', fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.35)' }}
      >
        {value}
      </span>
    </div>
  )
}

function GhostedCalendarGrid() {
  return (
    <div className="px-3 pt-20 flex flex-col gap-1">
      {/* Day headers */}
      <div className="flex gap-1 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="flex-1 text-center" style={{ fontFamily: 'var(--font-kosugi)', fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>
            {d}
          </div>
        ))}
      </div>
      {/* Grid cells */}
      {Array.from({ length: 5 }, (_, row) => (
        <div key={row} className="flex gap-1">
          {Array.from({ length: 7 }, (_, col) => (
            <div
              key={col}
              className="flex-1 rounded-sm"
              style={{ height: 20, backgroundColor: 'rgba(255,255,255,0.02)' }}
            />
          ))}
        </div>
      ))}
      {/* Task bars across some cells */}
      <div className="mt-3 flex flex-col gap-1.5">
        <div className="h-2.5 w-3/4 rounded-sm" style={{ backgroundColor: 'rgba(129,149,181,0.12)' }} />
        <div className="h-2.5 w-1/2 rounded-sm" style={{ backgroundColor: 'rgba(157,181,130,0.12)' }} />
        <div className="h-2.5 w-2/3 rounded-sm" style={{ backgroundColor: 'rgba(181,130,137,0.10)' }} />
      </div>
    </div>
  )
}

function GhostedProjectList() {
  return (
    <div className="flex flex-col gap-2 px-3 pt-20">
      {[72, 64, 56, 60].map((h, i) => (
        <div
          key={i}
          className="rounded-lg"
          style={{
            height: h,
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.03)',
          }}
        />
      ))}
    </div>
  )
}

function GhostedClientCard() {
  return (
    <div className="px-4 pt-20">
      <div
        className="rounded-lg p-4 flex flex-col gap-2.5"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.03)' }}
      >
        <div className="w-10 h-10 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <div className="h-3 w-24 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <div className="h-2 w-16 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }} />
        <div className="mt-2 h-px w-full" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <div className="h-2 w-20 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }} />
      </div>
    </div>
  )
}

function GhostedTeamAvatars() {
  return (
    <div className="flex flex-col gap-3 px-4 pt-20">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
          <div className="flex flex-col gap-1">
            <div className="h-2.5 w-16 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
            <div className="h-2 w-10 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }} />
          </div>
          {/* Status dot */}
          <div className="w-2 h-2 rounded-full ml-auto" style={{ backgroundColor: 'rgba(157,181,130,0.3)' }} />
        </div>
      ))}
    </div>
  )
}

function GhostedInvoiceTable() {
  return (
    <div className="px-3 pt-20">
      {/* Header */}
      <div className="flex gap-2 pb-1.5 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {['INV', 'CLIENT', 'AMOUNT', 'STATUS'].map((h) => (
          <span
            key={h}
            className="flex-1 uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-kosugi)', fontSize: 8, color: 'rgba(255,255,255,0.18)' }}
          >
            {h}
          </span>
        ))}
      </div>
      {/* Rows */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex gap-2 py-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}
        >
          {Array.from({ length: 4 }, (_, j) => (
            <div
              key={j}
              className="flex-1 rounded-sm"
              style={{ height: 10, backgroundColor: 'rgba(255,255,255,0.03)' }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Phase → Ambient Content Map ───────────────────────────────────

const AMBIENT_MAP: Record<Phase, { left: React.ReactNode; right: React.ReactNode }> = {
  leadArrives: {
    left: <GhostedPipelineColumns />,
    right: <GhostedNotificationRail />,
  },
  sendEstimate: {
    left: <GhostedPipelineColumns />,
    right: <GhostedClientCard />,
  },
  estimateApproved: {
    left: <GhostedPipelineColumns />,
    right: (
      <div className="px-4 pt-20">
        <GhostedMetricCard label="WON DEALS" value="1" />
      </div>
    ),
  },
  crewExecutes: {
    left: <GhostedCalendarGrid />,
    right: <GhostedTeamAvatars />,
  },
  weeklyReview: {
    left: <GhostedProjectList />,
    right: (
      <div className="px-4 pt-20 flex flex-col gap-2">
        <GhostedMetricCard label="REVENUE" value="$12,000" />
        <GhostedMetricCard label="TASKS" value="4" />
      </div>
    ),
  },
  invoiceAndPay: {
    left: <GhostedInvoiceTable />,
    right: (
      <div className="px-4 pt-20">
        <GhostedMetricCard label="REVENUE" value="$12,000" />
      </div>
    ),
  },
}

export function AmbientContext({ phase, side }: AmbientContextProps) {
  return (
    <div
      className="h-full pointer-events-none overflow-hidden"
      style={{ opacity: AMBIENT_OPACITY }}
      aria-hidden="true"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${phase}-${side}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: TIMING.ambientLag, ease: EASE_OUT }}
          className="h-full"
        >
          {side === 'left' ? AMBIENT_MAP[phase].left : AMBIENT_MAP[phase].right}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

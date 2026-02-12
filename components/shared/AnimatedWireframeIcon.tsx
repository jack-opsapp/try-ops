'use client'

import { motion } from 'framer-motion'

interface AnimatedIconProps {
  isActive: boolean
  size?: number
}

// ─── Group Text Hell ────────────────────────────────────────────
// 3 speech bubbles with tails and text lines.
// On activate: independent jitter — chaotic messaging.
export function AnimatedTangledMessages({ isActive, size = 48 }: AnimatedIconProps) {
  const jitter = (seed: number) =>
    isActive
      ? {
          x: [0, -2 * seed, 3 * seed, -1 * seed, 2 * seed, 0],
          y: [0, 1 * seed, -2 * seed, 2 * seed, -1 * seed, 0],
          rotate: [0, -2 * seed, 3 * seed, -1 * seed, 0],
          transition: { duration: 0.6, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' as const },
        }
      : { x: 0, y: 0, rotate: 0 }

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-ops-gray-200"
    >
      {/* Bubble 1 — top-left */}
      <motion.g animate={jitter(1)}>
        <path d="M6 6 h24 a3 3 0 0 1 3 3 v10 a3 3 0 0 1 -3 3 h-18 l-4 4 v-4 h-2 a3 3 0 0 1 -3 -3 v-10 a3 3 0 0 1 3 -3 z" />
        <line x1="10" y1="13" x2="26" y2="13" opacity="0.5" />
        <line x1="10" y1="17" x2="22" y2="17" opacity="0.4" />
      </motion.g>

      {/* Bubble 2 — right, overlapping */}
      <motion.g animate={jitter(-1.2)}>
        <path d="M28 20 h26 a3 3 0 0 1 3 3 v10 a3 3 0 0 1 -3 3 h-2 v4 l-4 -4 h-20 a3 3 0 0 1 -3 -3 v-10 a3 3 0 0 1 3 -3 z" />
        <line x1="33" y1="27" x2="51" y2="27" opacity="0.5" />
        <line x1="33" y1="31" x2="46" y2="31" opacity="0.4" />
      </motion.g>

      {/* Bubble 3 — bottom-left, overlapping */}
      <motion.g animate={jitter(0.8)}>
        <path d="M4 38 h22 a3 3 0 0 1 3 3 v10 a3 3 0 0 1 -3 3 h-16 l-4 4 v-4 h-2 a3 3 0 0 1 -3 -3 v-10 a3 3 0 0 1 3 -3 z" />
        <line x1="9" y1="45" x2="23" y2="45" opacity="0.5" />
        <line x1="9" y1="49" x2="19" y2="49" opacity="0.4" />
      </motion.g>

      {/* "?" marks that appear on activate — confusion */}
      <motion.text
        x="38"
        y="48"
        fontSize="11"
        fill="currentColor"
        fontFamily="monospace"
        fontWeight="bold"
        animate={isActive ? { opacity: [0, 0.7, 0.7, 0], transition: { duration: 1.2, repeat: Infinity } } : { opacity: 0 }}
      >
        ?
      </motion.text>
      <motion.text
        x="50"
        y="56"
        fontSize="9"
        fill="currentColor"
        fontFamily="monospace"
        fontWeight="bold"
        animate={isActive ? { opacity: [0, 0, 0.6, 0.6, 0], transition: { duration: 1.4, repeat: Infinity, delay: 0.2 } } : { opacity: 0 }}
      >
        ?
      </motion.text>
    </motion.svg>
  )
}

// ─── Enterprise Overkill ────────────────────────────────────────
// Starts as a clean card with 2 lines. On activate: panels, sidebars,
// headers, toggles, and charts cascade in — overwhelming the UI.
export function AnimatedDashboardOverload({ isActive, size = 48 }: AnimatedIconProps) {
  const spring = { type: 'spring' as const, stiffness: 180, damping: 15 }

  // Elements that overwhelm the simple UI on activate
  const clutter = [
    // Sidebar
    { d: 'M3 14 v44', delay: 0 },
    { d: 'M3 14 h12', delay: 0 },
    { d: 'M15 14 v44', delay: 0.04 },
    // Sidebar items
    { d: 'M6 20 h6', delay: 0.08 },
    { d: 'M6 26 h6', delay: 0.1 },
    { d: 'M6 32 h6', delay: 0.12 },
    { d: 'M6 38 h6', delay: 0.14 },
    { d: 'M6 44 h6', delay: 0.16 },
    { d: 'M6 50 h6', delay: 0.18 },
    // Top header
    { d: 'M3 14 h58', delay: 0.05 },
    // Sub-header tabs
    { d: 'M19 18 h10', delay: 0.2 },
    { d: 'M32 18 h10', delay: 0.22 },
    { d: 'M45 18 h10', delay: 0.24 },
    // Content panels filling main area
    { d: 'M19 24 h18 v12 h-18 z', delay: 0.26 },
    { d: 'M40 24 h18 v12 h-18 z', delay: 0.28 },
    { d: 'M19 40 h18 v8 h-18 z', delay: 0.3 },
    { d: 'M40 40 h18 v8 h-18 z', delay: 0.32 },
    { d: 'M19 52 h39 v4 h-39 z', delay: 0.34 },
    // Tiny toggle dots
    { d: 'M56 8 a2 2 0 1 0 0.01 0', delay: 0.36 },
    { d: 'M50 8 a2 2 0 1 0 0.01 0', delay: 0.38 },
  ]

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-ops-gray-200"
    >
      {/* Base: simple clean app frame */}
      <rect x="3" y="3" width="58" height="58" rx="3" />

      {/* Simple content — always visible */}
      <line x1="12" y1="26" x2="52" y2="26" opacity="0.4" />
      <line x1="12" y1="36" x2="44" y2="36" opacity="0.3" />

      {/* Clutter — cascades in on activate */}
      {clutter.map((item, i) => (
        <motion.path
          key={i}
          d={item.d}
          strokeWidth="1"
          animate={
            isActive
              ? {
                  opacity: [0, 0.6],
                  scale: [0.95, 1],
                  transition: { ...spring, delay: item.delay },
                }
              : { opacity: 0, scale: 0.95 }
          }
        />
      ))}
    </motion.svg>
  )
}

// ─── Tool Sprawl ────────────────────────────────────────────────
// 4 distinct tool icons clustered tight. On activate: they spring
// apart in different directions, $ signs fade into the gaps.
export function AnimatedScatteredApps({ isActive, size = 48 }: AnimatedIconProps) {
  const spring = { type: 'spring' as const, stiffness: 100, damping: 14 }

  const tools = [
    {
      // Calendar — top-left
      cx: 16, cy: 16,
      dx: -7, dy: -7,
      icon: (
        <>
          <rect x="6" y="8" width="20" height="18" rx="2" />
          <line x1="12" y1="6" x2="12" y2="10" strokeWidth="1.5" />
          <line x1="20" y1="6" x2="20" y2="10" strokeWidth="1.5" />
          <line x1="6" y1="14" x2="26" y2="14" strokeWidth="1" opacity="0.4" />
        </>
      ),
    },
    {
      // Camera — top-right
      cx: 44, cy: 16,
      dx: 7, dy: -7,
      icon: (
        <>
          <rect x="34" y="10" width="20" height="16" rx="2" />
          <circle cx="44" cy="18" r="4" />
          <line x1="38" y1="10" x2="40" y2="7" strokeWidth="1" />
          <line x1="40" y1="7" x2="48" y2="7" strokeWidth="1" />
          <line x1="48" y1="7" x2="50" y2="10" strokeWidth="1" />
        </>
      ),
    },
    {
      // Clock — bottom-left
      cx: 16, cy: 46,
      dx: -7, dy: 7,
      icon: (
        <>
          <circle cx="16" cy="46" r="10" />
          <line x1="16" y1="46" x2="16" y2="40" strokeWidth="1.5" />
          <line x1="16" y1="46" x2="21" y2="46" strokeWidth="1.5" />
        </>
      ),
    },
    {
      // Chat — bottom-right
      cx: 44, cy: 46,
      dx: 7, dy: 7,
      icon: (
        <>
          <path d="M34 38 h18 a2 2 0 0 1 2 2 v12 a2 2 0 0 1 -2 2 h-12 l-4 4 v-4 h-2 a2 2 0 0 1 -2 -2 v-12 a2 2 0 0 1 2 -2 z" />
          <line x1="38" y1="44" x2="50" y2="44" opacity="0.4" strokeWidth="1" />
          <line x1="38" y1="48" x2="46" y2="48" opacity="0.3" strokeWidth="1" />
        </>
      ),
    },
  ]

  // $ signs that appear in the gaps between scattered tools
  const dollars = [
    { x: 30, y: 16, delay: 0.3 },
    { x: 30, y: 48, delay: 0.4 },
    { x: 14, y: 32, delay: 0.35 },
    { x: 46, y: 32, delay: 0.45 },
    { x: 30, y: 32, delay: 0.5 },
  ]

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-ops-gray-200"
    >
      {/* Tool icons that drift apart */}
      {tools.map((tool, i) => (
        <motion.g
          key={i}
          animate={
            isActive
              ? {
                  x: tool.dx,
                  y: tool.dy,
                  transition: { ...spring, delay: i * 0.06 },
                }
              : { x: 0, y: 0, transition: spring }
          }
        >
          {tool.icon}
        </motion.g>
      ))}

      {/* $ signs fade into gaps on activate */}
      {dollars.map((d, i) => (
        <motion.text
          key={i}
          x={d.x}
          y={d.y}
          fontSize="10"
          fill="currentColor"
          stroke="none"
          fontFamily="monospace"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="central"
          animate={
            isActive
              ? {
                  opacity: [0, 0.6],
                  scale: [0.5, 1],
                  transition: {
                    type: 'spring' as const,
                    stiffness: 150,
                    damping: 12,
                    delay: d.delay,
                  },
                }
              : { opacity: 0, scale: 0.5 }
          }
        >
          $
        </motion.text>
      ))}
    </motion.svg>
  )
}

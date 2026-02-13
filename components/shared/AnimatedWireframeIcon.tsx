'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface AnimatedIconProps {
  isActive: boolean
  size?: number
}

// ─── Group Text Hell ────────────────────────────────────────────
// 3 speech bubbles appear sequentially. Before each new bubble,
// a "..." typing indicator pulses, then "?" confusion pops in,
// then the next message springs into view. After all 3: chaotic jitter.
export function AnimatedTangledMessages({ isActive, size = 48 }: AnimatedIconProps) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (!isActive) {
      setPhase(0)
      return
    }

    let timeouts: NodeJS.Timeout[] = []
    let interval: ReturnType<typeof setInterval>

    const runSequence = () => {
      timeouts.forEach(clearTimeout)
      timeouts = []

      setPhase(1)                                               // Bubble 1 appears
      timeouts.push(setTimeout(() => setPhase(2), 500))         // "..." typing for bubble 2
      timeouts.push(setTimeout(() => setPhase(3), 900))         // "?" confusion
      timeouts.push(setTimeout(() => setPhase(4), 1300))        // Bubble 2 appears
      timeouts.push(setTimeout(() => setPhase(5), 1800))        // "..." typing for bubble 3
      timeouts.push(setTimeout(() => setPhase(6), 2200))        // "?" confusion
      timeouts.push(setTimeout(() => setPhase(7), 2600))        // Bubble 3 appears
      timeouts.push(setTimeout(() => setPhase(8), 3000))        // Chaos jitter + "?" everywhere
    }

    runSequence()
    interval = setInterval(runSequence, 4500)

    return () => {
      clearInterval(interval)
      timeouts.forEach(clearTimeout)
    }
  }, [isActive])

  // When inactive, show all bubbles. When active, reveal sequentially.
  const showBubble1 = !isActive || phase >= 1
  const showBubble2 = !isActive || phase >= 4
  const showBubble3 = !isActive || phase >= 7
  const jittering = isActive && phase >= 8

  const jitter = (seed: number) =>
    jittering
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
      <motion.g
        style={{ transformOrigin: '18px 14px' }}
        animate={{ opacity: showBubble1 ? 1 : 0, scale: showBubble1 ? 1 : 0.5 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <motion.g animate={jitter(1)}>
          <path d="M6 6 h24 a3 3 0 0 1 3 3 v10 a3 3 0 0 1 -3 3 h-18 l-4 4 v-4 h-2 a3 3 0 0 1 -3 -3 v-10 a3 3 0 0 1 3 -3 z" />
          <line x1="10" y1="13" x2="26" y2="13" opacity="0.5" />
          <line x1="10" y1="17" x2="22" y2="17" opacity="0.4" />
        </motion.g>
      </motion.g>

      {/* "..." typing indicator before bubble 2 */}
      {isActive && phase === 2 && (
        <g>
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={37 + i * 6}
              cy={28}
              r="2"
              fill="currentColor"
              stroke="none"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </g>
      )}

      {/* "?" before bubble 2 */}
      {isActive && phase === 3 && (
        <motion.text
          x="42"
          y="31"
          fontSize="11"
          fill="currentColor"
          stroke="none"
          fontFamily="monospace"
          fontWeight="bold"
          textAnchor="middle"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 0.7, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        >
          ?
        </motion.text>
      )}

      {/* Bubble 2 — right, overlapping */}
      <motion.g
        style={{ transformOrigin: '42px 28px' }}
        animate={{ opacity: showBubble2 ? 1 : 0, scale: showBubble2 ? 1 : 0.5 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <motion.g animate={jitter(-1.2)}>
          <path d="M28 20 h26 a3 3 0 0 1 3 3 v10 a3 3 0 0 1 -3 3 h-2 v4 l-4 -4 h-20 a3 3 0 0 1 -3 -3 v-10 a3 3 0 0 1 3 -3 z" />
          <line x1="33" y1="27" x2="51" y2="27" opacity="0.5" />
          <line x1="33" y1="31" x2="46" y2="31" opacity="0.4" />
        </motion.g>
      </motion.g>

      {/* "..." typing indicator before bubble 3 */}
      {isActive && phase === 5 && (
        <g>
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={10 + i * 6}
              cy={48}
              r="2"
              fill="currentColor"
              stroke="none"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </g>
      )}

      {/* "?" before bubble 3 */}
      {isActive && phase === 6 && (
        <motion.text
          x="16"
          y="51"
          fontSize="11"
          fill="currentColor"
          stroke="none"
          fontFamily="monospace"
          fontWeight="bold"
          textAnchor="middle"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 0.7, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        >
          ?
        </motion.text>
      )}

      {/* Bubble 3 — bottom-left, overlapping */}
      <motion.g
        style={{ transformOrigin: '15px 46px' }}
        animate={{ opacity: showBubble3 ? 1 : 0, scale: showBubble3 ? 1 : 0.5 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <motion.g animate={jitter(0.8)}>
          <path d="M4 38 h22 a3 3 0 0 1 3 3 v10 a3 3 0 0 1 -3 3 h-16 l-4 4 v-4 h-2 a3 3 0 0 1 -3 -3 v-10 a3 3 0 0 1 3 -3 z" />
          <line x1="9" y1="45" x2="23" y2="45" opacity="0.5" />
          <line x1="9" y1="49" x2="19" y2="49" opacity="0.4" />
        </motion.g>
      </motion.g>

      {/* Chaos "?" marks — scattered during jitter phase */}
      {isActive && phase >= 8 && (
        <>
          <motion.text
            x="38"
            y="48"
            fontSize="11"
            fill="currentColor"
            stroke="none"
            fontFamily="monospace"
            fontWeight="bold"
            animate={{ opacity: [0, 0.7, 0.7, 0], transition: { duration: 1.2, repeat: Infinity } }}
          >
            ?
          </motion.text>
          <motion.text
            x="50"
            y="56"
            fontSize="9"
            fill="currentColor"
            stroke="none"
            fontFamily="monospace"
            fontWeight="bold"
            animate={{ opacity: [0, 0, 0.6, 0.6, 0], transition: { duration: 1.4, repeat: Infinity, delay: 0.2 } }}
          >
            ?
          </motion.text>
        </>
      )}
    </motion.svg>
  )
}

// ─── Enterprise Overkill ────────────────────────────────────────
// Starts as a clean card with 2 lines. On activate: panels, sidebars,
// headers, toggles, and charts cascade in — overwhelming the UI.
export function AnimatedDashboardOverload({ isActive, size = 48 }: AnimatedIconProps) {
  const spring = { type: 'spring' as const, stiffness: 120, damping: 12 }

  // Elements that overwhelm the simple UI on activate — slower cascade
  const clutter = [
    // Sidebar
    { d: 'M3 14 v44', delay: 0 },
    { d: 'M3 14 h12', delay: 0.05 },
    { d: 'M15 14 v44', delay: 0.1 },
    // Sidebar items
    { d: 'M6 20 h6', delay: 0.18 },
    { d: 'M6 26 h6', delay: 0.24 },
    { d: 'M6 32 h6', delay: 0.3 },
    { d: 'M6 38 h6', delay: 0.36 },
    { d: 'M6 44 h6', delay: 0.42 },
    { d: 'M6 50 h6', delay: 0.48 },
    // Top header
    { d: 'M3 14 h58', delay: 0.12 },
    // Sub-header tabs
    { d: 'M19 18 h10', delay: 0.5 },
    { d: 'M32 18 h10', delay: 0.56 },
    { d: 'M45 18 h10', delay: 0.62 },
    // Content panels filling main area
    { d: 'M19 24 h18 v12 h-18 z', delay: 0.68 },
    { d: 'M40 24 h18 v12 h-18 z', delay: 0.76 },
    { d: 'M19 40 h18 v8 h-18 z', delay: 0.84 },
    { d: 'M40 40 h18 v8 h-18 z', delay: 0.92 },
    { d: 'M19 52 h39 v4 h-39 z', delay: 1.0 },
    // Tiny toggle dots
    { d: 'M56 8 a2 2 0 1 0 0.01 0', delay: 1.08 },
    { d: 'M50 8 a2 2 0 1 0 0.01 0', delay: 1.14 },
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
  const [driftPhase, setDriftPhase] = useState(0)
  const spring = { type: 'spring' as const, stiffness: 80, damping: 12 }

  useEffect(() => {
    if (!isActive) {
      setDriftPhase(0)
      return
    }
    // After dollars appear, tools drift further apart
    const timeout = setTimeout(() => setDriftPhase(1), 2000)
    return () => clearTimeout(timeout)
  }, [isActive])

  const driftMult = driftPhase >= 1 ? 1.8 : 1

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

  // $ signs — each with unique offset, scale, and rotation for organic feel
  const dollars = [
    { x: 31, y: 14, delay: 0.5, finalOpacity: 0.55, finalScale: 0.9, rotate: -8 },
    { x: 29, y: 50, delay: 0.7, finalOpacity: 0.65, finalScale: 1.15, rotate: 6 },
    { x: 12, y: 31, delay: 0.6, finalOpacity: 0.5, finalScale: 0.8, rotate: -12 },
    { x: 48, y: 33, delay: 0.8, finalOpacity: 0.6, finalScale: 1.05, rotate: 10 },
    { x: 30, y: 33, delay: 0.9, finalOpacity: 0.7, finalScale: 0.95, rotate: -5 },
  ]

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      overflow="visible"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-ops-gray-200"
    >
      {/* Tool icons that drift apart — second phase drifts further */}
      {tools.map((tool, i) => (
        <motion.g
          key={i}
          animate={
            isActive
              ? {
                  x: tool.dx * driftMult,
                  y: tool.dy * driftMult,
                  transition: driftPhase >= 1
                    ? { type: 'spring' as const, stiffness: 30, damping: 14 }
                    : { ...spring, delay: i * 0.12 },
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
                  opacity: [0, d.finalOpacity],
                  scale: [0.3, d.finalScale],
                  rotate: [0, d.rotate],
                  transition: {
                    type: 'spring' as const,
                    stiffness: 120,
                    damping: 10,
                    delay: d.delay,
                  },
                }
              : { opacity: 0, scale: 0.3, rotate: 0 }
          }
        >
          $
        </motion.text>
      ))}
    </motion.svg>
  )
}

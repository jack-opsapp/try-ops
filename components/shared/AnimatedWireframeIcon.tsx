'use client'

import { motion } from 'framer-motion'

interface AnimatedIconProps {
  isActive: boolean
  size?: number
}

export function AnimatedTangledMessages({ isActive, size = 48 }: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-ops-gray-200"
    >
      {/* Bubble 1 — top-left, tilted slightly */}
      <motion.g
        animate={
          isActive
            ? { x: [0, -2, 3, -1, 2, 0], y: [0, 1, -2, 2, -1, 0], transition: { duration: 0.5, ease: 'easeInOut' } }
            : { x: 0, y: 0 }
        }
      >
        <rect x="4" y="6" width="26" height="16" rx="3" transform="rotate(-3 17 14)" />
        <line x1="12" y1="12" x2="24" y2="12" opacity="0.5" />
        <line x1="12" y1="16" x2="20" y2="16" opacity="0.5" />
      </motion.g>

      {/* Bubble 2 — middle-right, tilted opposite */}
      <motion.g
        animate={
          isActive
            ? { x: [0, 3, -2, 1, -3, 0], y: [0, -1, 2, -2, 1, 0], transition: { duration: 0.5, delay: 0.08, ease: 'easeInOut' } }
            : { x: 0, y: 0 }
        }
      >
        <rect x="30" y="20" width="28" height="16" rx="3" transform="rotate(2 44 28)" />
        <line x1="38" y1="26" x2="52" y2="26" opacity="0.5" />
        <line x1="38" y1="30" x2="48" y2="30" opacity="0.5" />
      </motion.g>

      {/* Bubble 3 — bottom-left, tilted */}
      <motion.g
        animate={
          isActive
            ? { x: [0, -3, 2, -2, 3, 0], y: [0, 2, -1, 1, -2, 0], transition: { duration: 0.5, delay: 0.15, ease: 'easeInOut' } }
            : { x: 0, y: 0 }
        }
      >
        <rect x="6" y="38" width="24" height="16" rx="3" transform="rotate(4 18 46)" />
        <line x1="14" y1="44" x2="24" y2="44" opacity="0.5" />
        <line x1="14" y1="48" x2="22" y2="48" opacity="0.5" />
      </motion.g>
    </motion.svg>
  )
}

export function AnimatedDashboardOverload({ isActive, size = 48 }: AnimatedIconProps) {
  // Base grid of tiny rects
  const baseRects = [
    { x: 6, y: 6, w: 10, h: 6 },
    { x: 19, y: 6, w: 10, h: 6 },
    { x: 32, y: 6, w: 10, h: 6 },
    { x: 45, y: 6, w: 13, h: 6 },
    { x: 6, y: 15, w: 16, h: 6 },
    { x: 25, y: 15, w: 10, h: 6 },
    { x: 38, y: 15, w: 20, h: 6 },
    { x: 6, y: 24, w: 10, h: 6 },
    { x: 19, y: 24, w: 14, h: 6 },
    { x: 36, y: 24, w: 10, h: 6 },
    { x: 49, y: 24, w: 9, h: 6 },
    { x: 6, y: 33, w: 20, h: 6 },
    { x: 29, y: 33, w: 10, h: 6 },
  ]

  // Extra rects that pile in on activate
  const extraRects = [
    { x: 42, y: 33, w: 16, h: 6 },
    { x: 6, y: 42, w: 12, h: 6 },
    { x: 21, y: 42, w: 10, h: 6 },
    { x: 34, y: 42, w: 12, h: 6 },
    { x: 49, y: 42, w: 9, h: 6 },
    { x: 6, y: 51, w: 16, h: 6 },
    { x: 25, y: 51, w: 10, h: 6 },
    { x: 38, y: 51, w: 20, h: 6 },
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
      {/* Frame */}
      <rect x="2" y="2" width="60" height="60" rx="3" />

      {/* Base grid — always visible */}
      {baseRects.map((r, i) => (
        <rect key={`base-${i}`} x={r.x} y={r.y} width={r.w} height={r.h} rx="1" opacity="0.6" />
      ))}

      {/* Extra rects — cascade in on activate */}
      {extraRects.map((r, i) => (
        <motion.rect
          key={`extra-${i}`}
          x={r.x}
          y={r.y}
          width={r.w}
          height={r.h}
          rx="1"
          animate={
            isActive
              ? { opacity: [0, 0.7], y: [r.y - 6, r.y], transition: { duration: 0.3, delay: i * 0.06, ease: 'easeOut' } }
              : { opacity: 0 }
          }
        />
      ))}
    </motion.svg>
  )
}

export function AnimatedScatteredApps({ isActive, size = 48 }: AnimatedIconProps) {
  const apps = [
    { x: 2, y: 4, dx: -4, dy: -4 },
    { x: 24, y: 2, dx: 0, dy: -5 },
    { x: 44, y: 6, dx: 5, dy: -3 },
    { x: 6, y: 30, dx: -5, dy: 3 },
    { x: 38, y: 34, dx: 6, dy: 4 },
  ]

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-ops-gray-200"
    >
      {apps.map((app, i) => (
        <motion.g
          key={i}
          animate={
            isActive
              ? { x: [0, app.dx], y: [0, app.dy], transition: { duration: 0.6, delay: i * 0.05, ease: 'easeInOut' } }
              : { x: 0, y: 0 }
          }
        >
          <rect x={app.x} y={app.y} width="16" height="16" rx="3" />
          {/* App icon line inside */}
          <line x1={app.x + 4} y1={app.y + 8} x2={app.x + 12} y2={app.y + 8} opacity="0.4" />
        </motion.g>
      ))}

      {/* $ signs scattered between apps */}
      <text x="18" y="22" fontSize="9" fill="currentColor" fontFamily="monospace" opacity="0.5">$</text>
      <text x="36" y="18" fontSize="9" fill="currentColor" fontFamily="monospace" opacity="0.5">$</text>
      <text x="28" y="48" fontSize="9" fill="currentColor" fontFamily="monospace" opacity="0.5">$</text>
      <text x="50" y="30" fontSize="9" fill="currentColor" fontFamily="monospace" opacity="0.5">$</text>
    </motion.svg>
  )
}

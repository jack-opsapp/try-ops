'use client'

import { motion } from 'framer-motion'

interface AnimatedIconProps {
  isActive: boolean
  size?: number
}

export function AnimatedTangledMessages({ isActive, size = 48 }: AnimatedIconProps) {
  const shake = isActive
    ? { x: [0, -3, 3, -2, 2, 0], transition: { duration: 0.6, ease: 'easeInOut' as const } }
    : { x: 0 }

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
      <motion.g animate={shake}>
        <rect x="4" y="8" width="28" height="18" rx="4" />
        <circle cx="14" cy="17" r="1.5" fill="currentColor" />
        <circle cx="18" cy="17" r="1.5" fill="currentColor" />
        <circle cx="22" cy="17" r="1.5" fill="currentColor" />
      </motion.g>
      <motion.g animate={isActive ? { x: [0, 3, -3, 2, -2, 0], transition: { duration: 0.6, delay: 0.1 } } : { x: 0 }}>
        <rect x="32" y="24" width="28" height="18" rx="4" />
        <circle cx="42" cy="33" r="1.5" fill="currentColor" />
        <circle cx="46" cy="33" r="1.5" fill="currentColor" />
        <circle cx="50" cy="33" r="1.5" fill="currentColor" />
      </motion.g>
      <motion.g animate={isActive ? { x: [0, -2, 2, -3, 3, 0], transition: { duration: 0.6, delay: 0.2 } } : { x: 0 }}>
        <rect x="8" y="38" width="28" height="18" rx="4" />
        <circle cx="18" cy="47" r="1.5" fill="currentColor" />
        <circle cx="22" cy="47" r="1.5" fill="currentColor" />
        <circle cx="26" cy="47" r="1.5" fill="currentColor" />
      </motion.g>
      <line x1="32" y1="17" x2="32" y2="24" />
      <line x1="28" y1="38" x2="36" y2="33" />
    </motion.svg>
  )
}

export function AnimatedDashboardOverload({ isActive, size = 48 }: AnimatedIconProps) {
  const rects = [
    { x: 28, y: 20, w: 12, h: 8, delay: 0 },
    { x: 44, y: 20, w: 12, h: 8, delay: 0.05 },
    { x: 28, y: 32, w: 28, h: 6, delay: 0.1 },
    { x: 28, y: 42, w: 28, h: 6, delay: 0.15 },
    { x: 28, y: 52, w: 12, h: 4, delay: 0.2 },
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
      <rect x="4" y="4" width="56" height="56" rx="4" />
      <line x1="4" y1="16" x2="60" y2="16" />
      <line x1="24" y1="16" x2="24" y2="60" />
      <circle cx="10" cy="10" r="2" fill="currentColor" />
      <circle cx="16" cy="10" r="2" fill="currentColor" />

      {/* Sidebar items */}
      {[20, 28, 36, 44, 52].map((y, i) => (
        <rect key={`sidebar-${i}`} x="8" y={y} width="12" height="4" rx="1" />
      ))}

      {/* Content rects that cascade in */}
      {rects.map((r, i) => (
        <motion.rect
          key={`content-${i}`}
          x={r.x}
          y={r.y}
          width={r.w}
          height={r.h}
          rx="1"
          animate={
            isActive
              ? {
                  opacity: [0, 1],
                  y: [r.y - 8, r.y],
                  transition: { duration: 0.4, delay: r.delay, ease: 'easeOut' as const },
                }
              : { opacity: 1, y: r.y }
          }
        />
      ))}
    </motion.svg>
  )
}

export function AnimatedScatteredApps({ isActive, size = 48 }: AnimatedIconProps) {
  const apps = [
    { x: 4, y: 4, sx: -6, sy: -6 },
    { x: 24, y: 8, sx: 0, sy: -8 },
    { x: 44, y: 4, sx: 6, sy: -6 },
    { x: 8, y: 28, sx: -8, sy: 4 },
    { x: 40, y: 32, sx: 8, sy: 4 },
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
        <motion.rect
          key={i}
          x={app.x}
          y={app.y}
          width="16"
          height="16"
          rx="4"
          animate={
            isActive
              ? {
                  x: [app.x, app.x + app.sx, app.x],
                  y: [app.y, app.y + app.sy, app.y],
                  transition: { duration: 0.6, delay: i * 0.05, ease: 'easeInOut' as const },
                }
              : { x: app.x, y: app.y }
          }
        />
      ))}

      {/* Dashed connections */}
      <path d="M20 12 L24 16" strokeDasharray="3 3" />
      <path d="M40 16 L44 12" strokeDasharray="3 3" />
      <path d="M16 28 L20 24" strokeDasharray="3 3" />
      <path d="M48 32 L44 24" strokeDasharray="3 3" />
      <path d="M24 36 L40 40" strokeDasharray="3 3" />
      <text x="8" y="56" fontSize="10" fill="currentColor" fontFamily="monospace">$$$</text>
    </motion.svg>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LOOP_DURATION = 8000
const PHASE_TIMINGS = [0, 600, 1800, 3800, 5800]

export function HeroAnimation() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = []

    const runLoop = () => {
      setPhase(0)
      // Phase 1: phone outline draws in
      timeouts.push(setTimeout(() => setPhase(1), PHASE_TIMINGS[0]))
      // Phase 2: job cards slide in
      timeouts.push(setTimeout(() => setPhase(2), PHASE_TIMINGS[1]))
      // Phase 3: checkmark on top card
      timeouts.push(setTimeout(() => setPhase(3), PHASE_TIMINGS[2]))
      // Phase 4: hold
      timeouts.push(setTimeout(() => setPhase(4), PHASE_TIMINGS[3]))
      // Phase 5: fade out, restart
      timeouts.push(setTimeout(() => setPhase(5), PHASE_TIMINGS[4]))
    }

    runLoop()
    const interval = setInterval(runLoop, LOOP_DURATION)

    return () => {
      clearInterval(interval)
      timeouts.forEach(clearTimeout)
    }
  }, [])

  // Phone outline path: rounded rectangle
  const phoneWidth = 80
  const phoneHeight = 140
  const phoneX = 60
  const phoneY = 10
  const r = 12
  const phonePerimeter = 2 * (phoneWidth + phoneHeight - 4 * r) + 2 * Math.PI * r

  // Job card dimensions
  const cardWidth = 60
  const cardHeight = 22
  const cardX = phoneX + 10
  const cardGap = 6

  const cards = [
    { y: phoneY + 24, label: 'DEMO JOB' },
    { y: phoneY + 24 + cardHeight + cardGap, label: 'FRAME OUT' },
    { y: phoneY + 24 + 2 * (cardHeight + cardGap), label: 'FINISH' },
  ]

  return (
    <div className="relative w-full h-[200px] lg:h-[350px] flex items-center justify-center">
      <AnimatePresence mode="wait">
        {phase >= 1 && phase < 5 && (
          <motion.svg
            viewBox="0 0 200 160"
            fill="none"
            className="w-full h-full max-w-[280px] lg:max-w-[400px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
          >
            {/* Phone outline — draws in via stroke-dashoffset */}
            <motion.rect
              x={phoneX}
              y={phoneY}
              width={phoneWidth}
              height={phoneHeight}
              rx={r}
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeDasharray={phonePerimeter}
              initial={{ strokeDashoffset: phonePerimeter }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />

            {/* Top notch / status bar line */}
            <motion.line
              x1={phoneX + 25}
              y1={phoneY + 14}
              x2={phoneX + 55}
              y2={phoneY + 14}
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            />

            {/* Job cards — slide in from right */}
            {cards.map((card, i) => (
              <motion.g
                key={i}
                initial={{ opacity: 0, x: 40 }}
                animate={
                  phase >= 2
                    ? { opacity: 1, x: 0, transition: { duration: 0.4, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] } }
                    : { opacity: 0, x: 40 }
                }
              >
                <rect
                  x={cardX}
                  y={card.y}
                  width={cardWidth}
                  height={cardHeight}
                  rx="3"
                  stroke="white"
                  strokeWidth="1"
                  opacity="0.5"
                />
                {/* Title line */}
                <line
                  x1={cardX + 6}
                  y1={card.y + 9}
                  x2={cardX + 36}
                  y2={card.y + 9}
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.6"
                />
                {/* Subtitle line */}
                <line
                  x1={cardX + 6}
                  y1={card.y + 15}
                  x2={cardX + 24}
                  y2={card.y + 15}
                  stroke="white"
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity="0.3"
                />
              </motion.g>
            ))}

            {/* Checkmark on top card */}
            {phase >= 3 && (
              <motion.path
                d={`M${cardX + cardWidth - 14} ${cards[0].y + 8} l4 4 l7 -8`}
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            )}

            {/* Bottom nav bar dots */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            >
              <circle cx={phoneX + 25} cy={phoneY + phoneHeight - 12} r="2" fill="white" />
              <circle cx={phoneX + 40} cy={phoneY + phoneHeight - 12} r="2" fill="white" />
              <circle cx={phoneX + 55} cy={phoneY + phoneHeight - 12} r="2" fill="white" />
            </motion.g>
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  )
}

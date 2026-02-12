'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LOOP_DURATION = 7500

const spring = { type: 'spring' as const, stiffness: 120, damping: 18 }

export function HeroAnimation() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = []

    const runLoop = () => {
      setPhase(0)
      timeouts.push(setTimeout(() => setPhase(1), 100))    // Card 1 outline draws
      timeouts.push(setTimeout(() => setPhase(2), 800))    // Card 1 content springs in
      timeouts.push(setTimeout(() => setPhase(3), 1900))   // Card 2 outline draws
      timeouts.push(setTimeout(() => setPhase(4), 2600))   // Card 2 content springs in
      timeouts.push(setTimeout(() => setPhase(5), 3600))   // Card 3 outline draws
      timeouts.push(setTimeout(() => setPhase(6), 4200))   // Card 3 content + checkmarks cascade
      timeouts.push(setTimeout(() => setPhase(7), 6200))   // Hold complete
      timeouts.push(setTimeout(() => setPhase(8), 6800))   // Fade out
    }

    runLoop()
    const interval = setInterval(runLoop, LOOP_DURATION)

    return () => {
      clearInterval(interval)
      timeouts.forEach(clearTimeout)
    }
  }, [])

  // Card geometry
  const cardW = 130
  const cardH = 52
  const cardR = 4
  const cardX = 35
  const gap = 8
  const cardPerimeter = 2 * (cardW + cardH)

  const cards = [
    { y: 8, titleW: 55, addrW: 40, crewCount: 3, dateW: 22 },
    { y: 8 + cardH + gap, titleW: 48, addrW: 35, crewCount: 2, dateW: 26 },
    { y: 8 + 2 * (cardH + gap), titleW: 60, addrW: 44, crewCount: 3, dateW: 20 },
  ]

  const shouldShowCard = (cardIndex: number) => {
    if (cardIndex === 0) return phase >= 1
    if (cardIndex === 1) return phase >= 3
    if (cardIndex === 2) return phase >= 5
    return false
  }

  const shouldShowContent = (cardIndex: number) => {
    if (cardIndex === 0) return phase >= 2
    if (cardIndex === 1) return phase >= 4
    if (cardIndex === 2) return phase >= 6
    return false
  }

  const viewH = 8 + 3 * cardH + 2 * gap + 8

  return (
    <div className="relative w-full h-[200px] lg:h-[350px] flex items-center justify-center">
      <AnimatePresence mode="wait">
        {phase >= 1 && phase < 8 && (
          <motion.svg
            viewBox={`0 0 200 ${viewH}`}
            fill="none"
            className="w-full h-full max-w-[260px] lg:max-w-[380px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {cards.map((card, ci) => {
              const cx = cardX
              const cy = card.y

              return shouldShowCard(ci) ? (
                <g key={ci}>
                  {/* Card outline — stroke draw-in */}
                  <motion.rect
                    x={cx}
                    y={cy}
                    width={cardW}
                    height={cardH}
                    rx={cardR}
                    stroke="white"
                    strokeWidth="1.5"
                    fill="none"
                    strokeDasharray={cardPerimeter}
                    initial={{ strokeDashoffset: cardPerimeter }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  />

                  {/* Content rows — spring in from left */}
                  {shouldShowContent(ci) && (
                    <>
                      {/* Title line */}
                      <motion.line
                        x1={cx + 12}
                        y1={cy + 16}
                        x2={cx + 12 + card.titleW}
                        y2={cy + 16}
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        initial={{ opacity: 0, x1: cx + 12 - 20, x2: cx + 12 - 20 }}
                        animate={{ opacity: 0.8, x1: cx + 12, x2: cx + 12 + card.titleW }}
                        transition={{ ...spring, delay: 0 }}
                      />

                      {/* Address line */}
                      <motion.line
                        x1={cx + 12}
                        y1={cy + 27}
                        x2={cx + 12 + card.addrW}
                        y2={cy + 27}
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        initial={{ opacity: 0, x1: cx + 12 - 20, x2: cx + 12 - 20 }}
                        animate={{ opacity: 0.35, x1: cx + 12, x2: cx + 12 + card.addrW }}
                        transition={{ ...spring, delay: 0.08 }}
                      />

                      {/* Crew dots */}
                      {Array.from({ length: card.crewCount }).map((_, di) => (
                        <motion.circle
                          key={di}
                          cx={cx + 16 + di * 11}
                          cy={cy + 40}
                          r="4"
                          stroke="white"
                          strokeWidth="1"
                          fill="none"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 0.5, scale: 1 }}
                          transition={{ ...spring, delay: 0.15 + di * 0.06 }}
                        />
                      ))}

                      {/* Date line after crew dots */}
                      <motion.line
                        x1={cx + 16 + card.crewCount * 11 + 6}
                        y1={cy + 40}
                        x2={cx + 16 + card.crewCount * 11 + 6 + card.dateW}
                        y2={cy + 40}
                        stroke="white"
                        strokeWidth="1"
                        strokeLinecap="round"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.25 }}
                        transition={{ ...spring, delay: 0.25 }}
                      />
                    </>
                  )}

                  {/* Checkmark — appears after all cards built */}
                  {phase >= 6 && (
                    <motion.g
                      initial={{ opacity: 0, scale: 0.3 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 15,
                        delay: ci * 0.25,
                      }}
                    >
                      <circle
                        cx={cx + cardW - 16}
                        cy={cy + cardH / 2}
                        r="8"
                        stroke="white"
                        strokeWidth="1.5"
                        fill="none"
                        opacity="0.6"
                      />
                      <motion.path
                        d={`M${cx + cardW - 21} ${cy + cardH / 2} l3 3.5 l6 -7`}
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.35, ease: 'easeOut', delay: ci * 0.25 + 0.15 }}
                      />
                    </motion.g>
                  )}
                </g>
              ) : null
            })}
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  )
}

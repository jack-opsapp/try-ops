'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TypewriterText } from '@/components/ui/TypewriterText'

const LOOP_DURATION = 12500

const spring = { type: 'spring' as const, stiffness: 120, damping: 18 }

// Completed status color from OPSStyle.Colors.status.completed
const COMPLETED_COLOR = '#B58289'

export function HeroAnimation() {
  const [phase, setPhase] = useState(0)
  const [loopKey, setLoopKey] = useState(0)

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = []

    const runLoop = () => {
      setPhase(0)
      setLoopKey((k) => k + 1)

      // === CARD BUILDING ===
      timeouts.push(setTimeout(() => setPhase(1), 100))    // Card 1 outline draws
      timeouts.push(setTimeout(() => setPhase(2), 600))    // Card 1 content springs in
      timeouts.push(setTimeout(() => setPhase(3), 1200))   // Card 2 outline draws
      timeouts.push(setTimeout(() => setPhase(4), 1700))   // Card 2 content springs in
      timeouts.push(setTimeout(() => setPhase(5), 2300))   // Card 3 outline draws
      timeouts.push(setTimeout(() => setPhase(6), 2800))   // Card 3 content + checkmarks cascade

      // === FOLDER TRANSITION ===
      timeouts.push(setTimeout(() => setPhase(7), 4300))   // Cards shrink + folder appears
      timeouts.push(setTimeout(() => setPhase(8), 5100))   // Cards fully absorbed

      // === COMPLETION ===
      timeouts.push(setTimeout(() => setPhase(9), 5800))   // Folder spins + color change

      // === INVOICE ===
      timeouts.push(setTimeout(() => setPhase(10), 7000))  // Invoice rises from folder
      timeouts.push(setTimeout(() => setPhase(11), 7700))  // Checkmark stamps on invoice
      timeouts.push(setTimeout(() => setPhase(12), 8500))  // Invoice returns to folder

      // === CLOSE OUT ===
      timeouts.push(setTimeout(() => setPhase(13), 9500))  // Folder reverts to white, hold
      timeouts.push(setTimeout(() => setPhase(14), 11500)) // Fade out
    }

    runLoop()
    const interval = setInterval(runLoop, LOOP_DURATION)

    return () => {
      clearInterval(interval)
      timeouts.forEach(clearTimeout)
    }
  }, [])

  // ── Card geometry ──
  const cardW = 120
  const cardH = 38
  const cardR = 3
  const cardX = 40
  const gap = 5
  const cardPerimeter = 2 * (cardW + cardH)

  const cards = [
    { y: 4, titleW: 50, addrW: 36, crewCount: 3, dateW: 20 },
    { y: 4 + cardH + gap, titleW: 42, addrW: 30, crewCount: 2, dateW: 24 },
    { y: 4 + 2 * (cardH + gap), titleW: 55, addrW: 40, crewCount: 3, dateW: 18 },
  ]

  // ── Folder geometry (taller) ──
  const folderX = 59
  const folderY = 142
  const folderW = 82
  const folderH = 48
  const folderTabH = 8
  const folderCenterX = folderX + folderW / 2   // 100
  const folderCenterY = folderY + folderH / 2   // 166

  // ── Invoice geometry (taller) ──
  const invoiceX = folderCenterX - 20            // 80
  const invoiceTopY = folderY - 12               // 130
  const invoiceW = 40
  const invoiceH = 56
  const invoiceFoldSize = 7

  // ── Phase helpers ──
  const shouldShowCard = (ci: number) => {
    if (phase >= 9) return false
    if (ci === 0) return phase >= 1
    if (ci === 1) return phase >= 3
    if (ci === 2) return phase >= 5
    return false
  }

  const shouldShowContent = (ci: number) => {
    if (ci === 0) return phase >= 2
    if (ci === 1) return phase >= 4
    if (ci === 2) return phase >= 6
    return false
  }

  // Folder is completed color during the invoice cycle, then reverts to white
  const folderStroke = phase >= 9 && phase < 13 ? COMPLETED_COLOR : 'white'

  // ── Typewriter text ──
  const getTextInfo = () => {
    if (phase >= 10 && phase < 14) return { key: 'paid', text: 'GET PAID. CLOSE IT OUT.' }
    if (phase >= 9 && phase < 10) return { key: 'complete', text: 'COMPLETE THE PROJECT.' }
    if (phase >= 7 && phase < 9) return { key: 'organize', text: 'ORGANIZE EVERYTHING.' }
    if (phase >= 1 && phase < 7) return { key: 'schedule', text: 'SCHEDULE YOUR CREW.' }
    return null
  }

  const textInfo = getTextInfo()

  return (
    <div className="relative w-full h-[260px] lg:h-[400px] flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {phase >= 1 && phase < 14 && (
          <motion.div
            key="hero-anim"
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.svg
              viewBox="0 0 200 210"
              fill="none"
              className="w-[210px] lg:w-[320px]"
            >
              {/* ═══════════════ JOB CARDS ═══════════════ */}
              {cards.map((card, ci) => {
                const cx = cardX
                const cy = card.y
                const cardCenterX = cx + cardW / 2
                const cardCenterY = cy + cardH / 2

                return shouldShowCard(ci) ? (
                  <motion.g
                    key={`card-${ci}`}
                    style={{ transformOrigin: `${cardCenterX}px ${cardCenterY}px` }}
                    animate={
                      phase >= 7
                        ? {
                            scale: 0.12,
                            y: folderCenterY - cardCenterY,
                            opacity: 0,
                          }
                        : { scale: 1, y: 0, opacity: 1 }
                    }
                    transition={{
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1],
                      delay: ci * 0.08,
                    }}
                  >
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
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    />

                    {/* Content rows — spring in */}
                    {shouldShowContent(ci) && (
                      <>
                        {/* Title line */}
                        <motion.line
                          x1={cx + 10}
                          y1={cy + 12}
                          x2={cx + 10 + card.titleW}
                          y2={cy + 12}
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          initial={{ opacity: 0, x1: cx + 10 - 15, x2: cx + 10 - 15 }}
                          animate={{ opacity: 0.8, x1: cx + 10, x2: cx + 10 + card.titleW }}
                          transition={{ ...spring, delay: 0 }}
                        />

                        {/* Address line */}
                        <motion.line
                          x1={cx + 10}
                          y1={cy + 21}
                          x2={cx + 10 + card.addrW}
                          y2={cy + 21}
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.35 }}
                          transition={{ ...spring, delay: 0.06 }}
                        />

                        {/* Crew dots */}
                        {Array.from({ length: card.crewCount }).map((_, di) => (
                          <motion.circle
                            key={di}
                            cx={cx + 14 + di * 9}
                            cy={cy + 31}
                            r="3"
                            stroke="white"
                            strokeWidth="1"
                            fill="none"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 0.5, scale: 1 }}
                            transition={{ ...spring, delay: 0.12 + di * 0.05 }}
                          />
                        ))}

                        {/* Date line */}
                        <motion.line
                          x1={cx + 14 + card.crewCount * 9 + 4}
                          y1={cy + 31}
                          x2={cx + 14 + card.crewCount * 9 + 4 + card.dateW}
                          y2={cy + 31}
                          stroke="white"
                          strokeWidth="1"
                          strokeLinecap="round"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.25 }}
                          transition={{ ...spring, delay: 0.2 }}
                        />
                      </>
                    )}

                    {/* Checkmark */}
                    {phase >= 6 && (
                      <motion.g
                        initial={{ opacity: 0, scale: 0.3 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 200,
                          damping: 15,
                          delay: ci * 0.2,
                        }}
                      >
                        <circle
                          cx={cx + cardW - 14}
                          cy={cy + cardH / 2}
                          r="7"
                          stroke="white"
                          strokeWidth="1.5"
                          fill="none"
                          opacity="0.6"
                        />
                        <motion.path
                          d={`M${cx + cardW - 18} ${cy + cardH / 2} l2.5 3 l5 -6`}
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.3, ease: 'easeOut', delay: ci * 0.2 + 0.12 }}
                        />
                      </motion.g>
                    )}
                  </motion.g>
                ) : null
              })}

              {/* ═══════════════ FOLDER ═══════════════ */}
              {phase >= 7 && (
                <motion.g
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: phase >= 9 ? 360 : 0,
                  }}
                  style={{ transformOrigin: `${folderCenterX}px ${folderCenterY}px` }}
                  transition={{
                    opacity: { duration: 0.3 },
                    scale: { type: 'spring', stiffness: 150, damping: 15 },
                    rotate: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                  }}
                >
                  {/* Folder body */}
                  <motion.rect
                    x={folderX}
                    y={folderY}
                    width={folderW}
                    height={folderH}
                    rx={3}
                    strokeWidth="1.5"
                    fill="none"
                    animate={{ stroke: folderStroke }}
                    transition={{ duration: 0.4 }}
                  />

                  {/* Folder tab */}
                  <motion.path
                    d={`M${folderX} ${folderY} L${folderX} ${folderY - folderTabH} L${folderX + 30} ${folderY - folderTabH} L${folderX + 36} ${folderY}`}
                    strokeWidth="1.5"
                    fill="none"
                    animate={{ stroke: folderStroke }}
                    transition={{ duration: 0.4 }}
                  />

                  {/* Folder label */}
                  <motion.text
                    x={folderCenterX}
                    y={folderY + folderH / 2 + 4}
                    textAnchor="middle"
                    fontFamily="var(--font-mohave)"
                    fontWeight="500"
                    fontSize="10"
                    letterSpacing="0.05em"
                    stroke="none"
                    animate={{ fill: folderStroke }}
                    transition={{ duration: 0.4 }}
                  >
                    PROJECT
                  </motion.text>
                </motion.g>
              )}

              {/* ═══════════════ INVOICE ═══════════════ */}
              {phase >= 10 && (
                <motion.g
                  initial={{ opacity: 0, y: 0 }}
                  animate={{
                    opacity: phase >= 12 ? 0 : 1,
                    y: phase >= 12 ? 0 : -80,
                    scale: phase >= 12 ? 0.3 : 1,
                  }}
                  style={{ transformOrigin: `${folderCenterX}px ${folderY}px` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                >
                  {/* Document body with dog-ear */}
                  <path
                    d={`M${invoiceX} ${invoiceTopY} H${invoiceX + invoiceW - invoiceFoldSize} L${invoiceX + invoiceW} ${invoiceTopY + invoiceFoldSize} V${invoiceTopY + invoiceH} H${invoiceX} Z`}
                    stroke={COMPLETED_COLOR}
                    strokeWidth="1.5"
                    fill="none"
                  />

                  {/* Dog-ear fold */}
                  <path
                    d={`M${invoiceX + invoiceW - invoiceFoldSize} ${invoiceTopY} V${invoiceTopY + invoiceFoldSize} H${invoiceX + invoiceW}`}
                    stroke={COMPLETED_COLOR}
                    strokeWidth="1.5"
                    fill="none"
                  />

                  {/* Detail lines */}
                  <line
                    x1={invoiceX + 8}
                    y1={invoiceTopY + 18}
                    x2={invoiceX + invoiceW - 8}
                    y2={invoiceTopY + 18}
                    stroke={COMPLETED_COLOR}
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  <line
                    x1={invoiceX + 8}
                    y1={invoiceTopY + 26}
                    x2={invoiceX + invoiceW - 8}
                    y2={invoiceTopY + 26}
                    stroke={COMPLETED_COLOR}
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  <line
                    x1={invoiceX + 8}
                    y1={invoiceTopY + 34}
                    x2={invoiceX + invoiceW - 14}
                    y2={invoiceTopY + 34}
                    stroke={COMPLETED_COLOR}
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  {/* $ amount line */}
                  <line
                    x1={invoiceX + invoiceW - 18}
                    y1={invoiceTopY + invoiceH - 10}
                    x2={invoiceX + invoiceW - 8}
                    y2={invoiceTopY + invoiceH - 10}
                    stroke={COMPLETED_COLOR}
                    strokeWidth="1.5"
                    opacity="0.7"
                  />

                  {/* Checkmark — stamps on invoice */}
                  {phase >= 11 && (
                    <motion.g
                      initial={{ opacity: 0, scale: 0.3 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{ transformOrigin: `${folderCenterX}px ${invoiceTopY + 28}px` }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <circle
                        cx={folderCenterX}
                        cy={invoiceTopY + 28}
                        r="9"
                        stroke={COMPLETED_COLOR}
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <motion.path
                        d={`M${folderCenterX - 4} ${invoiceTopY + 28} l3 3.5 l6 -7`}
                        stroke={COMPLETED_COLOR}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
                      />
                    </motion.g>
                  )}
                </motion.g>
              )}
            </motion.svg>

            {/* ═══════════════ TYPEWRITER TEXT ═══════════════ */}
            <div className="h-6 mt-3 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {textInfo && (
                  <motion.div
                    key={`${textInfo.key}-${loopKey}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TypewriterText
                      text={textInfo.text}
                      className="font-mohave text-[13px] lg:text-[15px] uppercase tracking-[0.08em] text-white/50"
                      typingSpeed={30}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

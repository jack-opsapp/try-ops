'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TypewriterText } from '@/components/ui/TypewriterText'

const spring = { type: 'spring' as const, stiffness: 120, damping: 18 }

// Completed status color from OPSStyle.Colors.status.completed
const COMPLETED_COLOR = '#B58289'

export function HeroAnimation() {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = []

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

    // === COMPLETION — folder spins, turns completed color ===
    timeouts.push(setTimeout(() => setPhase(9), 5800))

    // === INVOICE — emerges right, folder shifts left ===
    timeouts.push(setTimeout(() => setPhase(10), 7000))  // Invoice emerges right, folder shifts left
    timeouts.push(setTimeout(() => setPhase(11), 7700))  // Checkmark stamps on invoice

    // === RETURN — both return to center ===
    timeouts.push(setTimeout(() => setPhase(12), 8800))  // Invoice returns + fades

    // === CLOSE OUT — folder spins back to white, stays here ===
    timeouts.push(setTimeout(() => setPhase(13), 9800))

    return () => timeouts.forEach(clearTimeout)
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

  // ── Folder geometry — MUCH bigger ──
  const folderW = 120
  const folderH = 70
  const folderX = 40
  const folderY = 85
  const folderTabH = 12
  const folderCenterX = folderX + folderW / 2   // 100
  const folderCenterY = folderY + folderH / 2   // 120

  // ── Invoice geometry ──
  const invoiceW = 48
  const invoiceH = 62
  const invoiceFoldSize = 8
  const invoiceBaseX = folderCenterX - invoiceW / 2   // 76
  const invoiceBaseY = folderCenterY - invoiceH / 2   // 89

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

  // Folder is completed color during invoice cycle, reverts to white on close-out
  const folderStroke = phase >= 9 && phase < 13 ? COMPLETED_COLOR : 'white'

  // Folder shifts left when invoice is out
  const folderXOffset = phase >= 10 && phase < 12 ? -35 : 0

  // Folder rotation: first spin at phase 9, second spin at phase 13
  const folderRotation = phase >= 13 ? 720 : phase >= 9 ? 360 : 0

  // Invoice shifts right when emerging
  const invoiceXOffset = phase >= 10 && phase < 12 ? 60 : 0

  // ── Typewriter text ──
  const getTextInfo = () => {
    if (phase >= 13) return { key: 'closeout', text: 'CLOSE IT OUT.', isCloseOut: true }
    if (phase >= 10 && phase < 13) return { key: 'paid', text: 'GET PAID.', isCloseOut: false }
    if (phase >= 9 && phase < 10) return { key: 'complete', text: 'COMPLETE THE PROJECT.', isCloseOut: false }
    if (phase >= 7 && phase < 9) return { key: 'organize', text: 'ORGANIZE EVERYTHING.', isCloseOut: false }
    if (phase >= 1 && phase < 7) return { key: 'schedule', text: 'SCHEDULE YOUR CREW.', isCloseOut: false }
    return null
  }

  const textInfo = getTextInfo()

  return (
    <div className="relative w-full h-[260px] lg:h-[400px] flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {phase >= 1 && (
          <motion.div
            key="hero-anim"
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.svg
              viewBox="0 0 200 210"
              fill="none"
              className="w-[210px] lg:w-[320px]"
              overflow="visible"
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
                    rotate: folderRotation,
                    x: folderXOffset,
                  }}
                  style={{ transformOrigin: `${folderCenterX}px ${folderCenterY}px` }}
                  transition={{
                    opacity: { duration: 0.3 },
                    scale: { type: 'spring', stiffness: 150, damping: 15 },
                    rotate: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                    x: { type: 'spring', stiffness: 100, damping: 16 },
                  }}
                >
                  {/* Folder body */}
                  <motion.rect
                    x={folderX}
                    y={folderY}
                    width={folderW}
                    height={folderH}
                    rx={4}
                    strokeWidth="1.5"
                    fill="none"
                    animate={{ stroke: folderStroke }}
                    transition={{ duration: 0.4 }}
                  />

                  {/* Folder tab */}
                  <motion.path
                    d={`M${folderX} ${folderY} L${folderX} ${folderY - folderTabH} L${folderX + 40} ${folderY - folderTabH} L${folderX + 48} ${folderY}`}
                    strokeWidth="1.5"
                    fill="none"
                    animate={{ stroke: folderStroke }}
                    transition={{ duration: 0.4 }}
                  />

                  {/* Folder label */}
                  <motion.text
                    x={folderCenterX}
                    y={folderCenterY + 5}
                    textAnchor="middle"
                    fontFamily="var(--font-mohave)"
                    fontWeight="500"
                    fontSize="13"
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
              {phase >= 10 && phase < 13 && (
                <motion.g
                  initial={{ opacity: 0, x: 0, scale: 0.5 }}
                  animate={{
                    opacity: phase >= 12 ? 0 : 1,
                    x: invoiceXOffset,
                    scale: phase >= 12 ? 0.4 : 1,
                  }}
                  style={{ transformOrigin: `${invoiceBaseX + invoiceW / 2}px ${invoiceBaseY + invoiceH / 2}px` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                >
                  {/* Document body with dog-ear */}
                  <path
                    d={`M${invoiceBaseX} ${invoiceBaseY} H${invoiceBaseX + invoiceW - invoiceFoldSize} L${invoiceBaseX + invoiceW} ${invoiceBaseY + invoiceFoldSize} V${invoiceBaseY + invoiceH} H${invoiceBaseX} Z`}
                    stroke={COMPLETED_COLOR}
                    strokeWidth="1.5"
                    fill="none"
                  />

                  {/* Dog-ear fold */}
                  <path
                    d={`M${invoiceBaseX + invoiceW - invoiceFoldSize} ${invoiceBaseY} V${invoiceBaseY + invoiceFoldSize} H${invoiceBaseX + invoiceW}`}
                    stroke={COMPLETED_COLOR}
                    strokeWidth="1.5"
                    fill="none"
                  />

                  {/* Detail lines */}
                  <line
                    x1={invoiceBaseX + 8}
                    y1={invoiceBaseY + 18}
                    x2={invoiceBaseX + invoiceW - 8}
                    y2={invoiceBaseY + 18}
                    stroke={COMPLETED_COLOR}
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  <line
                    x1={invoiceBaseX + 8}
                    y1={invoiceBaseY + 26}
                    x2={invoiceBaseX + invoiceW - 8}
                    y2={invoiceBaseY + 26}
                    stroke={COMPLETED_COLOR}
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  <line
                    x1={invoiceBaseX + 8}
                    y1={invoiceBaseY + 34}
                    x2={invoiceBaseX + invoiceW - 14}
                    y2={invoiceBaseY + 34}
                    stroke={COMPLETED_COLOR}
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  {/* $ amount line */}
                  <line
                    x1={invoiceBaseX + invoiceW - 18}
                    y1={invoiceBaseY + invoiceH - 12}
                    x2={invoiceBaseX + invoiceW - 8}
                    y2={invoiceBaseY + invoiceH - 12}
                    stroke={COMPLETED_COLOR}
                    strokeWidth="1.5"
                    opacity="0.7"
                  />

                  {/* Checkmark — stamps on invoice */}
                  {phase >= 11 && (
                    <motion.g
                      initial={{ opacity: 0, scale: 0.3 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{ transformOrigin: `${invoiceBaseX + invoiceW / 2}px ${invoiceBaseY + invoiceH / 2 - 4}px` }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <circle
                        cx={invoiceBaseX + invoiceW / 2}
                        cy={invoiceBaseY + invoiceH / 2 - 4}
                        r="10"
                        stroke={COMPLETED_COLOR}
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <motion.path
                        d={`M${invoiceBaseX + invoiceW / 2 - 5} ${invoiceBaseY + invoiceH / 2 - 4} l3.5 4 l7 -8`}
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

            {/* ═══════════════ TEXT ═══════════════ */}
            <div className="h-8 mt-3 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {textInfo && (
                  <motion.div
                    key={textInfo.key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    {textInfo.isCloseOut ? (
                      <motion.span
                        className="font-mohave text-[15px] lg:text-[18px] uppercase tracking-[0.08em] text-white font-medium"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.25, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 150, damping: 12 }}
                      >
                        {textInfo.text}
                      </motion.span>
                    ) : (
                      <TypewriterText
                        text={textInfo.text}
                        className="font-mohave text-[13px] lg:text-[15px] uppercase tracking-[0.08em] text-white/50"
                        typingSpeed={30}
                      />
                    )}
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

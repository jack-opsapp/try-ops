'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProjectFolder } from './ProjectFolder'
import { OPSStyle } from '@/lib/styles/OPSStyle'
import { TypewriterText } from '@/components/ui/TypewriterText'

interface Seq2StatusesProps {
  onComplete: () => void
  skipToEnd?: boolean
}

const STATUS_ORDER = ['rfq', 'estimated', 'accepted', 'inProgress', 'completed', 'closed'] as const
const STATUS_LABELS = OPSStyle.StatusLabels
const STATUS_COLORS = OPSStyle.Colors.status

const UNIFORM_DURATION = 1200
const ITEM_WIDTH = 250

export function Seq2Statuses({ onComplete, skipToEnd }: Seq2StatusesProps) {
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0)
  const [showMainText, setShowMainText] = useState(false)
  const timersRef = useRef<NodeJS.Timeout[]>([])

  const currentStatus = STATUS_ORDER[currentStatusIndex]
  const folderColor = STATUS_COLORS[currentStatus]

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    timersRef.current = timers
    let t = 0

    // Show text
    t += 200
    timers.push(setTimeout(() => setShowMainText(true), t))

    // Forward progression: RFQ → Closed
    for (let i = 1; i <= 5; i++) {
      t += UNIFORM_DURATION
      const targetIndex = i
      timers.push(setTimeout(() => setCurrentStatusIndex(targetIndex), t))
    }

    // Hold on Closed, then complete
    t += 1200
    timers.push(setTimeout(() => onComplete(), t))

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  // Skip to final frame — keep text visible
  useEffect(() => {
    if (!skipToEnd) return
    timersRef.current.forEach(clearTimeout)
    setShowMainText(true)
    setCurrentStatusIndex(5) // Closed
  }, [skipToEnd])

  const carouselX = -(currentStatusIndex * ITEM_WIDTH + ITEM_WIDTH / 2)

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Text */}
      <AnimatePresence>
        {showMainText && (
          <motion.div
            className="absolute top-16 left-0 right-0 text-center px-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-mohave font-medium text-[20px] md:text-[24px] uppercase tracking-wider text-white">
              <TypewriterText text="EVERY PROJECT HAS A STATUS" typingSpeed={30} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animation container */}
      <div className="relative flex flex-col items-center">
        {/* Status carousel */}
        <motion.div
          className="absolute"
          style={{
            bottom: 'calc(100% + 24px)',
            left: '50%',
            width: 0,
            height: 60,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="flex items-center"
            style={{ position: 'absolute', top: 0, height: 60 }}
            animate={{ x: carouselX }}
            transition={{
              duration: UNIFORM_DURATION / 1000,
              type: 'spring',
              stiffness: 180,
              damping: 16,
            }}
          >
            {STATUS_ORDER.map((status, index) => {
              const isActive = index === currentStatusIndex
              const isPrev = index === currentStatusIndex - 1
              const isNext = index === currentStatusIndex + 1
              const isVisible = isActive || isPrev || isNext

              return (
                <div
                  key={status}
                  className="flex-shrink-0 font-mohave font-medium uppercase tracking-wider text-center"
                  style={{
                    width: ITEM_WIDTH,
                    fontSize: isActive ? '24px' : '16px',
                    color: isActive ? STATUS_COLORS[status] : '#FFFFFF',
                    opacity: isActive ? 1 : isVisible ? 0.4 : 0,
                    transition: `color 0.1s, fontSize ${(UNIFORM_DURATION / 1000) * 0.6}s, opacity ${(UNIFORM_DURATION / 1000) * 0.8}s`,
                  }}
                >
                  {STATUS_LABELS[status]}
                </div>
              )
            })}
          </motion.div>
        </motion.div>

        {/* Project folder */}
        <ProjectFolder color={folderColor} label="OFFICE REMODEL" />
      </div>
    </div>
  )
}

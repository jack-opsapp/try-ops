'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProjectFolder } from './ProjectFolder'
import { OPSStyle } from '@/lib/styles/OPSStyle'
import { TypewriterText } from '@/components/ui/TypewriterText'

interface Seq2ArchiveProps {
  onComplete: () => void
  skipToEnd?: boolean
}

const STATUS_ORDER = ['rfq', 'estimated', 'accepted', 'inProgress', 'completed', 'closed'] as const
const STATUS_LABELS = OPSStyle.StatusLabels
const STATUS_COLORS = OPSStyle.Colors.status

const ITEM_WIDTH = 250

export function Seq2Archive({ onComplete, skipToEnd }: Seq2ArchiveProps) {
  // Start on Closed (where Seq2Statuses left off)
  const [currentStatusIndex, setCurrentStatusIndex] = useState(5)
  const [isReversing, setIsReversing] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [hasReturnedFromArchive, setHasReturnedFromArchive] = useState(false)
  const [showArchiveLabel, setShowArchiveLabel] = useState(false)
  const [showChangeText, setShowChangeText] = useState(false)
  const [showArchiveText, setShowArchiveText] = useState(false)
  const [carouselVisible, setCarouselVisible] = useState(true)
  const timersRef = useRef<NodeJS.Timeout[]>([])

  const currentStatus = STATUS_ORDER[currentStatusIndex]
  const folderColor = isArchiving && !hasReturnedFromArchive
    ? STATUS_COLORS.archived
    : hasReturnedFromArchive
      ? '#FFFFFF'
      : STATUS_COLORS[currentStatus]

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    timersRef.current = timers
    let t = 0

    // Start reversing immediately
    t += 300
    timers.push(setTimeout(() => setIsReversing(true), t))

    // Rapid reverse: Closed → Completed → In Progress → Accepted → Estimated
    const reverseSteps = [4, 3, 2, 1]
    reverseSteps.forEach((targetIndex) => {
      t += 150
      timers.push(setTimeout(() => setCurrentStatusIndex(targetIndex), t))
    })

    t += 150
    timers.push(setTimeout(() => setIsReversing(false), t))

    // Settle on Estimated, show "CHANGE IT ANYTIME"
    t += 800
    timers.push(setTimeout(() => setShowChangeText(true), t))

    // Hold then hide
    t += 2000
    timers.push(setTimeout(() => setShowChangeText(false), t))

    // Show archive text and label
    t += 600
    timers.push(setTimeout(() => {
      setShowArchiveText(true)
      setShowArchiveLabel(true)
      setCarouselVisible(false)
    }, t))

    // Start archiving
    t += 600
    timers.push(setTimeout(() => setIsArchiving(true), t))

    // Hold on archive
    t += 2000

    // Return from archive
    timers.push(setTimeout(() => {
      setHasReturnedFromArchive(true)
      setShowArchiveLabel(false)
      setShowArchiveText(false)
    }, t))

    // Complete
    t += 800
    timers.push(setTimeout(() => onComplete(), t))

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  // Skip to final frame — show "CHANGE IT ANYTIME" for context
  useEffect(() => {
    if (!skipToEnd) return
    timersRef.current.forEach(clearTimeout)
    setShowChangeText(true)
    setShowArchiveText(false)
    setShowArchiveLabel(false)
    setIsReversing(false)
    setIsArchiving(false)
    setHasReturnedFromArchive(true)
    setCarouselVisible(false)
    setCurrentStatusIndex(1) // Estimated
  }, [skipToEnd])

  const carouselX = -(currentStatusIndex * ITEM_WIDTH + ITEM_WIDTH / 2)

  const getTransitionDuration = () => {
    if (isReversing) return 0.15
    return 0.6
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Text messages */}
      <AnimatePresence mode="wait">
        {showChangeText && (
          <motion.div
            key="change-text"
            className="absolute top-16 left-0 right-0 text-center px-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-mohave font-medium text-[20px] md:text-[24px] uppercase tracking-wider text-white">
              <TypewriterText text="CHANGE IT ANYTIME" typingSpeed={30} />
            </p>
          </motion.div>
        )}

        {showArchiveText && (
          <motion.div
            key="archive-text"
            className="absolute top-16 left-0 right-0 text-center px-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-mohave font-medium text-[20px] md:text-[24px] uppercase tracking-wider text-white">
              <span style={{ color: STATUS_COLORS.archived }}>ARCHIVE</span>{' '}
              <TypewriterText text="WHAT DOESN'T MOVE FORWARD" typingSpeed={30} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animation container */}
      <div className="relative flex flex-col items-center">
        {/* Status carousel */}
        <AnimatePresence>
          {carouselVisible && !isArchiving && (
            <motion.div
              className="absolute"
              style={{
                bottom: 'calc(100% + 24px)',
                left: '50%',
                width: 0,
                height: 60,
              }}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="flex items-center"
                style={{ position: 'absolute', top: 0, height: 60 }}
                animate={{ x: carouselX }}
                transition={{
                  duration: getTransitionDuration(),
                  type: isReversing ? 'tween' : 'spring',
                  stiffness: isReversing ? undefined : 180,
                  damping: isReversing ? undefined : 16,
                  ease: isReversing ? 'linear' : undefined,
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
                        transition: `color 0.1s, fontSize ${getTransitionDuration() * 0.6}s, opacity ${getTransitionDuration() * 0.8}s`,
                      }}
                    >
                      {STATUS_LABELS[status]}
                    </div>
                  )
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project folder */}
        <motion.div
          animate={{
            y: isArchiving && !hasReturnedFromArchive ? 100 : 0,
            scale: isArchiving && !hasReturnedFromArchive ? 0.8 : 1,
          }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        >
          <ProjectFolder color={folderColor} label="OFFICE REMODEL" />
        </motion.div>
      </div>

      {/* Archive label */}
      <AnimatePresence>
        {showArchiveLabel && (
          <motion.div
            className="absolute font-mohave font-medium text-[18px] uppercase tracking-wider"
            style={{ bottom: '25%', color: STATUS_COLORS.archived }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            ARCHIVED
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

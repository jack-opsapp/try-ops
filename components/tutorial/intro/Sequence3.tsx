'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProjectFolder } from './ProjectFolder'
import { TaskFolder } from './TaskFolder'
import { OPSStyle } from '@/lib/styles/OPSStyle'
import { TypewriterText } from '@/components/ui/TypewriterText'

interface Sequence3Props {
  onComplete: () => void
}

const STATUS_ORDER = ['rfq', 'estimated', 'accepted', 'inProgress', 'completed', 'closed'] as const
const STATUS_LABELS = OPSStyle.StatusLabels
const STATUS_COLORS = OPSStyle.Colors.status

const ITEM_WIDTH = 250
const GRAYSCALE = '#888888'

const TASK_COLORS = ['#F5F5DC', '#D4A574', '#8B9D83'] // cream, burnt orange, sage
const TASK_POSITIONS = [
  { y: -160 },
  { y: -100 },
  { y: -40 },
]
const FOLDER_SHIFT_Y = 55

function InvoiceIcon({ color = '#FFFFFF' }: { color?: string }) {
  return (
    <svg width="48" height="56" viewBox="0 0 48 56" fill="none">
      {/* Dog-eared rectangle */}
      <path
        d="M4 4 H34 L44 14 V52 H4 Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      {/* Dog ear fold */}
      <path
        d="M34 4 V14 H44"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      {/* Line details */}
      <line x1="12" y1="24" x2="36" y2="24" stroke={color} strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="32" x2="36" y2="32" stroke={color} strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="40" x2="28" y2="40" stroke={color} strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

function CheckmarkOverlay({ color, centerY = '50%' }: { color: string; centerY?: string }) {
  return (
    <motion.svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="absolute"
      style={{ top: centerY, left: '50%', marginTop: -12, marginLeft: -12 }}
      initial={{ opacity: 0, scale: 0.3, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      <path d="M8 12 L11 15 L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  )
}

export function Sequence3({ onComplete }: Sequence3Props) {
  // Carousel state
  const [carouselVisible, setCarouselVisible] = useState(false)
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0)

  // Task state
  const [tasksVisible, setTasksVisible] = useState(false)
  const [completedTasks, setCompletedTasks] = useState<number[]>([])
  const [tasksCollapsing, setTasksCollapsing] = useState(false)

  // Messages
  const [showMessage1, setShowMessage1] = useState(false)
  const [showMessage2, setShowMessage2] = useState(false)

  // Invoice state
  const [showInvoice, setShowInvoice] = useState(false)
  const [invoiceChecked, setInvoiceChecked] = useState(false)
  const [invoiceCollapsing, setInvoiceCollapsing] = useState(false)

  // Finale
  const [zoomThrough, setZoomThrough] = useState(false)
  const [everythingCleared, setEverythingCleared] = useState(false)

  const currentStatus = STATUS_ORDER[currentStatusIndex]
  const folderColor = STATUS_COLORS[currentStatus] ?? '#FFFFFF'

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    let t = 0

    // 1. Carousel appears, spins to IN PROGRESS (index 3) with slot-machine feel
    t += 500
    timers.push(setTimeout(() => setCarouselVisible(true), t))

    // Rapid spin with deceleration: fast → slower → land
    t += 100
    timers.push(setTimeout(() => setCurrentStatusIndex(1), t))
    t += 130
    timers.push(setTimeout(() => setCurrentStatusIndex(2), t))
    t += 200
    timers.push(setTimeout(() => setCurrentStatusIndex(3), t))

    // 2. Message 1 appears
    t += 600
    timers.push(setTimeout(() => setShowMessage1(true), t))

    // 3. Hide carousel, then folder opens, tasks emerge
    t += 400
    timers.push(setTimeout(() => setCarouselVisible(false), t))
    t += 300
    t += 300
    timers.push(setTimeout(() => setTasksVisible(true), t))

    // 4. Tasks complete one by one (same speed)
    const taskCompleteDelay = 1000
    for (let i = 0; i < 3; i++) {
      t += taskCompleteDelay
      const taskIndex = i
      timers.push(setTimeout(() => {
        setCompletedTasks(prev => [...prev, taskIndex])
      }, t))
    }

    // 5. Hold, then collapse tasks
    t += 800
    timers.push(setTimeout(() => setTasksCollapsing(true), t))

    t += 600
    timers.push(setTimeout(() => {
      setTasksVisible(false)
    }, t))

    // 6. Carousel fades in already at In Progress, wait, then rotate to COMPLETED
    t += 400
    timers.push(setTimeout(() => setCarouselVisible(true), t))
    t += 600
    timers.push(setTimeout(() => setCurrentStatusIndex(4), t))

    // 7. Message 1 fades
    t += 800
    timers.push(setTimeout(() => setShowMessage1(false), t))

    // 8. Carousel fades out
    t += 400
    timers.push(setTimeout(() => setCarouselVisible(false), t))

    // 9. Invoice appears, message 2
    t += 600
    timers.push(setTimeout(() => {
      setShowInvoice(true)
      setShowMessage2(true)
    }, t))

    // 10. Checkmark stamps onto invoice
    t += 800
    timers.push(setTimeout(() => setInvoiceChecked(true), t))

    // 11. Hold
    t += 1200

    // 12. Invoice collapses into folder, message 2 fades
    timers.push(setTimeout(() => {
      setInvoiceCollapsing(true)
      setShowMessage2(false)
    }, t))

    t += 600
    timers.push(setTimeout(() => setShowInvoice(false), t))

    // 13. Carousel reappears already at COMPLETED (index 4), then rotates to CLOSED
    t += 400
    timers.push(setTimeout(() => {
      setCurrentStatusIndex(4) // ensure Completed before showing
      setCarouselVisible(true)
    }, t))

    t += 600
    timers.push(setTimeout(() => setCurrentStatusIndex(5), t))

    // 14. Hold on closed
    t += 1200

    // 15. Everything clears
    timers.push(setTimeout(() => {
      setCarouselVisible(false)
      setEverythingCleared(true)
    }, t))

    // 16. Zoom-through
    t += 300
    timers.push(setTimeout(() => setZoomThrough(true), t))

    // 17. Complete (text now comes from checkpoint)
    t += 1000
    timers.push(setTimeout(() => onComplete(), t))

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  const carouselX = -(currentStatusIndex * ITEM_WIDTH + ITEM_WIDTH / 2)

  const getTaskColor = (index: number) => {
    if (tasksCollapsing) return GRAYSCALE
    if (completedTasks.includes(index)) return STATUS_COLORS.completed
    return GRAYSCALE
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Text messages */}
      <AnimatePresence mode="wait">
        {showMessage1 && (
          <motion.div
            key="msg1"
            className="absolute top-16 left-0 right-0 text-center px-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-mohave font-medium text-[20px] md:text-[24px] uppercase tracking-wider text-white">
              <TypewriterText text="COMPLETE TASKS. COMPLETE THE PROJECT." typingSpeed={30} />
            </p>
          </motion.div>
        )}

        {showMessage2 && (
          <motion.div
            key="msg2"
            className="absolute top-16 left-0 right-0 text-center px-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-mohave font-medium text-[20px] md:text-[24px] uppercase tracking-wider text-white">
              <TypewriterText text="GET PAID. CLOSE IT OUT." typingSpeed={30} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animation container */}
      {!everythingCleared && (
        <div className="relative flex flex-col items-center">
          {/* Status carousel */}
          <AnimatePresence>
            {carouselVisible && (
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
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="flex items-center"
                  style={{ position: 'absolute', top: 0, height: 60 }}
                  initial={false}
                  animate={{ x: carouselX }}
                  transition={{
                    duration: 0.6,
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
                          transition: 'color 0.1s, fontSize 0.4s, opacity 0.5s',
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

          {/* Invoice icon — above folder */}
          <AnimatePresence>
            {showInvoice && !invoiceCollapsing && (
              <motion.div
                className="absolute"
                style={{ bottom: 'calc(100% + 24px)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40, scale: 0.3 }}
                transition={{ type: 'spring', stiffness: 150, damping: 18 }}
              >
                <div className="relative">
                  <InvoiceIcon color={folderColor} />
                  {invoiceChecked && <CheckmarkOverlay color={folderColor} />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Task folders — emerge from folder */}
          {TASK_POSITIONS.map((pos, index) => (
            <motion.div
              key={index}
              className="absolute"
              style={{ left: '50%', translateX: '-50%' }}
              initial={false}
              animate={{
                y: tasksVisible && !tasksCollapsing ? pos.y : 0,
                opacity: tasksVisible && !tasksCollapsing ? 1 : 0,
                scale: tasksVisible && !tasksCollapsing ? 1 : 0.5,
              }}
              transition={{
                delay: tasksVisible && !tasksCollapsing ? index * 0.15 : (2 - index) * 0.1,
                type: 'spring',
                stiffness: 100,
                damping: 20,
              }}
            >
              <div className="relative" style={{ width: 60 }}>
                <TaskFolder color={getTaskColor(index)} />
                {completedTasks.includes(index) && !tasksCollapsing && (
                  <CheckmarkOverlay color={STATUS_COLORS.completed} centerY="60%" />
                )}
              </div>
            </motion.div>
          ))}

          {/* Project folder */}
          <motion.div
            animate={{
              y: tasksVisible && !tasksCollapsing ? FOLDER_SHIFT_Y : 0,
              scale: zoomThrough ? 15 : 1,
              opacity: zoomThrough ? 0 : 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 120,
              damping: 18,
            }}
          >
            <ProjectFolder
              color={folderColor}
              label="OFFICE REMODEL"
            />
          </motion.div>
        </div>
      )}
    </div>
  )
}

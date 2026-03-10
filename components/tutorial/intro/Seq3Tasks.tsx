'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProjectFolder } from './ProjectFolder'
import { TaskFolder } from './TaskFolder'
import { OPSStyle } from '@/lib/styles/OPSStyle'
import { TypewriterText } from '@/components/ui/TypewriterText'

interface Seq3TasksProps {
  onComplete: () => void
  skipToEnd?: boolean
}

const STATUS_ORDER = ['rfq', 'estimated', 'accepted', 'inProgress', 'completed', 'closed'] as const
const STATUS_LABELS = OPSStyle.StatusLabels
const STATUS_COLORS = OPSStyle.Colors.status

const ITEM_WIDTH = 250
const GRAYSCALE = '#888888'

const TASK_POSITIONS = [
  { y: -160 },
  { y: -100 },
  { y: -40 },
]
const FOLDER_SHIFT_Y = 55

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

export function Seq3Tasks({ onComplete, skipToEnd }: Seq3TasksProps) {
  const [carouselVisible, setCarouselVisible] = useState(false)
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0)
  const [tasksVisible, setTasksVisible] = useState(false)
  const [completedTasks, setCompletedTasks] = useState<number[]>([])
  const [tasksCollapsing, setTasksCollapsing] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const timersRef = useRef<NodeJS.Timeout[]>([])

  const currentStatus = STATUS_ORDER[currentStatusIndex]
  const folderColor = STATUS_COLORS[currentStatus] ?? '#FFFFFF'

  const getTaskColor = (index: number) => {
    if (tasksCollapsing) return GRAYSCALE
    if (completedTasks.includes(index)) return STATUS_COLORS.completed
    return GRAYSCALE
  }

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    timersRef.current = timers
    let t = 0

    // Carousel appears, spins to IN PROGRESS
    t += 500
    timers.push(setTimeout(() => setCarouselVisible(true), t))

    t += 100
    timers.push(setTimeout(() => setCurrentStatusIndex(1), t))
    t += 130
    timers.push(setTimeout(() => setCurrentStatusIndex(2), t))
    t += 200
    timers.push(setTimeout(() => setCurrentStatusIndex(3), t))

    // Message appears
    t += 600
    timers.push(setTimeout(() => setShowMessage(true), t))

    // Hide carousel, tasks emerge
    t += 400
    timers.push(setTimeout(() => setCarouselVisible(false), t))
    t += 600
    timers.push(setTimeout(() => setTasksVisible(true), t))

    // Tasks complete one by one
    const taskCompleteDelay = 1000
    for (let i = 0; i < 3; i++) {
      t += taskCompleteDelay
      const taskIndex = i
      timers.push(setTimeout(() => {
        setCompletedTasks(prev => [...prev, taskIndex])
      }, t))
    }

    // Collapse tasks
    t += 800
    timers.push(setTimeout(() => setTasksCollapsing(true), t))

    t += 600
    timers.push(setTimeout(() => setTasksVisible(false), t))

    // Complete
    t += 400
    timers.push(setTimeout(() => onComplete(), t))

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  // Skip to final frame — keep text visible
  useEffect(() => {
    if (!skipToEnd) return
    timersRef.current.forEach(clearTimeout)
    setCarouselVisible(false)
    setTasksVisible(false)
    setTasksCollapsing(true)
    setShowMessage(true)
    setCurrentStatusIndex(3) // In Progress
  }, [skipToEnd])

  const carouselX = -(currentStatusIndex * ITEM_WIDTH + ITEM_WIDTH / 2)

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Text */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
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
      </AnimatePresence>

      {/* Animation container */}
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

        {/* Task folders */}
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
          }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        >
          <ProjectFolder color={folderColor} label="OFFICE REMODEL" />
        </motion.div>
      </div>
    </div>
  )
}

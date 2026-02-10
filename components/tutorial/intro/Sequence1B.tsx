'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProjectFolder } from './ProjectFolder'
import { TaskFolder } from './TaskFolder'
import { TypewriterText } from '@/components/ui/TypewriterText'
import Image from 'next/image'

interface Sequence1BProps {
  onComplete: () => void
}

const TASK_COLORS = {
  task1: '#F5F5DC', // bone/cream
  task2: '#D4A574', // desaturated burnt orange
  task3: '#8B9D83', // sage green
}

const GRAYSCALE = '#888888'

const SAMPLE_TASKS = [
  { label: 'SANDING', color: TASK_COLORS.task1, crew: 'Maverick', avatar: '/avatars/pete.png', date: 'Mar 12' },
  { label: 'PRIMING', color: TASK_COLORS.task2, crew: 'Goose', avatar: '/avatars/nick.png', date: 'Mar 15' },
  { label: 'PAINTING', color: TASK_COLORS.task3, crew: 'Iceman', avatar: '/avatars/tom.png', date: 'Mar 18' },
]

export function Sequence1B({ onComplete }: Sequence1BProps) {
  const [activeTask, setActiveTask] = useState<number | null>(null)
  const [showDetails, setShowDetails] = useState<number | null>(null)
  const [collapsing, setCollapsing] = useState(false)
  const [textVisible, setTextVisible] = useState(false)

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    // Show text at start
    timers.push(setTimeout(() => setTextVisible(true), 200))

    // Task 1: select, show details, hide details, deselect
    timers.push(setTimeout(() => setActiveTask(0), 500))
    timers.push(setTimeout(() => setShowDetails(0), 700))
    timers.push(setTimeout(() => setShowDetails(null), 2200))
    timers.push(setTimeout(() => setActiveTask(null), 2400))

    // Task 2: select, show details, hide details, deselect
    timers.push(setTimeout(() => setActiveTask(1), 2900))
    timers.push(setTimeout(() => setShowDetails(1), 3100))
    timers.push(setTimeout(() => setShowDetails(null), 4600))
    timers.push(setTimeout(() => setActiveTask(null), 4800))

    // Task 3: select, show details, hide details, deselect
    timers.push(setTimeout(() => setActiveTask(2), 5300))
    timers.push(setTimeout(() => setShowDetails(2), 5500))
    timers.push(setTimeout(() => setShowDetails(null), 7000))
    timers.push(setTimeout(() => setActiveTask(null), 7200))

    // Hide text before collapse
    timers.push(setTimeout(() => setTextVisible(false), 7500))

    // Collapse tasks back into folder
    timers.push(setTimeout(() => setCollapsing(true), 7800))

    // Complete sequence
    timers.push(setTimeout(() => onComplete(), 9500))

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  const getTaskColor = (index: number) => {
    if (collapsing) return GRAYSCALE
    return activeTask === index ? SAMPLE_TASKS[index].color : GRAYSCALE
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Text */}
      <AnimatePresence>
        {textVisible && (
          <motion.div
            className="absolute top-24 left-0 right-0 text-center px-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-mohave font-medium text-[20px] md:text-[24px] uppercase tracking-wider text-white">
              <TypewriterText text="ASSIGN CREW AND DATES TO A TASK" typingSpeed={30} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task folders with details */}
      <div
        className="absolute flex flex-col items-start gap-8"
        style={{ top: '15%', left: '20%' }}
      >
        {SAMPLE_TASKS.map((task, index) => (
          <motion.div
            key={index}
            className="relative flex items-center"
            initial={{ opacity: 1, y: 0, x: 0 }}
            animate={{
              opacity: collapsing ? 0 : 1,
              y: collapsing ? 150 : 0,
              x: activeTask === index ? -30 : 0,
            }}
            transition={{
              delay: collapsing ? index * 0.15 : 0,
              type: 'spring',
              stiffness: 120,
              damping: 18,
            }}
          >
            {/* Task folder */}
            <div style={{ width: 60 }}>
              <TaskFolder color={getTaskColor(index)} isActive={activeTask === index} />
            </div>

            {/* Task details (slide out from folder when active) - absolutely positioned with stacked layout */}
            <AnimatePresence>
              {showDetails === index && (
                <motion.div
                  className="absolute flex flex-col gap-2"
                  style={{ left: 90, color: task.color }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 20 }}
                >
                  {/* Row 1: Task label */}
                  <span className="font-mohave font-medium text-[18px] uppercase tracking-wide whitespace-nowrap">
                    {task.label}
                  </span>

                  {/* Row 2: Avatar, Team count, Date in horizontal stack */}
                  <div className="flex items-center gap-3">
                    {/* Crew avatar */}
                    <div
                      className="w-7 h-7 rounded-full overflow-hidden border-2"
                      style={{ borderColor: task.color }}
                    >
                      <Image
                        src={task.avatar}
                        alt={task.crew}
                        width={28}
                        height={28}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Team count with icon */}
                    <div className="flex items-center gap-1.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="font-kosugi text-[13px]">1</span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
                        <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                        <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                        <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                      </svg>
                      <span className="font-kosugi text-[13px] whitespace-nowrap">{task.date}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Project folder (centered) */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{
          opacity: collapsing ? 1 : 1,
          scale: collapsing ? 0.95 : 1,
        }}
        transition={{ delay: collapsing ? 0.6 : 0 }}
      >
        <ProjectFolder color="#FFFFFF" isOpen={!collapsing} />
      </motion.div>
    </div>
  )
}

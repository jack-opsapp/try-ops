'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProjectFolder } from './ProjectFolder'
import { TaskFolder } from './TaskFolder'
import { TypewriterText } from '@/components/ui/TypewriterText'

interface Sequence1Props {
  onComplete: () => void
}

const GRAYSCALE = '#888888'

// Task y-offsets relative to the folder center (stacked above it)
const TASK_POSITIONS = [
  { y: -175 }, // Task 1 — furthest above
  { y: -110 }, // Task 2 — middle
  { y: -45 },  // Task 3 — closest to folder
]

// How far the project folder shifts down when tasks emerge
const FOLDER_SHIFT_Y = 65

export function Sequence1({ onComplete }: Sequence1Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    // Step 0: Folder fades in
    timers.push(setTimeout(() => setStep(1), 1000))

    // Step 1: Hold
    timers.push(setTimeout(() => setStep(2), 2000))

    // Step 2: Folder opens
    timers.push(setTimeout(() => setStep(3), 2300))

    // Step 3: Tasks emerge and stack
    timers.push(setTimeout(() => setStep(4), 3300))

    // Step 4: Text appears, hold, then advance to Sequence1B
    timers.push(setTimeout(() => onComplete(), 5300))

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  const tasksVisible = step >= 3
  const textVisible = step >= 4

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Text */}
      <AnimatePresence>
        {textVisible && (
          <motion.div
            className="absolute top-16 left-0 right-0 text-center px-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-mohave font-medium text-[20px] md:text-[24px] uppercase tracking-wider text-white">
              <TypewriterText text="PROJECTS ARE BUILT OF TASKS" typingSpeed={30} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animation container — everything positioned relative to the project folder */}
      <div className="relative flex flex-col items-center">
        {/* Task folders — positioned absolutely, emerge from folder center */}
        {TASK_POSITIONS.map((pos, index) => (
          <motion.div
            key={index}
            className="absolute"
            style={{ left: '50%', translateX: '-50%' }}
            initial={false}
            animate={{
              y: tasksVisible ? pos.y : 0,
              opacity: tasksVisible ? 1 : 0,
              scale: tasksVisible ? 1 : 0.5,
            }}
            transition={{
              delay: tasksVisible ? index * 0.15 : 0,
              type: 'spring',
              stiffness: 100,
              damping: 20,
            }}
          >
            <TaskFolder color={GRAYSCALE} />
          </motion.div>
        ))}

        {/* Project folder — shifts down when tasks emerge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: tasksVisible ? FOLDER_SHIFT_Y : 0,
          }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 20 }}
        >
          <ProjectFolder color="#FFFFFF" />
        </motion.div>
      </div>
    </div>
  )
}

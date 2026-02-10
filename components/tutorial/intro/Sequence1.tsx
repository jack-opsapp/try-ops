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

  const folderIsOpen = step >= 2
  const tasksVisible = step >= 3
  const textVisible = step >= 4

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Text */}
      <AnimatePresence>
        {textVisible && (
          <motion.div
            className="absolute top-24 left-0 right-0 text-center"
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

      {/* Task folders (stacked vertically above project folder, left-aligned) */}
      <AnimatePresence>
        {tasksVisible && (
          <motion.div
            className="absolute flex flex-col items-start gap-8"
            style={{ top: '15%', left: '20%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Task 1 - emerges from project folder */}
            <motion.div
              initial={{ opacity: 0, y: 200, x: 60 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: 0, type: 'spring', stiffness: 100, damping: 20 }}
            >
              <TaskFolder color={GRAYSCALE} />
            </motion.div>

            {/* Task 2 */}
            <motion.div
              initial={{ opacity: 0, y: 200, x: 60 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 100, damping: 20 }}
            >
              <TaskFolder color={GRAYSCALE} />
            </motion.div>

            {/* Task 3 */}
            <motion.div
              initial={{ opacity: 0, y: 200, x: 60 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 100, damping: 20 }}
            >
              <TaskFolder color={GRAYSCALE} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project folder (centered) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 20 }}
      >
        <ProjectFolder color="#FFFFFF" isOpen={folderIsOpen} />
      </motion.div>
    </div>
  )
}

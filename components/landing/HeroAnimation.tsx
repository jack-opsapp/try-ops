'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProjectFolder } from '@/components/tutorial/intro/ProjectFolder'
import { TaskFolder } from '@/components/tutorial/intro/TaskFolder'

const LOOP_DURATION = 7000 // ms total loop
const PHASE_TIMINGS = [0, 800, 1400, 2900, 5400] // phase start times

const taskLabels = ['DEMO', 'FRAME', 'FINISH']

export function HeroAnimation() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = []

    const runLoop = () => {
      setPhase(0)

      // Phase 1: folder appears (0ms)
      timeouts.push(setTimeout(() => setPhase(1), PHASE_TIMINGS[0]))
      // Phase 2: tasks emerge (800ms)
      timeouts.push(setTimeout(() => setPhase(2), PHASE_TIMINGS[1]))
      // Phase 3: labels appear (1400ms)
      timeouts.push(setTimeout(() => setPhase(3), PHASE_TIMINGS[2]))
      // Phase 4: hold (2900ms)
      timeouts.push(setTimeout(() => setPhase(4), PHASE_TIMINGS[3]))
      // Phase 5: collapse (5400ms)
      timeouts.push(setTimeout(() => setPhase(5), PHASE_TIMINGS[4]))
    }

    runLoop()
    const interval = setInterval(runLoop, LOOP_DURATION)

    return () => {
      clearInterval(interval)
      timeouts.forEach(clearTimeout)
    }
  }, [])

  return (
    <div className="relative w-full h-[300px] lg:h-[400px] flex items-center justify-center">
      <AnimatePresence mode="wait">
        {phase >= 1 && phase < 5 && (
          <motion.div
            className="relative flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Task folders above project folder */}
            <div className="flex gap-4 mb-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="relative"
                  initial={{ opacity: 0, y: 20, scale: 0.6 }}
                  animate={
                    phase >= 2
                      ? { opacity: 1, y: 0, scale: 1 }
                      : { opacity: 0, y: 20, scale: 0.6 }
                  }
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                    delay: i * 0.15,
                  }}
                >
                  <TaskFolder color="#C0C0C0" scale={0.9} />
                  {/* Label */}
                  <AnimatePresence>
                    {phase >= 3 && phase < 5 && (
                      <motion.span
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                        className="absolute -bottom-4 left-1/2 -translate-x-1/2 font-mohave text-[10px] lg:text-[11px] tracking-wider text-ops-gray-200 whitespace-nowrap"
                      >
                        {taskLabels[i]}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Project folder */}
            <motion.div className="mt-4">
              <ProjectFolder color="#F5F5F5" label="PROJECT" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

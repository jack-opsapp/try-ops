'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProjectFolder } from './ProjectFolder'
import { OPSStyle } from '@/lib/styles/OPSStyle'
import { TypewriterText } from '@/components/ui/TypewriterText'

interface Seq3FinaleProps {
  onComplete: () => void
  skipToEnd?: boolean
}

const STATUS_COLORS = OPSStyle.Colors.status

export function Seq3Finale({ onComplete, skipToEnd }: Seq3FinaleProps) {
  const [folderDissolving, setFolderDissolving] = useState(false)
  const [showFinalMessage, setShowFinalMessage] = useState(false)
  const timersRef = useRef<NodeJS.Timeout[]>([])

  // Closed status color (where Seq3Invoice left off)
  const folderColor = STATUS_COLORS.closed

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    timersRef.current = timers
    let t = 0

    // Folder dissolve begins
    t += 600
    timers.push(setTimeout(() => setFolderDissolving(true), t))

    // Final message after dissolve
    t += 1400
    timers.push(setTimeout(() => setShowFinalMessage(true), t))

    // Complete
    t += 2000
    timers.push(setTimeout(() => onComplete(), t))

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  // Skip to final frame — show final message
  useEffect(() => {
    if (!skipToEnd) return
    timersRef.current.forEach(clearTimeout)
    setFolderDissolving(true)
    setShowFinalMessage(true)
  }, [skipToEnd])

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Final message */}
      <AnimatePresence>
        {showFinalMessage && (
          <motion.div
            className="absolute top-16 left-0 right-0 text-center px-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-mohave font-medium text-[24px] md:text-[28px] uppercase tracking-wider text-white">
              <TypewriterText text="NOW TRY IT YOURSELF." typingSpeed={40} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animation container */}
      <div className="relative flex flex-col items-center">
        <ProjectFolder
          color={folderColor}
          label="OFFICE REMODEL"
          dissolve={folderDissolving}
        />
      </div>
    </div>
  )
}

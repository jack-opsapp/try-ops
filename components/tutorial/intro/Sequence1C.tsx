'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProjectFolder } from './ProjectFolder'
import { TypewriterText } from '@/components/ui/TypewriterText'

interface Sequence1CProps {
  onComplete: () => void
}

const TASK_COLORS = {
  task1: '#F5F5DC', // bone/cream
  task2: '#D4A574', // desaturated burnt orange
  task3: '#8B9D83', // sage green
}

const DETAIL_ITEMS = [
  { key: 'project', text: 'OFFICE REMODEL', color: '#FFFFFF', size: 16, weight: 500 },
  { key: 'client', text: 'CHARLIE BLACKWOOD', color: 'rgba(255,255,255,0.7)', size: 13, weight: 400 },
  { key: 'address', text: '1842 SUNSET BLVD, APT 4B', color: 'rgba(255,255,255,0.7)', size: 13, weight: 400 },
  { key: 'photos', text: null, color: '#FFFFFF', size: 0, weight: 0 },
  { key: 'task1', text: '+ TASK 1: SANDING', color: TASK_COLORS.task1, size: 14, weight: 500 },
  { key: 'task2', text: '+ TASK 2: PRIMING', color: TASK_COLORS.task2, size: 14, weight: 500 },
  { key: 'task3', text: '+ TASK 3: PAINTING', color: TASK_COLORS.task3, size: 14, weight: 500 },
]

// Stagger for build (top-down) and collapse (bottom-up)
const BUILD_STAGGER = 600
const COLLAPSE_STAGGER = 120

function PhotoPlaceholders() {
  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="w-8 h-8 border border-white/50 rounded flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
      ))}
    </div>
  )
}

export function Sequence1C({ onComplete }: Sequence1CProps) {
  const [showText, setShowText] = useState(false)
  const [folderSmall, setFolderSmall] = useState(false)
  const [visibleDetails, setVisibleDetails] = useState<number>(0)
  const [collapsing, setCollapsing] = useState(false)
  const [collapsedCount, setCollapsedCount] = useState(0)
  const [labelSettled, setLabelSettled] = useState(false)
  const [showSubtitle, setShowSubtitle] = useState(false)

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    let t = 0

    // Show message
    t += 300
    timers.push(setTimeout(() => setShowText(true), t))

    // Scale folder down
    t += 600
    timers.push(setTimeout(() => setFolderSmall(true), t))

    // Build details top-down, one at a time
    for (let i = 0; i < DETAIL_ITEMS.length; i++) {
      t += BUILD_STAGGER
      const count = i + 1
      timers.push(setTimeout(() => setVisibleDetails(count), t))
    }

    // Hold for reading
    t += 1500

    // Hide text
    timers.push(setTimeout(() => setShowText(false), t))

    // Begin collapse bottom-up
    t += 400
    timers.push(setTimeout(() => setCollapsing(true), t))

    // Collapse items from bottom (tasks first, then photos, address, client)
    const collapseOrder = [6, 5, 4, 3, 2, 1]
    for (let i = 0; i < collapseOrder.length; i++) {
      t += COLLAPSE_STAGGER
      const count = i + 1
      timers.push(setTimeout(() => setCollapsedCount(count), t))
    }

    // Project name collapses and settles as label
    t += 300
    timers.push(setTimeout(() => {
      setCollapsedCount(7)
      setLabelSettled(true)
    }, t))

    // Scale folder back up
    t += 200
    timers.push(setTimeout(() => setFolderSmall(false), t))

    // Show subtitle
    t += 600
    timers.push(setTimeout(() => setShowSubtitle(true), t))

    // Complete — flows directly to Seq 2
    t += 800
    timers.push(setTimeout(() => onComplete(), t))

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  // Determine which details are visible during collapse
  const getDetailVisible = (index: number) => {
    if (index >= visibleDetails) return false
    if (!collapsing) return true
    const reverseIndex = DETAIL_ITEMS.length - 1 - index
    return reverseIndex >= collapsedCount
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Message text */}
      <AnimatePresence>
        {showText && (
          <motion.div
            className="absolute top-16 left-0 right-0 text-center px-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-mohave font-medium text-[20px] md:text-[24px] uppercase tracking-wider text-white">
              <TypewriterText text="A PROJECT TAKES 30 SECONDS TO BUILD" typingSpeed={30} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animation container */}
      <div className="relative flex flex-col items-center">
        {/* Details list — positioned above the folder, grows upward from bottom */}
        <motion.div
          className="absolute flex flex-col-reverse gap-2 items-center"
          style={{ bottom: 'calc(100% + 16px)', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
          layout
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        >
          {/* Render in reverse so flex-col-reverse puts first item at top */}
          {[...DETAIL_ITEMS].reverse().map((item, reverseIndex) => {
            const index = DETAIL_ITEMS.length - 1 - reverseIndex
            const isVisible = getDetailVisible(index)

            return (
              <motion.div
                key={item.key}
                layout
                initial={false}
                animate={{
                  opacity: isVisible ? 1 : 0,
                  scale: isVisible ? 1 : 0.8,
                  height: isVisible ? 'auto' : 0,
                  marginBottom: isVisible ? 0 : -8,
                }}
                transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                style={{ overflow: 'hidden' }}
              >
                {item.key === 'photos' ? (
                  <PhotoPlaceholders />
                ) : (
                  <span
                    className="font-mohave"
                    style={{
                      fontSize: item.size,
                      fontWeight: item.weight,
                      color: item.color,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      display: 'block',
                    }}
                  >
                    {item.text}
                  </span>
                )}
              </motion.div>
            )
          })}
        </motion.div>

        {/* Project folder — scales down during build, back up after collapse */}
        <motion.div
          animate={{
            scale: folderSmall && !labelSettled ? 0.7 : 1,
            y: folderSmall && !labelSettled ? 80 : 0,
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 18 }}
        >
          <ProjectFolder
            color="#FFFFFF"
            isOpen={false}
            label={labelSettled ? 'OFFICE REMODEL' : undefined}
            subtitle={showSubtitle ? '3' : undefined}
          />
        </motion.div>
      </div>
    </div>
  )
}

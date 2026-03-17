'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { OPSStyle, fontStyle } from '@/lib/styles/OPSStyle'
import { TutorialCard } from '../components/TutorialCard'
import { TutorialStatusBadge } from '../components/TutorialStatusBadge'
import { TutorialCrewAvatar } from '../components/TutorialCrewAvatar'
import { PerimeterShimmer } from '../components/PerimeterShimmer'
import {
  TASK_CARDS,
  CREW_AVATARS,
  PROJECT_TITLE,
  STATUS_COLORS,
} from '../NarrativeTutorialData'
import { TIMING, EASE_OUT, prefersReducedMotion } from '../utils/animations'

interface CrewExecutesStepProps {
  onAdvance: () => void
}

type TaskStatus = 'booked' | 'inProgress' | 'complete'

const STATUS_MAP: Record<TaskStatus, { label: string; color: string }> = {
  booked: { label: 'BOOKED', color: STATUS_COLORS.inactive },
  inProgress: { label: 'IN PROGRESS', color: STATUS_COLORS.warning },
  complete: { label: 'COMPLETE', color: STATUS_COLORS.success },
}

/**
 * Step 4: "Crew Executes"
 *
 * Three task cards from Step 3 are arranged vertically. Each progresses
 * through BOOKED → IN PROGRESS → COMPLETE. Then all compress into a
 * single project card with a perimeter shimmer.
 *
 * What this sells: Your crew updates in real-time. No phone calls needed.
 */
export function CrewExecutesStep({ onAdvance }: CrewExecutesStepProps) {
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>(['booked', 'booked', 'booked'])
  const [showProjectCard, setShowProjectCard] = useState(false)
  const [shimmerTrigger, setShimmerTrigger] = useState(false)
  const [isAdvanceable, setIsAdvanceable] = useState(false)
  const reduced = typeof window !== 'undefined' && prefersReducedMotion()

  // Orchestrate the lifecycle progression
  useEffect(() => {
    if (reduced) {
      setTaskStatuses(['complete', 'complete', 'complete'])
      setShowProjectCard(true)
      setShimmerTrigger(true)
      setIsAdvanceable(true)
      return
    }

    const timers: ReturnType<typeof setTimeout>[] = []
    const schedule = (fn: () => void, delay: number) => {
      timers.push(setTimeout(fn, delay))
    }

    // Task 1 lifecycle
    schedule(() => setTaskStatuses(['inProgress', 'booked', 'booked']), 400)
    schedule(() => setTaskStatuses(['complete', 'booked', 'booked']), 1200)

    // Task 2 lifecycle
    schedule(() => setTaskStatuses(['complete', 'inProgress', 'booked']), 1800)
    schedule(() => setTaskStatuses(['complete', 'complete', 'booked']), 2600)

    // Task 3 lifecycle
    schedule(() => setTaskStatuses(['complete', 'complete', 'inProgress']), 3200)
    schedule(() => setTaskStatuses(['complete', 'complete', 'complete']), 4000)

    // All complete → compress into project card
    schedule(() => setShowProjectCard(true), 4800)
    schedule(() => setShimmerTrigger(true), 5200)
    schedule(() => setIsAdvanceable(true), 5600)

    return () => timers.forEach(clearTimeout)
  }, [reduced])

  // Auto-advance
  useEffect(() => {
    if (!isAdvanceable) return
    const timer = setTimeout(onAdvance, TIMING.autoAdvanceDelay)
    return () => clearTimeout(timer)
  }, [isAdvanceable, onAdvance])

  const handleClick = useCallback(() => {
    if (isAdvanceable || showProjectCard) onAdvance()
  }, [isAdvanceable, showProjectCard, onAdvance])

  const crewForTask = (crewName: string) =>
    CREW_AVATARS.find((c) => c.name === crewName) ?? CREW_AVATARS[0]

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[400px]"
      onClick={handleClick}
      style={{ cursor: isAdvanceable ? 'pointer' : 'default' }}
    >
      <AnimatePresence mode="wait">
        {!showProjectCard ? (
          /* Task cards progressing through lifecycle */
          <motion.div
            key="tasks"
            className="w-full max-w-sm flex flex-col gap-2.5"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20, transition: { duration: TIMING.fast } }}
          >
            {TASK_CARDS.map((task, i) => {
              const status = taskStatuses[i]
              const statusConfig = STATUS_MAP[status]
              const crew = crewForTask(task.crew)
              const isComplete = status === 'complete'

              return (
                <motion.div
                  key={task.id}
                  animate={{
                    opacity: isComplete ? 0.65 : 1,
                    scale: isComplete ? 0.98 : 1,
                  }}
                  transition={{ duration: TIMING.fast, ease: EASE_OUT }}
                >
                  <TutorialCard
                    borderColor={isComplete ? `${STATUS_COLORS.success}30` : OPSStyle.Colors.cardBorder}
                  >
                    <div className="flex items-center gap-3">
                      {/* Task type color stripe */}
                      <div
                        className="w-1 self-stretch rounded-sm flex-shrink-0"
                        style={{ backgroundColor: task.color }}
                      />

                      {/* Task info */}
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span style={{ ...fontStyle(OPSStyle.Typography.bodyBold), color: '#FFFFFF' }}>
                            {task.name}
                          </span>
                          {isComplete && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: TIMING.fast, ease: EASE_OUT }}
                            >
                              <Check size={14} color={STATUS_COLORS.success} strokeWidth={2.5} />
                            </motion.div>
                          )}
                        </div>
                        <TutorialStatusBadge text={statusConfig.label} color={statusConfig.color} />
                      </div>

                      {/* Crew avatar */}
                      <div className="flex items-center gap-1.5">
                        <TutorialCrewAvatar name={crew.name} tint={crew.tint} size={28} />
                        {/* Activity pulse during in-progress */}
                        {status === 'inProgress' && (
                          <motion.div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: STATUS_COLORS.warning }}
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        )}
                      </div>
                    </div>
                  </TutorialCard>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          /* Project card — assembled from the completed tasks */
          <motion.div
            key="project-card"
            className="w-full max-w-sm relative"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: TIMING.standard, ease: EASE_OUT }}
          >
            <TutorialCard borderColor={`${STATUS_COLORS.success}40`}>
              <PerimeterShimmer
                trigger={shimmerTrigger}
                borderRadius={OPSStyle.Layout.cardCornerRadius}
              />
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span
                    className="uppercase tracking-wide"
                    style={{
                      ...fontStyle(OPSStyle.Typography.cardTitle),
                      color: '#FFFFFF',
                    }}
                  >
                    {PROJECT_TITLE}
                  </span>
                  <TutorialStatusBadge text="COMPLETE" color={STATUS_COLORS.success} />
                </div>

                {/* Mini task summary */}
                <div className="flex gap-1.5 mt-1">
                  {TASK_CARDS.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-1 px-2 py-1 rounded-sm"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.color }} />
                      <span style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText }}>
                        {task.name.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </TutorialCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

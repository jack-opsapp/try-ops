'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { OPSStyle, fontStyle } from '@/lib/styles/OPSStyle'
import { TutorialCard } from '../components/TutorialCard'
import { TutorialStatusBadge } from '../components/TutorialStatusBadge'
import { TutorialCrewAvatar } from '../components/TutorialCrewAvatar'
import { PerimeterShimmer } from '../components/PerimeterShimmer'
import { TASK_CARDS, CREW_AVATARS, PROJECT_TITLE, STATUS_COLORS } from '../NarrativeTutorialData'
import { narrativeText, staggerParent, staggerChild, DURATION, EASE_ENTER } from '../utils/animations'

interface CrewExecutesStepProps {
  onAdvance: () => void
}

type TaskStatus = 'booked' | 'inProgress' | 'complete'

const STATUS_DISPLAY: Record<TaskStatus, { label: string; color: string }> = {
  booked: { label: 'BOOKED', color: STATUS_COLORS.inactive },
  inProgress: { label: 'IN PROGRESS', color: STATUS_COLORS.warning },
  complete: { label: 'COMPLETE', color: STATUS_COLORS.success },
}

/**
 * Step 4: "Crew Executes"
 *
 * Emotional beat: AMBIENT / TRANSITION
 * User feels: watching the machine work — quiet satisfaction
 * Animation must: show progress effortlessly, no user action needed
 *
 * Narrative: "Your crew works. You see everything."
 * Tasks progress through BOOKED → IN PROGRESS → COMPLETE.
 * Then they merge into a completed project card.
 */
export function CrewExecutesStep({ onAdvance }: CrewExecutesStepProps) {
  const [phase, setPhase] = useState<'narrative' | 'lifecycle' | 'projectCard' | 'sellLine'>('narrative')
  const [statuses, setStatuses] = useState<TaskStatus[]>(['booked', 'booked', 'booked'])
  const [shimmerFired, setShimmerFired] = useState(false)
  const [lifecycleStep, setLifecycleStep] = useState(0)

  const crewForTask = (name: string) => CREW_AVATARS.find((c) => c.name === name) ?? CREW_AVATARS[0]

  // Lifecycle progression — each step is triggered by onAnimationComplete or RAF
  const progressLifecycle = useCallback(() => {
    setLifecycleStep((step) => {
      const next = step + 1
      // Sequence: 0=initial, 1=task1-progress, 2=task1-complete, 3=task2-progress, etc.
      const sequence: TaskStatus[][] = [
        ['booked', 'booked', 'booked'],
        ['inProgress', 'booked', 'booked'],
        ['complete', 'booked', 'booked'],
        ['complete', 'inProgress', 'booked'],
        ['complete', 'complete', 'booked'],
        ['complete', 'complete', 'inProgress'],
        ['complete', 'complete', 'complete'],
      ]

      if (next < sequence.length) {
        setStatuses(sequence[next])
        requestAnimationFrame(() => setTimeout(progressLifecycle, 700))
      } else {
        // All complete → show project card
        requestAnimationFrame(() => setTimeout(() => setPhase('projectCard'), 800))
      }
      return next
    })
  }, [])

  const handleClick = useCallback(() => {
    if (phase === 'projectCard' || phase === 'sellLine') onAdvance()
  }, [phase, onAdvance])

  return (
    <div
      className="flex flex-col gap-6 min-h-[420px] justify-center"
      onClick={handleClick}
      style={{ cursor: phase === 'projectCard' || phase === 'sellLine' ? 'pointer' : 'default' }}
    >
      <AnimatePresence mode="wait">

        {/* ─── Narrative ─── */}
        {phase === 'narrative' && (
          <motion.div
            key="narrative"
            className="flex flex-col gap-2"
            variants={narrativeText}
            initial="hidden"
            animate="visible"
            exit="exit"
            onAnimationComplete={() => {
              requestAnimationFrame(() => setTimeout(() => {
                setPhase('lifecycle')
                requestAnimationFrame(() => setTimeout(progressLifecycle, 600))
              }, 1200))
            }}
          >
            <span className="uppercase tracking-widest" style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText, letterSpacing: '0.2em' }}>
              STEP 4
            </span>
            <span className="uppercase tracking-wide" style={{ ...fontStyle(OPSStyle.Typography.title), color: '#FFFFFF' }}>
              Your crew works. You see everything.
            </span>
            <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText, lineHeight: 1.5 }}>
              Real-time status updates from the field. No phone calls needed.
            </span>
          </motion.div>
        )}

        {/* ─── Task lifecycle ─── */}
        {phase === 'lifecycle' && (
          <motion.div
            key="lifecycle"
            className="flex flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: DURATION.fast } }}
          >
            <span className="uppercase tracking-widest" style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText, letterSpacing: '0.15em' }}>
              FIELD UPDATES
            </span>

            <motion.div className="flex flex-col gap-2.5" variants={staggerParent} initial="hidden" animate="visible">
              {TASK_CARDS.map((task, i) => {
                const status = statuses[i]
                const display = STATUS_DISPLAY[status]
                const crew = crewForTask(task.crew)
                const isComplete = status === 'complete'

                return (
                  <motion.div
                    key={task.id}
                    variants={staggerChild}
                    animate={{ opacity: isComplete ? 0.6 : 1 }}
                    transition={{ duration: DURATION.fast }}
                  >
                    <TutorialCard borderColor={isComplete ? `${STATUS_COLORS.success}25` : OPSStyle.Colors.cardBorder}>
                      <div className="flex items-center gap-3">
                        <div className="w-1 self-stretch rounded-sm flex-shrink-0" style={{ backgroundColor: task.color }} />
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span style={{ ...fontStyle(OPSStyle.Typography.bodyBold), color: '#FFFFFF' }}>{task.name}</span>
                            {isComplete && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: DURATION.fast, ease: EASE_ENTER }}
                              >
                                <Check size={14} color={STATUS_COLORS.success} strokeWidth={2.5} />
                              </motion.div>
                            )}
                          </div>
                          <TutorialStatusBadge text={display.label} color={display.color} />
                        </div>
                        <TutorialCrewAvatar name={crew.name} tint={crew.tint} size={28} />
                      </div>
                    </TutorialCard>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        )}

        {/* ─── Project card — assembled from completed tasks ─── */}
        {phase === 'projectCard' && (
          <motion.div
            key="project"
            className="flex flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onAnimationComplete={() => {
              setShimmerFired(true)
              requestAnimationFrame(() => setTimeout(() => setPhase('sellLine'), 2500))
            }}
          >
            <span className="uppercase tracking-widest" style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText, letterSpacing: '0.15em' }}>
              PROJECT COMPLETE
            </span>

            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: DURATION.normal, ease: EASE_ENTER }}
            >
              <TutorialCard borderColor={`${STATUS_COLORS.success}40`}>
                <PerimeterShimmer trigger={shimmerFired} borderRadius={OPSStyle.Layout.cardCornerRadius} />
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="uppercase tracking-wide" style={{ ...fontStyle(OPSStyle.Typography.cardTitle), color: '#FFFFFF' }}>
                      {PROJECT_TITLE}
                    </span>
                    <TutorialStatusBadge text="COMPLETE" color={STATUS_COLORS.success} />
                  </div>
                  {/* Mini task summary */}
                  <div className="flex gap-1.5">
                    {TASK_CARDS.map((task) => (
                      <div key={task.id} className="flex items-center gap-1 px-2 py-1 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
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

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: DURATION.slow }}
              className="uppercase tracking-widest"
              style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText }}
            >
              TAP ANYWHERE TO CONTINUE
            </motion.span>
          </motion.div>
        )}

        {/* ─── Sell line ─── */}
        {phase === 'sellLine' && (
          <motion.div
            key="sellLine"
            className="flex flex-col gap-2"
            variants={narrativeText}
            initial="hidden"
            animate="visible"
            onAnimationComplete={() => {
              requestAnimationFrame(() => setTimeout(() => onAdvance(), 1500))
            }}
          >
            <span className="uppercase tracking-wide" style={{ ...fontStyle(OPSStyle.Typography.subtitle), color: OPSStyle.Colors.primaryAccent, letterSpacing: '0.08em' }}>
              Visibility without micromanaging.
            </span>
            <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText }}>
              Every task tracked. Every update real-time. Zero phone calls.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

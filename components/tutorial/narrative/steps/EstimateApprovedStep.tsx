'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { OPSStyle, fontStyle } from '@/lib/styles/OPSStyle'
import { TutorialCard } from '../components/TutorialCard'
import { TutorialStatusBadge } from '../components/TutorialStatusBadge'
import { TutorialCrewAvatar } from '../components/TutorialCrewAvatar'
import {
  CLIENT_NAME,
  PROJECT_TITLE,
  LABOR_ITEMS,
  TASK_CARDS,
  CREW_AVATARS,
  STATUS_COLORS,
  formatCurrency,
} from '../NarrativeTutorialData'
import {
  cardEnterFromTop,
  staggerContainer,
  staggerItem,
  fadeIn,
  TIMING,
  EASE_OUT,
  prefersReducedMotion,
} from '../utils/animations'

interface EstimateApprovedStepProps {
  onAdvance: () => void
}

/**
 * Animation phases for the timed state machine.
 * This is the most complex step — the "holy shit" moment.
 *
 * The estimate's labor items peel off and become task cards.
 * Crew avatars dock onto each card. The work organizes itself.
 * Zero duplicate entry. That's the sell.
 */
type AnimPhase =
  | 'notification'    // Approval notification drops from top
  | 'ghostEstimate'   // Ghost outline of estimate appears
  | 'transforming'    // Labor items become task cards, material fades
  | 'crewDocking'     // Crew avatars slide onto task cards
  | 'settled'         // Cards in final vertical stack
  | 'advanceable'     // Ready for auto-advance or click

export function EstimateApprovedStep({ onAdvance }: EstimateApprovedStepProps) {
  const [phase, setPhase] = useState<AnimPhase>('notification')
  const reduced = typeof window !== 'undefined' && prefersReducedMotion()

  // Timed sequence — each phase triggers the next
  useEffect(() => {
    if (reduced) {
      // Skip animation, show final state
      setPhase('advanceable')
      return
    }

    const timers: ReturnType<typeof setTimeout>[] = []

    const schedule = (fn: () => void, delay: number) => {
      timers.push(setTimeout(fn, delay))
    }

    schedule(() => setPhase('ghostEstimate'), 1500)
    schedule(() => setPhase('transforming'), 2800)
    schedule(() => setPhase('crewDocking'), 4200)
    schedule(() => setPhase('settled'), 5500)
    schedule(() => setPhase('advanceable'), 6500)

    return () => timers.forEach(clearTimeout)
  }, [reduced])

  // Auto-advance after delay, or click fallback
  useEffect(() => {
    if (phase !== 'advanceable') return
    const timer = setTimeout(onAdvance, TIMING.autoAdvanceDelay)
    return () => clearTimeout(timer)
  }, [phase, onAdvance])

  const handleClick = useCallback(() => {
    if (phase === 'settled' || phase === 'advanceable') {
      onAdvance()
    }
  }, [phase, onAdvance])

  const showNotification = phase === 'notification' || phase === 'ghostEstimate'
  const showGhost = phase === 'ghostEstimate' || phase === 'transforming'
  const showTaskCards = phase === 'transforming' || phase === 'crewDocking' || phase === 'settled' || phase === 'advanceable'
  const showCrewAvatars = phase === 'crewDocking' || phase === 'settled' || phase === 'advanceable'
  const isClickable = phase === 'settled' || phase === 'advanceable'

  // Map crew names to avatar data
  const crewForTask = (crewName: string) =>
    CREW_AVATARS.find((c) => c.name === crewName) ?? CREW_AVATARS[0]

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[400px] gap-6"
      onClick={handleClick}
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
    >
      {/* Approval notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            key="notification"
            className="w-full max-w-sm"
            variants={cardEnterFromTop}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <TutorialCard borderColor={`${STATUS_COLORS.success}40`}>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${STATUS_COLORS.success}26` }}
                >
                  <Check size={16} color={STATUS_COLORS.success} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <TutorialStatusBadge text="ESTIMATE APPROVED" color={STATUS_COLORS.success} />
                  <span
                    style={{
                      ...fontStyle(OPSStyle.Typography.caption),
                      color: OPSStyle.Colors.secondaryText,
                    }}
                  >
                    {CLIENT_NAME} approved your estimate
                  </span>
                </div>
              </div>
            </TutorialCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ghost estimate — outline form, low opacity */}
      <AnimatePresence>
        {showGhost && (
          <motion.div
            key="ghost-estimate"
            className="w-full max-w-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 0.3, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: TIMING.standard, ease: EASE_OUT }}
          >
            <div
              className="p-4 rounded-lg"
              style={{
                border: `1px dashed ${OPSStyle.Colors.cardBorder}`,
                backgroundColor: 'transparent',
              }}
            >
              <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.tertiaryText }}>
                {PROJECT_TITLE} — {formatCurrency(12_000)}
              </span>
              <div className="flex flex-col gap-1.5 mt-2">
                {LABOR_ITEMS.map((item) => (
                  <div key={item.id} className="h-6 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
                ))}
                {/* Material line — will fade */}
                <div className="h-6 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task cards — emerge from the estimate */}
      <AnimatePresence>
        {showTaskCards && (
          <motion.div
            key="task-cards"
            className="w-full max-w-sm flex flex-col gap-2.5"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {TASK_CARDS.map((task) => {
              const crew = crewForTask(task.crew)
              return (
                <motion.div key={task.id} variants={staggerItem}>
                  <TutorialCard>
                    <div className="flex items-center gap-3">
                      {/* Task type color stripe */}
                      <div
                        className="w-1 self-stretch rounded-sm flex-shrink-0"
                        style={{ backgroundColor: task.color }}
                      />

                      {/* Task info */}
                      <div className="flex-1 flex flex-col gap-0.5">
                        <span style={{ ...fontStyle(OPSStyle.Typography.bodyBold), color: '#FFFFFF' }}>
                          {task.name}
                        </span>
                        <span style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.secondaryText }}>
                          {PROJECT_TITLE}
                        </span>
                      </div>

                      {/* Crew avatar — slides in from right */}
                      <AnimatePresence>
                        {showCrewAvatars && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: TIMING.standard, ease: EASE_OUT }}
                            className="flex items-center gap-1.5"
                          >
                            <TutorialCrewAvatar name={crew.name} tint={crew.tint} size={28} />
                            <span
                              style={{
                                ...fontStyle(OPSStyle.Typography.smallCaption),
                                color: OPSStyle.Colors.tertiaryText,
                              }}
                            >
                              {task.crew}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </TutorialCard>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

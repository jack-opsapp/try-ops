'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { OPSStyle, fontStyle } from '@/lib/styles/OPSStyle'
import { TutorialCard } from '../components/TutorialCard'
import { TutorialStatusBadge } from '../components/TutorialStatusBadge'
import { TutorialCrewAvatar } from '../components/TutorialCrewAvatar'
import {
  CLIENT_NAME,
  PROJECT_TITLE,
  TASK_CARDS,
  CREW_AVATARS,
  STATUS_COLORS,
} from '../NarrativeTutorialData'
import {
  enterFromTop,
  narrativeText,
  staggerParent,
  staggerChild,
  fade,
  DURATION,
  EASE_ENTER,
} from '../utils/animations'

interface EstimateApprovedStepProps {
  onAdvance: () => void
}

/**
 * Step 3: "Won — Tasks Auto-Generate"
 *
 * Emotional beat: ACHIEVEMENT
 * User feels: surprised delight — "wait, it did that automatically?"
 * Animation must: show the magical moment where an approved estimate
 * becomes organized work. This is the "holy shit" moment.
 *
 * Narrative: "Approved. Tasks created. Zero re-entry."
 * The user needs to UNDERSTAND what just happened — that they never
 * have to re-type a single thing.
 */
export function EstimateApprovedStep({ onAdvance }: EstimateApprovedStepProps) {
  const [phase, setPhase] = useState<'narrative' | 'notification' | 'tasks' | 'sellLine'>('narrative')

  const crewForTask = (crewName: string) =>
    CREW_AVATARS.find((c) => c.name === crewName) ?? CREW_AVATARS[0]

  const handleClick = useCallback(() => {
    if (phase === 'tasks' || phase === 'sellLine') onAdvance()
  }, [phase, onAdvance])

  return (
    <div
      className="flex flex-col gap-6 min-h-[420px] justify-center"
      onClick={handleClick}
      style={{ cursor: phase === 'tasks' || phase === 'sellLine' ? 'pointer' : 'default' }}
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
              requestAnimationFrame(() => setTimeout(() => setPhase('notification'), 1200))
            }}
          >
            <span className="uppercase tracking-widest" style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText, letterSpacing: '0.2em' }}>
              STEP 3
            </span>
            <span className="uppercase tracking-wide" style={{ ...fontStyle(OPSStyle.Typography.title), color: '#FFFFFF' }}>
              Client approves. Work organizes itself.
            </span>
            <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText, lineHeight: 1.5 }}>
              The estimate gets approved — and every task, crew assignment, and schedule entry creates itself. You never re-enter anything.
            </span>
          </motion.div>
        )}

        {/* ─── Approval notification ─── */}
        {phase === 'notification' && (
          <motion.div
            key="notification"
            className="flex flex-col gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Approval card */}
            <motion.div
              variants={enterFromTop}
              initial="hidden"
              animate="visible"
              onAnimationComplete={() => {
                // After notification lands, show the task cards
                requestAnimationFrame(() => setTimeout(() => setPhase('tasks'), 1800))
              }}
            >
              <TutorialCard borderColor={`${STATUS_COLORS.success}40`}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${STATUS_COLORS.success}26` }}
                  >
                    <Check size={16} color={STATUS_COLORS.success} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <TutorialStatusBadge text="ESTIMATE APPROVED" color={STATUS_COLORS.success} />
                    <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText }}>
                      {CLIENT_NAME} approved your estimate for {PROJECT_TITLE}
                    </span>
                  </div>
                </div>
              </TutorialCard>
            </motion.div>

            {/* "Generating tasks..." indicator */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: DURATION.slow }}
              className="uppercase tracking-widest"
              style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText, letterSpacing: '0.15em' }}
            >
              GENERATING TASKS...
            </motion.span>
          </motion.div>
        )}

        {/* ─── Task cards — the "holy shit" reveal ─── */}
        {phase === 'tasks' && (
          <motion.div
            key="tasks"
            className="flex flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onAnimationComplete={() => {
              // Auto-advance after user has time to absorb
              requestAnimationFrame(() => setTimeout(() => setPhase('sellLine'), 3000))
            }}
          >
            {/* Context label — drives the "zero re-entry" message home */}
            <div className="flex items-center justify-between">
              <span className="uppercase tracking-widest" style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText, letterSpacing: '0.15em' }}>
                AUTO-GENERATED TASKS
              </span>
              <span style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: STATUS_COLORS.success }}>
                FROM YOUR ESTIMATE
              </span>
            </div>

            {/* Task cards stagger in — each one an individual work item */}
            <motion.div
              className="flex flex-col gap-2.5"
              variants={staggerParent}
              initial="hidden"
              animate="visible"
            >
              {TASK_CARDS.map((task) => {
                const crew = crewForTask(task.crew)
                return (
                  <motion.div key={task.id} variants={staggerChild}>
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
                        {/* Crew assignment */}
                        <motion.div
                          className="flex items-center gap-1.5"
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4, duration: DURATION.normal, ease: EASE_ENTER }}
                        >
                          <TutorialCrewAvatar name={crew.name} tint={crew.tint} size={28} />
                          <span style={{ ...fontStyle(OPSStyle.Typography.smallCaption), color: OPSStyle.Colors.tertiaryText }}>
                            {task.crew}
                          </span>
                        </motion.div>
                      </div>
                    </TutorialCard>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Click hint */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: DURATION.slow }}
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
              Zero duplicate entry.
            </span>
            <span style={{ ...fontStyle(OPSStyle.Typography.caption), color: OPSStyle.Colors.secondaryText }}>
              Estimate approved → tasks created → crew assigned. Automatically.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

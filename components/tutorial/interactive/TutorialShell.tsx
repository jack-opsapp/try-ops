'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { useTutorial } from '@/lib/tutorial/TutorialContext'
import {
  isProjectFormPhase,
  isTaskFormPhase,
  isCalendarPhase,
  isBlockingOverlayPhase,
  isFABVisiblePhase,
  isJobBoardAnimationPhase,
} from '@/lib/tutorial/TutorialPhase'
import type { DemoProject } from '@/lib/constants/demo-data'
import { DEMO_TASK_TYPES, DEMO_PROJECTS } from '@/lib/constants/demo-data'

import { MockJobBoard, ClosedProjectsSheet } from './MockJobBoard'
import { MockCalendar } from './MockCalendar'
import { MockFAB } from './MockFAB'
import { MockProjectForm } from './MockProjectForm'
import { MockTaskForm } from './MockTaskForm'
import { MockTabBar } from './MockTabBar'
import { CollapsibleTooltip } from './CollapsibleTooltip'

interface TutorialShellProps {
  onComplete: (elapsedSeconds: number, stepDurations: string[]) => void
}

export function TutorialShell({ onComplete }: TutorialShellProps) {
  const tutorial = useTutorial()
  const {
    phase,
    phaseConfig,
    advance,
    goBack,
    selectedClient,
    projectName,
    selectedTaskType,
    selectedCrew,
    selectedDate,
    setSelectedClient,
    setProjectName,
    setSelectedTaskType,
    setSelectedCrew,
    setSelectedDate,
    elapsedSeconds,
    phaseIndex,
    stepDurations,
  } = tutorial

  // Task form close animation state
  const [taskFormClosing, setTaskFormClosing] = useState(false)
  const prevPhaseRef = useRef(phase)

  // Drag animation state — starts when user taps continue during dragToAccepted
  const [dragAnimStarted, setDragAnimStarted] = useState(false)
  const [dragAnimLanded, setDragAnimLanded] = useState(false) // animation finished, waiting for user tap

  // Step 14: closed projects sheet state
  const [closedSheetOpen, setClosedSheetOpen] = useState(false)
  const [closedSheetReady, setClosedSheetReady] = useState(false)

  useEffect(() => {
    // When transitioning from taskFormDone to projectFormComplete, trigger close animation
    if (prevPhaseRef.current === 'taskFormDone' && phase === 'projectFormComplete') {
      setTaskFormClosing(true)
      const timer = setTimeout(() => setTaskFormClosing(false), 400) // match animation duration
      return () => clearTimeout(timer)
    }
    // Reset transient states on phase change
    if (phase !== 'dragToAccepted') setDragAnimLanded(false)
    if (phase !== 'closedProjectsScroll') {
      setClosedSheetOpen(false)
      setClosedSheetReady(false)
    }
    prevPhaseRef.current = phase
  }, [phase])

  // Build the user's project from selections
  const userProject: DemoProject | null = useMemo(() => {
    if (!selectedClient && !projectName) return null
    return {
      id: 'user-project',
      name: projectName || 'New Project',
      clientName: selectedClient || 'Client',
      status: 'estimated' as const,
      taskType: selectedTaskType || 'General',
      taskTypeColor: '#417394',
      crew: selectedCrew || undefined,
    }
  }, [selectedClient, projectName, selectedTaskType, selectedCrew])

  // Determine visibility of each layer
  const showJobBoard = !isCalendarPhase(phase) && phase !== 'completed'
  const showCalendar = isCalendarPhase(phase)
  const showBlockingOverlay = isBlockingOverlayPhase(phase)
  const showFAB = isFABVisiblePhase(phase)
  const showProjectForm = isProjectFormPhase(phase)
  const showTaskForm = isTaskFormPhase(phase)
  const hasTask = !!selectedTaskType && !!selectedCrew && !!selectedDate

  // Build the added task object for project form display
  const addedTask = hasTask ? {
    type: selectedTaskType!,
    typeColor: DEMO_TASK_TYPES.find(t => t.name === selectedTaskType)?.color || '#417394',
    crew: selectedCrew!,
    date: selectedDate!,
  } : null

  // Build closed projects list for the sheet
  const closedProjects = useMemo(() => {
    const projects: DemoProject[] = []
    if (userProject) {
      projects.push({ ...userProject, status: 'closed' as const })
    }
    DEMO_PROJECTS.forEach(p => {
      if (p.status === 'completed' || p.status === 'closed') {
        projects.push(p)
      }
    })
    return projects
  }, [userProject])

  const showCompleted = phase === 'completed'

  // Active tab for tab bar
  const activeTab = isCalendarPhase(phase) ? 'schedule' as const : 'jobs' as const

  // Dim content behind forms
  const contentDimmed = showProjectForm || showTaskForm

  // Handle phase completion
  if (showCompleted) {
    onComplete(elapsedSeconds, stepDurations)
    return null
  }

  // --- Interaction handlers ---

  const handleFABTap = () => {
    // jobBoardIntro -> fabTap
    advance()
  }

  const handleCreateProject = () => {
    // fabTap -> projectFormClient
    advance()
  }

  const handleSelectClient = (name: string) => {
    setSelectedClient(name)
    // projectFormClient -> projectFormName
    setTimeout(() => advance(), 300)
  }

  const handleProjectNameChange = (name: string) => {
    setProjectName(name)
  }

  const handleAddTask = () => {
    // projectFormAddTask -> taskFormType
    advance()
  }

  const handleCreate = () => {
    // projectFormComplete -> dragToAccepted
    advance()
  }

  const handleSelectType = (type: string) => {
    setSelectedTaskType(type)
    setTimeout(() => advance(), 300)
  }

  const handleSelectCrew = (crew: string) => {
    setSelectedCrew(crew)
    setTimeout(() => advance(), 300)
  }

  const handleSelectDate = (date: string) => {
    setSelectedDate(date)
    setTimeout(() => advance(), 300)
  }

  const handleTaskDone = () => {
    // taskFormDone -> projectFormComplete
    advance()
  }

  const handleSwipeComplete = () => {
    // projectListSwipe -> closedProjectsScroll
    advance()
  }

  const handleMonthTap = () => {
    // calendarMonthPrompt -> calendarMonth
    advance()
  }

  const handleContinue = () => {
    if (phase === 'dragToAccepted' && !dragAnimLanded) {
      // First tap: start drag animation
      setDragAnimStarted(true)
      return
    }
    if (phase === 'dragToAccepted' && dragAnimLanded) {
      // Second tap: advance after user has seen the landed state
      setDragAnimStarted(false)
      setDragAnimLanded(false)
      advance()
      return
    }
    advance()
  }

  const handleDragAnimationDone = () => {
    // Animation landed — show continue button, wait for user tap to advance
    // Keep dragAnimStarted=true so DashboardView effect doesn't reset dragAnimPhase to 'idle'
    setDragAnimLanded(true)
  }


  // Whether continue button is the primary action (user just taps continue to advance)
  const isContinuePhase =
    (phaseConfig.showContinueButton && !dragAnimStarted) ||
    dragAnimLanded ||
    closedSheetReady

  const continueLabel = dragAnimLanded ? 'CONTINUE' : phaseConfig.continueLabel || 'CONTINUE'

  // Progress fraction (exclude 'completed' from total)
  const totalPhases = tutorial.totalPhases
  const progressFraction = totalPhases > 0 ? phaseIndex / totalPhases : 0

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-ops-background"
      style={{ touchAction: 'none' }}
    >
      {/* Layer 1: Mock app content (z-0) */}
      <div
        className="absolute inset-0 flex flex-col transition-opacity duration-300"
        style={{ zIndex: 0, opacity: contentDimmed ? 0.3 : 1 }}
      >
        {/* Content fills space above tab bar — must be flex so children's flex-1 constrains height */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {showJobBoard && (
            <MockJobBoard
              phase={phase}
              userProject={
                phase === 'dragToAccepted' ||
                phase === 'projectListStatusDemo' ||
                phase === 'projectListSwipe' ||
                phase === 'closedProjectsScroll'
                  ? userProject
                  : null
              }
              onSwipeComplete={handleSwipeComplete}
              onClosedSectionViewed={() => {
                setClosedSheetOpen(true)
                setTimeout(() => setClosedSheetReady(true), 500)
              }}
              startDragAnimation={dragAnimStarted}
              onDragAnimationDone={handleDragAnimationDone}
            />
          )}

          {showCalendar && (
            <MockCalendar
              phase={phase}
              viewMode={phase === 'calendarMonth' ? 'month' : 'week'}
              onToggleMonth={handleMonthTap}
              userProject={
                userProject
                  ? {
                      name: userProject.name,
                      clientName: userProject.clientName,
                      taskType: userProject.taskType,
                      taskTypeColor: userProject.taskTypeColor,
                      date: selectedDate || 'Today',
                    }
                  : undefined
              }
            />
          )}

        </div>
      </div>

      {/* Layer 2: Tab bar (z-10) - always visible at bottom */}
      <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 10 }}>
        <MockTabBar activeTab={activeTab} />
      </div>

      {/* Layer 3: Blocking overlay (z-20) - only during jobBoardIntro */}
      {showBlockingOverlay && (
        <div
          className="absolute inset-0 bg-black/60 transition-opacity duration-300"
          style={{ zIndex: 20 }}
        />
      )}

      {/* Layer 4: FAB (z-30, above blocking overlay) */}
      {showFAB && (
        <div style={{ zIndex: 30 }}>
          <MockFAB
            phase={phase}
            onFABTap={handleFABTap}
            onCreateProject={handleCreateProject}
          />
        </div>
      )}

      {/* Layer 5: Form sheets (z-40) - slide up from bottom */}
      {showProjectForm && (
        <div
          className="absolute inset-0"
          style={{ zIndex: 40 }}
        >
          <MockProjectForm
            phase={phase}
            isVisible
            selectedClient={selectedClient}
            projectName={projectName}
            addedTask={addedTask}
            onSelectClient={handleSelectClient}
            onChangeProjectName={handleProjectNameChange}
            onAddTask={handleAddTask}
            onCreate={handleCreate}
          />
        </div>
      )}

      {(showTaskForm || taskFormClosing) && (
        <div
          className="absolute inset-0"
          style={{
            zIndex: 45,
            opacity: taskFormClosing ? 0 : 1,
            transform: taskFormClosing ? 'translateY(100%)' : 'translateY(0)',
            transition: taskFormClosing ? 'opacity 0.35s ease-in, transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)' : 'none',
          }}
        >
          <MockTaskForm
            phase={taskFormClosing ? 'taskFormDone' : phase}
            visible
            selectedType={selectedTaskType}
            selectedCrew={selectedCrew}
            selectedDate={selectedDate}
            onSelectType={handleSelectType}
            onSelectCrew={handleSelectCrew}
            onSelectDate={handleSelectDate}
            onDone={handleTaskDone}
          />
        </div>
      )}

      {/* Layer 5b: Closed Projects Sheet (z-40) — auto-opens after scroll during closedProjectsScroll */}
      {closedSheetOpen && (
        <div className="absolute inset-0" style={{ zIndex: 40 }}>
          <ClosedProjectsSheet
            projects={closedProjects}
            userProjectId={userProject?.id}
          />
        </div>
      )}

      {/* Layer 6: Tooltip (z-50, always on top of content) */}
      <div
        className="absolute left-0 right-0"
        style={{ zIndex: 50, top: phaseConfig.tooltipTop || '0' }}
      >
        <CollapsibleTooltip
          text={phaseConfig.tooltipText}
          description={phaseConfig.tooltipDescription}
          phase={phase}
        />
      </div>

      {/* Layer 6b: Progress bar (z-55) */}
      <div className="absolute top-0 left-0 right-0" style={{ zIndex: 55 }}>
        <div className="h-[3px] bg-white/10">
          <div
            className="h-full bg-[#417394] transition-all duration-500 ease-out"
            style={{ width: `${progressFraction * 100}%` }}
          />
        </div>
      </div>

      {/* Layer 7: Bottom action bar (z-60) */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center gap-3 px-4 pb-4"
        style={{ zIndex: 60 }}
      >
        {isContinuePhase ? (
          /* Continue/Done phase — single wide button, centered, accent-tinted material */
          <button
            onClick={handleContinue}
            className="ultra-thin-material mx-auto flex items-center justify-center gap-2 font-mohave font-medium text-[16px] tracking-wide
                       transition-colors duration-150"
            style={{
              width: '70%',
              paddingTop: 14,
              paddingBottom: 14,
              borderRadius: 5,
              backgroundColor: 'rgba(65, 115, 148, 0.35)',
              border: '1px solid rgba(65, 115, 148, 0.5)',
              color: '#FFFFFF',
            }}
          >
            <span>{continueLabel}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          /* Action phase — back + disabled continue + skip */
          <>
            {/* Back button */}
            <button
              onClick={() => {
                setDragAnimStarted(false)
                setDragAnimLanded(false)
                setClosedSheetOpen(false)
                setClosedSheetReady(false)
                goBack()
              }}
              disabled={phaseIndex <= 0}
              className="ultra-thin-material font-mohave font-medium text-[14px] uppercase tracking-wider transition-colors duration-150"
              style={{
                flex: 3,
                paddingTop: 14,
                paddingBottom: 14,
                borderRadius: 5,
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: phaseIndex > 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)',
                cursor: phaseIndex > 0 ? 'pointer' : 'default',
              }}
            >
              BACK
            </button>

            {/* Continue button — greyed out / disabled */}
            <button
              disabled
              className="ultra-thin-material font-mohave font-medium text-[16px] tracking-wide"
              style={{
                flex: 4,
                paddingTop: 14,
                paddingBottom: 14,
                borderRadius: 5,
                border: '1px solid rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.2)',
                cursor: 'default',
              }}
            >
              CONTINUE
            </button>

            {/* Skip step button */}
            <button
              onClick={() => advance()}
              className="ultra-thin-material font-mohave font-medium text-[14px] uppercase tracking-wider transition-colors duration-150"
              style={{
                flex: 3,
                paddingTop: 14,
                paddingBottom: 14,
                borderRadius: 5,
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              SKIP
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// Phase enum matching iOS TutorialPhase for Company Creator flow

export type TutorialPhase =
  | 'jobBoardIntro'
  | 'fabTap'
  | 'projectFormClient'
  | 'projectFormName'
  | 'projectFormAddTask'
  | 'taskFormType'
  | 'taskFormCrew'
  | 'taskFormDate'
  | 'taskFormDone'
  | 'projectFormComplete'
  | 'dragToAccepted'
  | 'projectListStatusDemo'
  | 'projectListSwipe'
  | 'closedProjectsScroll'
  | 'calendarWeek'
  | 'calendarMonthPrompt'
  | 'calendarMonth'
  | 'completed'

export interface PhaseConfig {
  tooltipText: string
  tooltipDescription: string
  showContinueButton: boolean
  continueLabel?: string
  autoAdvanceMs?: number // auto-advance after N ms
  tooltipTop?: string // CSS top value, default '0' (top of screen)
}

export const PHASE_ORDER: TutorialPhase[] = [
  'jobBoardIntro',
  'fabTap',
  'projectFormClient',
  'projectFormName',
  'projectFormAddTask',
  'taskFormType',
  'taskFormCrew',
  'taskFormDate',
  'taskFormDone',
  'projectFormComplete',
  'dragToAccepted',
  'projectListStatusDemo',
  'projectListSwipe',
  'closedProjectsScroll',
  'calendarWeek',
  'calendarMonthPrompt',
  'calendarMonth',
  'completed',
]

export const PHASE_CONFIGS: Record<TutorialPhase, PhaseConfig> = {
  jobBoardIntro: {
    tooltipText: 'TAP THE + BUTTON',
    tooltipDescription: 'This is how you create projects, tasks, clients, and more.',
    showContinueButton: false,
    tooltipTop: '55%',

  },
  fabTap: {
    tooltipText: 'TAP "CREATE PROJECT"',
    tooltipDescription: 'Every job starts here.',
    showContinueButton: false,
    tooltipTop: '25%',

  },
  projectFormClient: {
    tooltipText: 'SELECT A CLIENT',
    tooltipDescription: 'Sample clients for practice. Pick any one.',
    showContinueButton: false,
  },
  projectFormName: {
    tooltipText: 'PROJECT NAME',
    tooltipDescription: 'In the real app, you\'d type this yourself.',
    showContinueButton: true,
    continueLabel: 'CONTINUE',
  },
  projectFormAddTask: {
    tooltipText: 'ADD A TASK',
    tooltipDescription: 'Tasks are the work itself—Installation, Painting, Pressure Wash.',
    showContinueButton: false,
  },
  taskFormType: {
    tooltipText: 'SELECT A TASK TYPE',
    tooltipDescription: 'Types keep your work organized. Pick any one.',
    showContinueButton: false,
  },
  taskFormCrew: {
    tooltipText: 'ASSIGN CREW',
    tooltipDescription: 'Sample crew for practice. In real use, they get notified instantly.',
    showContinueButton: false,
  },
  taskFormDate: {
    tooltipText: 'SET THE DATES',
    tooltipDescription: 'Tap once for start, again for end. Same day for quick jobs, or span weeks for longer work.',
    showContinueButton: false,
  },
  taskFormDone: {
    tooltipText: 'TAP "DONE"',
    tooltipDescription: 'Task saved.',
    showContinueButton: false,
  },
  projectFormComplete: {
    tooltipText: 'TAP "CREATE"',
    tooltipDescription: 'Project saved to your job board.',
    showContinueButton: false,
  },
  dragToAccepted: {
    tooltipText: 'PROJECT POSTED',
    tooltipDescription: 'Client accepts the estimate—drag it to Accepted. Watch it move.',
    showContinueButton: true,
    continueLabel: 'CONTINUE',

  },
  projectListStatusDemo: {
    tooltipText: 'STATUS UPDATES AUTOMATICALLY',
    tooltipDescription: 'Your crew starts work, completes tasks—you see it here in real time.',
    showContinueButton: false,
    autoAdvanceMs: 6000,
  },
  projectListSwipe: {
    tooltipText: 'SWIPE TO CLOSE',
    tooltipDescription: 'Swipe right to advance, left to go back. This closes the job—paid and filed.',
    showContinueButton: false,

  },
  closedProjectsScroll: {
    tooltipText: 'JOB CLOSED',
    tooltipDescription: 'Closed jobs drop to the bottom. Active work stays on top.',
    showContinueButton: false,
  },
  calendarWeek: {
    tooltipText: 'YOUR WEEK',
    tooltipDescription: 'Scheduled tasks by day. Swipe to see other weeks.',
    showContinueButton: true,
    continueLabel: 'CONTINUE',
  },
  calendarMonthPrompt: {
    tooltipText: 'TAP "MONTH"',
    tooltipDescription: 'See the bigger picture.',
    showContinueButton: false,

  },
  calendarMonth: {
    tooltipText: 'TAP EXPAND',
    tooltipDescription: 'In the app, pinch to expand rows—like your phone\'s calendar. This button does the same thing.',
    showContinueButton: true,
    continueLabel: 'DONE',

  },
  completed: {
    tooltipText: '',
    tooltipDescription: '',
    showContinueButton: false,
  },
}

// Helper to get next phase
export function getNextPhase(current: TutorialPhase): TutorialPhase | null {
  const idx = PHASE_ORDER.indexOf(current)
  if (idx === -1 || idx >= PHASE_ORDER.length - 1) return null
  return PHASE_ORDER[idx + 1]
}

// Which phases show the project form
export function isProjectFormPhase(phase: TutorialPhase): boolean {
  return [
    'projectFormClient',
    'projectFormName',
    'projectFormAddTask',
    'taskFormType',
    'taskFormCrew',
    'taskFormDate',
    'taskFormDone',
    'projectFormComplete',
  ].includes(phase)
}

// Which phases show the task form (overlaying project form)
export function isTaskFormPhase(phase: TutorialPhase): boolean {
  return [
    'taskFormType',
    'taskFormCrew',
    'taskFormDate',
    'taskFormDone',
  ].includes(phase)
}

// Which phases show the calendar view instead of job board
export function isCalendarPhase(phase: TutorialPhase): boolean {
  return [
    'calendarWeek',
    'calendarMonthPrompt',
    'calendarMonth',
  ].includes(phase)
}

// Which phases show the blocking overlay (before FAB is tapped)
export function isBlockingOverlayPhase(phase: TutorialPhase): boolean {
  return phase === 'jobBoardIntro'
}

// Which phases show the FAB
export function isFABVisiblePhase(phase: TutorialPhase): boolean {
  return phase === 'jobBoardIntro' || phase === 'fabTap'
}

// Which phases show animation demos on job board
export function isJobBoardAnimationPhase(phase: TutorialPhase): boolean {
  return [
    'dragToAccepted',
    'projectListStatusDemo',
    'projectListSwipe',
    'closedProjectsScroll',
  ].includes(phase)
}

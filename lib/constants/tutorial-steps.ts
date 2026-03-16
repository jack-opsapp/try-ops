export interface TutorialStep {
  id: string
  title: string
  description: string
  videoSrc?: string
  durationMs?: number
  autoAdvance?: boolean
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'job-board',
    title: 'YOUR JOB BOARD',
    description: 'See all your projects at a glance, organized by status. From new quotes to completed jobs.',
    videoSrc: '/videos/step-1-job-board.mp4',
    durationMs: 4000,
  },
  {
    id: 'create-project',
    title: 'CREATE A PROJECT',
    description: 'Tap the + button, pick a client, name your project. That simple.',
    videoSrc: '/videos/step-2-create-project.mp4',
    durationMs: 6000,
  },
  {
    id: 'add-tasks',
    title: 'ADD TASKS & ASSIGN CREW',
    description: 'Add task types, assign crew members, and set dates. Everything your team needs to know.',
    videoSrc: '/videos/step-3-add-tasks.mp4',
    durationMs: 6000,
  },
  {
    id: 'save-publish',
    title: 'SAVE & PUBLISH',
    description: 'Tap Done, then Create. Your crew gets notified instantly.',
    videoSrc: '/videos/step-4-save-publish.mp4',
    durationMs: 4000,
  },
  {
    id: 'drag-status',
    title: 'DRAG TO CHANGE STATUS',
    description: 'Long-press and drag projects between status columns. Your crew sees updates in real time.',
    videoSrc: '/videos/step-5-drag-status.mp4',
    durationMs: 4000,
  },
  {
    id: 'progress-update',
    title: 'WATCH PROGRESS UPDATE',
    description: 'Status updates flow through automatically. Your whole team stays in sync.',
    videoSrc: '/videos/step-6-progress-update.mp4',
    durationMs: 5000,
    autoAdvance: true,
  },
  {
    id: 'schedule',
    title: 'YOUR SCHEDULE',
    description: 'See your week and month at a glance. Every task, every crew member, every deadline.',
    videoSrc: '/videos/step-7-schedule.mp4',
    durationMs: 5000,
  },
  {
    id: 'summary',
    title: "THAT'S THE BASICS.",
    description: 'Create projects, assign crew, track progress. All from your pocket.',
  },
]

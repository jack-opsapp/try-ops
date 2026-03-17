import { create } from 'zustand'
import { PHASES, PHASE_CONFIG, type Phase } from './NarrativeTutorialData'
import { sendTutorialEvent } from './utils/analytics'
import { DURATION } from './utils/animations'

interface NarrativeTutorialStore {
  // ─── State ───────────────────────────────────────────────────────
  phase: Phase
  isActive: boolean
  isTransitioning: boolean
  sessionId: string
  tutorialStartTime: number
  phaseStartTime: number

  // ─── Actions ─────────────────────────────────────────────────────
  start: () => void
  advancePhase: () => void
  skip: () => void
  recordSwipe: (cardIndex: number, direction: 'left' | 'right') => void
  ctaTapped: (action: 'getStarted' | 'skip') => void

  // ─── Derived ─────────────────────────────────────────────────────
  phaseIndex: () => number
  totalElapsedMs: () => number
  phaseElapsedMs: () => number
}

export const useNarrativeTutorialStore = create<NarrativeTutorialStore>((set, get) => ({
  phase: 'leadArrives',
  isActive: false,
  isTransitioning: false,
  sessionId: '',
  tutorialStartTime: 0,
  phaseStartTime: 0,

  start: () => {
    const now = Date.now()
    const sessionId = crypto.randomUUID()
    set({
      phase: 'leadArrives',
      isActive: true,
      isTransitioning: false,
      sessionId,
      tutorialStartTime: now,
      phaseStartTime: now,
    })
    sendTutorialEvent({
      action: 'started_v2',
      phase: 'leadArrives',
      phaseIndex: 0,
      sessionId,
    })
  },

  advancePhase: () => {
    const state = get()
    if (state.isTransitioning) return

    const currentIndex = PHASE_CONFIG[state.phase].index
    const elapsed = Date.now() - state.phaseStartTime

    // Record step completion
    sendTutorialEvent({
      action: 'step_completed',
      phase: state.phase,
      phaseIndex: currentIndex,
      durationMs: elapsed,
      totalElapsedMs: Date.now() - state.tutorialStartTime,
      sessionId: state.sessionId,
    })

    // Check if this was the last phase
    const nextIndex = currentIndex + 1
    if (nextIndex >= PHASES.length) {
      sendTutorialEvent({
        action: 'completed_v2',
        phase: 'invoiceAndPay',
        phaseIndex: 5,
        totalElapsedMs: Date.now() - state.tutorialStartTime,
        sessionId: state.sessionId,
      })
      set({ isActive: false })
      return
    }

    // Transition to next phase
    set({ isTransitioning: true })
    setTimeout(() => {
      set({
        phase: PHASES[nextIndex],
        phaseStartTime: Date.now(),
        isTransitioning: false,
      })
    }, DURATION.normal * 1000)
  },

  skip: () => {
    const state = get()
    sendTutorialEvent({
      action: 'skipped_v2',
      phase: state.phase,
      phaseIndex: PHASE_CONFIG[state.phase].index,
      totalElapsedMs: Date.now() - state.tutorialStartTime,
      sessionId: state.sessionId,
    })
    set({ isActive: false })
  },

  recordSwipe: (cardIndex, direction) => {
    const state = get()
    sendTutorialEvent({
      action: 'review_swipe',
      phase: `weeklyReview_${direction}`,
      phaseIndex: 4,
      durationMs: cardIndex,
      sessionId: state.sessionId,
    })
  },

  ctaTapped: (action) => {
    const state = get()
    sendTutorialEvent({
      action: 'cta_tapped',
      phase: action,
      phaseIndex: 5,
      totalElapsedMs: Date.now() - state.tutorialStartTime,
      sessionId: state.sessionId,
    })
  },

  phaseIndex: () => PHASE_CONFIG[get().phase].index,
  totalElapsedMs: () => Date.now() - get().tutorialStartTime,
  phaseElapsedMs: () => Date.now() - get().phaseStartTime,
}))

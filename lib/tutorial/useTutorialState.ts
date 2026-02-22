'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  TutorialPhase,
  PHASE_ORDER,
  PHASE_CONFIGS,
  getNextPhase,
} from './TutorialPhase'
import { useAnalytics } from '@/lib/hooks/useAnalytics'

export interface TutorialState {
  phase: TutorialPhase
  phaseConfig: typeof PHASE_CONFIGS[TutorialPhase]
  phaseIndex: number
  totalPhases: number

  // User selections during form flow
  selectedClient: string | null
  projectName: string
  selectedTaskType: string | null
  selectedCrew: string | null
  selectedDate: string | null

  // Actions
  advance: () => void
  goBack: () => void
  skip: () => void
  setSelectedClient: (client: string) => void
  setProjectName: (name: string) => void
  setSelectedTaskType: (type: string) => void
  setSelectedCrew: (crew: string) => void
  setSelectedDate: (date: string) => void

  // Timing
  startTime: number
  elapsedSeconds: number
  stepDurations: string[]
}

export function useTutorialState(): TutorialState {
  const [phase, setPhase] = useState<TutorialPhase>('jobBoardIntro')
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [projectName, setProjectName] = useState('')
  const [selectedTaskType, setSelectedTaskType] = useState<string | null>(null)
  const [selectedCrew, setSelectedCrew] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [stepDurations, setStepDurations] = useState<string[]>([])

  const {
    trackTutorialPhaseStart,
    trackTutorialPhaseComplete,
    trackTutorialPhaseBack,
    trackTutorialPhaseSkip,
    trackTutorialAbandon,
  } = useAnalytics()

  const startTimeRef = useRef(Date.now())
  const phaseStartRef = useRef(Date.now())
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Track phase start on every phase change (including initial)
  const totalPhases = PHASE_ORDER.length - 1 // exclude 'completed'
  useEffect(() => {
    const idx = PHASE_ORDER.indexOf(phase)
    if (phase !== 'completed') {
      trackTutorialPhaseStart(phase, idx, totalPhases)
    }
  }, [phase, totalPhases, trackTutorialPhaseStart])

  // Track abandon on unmount (if tutorial not completed)
  useEffect(() => {
    return () => {
      // Use refs to get current values at unmount time
      const currentPhase = phaseRef.current
      if (currentPhase !== 'completed') {
        const idx = PHASE_ORDER.indexOf(currentPhase)
        const timeInPhase = Date.now() - phaseStartRef.current
        const totalTime = Date.now() - startTimeRef.current
        trackTutorialAbandon(currentPhase, idx, timeInPhase, totalTime)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep a ref to current phase for unmount cleanup
  const phaseRef = useRef<TutorialPhase>(phase)
  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // Handle auto-advance phases
  useEffect(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current)
      autoAdvanceTimerRef.current = null
    }

    const config = PHASE_CONFIGS[phase]
    if (config.autoAdvanceMs) {
      autoAdvanceTimerRef.current = setTimeout(() => {
        const next = getNextPhase(phase)
        if (next) {
          const idx = PHASE_ORDER.indexOf(phase)
          const timeInPhase = Date.now() - phaseStartRef.current
          trackTutorialPhaseComplete(phase, idx, timeInPhase)
          phaseStartRef.current = Date.now()
          setPhase(next)
        }
      }, config.autoAdvanceMs)
    }

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current)
      }
    }
  }, [phase, trackTutorialPhaseComplete])

  const advance = useCallback(() => {
    const next = getNextPhase(phase)
    if (next) {
      const idx = PHASE_ORDER.indexOf(phase)
      const timeInPhase = Date.now() - phaseStartRef.current
      trackTutorialPhaseComplete(phase, idx, timeInPhase)
      setStepDurations(prev => [...prev, `${phase}:${timeInPhase}`])
      phaseStartRef.current = Date.now()
      setPhase(next)
    }
  }, [phase, trackTutorialPhaseComplete])

  const goBack = useCallback(() => {
    const idx = PHASE_ORDER.indexOf(phase)
    if (idx > 0) {
      const prevPhase = PHASE_ORDER[idx - 1]
      trackTutorialPhaseBack(prevPhase, idx - 1, phase)
      setStepDurations(prev => prev.slice(0, -1))
      phaseStartRef.current = Date.now()
      setPhase(prevPhase)
    }
  }, [phase, trackTutorialPhaseBack])

  const skip = useCallback(() => {
    const idx = PHASE_ORDER.indexOf(phase)
    const timeInPhase = Date.now() - phaseStartRef.current
    trackTutorialPhaseSkip(phase, idx, timeInPhase)
    setStepDurations(prev => [...prev, `${phase}:${timeInPhase}`])
    setPhase('completed')
  }, [phase, trackTutorialPhaseSkip])

  const phaseIndex = PHASE_ORDER.indexOf(phase)

  return {
    phase,
    phaseConfig: PHASE_CONFIGS[phase],
    phaseIndex,
    totalPhases: PHASE_ORDER.length - 1, // exclude 'completed'

    selectedClient,
    projectName,
    selectedTaskType,
    selectedCrew,
    selectedDate,

    advance,
    goBack,
    skip,
    setSelectedClient,
    setProjectName,
    setSelectedTaskType,
    setSelectedCrew,
    setSelectedDate,

    startTime: startTimeRef.current,
    elapsedSeconds,
    stepDurations,
  }
}

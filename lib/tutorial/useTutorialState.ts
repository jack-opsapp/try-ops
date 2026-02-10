'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  TutorialPhase,
  PHASE_ORDER,
  PHASE_CONFIGS,
  getNextPhase,
} from './TutorialPhase'

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
  setSelectedClient: (client: string) => void
  setProjectName: (name: string) => void
  setSelectedTaskType: (type: string) => void
  setSelectedCrew: (crew: string) => void
  setSelectedDate: (date: string) => void

  // Timing
  startTime: number
  elapsedSeconds: number
}

export function useTutorialState(): TutorialState {
  const [phase, setPhase] = useState<TutorialPhase>('jobBoardIntro')
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [projectName, setProjectName] = useState('')
  const [selectedTaskType, setSelectedTaskType] = useState<string | null>(null)
  const [selectedCrew, setSelectedCrew] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const startTimeRef = useRef(Date.now())
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

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
        if (next) setPhase(next)
      }, config.autoAdvanceMs)
    }

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current)
      }
    }
  }, [phase])

  const advance = useCallback(() => {
    const next = getNextPhase(phase)
    if (next) setPhase(next)
  }, [phase])

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
    setSelectedClient,
    setProjectName,
    setSelectedTaskType,
    setSelectedCrew,
    setSelectedDate,

    startTime: startTimeRef.current,
    elapsedSeconds,
  }
}

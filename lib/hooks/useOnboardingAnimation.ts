'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Animation phases matching iOS OnboardingAnimationCoordinator exactly.
 * Flow: initial → headerTyping → subtitleTyping → contentFadeIn → labelsTyping
 *       → buttonContainerFadeIn → buttonTextTyping → buttonIconFadeIn → complete
 */
export type AnimationPhase =
  | 'initial'
  | 'headerTyping'
  | 'subtitleTyping'
  | 'contentFadeIn'
  | 'labelsTyping'
  | 'buttonContainerFadeIn'
  | 'buttonTextTyping'
  | 'buttonIconFadeIn'
  | 'complete'

const PHASE_ORDER: AnimationPhase[] = [
  'initial',
  'headerTyping',
  'subtitleTyping',
  'contentFadeIn',
  'labelsTyping',
  'buttonContainerFadeIn',
  'buttonTextTyping',
  'buttonIconFadeIn',
  'complete',
]

function phaseIndex(p: AnimationPhase): number {
  return PHASE_ORDER.indexOf(p)
}

export interface OnboardingAnimation {
  phase: AnimationPhase
  advanceTo: (target: AnimationPhase) => void
  start: () => void
  isAtLeast: (target: AnimationPhase) => boolean
}

export function useOnboardingAnimation(): OnboardingAnimation {
  const [phase, setPhase] = useState<AnimationPhase>('initial')
  const phaseRef = useRef<AnimationPhase>('initial')

  // Keep ref in sync for use in callbacks
  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  const advanceTo = useCallback((target: AnimationPhase) => {
    const targetIdx = phaseIndex(target)
    const currentIdx = phaseIndex(phaseRef.current)
    if (targetIdx > currentIdx) {
      setPhase(target)
    }
  }, [])

  // iOS: coordinator.start() → 0.3s delay → headerTyping
  const start = useCallback(() => {
    setTimeout(() => {
      advanceTo('headerTyping')
    }, 300)
  }, [advanceTo])

  const isAtLeast = useCallback(
    (target: AnimationPhase) => {
      return phaseIndex(phase) >= phaseIndex(target)
    },
    [phase]
  )

  return { phase, advanceTo, start, isAtLeast }
}

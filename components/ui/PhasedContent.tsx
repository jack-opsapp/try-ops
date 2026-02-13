'use client'

import { useState, useEffect } from 'react'
import type { OnboardingAnimation } from '@/lib/hooks/useOnboardingAnimation'

/**
 * Two modes:
 * 1. Legacy delay-based: PhasedContent delay={1000}
 * 2. Coordinator-based: PhasedContent animation={animation}
 *    Matches iOS PhasedContent exactly:
 *    - Fades in upward (opacity 0→1, y 20→0) during contentFadeIn phase
 *    - After visible, 0.45s delay → advance to labelsTyping
 */

interface PhasedContentBaseProps {
  children: React.ReactNode
  className?: string
}

interface PhasedContentDelayProps extends PhasedContentBaseProps {
  delay: number
  animation?: never
}

interface PhasedContentAnimationProps extends PhasedContentBaseProps {
  animation: OnboardingAnimation
  delay?: never
}

type PhasedContentProps = PhasedContentDelayProps | PhasedContentAnimationProps

export function PhasedContent({
  children,
  delay,
  animation,
  className = '',
}: PhasedContentProps) {
  const [visible, setVisible] = useState(false)

  // Legacy delay-based mode
  useEffect(() => {
    if (delay !== undefined && !animation) {
      const timeout = setTimeout(() => setVisible(true), delay)
      return () => clearTimeout(timeout)
    }
  }, [delay, animation])

  // Coordinator-based mode
  useEffect(() => {
    if (animation && animation.isAtLeast('contentFadeIn') && !visible) {
      setVisible(true)
      // iOS: after content fades in, 0.45s delay → advance to labelsTyping
      setTimeout(() => {
        animation.advanceTo('labelsTyping')
      }, 450)
    }
  }, [animation, animation?.phase, visible])

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-5'
      } ${className}`}
    >
      {children}
    </div>
  )
}

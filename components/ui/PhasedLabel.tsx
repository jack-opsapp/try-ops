'use client'

import { TypewriterText } from './TypewriterText'
import type { OnboardingAnimation } from '@/lib/hooks/useOnboardingAnimation'

/**
 * Matches iOS PhasedLabel exactly.
 * - Types in during labelsTyping phase
 * - Staggered by index (0.25s per label, matching iOS Double(index) * 0.25)
 * - Types at 40 chars/sec (25ms/char)
 * - If isLast, triggers buttonContainerFadeIn after 0.4s delay
 */
interface PhasedLabelProps {
  text: string
  index?: number
  isLast?: boolean
  animation: OnboardingAnimation
}

export function PhasedLabel({
  text,
  index = 0,
  isLast = false,
  animation,
}: PhasedLabelProps) {
  const { isAtLeast, advanceTo } = animation

  return (
    <div className="relative">
      {/* Space reservation */}
      <span className="font-kosugi font-normal text-ops-caption text-transparent select-none uppercase tracking-wider">
        {text}
      </span>
      {/* Typed label (staggered by index) */}
      {isAtLeast('labelsTyping') && (
        <span className="absolute inset-0">
          <TypewriterText
            text={text}
            className="font-kosugi font-normal text-ops-caption text-ops-text-secondary uppercase tracking-wider"
            typingSpeed={25}
            startDelay={index * 250}
            onComplete={() => {
              if (isLast) {
                // iOS: 0.4s delay then advance to buttonContainerFadeIn
                setTimeout(() => advanceTo('buttonContainerFadeIn'), 400)
              }
            }}
          />
        </span>
      )}
    </div>
  )
}

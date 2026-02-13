'use client'

import { TypewriterText } from './TypewriterText'
import type { OnboardingAnimation } from '@/lib/hooks/useOnboardingAnimation'

/**
 * Matches iOS PhasedOnboardingHeader exactly.
 * - Title types at 28 chars/sec (36ms/char) during headerTyping phase
 * - After title complete, 0.45s delay → advance to subtitleTyping
 * - Subtitle types at 30 chars/sec (33ms/char) during subtitleTyping phase
 * - After subtitle complete, 0.4s delay → advance to contentFadeIn
 */
interface PhasedOnboardingHeaderProps {
  title: string
  subtitle?: string
  animation: OnboardingAnimation
}

export function PhasedOnboardingHeader({
  title,
  subtitle,
  animation,
}: PhasedOnboardingHeaderProps) {
  const { isAtLeast, advanceTo } = animation

  return (
    <div className="flex flex-col items-start gap-2">
      {/* Title with space reservation (iOS ZStack pattern) */}
      <div className="relative">
        {/* Invisible placeholder to reserve space */}
        <h1 className="font-mohave font-semibold text-ops-title tracking-wide text-transparent select-none">
          {title}
        </h1>
        {/* Typed title */}
        {isAtLeast('headerTyping') && (
          <span className="absolute inset-0">
            <TypewriterText
              text={title}
              className="font-mohave font-semibold text-ops-title tracking-wide text-white"
              typingSpeed={36}
              onComplete={() => {
                // iOS: 0.45s delay then advance to subtitleTyping
                setTimeout(() => advanceTo('subtitleTyping'), 450)
              }}
            />
          </span>
        )}
      </div>

      {/* Subtitle with space reservation */}
      {subtitle && (
        <div className="relative">
          <p className="font-kosugi text-ops-body text-transparent select-none">
            {subtitle}
          </p>
          {isAtLeast('subtitleTyping') && (
            <span className="absolute inset-0">
              <TypewriterText
                text={subtitle}
                className="font-kosugi text-ops-body text-ops-text-secondary"
                typingSpeed={33}
                onComplete={() => {
                  // iOS: 0.4s delay then advance to contentFadeIn
                  setTimeout(() => advanceTo('contentFadeIn'), 400)
                }}
              />
            </span>
          )}
        </div>
      )}
    </div>
  )
}

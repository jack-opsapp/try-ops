'use client'

import { useState, useEffect, useRef } from 'react'
import { TypewriterText } from './TypewriterText'
import type { OnboardingAnimation } from '@/lib/hooks/useOnboardingAnimation'

/**
 * Matches iOS PhasedPrimaryButton exactly.
 * - Container fades in with spring during buttonContainerFadeIn phase
 * - After 0.5s delay, text types in at 25 chars/sec (40ms/char)
 * - After text complete, 0.35s delay → arrow icon fades in
 * - White bg, black text, 56px height, arrow.right icon
 * - Positioned at bottom with px-10 pb-[50px] (matching iOS .padding(.horizontal, 40) .padding(.bottom, 50))
 */
interface PhasedPrimaryButtonProps {
  title: string
  isEnabled?: boolean
  isLoading?: boolean
  loadingText?: string
  animation: OnboardingAnimation
  onClick: () => void
}

export function PhasedPrimaryButton({
  title,
  isEnabled = true,
  isLoading = false,
  loadingText,
  animation,
  onClick,
}: PhasedPrimaryButtonProps) {
  const { isAtLeast, advanceTo } = animation

  const [containerVisible, setContainerVisible] = useState(false)
  const [textVisible, setTextVisible] = useState(false)
  const [iconVisible, setIconVisible] = useState(false)
  const hasTriggered = useRef(false)

  // Watch for buttonContainerFadeIn phase
  useEffect(() => {
    if (isAtLeast('buttonContainerFadeIn') && !hasTriggered.current) {
      hasTriggered.current = true
      // Spring-like container fade in
      setContainerVisible(true)
      // iOS: 0.5s delay then start text typing
      setTimeout(() => {
        advanceTo('buttonTextTyping')
        setTextVisible(true)
      }, 500)
    }
  }, [isAtLeast, advanceTo])

  return (
    <div className="px-10 pb-[50px] pt-4">
      <button
        onClick={onClick}
        disabled={!isEnabled || isLoading || !containerVisible}
        className="relative w-full h-14 rounded-ops overflow-hidden"
      >
        {/* Container background */}
        <div
          className="absolute inset-0 rounded-ops transition-all duration-500"
          style={{
            backgroundColor:
              isEnabled && !isLoading
                ? 'white'
                : 'rgba(255, 255, 255, 0.5)',
            opacity: containerVisible ? 1 : 0,
            transform: containerVisible ? 'translateY(0)' : 'translateY(20px)',
            // CSS spring approximation
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />

        {/* Content */}
        <div
          className="relative flex items-center h-full px-5"
          style={{ opacity: containerVisible ? 1 : 0 }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2 mx-auto">
              <svg
                className="animate-spin h-5 w-5 text-black"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="font-mohave font-bold text-ops-body text-black">
                {loadingText || title}
              </span>
            </span>
          ) : (
            <>
              {/* Title with space reservation + typewriter */}
              <div className="relative flex-1">
                <span className="font-mohave font-bold text-ops-body text-transparent select-none">
                  {title}
                </span>
                {textVisible && (
                  <span className="absolute inset-0 flex items-center">
                    <TypewriterText
                      text={title}
                      className="font-mohave font-bold text-ops-body text-black"
                      typingSpeed={40}
                      onComplete={() => {
                        // iOS: 0.35s delay then show icon
                        setTimeout(() => {
                          setIconVisible(true)
                          advanceTo('complete')
                        }, 350)
                      }}
                    />
                  </span>
                )}
              </div>

              {/* Arrow icon - fades in */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                className="text-black flex-shrink-0 transition-all duration-400"
                style={{
                  opacity: iconVisible ? 1 : 0,
                  transform: iconVisible
                    ? 'translateX(0)'
                    : 'translateX(-10px)',
                  transitionDuration: '400ms',
                  transitionTimingFunction: 'ease-out',
                }}
              >
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          )}
        </div>
      </button>
    </div>
  )
}

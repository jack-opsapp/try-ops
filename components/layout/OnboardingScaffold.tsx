'use client'

import { useRouter } from 'next/navigation'

interface OnboardingScaffoldProps {
  children: React.ReactNode
  showBack?: boolean
  onBack?: () => void
  className?: string
}

/**
 * Matches iOS OnboardingScaffold layout:
 * - Full height dark background
 * - Header with back button at top (40px horizontal padding, matching iOS .padding(.horizontal, 40))
 * - Content area as flex column (children manage their own spacing + button)
 */
export function OnboardingScaffold({
  children,
  showBack = false,
  onBack,
  className = '',
}: OnboardingScaffoldProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-ops-background flex flex-col">
      {/* Header — iOS: .padding(.horizontal, 40) .padding(.top, 16) */}
      <div className="flex items-center px-10 pt-4 pb-4">
        {showBack && (
          <button
            onClick={handleBack}
            className="text-ops-text-secondary hover:text-white transition-colors p-2 -ml-2"
            aria-label="Go back"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Content — flex column so children can use flex-1 spacer + bottom button */}
      <div className={`flex-1 flex flex-col ${className}`}>
        {children}
      </div>
    </div>
  )
}

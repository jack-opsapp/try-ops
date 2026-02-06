'use client'

import { useRouter } from 'next/navigation'

interface OnboardingScaffoldProps {
  children: React.ReactNode
  showBack?: boolean
  onBack?: () => void
  className?: string
}

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
      {/* Header */}
      <div className="flex items-center px-6 pt-6 pb-4">
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

      {/* Content */}
      <div className={`flex-1 px-6 pb-8 ${className}`}>
        {children}
      </div>
    </div>
  )
}

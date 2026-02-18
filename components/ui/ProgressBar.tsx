'use client'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export function ProgressBar({
  currentStep,
  totalSteps,
  className = '',
}: ProgressBarProps) {
  return (
    <div className={`flex gap-1.5 ${className}`}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            i < currentStep
              ? 'bg-ops-accent'
              : i === currentStep
              ? 'bg-ops-text-primary'
              : 'bg-ops-border-emphasis'
          }`}
        />
      ))}
    </div>
  )
}

'use client'

interface OPSButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  className?: string
  type?: 'button' | 'submit'
}

export function OPSButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  loadingText,
  className = '',
  type = 'button',
}: OPSButtonProps) {
  const baseStyles =
    'h-14 px-8 rounded-ops font-mohave font-semibold text-ops-body tracking-wide transition-all duration-200 flex items-center justify-center w-full disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]'

  const variantStyles = {
    primary: 'bg-ops-accent text-ops-text-primary hover:brightness-110 active:brightness-90',
    secondary:
      'bg-ops-surface text-ops-accent border border-ops-accent hover:brightness-110 active:brightness-90',
    ghost:
      'bg-transparent text-ops-text-secondary hover:text-ops-text-primary',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
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
          {loadingText || children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}

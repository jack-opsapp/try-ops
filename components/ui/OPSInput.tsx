'use client'

interface OPSInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  error?: string
  disabled?: boolean
  autoComplete?: string
  rightAction?: {
    label: string
    onClick: () => void
  }
}

export function OPSInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  error,
  disabled = false,
  autoComplete,
  rightAction,
}: OPSInputProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="font-kosugi text-ops-caption text-ops-text-secondary uppercase tracking-wider">
          {label}
          {required && <span className="text-ops-error ml-1">*</span>}
        </label>
        {rightAction && (
          <button
            type="button"
            onClick={rightAction.onClick}
            className="font-kosugi text-ops-small text-ops-accent hover:text-ops-accent/80 transition-colors"
          >
            {rightAction.label}
          </button>
        )}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`
          w-full h-12 px-4 rounded-ops bg-ops-surface font-mohave text-ops-body text-ops-text-primary
          border transition-colors duration-200 outline-none
          placeholder:text-ops-text-tertiary
          ${error ? 'border-ops-error' : 'border-ops-border'}
          focus:border-ops-accent
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      />
      {error && (
        <p className="mt-1 font-kosugi text-ops-small text-ops-error">
          {error}
        </p>
      )}
    </div>
  )
}

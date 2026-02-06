'use client'

interface PillSelectorProps {
  label: string
  options: readonly string[]
  value: string
  onChange: (value: string) => void
}

export function PillSelector({
  label,
  options,
  value,
  onChange,
}: PillSelectorProps) {
  return (
    <div className="w-full">
      <label className="font-kosugi text-ops-caption text-ops-text-secondary uppercase tracking-wider mb-3 block">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`
              px-5 py-2.5 rounded-full font-mohave text-ops-body
              border transition-all duration-200
              ${
                value === option
                  ? 'bg-ops-accent text-white border-ops-accent'
                  : 'bg-transparent text-ops-text-secondary border-white/10 hover:border-white/30'
              }
            `}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

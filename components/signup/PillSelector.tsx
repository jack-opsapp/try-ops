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
      <label className="font-kosugi font-normal text-ops-caption text-ops-text-secondary uppercase tracking-wider mb-3 block">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`
              px-5 py-2.5 rounded-ops font-mohave text-ops-body
              border transition-all duration-200
              ${
                value === option
                  ? 'bg-ops-accent text-white border-ops-accent'
                  : 'bg-[#0D0D0D]/60 text-ops-text-secondary border-white/20 hover:border-ops-accent/50'
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

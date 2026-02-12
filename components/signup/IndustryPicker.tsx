'use client'

import { useState, useMemo } from 'react'
import { INDUSTRIES } from '@/lib/constants/industries'
import { OPSInput } from '@/components/ui/OPSInput'

interface IndustryPickerProps {
  value: string
  onChange: (value: string) => void
  customIndustry: string
  onCustomChange: (value: string) => void
}

export function IndustryPicker({
  value,
  onChange,
  customIndustry,
  onCustomChange,
}: IndustryPickerProps) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!search) return INDUSTRIES
    const lower = search.toLowerCase()
    return INDUSTRIES.filter((i) => i.toLowerCase().includes(lower))
  }, [search])

  return (
    <div className="w-full">
      <label className="font-kosugi text-ops-caption text-ops-text-secondary uppercase tracking-wider mb-2 block">
        INDUSTRY <span className="text-ops-error">*</span>
      </label>

      {/* Selected display / trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full h-12 px-4 rounded-ops bg-[#0D0D0D]/60 font-mohave text-ops-body text-left
          border border-white/20 transition-colors
          flex items-center justify-between
          ${value ? 'text-white' : 'text-ops-text-tertiary'}
        `}
      >
        <span>{value || 'Select your trade'}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-ops-text-tertiary transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="mt-2 rounded-ops bg-[#0D0D0D] border border-white/20 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-white/10">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trades..."
              className="w-full h-10 px-3 rounded-ops bg-[#0D0D0D]/60 font-mohave text-ops-body text-white border border-white/20 outline-none focus:border-white/40 placeholder:text-ops-text-tertiary"
              autoFocus
            />
          </div>

          {/* Options */}
          <div className="max-h-64 overflow-y-auto">
            {filtered.map((industry) => (
              <button
                key={industry}
                type="button"
                onClick={() => {
                  onChange(industry)
                  setIsOpen(false)
                  setSearch('')
                }}
                className={`
                  w-full px-4 py-3 text-left font-mohave text-ops-body
                  hover:bg-white/5 transition-colors
                  ${value === industry ? 'text-ops-accent bg-ops-accent/5' : 'text-white'}
                `}
              >
                {industry}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-3 font-kosugi text-ops-caption text-ops-text-tertiary">
                No trades found
              </p>
            )}
          </div>
        </div>
      )}

      {/* Custom industry input when "Other" is selected */}
      {value === 'Other' && (
        <div className="mt-3">
          <OPSInput
            label="Your trade"
            value={customIndustry}
            onChange={onCustomChange}
            placeholder="Enter your trade"
            required
          />
        </div>
      )}
    </div>
  )
}

'use client'

interface WireframeIconProps {
  children: React.ReactNode
  size?: number
  className?: string
}

export function WireframeIcon({ children, size = 64, className = '' }: WireframeIconProps) {
  return (
    <div
      className={`text-ops-accent ${className}`}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  )
}

/* Pre-built SVG icons for the pain section */

export function TangledMessagesIcon({ size = 64 }: { size?: number }) {
  return (
    <WireframeIcon size={size}>
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="8" width="28" height="18" rx="4" />
        <rect x="32" y="24" width="28" height="18" rx="4" />
        <rect x="8" y="38" width="28" height="18" rx="4" />
        <line x1="32" y1="17" x2="32" y2="24" />
        <line x1="28" y1="38" x2="36" y2="33" />
        <circle cx="14" cy="17" r="1.5" fill="currentColor" />
        <circle cx="18" cy="17" r="1.5" fill="currentColor" />
        <circle cx="22" cy="17" r="1.5" fill="currentColor" />
        <circle cx="42" cy="33" r="1.5" fill="currentColor" />
        <circle cx="46" cy="33" r="1.5" fill="currentColor" />
        <circle cx="50" cy="33" r="1.5" fill="currentColor" />
        <circle cx="18" cy="47" r="1.5" fill="currentColor" />
        <circle cx="22" cy="47" r="1.5" fill="currentColor" />
        <circle cx="26" cy="47" r="1.5" fill="currentColor" />
      </svg>
    </WireframeIcon>
  )
}

export function DashboardOverloadIcon({ size = 64 }: { size?: number }) {
  return (
    <WireframeIcon size={size}>
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="56" height="56" rx="4" />
        <line x1="4" y1="16" x2="60" y2="16" />
        <line x1="24" y1="16" x2="24" y2="60" />
        <rect x="28" y="20" width="12" height="8" rx="1" />
        <rect x="44" y="20" width="12" height="8" rx="1" />
        <rect x="28" y="32" width="28" height="6" rx="1" />
        <rect x="28" y="42" width="28" height="6" rx="1" />
        <rect x="28" y="52" width="12" height="4" rx="1" />
        <rect x="8" y="20" width="12" height="4" rx="1" />
        <rect x="8" y="28" width="12" height="4" rx="1" />
        <rect x="8" y="36" width="12" height="4" rx="1" />
        <rect x="8" y="44" width="12" height="4" rx="1" />
        <rect x="8" y="52" width="12" height="4" rx="1" />
        <circle cx="10" cy="10" r="2" fill="currentColor" />
        <circle cx="16" cy="10" r="2" fill="currentColor" />
      </svg>
    </WireframeIcon>
  )
}

export function ScatteredAppsIcon({ size = 64 }: { size?: number }) {
  return (
    <WireframeIcon size={size}>
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <rect x="24" y="8" width="16" height="16" rx="4" />
        <rect x="44" y="4" width="16" height="16" rx="4" />
        <rect x="8" y="28" width="16" height="16" rx="4" />
        <rect x="40" y="32" width="16" height="16" rx="4" />
        <path d="M20 12 L24 16" strokeDasharray="3 3" />
        <path d="M40 16 L44 12" strokeDasharray="3 3" />
        <path d="M16 28 L20 24" strokeDasharray="3 3" />
        <path d="M48 32 L44 24" strokeDasharray="3 3" />
        <path d="M24 36 L40 40" strokeDasharray="3 3" />
        <text x="8" y="56" fontSize="10" fill="currentColor" fontFamily="monospace">$$$</text>
      </svg>
    </WireframeIcon>
  )
}

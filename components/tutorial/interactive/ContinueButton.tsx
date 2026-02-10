'use client'

interface ContinueButtonProps {
  label: string // "CONTINUE" or "DONE"
  onClick: () => void
  variant?: 'inline' | 'fullWidth'
}

export function ContinueButton({ label, onClick }: ContinueButtonProps) {
  // Full width at bottom, overlapping tab bar, OPSStyle cornerRadius (5px)
  return (
    <div className="absolute bottom-0 left-0 right-0 px-5 pb-5" style={{ zIndex: 60 }}>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-center gap-2 bg-white text-black font-mohave font-medium text-[16px] tracking-wide animate-fade-in
                   hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150"
        style={{
          paddingTop: '14px',
          paddingBottom: '14px',
          borderRadius: 5,
          boxShadow: '0 0 20px rgba(0,0,0,0.8), 0 8px 40px rgba(0,0,0,0.6), 0 12px 60px rgba(0,0,0,0.4)',
        }}
      >
        <span>{label}</span>
        {/* arrow.right icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-black">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}

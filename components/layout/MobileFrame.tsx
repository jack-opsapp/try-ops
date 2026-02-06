'use client'

interface MobileFrameProps {
  children: React.ReactNode
  className?: string
}

export function MobileFrame({ children, className = '' }: MobileFrameProps) {
  return (
    <div className={`relative mx-auto ${className}`}>
      {/* Phone bezel */}
      <div className="relative bg-black rounded-[2.5rem] p-3 shadow-2xl border border-white/10 max-w-[280px] mx-auto">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10" />
        {/* Screen */}
        <div className="relative rounded-[2rem] overflow-hidden bg-ops-background aspect-[9/19.5]">
          {children}
        </div>
      </div>
    </div>
  )
}

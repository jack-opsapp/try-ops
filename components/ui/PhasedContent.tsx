'use client'

import { useState, useEffect } from 'react'

interface PhasedContentProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function PhasedContent({
  children,
  delay = 0,
  className = '',
}: PhasedContentProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timeout)
  }, [delay])

  return (
    <div
      className={`transition-all duration-500 ${
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  )
}

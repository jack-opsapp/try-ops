'use client'

import { useEffect, useState, useRef } from 'react'

/**
 * TacticalLoadingBar — 8 vertical bars with a 3-bar wave sweep.
 * Matches the iOS TacticalLoadingBarAnimated.
 */
export function TacticalLoadingBar() {
  const barCount = 8
  const activeRange = 3
  const [offset, setOffset] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setOffset((prev) => (prev + 1) % barCount)
    }, 150)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: barCount }).map((_, i) => {
        const normalizedIndex = (i + barCount - offset) % barCount
        const isActive = normalizedIndex < activeRange
        return (
          <div
            key={i}
            className="transition-colors duration-150"
            style={{
              width: 2,
              height: 6,
              backgroundColor: isActive
                ? 'var(--color-text-secondary, rgba(229, 229, 229, 1))'
                : 'var(--color-text-disabled, rgba(255, 255, 255, 0.2))',
            }}
          />
        )
      })}
    </div>
  )
}

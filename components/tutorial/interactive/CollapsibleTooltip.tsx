'use client'

import { useState, useEffect, useRef } from 'react'
import type { TutorialPhase } from '@/lib/tutorial/TutorialPhase'

interface CollapsibleTooltipProps {
  text: string
  description: string
  phase: TutorialPhase
}

export function CollapsibleTooltip({ text, description, phase }: CollapsibleTooltipProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [displayTitle, setDisplayTitle] = useState('')
  const [displayDesc, setDisplayDesc] = useState('')
  const [titleDone, setTitleDone] = useState(false)
  const [descDone, setDescDone] = useState(false)
  const titleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const descTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Reset and start typewriter on phase change
  useEffect(() => {
    setCollapsed(false)
    setDisplayTitle('')
    setDisplayDesc('')
    setTitleDone(false)
    setDescDone(false)

    if (titleTimerRef.current) clearInterval(titleTimerRef.current)
    if (descTimerRef.current) clearInterval(descTimerRef.current)

    if (!text) return

    // Title typewriter: 20ms per char (matching iOS 0.02s/char)
    let ti = 0
    titleTimerRef.current = setInterval(() => {
      ti++
      setDisplayTitle(text.slice(0, ti))
      if (ti >= text.length) {
        if (titleTimerRef.current) clearInterval(titleTimerRef.current)
        setTitleDone(true)
      }
    }, 20)

    return () => {
      if (titleTimerRef.current) clearInterval(titleTimerRef.current)
      if (descTimerRef.current) clearInterval(descTimerRef.current)
    }
  }, [phase, text])

  // Start description after title finishes: 15ms per char (matching iOS 0.015s/char)
  useEffect(() => {
    if (!titleDone || !description) return

    let di = 0
    descTimerRef.current = setInterval(() => {
      di++
      setDisplayDesc(description.slice(0, di))
      if (di >= description.length) {
        if (descTimerRef.current) clearInterval(descTimerRef.current)
        setDescDone(true)
      }
    }, 15)

    return () => {
      if (descTimerRef.current) clearInterval(descTimerRef.current)
    }
  }, [titleDone, description])

  if (!text) return null

  return (
    <div
      className="mx-4 mt-4 cursor-pointer select-none transition-all duration-300"
      style={{
        borderRadius: '5px',
        background: '#0D0D0D',
        border: '1px solid rgba(65, 115, 148, 0.3)',
        boxShadow: '0 0 20px rgba(0,0,0,0.8), 0 8px 40px rgba(0,0,0,0.6), 0 12px 60px rgba(0,0,0,0.4)',
      }}
      onClick={() => setCollapsed(!collapsed)}
    >
      {collapsed ? (
        /* Collapsed state */
        <div className="flex items-center gap-3 px-4 py-2.5">
          {/* Lightbulb icon */}
          <div className="flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#417394">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zM9 21a1 1 0 001 1h4a1 1 0 001-1v-1H9v1z" />
            </svg>
          </div>

          {/* Hint label */}
          <span className="font-kosugi text-[14px] font-bold text-ops-text-secondary uppercase tracking-wide">
            Tap for hint
          </span>

          {/* Chevron down */}
          <div className="flex-shrink-0 ml-auto">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-ops-text-secondary">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      ) : (
        /* Expanded state */
        <div className="flex items-start gap-3 px-4 py-3.5">
          {/* Lightbulb icon */}
          <div className="flex-shrink-0 mt-0.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#417394">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zM9 21a1 1 0 001 1h4a1 1 0 001-1v-1H9v1z" />
            </svg>
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            {/* Title: bodyBold (Mohave Medium 16pt) */}
            <p className="font-mohave font-medium text-[16px] text-white leading-tight">
              {displayTitle}
              {!titleDone && (
                <span className="animate-cursor-blink text-ops-accent">|</span>
              )}
            </p>

            {/* Description: caption (Kosugi 14pt), secondaryText */}
            {titleDone && description && (
              <p className="font-kosugi text-[14px] text-ops-text-secondary leading-snug mt-1.5">
                {displayDesc}
                {!descDone && (
                  <span className="animate-cursor-blink text-ops-accent">|</span>
                )}
              </p>
            )}
          </div>

          {/* Chevron up */}
          <div className="flex-shrink-0 mt-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-ops-text-secondary">
              <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}

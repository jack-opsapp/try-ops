'use client'

import { useState, useEffect, useRef } from 'react'
import type { TutorialPhase } from '@/lib/tutorial/TutorialPhase'

interface MockFABProps {
  phase: TutorialPhase
  onFABTap: () => void
  onCreateProject: () => void
}

// Menu items config: order matches iOS (bottom to top in the VStack above FAB)
// In the iOS code, the VStack renders: New Task Type, Create Task, Create Project, Create Client
// With stagger delays: 0.8, 0.6, 0.4, 0.2 respectively
// Visually bottom-to-top from FAB: Create Client (0.2), Create Project (0.4), Create Task (0.6), New Task Type (0.8)
const MENU_ITEMS = [
  {
    id: 'taskType',
    label: 'NEW TASK TYPE',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    dimmedInTutorial: true,
    delay: 0.8,
  },
  {
    id: 'createTask',
    label: 'CREATE TASK',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    dimmedInTutorial: true,
    delay: 0.6,
  },
  {
    id: 'createProject',
    label: 'CREATE PROJECT',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      </svg>
    ),
    dimmedInTutorial: false,
    delay: 0.4,
  },
  {
    id: 'createClient',
    label: 'CREATE CLIENT',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
        <line x1="18" y1="8" x2="18" y2="14" />
        <line x1="15" y1="11" x2="21" y2="11" />
      </svg>
    ),
    dimmedInTutorial: true,
    delay: 0.2,
  },
]

export function MockFAB({ phase, onFABTap, onCreateProject }: MockFABProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [pulsing, setPulsing] = useState(false)
  const [itemsVisible, setItemsVisible] = useState<boolean[]>(new Array(MENU_ITEMS.length).fill(false))
  const staggerTimeouts = useRef<NodeJS.Timeout[]>([])

  // Sync state to phase
  useEffect(() => {
    setPulsing(phase === 'jobBoardIntro')

    if (phase === 'fabTap') {
      setMenuOpen(true)
      // Stagger menu items in from bottom (last item first, matching iOS delay order)
      // Items render top-to-bottom: [taskType(0.6), createTask(0.4), createProject(0.2), createClient(0.0)]
      // We reveal from bottom: createClient first, then createProject, then createTask, then taskType
      const reversed = [...MENU_ITEMS].reverse()
      staggerTimeouts.current.forEach(clearTimeout)
      staggerTimeouts.current = []
      setItemsVisible(new Array(MENU_ITEMS.length).fill(false))

      reversed.forEach((item, reverseIdx) => {
        const actualIdx = MENU_ITEMS.length - 1 - reverseIdx
        const timeout = setTimeout(() => {
          setItemsVisible(prev => {
            const next = [...prev]
            next[actualIdx] = true
            return next
          })
        }, reverseIdx * 200) // 200ms stagger matching iOS delays
        staggerTimeouts.current.push(timeout)
      })
    } else {
      setMenuOpen(false)
      setItemsVisible(new Array(MENU_ITEMS.length).fill(false))
      staggerTimeouts.current.forEach(clearTimeout)
      staggerTimeouts.current = []
    }

    return () => {
      staggerTimeouts.current.forEach(clearTimeout)
    }
  }, [phase])

  const handleFABClick = () => {
    if (phase === 'jobBoardIntro') {
      onFABTap()
    }
  }

  const handleCreateProject = () => {
    if (phase === 'fabTap') {
      onCreateProject()
    }
  }

  // Only visible during jobBoardIntro and fabTap
  if (phase !== 'jobBoardIntro' && phase !== 'fabTap') return null

  const isFABDisabled = phase === 'fabTap'

  return (
    <>
      {/* Gradient overlay when menu is open */}
      {menuOpen && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 25,
            background: 'linear-gradient(to left, rgba(0,0,0,0.85) 0%, transparent 100%)',
          }}
        />
      )}

      {/* FAB container - positioned bottom-right */}
      <div
        className="absolute"
        style={{
          zIndex: 30,
          bottom: '140px',
          right: '36px',
        }}
      >
        {/* Menu items - stacked above FAB, right-aligned */}
        {menuOpen && (
          <div
            className="flex flex-col items-end mb-6"
            style={{ gap: '24px' }}
          >
            {MENU_ITEMS.map((item, idx) => {
              const isCreateProject = item.id === 'createProject'
              const isDimmed = item.dimmedInTutorial && phase === 'fabTap'
              const isVisible = itemsVisible[idx]

              return (
                <button
                  key={item.id}
                  onClick={isCreateProject ? handleCreateProject : undefined}
                  disabled={!isCreateProject}
                  className="flex items-center gap-3 transition-all duration-300"
                  style={{
                    opacity: isVisible ? (isDimmed ? 0.4 : 1) : 0,
                    transform: isVisible ? 'translateX(0)' : 'translateX(40px)',
                    pointerEvents: isCreateProject ? 'auto' : 'none',
                  }}
                >
                  {/* Label */}
                  <span
                    className="font-mohave font-bold text-white whitespace-nowrap"
                    style={{ fontSize: '16px', letterSpacing: '0.5px' }}
                  >
                    {item.label}
                  </span>

                  {/* Circle icon */}
                  <div
                    className="flex items-center justify-center rounded-full shrink-0"
                    style={{
                      width: '48px',
                      height: '48px',
                      color: '#AAAAAA',
                      border: '1px solid #AAAAAA',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    }}
                  >
                    {item.icon}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Main FAB button */}
        <div className="flex justify-end">
          <button
            onClick={handleFABClick}
            disabled={isFABDisabled}
            className="relative flex items-center justify-center rounded-full transition-all duration-300"
            style={{
              width: '64px',
              height: '64px',
              background: isFABDisabled
                ? 'rgba(0,0,0,0.8)'
                : 'rgba(30,30,30,0.8)',
              backdropFilter: isFABDisabled ? 'none' : 'blur(20px)',
              WebkitBackdropFilter: isFABDisabled ? 'none' : 'blur(20px)',
              boxShadow: pulsing
                ? '0 4px 12px rgba(0,0,0,0.3), 0 0 20px rgba(65,115,148,0.4)'
                : '0 4px 12px rgba(0,0,0,0.3)',
              border: isFABDisabled
                ? '2px solid #777777'
                : '2px solid #417394',
              transform: menuOpen ? 'rotate(225deg)' : 'rotate(0deg)',
            }}
          >
            {/* Plus icon */}
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                color: isFABDisabled ? '#777777' : '#FFFFFF',
              }}
            >
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>

            {/* Pulsing accent border ring (jobBoardIntro only) */}
            {pulsing && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: '2px solid #417394',
                  animation: 'fab-pulse-ring 1.5s ease-in-out infinite',
                }}
              />
            )}

            {/* Pulsing scale animation (jobBoardIntro only) */}
            {pulsing && (
              <div
                className="absolute rounded-full"
                style={{
                  inset: '-4px',
                  border: '2px solid rgba(65,115,148,0.5)',
                  animation: 'fab-glow 1.5s ease-in-out infinite',
                }}
              />
            )}
          </button>
        </div>
      </div>

    </>
  )
}

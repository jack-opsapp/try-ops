'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { DEMO_PROJECTS, type DemoProject } from '@/lib/constants/demo-data'
import { MockProjectCard } from './MockProjectCard'
import type { TutorialPhase } from '@/lib/tutorial/TutorialPhase'

interface MockJobBoardProps {
  phase: TutorialPhase
  userProject: DemoProject | null
  onSwipeComplete?: () => void
  onClosedSectionViewed?: () => void
  startDragAnimation?: boolean
  onDragAnimationDone?: () => void
}

type StatusColumn = 'rfq' | 'estimated' | 'accepted' | 'inProgress' | 'completed'

const STATUS_LABELS: Record<StatusColumn, string> = {
  rfq: 'RFQ',
  estimated: 'Estimated',
  accepted: 'Accepted',
  inProgress: 'In Progress',
  completed: 'Completed',
}

const STATUS_COLORS: Record<StatusColumn, string> = {
  rfq: '#BCBCBC',
  estimated: '#B5A381',
  accepted: '#9DB582',
  inProgress: '#8195B5',
  completed: '#B58289',
}

// Phases that show the dashboard (paging columns) view
const DASHBOARD_PHASES: TutorialPhase[] = [
  'jobBoardIntro',
  'fabTap',
  'dragToAccepted',
]

// Phases that show the list (scrollable cards) view
const LIST_PHASES: TutorialPhase[] = [
  'projectListStatusDemo',
  'projectListSwipe',
  'closedProjectsScroll',
]

// =============================================================================
// SHARED HEADER COMPONENTS
// =============================================================================

type SectionTab = 'DASHBOARD' | 'CLIENTS' | 'PROJECTS' | 'TASKS'

function MockAppHeader() {
  return (
    <div className="flex items-center justify-between" style={{ padding: '12px 20px' }}>
      <h2 className="font-mohave font-semibold text-[28px] uppercase tracking-wider text-white">
        Job Board
      </h2>
      {/* Right: user info (name | role, email) matching iOS .jobBoard header */}
      <div className="flex flex-col items-end" style={{ gap: 2 }}>
        <div className="flex items-center" style={{ gap: 8 }}>
          <span className="font-mohave text-[16px] text-white">
            Pete Mitchell
          </span>
          <span className="font-mohave text-[16px] text-ops-text-secondary">|</span>
          <span className="font-mohave text-[16px] text-ops-text-secondary">
            Owner
          </span>
        </div>
        <span className="font-kosugi text-[12px] text-ops-text-secondary">
          maverick@topgun.mil
        </span>
      </div>
    </div>
  )
}

function MockSectionSelector({ selected, animateToProjects }: { selected: SectionTab; animateToProjects?: boolean }) {
  const tabs: SectionTab[] = ['DASHBOARD', 'CLIENTS', 'PROJECTS', 'TASKS']
  const [activeTab, setActiveTab] = useState<SectionTab>(selected)

  useEffect(() => {
    if (animateToProjects) {
      const timer = setTimeout(() => {
        setActiveTab('PROJECTS')
      }, 600)
      return () => clearTimeout(timer)
    } else {
      setActiveTab(selected)
    }
  }, [selected, animateToProjects])

  return (
    <div style={{ padding: '0 20px 8px' }}>
      <div
        className="flex overflow-hidden"
        style={{ background: '#0D0D0D', padding: 3, borderRadius: 5 }}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab
          return (
            <div
              key={tab}
              className="flex-1 flex items-center justify-center transition-all duration-300"
              style={{
                padding: '7px 0',
                borderRadius: 5,
                background: isActive ? '#FFFFFF' : 'transparent',
              }}
            >
              <span
                className="font-mohave text-[14px] uppercase tracking-wider transition-colors duration-300"
                style={{
                  color: isActive ? '#0D0D0D' : '#AAAAAA',
                  fontWeight: 400,
                }}
              >
                {tab}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

// Height reserved at top for the floating tooltip (no safe area on web)
// iOS has ~47px safe area that pushes content below the tooltip naturally.
// On web we must add this padding explicitly.
const TOOLTIP_TOP_INSET = 80

export function MockJobBoard({ phase, userProject, onSwipeComplete, onClosedSectionViewed, startDragAnimation, onDragAnimationDone }: MockJobBoardProps) {
  const isDashboardView = DASHBOARD_PHASES.includes(phase)
  const isListView = LIST_PHASES.includes(phase)

  // If neither dashboard nor list phase, default to dashboard
  const viewMode = isListView ? 'list' : 'dashboard'

  return (
    <div className="flex-1 overflow-hidden relative flex flex-col">
      {/* Spacer: push content below the floating tooltip */}
      <div style={{ height: TOOLTIP_TOP_INSET, flexShrink: 0 }} />

      {viewMode === 'dashboard' ? (
        <DashboardView phase={phase} userProject={userProject} startDragAnimation={startDragAnimation} onDragAnimationDone={onDragAnimationDone} />
      ) : (
        <ListView phase={phase} userProject={userProject} onSwipeComplete={onSwipeComplete} onClosedSectionViewed={onClosedSectionViewed} />
      )}
    </div>
  )
}

// =============================================================================
// DASHBOARD VIEW - Horizontal paging columns (like iOS TabView)
// =============================================================================

function DashboardView({
  phase,
  userProject,
  startDragAnimation,
  onDragAnimationDone,
}: {
  phase: TutorialPhase
  userProject: DemoProject | null
  startDragAnimation?: boolean
  onDragAnimationDone?: () => void
}) {
  const columns: StatusColumn[] = ['rfq', 'estimated', 'accepted', 'inProgress', 'completed']
  const [currentPage, setCurrentPage] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartOffset = useRef<number>(0)

  // Drag animation state for dragToAccepted — simulates iOS long-press + drag sequence
  const [dragAnimPhase, setDragAnimPhase] = useState<
    'idle' | 'dragging' | 'sliding' | 'landed'
  >('idle')
  const [arrowLit, setArrowLit] = useState(0) // 0-3 chevrons lit
  const [floatingCardPos, setFloatingCardPos] = useState({ x: 50, y: 50 }) // percentage position
  const [cardLifted, setCardLifted] = useState(false) // card in column dims/lifts
  const [showStatusGlow, setShowStatusGlow] = useState(false) // glow on status badge in accepted

  // Group projects by status
  const getProjectsByStatus = useCallback((): Record<StatusColumn, DemoProject[]> => {
    const groups: Record<StatusColumn, DemoProject[]> = {
      rfq: [],
      estimated: [],
      accepted: [],
      inProgress: [],
      completed: [],
    }

    DEMO_PROJECTS.forEach(p => {
      if (p.status in groups) {
        groups[p.status as StatusColumn].push(p)
      }
    })

    if (userProject) {
      if (phase === 'dragToAccepted') {
        // Before slide: card in estimated. During/after slide: card in accepted.
        if (dragAnimPhase === 'sliding' || dragAnimPhase === 'landed') {
          groups.accepted.unshift(userProject)
        } else {
          groups.estimated.unshift(userProject)
        }
      } else {
        groups.estimated.unshift(userProject)
      }
    }

    return groups
  }, [phase, userProject, dragAnimPhase])

  // Pre-navigate to the "estimated" column during form phases so it's ready
  useEffect(() => {
    if (phase === 'dragToAccepted') {
      const estimatedIdx = columns.indexOf('estimated')
      if (estimatedIdx >= 0) setCurrentPage(estimatedIdx)
    }
    if (phase === 'projectFormComplete' || phase === 'projectFormAddTask') {
      const estimatedIdx = columns.indexOf('estimated')
      if (estimatedIdx >= 0) setCurrentPage(estimatedIdx)
    }
  }, [phase])

  // Drag animation sequence — simulates iOS long-press → drag → drop
  // Phase 1: Card lifts, floating card appears, arrows illuminate as card moves right
  // Phase 2: Card reaches right edge zone, page slides to accepted column
  // Phase 3: Card lands in accepted column — dark overlay + status badge glow
  useEffect(() => {
    if (phase !== 'dragToAccepted' || !userProject) return

    // Wait for startDragAnimation signal (continue button tap)
    if (!startDragAnimation) {
      setDragAnimPhase('idle')
      return
    }

    const timers: NodeJS.Timeout[] = []

    // T+0: Card lifts — iOS: isLongPressing=true, card dims to 0.3, scale 0.95
    setDragAnimPhase('dragging')
    setCardLifted(true)
    setArrowLit(0)
    setFloatingCardPos({ x: 30, y: 40 }) // Start near card position

    // T+200: Start moving — arrows light sequentially, card glides smoothly right
    timers.push(setTimeout(() => {
      setArrowLit(1)
    }, 200))

    // T+500: Card starts moving right in one smooth motion
    timers.push(setTimeout(() => {
      setArrowLit(2)
      setFloatingCardPos({ x: 75, y: 36 }) // Single smooth move to near right edge
    }, 500))

    // T+1000: Third arrow — card at right edge
    timers.push(setTimeout(() => {
      setArrowLit(3)
    }, 1000))

    // T+1800: Card dropped in right zone — slide page to accepted
    timers.push(setTimeout(() => {
      setDragAnimPhase('sliding')
      setCardLifted(false)
      const acceptedIdx = columns.indexOf('accepted')
      if (acceptedIdx >= 0) setCurrentPage(acceptedIdx)
    }, 1800))

    // T+2400: Card landed in accepted column — show dark overlay + status badge glow
    timers.push(setTimeout(() => {
      setDragAnimPhase('landed')
      setShowStatusGlow(true)
    }, 2400))

    // T+3600: Done — advance to next phase
    timers.push(setTimeout(() => {
      onDragAnimationDone?.()
    }, 3600))

    return () => timers.forEach(t => clearTimeout(t))
  }, [phase, userProject, startDragAnimation])

  // Simple swipe handling for page navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartOffset.current = currentPage
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    const threshold = 50
    if (diff < -threshold && currentPage < columns.length - 1) {
      setCurrentPage(prev => prev + 1)
    } else if (diff > threshold && currentPage > 0) {
      setCurrentPage(prev => prev - 1)
    }
    touchStartX.current = null
  }

  const groups = getProjectsByStatus()

  return (
    <>
      {/* App Header */}
      <MockAppHeader />
      {/* Section Selector - DASHBOARD selected */}
      <MockSectionSelector selected="DASHBOARD" />

      {/* Paging container — flex-1 min-h-0 ensures it fills remaining vertical space */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden min-h-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ paddingTop: 4 }}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(-${currentPage * (100 / columns.length)}%)`,
            width: `${columns.length * 100}%`,
          }}
        >
          {columns.map((status) => {
            const colProjects = groups[status]
            const isAcceptedCol = status === 'accepted'
            return (
              <div
                key={status}
                className="relative flex flex-col"
                style={{
                  width: `${100 / columns.length}%`,
                  flexShrink: 0,
                  paddingLeft: 6,
                  paddingRight: 6,
                }}
              >
                {/* Left + right 1px separator borders */}
                <div
                  className="absolute top-0 bottom-0 left-1"
                  style={{ width: 1, background: 'rgba(255,255,255,0.15)' }}
                />
                <div
                  className="absolute top-0 bottom-0 right-1"
                  style={{ width: 1, background: 'rgba(255,255,255,0.15)' }}
                />

                {/* Dark overlay during 'landed' phase — dims all columns EXCEPT user card */}
                {dragAnimPhase === 'landed' && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'rgba(0, 0, 0, 0.6)',
                      zIndex: 1,
                      transition: 'opacity 0.3s ease',
                    }}
                  />
                )}

                {/* Column header matching iOS StatusColumn header */}
                <div className="flex items-center px-3" style={{ gap: 8, paddingTop: 14, paddingBottom: 14, position: 'relative', zIndex: 2 }}>
                  {/* Colored 2px bar */}
                  <div
                    style={{
                      width: 2,
                      height: 12,
                      background: STATUS_COLORS[status],
                      flexShrink: 0,
                    }}
                  />

                  {/* Status name - captionBold, primaryText */}
                  <span
                    className="font-kosugi text-white uppercase tracking-wider"
                    style={{ fontSize: 12, fontWeight: 700 }}
                  >
                    {STATUS_LABELS[status]}
                  </span>

                  {/* Separator line */}
                  <div className="flex-1" style={{ height: 1, background: 'rgba(255,255,255,0.15)' }} />

                  {/* Count in brackets - caption, secondaryText */}
                  <span className="font-kosugi text-ops-text-secondary" style={{ fontSize: 12 }}>
                    [ {colProjects.length} ]
                  </span>
                </div>

                {/* Project cards list */}
                <div
                  className="flex-1 overflow-y-auto px-3 pb-4"
                  style={{ gap: 10, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}
                >
                  {colProjects.map(project => {
                    const isUserCard = userProject && project.id === userProject.id
                    // iOS: when card is lifted (long press), original card dims to 0.3 opacity
                    const isLifted = isUserCard && cardLifted
                    // During landed phase: user card punches through dark overlay, others stay dimmed
                    const isLandedUserCard = isUserCard && dragAnimPhase === 'landed'
                    return (
                      <div
                        key={project.id}
                        style={{
                          opacity: isLifted ? 0.3 : 1,
                          transform: isLifted ? 'scale(0.95)' : 'scale(1)',
                          transition: 'opacity 0.2s ease, transform 0.2s ease, box-shadow 0.3s ease',
                          position: 'relative',
                          zIndex: isLandedUserCard ? 5 : 0, // punch through dark overlay
                          borderRadius: 5,
                          border: isLandedUserCard && showStatusGlow
                            ? '2px solid rgba(157, 181, 130, 0.6)'
                            : undefined,
                          boxShadow: isLandedUserCard && showStatusGlow
                            ? '0 0 12px rgba(157, 181, 130, 0.3), 0 0 24px rgba(157, 181, 130, 0.15)'
                            : undefined,
                          color: isLandedUserCard && showStatusGlow ? '#9DB582' : undefined,
                          animation: isLandedUserCard && showStatusGlow
                            ? 'statusBadgeGlow 1.5s ease-in-out infinite'
                            : undefined,
                        }}
                      >
                        <MockProjectCard
                          project={project}
                          variant="dashboard"
                          isHighlighted={!!isUserCard && phase === 'dragToAccepted' && !cardLifted && dragAnimPhase !== 'landed'}
                          showCardGlow={!!isUserCard && phase === 'dragToAccepted' && !cardLifted && dragAnimPhase !== 'landed'}
                          showStatusGlow={!!isLandedUserCard && showStatusGlow}
                          statusOverride={
                            isUserCard && (dragAnimPhase === 'sliding' || dragAnimPhase === 'landed')
                              ? 'accepted'
                              : undefined
                          }
                        />
                      </div>
                    )
                  })}

                  {colProjects.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-ops-text-tertiary">
                        <path
                          d="M3 7v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M21 7H3l2-4h14l2 4z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="font-kosugi text-ops-text-tertiary" style={{ fontSize: 12 }}>
                        No Projects
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* === iOS-matching drag overlay === */}

        {/* Right edge zone — iOS: 6pt bar + chevron + rotated status name + carousel fade */}
        {phase === 'dragToAccepted' && dragAnimPhase === 'dragging' && (
          <div
            className="absolute top-0 bottom-0 right-0 pointer-events-none flex"
            style={{ zIndex: 10, width: 80 }}
          >
            {/* Carousel fade gradient — iOS: carouselFadeRight, 74pt wide */}
            <div
              style={{
                flex: 1,
                background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.8))',
              }}
            />
            {/* Vertical status bar — iOS: 6pt wide, status color */}
            <div
              style={{
                width: 6,
                background: `${STATUS_COLORS.accepted}${arrowLit >= 3 ? 'FF' : '99'}`,
                transition: 'background 0.2s ease',
              }}
            />
            {/* Chevron + label overlay */}
            <div className="absolute inset-0 flex items-center justify-end" style={{ paddingRight: 12 }}>
              <div className="flex flex-col items-center" style={{ gap: 4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  style={{ color: STATUS_COLORS.accepted, opacity: arrowLit >= 3 ? 1 : 0.6 }}
                >
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span
                  className="font-kosugi uppercase"
                  style={{
                    fontSize: 10,
                    color: STATUS_COLORS.accepted,
                    opacity: arrowLit >= 3 ? 1 : 0.6,
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    letterSpacing: 2,
                  }}
                >
                  Accepted
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Floating card overlay — iOS: DraggingCardOverlay, 256pt wide, scale 0.98, shadow, follows cursor */}
        {phase === 'dragToAccepted' && dragAnimPhase === 'dragging' && userProject && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${floatingCardPos.x}%`,
              top: `${floatingCardPos.y}%`,
              transform: 'translate(-50%, -50%) scale(0.98)',
              transition: 'left 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), top 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
              zIndex: 15,
              width: '75%',
              maxWidth: 280,
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.8))',
            }}
          >
            <MockProjectCard
              project={userProject}
              variant="dashboard"
              isHighlighted={false}
            />
          </div>
        )}

        {/* Center tutorial overlay — iOS: tutorialCenterArrows, 3 chevrons + "DRAG TO ACCEPTED" */}
        {phase === 'dragToAccepted' && dragAnimPhase === 'dragging' && (
          <div
            className="absolute left-0 right-0 flex justify-center pointer-events-none"
            style={{ bottom: 48, zIndex: 12 }}
          >
            <div
              className="flex flex-col items-center"
              style={{
                gap: 10,
                padding: '16px 24px',
                borderRadius: 16,
                background: 'rgba(0, 0, 0, 0.85)',
                boxShadow: '0 0 30px rgba(0, 0, 0, 0.9), 0 0 80px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div className="flex items-center" style={{ gap: 8 }}>
                {[1, 2, 3].map(n => (
                  <svg
                    key={n}
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{
                      opacity: arrowLit >= n ? 1 : 0.2,
                      transform: arrowLit >= n ? 'scale(1.2)' : 'scale(1)',
                      transition: 'opacity 0.15s ease-out, transform 0.15s ease-out',
                      color: '#417394',
                    }}
                  >
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ))}
              </div>
              <span className="font-kosugi font-bold text-[12px] text-[#417394] uppercase tracking-wider">
                Drag to Accepted List
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Page indicator - small rectangles matching iOS (20x2), positioned above tab bar */}
      <div className="flex justify-center" style={{ gap: 6, paddingTop: 8, paddingBottom: 8 }}>
        {columns.map((status, idx) => (
          <div
            key={status}
            style={{
              width: 20,
              height: 2,
              borderRadius: 1,
              background: currentPage === idx ? STATUS_COLORS[status] : 'rgba(255,255,255,0.2)',
              transition: 'background 0.2s ease',
            }}
          />
        ))}
      </div>
    </>
  )
}

// =============================================================================
// CLOSED PROJECTS SHEET — matches iOS ProjectListSheet (JobBoardProjectListView.swift:698-794)
// NavigationView with inline title, search bar, LazyVStack of cards
// =============================================================================

export function ClosedProjectsSheet({
  projects,
  userProjectId,
}: {
  projects: DemoProject[]
  userProjectId?: string
}) {
  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{
        background: '#000000',
        animation: 'sheetSlideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      {/* Spacer for tooltip above */}
      <div style={{ height: 80, flexShrink: 0 }} />

      {/* Header — bodyBold = Mohave-Medium 16pt, centered title */}
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <span
          className="font-mohave font-medium text-white uppercase"
          style={{ fontSize: 16 }}
        >
          CLOSED PROJECTS
        </span>
      </div>

      {/* iOS: Search bar — HStack { search icon, TextField, clear button }
           .background(cardBackgroundDark) .cornerRadius(5) .padding(.horizontal, 16) .padding(.top, 12) */}
      <div style={{ padding: '12px 16px 0' }}>
        <div
          className="flex items-center"
          style={{
            background: '#0D0D0D',
            borderRadius: 5,
            padding: '12px 16px',
            gap: 12,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#AAAAAA', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="font-mohave" style={{ fontSize: 16, fontWeight: 400, color: '#999999' }}>
            Search projects...
          </span>
        </div>
      </div>

      {/* iOS: ScrollView { LazyVStack(spacing: 12) { ForEach ... UniversalJobBoardCard(disableSwipe: true) } }
           .padding(.horizontal, 16) .padding(.vertical, 12) */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '12px 16px 120px' }}>
        <div className="flex flex-col" style={{ gap: 12 }}>
          {projects.map(project => {
            const isUserProject = project.id === userProjectId
            return (
              <div
                key={project.id}
                style={{
                  borderRadius: 5,
                  border: isUserProject ? '2px solid rgba(233, 233, 233, 0.6)' : 'none',
                  boxShadow: isUserProject
                    ? '0 0 12px rgba(233, 233, 233, 0.3), 0 0 24px rgba(233, 233, 233, 0.15)'
                    : 'none',
                  animation: isUserProject ? 'statusBadgeGlow 1.5s ease-in-out infinite' : 'none',
                }}
              >
                <MockProjectCard
                  project={project}
                  variant="list"
                  isHighlighted={false}
                  statusOverride="closed"
                />
              </div>
            )
          })}

          {projects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ color: '#555555' }}>
                <path d="M3 7v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M21 7H3l2-4h14l2 4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-mohave text-[16px]" style={{ color: '#AAAAAA' }}>
                No projects
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// LIST VIEW - Vertical scrollable cards (like iOS project list with swipeable cards)
// =============================================================================

function ListView({
  phase,
  userProject,
  onSwipeComplete,
  onClosedSectionViewed,
}: {
  phase: TutorialPhase
  userProject: DemoProject | null
  onSwipeComplete?: () => void
  onClosedSectionViewed?: () => void
}) {
  const [scrollOffset, setScrollOffset] = useState(0)
  const activeSectionRef = useRef<HTMLDivElement>(null)
  const [measuredScrollTarget, setMeasuredScrollTarget] = useState(0)

  // Status animation for projectListStatusDemo
  const [animatingStatus, setAnimatingStatus] = useState<string | null>(null)
  const [finalStatus, setFinalStatus] = useState<string>('accepted') // preserves last status from demo
  const [cardDimmed, setCardDimmed] = useState(false) // dim/restore sub-animation
  const [showActiveOverlay, setShowActiveOverlay] = useState(false)

  // --- Interactive swipe state ---
  const swipeTouchStartX = useRef<number | null>(null)
  const [userSwipeOffset, setUserSwipeOffset] = useState(0)
  const [swipeDismissed, setSwipeDismissed] = useState(false)
  const [cardFading, setCardFading] = useState(false) // fade-out after snap-back
  const [showConfirmFlash, setShowConfirmFlash] = useState(false) // "CLOSED" confirmation overlay
  const [isTouching, setIsTouching] = useState(false) // track finger down for transition
  const swipeCompleted = useRef(false)

  // Swipe threshold: 40% of card width (iOS: geometry.size.width * 0.4)
  const cardContainerRef = useRef<HTMLDivElement>(null)
  const [cardWidth, setCardWidth] = useState(300)
  const [showLeftSwipeError, setShowLeftSwipeError] = useState(false)
  const SWIPE_THRESHOLD_RATIO = 0.4

  // Build ordered project list
  const getOrderedProjects = useCallback((): {
    active: DemoProject[]
    closed: DemoProject[]
    userStatus: string
  } => {
    const active: DemoProject[] = []
    const closed: DemoProject[] = []
    let userStatus = 'inProgress'

    if (phase === 'projectListStatusDemo') {
      userStatus = animatingStatus || 'accepted'
    } else if (phase === 'projectListSwipe') {
      userStatus = finalStatus // preserve status from status demo (should be 'completed')
    } else if (phase === 'closedProjectsScroll') {
      userStatus = 'closed'
    }

    DEMO_PROJECTS.forEach(p => {
      if (p.status === 'completed' || p.status === 'closed') {
        closed.push(p)
      } else {
        active.push(p)
      }
    })

    if (userProject) {
      const userP = { ...userProject, status: userStatus as DemoProject['status'] }
      // During status demo and swipe, always keep in active list so card doesn't disappear
      if (phase === 'projectListStatusDemo' || phase === 'projectListSwipe') {
        active.unshift(userP)
      } else if (userStatus === 'closed' || userStatus === 'completed') {
        closed.unshift(userP)
      } else {
        active.unshift(userP)
      }
    }

    return { active, closed, userStatus }
  }, [phase, userProject, animatingStatus, finalStatus])

  // Status demo animation: accepted -> inProgress -> completed
  // Per iOS: 0.3s dim to 0.3 opacity → status change → 0.3s restore, 1.8s between starts
  useEffect(() => {
    if (phase !== 'projectListStatusDemo') {
      // When leaving this phase, save the final animating status for subsequent phases
      if (animatingStatus) {
        setFinalStatus(animatingStatus)
      }
      setAnimatingStatus(null)
      setCardDimmed(false)
      return
    }
    if (!userProject) return

    const steps = ['accepted', 'inProgress', 'completed']
    const timers: NodeJS.Timeout[] = []

    // Set initial status immediately (no dim for first)
    setAnimatingStatus(steps[0])
    setFinalStatus(steps[0])
    setCardDimmed(false)

    // Schedule subsequent transitions at 1.8s intervals
    for (let i = 1; i < steps.length; i++) {
      const baseDelay = i * 1800

      // T+0: Start dim (0.3s transition to 0.3 opacity)
      timers.push(setTimeout(() => {
        setCardDimmed(true)
      }, baseDelay))

      // T+300ms: Change status (while dimmed)
      timers.push(setTimeout(() => {
        setAnimatingStatus(steps[i])
        setFinalStatus(steps[i]) // Keep in sync to prevent glitch on phase transition
      }, baseDelay + 300))

      // T+600ms: Restore opacity (0.3s transition back to 1.0)
      timers.push(setTimeout(() => {
        setCardDimmed(false)
      }, baseDelay + 600))
    }

    return () => timers.forEach(t => clearTimeout(t))
  }, [phase, userProject])

  // Measure scroll target: position CLOSED button ~1/3 from bottom of visible area
  // Show some project cards above the button, with button in lower portion of view
  useEffect(() => {
    if (phase === 'closedProjectsScroll' && activeSectionRef.current) {
      const activeHeight = activeSectionRef.current.getBoundingClientRect().height
      // Scroll less than the full active section height so cards remain visible above
      // The CLOSED button sits below the active section, so we want it roughly
      // 1/3 from the bottom of the viewport. Subtract ~200px to keep cards visible.
      const target = Math.max(0, activeHeight - 160)
      setMeasuredScrollTarget(target)
    }
  }, [phase])

  // Dark overlay on active cards + auto-open sheet during closedProjectsScroll
  // Flow: T+0.3s scroll, T+1.2s darken, T+2.0s open sheet
  useEffect(() => {
    if (phase === 'closedProjectsScroll') {
      const timers: NodeJS.Timeout[] = []
      // T+1.2s: darken active cards
      timers.push(setTimeout(() => setShowActiveOverlay(true), 1200))
      // T+2.0s: signal TutorialShell to open closed projects sheet
      timers.push(setTimeout(() => onClosedSectionViewed?.(), 2000))
      return () => timers.forEach(t => clearTimeout(t))
    } else {
      setShowActiveOverlay(false)
    }
  }, [phase])

  // Measure card width for 40% threshold calculation
  useEffect(() => {
    if (phase === 'projectListSwipe' && cardContainerRef.current) {
      setCardWidth(cardContainerRef.current.offsetWidth)
    }
  }, [phase])

  // Haptic feedback helpers (Web Vibration API)
  const triggerHaptic = useCallback((style: 'light' | 'medium' | 'error') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      switch (style) {
        case 'light': navigator.vibrate(10); break
        case 'medium': navigator.vibrate(20); break
        case 'error': navigator.vibrate([15, 50, 15]); break
      }
    }
  }, [])

  const hasTriggeredHaptic = useRef(false)

  // --- Touch handlers for the user's swipeable card ---
  // iOS: DragGesture with 20pt minimum, spring(response:0.25, dampingFraction:0.8)
  const handleCardTouchStart = (e: React.TouchEvent) => {
    if (swipeDismissed || swipeCompleted.current) return
    swipeTouchStartX.current = e.touches[0].clientX
    hasTriggeredHaptic.current = false
    setIsTouching(true)
  }

  const handleCardTouchMove = (e: React.TouchEvent) => {
    if (swipeTouchStartX.current === null || swipeDismissed) return
    const diff = e.touches[0].clientX - swipeTouchStartX.current

    if (diff > 0) {
      // Right swipe allowed — follow finger directly
      setUserSwipeOffset(diff)
      setShowLeftSwipeError(false)

      // Haptic at 40% threshold (once per swipe)
      const threshold = cardWidth * SWIPE_THRESHOLD_RATIO
      if (diff >= threshold && !hasTriggeredHaptic.current) {
        hasTriggeredHaptic.current = true
        triggerHaptic('medium')
      }
    } else {
      // LEFT SWIPE BLOCKED in tutorial (iOS: TutorialSwipeGestureBlocked)
      setUserSwipeOffset(diff * 0.15) // minimal resistance
      if (Math.abs(diff) > 30 && !showLeftSwipeError) {
        setShowLeftSwipeError(true)
        triggerHaptic('error')
        setTimeout(() => setShowLeftSwipeError(false), 2000)
      }
    }
  }

  const handleCardTouchEnd = () => {
    if (swipeTouchStartX.current === null || swipeDismissed) return
    swipeTouchStartX.current = null
    setIsTouching(false)

    const threshold = cardWidth * SWIPE_THRESHOLD_RATIO

    if (userSwipeOffset >= threshold) {
      // iOS exact sequence:
      // 1. confirmingStatus set, isChangingStatus=true
      // 2. swipeOffset snaps to 0 with spring(0.2, 0.85) — card content opacity → 0
      // 3. RevealedStatusCard shows at full opacity (status color bg 0.1 + stroke)
      // 4. After 0.05s: performStatusChange
      // 5. After another 0.05s: isChangingStatus=false with spring(0.2, 0.85)
      swipeCompleted.current = true
      setSwipeDismissed(true)
      setUserSwipeOffset(0) // Snap back to center — spring animation via CSS
      setShowConfirmFlash(true) // Show RevealedStatusCard confirmation

      // T+200ms: Card content already faded via CSS transition
      // T+300ms: Start fading out the confirmation
      setTimeout(() => {
        setShowConfirmFlash(false)
        setCardFading(true)
      }, 300)

      // Advance tutorial
      setTimeout(() => {
        onSwipeComplete?.()
      }, 700)
    } else {
      // Below threshold: spring snap back
      setUserSwipeOffset(0)
    }
  }

  // Scroll animation for closedProjectsScroll phase
  // iOS: 0.3s delay, 0.8s easeInOut scroll — use CSS transition instead of rAF
  const [scrollActive, setScrollActive] = useState(false)

  useEffect(() => {
    if (phase !== 'closedProjectsScroll') {
      setScrollOffset(0)
      setScrollActive(false)
      return
    }

    if (measuredScrollTarget === 0) return

    // Set the target offset and activate scroll via CSS transition after delay
    const timeout = setTimeout(() => {
      setScrollOffset(measuredScrollTarget)
      setScrollActive(true)
    }, 300) // 0.3s delay before scroll starts

    return () => clearTimeout(timeout)
  }, [phase, measuredScrollTarget])

  const { active, closed, userStatus } = getOrderedProjects()

  // Calculate the visual offset for the user card
  const getUserCardOffset = () => {
    if (swipeDismissed) return userSwipeOffset
    if (userSwipeOffset !== 0) return userSwipeOffset
    return 0
  }

  const cardOffset = getUserCardOffset()
  // Swipe progress for visual feedback (0 to 1) — reaches 1.0 at 40% card width
  const swipeThreshold = cardWidth * SWIPE_THRESHOLD_RATIO
  const swipeProgress = Math.min(Math.max(cardOffset, 0) / swipeThreshold, 1)

  return (
    <>
      {/* App Header — solid bg + z-index so cards scroll behind it */}
      <div className="relative" style={{ zIndex: 2, background: '#000000' }}>
        <MockAppHeader />
        {/* Section selector: starts on DASHBOARD, animates to PROJECTS per iOS */}
        <MockSectionSelector
          selected="DASHBOARD"
          animateToProjects={true}
        />
      </div>

      {/* Scrollable project list — LazyVStack with 12pt spacing, matching iOS */}
      <div
        className="flex-1 overflow-hidden relative"
        style={{ zIndex: 1 }}
      >
        <div
          style={{
            transform: `translateY(-${scrollOffset}px)`,
            transition: scrollActive ? 'transform 0.8s cubic-bezier(0.42, 0, 0.58, 1)' : 'none',
            paddingTop: 12,
            paddingBottom: 120,
          }}
        >
        {/* Active projects — no section header, just cards with 12pt spacing */}
        <div ref={activeSectionRef} style={{
          opacity: showActiveOverlay ? 0.3 : 1,
          transition: 'opacity 0.3s ease-in-out',
          padding: '0 20px',
        }}>
          <div className="flex flex-col" style={{ gap: 12 }}>
            {active.map(project => {
              const isUserCard = userProject && project.id === userProject.id

              if (isUserCard && phase === 'projectListStatusDemo') {
                return (
                  <div
                    key={project.id}
                    style={{
                      opacity: cardDimmed ? 0.3 : 1,
                      transition: 'opacity 0.3s ease-in-out',
                    }}
                  >
                    <MockProjectCard
                      project={project}
                      variant="list"
                      isHighlighted={true}
                      statusOverride={animatingStatus || userStatus}
                    />
                  </div>
                )
              }

              if (isUserCard && phase === 'projectListSwipe') {
                // iOS RevealedStatusCard: status color bg at 0.1, 1px status color border, status label
                const closedColor = '#E9E9E9' // iOS Status.closed.color
                return (
                  <div
                    key={project.id}
                    ref={cardContainerRef}
                    className="relative overflow-hidden"
                    style={{ borderRadius: 5 }}
                  >
                    {/* RevealedStatusCard — appears behind the swiped card (right swipe → label on left) */}
                    <div
                      className="absolute inset-0 flex items-center rounded-[5px]"
                      style={{
                        background: `rgba(233, 233, 233, ${swipeProgress * 0.1})`,
                        border: `1px solid rgba(233, 233, 233, ${swipeProgress})`,
                        paddingLeft: 20,
                        opacity: swipeProgress,
                        transition: swipeDismissed ? 'opacity 0.3s ease-out' : 'none',
                      }}
                    >
                      <span
                        className="font-mohave font-medium uppercase"
                        style={{ fontSize: 16, color: closedColor }}
                      >
                        CLOSED
                      </span>
                    </div>

                    {/* Left-swipe error hint — red border flash + "SWIPE RIGHT" text */}
                    {showLeftSwipeError && (
                      <div
                        className="absolute inset-0 flex items-center justify-center rounded-[5px]"
                        style={{
                          border: '1px solid rgba(255, 77, 77, 0.6)',
                          background: 'rgba(255, 77, 77, 0.05)',
                          zIndex: 5,
                          animation: 'leftSwipeError 0.3s ease-out',
                        }}
                      >
                        <span
                          className="font-mohave font-bold uppercase tracking-wider"
                          style={{ fontSize: 14, color: 'rgba(255, 77, 77, 0.8)' }}
                        >
                          Swipe Right →
                        </span>
                      </div>
                    )}

                    {/* Swipeable card */}
                    <div
                      onTouchStart={handleCardTouchStart}
                      onTouchMove={handleCardTouchMove}
                      onTouchEnd={handleCardTouchEnd}
                      style={{
                        transform: `translateX(${cardOffset}px)`,
                        opacity: cardFading ? 0 : 1,
                        transition: isTouching
                          ? 'none'
                          : cardFading
                            ? 'opacity 0.4s ease-out'
                            : 'transform 0.25s cubic-bezier(0.2, 0.85, 0.2, 1)',
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      {/* iOS RevealedStatusCard — status color bg(0.1) + stroke(1px) + status text */}
                      {showConfirmFlash && (
                        <div
                          className="absolute inset-0 flex items-center rounded-[5px]"
                          style={{
                            background: 'rgba(233, 233, 233, 0.1)',
                            border: '1px solid #E9E9E9',
                            zIndex: 5,
                            paddingLeft: 20,
                          }}
                        >
                          <span
                            className="font-mohave font-bold uppercase"
                            style={{ fontSize: 16, color: '#E9E9E9' }}
                          >
                            CLOSED
                          </span>
                        </div>
                      )}
                      {/* iOS: card content opacity → 0 when isChangingStatus, spring(0.2, 0.85) */}
                      <div style={{
                        opacity: showConfirmFlash ? 0 : 1,
                        transition: 'opacity 0.2s cubic-bezier(0.2, 0.85, 0.4, 1)',
                      }}>
                        <MockProjectCard
                          project={project}
                          variant="list"
                          isHighlighted={!swipeDismissed}
                          showShimmer={!swipeDismissed}
                          highlightColor="#417394"
                          statusOverride={userStatus}
                        />
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div key={project.id} style={{
                  opacity: (phase === 'projectListStatusDemo' || phase === 'projectListSwipe') ? 0.3 : 1,
                  transition: 'opacity 0.3s ease',
                }}>
                  <MockProjectCard
                    project={project}
                    variant="list"
                    isHighlighted={false}
                    statusOverride={undefined}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Section buttons at bottom — matching iOS SectionButton pattern */}
        {/* HStack(spacing: 12) with CLOSED and ARCHIVED buttons */}
        <div className="flex px-5" style={{ gap: 12, paddingTop: 8 }}>
          {/* CLOSED section button — highlighted with pulsing border during closedProjectsScroll */}
          {closed.length > 0 && (
            <div
              className="flex items-center flex-1 relative"
              style={{
                gap: 8,
                padding: '12px 16px',
                background: '#0D0D0D',
                borderRadius: 5,
                border: phase === 'closedProjectsScroll'
                  ? '2px solid rgba(65, 115, 148, 0.8)'
                  : '1px solid rgba(255,255,255,0.08)',
                boxShadow: phase === 'closedProjectsScroll'
                  ? '0 0 16px rgba(65, 115, 148, 0.25)'
                  : 'none',
                transition: 'border 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              {/* Status color circle */}
              <div style={{ width: 8, height: 8, borderRadius: 4, background: '#E9E9E9', flexShrink: 0 }} />
              {/* Label — captionBold */}
              <span className="font-kosugi text-[14px] font-bold text-ops-text-secondary uppercase">
                Closed
              </span>
              {/* Count — caption */}
              <span className="font-kosugi text-[14px] text-ops-text-tertiary">
                ({closed.length})
              </span>
              <div className="flex-1" />
              {/* Chevron */}
              <svg width="10" height="10" viewBox="0 0 8 12" fill="none" style={{ color: '#777777' }}>
                <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Touch cursor removed per user request — scroll animation is sufficient */}

    </>
  )
}

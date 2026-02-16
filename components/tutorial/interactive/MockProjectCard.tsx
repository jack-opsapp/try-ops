'use client'

import type { DemoProject } from '@/lib/constants/demo-data'

// Status color mapping matching iOS Status.color (from xcassets)
const STATUS_COLORS: Record<string, string> = {
  rfq: '#BCBCBC',
  estimated: '#B5A381',
  accepted: '#9DB582',
  inProgress: '#8195B5',
  completed: '#B58289',
  closed: '#E9E9E9',
  archived: '#A182B5',
}

// Status display names matching iOS Status.displayName
const STATUS_LABELS: Record<string, string> = {
  rfq: 'RFQ',
  estimated: 'ESTIMATED',
  accepted: 'ACCEPTED',
  inProgress: 'IN PROGRESS',
  completed: 'COMPLETED',
  closed: 'CLOSED',
  archived: 'ARCHIVED',
}

interface MockProjectCardProps {
  project: DemoProject
  variant: 'dashboard' | 'list'
  isHighlighted?: boolean
  showShimmer?: boolean
  showStatusGlow?: boolean
  showCardGlow?: boolean // animated glow border around entire card
  highlightColor?: string // override color for shimmer/highlight border
  statusOverride?: string
  className?: string
  style?: React.CSSProperties
}

export function MockProjectCard({
  project,
  variant,
  isHighlighted = false,
  showShimmer = false,
  showStatusGlow = false,
  showCardGlow = false,
  highlightColor,
  statusOverride,
  className = '',
  style,
}: MockProjectCardProps) {
  const effectiveStatus = statusOverride || project.status
  const statusColor = STATUS_COLORS[effectiveStatus] || '#417394'
  const effectiveHighlightColor = highlightColor || statusColor

  if (variant === 'dashboard') {
    return (
      <DashboardCard
        project={project}
        statusColor={statusColor}
        effectiveStatus={effectiveStatus}
        isHighlighted={isHighlighted}
        showStatusGlow={showStatusGlow}
        showCardGlow={showCardGlow}
        className={className}
        style={style}
      />
    )
  }

  return (
    <ListCard
      project={project}
      effectiveStatus={effectiveStatus}
      statusColor={statusColor}
      highlightColor={effectiveHighlightColor}
      isHighlighted={isHighlighted}
      showShimmer={showShimmer}
      className={className}
      style={style}
    />
  )
}

// --- Dashboard variant (DirectionalDragCard from iOS) ---
// Used inside status columns in the paging dashboard view
function DashboardCard({
  project,
  statusColor,
  effectiveStatus,
  isHighlighted,
  showStatusGlow,
  showCardGlow,
  className,
  style,
}: {
  project: DemoProject
  statusColor: string
  effectiveStatus: string
  isHighlighted: boolean
  showStatusGlow: boolean
  showCardGlow?: boolean
  className: string
  style?: React.CSSProperties
}) {
  // Generate mock metadata for display
  const teamCount = project.crew ? 1 : 0
  const taskCount = 1
  const mockDate = 'Feb 12'
  const statusLabel = STATUS_LABELS[effectiveStatus] || effectiveStatus.toUpperCase()

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        background: '#0D0D0D',
        borderRadius: 5,
        border: (isHighlighted || showCardGlow)
          ? `2px solid ${statusColor}99`
          : '1px solid rgba(255,255,255,0.08)',
        boxShadow: showCardGlow
          ? `0 0 12px ${statusColor}4D, 0 0 24px ${statusColor}26`
          : isHighlighted
            ? `0 0 16px ${statusColor}40`
            : 'none',
        animation: showCardGlow ? 'statusBadgeGlow 1.5s ease-in-out infinite' : 'none',
        color: showCardGlow ? statusColor : undefined,
        ...style,
      }}
    >
      <div className="flex h-full">
        {/* Left status bar - 4px wide, rounded on left to match card border */}
        <div
          className="flex-shrink-0"
          style={{ width: 4, background: statusColor, borderRadius: '3px 0 0 3px' }}
        />

        {/* Content area */}
        <div className="flex-1 flex" style={{ padding: 12 }}>
          {/* Left content */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            {/* Project title — iOS: bodyBold = Mohave-Medium 16pt, white, lineLimit 2 */}
            <p
              className="font-mohave font-medium text-white leading-tight"
              style={{
                fontSize: 16,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {project.name}
            </p>

            {/* Client name — iOS: caption = Kosugi-Regular 14pt, secondaryText (#AAAAAA), lineLimit 1 */}
            <p
              className="font-kosugi truncate"
              style={{ fontSize: 14, marginTop: 4, color: '#AAAAAA' }}
            >
              {project.clientName}
            </p>

            {/* Left metadata: calendar + date — iOS: smallCaption = Kosugi 12pt, tertiaryText */}
            <div className="flex items-center mt-2" style={{ gap: 4 }}>
              <svg
                width="11"
                height="11"
                viewBox="0 0 16 16"
                fill="none"
                style={{ color: '#777777', flexShrink: 0 }}
              >
                <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <line x1="2" y1="6.5" x2="14" y2="6.5" stroke="currentColor" strokeWidth="1.5" />
                <line x1="5.5" y1="1.5" x2="5.5" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="10.5" y1="1.5" x2="10.5" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="font-kosugi" style={{ fontSize: 12, color: '#777777' }}>
                {mockDate}
              </span>
            </div>
          </div>

          {/* Right metadata column */}
          <div className="flex flex-col items-end justify-between ml-2 flex-shrink-0" style={{ gap: 2 }}>
            {/* Status badge — iOS: smallCaption = Kosugi 12pt, with optional pulsing glow */}
            <span
              className="font-kosugi uppercase whitespace-nowrap"
              style={{
                fontSize: 12,
                lineHeight: 1,
                color: statusColor,
                padding: '4px 8px',
                borderRadius: 4,
                background: `${statusColor}1A`,
                border: `1px solid ${statusColor}`,
                boxShadow: showStatusGlow
                  ? `0 0 8px ${statusColor}, 0 0 16px ${statusColor}80, 0 0 24px ${statusColor}40`
                  : 'none',
                animation: showStatusGlow ? 'statusBadgeGlow 1.5s ease-in-out infinite' : 'none',
                transition: 'box-shadow 0.3s ease',
              }}
            >
              {statusLabel}
            </span>

            {/* Task count — iOS: smallCaption = Kosugi 12pt */}
            <div className="flex items-center" style={{ gap: 4 }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ color: '#777777' }}>
                <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
                <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-kosugi" style={{ fontSize: 12, color: '#777777' }}>
                {taskCount}
              </span>
            </div>

            <div className="flex-1" />

            {/* Duration — iOS: smallCaption = Kosugi 12pt */}
            <div className="flex items-center" style={{ gap: 4 }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ color: '#777777' }}>
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
                <path d="M8 4.5V8l2.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <span className="font-kosugi" style={{ fontSize: 12, color: '#777777' }}>
                1d
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- List variant (UniversalJobBoardCard from iOS) ---
// Matches projectCardContent in UniversalJobBoardCard.swift:387-501
// Layout: HStack(spacing:0) { VStack { title/subtitle(spacing:4), metadataRow } } + badge overlay
// Background: cardBackgroundDark (#1F293D), NO left status bar, padding 14
function ListCard({
  project,
  effectiveStatus,
  statusColor,
  highlightColor,
  isHighlighted,
  showShimmer,
  className,
  style,
}: {
  project: DemoProject
  effectiveStatus: string
  statusColor: string
  highlightColor: string
  isHighlighted: boolean
  showShimmer: boolean
  className: string
  style?: React.CSSProperties
}) {
  const teamCount = project.crew ? 1 : 0
  const taskCount = 1
  const mockAddress = '123 Miramar Rd'
  const mockDate = 'Feb 12'
  const statusLabel = STATUS_LABELS[effectiveStatus] || effectiveStatus.toUpperCase()

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        height: 80,
        background: '#0D0D0D',
        borderRadius: 5,
        border: showShimmer
          ? `2px solid ${highlightColor}`
          : isHighlighted
            ? `2px solid ${highlightColor}CC`
            : '1px solid rgba(255,255,255,0.2)', // iOS: cardBorder
        boxShadow: isHighlighted
          ? `0 0 16px ${highlightColor}40`
          : 'none',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Shimmer overlay - sweeping blue gradient */}
      {showShimmer && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: 80,
              background: `linear-gradient(to right, transparent, ${highlightColor}26, ${highlightColor}40, ${highlightColor}26, transparent)`,
              animation: 'cardShimmer 1.5s linear infinite',
            }}
          />
        </div>
      )}
      {/* iOS: HStack(spacing: 0) — NO left status bar */}
      <div className="flex h-full" style={{ position: 'relative', zIndex: 2 }}>
        {/* iOS: VStack(alignment: .leading, spacing: 8) { title/subtitle block, metadataRow }
             .frame(maxHeight: .infinity, alignment: .bottom) .padding(14) */}
        <div className="flex-1 flex flex-col justify-end min-w-0" style={{ padding: 14 }}>
          {/* iOS: VStack(alignment: .leading, spacing: 4) { titleText, subtitleText } */}
          <div className="flex flex-col" style={{ gap: 2 }}>
            {/* iOS: titleText — bodyBold = Mohave-Medium 16pt, primaryText (white), lineLimit 1 */}
            <p
              className="font-mohave font-medium text-white truncate"
              style={{ fontSize: 16, lineHeight: 1 }}
            >
              {project.name}
            </p>

            {/* iOS: subtitleText — caption = Kosugi-Regular 14pt, secondaryText (#AAAAAA), lineLimit 1 */}
            <p
              className="font-kosugi truncate"
              style={{ fontSize: 14, lineHeight: 1.1, color: '#AAAAAA' }}
            >
              {project.clientName}
            </p>
          </div>

          {/* iOS: metadataRow — HStack(spacing: 12), icons .system(size: 11), text smallCaption = Kosugi 12pt, tertiaryText (#777777) */}
          <div className="flex items-center" style={{ gap: 12, marginTop: 4, height: 14 }}>
            {/* Location */}
            <div className="flex items-center min-w-0" style={{ gap: 4, maxWidth: '35%' }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ color: '#777777', flexShrink: 0 }}>
                <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1.3" />
                <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              <span className="font-kosugi truncate" style={{ fontSize: 12, color: '#777777' }}>
                {mockAddress}
              </span>
            </div>

            {/* Calendar + date */}
            <div className="flex items-center flex-shrink-0" style={{ gap: 4 }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ color: '#777777' }}>
                <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                <line x1="2" y1="6.5" x2="14" y2="6.5" stroke="currentColor" strokeWidth="1.3" />
                <line x1="5.5" y1="1.5" x2="5.5" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <line x1="10.5" y1="1.5" x2="10.5" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <span className="font-kosugi" style={{ fontSize: 12, color: '#777777' }}>
                {mockDate}
              </span>
            </div>

            {/* Person count */}
            <div className="flex items-center flex-shrink-0" style={{ gap: 4 }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ color: '#777777' }}>
                <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M1.5 13.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <circle cx="11" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.3" />
                <path d="M11 9.5c2 0 3.5 1.2 3.5 3.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <span className="font-kosugi" style={{ fontSize: 12, color: '#777777' }}>
                {teamCount}
              </span>
            </div>
          </div>
        </div>

        {/* iOS: Badge overlay — VStack(alignment: .trailing, spacing: 0) .padding(8) */}
        <div className="flex flex-col items-end justify-between flex-shrink-0" style={{ padding: 8, minWidth: 80 }}>
          {/* iOS: Status badge — smallCaption = Kosugi 12pt, status color, padding 8h 4v,
               fill status.color.opacity(0.1), stroke status.color 1px, cornerRadius 4 */}
          <span
            className="font-kosugi uppercase whitespace-nowrap"
            style={{
              fontSize: 12,
              lineHeight: 1,
              color: statusColor,
              padding: '4px 8px',
              borderRadius: 4,
              background: `${statusColor}1A`,
              border: `1px solid ${statusColor}`,
              transition: 'color 0.3s ease, background 0.3s ease, border-color 0.3s ease',
            }}
          >
            {statusLabel}
          </span>

          {/* iOS: Task count badge — smallCaption, schedulingBadgeColor, cardBackground fill */}
          <span
            className="font-kosugi uppercase whitespace-nowrap"
            style={{
              fontSize: 12,
              lineHeight: 1,
              color: '#AAAAAA',
              padding: '4px 8px',
              borderRadius: 4,
              background: '#0D0D0D',
              border: '1px solid rgba(170,170,170,0.3)',
            }}
          >
            {taskCount} {taskCount === 1 ? 'TASK' : 'TASKS'}
          </span>

          {/* Bottom spacer (iOS: Color.clear.frame(height: 0)) */}
          <div style={{ height: 0 }} />
        </div>
      </div>
    </div>
  )
}

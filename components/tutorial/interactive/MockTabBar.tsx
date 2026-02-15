'use client'

interface MockTabBarProps {
  activeTab: 'home' | 'jobs' | 'schedule' | 'settings'
}

const ACCENT = '#59779F' // tutorial accent (muted blue)
const INACTIVE = 'rgba(170, 170, 170, 0.8)'

const TAB_LABELS: Record<string, string> = {
  home: 'Home',
  jobs: 'Jobs',
  schedule: 'Schedule',
  settings: 'Settings',
}

export function MockTabBar({ activeTab }: MockTabBarProps) {
  const tabs = [
    { id: 'home' as const, icon: HomeIconFilled },
    { id: 'jobs' as const, icon: BriefcaseIconFilled },
    { id: 'schedule' as const, icon: CalendarIconFilled },
    { id: 'settings' as const, icon: GearIconFilled },
  ]

  return (
    <div
      className="flex items-end justify-around relative"
      style={{
        height: 83,
        background: 'rgba(13, 13, 13, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingBottom: 20,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <div key={tab.id} className="flex flex-col items-center flex-1" style={{ paddingTop: 10, gap: 4 }}>
            {/* Active indicator bar — 28px wide, 3px tall, orange */}
            <div
              style={{
                width: 28,
                height: 3,
                borderRadius: 1.5,
                background: isActive ? ACCENT : 'transparent',
                marginBottom: 4,
                transition: 'background 0.2s ease',
              }}
            />
            <tab.icon active={isActive} />
            {/* Tab label — iOS: smallCaption = Kosugi 12pt */}
            <span
              className="font-kosugi"
              style={{
                fontSize: 10,
                color: isActive ? ACCENT : INACTIVE,
                transition: 'color 0.2s ease',
              }}
            >
              {TAB_LABELS[tab.id]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// Filled icon variants matching iOS SF Symbols

function HomeIconFilled({ active }: { active: boolean }) {
  const c = active ? ACCENT : INACTIVE
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" style={{ color: c }}>
      <path d="M3 12.5l9-9 9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M5 11v8a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-8" fill="currentColor" opacity="0.9" />
    </svg>
  )
}

function BriefcaseIconFilled({ active }: { active: boolean }) {
  const c = active ? ACCENT : INACTIVE
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" style={{ color: c }}>
      <rect x="2" y="7" width="20" height="13" rx="2" fill="currentColor" opacity="0.9" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

function CalendarIconFilled({ active }: { active: boolean }) {
  const c = active ? ACCENT : INACTIVE
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" style={{ color: c }}>
      <rect x="3" y="4" width="18" height="18" rx="2" fill="currentColor" opacity="0.9" />
      <path d="M3 10h18" stroke="#000" strokeWidth="1.5" opacity="0.3" />
      <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function GearIconFilled({ active }: { active: boolean }) {
  const c = active ? ACCENT : INACTIVE
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" style={{ color: c }}>
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" fill="currentColor" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        fill="currentColor" opacity="0.9" />
    </svg>
  )
}

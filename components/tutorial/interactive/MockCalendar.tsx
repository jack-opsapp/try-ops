'use client'

import { useMemo, useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import type { TutorialPhase } from '@/lib/tutorial/TutorialPhase'

interface MockCalendarProps {
  phase: TutorialPhase
  viewMode: 'week' | 'month'
  onToggleMonth: () => void
  userProject?: {
    name: string
    clientName: string
    taskType: string
    taskTypeColor: string
    date: string
  }
}

// Task colors used for mock schedule events
const TASK_COLORS = [
  '#5A7BD4', // Coating (blue)
  '#B088D4', // Paving (purple)
  '#D47B9F', // Installation (pink)
  '#8EC8E8', // Sealing (light blue)
  '#5AC8D4', // Diagnostic (teal)
  '#A5D4A0', // Cleaning (green)
  '#E8945A', // Demolition (orange)
]

export function MockCalendar({ phase, viewMode, onToggleMonth, userProject }: MockCalendarProps) {
  const today = useMemo(() => new Date(), [])
  const isMonthView = viewMode === 'month'
  const isMonthPrompt = phase === 'calendarMonthPrompt'

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

  // =========================================================================
  // WEEK DATA
  // =========================================================================

  // Week offset for swipe navigation
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDayIndex, setSelectedDayIndex] = useState(-1) // -1 = today

  // Build the current week (Monday-Sunday) based on offset
  const weekDays = useMemo(() => {
    const days: Date[] = []
    const current = new Date(today)
    const dayOfWeek = current.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    current.setDate(current.getDate() + mondayOffset + weekOffset * 7)
    for (let i = 0; i < 7; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return days
  }, [today, weekOffset])

  // Day abbreviations (Mon-Sun) — two-letter matching iOS
  const dayAbbreviations = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  // Find today's index in current week
  const todayIndex = useMemo(() => {
    return weekDays.findIndex(d =>
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    )
  }, [weekDays, today])

  // The actually selected day
  const activeDayIndex = selectedDayIndex >= 0 ? selectedDayIndex : (todayIndex >= 0 ? todayIndex : 0)
  const activeDay = weekDays[activeDayIndex] || today

  // Week range label (e.g., "Feb 3-9")
  const weekRangeLabel = useMemo(() => {
    const start = weekDays[0]
    const end = weekDays[6]
    if (!start || !end) return ''
    const startMonth = monthNames[start.getMonth()].slice(0, 3)
    const endMonth = monthNames[end.getMonth()].slice(0, 3)
    if (start.getMonth() === end.getMonth()) {
      return `${startMonth} ${start.getDate()}-${end.getDate()}`
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`
  }, [weekDays])

  // =========================================================================
  // MONTH DATA
  // =========================================================================

  const monthData = useMemo(() => {
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDay = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    let startDay = firstDay.getDay() - 1
    if (startDay < 0) startDay = 6
    return { year, month, daysInMonth, startDay }
  }, [today])

  // (multiMonthData removed — single month view now used)

  // =========================================================================
  // EVENT DATA (deterministic based on day)
  // =========================================================================

  // Get events for a given day number (pseudo-random, seeded)
  const getEventsForDay = useCallback((dayNum: number): { color: string; isNew: boolean }[] => {
    const events: { color: string; isNew: boolean }[] = []
    if (dayNum % 2 === 0) events.push({ color: TASK_COLORS[dayNum % TASK_COLORS.length], isNew: false })
    if (dayNum % 3 === 0) events.push({ color: TASK_COLORS[(dayNum + 2) % TASK_COLORS.length], isNew: true })
    if (dayNum % 7 === 0) events.push({ color: TASK_COLORS[(dayNum + 4) % TASK_COLORS.length], isNew: false })
    return events
  }, [])

  // Get event counts for a week day (for badges)
  const getWeekDayEvents = useCallback((dayIndex: number): { newCount: number; ongoingCount: number; colors: string[] } => {
    const dayDate = weekDays[dayIndex]
    if (!dayDate) return { newCount: 0, ongoingCount: 0, colors: [] }
    const dayNum = dayDate.getDate()
    const events = getEventsForDay(dayNum)
    const colors = events.map(e => e.color)

    // Add user project on today
    const isToday = dayDate.getDate() === today.getDate() && dayDate.getMonth() === today.getMonth()
    if (userProject && isToday) {
      colors.unshift(userProject.taskTypeColor)
      events.unshift({ color: userProject.taskTypeColor, isNew: true })
    }

    const newCount = events.filter(e => e.isNew).length
    const ongoingCount = events.filter(e => !e.isNew).length

    return { newCount, ongoingCount, colors }
  }, [weekDays, today, userProject, getEventsForDay])

  // Mock scheduled items for selected day
  const dayScheduleItems = useMemo(() => {
    const items: { time: string; name: string; clientName: string; taskType: string; color: string; address?: string }[] = []

    const isToday = activeDay.getDate() === today.getDate() && activeDay.getMonth() === today.getMonth()

    if (userProject && isToday) {
      items.push({
        time: '8:00 AM',
        name: userProject.name,
        clientName: userProject.clientName,
        taskType: userProject.taskType,
        color: userProject.taskTypeColor,
        address: '1234 Miramar Way, San Diego',
      })
    }

    if (isToday) {
      items.push(
        { time: '9:30 AM', name: 'Flight Deck Coating', clientName: 'Miramar Flight Academy', taskType: 'Coating', color: '#5A7BD4', address: '800 Fighter Town Rd' },
        { time: '1:00 PM', name: "O'Club Patio Resurface", clientName: "O'Club Bar & Grill", taskType: 'Paving', color: '#B088D4', address: '2115 North Ave' },
      )
    } else {
      // Show some items on other days based on day number
      const dayNum = activeDay.getDate()
      const events = getEventsForDay(dayNum)
      const demoNames = [
        { name: 'Hangar Siding Repair', client: 'Fightertown Hangars LLC', type: 'Installation', addr: '900 Hangar Blvd' },
        { name: 'Runway Crack Repair', client: 'Miramar Flight Academy', type: 'Diagnostic', addr: '800 Fighter Town Rd' },
        { name: 'Briefing Room Install', client: 'Miramar Flight Academy', type: 'Installation', addr: '810 Fighter Town Rd' },
      ]
      events.forEach((ev, i) => {
        const demo = demoNames[i % demoNames.length]
        items.push({
          time: `${9 + i * 2}:00 AM`,
          name: demo.name,
          clientName: demo.client,
          taskType: demo.type,
          color: ev.color,
          address: demo.addr,
        })
      })
    }

    return items
  }, [activeDay, today, userProject, getEventsForDay])

  // Month grid expansion: maps to iOS cellHeight levels
  // Level 0 = 80px (iOS <120 = Level 1: compact bars, 0.5 opacity, no text)
  // Level 1 = 120px (iOS 120-180 = Level 2: bars with title, 0.2 opacity)
  // Level 2 = 180px (iOS >=180 = Level 3: tall single-day, multi-day bars with title)
  const [expansionLevel, setExpansionLevel] = useState(1) // start at Level 2 like iOS default (cellHeight=120)

  // =========================================================================
  // MONTH EVENT DATA — week-span based layout matching iOS MonthGridView
  // =========================================================================

  interface MonthEvent {
    id: string
    title: string
    color: string
    startDay: number // 1-indexed day of month
    endDay: number   // 1-indexed day of month (same for single-day)
    taskType?: string
  }

  // Generate deterministic events for the current month using demo data
  const monthEvents = useMemo((): MonthEvent[] => {
    const events: MonthEvent[] = []
    const daysInMonth = monthData.daysInMonth
    const todayDay = today.getDate()

    // Multi-day events (spanning across days)
    events.push(
      { id: 'me-1', title: 'Flight Deck Coating', color: '#5A7BD4', startDay: Math.max(1, todayDay - 2), endDay: Math.min(daysInMonth, todayDay + 1), taskType: 'Coating' },
      { id: 'me-2', title: "O'Club Patio Resurface", color: '#B088D4', startDay: Math.max(1, todayDay - 1), endDay: Math.min(daysInMonth, todayDay + 3), taskType: 'Paving' },
      { id: 'me-3', title: 'Hangar Siding Repair', color: '#D47B9F', startDay: Math.min(daysInMonth - 4, 8), endDay: Math.min(daysInMonth - 1, 11), taskType: 'Installation' },
      { id: 'me-4', title: 'Runway Crack Repair', color: '#5AC8D4', startDay: Math.min(daysInMonth - 2, 15), endDay: Math.min(daysInMonth, 18), taskType: 'Diagnostic' },
      { id: 'me-5', title: "Charlie's Driveway", color: '#8EC8E8', startDay: Math.min(daysInMonth - 1, 22), endDay: Math.min(daysInMonth, 24), taskType: 'Sealing' },
    )

    // Single-day events scattered throughout the month
    events.push(
      { id: 'se-1', title: 'MIG Detailing', color: '#A5D4A0', startDay: 3, endDay: 3, taskType: 'Cleaning' },
      { id: 'se-2', title: 'Locker Room Reno', color: '#E8945A', startDay: 7, endDay: 7, taskType: 'Demolition' },
      { id: 'se-3', title: 'Pressure Wash Bay', color: '#D4C95A', startDay: 12, endDay: 12, taskType: 'Pressure Wash' },
      { id: 'se-4', title: 'Briefing Room Install', color: '#D47B9F', startDay: 14, endDay: 14, taskType: 'Installation' },
      { id: 'se-5', title: 'Equipment Diagnostic', color: '#5AC8D4', startDay: 19, endDay: 19, taskType: 'Diagnostic' },
      { id: 'se-6', title: 'Fence Removal', color: '#E8B45A', startDay: 21, endDay: 21, taskType: 'Removal' },
      { id: 'se-7', title: 'Garden Planting', color: '#8ED4A0', startDay: 26, endDay: 26, taskType: 'Planting' },
      { id: 'se-8', title: 'Exterior Coating', color: '#5A7BD4', startDay: 28, endDay: 28, taskType: 'Coating' },
    )

    // Add user project event on today
    if (userProject) {
      events.push({
        id: 'user-event',
        title: userProject.name,
        color: userProject.taskTypeColor,
        startDay: todayDay,
        endDay: todayDay,
        taskType: userProject.taskType,
      })
    }

    // Clamp all events to valid days
    return events.map(e => ({
      ...e,
      startDay: Math.max(1, Math.min(daysInMonth, e.startDay)),
      endDay: Math.max(1, Math.min(daysInMonth, e.endDay)),
    }))
  }, [monthData.daysInMonth, today, userProject])

  // Build week-based slot layout matching iOS weekSpansForWeek algorithm
  interface WeekEventSpan {
    eventId: string
    title: string
    color: string
    startCol: number  // 0-6 column within the week
    endCol: number    // 0-6 column within the week
    row: number       // slot row
    isFirstSegment: boolean
    isLastSegment: boolean
    isSingleDay: boolean
    taskType?: string
  }

  interface MoreIndicator {
    col: number
    count: number
    row: number
  }

  const computeWeekLayout = useCallback((weekDates: (number | null)[]): { spans: WeekEventSpan[]; moreIndicators: MoreIndicator[] } => {
    const cellH = expansionLevel === 0 ? 80 : expansionLevel === 1 ? 120 : 180
    const isLevel3 = cellH >= 180
    const baseSlotH = cellH < 120 ? 10 : 14
    const rowSpacing = 2
    const availableH = cellH - 26 // 26px for day number area
    const maxSlots = Math.max(4, Math.floor(availableH / (baseSlotH + rowSpacing / 2)))

    const spans: WeekEventSpan[] = []
    const moreIndicators: MoreIndicator[] = []
    const occupied: boolean[][] = Array.from({ length: 7 }, () => Array(maxSlots).fill(false))
    const processedEvents = new Set<string>()

    // Collect events per day column
    const eventsByCol: MonthEvent[][] = Array.from({ length: 7 }, () => [])
    for (let col = 0; col < 7; col++) {
      const dayNum = weekDates[col]
      if (dayNum === null) continue
      for (const ev of monthEvents) {
        if (dayNum >= ev.startDay && dayNum <= ev.endDay) {
          eventsByCol[col].push(ev)
        }
      }
      // Sort: multi-day first, then by start
      eventsByCol[col].sort((a, b) => {
        const aMulti = a.startDay !== a.endDay
        const bMulti = b.startDay !== b.endDay
        if (aMulti !== bMulti) return aMulti ? -1 : 1
        return a.startDay - b.startDay
      })
    }

    // Assign slots, processing each day left to right
    for (let col = 0; col < 7; col++) {
      for (const ev of eventsByCol[col]) {
        if (processedEvents.has(ev.id)) continue

        // Find this event's column span in this week
        let startCol = -1
        let endCol = -1
        for (let c = 0; c < 7; c++) {
          const d = weekDates[c]
          if (d !== null && d >= ev.startDay && d <= ev.endDay) {
            if (startCol === -1) startCol = c
            endCol = c
          }
        }
        if (startCol < 0) continue

        const isSingleDay = ev.startDay === ev.endDay
        const slotsNeeded = (isLevel3 && isSingleDay) ? 3 : 1

        // Find available slot (reserve last for "+N more")
        let assignedSlot = -1
        for (let s = 0; s < maxSlots - 1; s++) {
          if (s + slotsNeeded > maxSlots - 1) break
          let available = true
          for (let so = 0; so < slotsNeeded; so++) {
            for (let c = startCol; c <= endCol; c++) {
              if (occupied[c][s + so]) { available = false; break }
            }
            if (!available) break
          }
          if (available) {
            assignedSlot = s
            for (let so = 0; so < slotsNeeded; so++) {
              for (let c = startCol; c <= endCol; c++) {
                occupied[c][s + so] = true
              }
            }
            break
          }
        }

        if (assignedSlot >= 0) {
          const isFirstSeg = weekDates[startCol] === ev.startDay
          const isLastSeg = weekDates[endCol] === ev.endDay
          spans.push({
            eventId: ev.id,
            title: ev.title,
            color: ev.color,
            startCol,
            endCol,
            row: assignedSlot,
            isFirstSegment: isFirstSeg,
            isLastSegment: isLastSeg,
            isSingleDay,
            taskType: ev.taskType,
          })
          processedEvents.add(ev.id)
        }
      }
    }

    // Compute "+N more" indicators for overflow
    for (let col = 0; col < 7; col++) {
      const dayNum = weekDates[col]
      if (dayNum === null) continue
      const totalEvents = eventsByCol[col].length
      const placedEvents = eventsByCol[col].filter(ev => processedEvents.has(ev.id)).length
      // Also check events that couldn't be placed (not in processedEvents means no slot)
      const hidden = totalEvents - placedEvents
      // Actually we need a different approach: count events that overlap this column but weren't placed
      const eventsInCol = monthEvents.filter(ev => dayNum >= ev.startDay && dayNum <= ev.endDay)
      const placedInCol = eventsInCol.filter(ev => {
        return spans.some(s => s.eventId === ev.id && col >= s.startCol && col <= s.endCol)
      })
      const hiddenCount = eventsInCol.length - placedInCol.length
      if (hiddenCount > 0) {
        moreIndicators.push({ col, count: hiddenCount, row: maxSlots - 1 })
      }
    }

    return { spans, moreIndicators }
  }, [monthEvents, expansionLevel])

  // Break month into weeks (arrays of day numbers, null for padding)
  const monthWeeks = useMemo(() => {
    const weeks: (number | null)[][] = []
    const cells: (number | null)[] = []

    // Leading padding
    for (let i = 0; i < monthData.startDay; i++) {
      cells.push(null)
    }
    // Days
    for (let d = 1; d <= monthData.daysInMonth; d++) {
      cells.push(d)
    }
    // Trailing padding
    while (cells.length % 7 !== 0) {
      cells.push(null)
    }
    // Split into week rows
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7))
    }
    return weeks
  }, [monthData])

  // Pre-compute layout for all weeks
  const weekLayouts = useMemo(() => {
    return monthWeeks.map(week => computeWeekLayout(week))
  }, [monthWeeks, computeWeekLayout])

  // =========================================================================
  // MONTH GRID SCROLL — JS-driven because ancestor has touchAction:'none'
  // Uses requestAnimationFrame for smooth momentum scrolling.
  // =========================================================================

  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollContentRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const scrollVelocity = useRef(0)
  const scrollTouchStartY = useRef<number | null>(null)
  const scrollLastTouchY = useRef(0)
  const scrollLastTime = useRef(0)
  const scrollAnimFrame = useRef<number | null>(null)
  const scrollMax = useRef(0)

  // Compute max scroll whenever content changes — useLayoutEffect for reliable measurement
  useLayoutEffect(() => {
    if (!scrollRef.current || !scrollContentRef.current) return
    const containerH = scrollRef.current.clientHeight
    const contentH = scrollContentRef.current.scrollHeight
    scrollMax.current = Math.max(0, contentH - containerH)
  }, [expansionLevel, monthWeeks.length, weekLayouts])

  const clampScroll = useCallback((val: number) => {
    return Math.max(0, Math.min(scrollMax.current, val))
  }, [])

  // Momentum animation
  const animateMomentum = useCallback(() => {
    const friction = 0.95
    const minVelocity = 0.5

    scrollVelocity.current *= friction
    if (Math.abs(scrollVelocity.current) < minVelocity) {
      scrollVelocity.current = 0
      scrollAnimFrame.current = null
      return
    }

    setScrollY(prev => {
      const next = clampScroll(prev + scrollVelocity.current)
      // Stop if we hit bounds
      if (next === prev && prev === 0 || next === prev && prev === scrollMax.current) {
        scrollVelocity.current = 0
        return prev
      }
      return next
    })

    scrollAnimFrame.current = requestAnimationFrame(animateMomentum)
  }, [clampScroll])

  const handleScrollTouchStart = useCallback((e: React.TouchEvent) => {
    // Prevent event from bubbling to parent (which has touchAction:'none')
    e.stopPropagation()

    // Stop any ongoing momentum
    if (scrollAnimFrame.current) {
      cancelAnimationFrame(scrollAnimFrame.current)
      scrollAnimFrame.current = null
    }
    scrollVelocity.current = 0

    const y = e.touches[0].clientY
    scrollTouchStartY.current = y
    scrollLastTouchY.current = y
    scrollLastTime.current = Date.now()
  }, [])

  const handleScrollTouchMove = useCallback((e: React.TouchEvent) => {
    if (scrollTouchStartY.current === null) return

    // Prevent event from bubbling to parent (which has touchAction:'none')
    e.stopPropagation()

    const y = e.touches[0].clientY
    const now = Date.now()
    const dt = now - scrollLastTime.current
    const dy = scrollLastTouchY.current - y // positive = scroll down

    // Track velocity (pixels per frame at 16ms)
    if (dt > 0) {
      scrollVelocity.current = (dy / dt) * 16
    }

    scrollLastTouchY.current = y
    scrollLastTime.current = now

    setScrollY(prev => clampScroll(prev + dy))
  }, [clampScroll])

  const handleScrollTouchEnd = useCallback((e: React.TouchEvent) => {
    // Prevent event from bubbling to parent (which has touchAction:'none')
    e.stopPropagation()

    scrollTouchStartY.current = null
    // Start momentum animation if we have velocity
    if (Math.abs(scrollVelocity.current) > 0.5) {
      scrollAnimFrame.current = requestAnimationFrame(animateMomentum)
    }
  }, [animateMomentum])

  // Reset scroll when expansion level changes
  useEffect(() => {
    setScrollY(0)
    scrollVelocity.current = 0
  }, [expansionLevel])

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollAnimFrame.current) cancelAnimationFrame(scrollAnimFrame.current)
    }
  }, [])

  // =========================================================================
  // SWIPE GESTURE for week day row
  // =========================================================================

  const touchStartX = useRef<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)

  const handleDayRowTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleDayRowTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = e.touches[0].clientX - touchStartX.current
    // Apply resistance (0.5)
    setDragOffset(diff * 0.5)
  }

  const handleDayRowTouchEnd = () => {
    if (touchStartX.current === null) return
    const threshold = 50
    if (dragOffset < -threshold) {
      // Swipe left = next week
      setWeekOffset(prev => prev + 1)
      setSelectedDayIndex(-1)
    } else if (dragOffset > threshold) {
      // Swipe right = previous week
      setWeekOffset(prev => prev - 1)
      setSelectedDayIndex(-1)
    }
    setDragOffset(0)
    touchStartX.current = null
  }

  // =========================================================================
  // RENDER
  // =========================================================================

  // Height reserved at top for the floating tooltip (no safe area on web)
  const TOOLTIP_TOP_INSET = 80

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Spacer: push content below the floating tooltip */}
      <div style={{ height: TOOLTIP_TOP_INSET, flexShrink: 0 }} />

      {/* App Header - matches iOS ScheduleView / CalendarHeaderView */}
      <div className="flex items-center justify-between" style={{ padding: '12px 20px 0' }}>
        <div>
          <h2 className="font-mohave font-semibold text-[28px] uppercase tracking-wider text-white">
            Schedule
          </h2>
          {/* TODAY | Date subtitle — caption font, secondaryText */}
          <div className="flex items-center" style={{ gap: 8 }}>
            <span className="font-kosugi text-[14px] text-ops-text-secondary">
              TODAY
            </span>
            <span className="font-kosugi text-[14px] text-ops-text-secondary">|</span>
            <span className="font-kosugi text-[14px] text-ops-text-secondary">
              {monthNames[today.getMonth()]} {today.getDate()}
            </span>
          </div>
        </div>
        {/* Right: 3 circular action buttons (filter, refresh, search) — 44pt, cardBackground circle */}
        <div className="flex items-center" style={{ gap: 8 }}>
          {/* Filter button */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 44, height: 44, background: '#0D0D0D' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {/* Refresh button */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 44, height: 44, background: '#0D0D0D' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {/* Search button */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 44, height: 44, background: '#0D0D0D' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Toggle row: Week/Month segmented + period button — matching iOS CalendarToggleView */}
      {/* HStack spacing: 16pt, padding vertical: 8pt */}
      <div className="flex items-center" style={{ padding: '8px 20px', gap: 16 }}>
        {/* Week/Month Toggle — bodyBold (16pt Mohave Bold), 12pt vertical padding, 5pt radius */}
        <div className="flex flex-1 overflow-hidden relative" style={{ background: '#0D0D0D', borderRadius: 5 }}>
          <button
            className="flex-1 font-mohave font-medium text-[16px] uppercase tracking-wider transition-all"
            style={{
              padding: '12px 0',
              borderRadius: 5,
              background: !isMonthView ? 'white' : 'transparent',
              color: !isMonthView ? 'black' : '#FFFFFF',
            }}
          >
            Week
          </button>
          <button
            onClick={() => isMonthPrompt && onToggleMonth()}
            className="flex-1 font-mohave font-medium text-[16px] uppercase tracking-wider transition-all relative"
            style={{
              padding: '12px 0',
              borderRadius: 5,
              background: isMonthView ? 'white' : 'transparent',
              color: isMonthView ? 'black' : isMonthPrompt ? '#417394' : '#FFFFFF',
            }}
          >
            Month
            {/* Pulsing 3pt border highlight during calendarMonthPrompt */}
            {isMonthPrompt && (
              <span
                className="absolute inset-0 pointer-events-none"
                style={{
                  borderRadius: 5,
                  border: '3px solid rgba(65, 115, 148, 0.6)',
                  animation: 'calendarPulse 2.4s ease-in-out infinite',
                }}
              />
            )}
          </button>

          {/* Black overlay on Week half during calendarMonthPrompt */}
          {isMonthPrompt && (
            <div
              className="absolute top-0 bottom-0 left-0 pointer-events-none"
              style={{
                width: '50%',
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '5px 0 0 5px',
              }}
            />
          )}

          {/* Black overlay on BOTH toggle + picker during calendarWeek (content is locked) */}
          {phase === 'calendarWeek' && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: 5,
              }}
            />
          )}
        </div>

        {/* Period button — 100pt wide, white bg, black text, bodyBold, 5pt radius */}
        {!isMonthView && (
          <div className="relative">
            <div
              className="flex items-center justify-center"
              style={{
                width: 100,
                padding: '12px 0',
                borderRadius: 5,
                background: '#E5E5E5',
              }}
            >
              <span className="font-mohave font-medium text-[16px] text-black whitespace-nowrap">
                {weekRangeLabel}
              </span>
            </div>
            {/* Black overlay during calendarWeek or calendarMonthPrompt */}
            {(phase === 'calendarWeek' || isMonthPrompt) && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: 5,
                }}
              />
            )}
          </div>
        )}

        {/* Period button for month mode */}
        {isMonthView && (
          <div
            className="flex items-center justify-center"
            style={{
              width: 100,
              padding: '12px 0',
              borderRadius: 5,
              background: '#E5E5E5',
            }}
          >
            <span className="font-mohave font-medium text-[16px] text-black whitespace-nowrap">
              {monthNames[today.getMonth()]}
            </span>
          </div>
        )}
      </div>

      {/* Dark overlay on all content below toggle during calendarMonthPrompt */}
      {isMonthPrompt && (
        <div
          className="absolute left-0 right-0 bottom-0 pointer-events-none"
          style={{
            top: TOOLTIP_TOP_INSET + 140, // below header + toggle row
            background: 'rgba(0, 0, 0, 0.6)',
            zIndex: 5,
          }}
        />
      )}

      {isMonthView ? (
        /* ===== MONTH VIEW — Rebuilt from scratch matching iOS MonthGridView ===== */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sticky header: Month/Year label + separator + weekday labels — iOS VStack(spacing:0) */}
          <div style={{ padding: '0 20px' }}>
            {/* Month-Year title — iOS: OPSStyle.Typography.subtitle, leading aligned */}
            <div style={{ padding: '0 4px 6px' }}>
              <span className="font-kosugi text-[22px] text-white uppercase tracking-wider">
                {monthNames[monthData.month]} {monthData.year}
              </span>
            </div>

            {/* Separator — iOS: secondaryText.opacity(0.3), 0.5px */}
            <div style={{ height: 0.5, background: 'rgba(170,170,170,0.3)', margin: '0 4px' }} />

            {/* Weekday labels — iOS: OPSStyle.Typography.caption, secondaryText */}
            <div className="grid grid-cols-7" style={{ paddingTop: 6 }}>
              {dayAbbreviations.map((abbr, i) => (
                <div key={i} className="text-center font-kosugi text-[14px] text-ops-text-secondary">
                  {abbr}
                </div>
              ))}
            </div>
          </div>

          {/* Scrollable month grid — JS-driven scroll with momentum */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-hidden min-h-0"
            style={{ padding: '0 20px' }}
            onTouchStart={handleScrollTouchStart}
            onTouchMove={handleScrollTouchMove}
            onTouchEnd={handleScrollTouchEnd}
          >
            <div
              ref={scrollContentRef}
              style={{ transform: `translateY(-${scrollY}px)`, willChange: 'transform' }}
            >
            {/* Week rows */}
            {monthWeeks.map((week, weekIndex) => {
              const { spans, moreIndicators } = weekLayouts[weekIndex]
              const cellH = expansionLevel === 0 ? 80 : expansionLevel === 1 ? 120 : 180
              const baseSlotH = cellH < 120 ? 10 : 14
              const rowSpacing = 2

              return (
                <div key={weekIndex}>
                  {/* Separator line — iOS: secondaryText.opacity(0.2), 0.5px */}
                  <div style={{ height: 0.5, background: 'rgba(170,170,170,0.2)', margin: '0 4px' }} />

                  {/* Week row: day cells + overlaid event bars — iOS uses GeometryReader + ZStack */}
                  <div className="relative" style={{ height: cellH, transition: 'height 0.3s ease' }}>
                    {/* Day number cells layer */}
                    <div className="grid grid-cols-7 absolute inset-0">
                      {week.map((dayNum, colIndex) => {
                        if (dayNum === null) {
                          return <div key={`empty-${colIndex}`} style={{ height: cellH }} />
                        }

                        const isToday = dayNum === today.getDate() && today.getMonth() === monthData.month
                        const todayBg = isToday ? 'rgba(65, 115, 148, 0.5)' : 'transparent'

                        return (
                          <div
                            key={dayNum}
                            className="flex flex-col items-center relative"
                            style={{
                              height: cellH,
                              background: todayBg,
                              borderRadius: 4,
                              paddingTop: 4,
                            }}
                          >
                            {/* Today: white 24x24 circle behind day number — iOS: Circle().fill(.white).frame(24,24) */}
                            {isToday ? (
                              <div
                                className="flex items-center justify-center"
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 12,
                                  background: 'white',
                                }}
                              >
                                <span className="font-mohave font-medium text-[16px] text-black leading-none">
                                  {dayNum}
                                </span>
                              </div>
                            ) : (
                              <span
                                className="font-mohave font-medium text-[16px] leading-none"
                                style={{
                                  color: 'rgba(255,255,255,0.8)',
                                  height: 24,
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                {dayNum}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Event bars layer — positioned absolutely like iOS ZStack offset */}
                    {spans.map((span) => {
                      const colWidth = 100 / 7 // percentage
                      const left = `${span.startCol * colWidth}%`
                      const width = `${(span.endCol - span.startCol + 1) * colWidth}%`
                      const isLevel1 = cellH < 120
                      const isLevel3 = cellH >= 180
                      const isTall = isLevel3 && span.isSingleDay
                      const barH = isTall ? baseSlotH * 3 : baseSlotH
                      const topOffset = 26 + span.row * (baseSlotH + rowSpacing)
                      const opacity = isLevel1 ? 0.5 : 0.2

                      // Corner radii — iOS: 3pt on first/last segments
                      const rLeft = (span.isSingleDay || span.isFirstSegment) ? 3 : 0
                      const rRight = (span.isSingleDay || span.isLastSegment) ? 3 : 0

                      return (
                        <div
                          key={span.eventId}
                          className="absolute overflow-hidden"
                          style={{
                            left,
                            width,
                            top: topOffset,
                            height: barH,
                            padding: '0 2px', // iOS: .padding(.horizontal, 2)
                            transition: 'top 0.3s ease, height 0.3s ease',
                          }}
                        >
                          <div
                            className="w-full h-full overflow-hidden"
                            style={{
                              background: `${span.color}${isLevel1 ? '80' : '33'}`, // 0.5 or 0.2 opacity hex
                              borderRadius: `${rLeft}px ${rRight}px ${rRight}px ${rLeft}px`,
                            }}
                          >
                            {/* Tall single-day event at Level 3 — iOS: VStack with title + task type */}
                            {isTall ? (
                              <div className="flex flex-col h-full" style={{ padding: '2px 4px' }}>
                                <span
                                  className="leading-tight overflow-hidden"
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 500,
                                    color: span.color,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical' as const,
                                  }}
                                >
                                  {span.title}
                                </span>
                                <div className="flex-1" />
                                {span.taskType && (
                                  <span
                                    className="font-kosugi uppercase truncate"
                                    style={{
                                      fontSize: 9,
                                      color: '#AAAAAA', // secondaryText
                                      lineHeight: 1,
                                      paddingBottom: 1,
                                    }}
                                  >
                                    {span.taskType}
                                  </span>
                                )}
                              </div>
                            ) : !isLevel1 ? (
                              /* Level 2 or Level 3 multi-day — iOS: HStack with title */
                              (span.isSingleDay || span.isFirstSegment) && (
                                <div className="flex items-center h-full" style={{ padding: '0 4px' }}>
                                  <span
                                    className="truncate leading-none"
                                    style={{
                                      fontSize: 10,
                                      color: span.color,
                                    }}
                                  >
                                    {span.title}
                                  </span>
                                </div>
                              )
                            ) : null /* Level 1: no text */}
                          </div>
                        </div>
                      )
                    })}

                    {/* +N more indicators */}
                    {moreIndicators.map((ind, i) => {
                      const colWidth = 100 / 7
                      const left = `${ind.col * colWidth}%`
                      const width = `${colWidth}%`
                      const topOffset = 26 + ind.row * (baseSlotH + rowSpacing)
                      const indH = cellH < 120 ? 10 : 14

                      return (
                        <div
                          key={`more-${weekIndex}-${i}`}
                          className="absolute"
                          style={{
                            left,
                            width,
                            top: topOffset,
                            height: indH,
                            padding: '0 2px',
                          }}
                        >
                          <div
                            className="w-full h-full flex items-center overflow-hidden"
                            style={{
                              background: 'rgba(170,170,170,0.1)',
                              borderRadius: 3,
                              paddingLeft: 4,
                            }}
                          >
                            <span style={{ fontSize: 10, color: '#666666' }}>
                              +{ind.count}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Bottom spacing for tab bar */}
            <div style={{ height: 120 }} />
            </div>
          </div>

          {/* Expand/Contract button — replaces iOS pinch gesture */}
          <div
            className="absolute left-0 right-0 flex justify-center"
            style={{ bottom: 110, zIndex: 10 }}
          >
            <button
              onClick={() => setExpansionLevel(prev => (prev + 1) % 3)}
              className="flex items-center gap-2 px-4 py-2"
              style={{
                background: '#0D0D0D',
                borderRadius: 5,
                border: '2px solid rgba(65, 115, 148, 0.6)',
                boxShadow: '0 0 12px rgba(65, 115, 148, 0.3)',
                animation: 'calendarPulse 2.4s ease-in-out infinite',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#417394]">
                {expansionLevel < 2 ? (
                  <>
                    <path d="M7 7l5-5 5 5M7 17l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </>
                ) : (
                  <>
                    <path d="M7 3l5 5 5-5M7 21l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </>
                )}
              </svg>
              <span className="font-mohave font-medium text-[14px] text-[#417394] uppercase tracking-wider">
                {expansionLevel === 0 ? 'Expand' : expansionLevel === 1 ? 'Expand More' : 'Contract'}
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* ===== WEEK VIEW ===== */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Day selector row (CalendarDaySelector) — wrapped in card container */}
          <div style={{ padding: '0 20px 12px' }}>
            <div
              className="overflow-hidden"
              style={{ background: '#0D0D0D', borderRadius: 5 }}
              onTouchStart={handleDayRowTouchStart}
              onTouchMove={handleDayRowTouchMove}
              onTouchEnd={handleDayRowTouchEnd}
            >
              <div
                className="grid grid-cols-7"
                style={{
                  height: 60, // iOS: 60pt cell height
                  transform: `translateX(${dragOffset}px)`,
                  transition: dragOffset === 0 ? 'transform 0.3s ease-out' : 'none',
                }}
              >
                {weekDays.map((day, i) => {
                  const isToday =
                    day.getDate() === today.getDate() &&
                    day.getMonth() === today.getMonth() &&
                    day.getFullYear() === today.getFullYear()
                  const isSelected = i === activeDayIndex
                  const { newCount, ongoingCount } = getWeekDayEvents(i)

                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center justify-center relative cursor-pointer"
                      onClick={() => setSelectedDayIndex(i)}
                      style={{
                        // Today: full cell accent fill at 50% opacity (NOT just a circle)
                        background: isToday ? 'rgba(65, 115, 148, 0.5)' : 'transparent',
                        // Selected: white 1px border outline
                        border: isSelected ? '1px solid rgba(255,255,255,0.8)' : '1px solid transparent',
                        borderRadius: 5, // iOS cornerRadius = 5
                        margin: 2,
                      }}
                    >
                      {/* Day abbreviation — caption font (14pt Kosugi) */}
                      <span
                        className="font-kosugi"
                        style={{
                          fontSize: 14,
                          color: isToday ? '#FFFFFF' : '#AAAAAA',
                        }}
                      >
                        {dayAbbreviations[i]}
                      </span>

                      {/* Date number — bodyBold (16pt Mohave Bold) */}
                      <span
                        className="font-mohave font-medium"
                        style={{
                          fontSize: 16,
                          color: isToday ? '#FFFFFF' : isSelected ? '#E5E5E5' : 'rgba(229, 229, 229, 0.8)',
                        }}
                      >
                        {day.getDate()}
                      </span>

                      {/* New event badge — top-right, white circle at 0.8 opacity, 16x16 */}
                      {newCount > 0 && (
                        <div
                          className="absolute flex items-center justify-center"
                          style={{
                            top: 4,
                            right: 2,
                            width: 16,
                            height: 16,
                            borderRadius: 8,
                            background: 'rgba(255, 255, 255, 0.8)',
                          }}
                        >
                          <span className="font-kosugi text-[12px] text-black font-bold">{newCount}</span>
                        </div>
                      )}
                      {/* Ongoing event badge — bottom-right, gray at 0.3 opacity, 14x14 */}
                      {ongoingCount > 0 && (
                        <div
                          className="absolute flex items-center justify-center"
                          style={{
                            bottom: 4,
                            right: 2,
                            width: 14,
                            height: 14,
                            borderRadius: 7,
                            background: 'rgba(128, 128, 128, 0.3)',
                          }}
                        >
                          <span className="font-kosugi text-ops-text-secondary" style={{ fontSize: 9, fontWeight: 500 }}>{ongoingCount}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Day header below selector — matching iOS ProjectListView sticky header */}
          <div style={{ padding: '0 20px 8px' }} className="flex items-center justify-between">
            <div className="flex items-baseline" style={{ gap: 8 }}>
              <span className="font-mohave text-[16px] uppercase tracking-wider text-white font-medium">
                {dayNames[activeDay.getDay()]}
              </span>
              <span className="font-kosugi text-[14px] text-ops-text-secondary">
                {monthNames[activeDay.getMonth()]} {activeDay.getDate()}
              </span>
            </div>
            {/* Event count card */}
            {dayScheduleItems.length > 0 && (
              <div
                className="px-2 py-1"
                style={{ background: '#0D0D0D', borderRadius: 5, border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="font-kosugi text-[12px] text-ops-text-secondary">
                  {dayScheduleItems.length} {dayScheduleItems.length === 1 ? 'event' : 'events'}
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 mx-5" />

          {/* Schedule list for selected day — matching iOS CalendarEventCard */}
          <div className="flex-1 overflow-y-auto pt-3" style={{ padding: '12px 20px 0' }}>
            <div className="flex flex-col" style={{ gap: 8 }}>
              {dayScheduleItems.map((item, i) => (
                <div
                  key={i}
                  className="overflow-hidden flex"
                  style={{
                    background: '#0D0D0D',
                    borderRadius: 5,
                    boxShadow: '0 1px 2px rgba(0,0,0,1)',
                  }}
                >
                  {/* Left color bar (4px) — iOS: Rectangle().fill(displayColor).frame(width: 4) */}
                  <div
                    className="flex-shrink-0"
                    style={{ width: 4, backgroundColor: item.color }}
                  />

                  {/* Content — iOS: ZStack { HStack { VStack(spacing:6), Color.clear(80) } .padding(16) } */}
                  <div className="flex-1 min-w-0 relative" style={{ padding: 16 }}>
                    {/* Main text column — iOS: VStack(alignment: .leading, spacing: 6) */}
                    <div className="flex flex-col" style={{ gap: 6, paddingRight: 80 }}>
                      {/* Title — iOS: bodyBold = Mohave-Medium 16pt, primaryText, uppercase, lineLimit 1 */}
                      <span className="font-mohave font-medium text-[16px] text-white uppercase tracking-wide block truncate">
                        {item.name}
                      </span>
                      {/* Client name — iOS: caption = Kosugi-Regular 14pt, secondaryText, lineLimit 1 */}
                      <span className="font-kosugi text-[14px] text-ops-text-secondary block truncate">
                        {item.clientName}
                      </span>
                      {/* Address — iOS: caption = Kosugi-Regular 14pt, tertiaryText, lineLimit 1 */}
                      {item.address && (
                        <span className="font-kosugi text-[14px] text-ops-text-tertiary block truncate">
                          {item.address}
                        </span>
                      )}
                    </div>

                    {/* Task type badge — iOS: top-right, smallCaption = Kosugi 12pt,
                         padding 8h 4v, fill badgeColor.opacity(0.1), stroke badgeColor.opacity(0.3) */}
                    <span
                      className="font-kosugi uppercase flex-shrink-0 absolute"
                      style={{
                        top: 16,
                        right: 16,
                        fontSize: 12,
                        padding: '4px 8px',
                        borderRadius: 4,
                        backgroundColor: `${item.color}1A`,
                        border: `1px solid ${item.color}4D`,
                        color: item.color,
                      }}
                    >
                      {item.taskType}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {dayScheduleItems.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <span className="font-kosugi text-[12px] text-ops-text-tertiary">
                  No tasks scheduled
                </span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

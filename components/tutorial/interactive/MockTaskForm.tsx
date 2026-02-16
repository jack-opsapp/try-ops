'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { DEMO_TASK_TYPES, DEMO_CREW } from '@/lib/constants/demo-data'
import type { TutorialPhase } from '@/lib/tutorial/TutorialPhase'

interface MockTaskFormProps {
  phase: TutorialPhase
  visible: boolean
  selectedType: string | null
  selectedCrew: string | null
  selectedDate: string | null
  onSelectType: (type: string) => void
  onSelectCrew: (crew: string) => void
  onSelectDate: (date: string) => void
  onDateSheetStateChange?: (open: boolean, hasDates: boolean) => void
  confirmDatesSignal?: number
}

export function MockTaskForm({
  phase,
  visible,
  selectedType,
  selectedCrew,
  selectedDate,
  onSelectType,
  onSelectCrew,
  onSelectDate,
  onDateSheetStateChange,
  confirmDatesSignal,
}: MockTaskFormProps) {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [showCrewList, setShowCrewList] = useState(false)
  const [showDateSheet, setShowDateSheet] = useState(false)
  const [dateSheetClosing, setDateSheetClosing] = useState(false) // close animation
  const [dateStartDate, setDateStartDate] = useState<number | null>(null)
  const [dateEndDate, setDateEndDate] = useState<number | null>(null)

  // Derive selected task type object from name
  const selectedTaskTypeObj = selectedType
    ? DEMO_TASK_TYPES.find(t => t.name === selectedType) ?? null
    : null

  // Color for the left bar on task type field and preview
  const typeColor = selectedTaskTypeObj?.color ?? null

  const isFieldActive = (field: 'type' | 'crew' | 'date') => {
    switch (field) {
      case 'type': return phase === 'taskFormType'
      case 'crew': return phase === 'taskFormCrew'
      case 'date': return phase === 'taskFormDate'
    }
  }

  // Whether the field is in an inactive/dimmed tutorial state
  const isFieldDimmed = (field: 'type' | 'crew' | 'date') => {
    return !isFieldActive(field) && phase !== 'taskFormDone'
  }

  // Notify parent of date sheet state changes
  useEffect(() => {
    onDateSheetStateChange?.(showDateSheet && !dateSheetClosing, dateStartDate !== null)
  }, [showDateSheet, dateSheetClosing, dateStartDate, onDateSheetStateChange])

  // Handle external date confirmation signal from action bar
  const prevConfirmSignal = useRef(0)
  const runDateConfirm = useCallback(() => {
    if (dateStartDate !== null) {
      const today = new Date()
      const month = today.toLocaleString('en-US', { month: 'short' })
      const dateStr = dateEndDate && dateEndDate !== dateStartDate
        ? `${month} ${dateStartDate} - ${dateEndDate}`
        : `${month} ${dateStartDate}, ${today.getFullYear()}`
      setDateSheetClosing(true)
      setTimeout(() => {
        setShowDateSheet(false)
        setDateSheetClosing(false)
        onSelectDate(dateStr)
      }, 350)
    }
  }, [dateStartDate, dateEndDate, onSelectDate])

  useEffect(() => {
    if (confirmDatesSignal !== undefined && confirmDatesSignal > prevConfirmSignal.current) {
      prevConfirmSignal.current = confirmDatesSignal
      runDateConfirm()
    }
  }, [confirmDatesSignal, runDateConfirm])

  if (!visible) return null

  const handleTypeSelect = (typeName: string) => {
    onSelectType(typeName)
    setShowTypeDropdown(false)
  }

  const handleCrewSelect = (crewShort: string) => {
    onSelectCrew(crewShort)
    setShowCrewList(false)
  }

  return (
    <div
      className="absolute inset-x-0 bottom-0 animate-fade-up"
      style={{ zIndex: 52 }}
    >
      <div
        className="overflow-hidden flex flex-col"
        style={{
          background: '#000000',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: '92vh',
        }}
      >
        {/* Header: CANCEL | CREATE TASK | DONE */}
        <div className="relative flex items-center" style={{ background: '#000000', padding: '12px 16px' }}>
          {/* Cancel - left */}
          <span
            className="font-mohave font-medium text-[16px] uppercase"
            style={{ color: '#777777', opacity: 0.5 }}
          >
            Cancel
          </span>

          {/* CREATE TASK - center */}
          <span className="absolute left-1/2 -translate-x-1/2 font-mohave font-medium text-[16px] text-white uppercase">
            Create Task
          </span>

          {/* DONE - right, always greyed out (action handled by bottom action bar) */}
          <span
            className="ml-auto font-mohave font-medium text-[16px] uppercase"
            style={{ color: '#777777' }}
          >
            Done
          </span>
        </div>

        {/* Divider below header */}
        <div className="h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />

        {/* taskFormDone: dark overlay over content + radial gradient */}
        <div className="relative flex-1 overflow-y-auto">
          {/* Scrollable form content */}
          <div className="px-4 py-4 space-y-6">
            {/* Preview Card (greyed out at 0.3 opacity) */}
            <div style={{ opacity: 0.3 }} className="pointer-events-none">
              <div
                className="flex overflow-hidden"
                style={{
                  background: '#0D0D0D',
                  borderRadius: '5px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {/* Left color bar */}
                <div
                  className="w-1 flex-shrink-0"
                  style={{ background: typeColor ?? '#AAAAAA' }}
                />

                {/* Content */}
                <div className="flex-1 p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      {/* Task type name */}
                      <div className="font-mohave font-bold text-[14px] text-white uppercase truncate">
                        {selectedType ?? 'SELECT TASK TYPE'}
                      </div>
                      {/* Project subtitle */}
                      <div className="font-kosugi text-[11px] text-[#AAAAAA] mt-0.5 truncate">
                        New Project
                      </div>
                      {/* Metadata row */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-[#777777]">
                            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          <span className="font-kosugi text-[10px] text-[#777777]">
                            {selectedDate ?? '—'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-[#777777]">
                            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                            <path d="M2 21v-1a5 5 0 015-5h4a5 5 0 015 5v1" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="17" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                            <path d="M21 21v-1a3 3 0 00-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          <span className="font-kosugi text-[10px] text-[#777777]">
                            {selectedCrew ? '1' : '0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: status badge + unscheduled badge */}
                    <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                      {/* Status badge */}
                      <span
                        className="font-kosugi text-[10px] px-2 py-0.5 rounded"
                        style={{
                          color: '#417394',
                          background: 'rgba(65,115,148,0.1)',
                          border: '1px solid #417394',
                        }}
                      >
                        BOOKED
                      </span>
                      {/* Unscheduled badge */}
                      {!selectedDate && (
                        <span
                          className="font-kosugi text-[10px] px-2 py-0.5 rounded"
                          style={{
                            color: '#C4A868',
                            background: 'rgba(196,168,104,0.1)',
                            border: '1px solid #C4A868',
                          }}
                        >
                          UNSCHEDULED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TASK DETAILS Section Header */}
            <div className="flex items-center gap-[2px]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#AAAAAA]">
                <path d="M9 5h11M9 12h11M9 19h11M5 5h.01M5 12h.01M5 19h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="font-kosugi font-normal text-[14px] text-[#AAAAAA] uppercase tracking-wider">
                TASK DETAILS
              </span>
            </div>

            {/* 1. Task Type Field */}
            <div
              style={{ opacity: isFieldDimmed('type') ? 0.5 : 1 }}
              className="transition-opacity duration-200"
            >
              {/* Label row */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`font-kosugi font-normal text-[14px] uppercase tracking-wider transition-colors duration-300 ${
                    isFieldActive('type') ? 'text-[#417394]' : 'text-[#AAAAAA]'
                  }`}
                >
                  TASK TYPE
                </span>
                <span
                  className="font-kosugi text-[10px] text-[#777777] flex items-center gap-1"
                  style={{ opacity: 0.5 }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-[#777777]">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  NEW TYPE
                </span>
              </div>

              {/* Task type selector with colored left border */}
              <button
                onClick={() => isFieldActive('type') && setShowTypeDropdown(!showTypeDropdown)}
                disabled={!isFieldActive('type')}
                className="w-full transition-all duration-200"
              >
                <div
                  className="flex overflow-hidden"
                  style={{
                    borderRadius: '5px',
                    border: isFieldActive('type')
                      ? '2px solid #417394'
                      : '1px solid rgba(255,255,255,0.1)',
                    ...(isFieldActive('type') ? {
                      animation: 'tutorial-pulse-ring 2s ease-in-out infinite',
                    } : {}),
                  }}
                >
                  {/* Colored left bar */}
                  <div
                    className="w-1 flex-shrink-0"
                    style={{ background: typeColor ?? 'rgba(255,255,255,0.1)' }}
                  />

                  <div className="flex items-center justify-between flex-1 px-4 py-3">
                    <span className={`font-mohave text-[16px] ${selectedType ? 'text-white' : 'text-[#777777]'}`}>
                      {selectedType ? selectedType.toUpperCase() : 'Select Task Type'}
                    </span>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      className={`text-[#AAAAAA] transition-transform duration-200 ${showTypeDropdown ? 'rotate-180' : ''}`}
                    >
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </button>

              {/* Type dropdown */}
              {showTypeDropdown && isFieldActive('type') && (
                <div
                  className="mt-1 overflow-hidden max-h-[200px] overflow-y-auto"
                  style={{
                    borderRadius: '5px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: '#0D0D0D',
                  }}
                >
                  {DEMO_TASK_TYPES.map((type, idx) => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeSelect(type.name)}
                      className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-white/5 active:bg-white/10 transition-colors"
                      style={{
                        borderBottom: idx < DEMO_TASK_TYPES.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      }}
                    >
                      {/* Colored dot */}
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: type.color }}
                      />
                      <span className="font-mohave text-[16px] text-white uppercase">
                        {type.name}
                      </span>
                      {selectedType === type.name && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#417394] ml-auto">
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Status Field (always disabled at 0.5 opacity in tutorial) */}
            <div style={{ opacity: 0.5 }} className="pointer-events-none">
              <span className="font-kosugi font-normal text-[14px] text-[#AAAAAA] uppercase tracking-wider mb-2 block">
                STATUS
              </span>
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{
                  borderRadius: '5px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span className="font-mohave text-[16px] text-white">Booked</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#AAAAAA]">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* 3. Team / Assign Crew Field */}
            <div
              style={{ opacity: isFieldDimmed('crew') ? 0.5 : 1 }}
              className="transition-opacity duration-200"
            >
              <span
                className={`font-kosugi font-normal text-[14px] uppercase tracking-wider mb-2 block transition-colors duration-300 ${
                  isFieldActive('crew') ? 'text-[#417394]' : 'text-[#AAAAAA]'
                }`}
              >
                ASSIGN TEAM
              </span>

              <button
                onClick={() => isFieldActive('crew') && setShowCrewList(!showCrewList)}
                disabled={!isFieldActive('crew')}
                className="w-full transition-all duration-200"
              >
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{
                    borderRadius: '5px',
                    border: isFieldActive('crew')
                      ? '2px solid #417394'
                      : '1px solid rgba(255,255,255,0.1)',
                    ...(isFieldActive('crew') ? {
                      animation: 'tutorial-pulse-ring 2s ease-in-out infinite',
                    } : {}),
                  }}
                >
                  {selectedCrew ? (
                    <div className="flex items-center gap-2">
                      {/* Avatar photo */}
                      {(() => {
                        const crewMember = DEMO_CREW.find(c => c.short === selectedCrew)
                        return (
                          <img
                            src={crewMember?.avatar || ''}
                            alt={selectedCrew}
                            className="w-7 h-7 rounded-full object-cover"
                            style={{ border: '2px solid #417394' }}
                          />
                        )
                      })()}
                      <span className="font-mohave text-[16px] text-white">
                        {selectedCrew}
                      </span>
                    </div>
                  ) : (
                    <span className="font-mohave text-[16px] text-[#777777]">
                      Select team members
                    </span>
                  )}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#AAAAAA]">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>

              {/* Inline crew picker list */}
              {showCrewList && isFieldActive('crew') && (
                <div
                  className="mt-1 overflow-hidden"
                  style={{
                    borderRadius: '5px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: '#0D0D0D',
                  }}
                >
                  {DEMO_CREW.map((crew, idx) => (
                    <button
                      key={crew.id}
                      onClick={() => handleCrewSelect(crew.short)}
                      className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/5 active:bg-white/10 transition-colors"
                      style={{
                        borderBottom: idx < DEMO_CREW.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      }}
                    >
                      {/* Checkbox circle */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          selectedCrew === crew.short
                            ? 'border-[#417394] bg-[#417394]'
                            : 'border-[#777777]'
                        }`}
                      >
                        {selectedCrew === crew.short && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-white">
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>

                      {/* Avatar photo */}
                      <img
                        src={crew.avatar}
                        alt={crew.short}
                        className="rounded-full object-cover flex-shrink-0"
                        style={{
                          width: 40,
                          height: 40,
                          border: '2px solid #417394',
                        }}
                      />

                      {/* Name */}
                      <div className="flex flex-col gap-1">
                        <span className="font-mohave font-medium text-[16px] text-white">
                          {crew.name}
                        </span>
                        <span className="font-kosugi text-[14px] text-[#777777]">
                          Field Crew
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Dates Field */}
            <div
              style={{ opacity: isFieldDimmed('date') ? 0.5 : 1 }}
              className="transition-opacity duration-200"
            >
              <span
                className={`font-kosugi font-normal text-[14px] uppercase tracking-wider mb-2 block transition-colors duration-300 ${
                  isFieldActive('date') ? 'text-[#417394]' : 'text-[#AAAAAA]'
                }`}
              >
                DATES
              </span>

              {/* Date display / tap target — opens calendar sheet */}
              <button
                onClick={() => isFieldActive('date') && setShowDateSheet(true)}
                disabled={!isFieldActive('date')}
                className="w-full"
              >
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{
                    borderRadius: '5px',
                    border: isFieldActive('date')
                      ? '2px solid #417394'
                      : '1px solid rgba(255,255,255,0.1)',
                    ...(isFieldActive('date') ? {
                      animation: 'tutorial-pulse-ring 2s ease-in-out infinite',
                    } : {}),
                  }}
                >
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span className={`font-mohave text-[16px] ${selectedDate ? 'text-white' : 'text-[#AAAAAA]'}`}>
                      {selectedDate ?? 'Tap to Schedule'}
                    </span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#AAAAAA]">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>
            </div>

            {/* 5. Notes Field (always disabled at 0.5 opacity in tutorial) */}
            <div style={{ opacity: 0.5 }} className="pointer-events-none">
              <span className="font-kosugi font-normal text-[14px] text-[#AAAAAA] uppercase tracking-wider mb-2 block">
                NOTES
              </span>
              <div
                className="px-4 py-3"
                style={{
                  borderRadius: '5px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  minHeight: '100px',
                }}
              >
                <span className="font-mohave text-[16px] text-[#777777]">Add notes...</span>
              </div>
            </div>

            {/* Bottom padding for scroll */}
            <div className="h-4" />
          </div>

        </div>
      </div>

      {/* Calendar Scheduler Sheet — slides up when date field is tapped */}
      {(showDateSheet && (isFieldActive('date') || dateSheetClosing)) && (
        <MockCalendarSchedulerSheet
          closing={dateSheetClosing}
          startDate={dateStartDate}
          endDate={dateEndDate}
          onSelectDate={(dayNum) => {
            if (dayNum === -1) {
              // Clear signal
              setDateStartDate(null)
              setDateEndDate(null)
              return
            }
            if (dateStartDate === null || (dateStartDate !== null && dateEndDate !== null && dateStartDate !== dateEndDate)) {
              // First tap or reset after range: set both to same day
              setDateStartDate(dayNum)
              setDateEndDate(dayNum)
            } else if (dateStartDate === dayNum) {
              // Tapped same day again — keep as single day
              return
            } else {
              // Second tap: set range (auto-sort)
              const start = Math.min(dateStartDate, dayNum)
              const end = Math.max(dateStartDate, dayNum)
              setDateStartDate(start)
              setDateEndDate(end)
            }
          }}
          onConfirm={() => {
            if (dateStartDate !== null) {
              const today = new Date()
              const month = today.toLocaleString('en-US', { month: 'short' })
              const dateStr = dateEndDate && dateEndDate !== dateStartDate
                ? `${month} ${dateStartDate} - ${dateEndDate}`
                : `${month} ${dateStartDate}, ${today.getFullYear()}`
              // Start close animation, then advance
              setDateSheetClosing(true)
              setTimeout(() => {
                setShowDateSheet(false)
                setDateSheetClosing(false)
                onSelectDate(dateStr)
              }, 350) // match slide-down animation duration
            }
          }}
          onCancel={() => setShowDateSheet(false)}
        />
      )}

    </div>
  )
}

// =============================================================================
// CALENDAR SCHEDULER SHEET (matches iOS CalendarSchedulerSheet)
// =============================================================================

function MockCalendarSchedulerSheet({
  closing,
  startDate,
  endDate,
  onSelectDate,
  onConfirm,
  onCancel,
}: {
  closing?: boolean
  startDate: number | null
  endDate: number | null
  onSelectDate: (day: number) => void
  onConfirm: () => void
  onCancel: () => void
}) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  let firstDayOfWeek = new Date(year, month, 1).getDay() - 1
  if (firstDayOfWeek < 0) firstDayOfWeek = 6

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  const dayAbbreviations = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  const todayDate = today.getDate()
  const hasRange = startDate !== null && endDate !== null && startDate !== endDate
  const hasDates = startDate !== null

  const duration = hasRange ? Math.abs(endDate! - startDate!) + 1 : hasDates ? 1 : 0

  const formatDate = (day: number | null) => {
    if (day === null) return 'Select date'
    return `${monthNames[month].slice(0, 3)} ${day}, ${year}`
  }

  return (
    <div
      className={`absolute inset-0 flex flex-col ${!closing ? 'animate-fade-up' : ''}`}
      style={{
        zIndex: 60,
        background: '#000000',
        transform: closing ? 'translateY(100%)' : 'translateY(0)',
        opacity: closing ? 0 : 1,
        transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease-in',
      }}
    >
      {/* Header: Cancel | Schedule Task | Clear */}
      <div className="flex items-center px-4" style={{ height: 60 }}>
        <span
          className="font-mohave font-medium text-[16px] uppercase"
          style={{ color: '#777777', opacity: 0.5 }}
        >
          Cancel
        </span>
        <span className="absolute left-1/2 -translate-x-1/2 font-mohave font-medium text-[16px] text-white uppercase">
          Schedule Task
        </span>
        {hasDates && (
          <span
            className="ml-auto font-mohave font-medium text-[14px] uppercase cursor-pointer"
            style={{ color: '#C44848' }}
            onClick={() => {
              onSelectDate(-1) // reset signal
            }}
          >
            Clear
          </span>
        )}
      </div>

      <div className="h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />

      {/* Selected dates header card */}
      <div className="px-4 py-4">
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            background: '#0D0D0D',
            borderRadius: 5,
            border: hasDates
              ? '1px solid rgba(65,115,148,0.4)'
              : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* START */}
          <div className="flex flex-col items-start">
            <span className="font-kosugi text-[10px] text-[#AAAAAA] uppercase tracking-wider">
              Start
            </span>
            <span className={`font-mohave font-medium text-[14px] mt-0.5 ${hasDates ? 'text-white' : 'text-[#777777]'}`}>
              {formatDate(startDate)}
            </span>
          </div>

          {/* Arrow */}
          <span className="font-mohave text-[14px] mx-2" style={{ color: '#417394' }}>
            →
          </span>

          {/* END */}
          <div className="flex flex-col items-center">
            <span className="font-kosugi text-[10px] text-[#AAAAAA] uppercase tracking-wider">
              End
            </span>
            <span className={`font-mohave font-medium text-[14px] mt-0.5 ${hasRange ? 'text-white' : 'text-[#777777]'}`}>
              {hasRange ? formatDate(endDate) : 'Select date'}
            </span>
          </div>

          {/* DURATION */}
          <div className="flex flex-col items-end">
            <span className="font-kosugi text-[10px] text-[#AAAAAA] uppercase tracking-wider">
              Duration
            </span>
            <span className={`font-mohave font-medium text-[14px] mt-0.5 ${duration > 0 ? 'text-[#417394]' : 'text-[#777777]'}`}>
              {duration > 0 ? `${duration} day${duration > 1 ? 's' : ''}` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-y-auto px-4">
        {/* Month navigation header */}
        <div className="flex items-center justify-between px-2 pb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#417394]">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-mohave font-medium text-[16px] text-white">
            {monthNames[month]} {year}
          </span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#417394]">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {dayAbbreviations.map((abbr, i) => (
            <div key={i} className="text-center font-kosugi text-[12px] text-[#AAAAAA] py-1" style={{ height: 30 }}>
              {abbr}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells */}
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} style={{ height: 44 }} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = i + 1
            const isToday = dayNum === todayDate
            const isStart = startDate === dayNum
            const isEnd = endDate === dayNum
            const isInRange = startDate !== null && endDate !== null && dayNum > startDate && dayNum < endDate
            const isSelected = isStart || isEnd

            // Border radius logic for range selection
            let borderStyle: React.CSSProperties = {}
            if (isSelected && !hasRange) {
              borderStyle = { border: '2px solid white', borderRadius: 5 }
            } else if (isStart && hasRange) {
              borderStyle = {
                borderTop: '2px solid white', borderBottom: '2px solid white', borderLeft: '2px solid white',
                borderTopLeftRadius: 5, borderBottomLeftRadius: 5,
              }
            } else if (isEnd && hasRange) {
              borderStyle = {
                borderTop: '2px solid white', borderBottom: '2px solid white', borderRight: '2px solid white',
                borderTopRightRadius: 5, borderBottomRightRadius: 5,
              }
            } else if (isInRange) {
              borderStyle = {
                borderTop: '2px solid white', borderBottom: '2px solid white',
              }
            }

            return (
              <div
                key={dayNum}
                className="flex items-center justify-center relative cursor-pointer"
                style={{ height: 44, ...borderStyle }}
                onClick={() => onSelectDate(dayNum)}
              >
                {/* Today accent circle */}
                {isToday && !isSelected && (
                  <div
                    className="absolute rounded-full bg-ops-accent"
                    style={{ width: 32, height: 32 }}
                  />
                )}
                <span
                  className={`font-mohave font-medium text-[16px] relative z-10 ${
                    isToday ? 'text-white' : isSelected ? 'text-white' : 'text-white/70'
                  }`}
                >
                  {dayNum}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom padding (confirm action is in the bottom action bar) */}
      <div className="h-6" />
    </div>
  )
}

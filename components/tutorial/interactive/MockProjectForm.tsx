'use client'

import { useState, useRef, useEffect } from 'react'
import { DEMO_CLIENTS } from '@/lib/constants/demo-data'
import type { TutorialPhase } from '@/lib/tutorial/TutorialPhase'

interface MockProjectFormProps {
  phase: TutorialPhase
  isVisible: boolean
  selectedClient: string | null
  projectName: string
  addedTask: { type: string; typeColor: string; crew: string; date: string } | null
  onSelectClient: (client: string) => void
  onChangeProjectName: (name: string) => void
  onAddTask: () => void
}

export function MockProjectForm({
  phase,
  isVisible,
  selectedClient,
  projectName,
  addedTask,
  onSelectClient,
  onChangeProjectName,
  onAddTask,
}: MockProjectFormProps) {
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [sheetVisible, setSheetVisible] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const addTaskRef = useRef<HTMLDivElement>(null)

  // Slide-up animation on mount
  useEffect(() => {
    if (isVisible) {
      // Small delay so the browser paints the off-screen position first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSheetVisible(true)
        })
      })
    } else {
      setSheetVisible(false)
    }
  }, [isVisible])

  // Auto-show client dropdown when phase is projectFormClient
  useEffect(() => {
    if (phase === 'projectFormClient') {
      setShowClientDropdown(true)
    } else {
      setShowClientDropdown(false)
    }
  }, [phase])

  // Auto-scroll to ADD TASK button when phase is projectFormAddTask
  useEffect(() => {
    if (phase === 'projectFormAddTask' && scrollRef.current && addTaskRef.current) {
      const timer = setTimeout(() => {
        addTaskRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [phase])

  // Auto-fill project name with typewriter effect
  useEffect(() => {
    if (phase !== 'projectFormName') return
    const name = 'TEST PROJECT 01'
    let i = 0
    const timer = setInterval(() => {
      i++
      onChangeProjectName(name.slice(0, i))
      if (i >= name.length) clearInterval(timer)
    }, 50)
    return () => clearInterval(timer)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const isFieldActive = (field: 'client' | 'name' | 'addTask') => {
    switch (field) {
      case 'client': return phase === 'projectFormClient'
      case 'name': return phase === 'projectFormName'
      case 'addTask': return phase === 'projectFormAddTask'
    }
  }

  // Whether the form is valid (has client + name)
  const isFormValid = !!selectedClient && projectName.length > 0

  if (!isVisible) return null

  return (
    <div
      className="absolute inset-0"
      style={{ zIndex: 50 }}
    >
      {/* Sheet container - slides up from bottom */}
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col"
        style={{
          maxHeight: '92%',
          transform: sheetVisible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: 'hidden',
        }}
      >
        {/* === HEADER (iOS custom nav bar) === */}
        <div
          className="flex-shrink-0"
          style={{ background: '#000000' }}
        >
          <div
            className="flex items-center justify-between"
            style={{ padding: '12px 16px' }}
          >
            {/* CANCEL - left, greyed out disabled */}
            <span
              className="font-mohave font-medium text-[16px]"
              style={{ color: '#777777', opacity: 0.5, minWidth: 70 }}
            >
              CANCEL
            </span>

            {/* CREATE PROJECT - center title */}
            <span className="font-mohave font-medium text-[16px] text-white whitespace-nowrap">
              CREATE PROJECT
            </span>

            {/* CREATE - right, always greyed out (action handled by bottom action bar) */}
            <span
              className="font-mohave font-medium text-[16px]"
              style={{ color: '#777777', minWidth: 70, textAlign: 'right' }}
            >
              CREATE
            </span>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* === SCROLLABLE FORM CONTENT === */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto relative"
          style={{ background: '#000000' }}
        >
          <div style={{ padding: 16 }}>
            {/* Section Header: PROJECT DETAILS */}
            <div
              className="flex items-center gap-1 mb-4"
              style={{ paddingBottom: 4 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: '#AAAAAA' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-kosugi text-[14px] font-normal uppercase tracking-wider" style={{ color: '#AAAAAA' }}>
                PROJECT DETAILS
              </span>
            </div>

            {/* Card container for mandatory fields */}
            <div
              style={{
                background: 'rgba(13,13,13,0.8)',
                borderRadius: 5,
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '14px 16px',
              }}
            >
              <div className="flex flex-col" style={{ gap: 16 }}>
                {/* --- CLIENT FIELD --- */}
                <div
                  style={{
                    opacity: isFieldActive('client') || selectedClient ? 1 : 0.5,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  <label
                    className="font-kosugi text-[14px] font-normal uppercase tracking-wider block"
                    style={{
                      color: isFieldActive('client') ? '#417394' : '#AAAAAA',
                      marginBottom: 12,
                      transition: 'color 0.3s ease',
                    }}
                  >
                    CLIENT
                  </label>

                  {selectedClient ? (
                    /* Selected client card - matches iOS: border when filled */
                    <div
                      style={{
                        padding: '12px 16px',
                        borderRadius: 5,
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <span className="font-mohave font-medium text-[16px] text-white block">
                        {selectedClient}
                      </span>
                      <span className="font-kosugi text-[12px] block mt-0.5" style={{ color: '#777777' }}>
                        {selectedClient.toLowerCase().replace(/\s+/g, '.')}@email.com
                      </span>
                    </div>
                  ) : (
                    /* Client search / dropdown area */
                    <div>
                      <div
                        className="tutorial-pulse-border"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '12px 16px',
                          borderRadius: 5,
                          border: isFieldActive('client')
                            ? '2px solid rgba(65, 115, 148, 0.6)'
                            : '1px solid rgba(255,255,255,0.15)',
                          transition: 'border 0.3s ease, box-shadow 0.3s ease',
                          ...(isFieldActive('client') ? {
                            animation: 'tutorial-pulse-ring 2s ease-in-out infinite',
                          } : {}),
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#AAAAAA', flexShrink: 0 }}>
                          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="font-mohave text-[16px]" style={{ color: '#777777' }}>
                          Search or create client...
                        </span>
                      </div>

                      {/* Client dropdown list */}
                      {showClientDropdown && (
                        <div
                          style={{
                            marginTop: 8,
                            borderRadius: 5,
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(13,13,13,0.8)',
                            overflow: 'hidden',
                          }}
                        >
                          {DEMO_CLIENTS.map((client, index) => (
                            <button
                              key={client.id}
                              onClick={() => onSelectClient(client.name)}
                              className="w-full text-left font-mohave text-[16px] text-white hover:bg-white/5 active:bg-white/10 transition-colors"
                              style={{
                                padding: '12px 16px',
                                borderBottom: index < DEMO_CLIENTS.length - 1
                                  ? '1px solid rgba(255,255,255,0.2)'
                                  : 'none',
                              }}
                            >
                              {client.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* --- PROJECT NAME FIELD --- */}
                <div
                  style={{
                    opacity: isFieldActive('name') || projectName ? 1 : 0.5,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  <label
                    className="font-kosugi text-[14px] font-normal uppercase tracking-wider block"
                    style={{
                      color: isFieldActive('name') ? '#417394' : '#AAAAAA',
                      marginBottom: 12,
                      transition: 'color 0.3s ease',
                    }}
                  >
                    PROJECT NAME
                  </label>
                  <div
                    style={{
                      borderRadius: 5,
                      border: isFieldActive('name')
                        ? '2px solid rgba(65, 115, 148, 0.6)'
                        : '1px solid rgba(255,255,255,0.15)',
                      transition: 'border 0.3s ease, box-shadow 0.3s ease',
                      ...(isFieldActive('name') ? {
                        animation: 'tutorial-pulse-ring 2s ease-in-out infinite',
                      } : {}),
                    }}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={projectName}
                      readOnly
                      placeholder="Enter project name"
                      disabled={!isFieldActive('name')}
                      className="w-full font-mohave text-[16px] text-white placeholder:text-[#777777] outline-none disabled:cursor-default"
                      style={{
                        background: 'transparent',
                        padding: '12px 16px',
                        height: 44,
                        borderRadius: 5,
                      }}
                    />
                  </div>
                </div>

                {/* --- JOB STATUS (always dimmed in tutorial) --- */}
                <div style={{ opacity: 0.5 }}>
                  <label
                    className="font-kosugi text-[14px] font-normal uppercase tracking-wider block"
                    style={{ color: '#AAAAAA', marginBottom: 12 }}
                  >
                    JOB STATUS
                  </label>
                  <div
                    className="flex items-center justify-between"
                    style={{
                      padding: '12px 16px',
                      borderRadius: 5,
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    <span className="font-mohave text-[16px] text-white">
                      ESTIMATED
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: '#777777' }}>
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* === OPTIONAL SECTION PILLS === */}
            <div className="flex flex-wrap gap-2" style={{ marginTop: 16 }}>
              {/* These pills are all dimmed/disabled except ADD TASKS when phase is projectFormAddTask */}
              {[
                { title: 'SITE ADDRESS', icon: 'mappin', disabled: true },
                { title: 'DESCRIPTION', icon: 'text', disabled: true },
                { title: 'NOTES', icon: 'note', disabled: true },
                { title: 'PHOTOS', icon: 'photo', disabled: true },
              ].map((pill) => (
                <div
                  key={pill.title}
                  className="font-kosugi text-[14px] uppercase tracking-wider"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 5,
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#777777',
                    opacity: 0.5,
                    background: 'rgba(13,13,13,0.5)',
                  }}
                >
                  {pill.title}
                </div>
              ))}

              {/* ADD TASKS pill - highlighted when in addTask phase and tasks section not yet showing */}
              <button
                onClick={onAddTask}
                disabled={!isFieldActive('addTask') && !addedTask}
                className="font-kosugi text-[14px] uppercase tracking-wider flex items-center gap-1.5"
                style={{
                  padding: '8px 12px',
                  borderRadius: 5,
                  border: isFieldActive('addTask')
                    ? '2px solid rgba(65, 115, 148, 0.6)'
                    : '1px solid rgba(255,255,255,0.1)',
                  color: isFieldActive('addTask') ? '#417394' : '#777777',
                  opacity: isFieldActive('addTask') || addedTask ? 1 : 0.5,
                  background: isFieldActive('addTask') ? 'rgba(13,13,13,0.5)' : 'rgba(13,13,13,0.5)',
                  cursor: isFieldActive('addTask') ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  ...(isFieldActive('addTask') ? {
                    animation: 'tutorial-pulse-ring 2s ease-in-out infinite',
                  } : {}),
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
                ADD TASKS
              </button>
            </div>

            {/* === TASKS SECTION (expanded, shows when task is added or addTask phase) === */}
            {(addedTask || isFieldActive('addTask')) && (
              <div ref={addTaskRef} style={{ marginTop: 16 }}>
                {/* Section header */}
                <div className="flex items-center gap-1" style={{ marginBottom: 12 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: '#AAAAAA' }}>
                    <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-kosugi text-[14px] font-normal uppercase tracking-wider" style={{ color: '#AAAAAA' }}>
                    TASKS
                  </span>
                </div>

                {/* Card container */}
                <div
                  style={{
                    background: 'rgba(13,13,13,0.8)',
                    borderRadius: 5,
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '14px 16px',
                  }}
                >
                  {/* Task row (if a task has been added) */}
                  {addedTask && (
                    <div style={{ marginBottom: 12 }}>
                      <div
                        className="flex items-center gap-3"
                        style={{
                          padding: '10px 12px',
                          borderRadius: 5,
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.02)',
                        }}
                      >
                        {/* Colored left bar */}
                        <div
                          style={{
                            width: 4,
                            height: 36,
                            borderRadius: 2,
                            background: addedTask.typeColor,
                            flexShrink: 0,
                          }}
                        />
                        {/* Task info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-mohave font-medium text-[14px] text-white">
                            {addedTask.type}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-kosugi text-[11px]" style={{ color: '#AAAAAA' }}>
                              {addedTask.crew}
                            </span>
                            <span className="font-kosugi text-[11px]" style={{ color: '#777777' }}>
                              &middot;
                            </span>
                            <span className="font-kosugi text-[11px]" style={{ color: '#AAAAAA' }}>
                              {addedTask.date}
                            </span>
                          </div>
                        </div>
                        {/* Checkmark icon */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#A5B368', flexShrink: 0 }}>
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Add Task button */}
                  <button
                    onClick={onAddTask}
                    disabled={!isFieldActive('addTask')}
                    className="w-full flex items-center justify-center gap-2"
                    style={{
                      padding: '12px 16px',
                      borderRadius: 5,
                      background: isFieldActive('addTask') ? 'rgba(13,13,13,1)' : 'rgba(13,13,13,1)',
                      border: isFieldActive('addTask')
                        ? '2px solid rgba(65, 115, 148, 0.5)'
                        : '2px dashed rgba(65, 115, 148, 0.3)',
                      cursor: isFieldActive('addTask') ? 'pointer' : 'default',
                      opacity: isFieldActive('addTask') ? 1 : 0.5,
                      transition: 'all 0.3s ease',
                      ...(isFieldActive('addTask') ? {
                        animation: 'tutorial-pulse-ring 2s ease-in-out infinite',
                      } : {}),
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#417394' }}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="font-mohave text-[16px]" style={{ color: '#417394' }}>
                      {addedTask ? 'Add Another Task' : 'Add Task'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom spacing — extra room for bottom action bar */}
            <div style={{ height: 120 }} />
          </div>
        </div>
      </div>

    </div>
  )
}

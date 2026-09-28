'use client'

import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CircleDollarSign,
  Home,
  Search,
  SlidersHorizontal,
  Users,
} from 'lucide-react'
import { NumericText } from './DemoPrimitives'
import { SAMPLE } from './lifecycle-data'
import styles from './calendar-workday.module.css'

export interface CalendarWorkdayProps {
  index: number
  crew: string[]
  reduced: boolean
  paused: boolean
  complete?: boolean
}

const WEEK = [
  { day: 'MON', name: 'Monday', date: '21', iso: '2026-09-21' },
  { day: 'TUE', name: 'Tuesday', date: '22', iso: '2026-09-22' },
  { day: 'WED', name: 'Wednesday', date: '23', iso: '2026-09-23' },
  { day: 'THU', name: 'Thursday', date: '24', iso: '2026-09-24' },
  { day: 'FRI', name: 'Friday', date: '25', iso: '2026-09-25' },
  { day: 'SAT', name: 'Saturday', date: '26', iso: '2026-09-26' },
  { day: 'SUN', name: 'Sunday', date: '27', iso: '2026-09-27' },
] as const

const NAVIGATION = [
  { label: 'Home', Icon: Home },
  { label: 'Leads', Icon: Users },
  { label: 'Books', Icon: CircleDollarSign },
  { label: 'Job board', Icon: BriefcaseBusiness },
  { label: 'Schedule', Icon: CalendarDays },
] as const

function TaskStatus({ done, children }: { done: boolean; children: string }) {
  return <span className={styles.taskStatus} data-done={done}>
    {done && <Check aria-hidden="true" />}
    {children}
  </span>
}

function CalendarTask({
  title,
  owner,
  status,
  done,
  muted = false,
  previousDay,
}: {
  title: string
  owner: string
  status: string
  done: boolean
  muted?: boolean
  previousDay?: string
}) {
  return <article className={styles.taskCard} data-done={done} data-muted={muted}>
    <span className={styles.taskRail} aria-hidden="true" />
    <div className={styles.taskCardBody}>
      <div className={styles.taskHeading}>
        <span>{title}</span>
        <TaskStatus done={done}>{status}</TaskStatus>
      </div>
      <div className={styles.taskMeta}>
        {previousDay
          ? <span>{previousDay} · {owner}</span>
          : <>
            <strong><NumericText>{SAMPLE.project.toUpperCase()}</NumericText></strong>
            <span>CREW · {owner}</span>
          </>}
      </div>
    </div>
  </article>
}

/**
 * Source-faithful OPS iOS Schedule scene. Playback is entirely controlled by
 * the parent cutscene index; this component owns no clock or advancing state.
 */
export function CalendarWorkday({ index, crew, reduced, paused, complete = false }: CalendarWorkdayProps) {
  const stage = complete ? 2 : Math.min(2, Math.max(0, index))
  const thursday = stage > 0
  const selectedDate = thursday ? '24' : '23'
  const crewName = crew.length > 0 ? crew.join(' + ') : 'Assigned crew'
  const preparationDone = stage > 0
  const resurfacingDone = stage > 1
  // DayCanvas counts events on the selected date. The Wednesday preparation
  // stays visible as completed context on Thursday, but is not a Thursday event.
  const eventCount = 1

  return <section
    className={styles.calendar}
    data-stage={stage}
    data-reduced={reduced}
    data-paused={paused}
    data-complete={complete}
    aria-label={`Schedule for ${thursday ? 'Thursday, September 24' : 'Wednesday, September 23'}`}
  >
    <header className={styles.appHeader}>
      <h2>SCHEDULE</h2>
      <div className={styles.headerActions} aria-hidden="true">
        <CalendarDays />
        <Search />
      </div>
      <div className={styles.todayLine}>
        <span key={thursday ? 'sep-24' : 'sep-23'} className={styles.currentDate}>
          {thursday ? 'THURSDAY · SEP 24' : 'WEDNESDAY · SEP 23'}
        </span>
        <span className={styles.scope}><SlidersHorizontal aria-hidden="true" /> ALL TEAM</span>
      </div>
    </header>

    <section className={styles.weekSection} aria-label="This week">
      <span className={styles.weekCaption}>THIS WEEK</span>
      <ol className={styles.weekStrip}>
        {WEEK.map(({ day, name, date, iso }) => {
          const selected = date === selectedDate
          // The demo advances its simulated current day with the schedule.
          const today = selected
          const hasPreparation = date === '23'
          const hasResurfacing = date === '24'
          return <li key={iso} data-selected={selected} data-today={today}>
            <time
              dateTime={iso}
              aria-current={selected ? 'date' : undefined}
              aria-label={`${name}, September ${date}, 2026${today ? ', today' : ''}`}
            >
              <span>{day}</span>
              <b>{date}</b>
              <span className={styles.density} aria-hidden="true">
                {hasPreparation && <i data-done={preparationDone} />}
                {hasResurfacing && <i data-done={resurfacingDone} data-active={stage === 1} />}
              </span>
            </time>
          </li>
        })}
      </ol>
    </section>

    <div className={styles.dayViewport}>
      <section className={styles.dayPage} key={`workday-${selectedDate}`}>
        <header className={styles.dayHeader}>
          <div>
            <h3>{thursday ? 'Thursday' : 'Wednesday'}</h3>
            <time dateTime={thursday ? '2026-09-24' : '2026-09-23'}>
              {thursday ? 'September 24, 2026' : 'September 23, 2026'}
            </time>
          </div>
          <span className={styles.eventCount}>[ EVENTS — {eventCount} ]</span>
        </header>

        <div className={styles.taskStack}>
          {stage === 0 ? <>
            <CalendarTask title="Deck preparation" owner="Mike" status="In progress" done={false} />
            <div className={styles.nextTask}>
              <span>NEXT · THU SEP 24</span>
              <strong>Deck resurfacing</strong>
              <span>{crewName}</span>
            </div>
          </> : <>
            <CalendarTask
              title="Deck preparation"
              owner="Mike"
              status="Completed"
              done
              muted
              previousDay="Wednesday · completed"
            />
            <CalendarTask
              title="Deck resurfacing"
              owner={crewName}
              status={resurfacingDone ? 'Completed' : 'In progress'}
              done={resurfacingDone}
            />
          </>}
        </div>

        <footer className={styles.rollup} data-complete={resurfacingDone}>
          <span className={styles.rollupMark} aria-hidden="true">
            {resurfacingDone ? <Check /> : <span />}
          </span>
          <div>
            <span><NumericText>{SAMPLE.project.toUpperCase()}</NumericText></span>
            <strong>{resurfacingDone ? '2 OF 2 TASKS COMPLETE' : `${preparationDone ? '1' : '0'} OF 2 TASKS COMPLETE`}</strong>
          </div>
        </footer>
      </section>
    </div>

    <nav className={styles.tabBar} aria-label="App tabs">
      <ul>
        {NAVIGATION.map(({ label, Icon }) => <li key={label} aria-current={label === 'Schedule' ? 'page' : undefined}>
          <Icon aria-hidden="true" />
          <span className={styles.srOnly}>{label}</span>
        </li>)}
      </ul>
    </nav>
  </section>
}

export default CalendarWorkday

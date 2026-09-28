'use client'

import { CalendarDays, Check, Link2, Mail } from 'lucide-react'
import { Fragment, useEffect, useRef } from 'react'
import type { CutsceneBeat } from './cutscene-script'
import styles from './inquiry-conversation.module.css'

interface InquiryConversationProps {
  beats: CutsceneBeat[]
  index: number
  reduced: boolean
  paused: boolean
}

const NUMBER_PATTERN = /(\$[\d,]+(?:\.\d{2})?|\b\d{1,2}:\d{2}\s?(?:AM|PM)\b|\b\d+(?:[,.]\d+)?%?\b)/gi

function NumericText({ children }: { children: string }) {
  return <>{children.split(NUMBER_PATTERN).map((part, partIndex) =>
    /\d/.test(part) ? <span className={styles.numeric} key={`${part}-${partIndex}`}>{part}</span> : <Fragment key={`${part}-${partIndex}`}>{part}</Fragment>
  )}</>
}

function timeFrom(beat: CutsceneBeat) {
  if (beat.messageTime) return beat.messageTime
  return beat.eyebrow.split('·').map((part) => part.trim()).find((part) => /\d{1,2}:\d{2}/.test(part)) ?? ''
}

function signatureFrom(beat: CutsceneBeat) {
  return beat.emailSignature?.length ? beat.emailSignature : [beat.actor]
}

function EmailMessage({ beat, current }: { beat: CutsceneBeat; current: boolean }) {
  const outgoing = beat.direction === 'outgoing'
  return <li className={styles.messageRow} data-direction={outgoing ? 'outgoing' : 'incoming'} aria-current={current ? 'true' : undefined}>
    <article className={styles.message} aria-label={`Email from ${beat.actor}`}>
      <header>
        <strong>{beat.actor}</strong>
        <span><NumericText>{timeFrom(beat)}</NumericText></span>
      </header>
      <p><NumericText>{beat.body}</NumericText></p>
      <footer aria-label={`${beat.actor} email signature`}>
        {signatureFrom(beat).map((line, lineIndex) => <span key={`${line}-${lineIndex}`}>{line}</span>)}
      </footer>
    </article>
  </li>
}

function LeadStatus({ beat, current }: { beat: CutsceneBeat; current: boolean }) {
  return <li className={styles.systemRow} aria-current={current ? 'true' : undefined}>
    <div className={styles.systemEvent}>
      <span className={styles.opsMark} aria-label="OPS"><span aria-hidden="true" /></span>
      <span className={styles.eventCopy}>
        <strong>{beat.title}</strong>
        <span>{beat.body}</span>
      </span>
      <Link2 aria-hidden="true" />
    </div>
  </li>
}

function BookingStatus({ beat, current }: { beat: CutsceneBeat; current: boolean }) {
  return <li className={styles.systemRow} aria-current={current ? 'true' : undefined}>
    <div className={`${styles.systemEvent} ${styles.bookingEvent}`}>
      <span className={styles.bookingMark} aria-hidden="true"><CalendarDays /></span>
      <span className={styles.eventCopy}>
        <strong>{beat.title}</strong>
        <span>{beat.facts?.map((fact) => <span key={`${fact.label}-${fact.value}`}><b>{fact.label}</b><NumericText>{fact.value}</NumericText></span>)}</span>
      </span>
      <Check aria-hidden="true" />
    </div>
  </li>
}

function ThreadItem({ beat, current }: { beat: CutsceneBeat; current: boolean }) {
  if (beat.kind === 'email') return <EmailMessage beat={beat} current={current} />
  if (beat.kind === 'calendar') return <BookingStatus beat={beat} current={current} />
  return <LeadStatus beat={beat} current={current} />
}

export function InquiryConversation({ beats, index, reduced, paused }: InquiryConversationProps) {
  const thread = useRef<HTMLDivElement>(null)
  const reducedMotion = useRef(reduced)
  reducedMotion.current = reduced
  const safeIndex = Math.min(Math.max(index, 0), Math.max(0, beats.length - 1))
  const visible = beats.slice(0, safeIndex + 1)
  const firstEmail = beats.find((beat) => beat.kind === 'email')
  const participants = Array.from(new Set(beats.filter((beat) => beat.kind === 'email').map((beat) => beat.actor)))

  useEffect(() => {
    const panel = thread.current
    if (!panel) return
    if (typeof panel.scrollTo === 'function') panel.scrollTo({ top: panel.scrollHeight, behavior: reducedMotion.current ? 'auto' : 'smooth' })
    else panel.scrollTop = panel.scrollHeight
  }, [safeIndex])

  return <section
    className={styles.conversation}
    data-paused={paused}
    data-reduced={reduced}
    aria-label="Inquiry email conversation"
  >
    <header className={styles.threadHeader}>
      <span className={styles.mailMark} aria-hidden="true"><Mail /></span>
      <span className={styles.threadIdentity}>
        <span>EMAIL THREAD</span>
        <h2>{firstEmail?.title ?? 'Inquiry'}</h2>
        <span>{participants.join(' · ')}</span>
      </span>
    </header>

    <div
      className={styles.thread}
      ref={thread}
      role="region"
      aria-label="Email conversation"
      tabIndex={0}
    >
      <ol className={styles.messages}>
        {visible.map((beat, visibleIndex) => <ThreadItem beat={beat} current={visibleIndex === visible.length - 1} key={beat.id} />)}
      </ol>
    </div>
  </section>
}

export default InquiryConversation

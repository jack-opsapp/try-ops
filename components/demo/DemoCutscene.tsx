'use client'

import Image from 'next/image'
import {
  CalendarDays,
  Camera,
  Check,
  CirclePause,
  CirclePlay,
  FileText,
  Mail,
  ReceiptText,
  SkipForward,
} from 'lucide-react'
import { Fragment, type ReactNode } from 'react'
import { SAMPLE } from './lifecycle-data'
import type { CutsceneBeat } from './cutscene-script'
import styles from './demo-cutscene.module.css'

interface DemoCutsceneProps {
  beat: CutsceneBeat
  index: number
  total: number
  paused: boolean
  reduced: boolean
  onPause: () => void
  onSkip: () => void
}

const ACTOR_IMAGES: Record<string, string> = {
  mike: '/avatars/mike.png',
  nick: '/avatars/nick.png',
  pete: '/avatars/pete.png',
  rick: '/avatars/rick.png',
  tom: '/avatars/tom.png',
}

const NUMBER_PATTERN = /(\$[\d,]+(?:\.\d{2})?|\b\d{1,2}:\d{2}\s?(?:AM|PM)\b|\b\d+(?:[,.]\d+)?%?\b)/gi

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function NumericText({ children }: { children: string }) {
  return <>{children.split(NUMBER_PATTERN).map((part, index) =>
    /\d/.test(part) ? <span className={styles.numeric} key={`${part}-${index}`}>{part}</span> : <Fragment key={`${part}-${index}`}>{part}</Fragment>
  )}</>
}

function ActorMark({ beat }: { beat: CutsceneBeat }) {
  const firstName = beat.actor.trim().split(/\s+/)[0]?.toLowerCase() ?? ''
  const image = ACTOR_IMAGES[firstName]
  const systemActor = beat.actor.trim().toLowerCase() === 'ops' || beat.actorRole.toLowerCase().includes('system')

  if (systemActor) {
    return <span className={`${styles.actorMark} ${styles.systemMark}`} aria-label="OPS system"><span aria-hidden="true" /></span>
  }

  if (image) {
    return <span className={styles.actorMark}><Image src={image} alt={beat.actor} fill sizes="40px" /></span>
  }

  return <span className={styles.actorMark} aria-label={beat.actor}>{initials(beat.actor)}</span>
}

function Provenance({ beat }: { beat: CutsceneBeat }) {
  return <div className={styles.provenance}>
    <ActorMark beat={beat} />
    <span className={styles.actorIdentity}>
      <strong>{beat.actor}</strong>
      <span>{beat.actorRole}</span>
    </span>
    {beat.kind === 'email' && <span className={styles.direction}>{beat.direction === 'outgoing' ? 'OUTGOING' : 'INCOMING'}</span>}
  </div>
}

function Facts({ facts }: { facts?: CutsceneBeat['facts'] }) {
  if (!facts?.length) return null
  return <dl className={styles.facts}>{facts.map((fact) => <div key={`${fact.label}-${fact.value}`}>
    <dt>{fact.label}</dt>
    <dd><NumericText>{fact.value}</NumericText></dd>
  </div>)}</dl>
}

function EmailArtifact({ beat }: { beat: CutsceneBeat }) {
  const outgoing = beat.direction === 'outgoing'
  return <div className={styles.emailArtifact}>
    <div className={styles.artifactBar}>
      <span><Mail aria-hidden="true" />{outgoing ? 'SENT EMAIL' : 'NEW EMAIL'}</span>
    </div>
    <dl className={styles.mailFields}>
      <div><dt>From</dt><dd>{outgoing ? 'You' : beat.actor}</dd></div>
      <div><dt>{outgoing ? 'To' : 'Subject'}</dt><dd>{outgoing ? SAMPLE.client : beat.title}</dd></div>
      {outgoing && <div><dt>Subject</dt><dd>{beat.title}</dd></div>}
    </dl>
    <p className={styles.mailCopy}><NumericText>{beat.detail ?? beat.body}</NumericText></p>
    {beat.detail && <p className={styles.mailContext}><NumericText>{beat.body}</NumericText></p>}
    <Facts facts={beat.facts} />
  </div>
}

function RecordArtifact({ beat }: { beat: CutsceneBeat }) {
  return <div className={styles.documentArtifact}>
    <div className={styles.documentHeading}>
      <FileText aria-hidden="true" />
      <span><span>{beat.eyebrow}</span><strong><NumericText>{beat.title}</NumericText></strong></span>
    </div>
    <p><NumericText>{beat.body}</NumericText></p>
    {beat.detail && <span className={styles.detail}><NumericText>{beat.detail}</NumericText></span>}
    <Facts facts={beat.facts} />
  </div>
}

function PhotoArtifact({ beat }: { beat: CutsceneBeat }) {
  return <figure className={styles.photoArtifact}>
    <div className={styles.photoFrame}>
      {beat.image ? <Image data-cutscene-photo src={beat.image} alt={beat.title} fill sizes="(max-width: 480px) 88vw, 520px" priority /> : <Camera aria-hidden="true" />}
    </div>
    <figcaption>
      <span><Camera aria-hidden="true" />{beat.eyebrow}</span>
      <strong><NumericText>{beat.title}</NumericText></strong>
      <p><NumericText>{beat.body}</NumericText></p>
      {beat.detail && <span className={styles.detail}><NumericText>{beat.detail}</NumericText></span>}
      <Facts facts={beat.facts} />
    </figcaption>
  </figure>
}

function CalendarArtifact({ beat }: { beat: CutsceneBeat }) {
  return <div className={styles.calendarArtifact}>
    <div className={styles.calendarRail} aria-hidden="true">
      <CalendarDays />
      <span />
      <Check />
    </div>
    <div className={styles.calendarEvent}>
      <span className={styles.eyebrow}>{beat.eyebrow}</span>
      <h2><NumericText>{beat.title}</NumericText></h2>
      {beat.detail && <span className={styles.eventTime}><NumericText>{beat.detail}</NumericText></span>}
      <p><NumericText>{beat.body}</NumericText></p>
      <Facts facts={beat.facts} />
    </div>
  </div>
}

function EstimateArtifact({ beat }: { beat: CutsceneBeat }) {
  return <div className={styles.estimateArtifact}>
    <div className={styles.estimateHeading}>
      <span><FileText aria-hidden="true" />{beat.eyebrow}</span>
      {beat.detail && <span><NumericText>{beat.detail}</NumericText></span>}
    </div>
    <h2><NumericText>{beat.title}</NumericText></h2>
    <p><NumericText>{beat.body}</NumericText></p>
    <Facts facts={beat.facts} />
  </div>
}

function PaymentArtifact({ beat }: { beat: CutsceneBeat }) {
  return <div className={styles.paymentArtifact}>
    <span className={styles.receiptMark}><ReceiptText aria-hidden="true" /></span>
    <span className={styles.eyebrow}>{beat.eyebrow}</span>
    <h2><NumericText>{beat.title}</NumericText></h2>
    <p><NumericText>{beat.body}</NumericText></p>
    <Facts facts={beat.facts} />
    {beat.detail && <span className={styles.detail}><Check aria-hidden="true" /><NumericText>{beat.detail}</NumericText></span>}
  </div>
}

function Artifact({ beat }: { beat: CutsceneBeat }): ReactNode {
  switch (beat.kind) {
    case 'email': return <EmailArtifact beat={beat} />
    case 'photo': return <PhotoArtifact beat={beat} />
    case 'calendar': return <CalendarArtifact beat={beat} />
    case 'estimate': return <EstimateArtifact beat={beat} />
    case 'payment': return <PaymentArtifact beat={beat} />
    case 'record': return <RecordArtifact beat={beat} />
  }
}

export function DemoCutscene({ beat, index, total, paused, reduced, onPause, onSkip }: DemoCutsceneProps) {
  const count = Math.max(1, total)
  const current = Math.min(count, Math.max(1, index + 1))

  return <section
    className={styles.cutscene}
    data-paused={paused}
    data-reduced={reduced}
    aria-label="Demo scene"
  >
    <header className={styles.sceneHeader}>
      <span>SCENE <b>{String(current).padStart(2, '0')}</b> / {String(count).padStart(2, '0')}</span>
      <ol className={styles.progress} aria-hidden="true">
        {Array.from({ length: count }, (_, marker) => <li
          key={marker}
          data-state={marker + 1 < current ? 'previous' : marker + 1 === current ? 'current' : 'next'}
        />)}
      </ol>
    </header>

    <div className={styles.controls}>
      <button type="button" aria-pressed={paused} aria-label={paused ? 'Resume scene' : 'Pause scene'} onClick={onPause}>
        {paused ? <CirclePlay aria-hidden="true" /> : <CirclePause aria-hidden="true" />}
        <span>{paused ? 'Resume scene' : 'Pause scene'}</span>
      </button>
      <button type="button" aria-label="Skip scene" onClick={onSkip}>
        <span>Skip scene</span>
        <SkipForward aria-hidden="true" />
      </button>
    </div>

    <div className={styles.stage} key={`${beat.id}-stage`}>
      <article
        className={styles.beat}
        data-kind={beat.kind}
        data-direction={beat.direction ?? 'incoming'}
        key={beat.id}
      >
        <Provenance beat={beat} />
        <Artifact beat={beat} />
      </article>
    </div>

    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">
      {beat.actor}. {beat.title}. {beat.body}
    </p>
  </section>
}

export default DemoCutscene

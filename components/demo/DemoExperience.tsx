'use client'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { ArrowLeft, ArrowRight, Briefcase, HardHat, RotateCcw } from 'lucide-react'
import { useDemoFunnel } from '@/lib/demo/use-demo-funnel'
import type { DemoEvent, DemoStep } from '@/lib/demo/contracts'
import { initialLifecycleState, lifecycleReducer, restoreLifecycleState, replayCutscene, LIFECYCLE_STORAGE_KEY, SCENES, type LifecycleAction, type Scene } from './lifecycle-state'
import { DemoNotification, type DemoNotificationMessage } from './DemoNotification'
import { useCutscenePlayback } from './useCutscenePlayback'
import { ActionGuidance } from './ActionGuidance'
import { cutsceneScript } from './cutscene-script'
import { DemoCutscene } from './DemoCutscene'
import { FeatureCallout } from './FeatureCallout'
import { SAMPLE, money } from './lifecycle-data'
import { sceneCopy } from './lifecycle-copy'
import { RoleScenes } from './RoleScenes'
import { IntakeBillingScenes } from './IntakeBillingScenes'
import { VisitScenes } from './VisitScenes'
import { ProjectScenes } from './ProjectScenes'
import styles from './demo.module.css'

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
const HISTORY_POSITION = 'opsLifecyclePosition'
const HISTORY_GENERATION = 'opsLifecycleGeneration'
function readHistoryPosition(value: unknown): number | null {
  if (!value || typeof value !== 'object') return null
  const position = (value as Record<string, unknown>)[HISTORY_POSITION]
  return Number.isInteger(position) && (position as number) >= 0 ? position as number : null
}
function readHistoryGeneration(value: unknown): number | null {
  if (!value || typeof value !== 'object') return null
  const generation = (value as Record<string, unknown>)[HISTORY_GENERATION]
  return Number.isInteger(generation) && (generation as number) >= 0 ? generation as number : null
}
function subscribeMotion(listener: () => void) {
  const media = window.matchMedia?.(REDUCED_QUERY)
  media?.addEventListener('change', listener)
  return () => media?.removeEventListener('change', listener)
}
function reducedSnapshot() { return window.matchMedia?.(REDUCED_QUERY).matches ?? false }
function serverMotionSnapshot() { return true }
// Production diagnostic groups stay compatible; local resume data is versioned separately.
export function diagnosticStep(scene: Scene): DemoStep {
  return scene === 'activity' || scene === 'billing' ? 'complete' : scene === 'crew' || scene === 'compose' ? 'crew' : 'assign'
}
export function DemoExperience({ exitHref = '/' }: { exitHref?: string }) {
  const [state, setState] = useState(initialLifecycleState)
  const current = useRef(state)
  const [ready, setReady] = useState(false)
  const [accountingOpen, setAccountingOpen] = useState(false)
  const [updatesPaused, setUpdatesPaused] = useState(false)
  const [notification, setNotification] = useState<DemoNotificationMessage | null>(null)
  const [toolOpen, setToolOpen] = useState(false)
  const [resumed, setResumed] = useState(false)
  const [direction, setDirection] = useState(1)
  const initialized = useRef(false)
  const startedAt = useRef<number | null>(null)
  const errors = useRef(new Set<DemoEvent['errorCode']>())
  const content = useRef<HTMLDivElement>(null)
  const guidanceRoot = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const playbackSurface = useRef<HTMLDivElement>(null)
  const focusNext = useRef(false)
  const historyPosition = useRef(0)
  const historyGeneration = useRef(0)
  const reduced = useSyncExternalStore(subscribeMotion, reducedSnapshot, serverMotionSnapshot)
  const { signupHref, track } = useDemoFunnel()
  const report = useCallback((action: DemoEvent['action'], scene: Scene, errorCode?: DemoEvent['errorCode']) => {
    const elapsedMs = Math.min(86_400_000, Math.max(0, Math.round(performance.now() - (startedAt.current ?? performance.now()))))
    try { track({ action, step: action === 'task_completed' ? 'complete' : diagnosticStep(scene), elapsedMs, ...(errorCode ? { errorCode } : {}) }) } catch { /* Diagnostics never interrupt sample work or signup links. */ }
  }, [track])
  const reportError = useCallback((code: NonNullable<DemoEvent['errorCode']>) => {
    if (errors.current.has(code)) return
    errors.current.add(code)
    report('error', current.current.scene, code)
  }, [report])
  const persist = useCallback((next: typeof state) => {
    try { window.sessionStorage.setItem(LIFECYCLE_STORAGE_KEY, JSON.stringify(next)) } catch { reportError('storage_unavailable') }
  }, [reportError])
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    startedAt.current = performance.now()
    let restored = initialLifecycleState()
    try { restored = restoreLifecycleState(window.sessionStorage.getItem(LIFECYCLE_STORAGE_KEY)) } catch { reportError('storage_unavailable') }
    current.current = restored
    setState(restored)
    setResumed(restored.furthest > 0)
    setReady(true)
    try {
      historyPosition.current = readHistoryPosition(window.history.state) ?? 0
      historyGeneration.current = readHistoryGeneration(window.history.state) ?? 0
      window.history.replaceState({ ...window.history.state, opsLifecycleScene: restored.scene, [HISTORY_POSITION]: historyPosition.current, [HISTORY_GENERATION]: historyGeneration.current }, '')
    } catch { /* Explicit controls still work. */ }
    if (restored.furthest === 0) report('started', 'role')
  }, [report, reportError])
  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const requested: unknown = event.state?.opsLifecycleScene
      if (!SCENES.includes(requested as Scene)) return
      const previous = current.current
      const previousPosition = historyPosition.current
      const requestedPosition = readHistoryPosition(event.state)
      const requestedGeneration = readHistoryGeneration(event.state)
      if (requestedGeneration !== null && requestedGeneration !== historyGeneration.current) {
        historyPosition.current = 0
        try {
          window.history.replaceState({ ...event.state, opsLifecycleScene: previous.scene, [HISTORY_POSITION]: 0, [HISTORY_GENERATION]: historyGeneration.current }, '')
        } catch { /* The current demo state remains the source of truth. */ }
        return
      }
      const next = lifecycleReducer(previous, { type: 'NAVIGATE', scene: requested as Scene })
      if (requestedPosition !== null) historyPosition.current = requestedPosition
      if (next.scene === previous.scene) return
      current.current = next
      setDirection(SCENES.indexOf(next.scene) < SCENES.indexOf(previous.scene) ? -1 : 1)
      focusNext.current = true
      setState(next)
      setNotification(null)
      setUpdatesPaused(false)
      persist(next)
      const movingBackward = requestedPosition !== null
        ? requestedPosition < previousPosition
        : SCENES.indexOf(next.scene) < SCENES.indexOf(previous.scene)
      if (movingBackward) report('back', next.scene)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [persist, report])
  useEffect(() => {
    if (!focusNext.current) return
    focusNext.current = false
    content.current?.scrollTo?.({ top: 0, behavior: 'instant' })
    window.scrollTo?.({ top: 0, behavior: 'instant' })
    heading.current?.focus({ preventScroll: true })
  }, [state.scene, state.cutscene?.id])
  const dispatch = useCallback((action: LifecycleAction) => {
    if (action.type === 'BACK' && historyPosition.current > 0) {
      try {
        if (typeof window.history.back === 'function') {
          window.history.back()
          return
        }
      } catch { /* Fall through to durable state navigation. */ }
    }
    const previous = current.current
    const next = lifecycleReducer(previous, action)
    if (next === previous) return
    current.current = next
    setState(next)
    setResumed(false)
    persist(next)
    const automatic = action.type === 'ADVANCE_CUTSCENE'
    let update: DemoNotificationMessage | null = null
    const finished = previous.cutscene && !next.cutscene && (action.type === 'ADVANCE_CUTSCENE' || action.type === 'SKIP_CUTSCENE') && !previous.cutscene.replay ? previous.cutscene.id : null
    if (finished === 'inquiry') update = { id: 'visit-booked', title: 'Site visit booked', body: 'Tuesday at 10:00 AM. Confirmed in your email conversation.', context: 'Monday · sample update' }
    if (finished === 'site-visit') update = { id: 'visit-complete', title: 'Site visit complete', body: `${next.visitAssignee} sent the checklist, measurements and photo.`, context: 'Tuesday · sample update' }
    if (finished === 'approval') update = { id: 'estimate-approved', title: 'Estimate approved', body: 'Alex accepted. Your project and tasks are ready.', context: 'Wednesday · sample update' }
    if (next.cutscene?.id === 'billing' && next.cutscene.beat === 1 && !previous.invoiceCreated) update = { id: 'invoice-sent', title: 'Invoice sent', body: `${SAMPLE.invoiceNumber} · ${money(SAMPLE.total)} sent to Alex.`, context: 'Thursday · sample update' }
    if (next.cutscene?.id === 'billing' && next.cutscene.beat === 2 && !previous.paymentRecorded) update = { id: 'payment-recorded', title: 'Payment recorded', body: `${money(SAMPLE.total)} received outside OPS. Balance: ${money(0)}.`, context: 'Friday · sample update' }
    if (finished === 'billing') update = { id: 'payment-recorded', title: 'Payment recorded', body: `${money(SAMPLE.total)} received outside OPS. Balance: ${money(0)}.`, context: 'Friday · sample update' }
    setNotification(previousNotification => previousNotification && update
      && previousNotification.id === update.id
      && previousNotification.title === update.title
      && previousNotification.body === update.body
      && previousNotification.context === update.context
      ? previousNotification
      : update)
    if (action.type !== 'ADVANCE_CUTSCENE') setUpdatesPaused(false)
    if (next.scene !== previous.scene || action.type === 'RESTART' || action.type === 'REPLAY_CUTSCENE' || action.type === 'SKIP_CUTSCENE') {
      focusNext.current = !automatic
      setDirection(SCENES.indexOf(next.scene) < SCENES.indexOf(previous.scene) ? -1 : 1)
      try {
        const replace = action.type === 'BACK' || action.type === 'RESTART' || action.type === 'REPLAY_CUTSCENE' || automatic || action.type === 'SKIP_CUTSCENE'
        if (action.type === 'RESTART') historyGeneration.current += 1
        const position = action.type === 'RESTART' ? 0 : replace ? historyPosition.current : historyPosition.current + 1
        const snapshot = { ...window.history.state, opsLifecycleScene: next.scene, [HISTORY_POSITION]: position, [HISTORY_GENERATION]: historyGeneration.current }
        if (replace) {
          window.history.replaceState(snapshot, '')
          historyPosition.current = position
        }
        else {
          window.history.pushState(snapshot, '')
          historyPosition.current = position
        }
      } catch { /* Navigation does not depend on History support. */ }
    }
    if (action.type === 'ASSIGN_CREW' && !previous.crewAssigned && next.crewAssigned) report('job_assigned', next.scene)
    if (action.type === 'SELECT_ROLE' && next.role === 'crew') report('crew_viewed', next.scene)
    if (action.type === 'COMPLETE_TASK' && !previous.taskCompleted && next.taskCompleted) report('task_completed', next.scene)
    if (action.type === 'BACK') report('back', next.scene)
    if (action.type === 'RESTART') report('restart', next.scene)
  }, [persist, report])
  useCutscenePlayback(state, ready, updatesPaused || accountingOpen || toolOpen, playbackSurface, dispatch)
  const sequence = state.cutscene ? cutsceneScript(state.cutscene.id, state) : state.scene === 'calendar' ? cutsceneScript('workday', state) : null
  const completionNotification: DemoNotificationMessage | null = state.scene === 'calendar' && state.taskCompleted && !state.cutscene
    ? { id: 'project-complete', title: `${SAMPLE.project} Complete`, body: `${state.assignedCrew[0]} posted the finished photo and note. Tap to open the project.`, context: 'Thursday · sample update' }
    : null
  const shownNotification = completionNotification ?? notification
  const copy = sceneCopy(state)
  if (state.cutscene && sequence) { copy.title = sequence.title; copy.body = sequence.body }
  const chapters = copy.chapters
  const completed = state.role === 'crew' ? !!state.postedNote : state.visited.includes('billing')
  const hint = toolOpen && state.scene === 'estimate' ? 'Explore the sample deck tool, then return to your estimate.'
    : state.cutscene ? updatesPaused ? 'Scene paused. Resume when you’re ready.' : 'Watch the handoff. Your next action follows.'
    : state.scene === 'visit' && state.scopeConfirmed && state.visitPhoto ? 'Photo attached. Tap DONE to review your visit.'
    : state.scene === 'visit' && state.scopeConfirmed ? 'Scope confirmed. Add the sample site photo.'
    : state.scene === 'project' && state.crewAssigned ? 'The crew is assigned. Return to the calendar to follow the work.'
    : state.scene === 'crew' && state.taskCompleted ? 'Task complete. Post the finished photo and a note.' : copy.hint
  const RoleIcon = state.role === 'crew' ? HardHat : Briefcase
  const sceneProps = { state, dispatch }
  return <div ref={guidanceRoot} className={styles.demo} data-demo-scene={state.scene} data-demo-cutscene={!!state.cutscene} data-motion={reduced ? 'reduced' : 'full'}>
    <ActionGuidance root={guidanceRoot} />
    <header className={styles.header}>
      <div className={styles.brand}><span role="img" aria-label="OPS" className={styles.logo} /><span className={styles.sampleLabel}>INTERACTIVE DEMO<span>Sample company · sample data</span></span></div>
      <div className={styles.headerActions}><a className={styles.topTrial} href={state.role === 'crew' ? '/download' : signupHref} onClick={()=>{ if (state.role !== 'crew') report('signup_clicked', state.scene) }}>{state.role === 'crew' ? 'Get the app' : 'Try OPS free'} <ArrowRight aria-hidden="true" /></a><a className={styles.exit} href={exitHref} onClick={()=>report('exit', state.scene)}>Exit demo</a></div>
    </header>
    <main className={styles.stage}>
      <aside className={styles.guide}>
        <div className={styles.guideNarrative}>
        <div className={styles.chapterLabel}>{state.scene === 'role' ? <span>ONE JOB · YOUR SIDE OF THE TEAM</span> : <><span>0{copy.chapter + 1}</span><span>/ 0{chapters.length} · {chapters[copy.chapter]}</span></>}</div>
        <h1 ref={heading} tabIndex={-1} className={styles.headline}>{copy.title}</h1>
        <p className={styles.description}>{copy.body}</p>
        {state.scene !== 'role' && <ol className={styles.chapters} aria-label="Demo chapters">{chapters.map((chapter,index)=><li key={chapter} aria-current={copy.chapter===index?'step':undefined} data-complete={copy.chapter>index}><span className={styles.chapterMark}>{copy.chapter>index?'✓':`0${index+1}`}</span><span>{chapter}</span></li>)}</ol>}
        <div className={styles.instruction}><span className={styles.instructionMark} aria-hidden="true" /><p>{hint}</p></div>
        {resumed && <p className={styles.resume} role="status">Your sample job is where you left it.</p>}
        {state.scene !== 'role' && <div className={styles.mobileProgress} aria-hidden="true">{chapters.map((chapter,index)=><span key={chapter} data-reached={copy.chapter>=index}><i /></span>)}</div>}
        </div>
      </aside>
      <section className={styles.product} aria-label="Interactive OPS sample">
        <div className={styles.roleBar} key={copy.role}><span className={styles.role}><RoleIcon aria-hidden="true"/>{copy.role}</span><span className={styles.productLabel}>OPS FOR IPHONE</span></div>
        <DemoNotification notification={shownNotification} onOpen={completionNotification ? () => dispatch({ type: 'OPEN_COMPLETED_PROJECT' }) : undefined} onDismiss={completionNotification ? undefined : () => setNotification(null)} reduced={reduced}/>
        <div className={styles.appViewport} ref={content}>
          {!ready ? <div className={styles.loading} aria-busy="true"><span className={styles.logo} aria-hidden="true"/><p>Opening your sample job.</p><a href={signupHref}>Start my free trial</a></div> : <LazyMotion features={domAnimation} strict><m.div key={state.scene === 'calendar' ? 'calendar' : state.cutscene ? `cutscene:${state.cutscene.id}` : state.scene} initial={reduced?{opacity:0}:{opacity:0,x:direction*12}} animate={{opacity:1,x:0}} transition={{duration:reduced?.15:.25,ease:[.22,1,.36,1]}} className={styles.scene}>
            {sequence && (state.cutscene || state.scene === 'calendar') ? <><div ref={playbackSurface}><DemoCutscene beat={sequence.beats[state.cutscene?.beat ?? 2]} conversation={state.cutscene?.id === 'inquiry' ? sequence.beats : undefined} calendarCrew={state.scene === 'calendar' || state.cutscene?.id === 'workday' ? state.assignedCrew : undefined} complete={!state.cutscene} index={state.cutscene?.beat ?? 2} total={sequence.beats.length} paused={updatesPaused} reduced={reduced} onPause={() => setUpdatesPaused(value => !value)} onSkip={() => dispatch({ type: 'SKIP_CUTSCENE' })}/></div>{state.cutscene?.id === 'billing' && <div className={styles.sceneCallout}><FeatureCallout kind="accounting"/></div>}</> : state.scene === 'role' ? <RoleScenes {...sceneProps}/> : ['inquiry','booked','billing'].includes(state.scene) ? <IntakeBillingScenes {...sceneProps} onAccountingPreviewChange={setAccountingOpen}/> : ['visit','review','estimate','accepted'].includes(state.scene) ? <VisitScenes {...sceneProps} onToolPreviewChange={setToolOpen}/> : <ProjectScenes {...sceneProps}/>}
          </m.div></LazyMotion>}
        </div>
        <div className={styles.timeline}><span className={styles.time}>{state.cutscene ? sequence?.beats[state.cutscene.beat].eyebrow : copy.time}</span>{!state.cutscene && replayCutscene(state) && <button type="button" className={styles.replay} onClick={() => dispatch({ type: 'REPLAY_CUTSCENE' })}><RotateCcw aria-hidden="true"/>Replay scene</button>}{!state.cutscene && state.scene==='project' && state.crewAssigned && <button data-demo-next="true" className={styles.next} type="button" onClick={()=>dispatch({type:'NAVIGATE', scene:'calendar'})}>View calendar <ArrowRight aria-hidden="true"/></button>}</div>
      </section>
      {completed && !state.cutscene && <div className={styles.conversion}>
        {state.role === 'crew' ? <>
          <a data-demo-next={state.scene === 'activity'} className={styles.trial} href="/download">Get OPS <ArrowRight aria-hidden="true" /></a>
          <span>Already invited? <a href="https://app.opsapp.co/login">Sign in to join your team</a></span>
        </> : <>
          <a data-demo-next={state.scene === 'billing'} className={styles.trial} href={signupHref} onClick={()=>report('signup_clicked',state.scene)}>Start my free trial <ArrowRight aria-hidden="true" /></a>
          <span>30 days · No credit card</span>
        </>}
      </div>}

    </main>
    <footer className={styles.navigation}>
      <button type="button" onClick={()=>dispatch({type:'BACK'})} disabled={!ready||state.scene==='role'}><ArrowLeft aria-hidden="true"/> Back</button>
      <span>One job. Every handoff.</span>
      <button type="button" onClick={()=>dispatch({type:'RESTART'})} aria-label="Restart demo"><RotateCcw aria-hidden="true"/> Restart</button>
    </footer>
    <p className={styles.srOnly} aria-live={shownNotification || state.cutscene ? 'off' : 'polite'} aria-atomic="true">{ready?`${copy.role}. ${hint}`:'Opening sample demo.'}</p>
  </div>
}

'use client'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import { useDemoFunnel } from '@/lib/demo/use-demo-funnel'
import type { DemoEvent, DemoStep } from '@/lib/demo/contracts'
import { initialLifecycleState, lifecycleReducer, restoreLifecycleState, LIFECYCLE_STORAGE_KEY, SCENES, type LifecycleAction, type Scene } from './lifecycle-state'
import { CHAPTERS, SCENE_COPY } from './lifecycle-copy'
import { IntakeBillingScenes } from './IntakeBillingScenes'
import { VisitScenes } from './VisitScenes'
import { ProjectScenes } from './ProjectScenes'
import styles from './demo.module.css'

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
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
  const [resumed, setResumed] = useState(false)
  const [direction, setDirection] = useState(1)
  const initialized = useRef(false)
  const startedAt = useRef<number | null>(null)
  const errors = useRef(new Set<DemoEvent['errorCode']>())
  const content = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const focusNext = useRef(false)
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
    try { window.history.replaceState({ ...window.history.state, opsLifecycleScene: restored.scene }, '') } catch { /* Explicit controls still work. */ }
    if (restored.furthest === 0) report('started', 'inquiry')
  }, [report, reportError])
  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const requested: unknown = event.state?.opsLifecycleScene
      if (!SCENES.includes(requested as Scene)) return
      const previous = current.current
      const next = lifecycleReducer(previous, { type: 'NAVIGATE', scene: requested as Scene })
      if (next.scene === previous.scene) return
      current.current = next
      setDirection(SCENES.indexOf(next.scene) < SCENES.indexOf(previous.scene) ? -1 : 1)
      focusNext.current = true
      setState(next)
      persist(next)
      report('back', next.scene)
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
  }, [state.scene])
  const dispatch = useCallback((action: LifecycleAction) => {
    const previous = current.current
    const next = lifecycleReducer(previous, action)
    if (next === previous) return
    current.current = next
    setState(next)
    setResumed(false)
    persist(next)
    if (next.scene !== previous.scene || action.type === 'RESTART') {
      focusNext.current = true
      setDirection(SCENES.indexOf(next.scene) < SCENES.indexOf(previous.scene) ? -1 : 1)
      try {
        const snapshot = { ...window.history.state, opsLifecycleScene: next.scene }
        if (action.type === 'RESTART') window.history.replaceState(snapshot, '')
        else window.history.pushState(snapshot, '')
      } catch { /* Navigation does not depend on History support. */ }
    }
    if (!previous.crewAssigned && next.crewAssigned) report('job_assigned', next.scene)
    if (next.scene === 'crew' && previous.furthest < SCENES.indexOf('crew')) report('crew_viewed', next.scene)
    if (!previous.taskCompleted && next.taskCompleted) report('task_completed', next.scene)
    if (action.type === 'BACK') report('back', next.scene)
    if (action.type === 'RESTART') report('restart', next.scene)
  }, [persist, report])
  const narrator = SCENE_COPY[state.scene]
  const operator = state.assignedCrew[0] || 'Pete'
  const copy = { ...narrator, role: narrator.role.replace('PETE', operator.toUpperCase()), body: narrator.body.replaceAll('Pete', operator) }
  const completed = !!state.postedNote
  const hint = state.scene === 'visit' && state.visitPhoto ? 'Photo attached to the checklist. Tap DONE to review.'
    : state.scene === 'project' && state.crewAssigned ? 'Crew assigned. Scheduling is a separate step. Jump to their workday below.'
    : state.scene === 'crew' && state.taskCompleted ? 'Task complete. Add a photo and a note to show the owner.'
    : state.scene === 'billing' && state.paymentRecorded ? 'Payment recorded. The invoice balance is clear.' : copy.hint
  const sceneProps = { state, dispatch }
  return <div className={styles.demo} data-demo-scene={state.scene} data-motion={reduced ? 'reduced' : 'full'}>
    <header className={styles.header}>
      <div className={styles.brand}><span role="img" aria-label="OPS" className={styles.logo} /><span className={styles.sampleLabel}>INTERACTIVE DEMO<span>Sample company · sample data</span></span></div>
      <div className={styles.headerActions}><a className={styles.topTrial} href={signupHref} onClick={()=>report('signup_clicked', state.scene)}>Try OPS free <ArrowRight aria-hidden="true" /></a><a className={styles.exit} href={exitHref} onClick={()=>report('exit', state.scene)}>Exit demo</a></div>
    </header>
    <main className={styles.stage}>
      <aside className={styles.guide}>
        <div className={styles.guideNarrative}>
        <div className={styles.chapterLabel}><span>0{copy.chapter + 1}</span><span>/ 05 · {CHAPTERS[copy.chapter]}</span></div>
        <h1 ref={heading} tabIndex={-1} className={styles.headline}>{copy.title}</h1>
        <p className={styles.description}>{copy.body}</p>
        <ol className={styles.chapters} aria-label="Demo chapters">{CHAPTERS.map((chapter,index)=><li key={chapter} aria-current={copy.chapter===index?'step':undefined} data-complete={copy.chapter>index}><span className={styles.chapterMark}>{copy.chapter>index?'✓':`0${index+1}`}</span><span>{chapter}</span></li>)}</ol>
        <div className={styles.instruction}><span className={styles.instructionMark} aria-hidden="true" /><p>{hint}</p></div>
        {resumed && <p className={styles.resume} role="status">Your sample job is where you left it.</p>}
        <div className={styles.mobileProgress} aria-hidden="true">{CHAPTERS.map((chapter,index)=><span key={chapter} data-reached={copy.chapter>=index}><i /></span>)}</div>
        </div>
      </aside>
      <section className={styles.product} aria-label="Interactive OPS sample">
        <div className={styles.roleBar}><span className={styles.role}><span aria-hidden="true" className={styles.statusDot}/>{copy.role}</span><span className={styles.productLabel}>OPS FOR IPHONE</span></div>
        <div className={styles.appViewport} ref={content}>
          {!ready ? <div className={styles.loading} aria-busy="true"><span className={styles.logo} aria-hidden="true"/><p>Opening your sample job.</p><a href={signupHref}>Start my free trial</a></div> : <LazyMotion features={domAnimation} strict><m.div key={state.scene} initial={reduced?{opacity:0}:{opacity:0,x:direction*12}} animate={{opacity:1,x:0}} transition={{duration:reduced?.15:.25,ease:[.22,1,.36,1]}} className={styles.scene}>
            {['inquiry','booked','billing'].includes(state.scene) ? <IntakeBillingScenes {...sceneProps}/> : ['visit','review','estimate'].includes(state.scene) ? <VisitScenes {...sceneProps}/> : <ProjectScenes {...sceneProps}/>}
          </m.div></LazyMotion>}
        </div>
        <div className={styles.timeline}><span className={styles.time}>{copy.time}</span>{state.scene==='project' && state.crewAssigned && <button className={styles.next} type="button" onClick={()=>dispatch({type:'VIEW_CREW'})}>View crew on the workday <ArrowRight aria-hidden="true"/></button>}</div>
      </section>
      {completed && <div className={styles.conversion}>
        <a className={styles.trial} href={signupHref} onClick={()=>report('signup_clicked',state.scene)}>Start my free trial <ArrowRight aria-hidden="true" /></a>
        <span>30 days · No credit card</span>
        {state.scene==='activity' && <button className={styles.more} type="button" onClick={()=>dispatch({type:'OPEN_BILLING'})}>See billing & accounting <ArrowRight aria-hidden="true" /></button>}
      </div>}
    </main>
    <footer className={styles.navigation}>
      <button type="button" onClick={()=>dispatch({type:'BACK'})} disabled={!ready||state.scene==='inquiry'}><ArrowLeft aria-hidden="true"/> Back</button>
      <span>One job. Every handoff.</span>
      <button type="button" onClick={()=>dispatch({type:'RESTART'})} aria-label="Restart demo"><RotateCcw aria-hidden="true"/> Restart</button>
    </footer>
    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{ready?`${copy.role}. ${hint}`:'Opening sample demo.'}</p>
  </div>
}

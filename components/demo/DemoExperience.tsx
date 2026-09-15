'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { LazyMotion, domMax, m } from 'framer-motion'
import { useDemoFunnel } from '@/lib/demo/use-demo-funnel'
import { type DemoEvent, type DemoStep } from '@/lib/demo/contracts'
import { initialDemoState, readDemoState, saveDemoState, transitionDemo, type DemoCommand, type DemoState } from './demo-state'
import styles from './demo.module.css'

const COPY = {
  assign: { title: 'Put the plan\nin their hands.', description: 'Assign the sample crew. See their plan.' },
  crew: { title: 'The plan. On site.', description: 'Try marking the sample task done.' },
  complete: { title: 'Done on site.\nSeen in the office.', description: 'Your crew updates the task. You see the progress.' },
} as const
// DESIGN.md motion: position only, --d-flip and canonical easing.
const HANDOFF = { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
function subscribeMotion(listener: () => void) {
  const media = window.matchMedia?.(REDUCED_QUERY)
  media?.addEventListener('change', listener)
  return () => media?.removeEventListener('change', listener)
}
function reducedSnapshot() { return window.matchMedia?.(REDUCED_QUERY).matches ?? false }
function serverMotionSnapshot() { return true }

const STEPS: DemoStep[] = ['assign', 'crew', 'complete']

function Check({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" /></svg>
}

function Arrow({ back = false }: { back?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={back ? 'M19 12H5m6-6-6 6 6 6' : 'M5 12h14m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" /></svg>
}

/** A local sample only. The real funnel client owns every outbound diagnostic. */
export function DemoExperience({ exitHref = '/' }: { exitHref?: string }) {
  const reducedMotion = useSyncExternalStore(subscribeMotion, reducedSnapshot, serverMotionSnapshot)
  const [state, setState] = useState<DemoState>(initialDemoState)
  const [ready, setReady] = useState(false)
  const current = useRef(state)
  const [handoff, setHandoff] = useState(false)
  const [resumed, setResumed] = useState(false)
  const [photoFailed, setPhotoFailed] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const heading = useRef<HTMLHeadingElement>(null)
  const startedAt = useRef<number | null>(null)
  const initialized = useRef(false)
  const focusNext = useRef(false)
  const errors = useRef(new Set<DemoEvent['errorCode']>())
  const { signupHref, track } = useDemoFunnel()

  const report = useCallback((action: DemoEvent['action'], step: DemoStep, errorCode?: DemoEvent['errorCode']) => {
    const elapsedMs = Math.min(86_400_000, Math.max(0, Math.round(performance.now() - (startedAt.current ?? performance.now()))))
    track({ action, step, elapsedMs, ...(errorCode ? { errorCode } : {}) })
  }, [track])

  const reportError = useCallback((errorCode: NonNullable<DemoEvent['errorCode']>) => {
    if (errors.current.has(errorCode)) return
    errors.current.add(errorCode)
    report('error', current.current.step, errorCode)
  }, [report])

  const persist = useCallback((next: DemoState) => {
    if (!saveDemoState(() => window.sessionStorage, next)) reportError('storage_unavailable')
  }, [reportError])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    startedAt.current = performance.now()
    const restored = readDemoState(() => window.sessionStorage)
    current.current = restored.state
    setState(restored.state)
    setReady(true)
    setResumed(restored.resumed)
    if (!restored.available) reportError('storage_unavailable')
    try { window.history.replaceState({ ...window.history.state, opsDemoStep: restored.state.step }, '') } catch { /* Browser navigation restrictions do not block the demo. */ }
    if (!restored.resumed) report('started', 'assign')
  }, [report, reportError])

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const requested: unknown = event.state?.opsDemoStep
      const previous = current.current
      if (!STEPS.includes(requested as DemoStep) || requested === previous.step) return
      if (requested === 'complete' && previous.progress !== 'completed') return
      if (requested === 'crew' && previous.progress === 'unassigned') return
      const next = { ...previous, step: requested as DemoStep }
      current.current = next
      focusNext.current = true
      setHandoff(true)
      setDirection(STEPS.indexOf(next.step) < STEPS.indexOf(previous.step) ? 'back' : 'forward')
      setState(next)
      setResumed(false)
      persist(next)
      if (STEPS.indexOf(next.step) < STEPS.indexOf(previous.step)) report('back', next.step)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [persist, report])

  useEffect(() => {
    if (!focusNext.current) return
    focusNext.current = false
    heading.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [state])

  const act = (command: DemoCommand) => {
    const previous = current.current
    const next = transitionDemo(previous, command)
    if (next === previous) return
    current.current = next // Rapid repeated clicks see the new state before React paints.
    focusNext.current = true
    setHandoff(true)
    setDirection(command === 'back' || command === 'restart' ? 'back' : 'forward')
    setState(next)
    setResumed(false)
    persist(next)
    try {
      const snapshot = { ...window.history.state, opsDemoStep: next.step }
      if (command === 'restart') window.history.replaceState(snapshot, '')
      else window.history.pushState(snapshot, '')
    } catch { /* All explicit controls remain usable. */ }
    if (command === 'assign') {
      if (previous.progress === 'unassigned') report('job_assigned', 'assign')
      report('crew_viewed', 'crew')
    } else if (command === 'complete') {
      if (previous.progress !== 'completed') report('task_completed', 'complete')
    } else report(command, next.step)
  }

  if (!ready) return <div className={styles.demo}>
    <header className={styles.header}>
      <span role="img" aria-label="OPS" className={styles.logo} />
      <a className={styles.quiet} href={exitHref}>Exit demo</a>
    </header>
    <main className={styles.recovery} aria-busy="true">
      <p className={styles.label}>SAMPLE JOB</p>
      <h1 className={styles.headline}>Your sample job.</h1>
      <p className={styles.description} role="status">Opening the plan.</p>
      <a className={styles.trialLink} href={signupHref}>Start my free trial</a>
    </main>
  </div>

  const completed = state.progress === 'completed'
  const copy = COPY[state.step]
  const signup = () => report('signup_clicked', state.step)
  const announcement = state.step === 'complete'
    ? 'Sample task complete. The owner can see the task is done.'
    : state.step === 'crew' ? 'Crew plan open. Address, job note and site reference are available.' : 'Sample job ready to assign.'

  return (
    <div className={styles.demo} data-demo-step={state.step} data-direction={direction} data-handoff={handoff}>
      <header className={styles.header}>
        <span role="img" aria-label="OPS" className={styles.logo} />
        <a className={styles.quiet} href={exitHref} onClick={() => report('exit', state.step)}>Exit demo</a>
      </header>

      <LazyMotion features={domMax} strict>
      <main className={styles.stage} data-motion={reducedMotion ? 'reduced' : 'full'}>
        <section className={styles.guide} aria-labelledby="demo-heading">
          <div>
            <div className={styles.eyebrow}>A JOB. A CREW. A CLEAR PLAN.</div>
            <h1 id="demo-heading" ref={heading} tabIndex={-1} className={styles.headline}>{copy.title}</h1>
            <p className={styles.description}>{copy.description}</p>
          </div>
          <ol className={styles.steps} aria-label="Demo progress">
            {STEPS.map((step, index) => <li key={step} aria-current={state.step === step ? 'step' : undefined}>
              <span className={styles.stepNumber}>0{index + 1}</span>
              <span>{['Owner', 'Crew', 'Owner'][index]}<small>{['Assign the job', 'Work the plan', 'See the update'][index]}</small></span>
            </li>)}
          </ol>
        </section>

        <div className={styles.experience}>
          <article className={styles.job} aria-label="Sample job details">
            <div className={styles.context}>
              <span key={state.step} className={styles.contextName}>{state.step === 'crew' ? 'CREW’S VIEW · PETE' : 'OWNER’S VIEW'}</span>
              <span className={styles.sample}>SAMPLE JOB</span>
            </div>
            {/* Layout follows role; only the persistent identity/task translate.
                No exit queue: removed controls disappear in the same state commit. */}
            <div className={styles.workspace} data-role={state.step === 'crew' ? 'crew' : 'owner'}>
              <m.div layout={reducedMotion ? false : 'position'} transition={{ layout: HANDOFF }} className={styles.identity}>
                <h2>Siding repair</h2>
                <p className={styles.address}>184 Cedar Lane</p>
              </m.div>
              <div key={`schedule-${state.step}`} className={styles.schedule}>
                <span className={styles.label}>Tomorrow</span>
                {state.step === 'crew' && <span className={styles.fieldCrew}>Pete + Nick</span>}
                <span className={styles.time}>8:00 <small>AM</small></span>
              </div>
              {state.step === 'crew' && <figure className={styles.photo} key="site-reference">
                {photoFailed ? <div className={styles.photoFallback}><span>Sample photo unavailable.</span><span>The job details still work.</span></div> :
                  <Image priority src="/images/demo/site-siding-damage.jpg" width={1200} height={655} sizes="(min-width: 1000px) 640px, (min-width: 700px) 600px, calc(100vw - 40px)" alt="Damaged metal siding to replace; site reference before work" onError={() => { setPhotoFailed(true); reportError('asset_unavailable') }} />}
                <figcaption>Site reference · before work</figcaption>
              </figure>}
              {state.step === 'crew' && <div className={styles.note}><span className={styles.label}>JOB NOTE</span><p>Use the side gate. Replacement panels are stacked beside the shed.</p></div>}
              <m.div layout={reducedMotion ? false : 'position'} transition={{ layout: HANDOFF }} className={styles.task} data-complete={completed}>
                {completed && <div className={styles.taskMarker} aria-hidden="true"><Check /></div>}
                <div className={styles.taskContent}>
                  <span className={styles.label}>{state.step === 'complete' ? 'SAMPLE TASK COMPLETE' : 'TASK'}</span>
                  <h3>Replace damaged siding panels</h3>
                  {completed && state.step !== 'complete' && <span className={styles.done}>COMPLETED</span>}
                  {state.step === 'complete' && <p className={styles.ownerUpdate}>Pete marked the task done.</p>}
                </div>
              </m.div>
              {state.step !== 'crew' && <div key={`crew-${state.step}`} className={styles.crew}>
                <div className={styles.avatars} aria-hidden="true"><span>P</span><span>N</span></div>
                <div><span className={styles.crewNames}>Pete + Nick</span><span className={styles.crewStatus}>{state.progress === 'unassigned' ? 'Ready to assign' : 'Assigned crew'}</span></div>
                {state.progress !== 'unassigned' && <Check className={styles.assignedCheck} />}
              </div>}
            </div>
          </article>

          <div className={styles.actionDock}>
            {state.step === 'complete' ? (
              <><a className={styles.primary} href={signupHref} onClick={signup}>Start my free trial<Arrow /></a><p className={styles.trialTerms}><span className={styles.number}>30</span> days free. No credit card.</p></>
            ) : (
              <><button type="button" className={styles.primary} onClick={event => { if (event.detail > 1) return; act(state.step === 'assign' ? 'assign' : 'complete') }}>
                {state.step === 'assign' ? (state.progress === 'unassigned' ? 'Assign crew' : 'View crew plan') : completed ? 'View completion' : 'Mark task done'}<Arrow />
              </button><a className={styles.trialLink} href={signupHref} onClick={signup}>Start my free trial</a></>
            )}
          </div>

          <nav className={styles.reviewControls} aria-label="Demo controls">
            {state.step !== 'assign' && <button type="button" className={styles.quiet} onClick={() => act('back')}><Arrow back />Back</button>}
            {state.progress !== 'unassigned' && <button type="button" className={styles.quiet} onClick={() => act('restart')}>Restart demo</button>}
          </nav>
          {resumed && <p className={styles.resume}>Sample demo resumed.</p>}
        </div>
      </main>
      </LazyMotion>
      <div className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
    </div>
  )
}

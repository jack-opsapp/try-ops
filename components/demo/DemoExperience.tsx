'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useDemoFunnel } from '@/lib/demo/use-demo-funnel'
import { type DemoEvent, type DemoStep } from '@/lib/demo/contracts'
import { initialDemoState, readDemoState, saveDemoState, transitionDemo, type DemoCommand, type DemoState } from './demo-state'
import styles from './demo.module.css'

const COPY = {
  assign: { title: 'Put tomorrow’s job in their hands.', description: 'Assign the sample crew. See their plan.' },
  crew: { title: 'The plan is in their hands.', description: 'Try marking the sample task done.' },
  complete: { title: 'See what’s done.', description: 'Your crew updates the task. You see the progress.' },
} as const
const STEPS: DemoStep[] = ['assign', 'crew', 'complete']

function Check({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" /></svg>
}

function Arrow({ back = false }: { back?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={back ? 'M19 12H5m6-6-6 6 6 6' : 'M5 12h14m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" /></svg>
}

/** A local sample only. The real funnel client owns every outbound diagnostic. */
export function DemoExperience({ exitHref = '/' }: { exitHref?: string }) {
  const [state, setState] = useState<DemoState>(initialDemoState)
  const current = useRef(state)
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
    setResumed(restored.resumed)
    if (!restored.available) reportError('storage_unavailable')
    try { window.history.replaceState({ ...window.history.state, opsDemoStep: restored.state.step }, '') } catch { /* Browser navigation restrictions do not block the demo. */ }
    report('started', restored.state.step)
    if (restored.state.step === 'crew') report('crew_viewed', 'crew')
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
      setDirection(STEPS.indexOf(next.step) < STEPS.indexOf(previous.step) ? 'back' : 'forward')
      setState(next)
      setResumed(false)
      persist(next)
      report('back', next.step)
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

  const completed = state.progress === 'completed'
  const copy = COPY[state.step]
  const signup = () => report('signup_clicked', state.step)
  const announcement = state.step === 'complete'
    ? 'Sample task complete. The owner can see the task is done.'
    : state.step === 'crew' ? 'Crew plan open. Address, job note and site reference are available.' : 'Sample job ready to assign.'

  return (
    <div className={styles.demo} data-demo-step={state.step}>
      <header className={styles.header}>
        <span role="img" aria-label="OPS" className={styles.logo} />
        <a className={styles.quiet} href={exitHref} onClick={() => report('exit', state.step)}>Exit demo</a>
      </header>

      <main className={styles.stage}>
        <section className={styles.guide} aria-labelledby="demo-heading">
          <div className={styles.eyebrow}>A JOB. A CREW. A CLEAR PLAN.</div>
          <h1 id="demo-heading" ref={heading} tabIndex={-1} className={styles.headline}>{copy.title}</h1>
          <p className={styles.description}>{copy.description}</p>
          <ol className={styles.steps} aria-label="Demo progress">
            {STEPS.map((step, index) => <li key={step} aria-current={state.step === step ? 'step' : undefined}>
              <span className={styles.stepNumber}>0{index + 1}</span>
              <span>{['Assign', 'Crew', 'Done'][index]}</span>
            </li>)}
          </ol>
        </section>

        <div className={styles.experience}>
          <article className={styles.job} aria-label="Sample job details">
            <div className={styles.context}>
              <span key={state.step} className={styles.contextName}>{state.step === 'crew' ? 'CREW’S VIEW · PETE' : 'OWNER’S VIEW'}</span>
              <span className={styles.sample}>SAMPLE JOB</span>
            </div>

            <div className={styles.identity}>
              <h2>Cedar siding repair</h2>
              <p className={styles.address}>184 Cedar Lane</p>
              <div className={styles.schedule}><span>Tomorrow</span><span className={styles.time}>8:00 AM</span></div>
            </div>

            <div className={styles.crew}>
              <div className={styles.avatars} aria-hidden="true"><span>P</span><span>N</span></div>
              <div><span className={styles.crewNames}>Pete + Nick</span><span className={styles.crewStatus}>{state.progress === 'unassigned' ? 'Ready to assign' : 'Assigned crew'}</span></div>
              {state.progress !== 'unassigned' && <Check className={styles.assignedCheck} />}
            </div>

            <div key={state.step} className={styles.detail} data-direction={direction}>
              {state.step === 'complete' ? (
                <div className={styles.receipt}>
                  <div className={styles.receiptTitle}><Check /><span>SAMPLE TASK COMPLETE</span></div>
                  <h3>Replace damaged siding panels</h3>
                  <p>Pete marked the task done.</p>
                  <div className={styles.ownerUpdate}><span>Task status</span><span className={styles.done}>COMPLETED</span></div>
                </div>
              ) : (
                <>
                  <div className={styles.task}>
                    <span className={styles.label}>TASK</span>
                    <h3>Replace damaged siding panels</h3>
                    {completed && <span className={styles.done}>COMPLETED</span>}
                  </div>
                  {state.step === 'crew' && (
                    <div className={styles.crewDetails}>
                      <div className={styles.note}><span className={styles.label}>JOB NOTE</span><p>Use the side gate. Replacement panels are stacked beside the shed.</p></div>
                      <figure className={styles.photo}>
                        {photoFailed ? <div className={styles.photoFallback}><span>Sample photo unavailable.</span><span>The job details still work.</span></div> :
                          <Image src="/images/demo/site-siding-damage.jpg" width={1200} height={655} sizes="(max-width: 600px) calc(100vw - 72px), 480px" alt="Damaged metal siding to replace; site reference before work" onError={() => { setPhotoFailed(true); reportError('asset_unavailable') }} />}
                        <figcaption>Site reference · before work</figcaption>
                      </figure>
                    </div>
                  )}
                </>
              )}
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
      <div className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
    </div>
  )
}

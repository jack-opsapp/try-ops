'use client'

import { useEffect, useRef } from 'react'
import { useDemoFunnel } from '@/lib/demo/use-demo-funnel'
import styles from '@/components/demo/demo.module.css'

export default function DemoError({ reset }: { reset: () => void }) {
  const { signupHref, track } = useDemoFunnel()
  const reported = useRef(false)
  useEffect(() => {
    if (reported.current) return
    reported.current = true
    track({ action: 'error', step: 'assign', elapsedMs: 0, errorCode: 'render_failed' })
  }, [track])

  return <div className={styles.demo}>
    <header className={styles.header}>
      <span role="img" aria-label="OPS" className={styles.logo} />
      <a className={styles.quiet} href="/">Exit demo</a>
    </header>
    <main className={styles.recovery}>
      <p className={styles.label}>SAMPLE JOB</p>
      <h1 className={styles.headline}>The sample job couldn’t load.</h1>
      <p className={styles.description}>Try again, or start your free trial.</p>
      <div className={styles.actionDock}>
        <button className={styles.primary} type="button" onClick={reset}>Try again</button>
        <a className={styles.trialLink} href={signupHref}>Start my free trial</a>
        <p className={styles.trialTerms}><span className={styles.number}>30</span> days free. No credit card.</p>
      </div>
    </main>
  </div>
}

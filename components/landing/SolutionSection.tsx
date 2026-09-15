import type { z } from 'zod'
import type { SolutionSectionPropsSchema } from '@/lib/ab/types'

export function SolutionSection({ heading = 'LESS CHASING. MORE WORK DONE.', features }: z.infer<typeof SolutionSectionPropsSchema>) {
  return <section id="solution" className="landing-section landing-outcomes">
    <div className="landing-container outcomes-layout">
      <div className="outcomes-heading"><p className="landing-label">ON THE JOB</p><h2>{heading}</h2></div>
      <div className="outcome-grid">{features.map(feature => <article key={feature.title}>
        <h3>{feature.title}</h3>
        <div className="outcome-description"><p>{feature.copy}</p><p className="outcome-why">{feature.why}</p></div>
      </article>)}</div>
    </div>
  </section>
}

import type { z } from 'zod'
import type { GettingStartedSectionPropsSchema } from '@/lib/ab/types'

/** A small evaluation sequence, presented as guidance rather than a setup form. */
export function GettingStartedSection({ heading, intro, steps }: z.infer<typeof GettingStartedSectionPropsSchema>) {
  return <section id="getting-started" className="landing-section landing-getting-started" aria-labelledby="getting-started-heading">
    <div className="landing-container">
      <div className="getting-started-intro">
        <h2 id="getting-started-heading">{heading}</h2>
        <p>{intro}</p>
      </div>
      <ol className="getting-started-steps" role="list">
        {steps.map((step, index) => <li key={step.title}>
          <span className="getting-started-position landing-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <div>
            <h3>{step.title}</h3>
            <p>{step.copy}</p>
          </div>
        </li>)}
      </ol>
    </div>
  </section>
}

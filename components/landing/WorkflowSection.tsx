import type { z } from 'zod'
import type { WorkflowSectionPropsSchema } from '@/lib/ab/types'

/** One ordered job story. Every step remains visible without interaction. */
export function WorkflowSection({ heading, intro, steps }: z.infer<typeof WorkflowSectionPropsSchema>) {
  return <section id="workflow" className="landing-section landing-workflow" aria-labelledby="workflow-heading">
    <div className="landing-container workflow-layout">
      <div className="section-intro workflow-intro">
        <h2 id="workflow-heading">{heading}</h2>
        <p>{intro}</p>
      </div>
      <ol className="workflow-sequence" role="list">
        {steps.map((step, index) => <li className="workflow-step" key={step.stage}>
          <span className="workflow-position landing-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <div className="workflow-step-content">
            <div className="workflow-step-context">
              <p className="workflow-stage">{step.stage}</p>
              <p className="workflow-platform">{step.platform}</p>
            </div>
            <h3>{step.title}</h3>
            <p className="workflow-description">{step.copy}</p>
          </div>
        </li>)}
      </ol>
    </div>
  </section>
}

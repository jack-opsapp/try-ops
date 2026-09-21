'use client'

import { useRef, useState, type ReactNode } from 'react'
import { Camera, ChevronDown, FileText, Image as PhotoIcon, MapPin, Ruler, StickyNote } from 'lucide-react'
import { Action, AppHeader, ArrowLeft, Badge, Check, SamplePhoto, Section, X, ui } from './DemoPrimitives'
import { SAMPLE, money } from './lifecycle-data'
import type { SceneProps } from './lifecycle-state'
import styles from './visit-scenes.module.css'

/** Fixture-only counterparts of SiteVisitCaptureView, its review sheet,
 * and EstimateDetailView. Parent state owns every durable job action. */
export function VisitScenes(props: SceneProps) {
  switch (props.state.scene) {
    case 'visit': return <CaptureScene {...props} />
    case 'review': return <ReviewScene {...props} />
    case 'estimate': return <EstimateScene {...props} />
    default: return null
  }
}

function Field({ label, children, complete = false }: { label: string; children: ReactNode; complete?: boolean }) {
  return <div className={styles.field}>
    <div className={styles.fieldLabel}>
      <span>{label}</span>
      {complete && <span className={styles.complete}><Check aria-hidden="true" /> Done</span>}
    </div>
    <div className={styles.fieldValue}>{children}</div>
  </div>
}

function VisitIdentity() {
  return <div className={styles.identity}>
    <h3>{SAMPLE.company}</h3>
    <p><MapPin aria-hidden="true" /> {SAMPLE.address}</p>
  </div>
}

function VisitPhoto({ review = false }: { review?: boolean }) {
  return <figure className={`${styles.evidence} ${review ? styles.reviewPhoto : ''}`}>
    <SamplePhoto src={SAMPLE.beforePhoto} alt="Sample site visit: cracked patio at Cedar Lane Cafe before the repair." />
    <figcaption><PhotoIcon aria-hidden="true" /><span>Site visit · {SAMPLE.estimator}</span><Check aria-hidden="true" /><span>Included</span></figcaption>
  </figure>
}

function CaptureScene({ state, dispatch }: SceneProps) {
  const notes = useRef<HTMLDivElement>(null)

  function showNotes() {
    notes.current?.focus({ preventScroll: true })
    notes.current?.scrollIntoView({ block: 'center', behavior: 'auto' })
  }

  return <div className={styles.scene}>
    <AppHeader title="Site visit"
      left={<button className={styles.iconButton} aria-label="Close site visit" onClick={() => dispatch({ type: 'BACK' })}><X /></button>}
      right={<Action className={styles.headerAction} disabled={!state.visitPhoto} onClick={() => dispatch({ type: 'REVIEW_VISIT' })}>Done</Action>} />

    <div className={styles.body}>
      <VisitIdentity />
      <dl className={styles.captureStats} aria-label="Captured evidence">
        <div><dt>Photos</dt><dd aria-live="polite">{state.visitPhoto ? '1' : '0'}</dd></div>
        <div><dt>Notes</dt><dd>1</dd></div>
        <div><dt>Measure</dt><dd>1</dd></div>
      </dl>

      <details className={`${ui.card} ${styles.lead}`}>
        <summary><span className={styles.sectionLabel}>// 1 · Lead</span><span className={styles.leadName}>{SAMPLE.client}</span><ChevronDown aria-hidden="true" /></summary>
        <div className={styles.leadDetails}>
          <p>{SAMPLE.company}</p>
          <p>{SAMPLE.address}</p>
          <p className={styles.metadata}>Estimator · {SAMPLE.estimator}</p>
        </div>
      </details>

      <div className={ui.card}>
        <Section title="2 · Checklist" action={<Badge>Estimate</Badge>}>
          <Field label="Scope of work" complete>{SAMPLE.scope}</Field>
          <div className={styles.field}>
            <div className={styles.fieldLabel}>
              <span>Site photos</span>
              {state.visitPhoto && <span className={styles.complete}><Check aria-hidden="true" /> 1 linked</span>}
            </div>
            {state.visitPhoto ? <VisitPhoto /> : <div className={styles.photoPlaceholder}>
              <Camera aria-hidden="true" />
              <p>Take photos — they link here automatically.</p>
            </div>}
          </div>
          <Field label="Measurements"><span className={styles.measurement}><Ruler aria-hidden="true" />{SAMPLE.measurement}</span></Field>
          <Field label="Access & parking">{SAMPLE.access}</Field>
        </Section>
      </div>

      <div ref={notes} tabIndex={-1} className={`${ui.card} ${styles.notes}`}>
        <Section title="3 · Notes">
          <p>{SAMPLE.scope} {SAMPLE.access}</p>
          <span className={styles.metadata}>Recorded by {SAMPLE.estimator}</span>
        </Section>
      </div>
    </div>

    <div className={styles.captureToolbar} aria-label="Site visit actions">
      {state.visitPhoto
        ? <div className={styles.attachedStatus} role="status"><Check aria-hidden="true" /><span>Photo added</span></div>
        : <Action className={styles.captureAction} onClick={() => dispatch({ type: 'ADD_SITE_PHOTO' })}><Camera aria-hidden="true" /><span>Photo</span></Action>}
      <button className={styles.toolbarButton} onClick={showNotes}><StickyNote aria-hidden="true" /><span>Note</span></button>
    </div>
  </div>
}

function ReviewScene({ state, dispatch }: SceneProps) {
  return <div className={styles.scene}>
    <AppHeader title="Review visit" left={<button className={styles.iconButton} aria-label="Back to site visit" onClick={() => dispatch({ type: 'BACK' })}><ArrowLeft /></button>} />
    <div className={styles.body}>
      <div className={styles.reviewSummary}>
        <p className={styles.sectionLabel}>// Project</p>
        <h3>{SAMPLE.project}</h3>
        <p>{SAMPLE.client} · {SAMPLE.company}</p>
        <span className={styles.metadata}>{SAMPLE.address}</span>
      </div>
      <div className={styles.reviewStage}>
        <span className={styles.sectionLabel}>Lead stage</span>
        <Badge tone="tan">Qualifying</Badge>
      </div>
      <Section title="Included in this visit" action={<span className={styles.metadata}>3 records</span>}>
        {state.visitPhoto && <VisitPhoto review />}
        <div className={styles.recordRow}><Ruler aria-hidden="true" /><div><span className={styles.sectionLabel}>Measurements</span><p className={styles.measurement}>{SAMPLE.measurement}</p></div><Check aria-hidden="true" className={styles.recordCheck} /></div>
        <div className={styles.recordRow}><StickyNote aria-hidden="true" /><div><span className={styles.sectionLabel}>Notes</span><p>{SAMPLE.access}</p></div><Check aria-hidden="true" className={styles.recordCheck} /></div>
      </Section>
      <div className={ui.card}>
        <Section title="Checklist · Estimate">
          <Field label="Scope of work" complete>{SAMPLE.scope}</Field>
          <div className={styles.reviewCheck}><Check aria-hidden="true" /><span>Required fields complete</span></div>
        </Section>
      </div>
    </div>
    <div className={styles.footer}>
      <Action secondary onClick={() => dispatch({ type: 'BACK' })}>Back</Action>
      <Action disabled={!state.visitPhoto} onClick={() => dispatch({ type: 'COMPLETE_VISIT' })}><Check aria-hidden="true" />Complete visit</Action>
    </div>
  </div>
}

function EstimateScene({ state, dispatch }: SceneProps) {
  const [breakdown, setBreakdown] = useState(false)

  return <div className={styles.scene}>
    <AppHeader title="Estimate" left={<button className={styles.iconButton} aria-label="Back to visit review" onClick={() => dispatch({ type: 'BACK' })}><ArrowLeft /></button>}
      right={<Badge tone={state.estimateApproved ? 'olive' : 'neutral'}>{state.estimateApproved ? 'Approved' : 'Viewed'}</Badge>} />
    <div className={styles.body}>
      <div className={styles.timeContext}>
        <span className={styles.sectionLabel}>Later · estimate prepared</span>
        <p>The visit is saved. This estimate has been priced and reviewed with {SAMPLE.client.split(' ')[0]}.</p>
      </div>
      <div className={styles.estimateIdentity}>
        <div className={styles.documentNumber}><FileText aria-hidden="true" />{SAMPLE.estimateNumber}</div>
        <h3>{SAMPLE.project}</h3>
        <p>{SAMPLE.company} · {SAMPLE.client}</p>
        <span className={styles.metadata}>{SAMPLE.address}</span>
      </div>
      <Section title="Line items" action={<button className={styles.breakdownButton} aria-expanded={breakdown} aria-controls="sample-estimate-breakdown" onClick={() => setBreakdown(value => !value)}>{breakdown ? 'Bundled' : 'Breakdown'}<ChevronDown aria-hidden="true" /></button>}>
        <div className={styles.lineItems} id="sample-estimate-breakdown">
          <div className={styles.lineItem}>
            <div><h4>Patio preparation</h4><span className={styles.metadata}>Labor · 1 job</span>{breakdown && <p className={styles.lineDescription}>Remove the damaged surface. Prepare and level the base.</p>}</div>
            <span className={styles.lineAmount}>{money(SAMPLE.labor / 3)}</span>
          </div>
          <div className={styles.lineItem}>
            <div><h4>{SAMPLE.task}</h4><span className={styles.metadata}>Labor · 1 job</span>{breakdown && <p className={styles.lineDescription}>Lay the pavers, finish the joints and clean the site.</p>}</div>
            <span className={styles.lineAmount}>{money(SAMPLE.labor * 2 / 3)}</span>
          </div>
          <div className={styles.lineItem}>
            <div><h4>Patio materials</h4><span className={styles.metadata}>Material · 288 sq ft</span>{breakdown && <p className={styles.lineDescription}>Large-format pavers, base material and jointing sand.</p>}</div>
            <span className={styles.lineAmount}>{money(SAMPLE.materials)}</span>
          </div>
        </div>
      </Section>
      <dl className={styles.totals}>
        <div><dt>Subtotal</dt><dd>{money(SAMPLE.total)}</dd></div>
        <div className={styles.total}><dt>Total</dt><dd>{money(SAMPLE.total)}</dd></div>
      </dl>
      <div className={styles.approvalNote}>
        <Check aria-hidden="true" />
        <div><span className={styles.sectionLabel}>Client approved</span><p>“Looks good. Let’s go ahead.”</p><span className={styles.metadata}>{SAMPLE.client}</span></div>
      </div>
    </div>
    <div className={styles.footer}>
      <Action disabled={!state.visitCompleted} onClick={() => dispatch({ type: 'APPROVE_ESTIMATE' })}><Check aria-hidden="true" />Mark approved</Action>
    </div>
  </div>
}

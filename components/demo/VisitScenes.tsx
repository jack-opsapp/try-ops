'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Camera, ChevronDown, FileText, Image as PhotoIcon, MapPin, Ruler, Send, StickyNote } from 'lucide-react'
import { NumericText, Action, AppHeader, ArrowLeft, Avatar, Badge, Check, SamplePhoto, Section, X, ui } from './DemoPrimitives'
import { SAMPLE, money } from './lifecycle-data'
import type { SceneProps } from './lifecycle-state'
import { SpecTool } from './SpecTool'
import styles from './visit-scenes.module.css'

/** Fixture-only counterparts of SiteVisitCaptureView, its review sheet,
 * and EstimateDetailView. Parent state owns every durable job action. */
type VisitSceneProps = SceneProps & { onToolPreviewChange?: (open: boolean) => void }
export function VisitScenes(props: VisitSceneProps) {
  switch (props.state.scene) {
    case 'visit': return <CaptureScene {...props} />
    case 'review': return <ReviewScene {...props} />
    case 'estimate': return <EstimateScene {...props} />
    case 'accepted': return <AcceptedScene {...props} />
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

function VisitPhoto({ author, review = false }: { author: string; review?: boolean }) {
  return <figure className={`${styles.evidence} ${review ? styles.reviewPhoto : ''}`}>
    <SamplePhoto src={SAMPLE.beforePhoto} alt="Sample site visit: the deck area at Cedar Lane before work begins." />
    <figcaption><PhotoIcon aria-hidden="true" /><span>Site visit · {author}</span><Check aria-hidden="true" /><span>Included</span></figcaption>
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
      right={<Action data-demo-next={state.visitPhoto && state.scopeConfirmed} className={styles.headerAction} disabled={!state.visitPhoto || !state.scopeConfirmed} onClick={() => dispatch({ type: 'REVIEW_VISIT' })}>Done</Action>} />

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
          <p className={styles.metadata}>Assigned to you</p>
        </div>
      </details>

      <div className={ui.card}>
        <Section title="2 · Checklist" action={<Badge>Estimate</Badge>}>
          <Field label="Scope of work" complete={state.scopeConfirmed}>
            <p>{SAMPLE.scope}</p>
            <label className={styles.scopeConfirmation} data-demo-next={!state.scopeConfirmed}>
              <input type="checkbox" checked={state.scopeConfirmed} onChange={() => dispatch({ type: 'CONFIRM_SCOPE' })} />
              <span>Confirm the deck scope with Alex</span>
            </label>
          </Field>
          <div className={styles.field}>
            <div className={styles.fieldLabel}>
              <span>Site photos</span>
              {state.visitPhoto && <span className={styles.complete}><Check aria-hidden="true" /> 1 linked</span>}
            </div>
            {state.visitPhoto ? <VisitPhoto author="You" /> : <div className={styles.photoPlaceholder}>
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
          <span className={styles.metadata}>Recorded by you</span>
        </Section>
      </div>
    </div>

    <div className={styles.captureToolbar} aria-label="Site visit actions">
      {state.visitPhoto
        ? <div className={styles.attachedStatus} role="status"><Check aria-hidden="true" /><span>Photo added</span></div>
        : <Action data-demo-next={state.scopeConfirmed} className={styles.captureAction} onClick={() => dispatch({ type: 'ADD_SITE_PHOTO' })}><Camera aria-hidden="true" /><span>Photo</span></Action>}
      <button className={styles.toolbarButton} onClick={showNotes}><StickyNote aria-hidden="true" /><span>Note</span></button>
    </div>
  </div>
}

function ReviewScene({ state, dispatch }: SceneProps) {
  const delegated = state.visitAssignee !== 'You'
  const author = state.visitAssignee ?? 'You'
  return <div className={styles.scene}>
    <AppHeader title="Review visit" left={<button className={styles.iconButton} aria-label={delegated ? "Back to assignment" : "Back to site visit"} onClick={() => dispatch({ type: 'BACK' })}><ArrowLeft /></button>} />
    <div className={styles.body}>
      {delegated && <div className={styles.visitArrival}>
        <Avatar name={author} src={author === 'Mike' ? '/avatars/mike.png' : '/avatars/nick.png'} />
        <div><span className={styles.sectionLabel}>Tuesday · visit complete</span><p>{author} completed the site visit. Your record is ready to review.</p></div>
      </div>}
      <div className={styles.reviewSummary}>
        <p className={styles.sectionLabel}>// Project</p>
        <h3><NumericText>{SAMPLE.project}</NumericText></h3>
        <p>{SAMPLE.client} · {SAMPLE.company}</p>
        <span className={styles.metadata}>{SAMPLE.address}</span>
      </div>
      <div className={styles.reviewStage}>
        <span className={styles.sectionLabel}>Lead stage</span>
        <Badge tone="tan">Qualifying</Badge>
      </div>
      <Section title="Included in this visit" action={<span className={styles.metadata}>3 records</span>}>
        {state.visitPhoto && <VisitPhoto author={author} review />}
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
      <Action data-demo-next="true" disabled={!state.visitPhoto || !state.scopeConfirmed} onClick={() => dispatch({ type: 'COMPLETE_VISIT' })}><Check aria-hidden="true" />{delegated ? 'Review estimate' : 'Complete visit'}</Action>
    </div>
  </div>
}

function EstimateScene({ state, dispatch, onToolPreviewChange }: VisitSceneProps) {
  const [breakdown, setBreakdown] = useState(false)
  const [toolOpen, setToolOpen] = useState(false)
  const toolTrigger = useRef<HTMLButtonElement>(null)
  const restoreToolFocus = useRef(false)

  useEffect(() => {
    onToolPreviewChange?.(toolOpen)
    return () => onToolPreviewChange?.(false)
  }, [toolOpen, onToolPreviewChange])

  useEffect(() => {
    if (!toolOpen && restoreToolFocus.current) {
      toolTrigger.current?.focus({ preventScroll: true })
      restoreToolFocus.current = false
    }
  }, [toolOpen])

  if (toolOpen) return <SpecTool state={state} dispatch={dispatch} onClose={() => {
    restoreToolFocus.current = true
    setToolOpen(false)
  }} />

  return <div className={styles.scene}>
    <AppHeader title="Estimate" left={<button className={styles.iconButton} aria-label="Back to visit review" onClick={() => dispatch({ type: 'BACK' })}><ArrowLeft /></button>}
      right={<Badge>Draft</Badge>} />
    <div className={styles.body}>
      <div className={styles.timeContext}>
        <span className={styles.sectionLabel}>Later · estimate prepared</span>
        <p>{state.visitAssignee === 'You' ? 'Your site record is saved. The sample quote is priced and ready for your review.' : `${state.visitAssignee} has prepared the sample quote. Review the scope and send it to Alex.`}</p>
      </div>
      <EstimateIdentity />
      <Section title="Line items" action={<button className={styles.breakdownButton} aria-expanded={breakdown} aria-controls="sample-estimate-breakdown" onClick={() => setBreakdown(value => !value)}>{breakdown ? 'Bundled' : 'Breakdown'}<ChevronDown aria-hidden="true" /></button>}>
        <div className={styles.lineItems} id="sample-estimate-breakdown">
          <div className={styles.lineItem}>
            <div><h4>Deck preparation</h4><span className={styles.metadata}>Labor · 1 job</span>{breakdown && <p className={styles.lineDescription}>Remove the worn cedar boards and prepare the site. Retain the sound framing, stairs and railing.</p>}</div>
            <span className={styles.lineAmount}>{money(SAMPLE.preparation)}</span>
          </div>
          <div className={styles.lineItem}>
            <div><h4>{SAMPLE.task}</h4><span className={styles.metadata}>Labor · 1 job</span>{breakdown && <p className={styles.lineDescription}>Install composite deck boards and matching fascia. Check the fasteners and clean the site.</p>}</div>
            <span className={styles.lineAmount}>{money(SAMPLE.installation)}</span>
          </div>
          <div className={styles.lineItem}>
            <div><h4>Deck materials</h4><span className={styles.metadata}>Material · 192 sq ft</span>{breakdown && <p className={styles.lineDescription}>Composite deck boards, matching fascia and fasteners.</p>}</div>
            <span className={styles.lineAmount}>{money(SAMPLE.materials)}</span>
          </div>
        </div>
      </Section>
      <dl className={styles.totals}>
        <div><dt>Subtotal</dt><dd>{money(SAMPLE.total)}</dd></div>
        <div className={styles.total}><dt>Total</dt><dd>{money(SAMPLE.total)}</dd></div>
      </dl>
      <div className={styles.toolEntry}>
        <div><span className={styles.sectionLabel}>Optional · deck designer</span><p>See a custom tool built around the work.</p></div>
        <button ref={toolTrigger} type="button" className={styles.toolButton} onClick={() => setToolOpen(true)}><Ruler aria-hidden="true" />Explore custom tool</button>
      </div>
      <p className={styles.metadata}>Sample estimate. No email is sent from this demo.</p>
    </div>
    <div className={styles.footer}>
      <Action data-demo-next="true" disabled={!state.visitCompleted} onClick={() => dispatch({ type: 'SEND_ESTIMATE' })}><Send aria-hidden="true" />Send estimate</Action>
    </div>
  </div>
}

function EstimateIdentity() {
  return <div className={styles.estimateIdentity}>
    <div className={styles.documentNumber}><FileText aria-hidden="true" />{SAMPLE.estimateNumber}</div>
    <h3><NumericText>{SAMPLE.project}</NumericText></h3>
    <p>{SAMPLE.company} · {SAMPLE.client}</p>
    <span className={styles.metadata}>{SAMPLE.address}</span>
  </div>
}

function AcceptedScene({ state, dispatch }: SceneProps) {
  return <div className={styles.scene}>
    <AppHeader title="Estimate" left={<button className={styles.iconButton} aria-label="Back to estimate" onClick={() => dispatch({ type: 'BACK' })}><ArrowLeft /></button>} right={<Badge tone={state.estimateApproved ? "olive" : "neutral"}>{state.estimateApproved ? "Client accepted" : "Sent"}</Badge>} />
    <div className={styles.body}>
      <div className={styles.timeContext}>
        <span className={styles.sectionLabel}>Sample timeline · Wednesday morning</span>
        <p>{state.estimateApproved ? "Alex accepted the estimate. The project is ready." : "Your estimate is with Alex. The client’s response arrives next."}</p>
      </div>
      <EstimateIdentity />
      {state.estimateApproved && <div className={styles.approvalNote}>
        <Check aria-hidden="true" />
        <div><span className={styles.sectionLabel}>From {SAMPLE.client}</span><p>“The estimate looks good. Let’s go ahead.”</p><span className={styles.metadata}>Re: {SAMPLE.estimateNumber}</span></div>
      </div>}
      <dl className={styles.totals}>
        <div className={styles.total}><dt>Estimate total</dt><dd>{money(SAMPLE.total)}</dd></div>
      </dl>
      <div className={styles.nextRecord}>
        <span className={styles.sectionLabel}>Next · your project</span>
        <p>When Alex accepts, the visit record stays attached and the labor items become tasks you can assign.</p>
      </div>
    </div>
    {state.estimateApproved && <div className={styles.footer}>
      <Action data-demo-next="true" onClick={() => dispatch({ type: 'APPROVE_ESTIMATE' })}>View project</Action>
    </div>}
  </div>
}

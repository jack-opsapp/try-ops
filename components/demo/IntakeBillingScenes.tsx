'use client'

import { useEffect, useRef, useState } from 'react'
import { CalendarDays, Mail, MapPin, Link2 } from 'lucide-react'
import { Action, AppHeader, Avatar, Badge, Check, ChevronRight, Section, ui } from './DemoPrimitives'
import { SAMPLE, money } from './lifecycle-data'
import type { SceneProps, VisitAssignee } from './lifecycle-state'
import styles from './intake-billing.module.css'
import { CharacterCard } from './CharacterCard'
import { FeatureCallout } from './FeatureCallout'

/**
 * Fixture-only counterparts of LeadDetailView / LeadSiteVisitBanner and
 * InvoiceDetailView / PaymentRecordSheet. The native lead is a continuous
 * dossier, not the project's Activity/Details/Expenses tab layout.
 * Booking evidence: phase-c-bilateral-event-handoff.ts; the internal engine
 * name is deliberately absent from the rendered interface.
 */
type IntakeProps = SceneProps & { onPaymentPreviewChange?: (open: boolean) => void }
export function IntakeBillingScenes({ state, dispatch, onPaymentPreviewChange }: IntakeProps) {
  if (state.scene === 'inquiry') return <InquiryScene dispatch={dispatch} />
  if (state.scene === 'booked') return <BookedScene state={state} dispatch={dispatch} />
  if (state.scene === 'billing') return <BillingScene state={state} dispatch={dispatch} onPaymentPreviewChange={onPaymentPreviewChange} />
  return null
}

function LeadIdentity() {
  return (
    <div className={styles.identity}>
      <div className={styles.idLine}>L-00142 <span aria-hidden="true">/</span> EMAIL INQUIRY</div>
      <h3>{SAMPLE.project}</h3>
      <p>{SAMPLE.client} <span className={styles.separator}>·</span> {SAMPLE.company}</p>
      <div className={styles.address}><MapPin aria-hidden="true" /> <span>{SAMPLE.address}</span></div>
    </div>
  )
}

function Correspondence({ compact = false }: { compact?: boolean }) {
  return (
    <div className={styles.correspondence}>
      <div className={styles.threadTitle}>
        <Mail aria-hidden="true" />
        <span>Deck at Cedar Lane</span>
        <span className={styles.messageCount}>{compact ? '2' : '3'} MSG</span>
      </div>
      <ol className={styles.messages} aria-label="Sample email correspondence">
        {!compact && (
          <li className={styles.message}>
            <div className={styles.messageHeader}><strong>{SAMPLE.client}</strong><time dateTime="2026-09-21T09:08:00">MON 09:08</time></div>
            <p>Could you replace the worn boards on our deck? The address is <span className={ui.mono}>{SAMPLE.address}</span>.</p>
          </li>
        )}
        <li className={`${styles.message} ${styles.outbound}`}>
          <div className={styles.messageHeader}><strong>You</strong><time dateTime="2026-09-21T09:14:00">MON 09:14</time></div>
          <p>We can visit Tuesday, <span className={ui.mono}>Sep 22 at 10:00 AM</span>, to look at the deck. Does that work?</p>
        </li>
        <li className={styles.message}>
          <div className={styles.messageHeader}><strong>{SAMPLE.client}</strong><time dateTime="2026-09-21T09:16:00">MON 09:16</time></div>
          <p>Yes, <span className={ui.mono}>Tuesday at 10:00 AM</span> works. I’ll be home to show you the deck.</p>
        </li>
      </ol>
    </div>
  )
}

function InquiryScene({ dispatch }: Pick<SceneProps, 'dispatch'>) {
  return (
    <div className={styles.scene}>
      <AppHeader title="Lead" right={<Badge tone="tan">Qualifying</Badge>} />
      <div className={styles.content}>
        <button className={styles.bookingBanner} onClick={() => dispatch({ type: 'OPEN_BOOKING' })} type="button" aria-label="Open booked site visit">
          <CalendarDays aria-hidden="true" />
          <span><strong>SITE VISIT BOOKED</strong><span>{SAMPLE.visit}</span></span>
          <ChevronRight aria-hidden="true" />
        </button>
        <LeadIdentity />
        <dl className={styles.facts}>
          <div><dt>Assigned to</dt><dd>Unassigned</dd></div>
          <div><dt>Source</dt><dd><Mail aria-hidden="true" />Email</dd></div>
        </dl>
        <Section title="Summary">
          <p className={styles.summary}>Deck resurfacing inquiry. Alex confirmed a site visit for <span className={ui.mono}>Tuesday at 10:00 AM</span>.</p>
        </Section>
        <Section title="Activity" action={<span className={ui.label}>Email thread</span>}>
          <Correspondence />
          <div className={styles.systemEntry}><Link2 aria-hidden="true" /><span>Lead and site visit linked to this conversation.</span></div>
        </Section>
      </div>
      <div className={ui.toolbar}>
        <Action data-demo-next="true" onClick={() => dispatch({ type: 'OPEN_BOOKING' })}>Assign site visit <ChevronRight aria-hidden="true" /></Action>
      </div>
    </div>
  )
}

function BookedScene({ state, dispatch }: SceneProps) {
  const [chosen, setChosen] = useState<VisitAssignee | null>(state.visitAssignee)
  return <div className={styles.scene}>
    <AppHeader title="Assign site visit" right={<Badge tone="tan">Booked</Badge>} />
    <div className={styles.content}>
      <div className={styles.appointment}>
        <div className={styles.calendarDate} aria-label="Tuesday, September 22"><span>SEP</span><strong>22</strong><span>TUE</span></div>
        <div className={styles.appointmentBody}><h3>{SAMPLE.project}</h3><p className={styles.appointmentTime}>10:00 AM</p><p>{SAMPLE.address}</p></div>
      </div>
      <Section title="Assign to">
        {state.visitAssignee ? <CharacterCard name={state.visitAssignee} /> : <div className={styles.assignmentRoster} data-demo-next={!chosen}>
          {(['You', 'Mike', 'Nick'] as const).map(name => <CharacterCard key={name} name={name} selected={chosen === name} onSelect={() => setChosen(name)} />)}
        </div>}
      </Section>
      <p className={styles.finePrint}>The selected person handles this sample visit and prepares the estimate.</p>
    </div>
    <div className={ui.toolbar}>
      <Action data-demo-next={!!chosen} disabled={!chosen} onClick={() => state.visitAssignee ? dispatch({ type: 'START_VISIT' }) : chosen && dispatch({ type: 'ASSIGN_VISIT', member: chosen })}>
        {state.visitAssignee ? (state.visitAssignee === 'You' ? 'Return to your visit' : 'Review completed visit') : chosen === 'You' ? 'Assign to me' : chosen ? `Assign to ${chosen}` : 'Select a team member'}<ChevronRight aria-hidden="true" />
      </Action>
    </div>
  </div>
}

function BillingScene({ state, dispatch, onPaymentPreviewChange }: IntakeProps) {
  const [recording, setRecording] = useState(false)
  const [showAccounting, setShowAccounting] = useState(false)
  const [provider, setProvider] = useState<'QuickBooks' | 'Sage'>('QuickBooks')
  const paymentHeading = useRef<HTMLHeadingElement>(null)
  const previousRecording = useRef(recording)
  useEffect(() => { onPaymentPreviewChange?.(recording); return () => onPaymentPreviewChange?.(false) }, [recording, onPaymentPreviewChange])
  useEffect(() => {
    if (recording === previousRecording.current) return
    previousRecording.current = recording
    paymentHeading.current?.focus({ preventScroll: true })
    paymentHeading.current?.scrollIntoView?.({ block: 'start', behavior: 'instant' })
  }, [recording])

  if (!state.invoiceCreated) return <div className={styles.scene}>
    <AppHeader title="Ready to bill" right={<Badge tone="olive">All tasks complete</Badge>} />
    <div className={styles.content}>
      <FeatureCallout kind="accounting" />
      <div className={styles.invoiceIdentity}><h3>{SAMPLE.project}</h3><p>{SAMPLE.client}</p><span className={styles.invoiceAmount}>{money(SAMPLE.total)}</span></div>
      <Section title="Completed work"><div className={styles.billableTasks}><p><Check aria-hidden="true" />Deck preparation</p><p><Check aria-hidden="true" />{SAMPLE.task}</p></div></Section>
      <p className={styles.summary}>The approved estimate is ready to become an invoice. Review the amount, then create the draft.</p>
      <p className={styles.finePrint}>Sample billing preview. No invoice is sent and no payment is taken.</p>
    </div>
    <div className={ui.toolbar}><Action data-demo-next="true" onClick={() => dispatch({ type: 'CREATE_INVOICE' })}>Create invoice<ChevronRight aria-hidden="true" /></Action></div>
  </div>

  if (recording && !state.paymentRecorded) {
    return (
      <div className={styles.scene}>
        <AppHeader title="Record payment" titleRef={paymentHeading} right={<button className={styles.textAction} type="button" onClick={() => setRecording(false)}>Cancel</button>} />
        <div className={styles.content}>
          <FeatureCallout kind="accounting" />
          <div className={styles.visitDay}><span className={ui.label}>Later · payment received outside OPS</span></div>
          <div className={styles.paymentContext}><span>{SAMPLE.invoiceNumber}</span><span>Balance {money(SAMPLE.total)}</span></div>
          <div className={styles.receivedNotice}><Check aria-hidden="true" /><p>Alex’s bank transfer has arrived. Record it against this invoice.</p></div>
          <dl className={styles.receiptFields}>
            <div><dt>Amount</dt><dd className={styles.receiptAmount}>{money(SAMPLE.total)}</dd></div>
            <div><dt>Method</dt><dd>Bank transfer</dd></div>
            <div><dt>Notes</dt><dd>Payment received for {SAMPLE.project}.</dd></div>
          </dl>
          <p className={styles.finePrint}>Sample receipt. OPS records this payment; the bank handled the transfer.</p>
        </div>
        <div className={ui.toolbar}>
          <Action data-demo-next="true" onClick={() => { dispatch({ type: 'RECORD_PAYMENT' }); setRecording(false) }}>Record payment</Action>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.scene}>
      <AppHeader title="Invoice" titleRef={paymentHeading} right={<Badge tone={state.paymentRecorded ? 'olive' : 'neutral'}>{state.paymentRecorded ? 'Paid' : 'Draft'}</Badge>} />
      <div className={styles.content}>
        <FeatureCallout kind="accounting" />
        <div className={styles.invoiceIdentity}>
          <h3>{SAMPLE.invoiceNumber}</h3>
          <p>{SAMPLE.project}</p>
          <span className={styles.invoiceAmount}>{money(SAMPLE.total)}</span>
        </div>
        <dl className={styles.appointmentDetails}>
          <div><dt>Client</dt><dd>{SAMPLE.client}<span className={styles.secondaryLine}>{SAMPLE.company}</span></dd></div>
          <div><dt>Project</dt><dd>{SAMPLE.project}<span className={`${styles.secondaryLine} ${ui.mono}`}>{SAMPLE.address}</span></dd></div>
        </dl>
        <Section title="Line items">
          <div className={styles.lineItems}>
            <div><span>Deck preparation<small>Labor</small></span><strong>{money(SAMPLE.preparation)}</strong></div>
            <div><span>Deck resurfacing<small>Labor</small></span><strong>{money(SAMPLE.installation)}</strong></div>
            <div><span>Deck materials<small>Materials</small></span><strong>{money(SAMPLE.materials)}</strong></div>
          </div>
        </Section>
        <dl className={styles.totals}>
          <div><dt>Total</dt><dd>{money(SAMPLE.total)}</dd></div>
          <div><dt>Paid</dt><dd>{money(state.paymentRecorded ? SAMPLE.total : 0)}</dd></div>
          <div className={styles.balance} data-paid={state.paymentRecorded}><dt>Balance due</dt><dd>{money(state.paymentRecorded ? 0 : SAMPLE.total)}</dd></div>
        </dl>
        {state.paymentRecorded ? (
          <Section title="Payments">
            <div className={styles.paymentHistory} role="status"><Check aria-hidden="true" /><div><strong>Bank transfer</strong><span>Payment recorded</span></div><span>{money(SAMPLE.total)}</span></div>
          </Section>
        ) : (
          <p className={styles.finePrint}>Your sample invoice is ready. Optional: see how an externally received payment is recorded after invoicing.</p>
        )}
        <section className={styles.accounting} aria-label="Accounting connection preview">
          <button className={styles.accountingTrigger} type="button" aria-expanded={showAccounting} aria-controls="demo-accounting-picker" onClick={() => setShowAccounting(value => !value)}>
            <span>Connect accounting software</span><ChevronRight aria-hidden="true" />
          </button>
          {showAccounting && (
            <div className={styles.accountingPicker} id="demo-accounting-picker">
              <fieldset>
                <legend>Choose your accounting software</legend>
                {(['QuickBooks', 'Sage'] as const).map(option => (
                  <label key={option} className={styles.providerOption} data-selected={provider === option}>
                    <input type="radio" name="demo-accounting-provider" checked={provider === option} onChange={() => setProvider(option)} />
                    <span>{option}</span>
                    {provider === option && <Check aria-hidden="true" />}
                  </label>
                ))}
              </fieldset>
              <p>In OPS, the next step is {provider} sign-in. Connect the account you already use for your books.</p>
              <span className={styles.previewNote}>PREVIEW ONLY · NO ACCOUNT CONNECTED</span>
              <button className={styles.textAction} type="button" onClick={() => setShowAccounting(false)}>Close preview</button>
            </div>
          )}
        </section>
      </div>
      <div className={ui.toolbar}>
        {state.paymentRecorded ? (
          <div className={styles.paidFooter} role="status"><Check aria-hidden="true" /><span>Paid in full</span><strong>{money(0)} DUE</strong></div>
        ) : (
          <Action secondary onClick={() => setRecording(true)}>Preview payment recording</Action>
        )}
      </div>
    </div>
  )
}

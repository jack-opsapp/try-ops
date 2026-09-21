'use client'

import { useEffect, useRef, useState } from 'react'
import { CalendarDays, Mail, MapPin, Link2 } from 'lucide-react'
import { Action, AppHeader, Avatar, Badge, Check, ChevronRight, Section, ui } from './DemoPrimitives'
import { SAMPLE, money } from './lifecycle-data'
import type { SceneProps } from './lifecycle-state'
import styles from './intake-billing.module.css'

/**
 * Fixture-only counterparts of LeadDetailView / LeadSiteVisitBanner and
 * InvoiceDetailView / PaymentRecordSheet. The native lead is a continuous
 * dossier, not the project's Activity/Details/Expenses tab layout.
 * Booking evidence: phase-c-bilateral-event-handoff.ts; the internal engine
 * name is deliberately absent from the rendered interface.
 */
export function IntakeBillingScenes({ state, dispatch }: SceneProps) {
  if (state.scene === 'inquiry') return <InquiryScene dispatch={dispatch} />
  if (state.scene === 'booked') return <BookedScene dispatch={dispatch} />
  if (state.scene === 'billing') return <BillingScene state={state} dispatch={dispatch} />
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
        <span>Patio at Cedar Lane Cafe</span>
        <span className={styles.messageCount}>{compact ? '2' : '3'} MSG</span>
      </div>
      <ol className={styles.messages} aria-label="Sample email correspondence">
        {!compact && (
          <li className={styles.message}>
            <div className={styles.messageHeader}><strong>{SAMPLE.client}</strong><time dateTime="2026-09-21T09:08:00">MON 09:08</time></div>
            <p>Could you replace the cracked patio at the cafe? The address is <span className={ui.mono}>{SAMPLE.address}</span>.</p>
          </li>
        )}
        <li className={`${styles.message} ${styles.outbound}`}>
          <div className={styles.messageHeader}><strong>You</strong><time dateTime="2026-09-21T09:14:00">MON 09:14</time></div>
          <p>Mike can visit Tuesday, <span className={ui.mono}>Sep 22 at 10:00 AM</span>, to measure the patio. Does that work?</p>
        </li>
        <li className={styles.message}>
          <div className={styles.messageHeader}><strong>{SAMPLE.client}</strong><time dateTime="2026-09-21T09:16:00">MON 09:16</time></div>
          <p>Yes, <span className={ui.mono}>Tuesday at 10:00 AM</span> works. I’ll meet Mike at the cafe.</p>
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
          <div><dt>Assigned to</dt><dd><Avatar name={SAMPLE.estimator} />{SAMPLE.estimator}</dd></div>
          <div><dt>Source</dt><dd><Mail aria-hidden="true" />Email</dd></div>
        </dl>
        <Section title="Summary">
          <p className={styles.summary}>Patio replacement inquiry. Alex confirmed Mike’s site visit for <span className={ui.mono}>Tuesday at 10:00 AM</span>.</p>
        </Section>
        <Section title="Activity" action={<span className={ui.label}>Email thread</span>}>
          <Correspondence />
          <div className={styles.systemEntry}><Link2 aria-hidden="true" /><span>Lead and site visit linked to this conversation.</span></div>
        </Section>
      </div>
      <div className={ui.toolbar}>
        <Action data-demo-next="true" onClick={() => dispatch({ type: 'OPEN_BOOKING' })}>Open booked visit <ChevronRight aria-hidden="true" /></Action>
      </div>
    </div>
  )
}

function BookedScene({ dispatch }: Pick<SceneProps, 'dispatch'>) {
  return (
    <div className={styles.scene}>
      <AppHeader title="Site visit" right={<Badge tone="tan">Booked</Badge>} />
      <div className={styles.content}>
        <div className={styles.appointment}>
          <div className={styles.calendarDate} aria-label="Tuesday, September 22"><span>SEP</span><strong>22</strong><span>TUE</span></div>
          <div className={styles.appointmentBody}>
            <h3>{SAMPLE.project}</h3>
            <p className={styles.appointmentTime}>10:00 AM</p>
            <p>{SAMPLE.company}</p>
          </div>
        </div>
        <dl className={styles.appointmentDetails}>
          <div><dt>Address</dt><dd className={ui.mono}>{SAMPLE.address}</dd></div>
          <div><dt>Client</dt><dd>{SAMPLE.client}</dd></div>
          <div><dt>Assigned to</dt><dd><Avatar name={SAMPLE.estimator} />{SAMPLE.estimator}</dd></div>
        </dl>
        <Section title="Scope"><p className={styles.summary}>{SAMPLE.scope}</p></Section>
        <details className={styles.disclosure}>
          <summary><span>Confirmed by email</span><ChevronRight aria-hidden="true" /></summary>
          <Correspondence compact />
        </details>
        <div className={styles.visitDay}>
          <span className={ui.label}>Sample timeline · visit day</span>
          <p>It’s <span className={ui.mono}>Tuesday, Sep 22</span>. Mike is at the cafe.</p>
        </div>
      </div>
      <div className={ui.toolbar}>
        <Action data-demo-next="true" onClick={() => dispatch({ type: 'START_VISIT' })}>Start site visit <ChevronRight aria-hidden="true" /></Action>
      </div>
    </div>
  )
}

function BillingScene({ state, dispatch }: SceneProps) {
  const [recording, setRecording] = useState(false)
  const [showAccounting, setShowAccounting] = useState(false)
  const [provider, setProvider] = useState<'QuickBooks' | 'Sage'>('QuickBooks')
  const paymentHeading = useRef<HTMLHeadingElement>(null)
  const previousRecording = useRef(recording)
  useEffect(() => {
    if (recording === previousRecording.current) return
    previousRecording.current = recording
    paymentHeading.current?.focus({ preventScroll: true })
    paymentHeading.current?.scrollIntoView?.({ block: 'start', behavior: 'instant' })
  }, [recording])

  if (recording && !state.paymentRecorded) {
    return (
      <div className={styles.scene}>
        <AppHeader title="Record payment" titleRef={paymentHeading} right={<button className={styles.textAction} type="button" onClick={() => setRecording(false)}>Cancel</button>} />
        <div className={styles.content}>
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
      <AppHeader title="Invoice" titleRef={paymentHeading} right={<Badge tone={state.paymentRecorded ? 'olive' : 'neutral'}>{state.paymentRecorded ? 'Paid' : 'Awaiting payment'}</Badge>} />
      <div className={styles.content}>
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
            <div><span>Patio preparation<small>Labor</small></span><strong>{money(SAMPLE.preparation)}</strong></div>
            <div><span>Patio installation<small>Labor</small></span><strong>{money(SAMPLE.installation)}</strong></div>
            <div><span>Patio materials<small>Materials</small></span><strong>{money(SAMPLE.materials)}</strong></div>
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
          <p className={styles.finePrint}>The work is done. Alex has paid by bank transfer. Record the receipt to update the balance.</p>
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
          <Action data-demo-next="true" onClick={() => setRecording(true)}>Record payment</Action>
        )}
      </div>
    </div>
  )
}

import type { ReactNode } from 'react'
import { Info, Ruler } from 'lucide-react'
import styles from './role-scenes.module.css'

export interface FeatureCalloutProps {
  kind: 'accounting' | 'spec'
  children?: ReactNode
}

/** Availability belongs beside the feature, before its first interaction. */
export function FeatureCallout({ kind, children }: FeatureCalloutProps) {
  const accounting = kind === 'accounting'
  const Icon = accounting ? Info : Ruler
  return <aside className={styles.featureCallout} data-feature={kind} role="note" aria-label={accounting ? 'Accounting beta availability' : 'OPS Spec custom tool availability'}>
    <Icon aria-hidden="true" />
    <div>
      <p className={styles.featureLabel}>{accounting ? 'OPS ACCOUNTING — BETA TESTING' : 'OPS SPEC CUSTOM TOOL'}</p>
      <p className={styles.featureDetail}>{accounting
        ? 'Sending estimates, invoicing and accounting are in beta testing.'
        : 'A custom tool built through OPS Spec for this workflow. Available separately from standard OPS features.'}</p>
      {accounting && <div className={styles.betaRequest}>
        <a href="mailto:jack@opsapp.co?subject=Request%20free%20accounting%20beta%20access">Request free beta access</a>
        <span>Opens an email request</span>
      </div>}
      {children && <div className={styles.featureExtra}>{children}</div>}
    </div>
  </aside>
}

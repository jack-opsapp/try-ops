'use client'

import { trackABClick } from '@/lib/ab/track-click'
import { useCtaMode, APP_STORE_URL, WEB_SIGNUP_URL } from '@/lib/landing/cta-mode'
import { APPROVED_CTA_LABELS } from '@/lib/landing/content-registry'

/** Navigation remains available before hydration and if optional telemetry fails. */
export function PrimaryAction({ section, secondary = false }: { section: string; secondary?: boolean }) {
  const mode = useCtaMode()
  const signup = mode === 'web-signup'
  return <a className={`landing-button${secondary ? ' landing-button-secondary' : ''}`} href={signup ? WEB_SIGNUP_URL : APP_STORE_URL} onClick={() => {
    try { trackABClick(section, signup ? 'signup_btn' : 'download_btn') } catch { /* Navigation must survive unavailable analytics/storage. */ }
  }}>{signup ? APPROVED_CTA_LABELS.webTrial : APPROVED_CTA_LABELS.appStore}</a>
}

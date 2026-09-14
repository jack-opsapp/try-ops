'use client'

import { OpsLockup } from '@/components/brand/OpsLockup'

import { APP_STORE_URL, useCtaMode } from '@/lib/landing/cta-mode'

export function Footer() {
  const mode = useCtaMode()
  return <footer id="footer" className="landing-footer"><div className="landing-container footer-content"><div><OpsLockup title="OPS" /><p>Built by trades, for trades.</p><small>© <span className="landing-number">2026</span> OPS.</small></div><nav aria-label="Support and legal"><a href="https://opsapp.co/resources">Support</a><a href="https://opsapp.co/legal?page=privacy">Privacy</a><a href="https://opsapp.co/legal?page=terms">Terms</a>{mode === 'app-store' && <a href={APP_STORE_URL}>Download for iOS</a>}</nav></div></footer>
}

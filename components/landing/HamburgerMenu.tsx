'use client'

import { OpsLockup } from '@/components/brand/OpsLockup'

import { PrimaryAction } from './PrimaryAction'
import { APPROVED_CTA_LABELS } from '@/lib/landing/content-registry'

interface HamburgerMenuProps { onDownloadClick: () => void; onTryClick?: () => void }

/** Compact navigation replaces the acquisition menu; legacy callback contract is retained. */
export function HamburgerMenu({ onTryClick }: HamburgerMenuProps) {
  return <header className="landing-header"><div className="landing-container header-content"><a href="#hero" className="landing-brand" aria-label="OPS — back to top"><OpsLockup title="OPS" /></a><nav aria-label="Page navigation"><a href="#pricing">Pricing</a>{onTryClick && <button type="button" onClick={onTryClick}>{APPROVED_CTA_LABELS.tutorial}</button>}<PrimaryAction section="HamburgerMenu" secondary /></nav></div></header>
}

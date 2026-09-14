import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { CtaModeProvider } from '@/lib/landing/cta-mode'
import { Hero } from '@/components/landing/Hero'
import { PricingSection } from '@/components/landing/PricingSection'
import { PAID_PAGE_CONFIGS } from '@/lib/landing/page-configs'
import { SEED_CONFIG_A } from '@/lib/ab/seed-config'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

function documentFor(node: React.ReactNode) {
  return new DOMParser().parseFromString(renderToStaticMarkup(<CtaModeProvider mode="web-signup">{node}</CtaModeProvider>), 'text/html')
}

describe('landing conversion contract', () => {
  it('renders registration navigation before hydration, independent of optional sections', () => {
    const doc = documentFor(<Hero headline="JOB MANAGEMENT YOUR CREW WILL ACTUALLY USE" subtext="See the plan." primaryCtaLabel="START MY FREE TRIAL" secondaryCtaLabel="" />)
    const action = doc.querySelector('a[href="https://app.opsapp.co/register"]')
    expect(action?.textContent).toBe('START MY FREE TRIAL')
    expect(doc.querySelector('h1')?.getAttribute('style') ?? '').not.toContain('opacity:0')
    expect(action?.closest('[style*="opacity:0"]')).toBeNull()
  })

  it('renders all crew prices once in a semantic comparison without a carousel', () => {
    const doc = documentFor(<PricingSection />)
    const rows = doc.querySelectorAll('[data-plan]')
    expect(rows).toHaveLength(3)
    expect(Array.from(rows).map(row => row.textContent?.replace(/\s+/g, ' '))).toEqual([
      expect.stringContaining('$90'), expect.stringContaining('$140'), expect.stringContaining('$190'),
    ])
    expect(doc.body.textContent).toContain('CAD')
    expect(doc.querySelector('[aria-roledescription="carousel"]')).toBeNull()
  })

  it.each([['root', SEED_CONFIG_A], ...Object.entries(PAID_PAGE_CONFIGS)])('%s serves no unsupported endorsements, future feature list or account form disguised as updates', (_route, config) => {
    expect(config.sections.map(s => s.type)).not.toEqual(expect.arrayContaining(['TestimonialsSection']))
    expect(config.sections.map(s => s.type)).not.toContain('RoadmapSection')
    expect(config.sections.map(s => s.type)).not.toContain('InlineSignupForm')
    expect(JSON.stringify(config)).not.toMatch(/a morning|move the data for you|works without signal|three years|no training required/i)
  })
})

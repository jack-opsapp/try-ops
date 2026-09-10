import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LandingPageClient } from '@/components/ab/LandingPageClient'
import { PAID_PAGE_CONFIGS, paidVariantId } from '@/lib/landing/page-configs'
import type { VariantConfig } from '@/lib/ab/types'

/**
 * The single-CTA rule, held permanently.
 *
 * A paid page that shows an App Store button sends a click we paid for to a
 * destination that cannot record the conversion, and a paid page with two
 * buttons splits the one decision it exists to ask for.
 */
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn(), replace: vi.fn() }),
}))
vi.mock('@/lib/hooks/useAnalytics', () => ({
  useAnalytics: () => ({ trackLandingPageView: vi.fn() }),
}))
vi.mock('@/lib/stores/onboarding-store', () => ({
  useOnboardingStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ setUTMData: vi.fn(), setTutorialStartTime: vi.fn() }),
}))
vi.mock('@/lib/ab/track-click', () => ({ trackABClick: vi.fn() }))

const simple: VariantConfig = {
  sections: [PAID_PAGE_CONFIGS['job-management'].sections[0]],
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{}')))
  vi.stubGlobal('IntersectionObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
})

const linkHrefs = () =>
  Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href') ?? '')

describe('LandingPageClient in web-signup mode', () => {
  it('offers no App Store destination anywhere on the page', () => {
    render(
      <LandingPageClient
        config={simple}
        variantId={paidVariantId('job-management')}
        ctaMode="web-signup"
      />
    )
    expect(document.body.innerHTML).not.toContain('apps.apple.com')
    expect(linkHrefs().join(' ')).not.toContain('apps.apple.com')
  })

  it('shows one call to action in the hero, not two', () => {
    render(
      <LandingPageClient
        config={simple}
        variantId={paidVariantId('job-management')}
        ctaMode="web-signup"
      />
    )
    // Both hero layouts (mobile and desktop) render; each contributes one
    // primary button and, in this mode, no secondary.
    expect(screen.queryAllByRole('button', { name: /try it/i })).toHaveLength(0)
    expect(screen.getAllByRole('button', { name: /start free/i }).length).toBeGreaterThan(0)
  })

  it('promises only what the trial actually is', () => {
    render(
      <LandingPageClient
        config={simple}
        variantId={paidVariantId('job-management')}
        ctaMode="web-signup"
      />
    )
    expect(document.body.textContent).toContain('No credit card')
    expect(document.body.textContent).not.toContain('Rated 5.0')
  })
})

describe('LandingPageClient in app-store mode', () => {
  it('keeps the organic page exactly as it was', () => {
    const { unmount } = render(<LandingPageClient config={simple} variantId="a" />)
    const organicButtons = screen.getAllByRole('button', { name: /start free/i }).length
    const organicHtml = document.body.innerHTML
    expect(document.body.textContent).toContain('Rated 5.0')
    expect(organicHtml).toContain('apps.apple.com')
    unmount()

    render(
      <LandingPageClient config={simple} variantId="paid" ctaMode="web-signup" />
    )
    // Same hero, one fewer button per layout: the secondary is gone.
    expect(screen.getAllByRole('button', { name: /start free/i }).length).toBeLessThan(
      organicButtons
    )
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { LandingPageClient } from '@/components/ab/LandingPageClient'
import { PrimaryAction } from '@/components/landing/PrimaryAction'
import { ProductProof } from '@/components/landing/ProductProof'
import { ComparisonPreview } from '@/components/landing/CompareTable'
import { CtaModeProvider, APP_STORE_URL, WEB_SIGNUP_URL } from '@/lib/landing/cta-mode'
import { PAID_PAGE_CONFIGS } from '@/lib/landing/page-configs'
import { isComparisonCurrent, COMPARISON_VALID_UNTIL } from '@/lib/landing/content-registry'
import { trackABClick } from '@/lib/ab/track-click'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/' }))
vi.mock('@/lib/hooks/useAnalytics', () => ({ useAnalytics: () => ({ trackLandingPageView: vi.fn() }) }))
vi.mock('@/lib/stores/onboarding-store', () => ({ useOnboardingStore: (selector: (s: Record<string, unknown>) => unknown) => selector({ setUTMData: vi.fn(), setTutorialStartTime: vi.fn() }) }))
vi.mock('@/lib/ab/track-click', () => ({ trackABClick: vi.fn() }))

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('{}')))
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} })
})
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

const simple = { sections: [PAID_PAGE_CONFIGS['job-management'].sections[0]] }

describe('landing actions', () => {
  it('defaults root to the same web signup action as paid pages', () => {
    render(<LandingPageClient config={simple} variantId="a" />)
    expect(screen.getAllByRole('link', { name: 'START MY FREE TRIAL' }).every(link => link.getAttribute('href') === WEB_SIGNUP_URL)).toBe(true)
    expect(document.body.innerHTML).not.toContain('apps.apple.com')
    expect(document.body.textContent).toContain('No credit card')
    expect(document.body.textContent).not.toMatch(/Rated 5.0|free forever/)
    expect(document.querySelector('main')?.className).toBe('landing-page')
  })

  it('keeps native navigation uncancelled when click telemetry throws', () => {
    vi.mocked(trackABClick).mockImplementationOnce(() => { throw new Error('Storage unavailable') })
    render(<CtaModeProvider mode="web-signup"><PrimaryAction section="Hero" /></CtaModeProvider>)
    const action = screen.getByRole('link', { name: 'START MY FREE TRIAL' })
    let wasCancelled: boolean | undefined
    // Prevent JSDOM leaving only after observing whether the app cancelled navigation.
    document.addEventListener('click', event => { wasCancelled = event.defaultPrevented; event.preventDefault() }, { once: true })
    fireEvent.click(action)
    expect(wasCancelled).toBe(false)
    expect(action.getAttribute('href')).toBe(WEB_SIGNUP_URL)
  })

  it('gives the legacy download a real App Store href without any download section', () => {
    render(<CtaModeProvider mode="app-store"><PrimaryAction section="Hero" /></CtaModeProvider>)
    expect(screen.getByRole('link', { name: 'DOWNLOAD FOR iOS' }).getAttribute('href')).toBe(APP_STORE_URL)
  })

  it('switches actual product proof and preserves a full-size image destination', () => {
    render(<ProductProof />)
    fireEvent.click(screen.getByRole('button', { name: 'Job board' }))
    expect(screen.getByRole('button', { name: 'Job board' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('img', { name: /job board/i }).getAttribute('src')).toContain('ios-job-board')
    expect(screen.getByRole('link', { name: /view full screenshot/i }).getAttribute('href')).toBe('/images/product/ios-job-board.png')
  })
})

describe('comparison claim freshness', () => {
  it('rejects time before verification, invalid time and the exact expiry boundary', () => {
    expect(isComparisonCurrent('jobber', Date.parse('2026-09-13T23:59:59Z'))).toBe(false)
    expect(isComparisonCurrent('jobber', NaN)).toBe(false)
    expect(isComparisonCurrent('jobber', Date.parse(COMPARISON_VALID_UNTIL))).toBe(false)
  })
  it('removes a rival price while an already-open page crosses its expiry', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-13T23:59:30Z'))
    render(<ComparisonPreview rival="jobber" />)
    expect(document.body.textContent).toContain('$199')
    act(() => { vi.advanceTimersByTime(60_000) })
    expect(document.body.textContent).not.toMatch(/\$199|\$189/)
    expect(screen.getByRole('link', { name: 'Check current price' })).toBeTruthy()
  })
})

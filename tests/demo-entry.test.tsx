// @vitest-environment jsdom
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Hero } from '@/components/landing/Hero'
import { CtaModeProvider } from '@/lib/landing/cta-mode'
import { trackABClick } from '@/lib/ab/track-click'

const route = vi.hoisted(() => ({ pathname: '/' as string | null }))
vi.mock('next/navigation', () => ({
  usePathname: () => route.pathname,
  useRouter: () => ({ push: vi.fn() }),
}))
vi.mock('@/lib/ab/track-click', () => ({ trackABClick: vi.fn() }))

function showHero() {
  return render(<CtaModeProvider mode="web-signup"><Hero
    headline="JOB MANAGEMENT YOUR CREW WILL ACTUALLY USE"
    subtext="The job details are ready."
    primaryCtaLabel="START MY FREE TRIAL"
    secondaryCtaLabel=""
  /></CtaModeProvider>)
}

afterEach(() => { cleanup(); route.pathname = '/'; vi.clearAllMocks() })

describe('optional sample demo entry', () => {
  it('offers a native product exploration link while signup keeps primary prominence', () => {
    showHero()
    const demo = screen.getByRole('link', { name: 'See it in action' })
    expect(demo.getAttribute('href')).toBe('/demo')
    expect(demo.closest('figure[aria-label="See OPS for iPhone"]')).not.toBeNull()
    expect(demo.classList.contains('landing-button')).toBe(false)
    const signup = screen.getByRole('link', { name: 'START MY FREE TRIAL' })
    expect(signup.getAttribute('href')).toBe('https://app.opsapp.co/register')
    expect(signup.classList.contains('landing-button')).toBe(true)
    expect(document.body.textContent).toContain('30 days free. No credit card.')
  })

  it.each(['/job-management', '/compare/jobber', '/for/roofing'])(
    'carries only the known %s pathname for an honest return destination', pathname => {
      route.pathname = pathname
      showHero()
      expect(screen.getByRole('link', { name: 'See it in action' }).getAttribute('href'))
        .toBe(`/demo?${new URLSearchParams({ from: pathname })}`)
    },
  )

  it.each([null, '/unrecognized', '//untrusted.example'])('falls back safely for %s', pathname => {
    route.pathname = pathname
    showHero()
    expect(screen.getByRole('link', { name: 'See it in action' }).getAttribute('href')).toBe('/demo')
  })

  it('does not cancel native navigation when optional click diagnostics fail', () => {
    vi.mocked(trackABClick).mockImplementationOnce(() => { throw new Error('Unavailable') })
    showHero()
    let wasCancelled: boolean | undefined
    document.addEventListener('click', event => {
      wasCancelled = event.defaultPrevented
      event.preventDefault()
    }, { once: true })
    fireEvent.click(screen.getByRole('link', { name: 'See it in action' }))
    expect(wasCancelled).toBe(false)
    expect(trackABClick).toHaveBeenCalledWith('Hero', 'demo_link')
  })
})

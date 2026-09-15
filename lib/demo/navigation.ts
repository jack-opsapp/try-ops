export type LegacySearch = Record<string, string | string[] | undefined>
export const CANONICAL_REGISTER = 'https://app.opsapp.co/register'
export const CANONICAL_LOGIN = 'https://app.opsapp.co/login'
export const DEMO_LANDING_ROUTES = ['/', '/job-management', '/compare/jobber', '/compare/housecall-pro', '/compare/servicetitan', '/for/cleaning', '/for/landscaping', '/for/roofing'] as const

export function safeDemoExit(value: unknown): string {
  return typeof value === 'string' && (DEMO_LANDING_ROUTES as readonly string[]).includes(value) ? value : '/'
}
export function demoDestination(search: LegacySearch = {}): string {
  const from = safeDemoExit(search.from)
  return from === '/' ? '/demo' : `/demo?${new URLSearchParams({ from })}`
}
export function legacySignupDestination(step: string, search: LegacySearch = {}): string {
  const code = search.code
  if (typeof code === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(code))
    return `https://app.opsapp.co/join?${new URLSearchParams({ code })}`
  if (search.mode === 'login' || search.mode === 'signin' || step === 'ready' || step === 'company-code') return CANONICAL_LOGIN
  return CANONICAL_REGISTER
}

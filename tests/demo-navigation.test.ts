import { describe, expect, it } from 'vitest'
import { legacySignupDestination, demoDestination, safeDemoExit } from '../lib/demo/navigation'

describe('legacy compatible destinations', () => {
  it('preserves legitimate invite codes and sign-in intent with fixed origins', () => {
    expect(legacySignupDestination('credentials', { code: 'ABC123' })).toBe('https://app.opsapp.co/join?code=ABC123')
    expect(legacySignupDestination('credentials', { mode: 'login', next: 'https://evil.test' })).toBe('https://app.opsapp.co/login')
    expect(legacySignupDestination('ready', { userId: 'spoofed', companyId: 'spoofed' })).toBe('https://app.opsapp.co/login')
    expect(legacySignupDestination('profile', {})).toBe('https://app.opsapp.co/register')
  })
  it('rejects open redirects and drops arbitrary/PII context', () => {
    for (const from of ['https://evil.test', '//evil.test', '/\\evil.test', '/job-management?email=x', '/unknown', ['/for/roofing']]) expect(safeDemoExit(from)).toBe('/')
    expect(safeDemoExit('/for/roofing')).toBe('/for/roofing')
    expect(demoDestination({ from: '/job-management', email: 'private@example.test', next: '//evil.test' })).toBe('/demo?from=%2Fjob-management')
  })
  it('rejects malformed and ambiguous join codes', () => {
    for (const code of ['../evil', 'x'.repeat(129), ['ABC', 'DEF']]) expect(legacySignupDestination('credentials', { code })).toBe('https://app.opsapp.co/register')
  })
})

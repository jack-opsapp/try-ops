'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TypewriterText } from '@/components/ui/TypewriterText'
import { OPSButton } from '@/components/ui/OPSButton'
import { OPSInput } from '@/components/ui/OPSInput'
import { PhasedContent } from '@/components/ui/PhasedContent'
import { OnboardingScaffold } from '@/components/layout/OnboardingScaffold'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { useAnalytics } from '@/lib/hooks/useAnalytics'

export default function CredentialsPage() {
  const router = useRouter()
  const { trackSignupStepView, trackSignupStepComplete } = useAnalytics()
  const { setAuth, setSignupStep } = useOnboardingStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    setSignupStep(1)
    trackSignupStepView('credentials', 1)
  }, [setSignupStep, trackSignupStepView])

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!value) return 'Email is required'
    if (!emailRegex.test(value)) return 'Enter a valid email'
    return ''
  }

  const validatePassword = (value: string) => {
    if (!value) return 'Password is required'
    if (value.length < 8) return 'Must be at least 8 characters'
    return ''
  }

  const handleSubmit = async () => {
    const eErr = validateEmail(email)
    const pErr = validatePassword(password)
    setEmailError(eErr)
    setPasswordError(pErr)
    if (eErr || pErr) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Signup failed. Please try again.')
        setLoading(false)
        return
      }

      setAuth(data.userId, 'email')
      trackSignupStepComplete('credentials', 1)
      router.push('/signup/profile')
    } catch {
      setError('Connection error. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    // Google Sign-In will be implemented with Google Identity Services
    // For now, show a placeholder
    setError('Google Sign-In coming soon. Please use email/password.')
  }

  const handleAppleSignIn = async () => {
    // Apple Sign-In will be implemented with Apple JS SDK
    setError('Apple Sign-In coming soon. Please use email/password.')
  }

  return (
    <OnboardingScaffold showBack onBack={() => router.push('/tutorial/complete')}>
      <div className="max-w-md mx-auto w-full">
        <h1 className="text-ops-title font-mohave font-semibold tracking-wide mb-2">
          <TypewriterText text="CREATE YOUR ACCOUNT" typingSpeed={30} />
        </h1>

        <PhasedContent delay={800}>
          <p className="font-kosugi text-ops-body text-ops-text-secondary mb-8">
            Let&apos;s get you set up. No credit card required.
          </p>
        </PhasedContent>

        <PhasedContent delay={1200}>
          <div className="space-y-4">
            <OPSInput
              label="Email"
              type="email"
              value={email}
              onChange={(v) => {
                setEmail(v)
                setEmailError('')
              }}
              placeholder="you@company.com"
              required
              error={emailError}
              autoComplete="email"
            />

            <OPSInput
              label="Password"
              type="password"
              value={password}
              onChange={(v) => {
                setPassword(v)
                setPasswordError('')
              }}
              placeholder="8+ characters"
              required
              error={passwordError}
              autoComplete="new-password"
            />

            {error && (
              <p className="font-kosugi text-ops-small text-ops-error text-center">
                {error}
              </p>
            )}

            <OPSButton
              onClick={handleSubmit}
              loading={loading}
              loadingText="CREATING ACCOUNT..."
              disabled={!email || !password}
            >
              CREATE ACCOUNT
            </OPSButton>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-white/10" />
              <span className="font-kosugi text-ops-small text-ops-text-tertiary">
                OR
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Social auth */}
            <OPSButton variant="secondary" onClick={handleGoogleSignIn}>
              <span className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                CONTINUE WITH GOOGLE
              </span>
            </OPSButton>

            <OPSButton variant="secondary" onClick={handleAppleSignIn}>
              <span className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                CONTINUE WITH APPLE
              </span>
            </OPSButton>
          </div>
        </PhasedContent>
      </div>
    </OnboardingScaffold>
  )
}

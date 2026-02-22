'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { TypewriterText } from '@/components/ui/TypewriterText'
import { OPSButton } from '@/components/ui/OPSButton'
import { OPSInput } from '@/components/ui/OPSInput'
import { PhasedContent } from '@/components/ui/PhasedContent'
import { OnboardingScaffold } from '@/components/layout/OnboardingScaffold'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { useAnalytics } from '@/lib/hooks/useAnalytics'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void
          prompt: () => void
          renderButton: (
            element: HTMLElement,
            config: Record<string, unknown>
          ) => void
        }
      }
    }
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

export default function CredentialsPage() {
  const router = useRouter()
  const { trackSignupStepView, trackSignupStepComplete, trackSignupAuthAttempt, trackSignupFieldError } = useAnalytics()
  const { setAuth, setProfile, setSignupStep } = useOnboardingStore()

  const [isLoginMode, setIsLoginMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const googleBtnRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSignupStep(1)
    trackSignupStepView('credentials', 1)
  }, [setSignupStep, trackSignupStepView])

  const handleGoogleResponse = useCallback(
    async (response: { credential: string }) => {
      setGoogleLoading(true)
      setError('')
      trackSignupAuthAttempt('google', 'started')

      try {
        const payload = JSON.parse(
          atob(response.credential.split('.')[1])
        )

        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_token: response.credential,
            email: payload.email,
            name: payload.name || '',
            given_name: payload.given_name || '',
            family_name: payload.family_name || '',
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          const errorMsg = data.error || 'Google sign-in failed. Please try again.'
          setError(errorMsg)
          trackSignupAuthAttempt('google', 'failed', errorMsg)
          setGoogleLoading(false)
          return
        }

        setAuth(data.userId, 'google', payload.email)

        if (data.firstName || data.lastName) {
          setProfile({
            firstName: data.firstName || payload.given_name || '',
            lastName: data.lastName || payload.family_name || '',
            phone: '',
          })
        }

        trackSignupAuthAttempt('google', 'completed')
        trackSignupStepComplete('credentials', 1)
        router.push('/signup/profile')
      } catch {
        const errorMsg = 'Connection error. Please try again.'
        setError(errorMsg)
        trackSignupAuthAttempt('google', 'failed', errorMsg)
      } finally {
        setGoogleLoading(false)
      }
    },
    [setAuth, setProfile, trackSignupStepComplete, trackSignupAuthAttempt, router]
  )

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
      })

      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          size: 'large',
          width: 300,
        })
      }
    }

    if (window.google?.accounts?.id) {
      initGoogle()
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval)
          initGoogle()
        }
      }, 100)
      setTimeout(() => clearInterval(interval), 5000)
    }
  }, [handleGoogleResponse])

  const handleGoogleClick = () => {
    const btn =
      googleBtnRef.current?.querySelector<HTMLElement>('[role="button"]') ||
      googleBtnRef.current?.querySelector<HTMLElement>('div[style]')
    if (btn) {
      btn.click()
    }
  }

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!value) return 'Email is required'
    if (!emailRegex.test(value)) return 'Enter a valid email'
    return ''
  }

  const validatePassword = (value: string) => {
    if (!value) return 'Password is required'
    if (!isLoginMode && value.length < 8) return 'Must be at least 8 characters'
    return ''
  }

  const handleSubmit = async () => {
    const eErr = validateEmail(email)
    const pErr = validatePassword(password)
    setEmailError(eErr)
    setPasswordError(pErr)
    if (eErr) {
      trackSignupFieldError('credentials', 'email', eErr)
    }
    if (pErr) {
      trackSignupFieldError('credentials', 'password', pErr)
    }
    if (eErr || pErr) return

    setLoading(true)
    setError('')
    const method = isLoginMode ? 'email_login' : 'email_signup'
    trackSignupAuthAttempt(method, 'started')

    try {
      const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/signup'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMsg = data.error || (isLoginMode ? 'Login failed.' : 'Signup failed. Please try again.')
        setError(errorMsg)
        trackSignupAuthAttempt(method, 'failed', errorMsg)
        setLoading(false)
        return
      }

      setAuth(data.userId, 'email', email)
      trackSignupAuthAttempt(method, 'completed')
      trackSignupStepComplete('credentials', 1)
      router.push(isLoginMode ? '/download' : '/signup/profile')
    } catch {
      const errorMsg = 'Connection error. Please check your internet and try again.'
      setError(errorMsg)
      trackSignupAuthAttempt(method, 'failed', errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && email && password) {
      handleSubmit()
    }
  }

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    setError('')
    setEmailError('')
    setPasswordError('')
  }

  return (
    <OnboardingScaffold showBack onBack={() => router.push('/tutorial/complete')}>
      <div className="px-10">
        <h1 className="font-mohave font-semibold text-ops-title tracking-wide mb-2">
          <TypewriterText
            text={isLoginMode ? 'WELCOME BACK' : 'CREATE YOUR ACCOUNT'}
            typingSpeed={30}
            key={isLoginMode ? 'login' : 'signup'}
          />
        </h1>

        <PhasedContent delay={800}>
          <p className="font-kosugi text-ops-body text-ops-text-secondary mb-8">
            {isLoginMode
              ? 'Sign in to your existing account.'
              : "Let's get you set up. No credit card required."}
          </p>
        </PhasedContent>

        <PhasedContent delay={1200}>
          <div className="space-y-4" onKeyDown={handleKeyDown}>
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
              placeholder={isLoginMode ? 'Your password' : '8+ characters'}
              required
              error={passwordError}
              autoComplete={isLoginMode ? 'current-password' : 'new-password'}
            />

            {error && (
              <p className="font-kosugi text-ops-small text-ops-error text-center">
                {error}
              </p>
            )}

            <OPSButton
              onClick={handleSubmit}
              loading={loading}
              loadingText={isLoginMode ? 'SIGNING IN...' : 'CREATING ACCOUNT...'}
              disabled={!email || !password}
            >
              {isLoginMode ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </OPSButton>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-ops-border" />
              <span className="font-kosugi text-ops-small text-ops-text-tertiary">
                OR
              </span>
              <div className="flex-1 h-px bg-ops-border" />
            </div>

            {/* Google Sign-In */}
            <OPSButton
              variant="secondary"
              onClick={handleGoogleClick}
              loading={googleLoading}
              loadingText="SIGNING IN..."
            >
              <span className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                CONTINUE WITH GOOGLE
              </span>
            </OPSButton>

            {/* Login/Signup toggle */}
            <p className="text-center pt-2">
              <span className="font-kosugi text-ops-caption text-ops-text-tertiary">
                {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
              </span>
              <button
                type="button"
                onClick={toggleMode}
                className="font-kosugi text-ops-caption text-ops-accent hover:text-ops-accent/80 transition-colors"
              >
                {isLoginMode ? 'Sign up' : 'Log in'}
              </button>
            </p>

            {/* Hidden Google Identity Services button */}
            <div
              ref={googleBtnRef}
              className="absolute overflow-hidden"
              style={{ width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
            />
          </div>
        </PhasedContent>
      </div>
    </OnboardingScaffold>
  )
}

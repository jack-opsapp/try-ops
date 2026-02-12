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
  const { trackSignupStepView, trackSignupStepComplete } = useAnalytics()
  const { setAuth, setProfile, setSignupStep } = useOnboardingStore()

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

      try {
        // Decode the JWT to get user info (for display; server verifies)
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
          setError(data.error || 'Google sign-in failed. Please try again.')
          setGoogleLoading(false)
          return
        }

        setAuth(data.userId, 'google')

        // If Bubble returned profile info, store it so we can pre-fill
        if (data.firstName || data.lastName) {
          setProfile({
            firstName: data.firstName || payload.given_name || '',
            lastName: data.lastName || payload.family_name || '',
            phone: '',
          })
        }

        trackSignupStepComplete('credentials', 1)
        router.push('/signup/profile')
      } catch {
        setError('Connection error. Please try again.')
      } finally {
        setGoogleLoading(false)
      }
    },
    [setAuth, setProfile, trackSignupStepComplete, router]
  )

  // Initialize Google Sign-In
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
      })

      // Render the branded button
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          width: googleBtnRef.current.offsetWidth,
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        })
      }
    }

    // The script may already be loaded
    if (window.google?.accounts?.id) {
      initGoogle()
    } else {
      // Wait for script to load
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval)
          initGoogle()
        }
      }, 100)
      // Give up after 5s
      setTimeout(() => clearInterval(interval), 5000)
    }
  }, [handleGoogleResponse])

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && email && password) {
      handleSubmit()
    }
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

            {/* Google Sign-In */}
            {googleLoading ? (
              <OPSButton variant="secondary" loading loadingText="SIGNING IN...">
                CONTINUE WITH GOOGLE
              </OPSButton>
            ) : (
              <div
                ref={googleBtnRef}
                className="w-full min-h-[56px] flex items-center justify-center rounded-ops overflow-hidden"
              />
            )}
          </div>
        </PhasedContent>
      </div>
    </OnboardingScaffold>
  )
}

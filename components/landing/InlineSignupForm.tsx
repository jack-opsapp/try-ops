'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { z } from 'zod'
import { InlineSignupFormPropsSchema } from '@/lib/ab/types'
import { signUpWithEmail } from '@/lib/firebase/auth'
import { getTutorialRoute } from '@/lib/utils/tutorial-routes'
import type { User } from 'firebase/auth'

type InlineSignupFormProps = z.infer<typeof InlineSignupFormPropsSchema> & {
  onSuccess?: () => void
}

async function syncUser(firebaseUser: User) {
  const idToken = await firebaseUser.getIdToken()
  const res = await fetch('/api/auth/sync-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idToken,
      email: firebaseUser.email,
    }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to sync user')
  }
  return res.json()
}

export function InlineSignupForm({ onSuccess, location, heading, subtext }: InlineSignupFormProps) {
  const isStandalone = location !== 'hero' && location !== 'closing'
  const router = useRouter()
  const setAuth = useOnboardingStore((s) => s.setAuth)
  const setTutorialStartTime = useOnboardingStore((s) => s.setTutorialStartTime)
  const { trackSignupAuthAttempt } = useAnalytics()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')

      // Client-side validation
      const trimmedEmail = email.trim()
      if (!trimmedEmail) {
        setError('Email is required.')
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setError('Please enter a valid email.')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }

      setLoading(true)
      trackSignupAuthAttempt(`inline_signup_${location}`, 'started')

      try {
        const firebaseUser = await signUpWithEmail(trimmedEmail, password)
        const data = await syncUser(firebaseUser)

        setAuth(data.user.id, 'email', trimmedEmail)
        setTutorialStartTime(Date.now())
        trackSignupAuthAttempt(`inline_signup_${location}`, 'completed')

        if (onSuccess) {
          onSuccess()
        } else {
          const variant = document.cookie.split(';').find(c => c.trim().startsWith('ops_variant='))?.split('=')[1]?.trim() || 'a'
          router.push(getTutorialRoute(variant))
        }
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code
        let errorMsg = 'Signup failed. Please try again.'
        if (code === 'auth/email-already-in-use') {
          errorMsg = 'An account with this email already exists. Try signing in.'
        } else if (code === 'auth/weak-password') {
          errorMsg = 'Password must be at least 6 characters.'
        } else if (err instanceof Error) {
          errorMsg = err.message
        }
        setError(errorMsg)
        trackSignupAuthAttempt(`inline_signup_${location}`, 'failed', errorMsg)
      } finally {
        setLoading(false)
      }
    },
    [email, password, location, setAuth, setTutorialStartTime, trackSignupAuthAttempt, onSuccess, router]
  )

  const formContent = (
    <div className="w-full max-w-[440px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="w-full bg-ops-card border border-white/10 rounded-[3px] px-4 py-3 font-mono text-[13px] text-ops-gray-50 placeholder:text-ops-gray-400 outline-none focus:border-white/30 transition-colors disabled:opacity-50"
        />
        <input
          type="password"
          placeholder="Password (6+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="w-full bg-ops-card border border-white/10 rounded-[3px] px-4 py-3 font-mono text-[13px] text-ops-gray-50 placeholder:text-ops-gray-400 outline-none focus:border-white/30 transition-colors disabled:opacity-50"
        />
        {error && (
          <p className="font-mono text-[12px] text-red-400">{error}</p>
        )}
        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-[#0A0A0A] font-mono uppercase tracking-[0.15em] text-xs rounded-[3px] px-6 py-3 cursor-pointer inline-flex items-center justify-center gap-2 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={loading ? undefined : { scale: 1.02, transition: { duration: 0.2 } }}
          whileTap={loading ? undefined : { scale: 0.98 }}
        >
          {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
        </motion.button>
      </form>
      <p className="font-mono text-[12px] text-ops-gray-400 mt-3">
        Already have an account?{' '}
        <a
          href="/signup/credentials"
          className="text-ops-gray-200 underline hover:text-white transition-colors"
        >
          Log in
        </a>
      </p>
    </div>
  )

  // When embedded inside Hero/ClosingCTA, return just the form
  if (!isStandalone) return formContent

  // When used as a standalone section, wrap with proper centering and padding
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-[700px] mx-auto px-6 lg:px-10 flex flex-col items-center text-center">
        {heading && (
          <motion.h2
            className="font-mohave font-bold text-[28px] lg:text-[36px] text-ops-gray-50 uppercase leading-[1.1] tracking-[0.05em] mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.2 }}
          >
            {heading}
          </motion.h2>
        )}
        {subtext && (
          <motion.p
            className="font-mono text-[14px] text-ops-gray-300 mb-8 max-w-[500px]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            {subtext}
          </motion.p>
        )}
        {!heading && !subtext && (
          <>
            <h2 className="font-mohave font-bold text-[28px] lg:text-[36px] text-ops-gray-50 uppercase leading-[1.1] tracking-[0.05em] mb-3">
              READY TO TRY IT?
            </h2>
            <p className="font-mono text-[14px] text-ops-gray-300 mb-8 max-w-[500px]">
              Create your account in seconds. No credit card required.
            </p>
          </>
        )}
        {formContent}
      </div>
    </section>
  )
}

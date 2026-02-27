'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { useAnalytics } from '@/lib/hooks/useAnalytics'

interface InlineSignupFormProps {
  onSuccess?: () => void
  location: string
}

export function InlineSignupForm({ onSuccess, location }: InlineSignupFormProps) {
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
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail, password }),
        })

        const data = await res.json()

        if (!res.ok) {
          const errorMsg = data.error || 'Signup failed. Please try again.'
          setError(errorMsg)
          trackSignupAuthAttempt(`inline_signup_${location}`, 'failed', errorMsg)
          setLoading(false)
          return
        }

        setAuth(data.userId, 'email', trimmedEmail)
        setTutorialStartTime(Date.now())
        trackSignupAuthAttempt(`inline_signup_${location}`, 'completed')

        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/tutorial-intro')
        }
      } catch {
        const errorMsg = 'Connection error. Please check your internet and try again.'
        setError(errorMsg)
        trackSignupAuthAttempt(`inline_signup_${location}`, 'failed', errorMsg)
      } finally {
        setLoading(false)
      }
    },
    [email, password, location, setAuth, setTutorialStartTime, trackSignupAuthAttempt, onSuccess, router]
  )

  return (
    <div className="w-full max-w-[440px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="w-full bg-ops-card border border-white/10 rounded-[3px] px-4 py-3 font-kosugi text-[13px] text-ops-gray-50 placeholder:text-ops-gray-400 outline-none focus:border-white/30 transition-colors disabled:opacity-50"
        />
        <input
          type="password"
          placeholder="Password (6+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="w-full bg-ops-card border border-white/10 rounded-[3px] px-4 py-3 font-kosugi text-[13px] text-ops-gray-50 placeholder:text-ops-gray-400 outline-none focus:border-white/30 transition-colors disabled:opacity-50"
        />

        {error && (
          <p className="font-kosugi text-[12px] text-red-400">{error}</p>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-[#0A0A0A] font-kosugi uppercase tracking-[0.15em] text-xs rounded-[3px] px-6 py-3 cursor-pointer inline-flex items-center justify-center gap-2 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={loading ? undefined : { scale: 1.02, transition: { duration: 0.2 } }}
          whileTap={loading ? undefined : { scale: 0.98 }}
        >
          {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
        </motion.button>
      </form>

      <p className="font-kosugi text-[12px] text-ops-gray-400 mt-3">
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
}

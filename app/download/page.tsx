'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'

const APP_STORE_URL = 'https://apps.apple.com/app/ops-app/id6503204873'

export default function DownloadPage() {
  const { userId, companyId } = useOnboardingStore()
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    // Attempt deep link first
    const deepLink = `opsapp://launch?userId=${userId || ''}&companyId=${companyId || ''}&source=web_onboarding`
    window.location.href = deepLink

    // If deep link doesn't work after 500ms, show App Store fallback
    const timeout = setTimeout(() => {
      setShowFallback(true)
      window.location.href = APP_STORE_URL
    }, 1500)

    return () => clearTimeout(timeout)
  }, [userId, companyId])

  return (
    <div className="min-h-screen bg-ops-background flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <Image
          src="/images/ops-logo-white.png"
          alt="OPS"
          width={100}
          height={40}
          className="mx-auto mb-8 object-contain"
        />

        <h1 className="font-mohave text-ops-title font-semibold text-white mb-4">
          {showFallback ? 'Download OPS' : 'Opening OPS...'}
        </h1>

        <p className="font-kosugi text-ops-body text-ops-text-secondary mb-8">
          {showFallback
            ? "If the App Store didn't open, tap the button below."
            : 'Redirecting you to the app...'}
        </p>

        {showFallback && (
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-14 px-8 rounded-ops bg-white text-black font-mohave font-semibold text-ops-body tracking-wide hover:bg-gray-200 transition-colors w-full"
          >
            OPEN APP STORE
          </a>
        )}

        {/* Loading spinner while waiting */}
        {!showFallback && (
          <div className="flex justify-center">
            <svg
              className="animate-spin h-8 w-8 text-ops-accent"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, useRef } from 'react'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'

const APP_STORE_URL = 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078'

/**
 * TacticalLoadingBar — matches iOS TacticalLoadingBarAnimated exactly.
 * 8 vertical bars, 3-bar wave sweeping across at 150ms intervals.
 */
function TacticalLoadingBar() {
  const barCount = 8
  const activeRange = 3
  const [offset, setOffset] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setOffset((prev) => (prev + 1) % barCount)
    }, 150)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: barCount }).map((_, i) => {
        const normalizedIndex = (i + barCount - offset) % barCount
        const isActive = normalizedIndex < activeRange
        return (
          <div
            key={i}
            className="transition-colors duration-150"
            style={{
              width: 2,
              height: 6,
              backgroundColor: isActive
                ? 'rgba(229, 229, 229, 1)'
                : 'rgba(255, 255, 255, 0.2)',
            }}
          />
        )
      })}
    </div>
  )
}

export default function DownloadPage() {
  const { userId, companyId } = useOnboardingStore()
  const [showFallback, setShowFallback] = useState(false)
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)

  useEffect(() => {
    // Minimum 3s display of loading animation
    const minTimer = setTimeout(() => setMinTimeElapsed(true), 3000)
    return () => clearTimeout(minTimer)
  }, [])

  useEffect(() => {
    if (!minTimeElapsed) return

    // After 3s, attempt deep link then redirect to App Store
    const deepLink = `opsapp://launch?userId=${userId || ''}&companyId=${companyId || ''}&source=web_onboarding`
    window.location.href = deepLink

    const timeout = setTimeout(() => {
      setShowFallback(true)
      window.location.href = APP_STORE_URL
    }, 1500)

    return () => clearTimeout(timeout)
  }, [minTimeElapsed, userId, companyId])

  return (
    <div className="min-h-screen bg-ops-background flex flex-col items-center justify-center px-6">
      {showFallback ? (
        <div className="max-w-md w-full text-center space-y-6">
          <p className="font-kosugi text-ops-caption text-ops-text-secondary">
            If the App Store didn&apos;t open, tap below.
          </p>
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-14 px-8 rounded-ops bg-white text-black font-mohave font-medium text-ops-body tracking-wide w-full"
          >
            OPEN APP STORE
          </a>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <TacticalLoadingBar />
          <p className="font-kosugi text-[12px] text-ops-text-tertiary uppercase tracking-wider">
            REDIRECTING
          </p>
        </div>
      )}
    </div>
  )
}

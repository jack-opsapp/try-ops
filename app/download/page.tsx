'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { useAnalytics } from '@/lib/hooks/useAnalytics'

const APP_STORE_URL = 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078'
const WEB_DASHBOARD_URL = 'https://app.opsapp.co/dashboard'

function useDeviceDetection() {
  const [device, setDevice] = useState<'ios' | 'mobile' | 'desktop'>('desktop')

  useEffect(() => {
    const ua = navigator.userAgent
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isMobile = isIOS || /Android/.test(ua)

    if (isIOS) setDevice('ios')
    else if (isMobile) setDevice('mobile')
    else setDevice('desktop')
  }, [])

  return device
}

export default function DownloadPage() {
  const { userId, companyId } = useOnboardingStore()
  const { trackDeepLinkAttempt, trackDeepLinkFallback, trackAppDownload } = useAnalytics()
  const device = useDeviceDetection()
  const [deepLinkFailed, setDeepLinkFailed] = useState(false)
  const deepLinkTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleDownloadApp = useCallback(() => {
    trackDeepLinkAttempt('deep_link', userId || '', companyId || '')
    trackAppDownload(userId || '', companyId || '')

    const deepLink = `opsapp://launch?userId=${userId || ''}&companyId=${companyId || ''}&source=web_onboarding`
    window.location.href = deepLink

    // Fallback to App Store after 1.5s
    deepLinkTimerRef.current = setTimeout(() => {
      trackDeepLinkFallback(userId || '', companyId || '', 1500)
      setDeepLinkFailed(true)
      window.location.href = APP_STORE_URL
    }, 1500)
  }, [userId, companyId, trackDeepLinkAttempt, trackDeepLinkFallback, trackAppDownload])

  useEffect(() => {
    return () => {
      if (deepLinkTimerRef.current) clearTimeout(deepLinkTimerRef.current)
    }
  }, [])

  const handleContinueOnWeb = useCallback(() => {
    window.location.href = WEB_DASHBOARD_URL
  }, [])

  const handleAppStoreLink = useCallback(() => {
    trackAppDownload(userId || '', companyId || '')
    window.open(APP_STORE_URL, '_blank', 'noopener,noreferrer')
  }, [userId, companyId, trackAppDownload])

  const isIOS = device === 'ios'

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Header */}
        <div>
          <p className="font-cakemono text-[32px] tracking-[0.2em] text-white/90 leading-none mb-4">
            OPS
          </p>
          <h1 className="font-mohave text-[28px] font-semibold text-text-primary uppercase tracking-wide">
            YOU&apos;RE ALL SET.
          </h1>
          <p className="font-mono text-[13px] text-text-tertiary mt-2">
            {isIOS
              ? 'Download the app to get started, or continue on the web.'
              : 'Continue on the web dashboard, or grab the iOS app.'}
          </p>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          {isIOS ? (
            <>
              {/* iOS: App is primary */}
              <button
                onClick={handleDownloadApp}
                className="w-full h-14 rounded-lg bg-text-primary font-mohave text-[16px] font-semibold text-background uppercase tracking-wide transition-all hover:bg-white active:scale-[0.98]"
              >
                {deepLinkFailed ? 'OPEN APP STORE' : 'DOWNLOAD THE APP'}
              </button>
              <button
                onClick={handleContinueOnWeb}
                className="w-full h-14 rounded-lg border border-border bg-background-elevated font-mohave text-[14px] font-medium text-text-secondary uppercase tracking-wide transition-colors hover:text-text-primary hover:border-text-tertiary"
              >
                CONTINUE ON WEB
              </button>
            </>
          ) : (
            <>
              {/* Desktop/Android: Web is primary */}
              <button
                onClick={handleContinueOnWeb}
                className="w-full h-14 rounded-lg bg-text-primary font-mohave text-[16px] font-semibold text-background uppercase tracking-wide transition-all hover:bg-white active:scale-[0.98]"
              >
                CONTINUE ON WEB
              </button>
              <button
                onClick={handleAppStoreLink}
                className="w-full h-14 rounded-lg border border-border bg-background-elevated font-mohave text-[14px] font-medium text-text-secondary uppercase tracking-wide transition-colors hover:text-text-primary hover:border-text-tertiary"
              >
                GET THE iOS APP
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

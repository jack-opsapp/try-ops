'use client'

import { useCallback } from 'react'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args)
  }
}

export function useAnalytics() {
  const variant = useOnboardingStore((s) => s.variant)

  const track = useCallback(
    (eventName: string, params?: Record<string, unknown>) => {
      gtag('event', eventName, {
        variant: variant || 'unknown',
        ...params,
      })
    },
    [variant]
  )

  const trackTutorialStepView = useCallback(
    (stepId: string, stepIndex: number, totalSteps: number) => {
      track('tutorial_step_view', {
        step_id: stepId,
        step_index: stepIndex,
        total_steps: totalSteps,
      })
    },
    [track]
  )

  const trackTutorialStepComplete = useCallback(
    (stepId: string, stepIndex: number) => {
      track('tutorial_step_complete', {
        step_id: stepId,
        step_index: stepIndex,
      })
    },
    [track]
  )

  const trackTutorialSkip = useCallback(
    (stepId: string, stepIndex: number) => {
      track('tutorial_skip', {
        step_id: stepId,
        step_index: stepIndex,
      })
    },
    [track]
  )

  const trackTutorialComplete = useCallback(
    (totalTimeSeconds: number) => {
      track('tutorial_complete', {
        total_time_seconds: totalTimeSeconds,
      })
    },
    [track]
  )

  const trackSignupStepView = useCallback(
    (stepName: string, stepIndex: number) => {
      track('signup_step_view', {
        step_name: stepName,
        step_index: stepIndex,
      })
    },
    [track]
  )

  const trackSignupStepComplete = useCallback(
    (stepName: string, stepIndex: number) => {
      track('signup_step_complete', {
        step_name: stepName,
        step_index: stepIndex,
      })
    },
    [track]
  )

  const trackSignupComplete = useCallback(
    (authMethod: string) => {
      track('signup_complete', {
        auth_method: authMethod,
      })
    },
    [track]
  )

  const trackAppDownload = useCallback(
    (userId?: string, companyId?: string) => {
      track('app_download_click', {
        user_id: userId,
        company_id: companyId,
      })
    },
    [track]
  )

  return {
    track,
    trackTutorialStepView,
    trackTutorialStepComplete,
    trackTutorialSkip,
    trackTutorialComplete,
    trackSignupStepView,
    trackSignupStepComplete,
    trackSignupComplete,
    trackAppDownload,
  }
}

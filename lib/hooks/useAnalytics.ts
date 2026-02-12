'use client'

import { useCallback } from 'react'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'
import { getDeviceType } from '@/lib/utils/device-detection'

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

  // Landing page tracking

  const trackLandingPageView = useCallback(
    (utmData: Record<string, unknown>) => {
      track('landing_page_view', {
        page: 'home',
        device_type: getDeviceType(),
        viewport_width: typeof window !== 'undefined' ? window.innerWidth : 0,
        viewport_height: typeof window !== 'undefined' ? window.innerHeight : 0,
        ...utmData,
      })
    },
    [track]
  )

  const trackLandingCTAClick = useCallback(
    (ctaType: string, ctaText: string, ctaLocation: string, scrollDepth: number, timeOnPage: number) => {
      track('landing_cta_click', {
        cta_type: ctaType,
        cta_text: ctaText,
        cta_location: ctaLocation,
        device_type: getDeviceType(),
        scroll_depth: scrollDepth,
        time_on_page: timeOnPage,
      })
    },
    [track]
  )

  const trackScrollDepth = useCallback(
    (depth: number, sectionReached: string, timeToDepth: number) => {
      track('scroll_depth_milestone', {
        depth,
        section_reached: sectionReached,
        time_to_depth: timeToDepth,
      })
    },
    [track]
  )

  const trackSectionView = useCallback(
    (section: string, timeOnPage: number) => {
      track('section_view', {
        section,
        time_on_page: timeOnPage,
        device_type: getDeviceType(),
      })
    },
    [track]
  )

  const trackFAQInteraction = useCallback(
    (question: string, action: 'expand' | 'collapse') => {
      track('faq_interaction', {
        question,
        action,
        time_on_page: typeof window !== 'undefined' ? Math.round((Date.now() - performance.timeOrigin) / 1000) : 0,
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
    trackLandingPageView,
    trackLandingCTAClick,
    trackScrollDepth,
    trackSectionView,
    trackFAQInteraction,
  }
}

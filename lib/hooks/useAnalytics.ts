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

  // ─── Tutorial phase-level tracking ──────────────────────────────────

  const trackTutorialPhaseStart = useCallback(
    (phaseId: string, phaseIndex: number, totalPhases: number) => {
      track('tutorial_phase_start', {
        phase_id: phaseId,
        phase_index: phaseIndex,
        total_phases: totalPhases,
      })
    },
    [track]
  )

  const trackTutorialPhaseComplete = useCallback(
    (phaseId: string, phaseIndex: number, timeInPhaseMs: number) => {
      track('tutorial_phase_complete', {
        phase_id: phaseId,
        phase_index: phaseIndex,
        time_in_phase_ms: timeInPhaseMs,
      })
    },
    [track]
  )

  const trackTutorialPhaseSkip = useCallback(
    (phaseId: string, phaseIndex: number, timeInPhaseMs: number) => {
      track('tutorial_phase_skip', {
        phase_id: phaseId,
        phase_index: phaseIndex,
        time_in_phase_ms: timeInPhaseMs,
      })
    },
    [track]
  )

  const trackTutorialPhaseBack = useCallback(
    (phaseId: string, phaseIndex: number, fromPhase: string) => {
      track('tutorial_phase_back', {
        phase_id: phaseId,
        phase_index: phaseIndex,
        from_phase: fromPhase,
      })
    },
    [track]
  )

  const trackTutorialAbandon = useCallback(
    (phaseId: string, phaseIndex: number, timeInPhaseMs: number, totalTimeMs: number) => {
      track('tutorial_abandon', {
        phase_id: phaseId,
        phase_index: phaseIndex,
        time_in_phase_ms: timeInPhaseMs,
        total_time_ms: totalTimeMs,
      })
    },
    [track]
  )

  // ─── Tutorial field interactions ────────────────────────────────────

  const trackTutorialFieldInteraction = useCallback(
    (phaseId: string, fieldName: string, action: string, timeFocusedMs?: number) => {
      track('tutorial_field_interaction', {
        phase_id: phaseId,
        field_name: fieldName,
        action,
        ...(timeFocusedMs !== undefined && { time_focused_ms: timeFocusedMs }),
      })
    },
    [track]
  )

  const trackTutorialDragAttempt = useCallback(
    (phaseId: string, success: boolean, attempts: number) => {
      track('tutorial_drag_attempt', {
        phase_id: phaseId,
        success,
        attempts,
      })
    },
    [track]
  )

  const trackTutorialSwipeAttempt = useCallback(
    (phaseId: string, success: boolean, attempts: number) => {
      track('tutorial_swipe_attempt', {
        phase_id: phaseId,
        success,
        attempts,
      })
    },
    [track]
  )

  // ─── Signup error & field tracking ──────────────────────────────────

  const trackSignupFieldError = useCallback(
    (step: string, fieldName: string, errorType: string) => {
      track('signup_field_error', {
        step,
        field_name: fieldName,
        error_type: errorType,
      })
    },
    [track]
  )

  const trackSignupAuthAttempt = useCallback(
    (method: string, status: string, errorMsg?: string) => {
      track('signup_auth_attempt', {
        method,
        status,
        ...(errorMsg !== undefined && { error_msg: errorMsg }),
      })
    },
    [track]
  )

  const trackSignupFieldTime = useCallback(
    (step: string, fieldName: string, timeMs: number) => {
      track('signup_field_time', {
        step,
        field_name: fieldName,
        time_ms: timeMs,
      })
    },
    [track]
  )

  const trackSignupStepAbandon = useCallback(
    (step: string, fieldsFilled: number, timeOnStepMs: number) => {
      track('signup_step_abandon', {
        step,
        fields_filled: fieldsFilled,
        time_on_step_ms: timeOnStepMs,
      })
    },
    [track]
  )

  // ─── Crew invite tracking ──────────────────────────────────────────

  const trackCrewInviteOpened = useCallback(
    (companyId: string) => {
      track('crew_invite_opened', {
        company_id: companyId,
      })
    },
    [track]
  )

  const trackCrewInviteSent = useCallback(
    (companyId: string, inviteCount: number, methods: string[]) => {
      track('crew_invite_sent', {
        company_id: companyId,
        invite_count: inviteCount,
        methods,
      })
    },
    [track]
  )

  const trackCrewInviteSkipped = useCallback(
    (companyId: string) => {
      track('crew_invite_skipped', {
        company_id: companyId,
      })
    },
    [track]
  )

  // ─── Landing page deeper engagement ────────────────────────────────

  const trackLandingTestimonialView = useCallback(
    (testimonialIndex: number, timeVisibleMs: number) => {
      track('landing_testimonial_view', {
        testimonial_index: testimonialIndex,
        time_visible_ms: timeVisibleMs,
      })
    },
    [track]
  )

  const trackLandingPricingPlanClick = useCallback(
    (planName: string) => {
      track('landing_pricing_plan_click', {
        plan_name: planName,
      })
    },
    [track]
  )

  const trackLandingPageExit = useCallback(
    (scrollDepth: number, timeOnPageMs: number, lastSectionViewed: string) => {
      track('landing_page_exit', {
        scroll_depth: scrollDepth,
        time_on_page_ms: timeOnPageMs,
        last_section_viewed: lastSectionViewed,
      })
    },
    [track]
  )

  // ─── Deep link diagnostics ─────────────────────────────────────────

  const trackDeepLinkAttempt = useCallback(
    (method: string, userId: string, companyId: string) => {
      track('deep_link_attempt', {
        method,
        user_id: userId,
        company_id: companyId,
      })
    },
    [track]
  )

  const trackDeepLinkFallback = useCallback(
    (userId: string, companyId: string, waitTimeMs: number) => {
      track('deep_link_fallback', {
        user_id: userId,
        company_id: companyId,
        wait_time_ms: waitTimeMs,
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
    // Tutorial phase-level
    trackTutorialPhaseStart,
    trackTutorialPhaseComplete,
    trackTutorialPhaseSkip,
    trackTutorialPhaseBack,
    trackTutorialAbandon,
    // Tutorial field interactions
    trackTutorialFieldInteraction,
    trackTutorialDragAttempt,
    trackTutorialSwipeAttempt,
    // Signup error & field
    trackSignupFieldError,
    trackSignupAuthAttempt,
    trackSignupFieldTime,
    trackSignupStepAbandon,
    // Crew invite
    trackCrewInviteOpened,
    trackCrewInviteSent,
    trackCrewInviteSkipped,
    // Landing page deeper engagement
    trackLandingTestimonialView,
    trackLandingPricingPlanClick,
    trackLandingPageExit,
    // Deep link diagnostics
    trackDeepLinkAttempt,
    trackDeepLinkFallback,
  }
}

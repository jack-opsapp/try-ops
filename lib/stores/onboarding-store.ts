import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Variant = 'a' | 'b'

export interface OnboardingState {
  // A/B variant
  variant: Variant | null
  setVariant: (v: Variant) => void

  // Tutorial
  tutorialStartTime: number | null
  highestTutorialStep: number
  tutorialCompleted: boolean
  setTutorialStartTime: (t: number) => void
  setHighestTutorialStep: (s: number) => void
  setTutorialCompleted: () => void

  // Auth
  userId: string | null
  companyId: string | null
  authMethod: string | null
  email: string
  setAuth: (userId: string, authMethod: string, email?: string) => void
  setCompanyId: (id: string) => void

  // User profile
  firstName: string
  lastName: string
  phone: string
  avatarUrl: string | null
  setProfile: (data: { firstName: string; lastName: string; phone: string; avatarUrl?: string | null }) => void

  // Company
  companyName: string
  companyEmail: string
  companyPhone: string
  companyLogoUrl: string | null
  industry: string
  companySize: string
  companyAge: string
  companyCode: string | null
  setCompanyBasic: (data: { name: string; email: string; phone: string; logoUrl?: string | null }) => void
  setCompanyDetails: (data: { industry: string; size: string; age: string }) => void
  setCompanyCode: (code: string) => void

  // UTM tracking
  utmParams: {
    source: string | null
    medium: string | null
    campaign: string | null
    content: string | null
    term: string | null
    referrer: string | null
    landingPage: string | null
  } | null
  setUTMData: (data: {
    source: string | null
    medium: string | null
    campaign: string | null
    content: string | null
    term: string | null
    referrer: string | null
    landingPage: string | null
  }) => void

  // Signup progress
  signupStep: number
  setSignupStep: (s: number) => void
  signupCompleted: boolean
  setSignupCompleted: () => void

  // Reset
  reset: () => void
}

const initialState = {
  variant: null as Variant | null,
  tutorialStartTime: null as number | null,
  highestTutorialStep: 0,
  tutorialCompleted: false,
  userId: null as string | null,
  companyId: null as string | null,
  authMethod: null as string | null,
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  avatarUrl: null as string | null,
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  companyLogoUrl: null as string | null,
  industry: '',
  companySize: '',
  companyAge: '',
  companyCode: null as string | null,
  utmParams: null as OnboardingState['utmParams'],
  signupStep: 0,
  signupCompleted: false,
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,

      setVariant: (v) => set({ variant: v }),

      setTutorialStartTime: (t) => set({ tutorialStartTime: t }),
      setHighestTutorialStep: (s) =>
        set((state) => ({
          highestTutorialStep: Math.max(state.highestTutorialStep, s),
        })),
      setTutorialCompleted: () => set({ tutorialCompleted: true }),

      setAuth: (userId, authMethod, email) => set({ userId, authMethod, email: email || '' }),
      setCompanyId: (id) => set({ companyId: id }),

      setProfile: (data) =>
        set({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          avatarUrl: data.avatarUrl ?? null,
        }),

      setCompanyBasic: (data) =>
        set({
          companyName: data.name,
          companyEmail: data.email,
          companyPhone: data.phone,
          companyLogoUrl: data.logoUrl ?? null,
        }),

      setCompanyDetails: (data) =>
        set({
          industry: data.industry,
          companySize: data.size,
          companyAge: data.age,
        }),

      setCompanyCode: (code) => set({ companyCode: code }),

      setUTMData: (data) => set({ utmParams: data }),

      setSignupStep: (s) => set({ signupStep: s }),
      setSignupCompleted: () => set({ signupCompleted: true }),

      reset: () => set(initialState),
    }),
    {
      name: 'ops-onboarding',
    }
  )
)

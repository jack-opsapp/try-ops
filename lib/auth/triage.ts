import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

export interface SyncUserResponse {
  id: string
  firstName: string
  lastName: string
  email: string
  companyId: string | null
  hasCompletedOnboarding: boolean
}

export interface CompanyResponse {
  id: string
  name: string
  industries: string[] | null
  company_size: string | null
  company_age: string | null
}

interface TriageStores {
  signupStore: {
    reset: () => void
    setAuth: (data: {
      firebaseUid: string
      userId: string
      email: string
      authMethod: 'google' | 'apple' | 'email'
      isNewUser: boolean
    }) => void
    setProfile: (data: { firstName: string; lastName: string; phone: string; companyName: string }) => void
    setCompanyId: (id: string) => void
    setDetails: (data: { industries: string[]; companySize: string; companyAge: string }) => void
  }
  onboardingStore: {
    setAuth: (userId: string, authMethod: string, email?: string) => void
    setCompanyId: (id: string) => void
    setProfile: (data: { firstName: string; lastName: string; phone: string }) => void
    setCompanyBasic: (data: { name: string; email: string; phone: string }) => void
    setCompanyDetails: (data: { industry: string; size: string; age: string }) => void
  }
}

export type TriageDecision =
  | 'new'
  | 'dashboard'
  | 'resume_profile'
  | 'resume_account_type'
  | 'resume_company_details'
  | 'download'

/**
 * Determines where to route a user after authentication based on their
 * current state in Supabase. Prefills stores with known data for returning users.
 *
 * Returns the decision string for analytics tracking — the actual routing
 * is performed inside this function.
 */
export function triageUser(
  data: {
    user: SyncUserResponse
    company: CompanyResponse | null
    isNewUser: boolean
  },
  firebaseUid: string,
  authMethod: 'google' | 'apple' | 'email',
  stores: TriageStores,
  router: AppRouterInstance
): TriageDecision {
  const { user, company, isNewUser } = data
  const { signupStore, onboardingStore } = stores

  // ── Brand new user ──
  if (isNewUser) {
    router.push('/signup/account-type')
    return 'new'
  }

  // ── Existing user: reset stale store data, then prefill ──
  signupStore.reset()
  signupStore.setAuth({
    firebaseUid,
    userId: user.id,
    email: user.email,
    authMethod,
    isNewUser: false,
  })
  onboardingStore.setAuth(user.id, authMethod, user.email)

  if (user.firstName) {
    signupStore.setProfile({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: '',
      companyName: company?.name || '',
    })
    onboardingStore.setProfile({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: '',
    })
    if (company?.name) {
      onboardingStore.setCompanyBasic({ name: company.name, email: '', phone: '' })
    }
  }

  if (company) {
    signupStore.setCompanyId(company.id)
    onboardingStore.setCompanyId(company.id)
    signupStore.setDetails({
      industries: company.industries || [],
      companySize: company.company_size || '',
      companyAge: company.company_age || '',
    })
    onboardingStore.setCompanyDetails({
      industry: (company.industries || []).join(', '),
      size: company.company_size || '',
      age: company.company_age || '',
    })
  }

  // ── Fully set up user → web dashboard ──
  if (company && user.hasCompletedOnboarding) {
    window.location.href = 'https://app.opsapp.co/dashboard'
    return 'dashboard'
  }

  // ── Completed onboarding but no company (edge case) ──
  if (user.hasCompletedOnboarding && !company) {
    router.push('/signup/account-type')
    return 'resume_account_type'
  }

  // ── Abandoned mid-signup → first incomplete step ──
  if (!user.firstName || !user.lastName) {
    router.push('/signup/profile')
    return 'resume_profile'
  }

  if (!user.companyId) {
    router.push('/signup/account-type')
    return 'resume_account_type'
  }

  if (!company?.industries?.length && !company?.company_size) {
    router.push('/signup/company-details')
    return 'resume_company_details'
  }

  // ── Everything filled but hasCompletedOnboarding = false → download ──
  router.push('/download')
  return 'download'
}

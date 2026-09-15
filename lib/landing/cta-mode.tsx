'use client'

import { createContext, useContext, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { trackABClick } from '@/lib/ab/track-click'
import { getTutorialRoute } from '@/lib/utils/tutorial-routes'

/**
 * Where a landing page's call to action goes.
 *
 * `app-store` is the organic path this site has always used: download the app,
 * or take the tutorial. `web-signup` is the paid path — one CTA, straight to
 * the web signup, no second choice anywhere on the page.
 *
 * This is a context rather than a prop on every section because the section
 * prop schemas are what the A/B routine generates. Threading a CTA mode
 * through them would put a deployment concern into content the model writes.
 */
export type CtaMode = 'app-store' | 'web-signup'

export const APP_STORE_URL =
  'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078'

/**
 * A full navigation, deliberately — not a client-side push. The first-touch
 * cookie is written on `.opsapp.co`, and it only travels to app.opsapp.co if
 * the browser actually makes the request.
 */
export const WEB_SIGNUP_URL = 'https://app.opsapp.co/register'

const CtaModeContext = createContext<CtaMode>('app-store')

export function CtaModeProvider({
  mode,
  children,
}: {
  mode: CtaMode
  children: React.ReactNode
}) {
  return <CtaModeContext.Provider value={mode}>{children}</CtaModeContext.Provider>
}

export function useCtaMode(): CtaMode {
  return useContext(CtaModeContext)
}

export interface CtaHandlers {
  mode: CtaMode
  /** The one action the page is asking for. */
  primary: () => void
  /**
   * The alternative — the tutorial on organic pages. Null in `web-signup`
   * mode: a paid page asks for one thing, and every button on it does that
   * thing. Callers must not render a second button when this is null.
   */
  secondary: (() => void) | null
}

/**
 * The CTA handlers for one section, already wired to the current mode and
 * already reporting clicks under that section's name.
 */
export function useCtaHandlers(section: string): CtaHandlers {
  const mode = useCtaMode()
  const router = useRouter()

  const primary = useCallback(() => {
    try { trackABClick(section, mode === 'web-signup' ? 'signup_btn' : 'download_btn') } catch { /* Optional diagnostics must not block navigation. */ }
    if (mode === 'web-signup') {
      window.location.href = WEB_SIGNUP_URL
      return
    }
    // An optional page section must never be a prerequisite for navigation.
    window.location.href = APP_STORE_URL
  }, [mode, section])

  const secondary = useCallback(() => {
    try { trackABClick(section, 'try_btn') } catch { /* Optional diagnostics. */ }
    router.push(getTutorialRoute('a'))
  }, [router, section])

  return { mode, primary, secondary: mode === 'web-signup' ? null : secondary }
}

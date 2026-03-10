# try-ops Signup Overhaul — Design Spec

**Date:** 2026-03-10
**Status:** Approved (rev 2 — post-review fixes)
**Scope:** Complete overhaul of try-ops signup/credentials pages for desktop + mobile, migrating from Bubble.io auth to Firebase auth, consolidating flow from 6 steps to 3, and aligning all visual tokens with the OPS design system.

---

## 1. Problem Statement

The current try-ops signup flow has critical issues:

- **No desktop layout** — forms stretch full-width on desktop (1840px+ fields on a 1920px monitor)
- **6 separate pages** — too many steps for a trial signup (credentials → profile → company setup → company details → company code → ready)
- **Bubble.io auth** — deprecated backend; ops-web already uses Firebase + Supabase
- **Design system violations** — wrong text colors (#FFFFFF vs #E5E5E5), wrong background (#080808 vs system tokens), wrong border radius (3px everywhere), accent color overuse, no [bracket captions], inconsistent components
- **No Apple sign-in** — ops-web has it, try-ops doesn't
- **Unnecessary steps** — crew code and "ready" screens add friction without value during trial signup

## 2. New Flow

### 2.1 Screen Sequence

```
Landing Page / Tutorial
    ↓ (CTA or signup element)
[1] Credentials (auth)
    ↓
[2] About You (identity + company name)
    ↓
[3] Details (industry/size/age — skippable)
    ↓
Tutorial / Download (redirect back)
```

### 2.2 Removed Pages

| Page | Reason |
|------|--------|
| Company Setup (`/signup/company-setup`) | Merged into "About You" |
| Company Code (`/signup/company-code`) | Moved to in-app settings |
| Ready (`/signup/ready`) | Unnecessary — user goes straight to tutorial |

### 2.3 Auth Migration

| Before | After |
|--------|-------|
| Bubble.io `/api/auth/signup` | Firebase `createUserWithEmailAndPassword` + Supabase `syncUser` |
| Bubble.io `/api/auth/login` | Firebase `signInWithEmailAndPassword` + Supabase `syncUser` |
| Google Identity Services (GIS script) | Firebase `signInWithPopup` (GoogleAuthProvider) |
| No Apple sign-in | Firebase `signInWithPopup` (OAuthProvider "apple.com") |
| Custom `/api/auth/google` route | Direct Firebase SDK (no custom route needed) |

### 2.4 User Sync (Firebase → Supabase)

After Firebase auth succeeds, the user must be persisted to Supabase. try-ops needs its own `/api/auth/sync-user` route, ported from ops-web's `app/api/auth/sync-user/route.ts`. This route:

1. Receives the Firebase ID token
2. Verifies it with Firebase Admin SDK
3. Upserts the user row in Supabase `users` table
4. Creates/links company if applicable
5. Returns `{ user, company }` for the client store

The try-ops route should share the same Supabase project as ops-web (project ID: `ijeekuhbatykdomumfjx`). The Firebase Admin SDK service account credentials must be added to try-ops environment variables.

### 2.5 Dropped Fields

The current `company-setup` page collects Office Email and Office Phone. These are **intentionally dropped** from the new flow to reduce friction. The company record in Supabase will have these fields nullable. Users can add them later in app settings.

### 2.6 Firebase Auth: Popup + Redirect Fallback

The Firebase auth module must include the **popup-to-redirect fallback** pattern from ops-web. This is critical because popup auth fails silently on some browsers (COOP headers, popup blockers, Safari). The pattern:

1. Try `signInWithPopup` first
2. On `auth/popup-blocked` or `auth/network-request-failed` → set `sessionStorage` flag (`ops-auth-redirect-pending`) → call `signInWithRedirect`
3. On page reload → check flag → call `getRedirectResult` to complete the flow
4. `checkRedirectResult()` must be called in the auth layout on mount

This is implemented in ops-web's `src/lib/firebase/auth.ts` (lines 29-119) and must be ported in full, not simplified.

## 3. Desktop Layout

### 3.1 Split Hero (lg breakpoint, 1024px+)

Adapted from ops-web `(auth)/layout.tsx`:

```
┌──────────────────────────────────────────────────────┐
│                    │                                  │
│   HERO IMAGE       │     Centered Form Area           │
│   (50% width)      │     max-w-[420px]                │
│                    │                                  │
│   Gradient overlay │     [auth form content]          │
│   fades to black   │                                  │
│   on right edge    │                                  │
│                    │                                  │
│   ┌─────────┐     │                                  │
│   │ OPS     │     │                                  │
│   │ tagline │     │                                  │
│   └─────────┘     │                                  │
│   bottom-left      │                                  │
└──────────────────────────────────────────────────────┘
```

- Hero image: `/public/images/auth-hero.jpg` (reuse from ops-web or provide new)
- Gradient: `linear-gradient(to right, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.95) 90%, #000 100%)`
- Bottom gradient for text: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 40%, transparent 60%)`
- Brand mark: Bebas Neue 40px, tracking 0.2em, bottom-left

### 3.2 Mobile (<1024px)

- Hero hidden (`hidden lg:block`)
- Form full-width with padding (`p-6`)
- OPS logo image shown above form (`lg:hidden`)

### 3.3 Setup Pages (Post-Auth)

For steps 2-3 (About You, Details):

```
┌──────────────────────────────────────────────────────┐
│              Centered, max-w-[600px]                 │
│                                                      │
│   OPS (logo/wordmark)                                │
│   ━━━━━━━━━━━━ ─────────── (progress bar)           │
│   STEP 1 OF 2              Skip for now              │
│                                                      │
│   About You                                          │
│   [the name behind the operation]                    │
│                                                      │
│   ┌─ First Name ─┐  ┌─ Last Name ──┐               │
│   │              │  │              │               │
│   └──────────────┘  └──────────────┘               │
│   ┌─ Company Name ─────────────────┐               │
│   │                                │               │
│   └────────────────────────────────┘               │
│   ┌─ Phone (Optional) ────────────┐               │
│   │                                │               │
│   └────────────────────────────────┘               │
│                                                      │
│   ─────────────────────────────────                  │
│   ← Back                    Next →                   │
└──────────────────────────────────────────────────────┘
```

- Centered layout with `max-w-[600px] mx-auto`
- Progress bar: 2 segments (filled = white 40% opacity, unfilled = background-elevated)
- Step indicator + skip button in flex row
- Back/Next navigation at bottom with border-top separator
- Follows ops-web `SetupPage` patterns exactly

## 4. Screen Specifications

### 4.1 Credentials Page (`/signup/credentials`)

**Layout:** Split hero (desktop) / form-only (mobile)

**Content:**
- Title: "CREATE ACCOUNT" (Mohave, 32px/display, weight 600, UPPERCASE, tracking wide) — login mode: "SIGN IN"
- Note: Bebas Neue is reserved for the OPS brand mark only (per design system: "No third display font in standard UI"). Form titles use Mohave display size.
- Subtitle: "Start your 30-day free trial. No card required." (Mohave, body-sm, text-tertiary)
- OAuth buttons (Google + Apple): full-width, border `rgba(255,255,255,0.12)`, bg `rgba(255,255,255,0.03)`, rounded-lg, Mohave body text
- Divider: "or" (Kosugi, 11px, uppercase, tracking-widest)
- Email: expandable — collapsed shows "Sign up with Email" button; expanded shows name/email/password fields + submit
- Footer: "Already have an account? Sign in" / "Don't have an account? Sign up" toggle

**Auth Flow:**
1. OAuth click → Firebase popup → get ID token → `UserService.syncUser()` → redirect to `/signup/profile` (new users) or tutorial/download (existing)
2. Email submit → Firebase `signUpWithEmail` / `signInWithEmail` → update display name → sync → redirect

**Login Mode:**
- Toggle between signup/login via footer link
- Login: no name field, different title/subtitle
- Login success: redirect to tutorial or download (not setup)

### 4.2 About You Page (`/signup/profile`)

**Layout:** Centered `max-w-[600px]` with progress bar

**Fields:**
- First Name + Last Name (side-by-side grid on all sizes)
- Company Name (full-width)
- Phone (full-width, optional, helper text: "[recovery only. we don't call.]")

**Behavior:**
- Pre-populate name from Firebase `displayName` (OAuth users)
- "Next" saves progress via API, advances to step 2
- "Skip for now" saves partial and redirects to tutorial
- "Back" returns to credentials

**Validation:**
- First name required
- Last name required
- Company name required
- Phone optional

### 4.3 Details Page (`/signup/company-details`)

**Layout:** Centered `max-w-[600px]` with progress bar (step 2 of 2)

**Fields:**
- Industry: searchable dropdown (port `IndustryDropdown` from ops-web)
- Team Size: selector buttons ("1", "2-3", "4-5", "6-10", "10-20", "20+")
- Years in Business: selector buttons ("<1", "1-2", "2-5", "5-10", "10+")

**Behavior:**
- "Next" / "Launch" saves all data, marks onboarding complete, redirects to tutorial
- "Skip for now" skips details, marks onboarding complete, redirects to tutorial
- All fields optional on this screen
- "Back" returns to About You

### 4.4 Post-Signup Redirect

After completing or skipping step 3:
- If user came from tutorial → return to tutorial (preserve state)
- If user came from landing page CTA → redirect to tutorial start
- If user came from download page → redirect to download

Use `searchParams` or `sessionStorage` to track origin.

## 5. Component Architecture

### 5.1 Port from ops-web

| Component | ops-web Path | Purpose |
|-----------|-------------|---------|
| Firebase config | `src/lib/firebase/config.ts` | Firebase app initialization |
| Firebase auth | `src/lib/firebase/auth.ts` | signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail |
| Auth layout | `src/app/(auth)/layout.tsx` | Split hero layout pattern |
| Input | `src/components/ui/input.tsx` | Styled input with label, prefix/suffix icons, helper text |
| Button | `src/components/ui/button.tsx` | Primary/secondary/ghost variants with loading state |
| SelectorButton | `src/components/setup/SetupIdentityStep.tsx` | Pill-style selector for size/age |
| IndustryDropdown | `src/components/setup/SetupIdentityStep.tsx` | Searchable multi-select dropdown |
| UserService.syncUser | `src/lib/api/services/user-service.ts` | Sync Firebase user to Supabase |

### 5.2 Build New

| Component | Purpose |
|-----------|---------|
| `app/signup/layout.tsx` | Auth layout wrapper for signup pages (split hero) |
| `app/signup/credentials/page.tsx` | Rewritten credentials page with Firebase |
| `app/signup/profile/page.tsx` | Consolidated "About You" (name + company) |
| `app/signup/company-details/page.tsx` | Rewritten details with ops-web components |
| `lib/firebase/config.ts` | Firebase config for try-ops |
| `lib/firebase/auth.ts` | Auth helpers (port from ops-web) |
| `stores/signup-store.ts` | Zustand store for signup-specific state (auth, profile, company fields) |
| `app/api/auth/sync-user/route.ts` | Sync Firebase user to Supabase (port from ops-web) |

**Important: `onboarding-store` is NOT replaced.** The existing `onboarding-store` holds tutorial state, UTM params, A/B variant, and analytics context used across the entire app. `signup-store` is a **new, separate store** for signup-specific fields only (auth state, profile data, company data). The `useAnalytics` hook continues to read `variant` from `onboarding-store`.

### 5.3 Delete

| File/Dir | Reason |
|----------|--------|
| `app/api/auth/signup/route.ts` | Bubble.io auth — replaced by Firebase |
| `app/api/auth/login/route.ts` | Bubble.io auth — replaced by Firebase |
| `app/api/auth/google/route.ts` | Bubble.io Google auth — replaced by Firebase |
| `app/api/auth/apple/route.ts` | Bubble.io Apple auth — replaced by Firebase |
| `app/signup/company-setup/` | Merged into profile |
| `app/signup/company-code/` | Moved to in-app settings |
| `app/signup/ready/` | Removed — redirect to tutorial |
| `components/ui/OPSButton.tsx` | Replaced by ops-web Button |
| `components/ui/OPSInput.tsx` | Replaced by ops-web Input |
| `components/signup/IndustryPicker.tsx` | Replaced by ops-web IndustryDropdown |
| `components/signup/PillSelector.tsx` | Replaced by ops-web SelectorButton |

## 6. Tailwind Token Corrections

### 6.1 Colors (align with ops-web + design system)

**Transition strategy:** Add the new semantic token names alongside the existing `ops.*` tokens. The `ops.*` aliases remain (with corrected values) so that existing landing page, tutorial, and shared components don't break. New signup pages use the semantic names. A follow-up pass can migrate remaining pages and remove the `ops.*` aliases.

```diff
colors: {
  // NEW: semantic names matching ops-web
+ background: {
+   DEFAULT: '#000000',
+   panel: '#0A0A0A',
+   card: '#191919',
+   elevated: '#1A1A1A',
+   input: '#111111',
+   status: '#1D1D1D',
+ },
+ text: {
+   primary: '#E5E5E5',
+   secondary: '#A7A7A7',
+   tertiary: '#777777',
+   disabled: '#555555',
+   placeholder: '#999999',
+ },
+ border: {
+   DEFAULT: 'rgba(255, 255, 255, 0.2)',
+   subtle: 'rgba(255, 255, 255, 0.05)',
+   separator: 'rgba(255, 255, 255, 0.15)',
+ },
  // EXISTING: keep ops.* aliases with CORRECTED values
  ops: {
-   background: '#080808',
+   background: '#000000',
-   'text-primary': '#FFFFFF',
+   'text-primary': '#E5E5E5',
-   'text-secondary': '#999999',
+   'text-secondary': '#A7A7A7',
    // ... other ops.* tokens updated to correct values
  },
}
```

### 6.2 Border Radius

```diff
borderRadius: {
- 'ops': '3px',
- 'ops-card': '3px',
- 'ops-lg': '4px',
- 'ops-sm': '2px',
+ sm: '2.5px',
+ DEFAULT: '5px',
+ md: '5px',
+ lg: '8px',
+ xl: '12px',
}
```

### 6.3 Typography

Add Bebas Neue for OPS brand mark only (per design system restrictions):

```diff
fontFamily: {
  mohave: ['Mohave', 'sans-serif'],
  kosugi: ['Kosugi', 'sans-serif'],
+ bebas: ['Bebas Neue', 'sans-serif'],
}
```

Bebas Neue is used ONLY for the "OPS" brand mark in the hero panel. All form titles, section headers, and UI text use Mohave (UPPERCASE). This matches the design system rule: "No third display font (Bebas Neue) in standard UI."

## 7. Environment Variables

### Required Firebase Config (`.env.local`)

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Use same Firebase project as ops-web. Add `try-ops` domain to Firebase authorized domains.

## 8. Analytics

### 8.1 Preserve (update step names/indices for new flow)

- `trackSignupStepView(step, index)` — step names change: 'credentials'=1, 'profile'=2, 'details'=3
- `trackSignupStepComplete(step, index)`
- `trackSignupAuthAttempt(method, status, error?)` — method adds 'apple'
- `trackSignupFieldError(step, field, error)`
- `trackSignupComplete(authMethod)`
- `trackSignupStepAbandon(step)` — preserve for funnel analysis

### 8.2 Add to `useAnalytics` hook

- `trackSetupStepSkipped(step)` — when user clicks "Skip for now" (new function in try-ops's `useAnalytics`, NOT the ops-web analytics module)

### 8.3 Remove (pages deleted)

- `trackCrewInviteOpened` — company-code page removed
- `trackCrewInviteSent` — company-code page removed
- `trackCrewInviteSkipped` — company-code page removed

### 8.4 A/B Variant

The `useAnalytics` hook reads `variant` from `onboarding-store` (NOT `signup-store`). This continues to work unchanged since `onboarding-store` is preserved.

## 9. Design System Compliance Checklist

- [ ] All text uses `#E5E5E5` primary (not `#FFFFFF`)
- [ ] Background is `#000000` (not `#080808`)
- [ ] Border radius follows system (5px default, 8px lg, 12px xl)
- [ ] Border opacity: `subtle=0.05`, `separator=0.15`, `DEFAULT=0.2`. Note: design system says 0.08/0.12 but ops-web uses 0.05/0.15/0.2 — we align with ops-web for cross-platform consistency
- [ ] Accent color (`#597794`) on ONE element per screen maximum. Note: ops-web uses `#417394` via CSS var — the design system doc (`system.md`, updated 2026-02-17) is the canonical source at `#597794`. ops-web should be updated separately to match.
- [ ] Fonts: Mohave for titles/body/labels, Kosugi for captions/narrative, Bebas Neue for OPS brand mark ONLY
- [ ] All titles UPPERCASE
- [ ] All captions in `[square brackets]`
- [ ] 8dp grid spacing
- [ ] 56dp / 44px minimum touch targets
- [ ] No shadows — borders only
- [ ] No emoji icons
- [ ] Reduced motion respected

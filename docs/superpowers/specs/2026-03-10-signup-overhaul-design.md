# try-ops Signup Overhaul — Design Spec

**Date:** 2026-03-10
**Status:** Approved
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
- Title: "CREATE ACCOUNT" (Bebas Neue, 36px, tracking 0.1em) — login mode: "SIGN IN"
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
| `stores/signup-store.ts` | Zustand store for signup state (replace onboarding-store) |

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

```diff
colors: {
  ops: {
-   background: '#080808',
+   // Remove ops prefix — use semantic names matching ops-web
  },
+ background: {
+   DEFAULT: '#000000',
+   panel: '#0A0A0A',
+   card: '#191919',
+   elevated: '#1A1A1A',
+   input: '#111111',
+   status: '#1D1D1D',
+ },
+ text: {
+   primary: '#E5E5E5',      // was #FFFFFF
+   secondary: '#A7A7A7',    // was #999999
+   tertiary: '#777777',     // correct
+   disabled: '#555555',     // was #444444
+   placeholder: '#999999',
+ },
+ border: {
+   DEFAULT: 'rgba(255, 255, 255, 0.2)',
+   subtle: 'rgba(255, 255, 255, 0.05)',
+   separator: 'rgba(255, 255, 255, 0.15)',
+ },
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

Add Bebas Neue for display titles (matches ops-web):

```diff
fontFamily: {
  mohave: ['Mohave', 'sans-serif'],
  kosugi: ['Kosugi', 'sans-serif'],
+ bebas: ['Bebas Neue', 'sans-serif'],
}
```

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

Preserve existing analytics tracking from current implementation:
- `trackSignupStepView(step, index)`
- `trackSignupStepComplete(step, index)`
- `trackSignupAuthAttempt(method, status, error?)`
- `trackSignupFieldError(step, field, error)`
- `trackSignupComplete(authMethod)`

Add new events:
- `trackSetupStepSkipped(step)` — when user clicks "Skip for now"

## 9. Design System Compliance Checklist

- [ ] All text uses `#E5E5E5` primary (not `#FFFFFF`)
- [ ] Background is `#000000` (not `#080808`)
- [ ] Border radius follows system (5px default, 8px lg)
- [ ] Accent color (`#597794`) on ONE element per screen maximum
- [ ] Fonts: Bebas Neue for display titles, Mohave for body/labels, Kosugi for captions/narrative
- [ ] All titles UPPERCASE
- [ ] All captions in `[square brackets]`
- [ ] 8dp grid spacing
- [ ] 56dp / 44px minimum touch targets
- [ ] No shadows — borders only
- [ ] No emoji icons
- [ ] Reduced motion respected

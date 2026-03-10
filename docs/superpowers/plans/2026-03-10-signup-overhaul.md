# try-ops Signup Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the try-ops signup flow from 6 Bubble.io-auth pages to 3 Firebase-auth pages with desktop-optimized split-hero layout, aligned to the OPS design system.

**Architecture:** Port Firebase auth, UI components, and server-side sync from ops-web. Replace OnboardingScaffold with a split-hero auth layout for credentials and a centered setup layout for post-auth steps. Add new signup-store alongside preserved onboarding-store.

**Tech Stack:** Next.js 14 (App Router), Firebase Auth (popup + redirect fallback), Supabase (service role sync), Zustand, Tailwind CSS, CVA, Lucide React

---

## File Map

### Create New

| File | Responsibility |
|------|---------------|
| `lib/utils/cn.ts` | `clsx` + `tailwind-merge` utility |
| `lib/firebase/config.ts` | Firebase app + auth lazy initialization |
| `lib/firebase/auth.ts` | Auth helpers: Google, Apple, Email signup/login, redirect fallback |
| `lib/firebase/admin-verify.ts` | Server-side JWT verification via jose JWKS |
| `lib/supabase/server-client.ts` | Service-role Supabase client for API routes |
| `components/ui/Button.tsx` | CVA button with variants + loading state |
| `components/ui/Input.tsx` | Styled input with label, icons, error/helper text |
| `components/ui/SelectorButton.tsx` | Pill-style selector for size/age/etc |
| `components/ui/IndustryDropdown.tsx` | Searchable multi-select industry dropdown |
| `lib/stores/signup-store.ts` | Zustand store for signup-specific state |
| `app/signup/layout.tsx` | Split-hero auth layout (credentials) + centered setup layout (post-auth) |
| `app/api/auth/sync-user/route.ts` | Firebase → Supabase user sync |

### Rewrite (in-place)

| File | Changes |
|------|---------|
| `tailwind.config.ts` | Add semantic tokens, correct ops.* values, add border-radius scale, add bebas font |
| `app/signup/credentials/page.tsx` | Firebase auth, OAuth buttons, expandable email, split-hero layout |
| `app/signup/profile/page.tsx` | Consolidated "About You" — name + company name + phone |
| `app/signup/company-details/page.tsx` | Industry dropdown + selectors, skip button |
| `lib/hooks/useAnalytics.ts` | Add `trackSetupStepSkipped`, remove crew invite trackers |
| `lib/constants/industries.ts` | Update `COMPANY_SIZES` to match spec values |

### Delete

| File | Reason |
|------|--------|
| `app/api/auth/signup/route.ts` | Bubble.io auth replaced |
| `app/api/auth/login/route.ts` | Bubble.io auth replaced |
| `app/api/auth/google/route.ts` | Bubble.io Google auth replaced |
| `app/api/auth/apple/route.ts` | Bubble.io Apple auth replaced |
| `app/signup/company-setup/` | Merged into profile |
| `app/signup/company-code/` | Removed — moved to in-app |
| `app/signup/ready/` | Removed — redirect to tutorial |
| `components/ui/OPSButton.tsx` | Replaced by new Button |
| `components/ui/OPSInput.tsx` | Replaced by new Input |
| `components/signup/IndustryPicker.tsx` | Replaced by IndustryDropdown |
| `components/signup/PillSelector.tsx` | Replaced by SelectorButton |

---

## Chunk 1: Foundation (Tasks 1-4)

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install production dependencies**

```bash
cd C:/OPS/try-ops && npm install firebase jose clsx tailwind-merge class-variance-authority @radix-ui/react-slot lucide-react
```

- [ ] **Step 2: Verify installation**

```bash
cd C:/OPS/try-ops && node -e "require('firebase/app'); require('jose'); require('clsx'); require('tailwind-merge'); require('class-variance-authority'); require('lucide-react'); console.log('All dependencies OK')"
```

Expected: `All dependencies OK`

- [ ] **Step 3: Commit**

```bash
cd C:/OPS/try-ops && git add package.json package-lock.json && git commit -m "chore: add firebase, jose, UI deps for signup overhaul"
```

---

### Task 2: Update Tailwind Config

**Files:**
- Modify: `tailwind.config.ts`

The current config has wrong token values (background `#080808`, text-primary `#FFFFFF`, border-radius `3px` everywhere). We need to:
1. Add new semantic token names matching ops-web
2. Correct the existing `ops.*` values so landing page/tutorial use correct colors
3. Add proper border-radius scale
4. Add Bebas Neue font family for brand mark

**Reference:** Spec Section 6 (Tailwind Token Corrections), ops-web `tailwind.config.ts`

- [ ] **Step 1: Replace the full tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens (matching ops-web)
        background: {
          DEFAULT: '#000000',
          panel: '#0A0A0A',
          card: '#191919',
          elevated: '#1A1A1A',
          input: '#111111',
          status: '#1D1D1D',
        },
        text: {
          primary: '#E5E5E5',
          secondary: '#A7A7A7',
          tertiary: '#777777',
          disabled: '#555555',
          placeholder: '#999999',
          inverse: '#0A0A0A',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.2)',
          subtle: 'rgba(255, 255, 255, 0.05)',
          separator: 'rgba(255, 255, 255, 0.15)',
        },
        // Legacy ops.* aliases with CORRECTED values
        ops: {
          background: '#000000',
          card: '#0A0A0A',
          'card-dark': '#1D1D1D',
          accent: '#597794',
          'accent-hover': '#4a6680',
          success: '#A5B368',
          warning: '#C4A868',
          amber: '#C4A868',
          'amber-hover': '#b09555',
          error: '#93321A',
          'error-hover': '#7a2915',
          'text-primary': '#E5E5E5',
          'text-secondary': '#A7A7A7',
          'text-tertiary': '#777777',
          'text-disabled': '#555555',
          border: '#2A2A2A',
          'border-emphasis': 'rgba(255, 255, 255, 0.12)',
          surface: 'rgba(13, 13, 13, 0.6)',
          inactive: '#8E8E93',
          'gray-50': '#F5F5F5',
          'gray-100': '#E5E5E5',
          'gray-200': '#C0C0C0',
          'gray-300': '#8A8A8A',
          'gray-400': '#555555',
          'gray-500': '#333333',
          'surface-elevated': '#141414',
          'border-hover': 'rgba(255,255,255,0.25)',
          'text-dark': '#1A1A1A',
          'background-light': '#FFFFFF',
        },
      },
      fontFamily: {
        mohave: ['Mohave', 'sans-serif'],
        kosugi: ['Kosugi', 'sans-serif'],
        bebas: ['Bebas Neue', 'sans-serif'],
      },
      fontSize: {
        // Semantic sizes matching ops-web
        'display': ['32px', { lineHeight: '1.1', fontWeight: '600' }],
        'heading': ['24px', { lineHeight: '1.2', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5' }],
        'body-sm': ['14px', { lineHeight: '1.5' }],
        'body-lg': ['18px', { lineHeight: '1.5' }],
        'button': ['15px', { lineHeight: '1', fontWeight: '600', letterSpacing: '0.05em' }],
        'button-sm': ['13px', { lineHeight: '1', fontWeight: '600', letterSpacing: '0.05em' }],
        'caption': ['12px', { lineHeight: '1.4' }],
        'caption-sm': ['11px', { lineHeight: '1.4' }],
        // Legacy aliases
        'ops-display': ['32px', { lineHeight: '1.1', fontWeight: '600' }],
        'ops-title': ['24px', { lineHeight: '1.2', fontWeight: '600' }],
        'ops-subtitle': ['22px', { lineHeight: '1.3' }],
        'ops-body': ['16px', { lineHeight: '1.4' }],
        'ops-label': ['14px', { lineHeight: '1.4' }],
        'ops-caption': ['12px', { lineHeight: '1.4' }],
      },
      spacing: {
        'ops-xs': '8px',
        'ops-sm': '8px',
        'ops-md': '16px',
        'ops-lg': '24px',
        'ops-xl': '48px',
        'ops-2xl': '64px',
        'ops-3xl': '96px',
      },
      borderRadius: {
        sm: '2.5px',
        DEFAULT: '5px',
        md: '5px',
        lg: '8px',
        xl: '12px',
        // Legacy aliases
        'ops': '5px',
        'ops-card': '5px',
        'ops-lg': '8px',
        'ops-sm': '2.5px',
      },
      animation: {
        'cursor-blink': 'blink 1s step-end infinite',
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'float': 'float 4s ease-in-out infinite',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 2: Add reduced-motion CSS**

Add to `app/globals.css` (or create if it doesn't exist) — Tailwind v3 includes the `motion-reduce:` variant by default, but we also need a global rule for the keyframe-based animations:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Verify build with updated config**

```bash
cd C:/OPS/try-ops && npx next build --no-lint 2>&1 | tail -5
```

Expected: Build succeeds (or only lint warnings, no Tailwind errors)

- [ ] **Step 4: Commit**

```bash
cd C:/OPS/try-ops && git add tailwind.config.ts app/globals.css && git commit -m "fix: align tailwind tokens with design system — correct colors, border-radius, add semantic names, reduced-motion"
```

---

### Task 3: Port Utility and Firebase Modules

**Files:**
- Create: `lib/utils/cn.ts`
- Create: `lib/firebase/config.ts`
- Create: `lib/firebase/auth.ts`

These are direct ports from ops-web with minimal adaptation (no i18n dependency, try-ops path aliases use `@/` same as ops-web).

- [ ] **Step 1: Create cn utility**

Create `lib/utils/cn.ts`:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Create Firebase config**

Create `lib/firebase/config.ts`:

```typescript
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  type Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return _app;
}

function getFirebaseAuth(): Auth {
  if (!_auth) {
    const app = getFirebaseApp();
    try {
      _auth = initializeAuth(app, {
        persistence: browserLocalPersistence,
        popupRedirectResolver: browserPopupRedirectResolver,
      });
    } catch {
      _auth = getAuth(app);
    }
  }
  return _auth;
}

export { getFirebaseApp, getFirebaseAuth };

export const app = typeof window !== "undefined" ? getFirebaseApp() : (null as unknown as FirebaseApp);
export const auth = typeof window !== "undefined" ? getFirebaseAuth() : (null as unknown as Auth);
```

- [ ] **Step 3: Create Firebase auth helpers**

Create `lib/firebase/auth.ts`:

```typescript
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");

// ─── Redirect Flag ──────────────────────────────────────────────────────────
const REDIRECT_FLAG_KEY = "ops-auth-redirect-pending";

export function setRedirectFlag() {
  try { sessionStorage.setItem(REDIRECT_FLAG_KEY, "1"); } catch {}
}

export function isRedirectPending(): boolean {
  try { return sessionStorage.getItem(REDIRECT_FLAG_KEY) === "1"; } catch { return false; }
}

export function clearRedirectFlag() {
  try { sessionStorage.removeItem(REDIRECT_FLAG_KEY); } catch {}
}

/**
 * Sign in with Google — tries popup first, falls back to redirect.
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request"
    ) {
      throw err;
    }
    if (
      code === "auth/popup-blocked" ||
      code === "auth/network-request-failed" ||
      code === "auth/internal-error"
    ) {
      console.warn("[auth] Popup failed, falling back to redirect:", code);
      setRedirectFlag();
      await signInWithRedirect(auth, googleProvider);
      return new Promise(() => {});
    }
    throw err;
  }
}

/**
 * Sign in with Apple — tries popup first, falls back to redirect.
 */
export async function signInWithApple(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, appleProvider);
    return result.user;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request"
    ) {
      throw err;
    }
    if (
      code === "auth/popup-blocked" ||
      code === "auth/network-request-failed" ||
      code === "auth/internal-error"
    ) {
      console.warn("[auth] Popup failed, falling back to redirect:", code);
      setRedirectFlag();
      await signInWithRedirect(auth, appleProvider);
      return new Promise(() => {});
    }
    throw err;
  }
}

/**
 * Check for redirect result on page load.
 */
export async function checkRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
  } catch (err) {
    console.warn("[auth] Redirect result check failed:", err);
    return null;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUpWithEmail(email: string, password: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function updateUserProfile(user: User, data: { displayName?: string }) {
  await updateProfile(user, data);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
  return firebaseOnAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}
```

- [ ] **Step 4: Commit**

```bash
cd C:/OPS/try-ops && git add lib/utils/cn.ts lib/firebase/config.ts lib/firebase/auth.ts && git commit -m "feat: port cn utility and Firebase auth module from ops-web"
```

---

### Task 4: Port UI Components (Button, Input, SelectorButton, IndustryDropdown)

**Files:**
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Input.tsx`
- Create: `components/ui/SelectorButton.tsx`
- Create: `components/ui/IndustryDropdown.tsx`

These are ports from ops-web. The Button and Input are nearly identical. SelectorButton and IndustryDropdown are extracted from `SetupIdentityStep.tsx`.

- [ ] **Step 1: Create Button component**

Create `components/ui/Button.tsx`:

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-1",
    "font-mohave text-button uppercase whitespace-nowrap",
    "rounded-sm transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(255,255,255,0.2)]",
    "disabled:pointer-events-none disabled:opacity-40",
    "no-select cursor-pointer",
    "active:scale-[0.98]",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-[rgba(255,255,255,0.07)] text-text-primary border border-[rgba(255,255,255,0.2)]",
          "hover:bg-[rgba(255,255,255,0.12)]",
        ],
        oauth: [
          "bg-[rgba(255,255,255,0.03)] text-text-primary border border-[rgba(255,255,255,0.12)] rounded-lg",
          "hover:bg-[rgba(255,255,255,0.07)]",
        ],
        primary: [
          "bg-ops-accent text-white border border-ops-accent",
          "hover:bg-ops-accent-hover",
        ],
        accent: [
          "bg-ops-amber text-text-inverse border border-ops-amber",
          "hover:bg-ops-amber-hover",
        ],
        secondary: [
          "bg-transparent text-text-secondary border border-[rgba(255,255,255,0.10)]",
          "hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.18)] hover:text-text-primary",
        ],
        destructive: [
          "bg-ops-error text-white border border-ops-error",
          "hover:bg-ops-error-hover",
        ],
        ghost: [
          "bg-transparent text-text-secondary",
          "hover:bg-[rgba(255,255,255,0.05)] hover:text-text-primary",
        ],
        link: [
          "bg-transparent text-ops-accent underline-offset-4",
          "hover:underline hover:text-ops-accent-hover",
          "p-0 h-auto active:scale-100",
        ],
      },
      size: {
        default: "h-[56px] px-3 py-1.5",
        sm: "h-[40px] px-2 py-1 text-button-sm",
        lg: "h-[64px] px-4 py-2 text-body-lg",
        icon: "h-[56px] w-[56px] p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden="true" />
            <span className="sr-only">Loading</span>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

Note: The default button height is `56px` (design system touch target), not ops-web's `h-7` which is dashboard-optimized. try-ops signup forms need large touch targets.

- [ ] **Step 2: Create Input component**

Create `components/ui/Input.tsx`:

```tsx
import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, prefixIcon, suffixIcon, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="flex flex-col gap-0.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-kosugi text-caption-sm text-text-secondary uppercase tracking-widest"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {prefixIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
              {prefixIcon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              "w-full bg-background-input text-text-primary font-mohave text-body",
              "px-3 py-3 rounded-sm min-h-[48px]",
              "border border-border",
              "transition-all duration-150",
              "placeholder:text-text-placeholder",
              "focus:border-ops-accent focus:outline-none caret-ops-accent",
              "disabled:cursor-not-allowed disabled:opacity-40",
              prefixIcon && "pl-9",
              suffixIcon && "pr-9",
              error && "border-ops-error focus:border-ops-error",
              className
            )}
            ref={ref}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          {suffixIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {suffixIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-caption-sm text-ops-error font-mohave" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-caption-sm text-text-tertiary font-mohave">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
```

- [ ] **Step 3: Create SelectorButton component**

Create `components/ui/SelectorButton.tsx`:

```tsx
import { cn } from "@/lib/utils/cn";

interface SelectorButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function SelectorButton({ label, selected, onClick }: SelectorButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "px-3 py-2 rounded-sm border transition-all duration-150 whitespace-nowrap cursor-pointer text-center",
        "font-mohave text-body-sm min-h-[44px] min-w-[56px] flex-1",
        selected
          ? "bg-white border-white text-[#0A0A0A]"
          : "bg-background-input border-border text-text-secondary hover:border-[rgba(255,255,255,0.25)] hover:text-text-primary"
      )}
    >
      {label}
    </button>
  );
}
```

- [ ] **Step 4: Create IndustryDropdown component**

Create `components/ui/IndustryDropdown.tsx`:

```tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { Check, ChevronDown, Search } from "lucide-react";
import { INDUSTRIES } from "@/lib/constants/industries";

interface IndustryDropdownProps {
  value: string[];
  onChange: (val: string[]) => void;
}

export function IndustryDropdown({ value, onChange }: IndustryDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const filtered = INDUSTRIES.filter((ind) =>
    ind.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
      setHighlightedIndex(-1);
    }
  }, [open]);

  useEffect(() => {
    if (highlightedIndex >= 0 && listboxRef.current) {
      const options = listboxRef.current.querySelectorAll('[role="option"]');
      options[highlightedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const toggleOption = useCallback(
    (ind: string) => {
      if (value.includes(ind)) {
        onChange(value.filter((v) => v !== ind));
      } else {
        onChange([...value, ind]);
      }
    },
    [onChange, value]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
            toggleOption(filtered[highlightedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          setSearch("");
          setHighlightedIndex(-1);
          break;
      }
    },
    [open, filtered, highlightedIndex, toggleOption]
  );

  const listboxId = "industry-listbox";

  const displayText =
    value.length === 0
      ? ""
      : value.length <= 2
        ? value.join(", ")
        : `${value.slice(0, 2).join(", ")} +${value.length - 2}`;

  return (
    <div ref={dropdownRef} className="relative" onKeyDown={handleKeyDown}>
      <label className="font-kosugi text-caption-sm text-text-secondary uppercase tracking-widest mb-0.5 block">
        [industry]
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        className={cn(
          "w-full flex items-center justify-between",
          "bg-background-input text-text-primary font-mohave text-body",
          "px-3 py-3 rounded-sm min-h-[48px]",
          "border border-border",
          "transition-all duration-150",
          "focus:border-ops-accent focus:outline-none",
          value.length === 0 && "text-text-tertiary"
        )}
      >
        <span className="truncate">{displayText || "Select industries"}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-text-tertiary transition-transform flex-shrink-0",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {value.map((ind) => (
            <span
              key={ind}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] font-mohave text-caption text-text-secondary"
            >
              {ind}
              <button
                type="button"
                onClick={() => toggleOption(ind)}
                className="text-text-disabled hover:text-text-primary transition-colors"
                aria-label={`Remove ${ind}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[rgba(10,10,10,0.70)] backdrop-blur-[20px] backdrop-saturate-[1.2] border border-[rgba(255,255,255,0.08)] rounded-sm overflow-hidden">
          <div className="p-1.5 border-b border-border">
            <div className="relative">
              <Search
                className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setHighlightedIndex(-1);
                }}
                placeholder="Search industries..."
                aria-label="Search industries"
                aria-controls={listboxId}
                aria-activedescendant={
                  highlightedIndex >= 0 ? `industry-option-${highlightedIndex}` : undefined
                }
                className="w-full bg-background-input text-text-primary font-mohave text-body-sm pl-7 pr-2 py-1.5 rounded-sm border border-border focus:border-ops-accent focus:outline-none placeholder:text-text-tertiary"
              />
            </div>
          </div>

          <div
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-label="Industries"
            aria-multiselectable="true"
            className="max-h-[200px] overflow-y-auto"
          >
            {filtered.map((ind, index) => {
              const isSelected = value.includes(ind);
              return (
                <button
                  key={ind}
                  id={`industry-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggleOption(ind)}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-1.5 text-left min-h-[44px]",
                    "font-mohave text-body-sm transition-colors",
                    isSelected
                      ? "bg-[rgba(255,255,255,0.08)] text-text-primary"
                      : highlightedIndex === index
                        ? "bg-background-elevated text-text-primary"
                        : "text-text-secondary hover:bg-background-elevated hover:text-text-primary"
                  )}
                >
                  <span>{ind}</span>
                  {isSelected && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="px-2 py-2 font-kosugi text-caption text-text-tertiary" role="status">
                No industries match &quot;{search}&quot;
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
cd C:/OPS/try-ops && git add components/ui/Button.tsx components/ui/Input.tsx components/ui/SelectorButton.tsx components/ui/IndustryDropdown.tsx && git commit -m "feat: port Button, Input, SelectorButton, IndustryDropdown from ops-web"
```

---

## Chunk 2: Server-Side & Store (Tasks 5-6)

### Task 5: Create Server-Side Auth & Sync Route

**Files:**
- Create: `lib/firebase/admin-verify.ts`
- Create: `lib/supabase/server-client.ts`
- Create: `app/api/auth/sync-user/route.ts`

Port the server-side auth verification and user sync from ops-web. try-ops uses the same Supabase project (`ijeekuhbatykdomumfjx`). The sync-user route is simplified — try-ops doesn't need the full `User`/`Company` type mapping, just the essential fields.

- [ ] **Step 1: Create admin-verify module**

Create `lib/firebase/admin-verify.ts`:

```typescript
/**
 * Server-side JWT verification via jose JWKS.
 * Verifies Firebase ID tokens using Google's public keys.
 * NEVER import from client-side code.
 */

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

export interface VerifiedUser {
  uid: string;
  email?: string;
  claims: JWTPayload;
}

/**
 * Verify a Firebase ID token (RS256 signed, verified via Google JWKS).
 */
export async function verifyFirebaseToken(token: string): Promise<VerifiedUser> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID not configured");
  }

  const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  if (!payload.sub) {
    throw new Error("Token missing subject (uid)");
  }

  return {
    uid: payload.sub,
    email: payload.email as string | undefined,
    claims: payload,
  };
}
```

Note: try-ops only needs Firebase verification (no Supabase JWT path like ops-web), since try-ops users always authenticate via Firebase.

- [ ] **Step 2: Create server-client module**

Create `lib/supabase/server-client.ts`:

```typescript
/**
 * Supabase service-role client for API routes.
 * NEVER import from client-side code.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let serviceClient: SupabaseClient | null = null;

export function getServiceRoleClient(): SupabaseClient {
  if (serviceClient) return serviceClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  serviceClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return serviceClient;
}
```

- [ ] **Step 3: Create sync-user API route**

Create `app/api/auth/sync-user/route.ts`:

```typescript
/**
 * POST /api/auth/sync-user
 *
 * Syncs a Firebase-authenticated user with the Supabase users table.
 * - Verifies Firebase ID token via jose JWKS
 * - Looks up user by firebase_uid/auth_id or email
 * - Creates new user record if none exists
 * - Returns { user, company, isNewUser }
 *
 * Body: { idToken, email, displayName?, firstName?, lastName?, photoURL? }
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/admin-verify";
import { getServiceRoleClient } from "@/lib/supabase/server-client";

interface SyncUserBody {
  idToken: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as SyncUserBody;
    const { idToken, email, displayName, firstName, lastName, photoURL } = body;

    if (!idToken || !email) {
      return NextResponse.json(
        { error: "Missing required fields: idToken, email" },
        { status: 400 }
      );
    }

    const firebaseUser = await verifyFirebaseToken(idToken);
    const firebaseUid = firebaseUser.uid;

    const db = getServiceRoleClient();

    // Look up existing user by auth_id, firebase_uid, then email
    const { data: byAuthId } = await db
      .from("users")
      .select("*")
      .eq("auth_id", firebaseUid)
      .is("deleted_at", null)
      .maybeSingle();

    let existingRow = byAuthId;

    if (!existingRow) {
      const { data: byFirebaseUid } = await db
        .from("users")
        .select("*")
        .eq("firebase_uid", firebaseUid)
        .is("deleted_at", null)
        .maybeSingle();
      existingRow = byFirebaseUid;
    }

    if (!existingRow) {
      const { data: byEmail } = await db
        .from("users")
        .select("*")
        .eq("email", email)
        .is("deleted_at", null)
        .maybeSingle();
      existingRow = byEmail;
    }

    // ── Existing user: update auth fields ──
    if (existingRow) {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

      if (!existingRow.auth_id) updates.auth_id = firebaseUid;
      if (!existingRow.firebase_uid) updates.firebase_uid = firebaseUid;
      if (photoURL && !existingRow.profile_image_url) updates.profile_image_url = photoURL;
      if (firstName && !existingRow.first_name) updates.first_name = firstName;
      if (lastName && !existingRow.last_name) updates.last_name = lastName;

      await db.from("users").update(updates).eq("id", existingRow.id);

      // Fetch company if linked
      let company = null;
      if (existingRow.company_id) {
        const { data: companyRow } = await db
          .from("companies")
          .select("id, name, industries, company_size, company_age")
          .eq("id", existingRow.company_id)
          .is("deleted_at", null)
          .single();
        company = companyRow;
      }

      return NextResponse.json({
        user: {
          id: existingRow.id,
          firstName: existingRow.first_name || firstName || "",
          lastName: existingRow.last_name || lastName || "",
          email: existingRow.email,
          companyId: existingRow.company_id,
          hasCompletedOnboarding: existingRow.has_completed_onboarding ?? false,
        },
        company,
        isNewUser: false,
      });
    }

    // ── New user: create record ──
    const derivedFirst = firstName || displayName?.split(" ")[0] || "";
    const derivedLast = lastName || displayName?.split(" ").slice(1).join(" ") || "";

    const newRow = {
      auth_id: firebaseUid,
      firebase_uid: firebaseUid,
      email,
      first_name: derivedFirst,
      last_name: derivedLast,
      profile_image_url: photoURL ?? null,
      role: "Field Crew",
      is_active: true,
      is_company_admin: true,
      has_completed_onboarding: false,
      has_completed_tutorial: false,
      dev_permission: false,
    };

    const { data: inserted, error: insertError } = await db
      .from("users")
      .insert(newRow)
      .select("*")
      .single();

    if (insertError || !inserted) {
      return NextResponse.json(
        { error: `Failed to create user: ${insertError?.message ?? "Unknown error"}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        id: inserted.id,
        firstName: derivedFirst,
        lastName: derivedLast,
        email,
        companyId: null,
        hasCompletedOnboarding: false,
      },
      company: null,
      isNewUser: true,
    });
  } catch (error) {
    console.error("[api/auth/sync-user] Error:", error);

    if (error instanceof Error && error.message.includes("Token")) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 4: Commit**

```bash
cd C:/OPS/try-ops && git add lib/firebase/admin-verify.ts lib/supabase/server-client.ts app/api/auth/sync-user/route.ts && git commit -m "feat: add server-side Firebase JWT verification and sync-user route"
```

---

### Task 6: Create Signup Store

**Files:**
- Create: `lib/stores/signup-store.ts`

Separate store for signup-specific state. The existing `onboarding-store` is preserved for tutorial/UTM/analytics state.

- [ ] **Step 1: Create the store**

Create `lib/stores/signup-store.ts`:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SignupState {
  // Auth
  firebaseUid: string | null;
  userId: string | null;
  email: string;
  authMethod: "google" | "apple" | "email" | null;
  isNewUser: boolean;

  // Profile (About You — step 2)
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;

  // Details (step 3)
  industries: string[];
  companySize: string;
  companyAge: string;

  // Company
  companyId: string | null;

  // Progress
  currentStep: number; // 1=credentials, 2=profile, 3=details

  // Actions
  setAuth: (data: {
    firebaseUid: string;
    userId: string;
    email: string;
    authMethod: "google" | "apple" | "email";
    isNewUser: boolean;
  }) => void;
  setProfile: (data: {
    firstName: string;
    lastName: string;
    phone: string;
    companyName: string;
  }) => void;
  setDetails: (data: {
    industries: string[];
    companySize: string;
    companyAge: string;
  }) => void;
  setCompanyId: (id: string) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

const initialState = {
  firebaseUid: null as string | null,
  userId: null as string | null,
  email: "",
  authMethod: null as SignupState["authMethod"],
  isNewUser: false,
  firstName: "",
  lastName: "",
  phone: "",
  companyName: "",
  industries: [] as string[],
  companySize: "",
  companyAge: "",
  companyId: null as string | null,
  currentStep: 1,
};

export const useSignupStore = create<SignupState>()(
  persist(
    (set) => ({
      ...initialState,

      setAuth: (data) =>
        set({
          firebaseUid: data.firebaseUid,
          userId: data.userId,
          email: data.email,
          authMethod: data.authMethod,
          isNewUser: data.isNewUser,
        }),

      setProfile: (data) =>
        set({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          companyName: data.companyName,
        }),

      setDetails: (data) =>
        set({
          industries: data.industries,
          companySize: data.companySize,
          companyAge: data.companyAge,
        }),

      setCompanyId: (id) => set({ companyId: id }),
      setCurrentStep: (step) => set({ currentStep: step }),
      reset: () => set(initialState),
    }),
    {
      name: "ops-signup",
    }
  )
);
```

- [ ] **Step 2: Also bridge auth to onboarding-store**

The signup pages need to sync auth data to `onboarding-store` as well (for analytics `variant` tracking). This will be done in the credentials page after auth succeeds, by calling both `useSignupStore.setAuth()` and `useOnboardingStore.setAuth()`.

No code change needed here — just a note for Task 8.

- [ ] **Step 3: Commit**

```bash
cd C:/OPS/try-ops && git add lib/stores/signup-store.ts && git commit -m "feat: add signup-store for signup-specific state management"
```

---

## Chunk 3: Layouts & Pages (Tasks 7-10)

### Task 7: Create Signup Layout (Split Hero)

**Files:**
- Create: `app/signup/layout.tsx`

This layout wraps all signup pages. For the credentials page (step 1), it renders a split hero. For post-auth pages (steps 2-3), it renders a centered layout.

**Reference:** ops-web `(auth)/layout.tsx`

**Important:** The existing `OnboardingScaffold` is NOT deleted — other pages (tutorial, download) still use it. The signup layout replaces it only for `/signup/*` routes.

- [ ] **Step 1: Create the signup layout**

Create `app/signup/layout.tsx`:

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  checkRedirectResult,
  isRedirectPending,
  clearRedirectFlag,
} from "@/lib/firebase/auth";

function RedirectHandler() {
  useEffect(() => {
    if (isRedirectPending()) {
      clearRedirectFlag();
      checkRedirectResult().then((user) => {
        if (user) {
          // Redirect result handled — the credentials page
          // will pick up the auth state via onAuthStateChanged
          console.log("[auth] Redirect sign-in completed for:", user.email);
        }
      });
    }
  }, []);

  return null;
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCredentials = pathname === "/signup/credentials";

  return (
    <>
      <RedirectHandler />

      {isCredentials ? (
        // ─── Split Hero Layout (Credentials) ───
        <div className="min-h-screen bg-background flex">
          {/* Left: Hero image — hidden on mobile */}
          <div className="hidden lg:block relative w-1/2 min-h-screen overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('/images/auth-hero.jpg')",
              }}
            />
            {/* Right-edge fade gradient */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.95) 90%, #000000 100%)",
              }}
            />
            {/* Bottom gradient for text legibility */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 40%, transparent 60%)",
              }}
            />
            {/* Brand mark */}
            <div className="absolute bottom-8 left-8 z-10">
              <p className="font-bebas text-[40px] tracking-[0.2em] text-white/90 leading-none">
                OPS
              </p>
              <p className="font-mohave text-body-sm text-white/50 mt-1">
                Built for the field.
              </p>
            </div>
          </div>

          {/* Right: Auth form */}
          <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
            <div className="w-full max-w-[420px] animate-fade-in">
              {children}
            </div>
          </div>
        </div>
      ) : (
        // ─── Centered Setup Layout (Profile, Details) ───
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-[600px] animate-fade-in">
            {children}
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Add hero image placeholder**

The layout references `/images/auth-hero.jpg`. If this doesn't exist in try-ops's `public/images/` directory, create a placeholder or copy from ops-web.

```bash
mkdir -p C:/OPS/try-ops/public/images && ls C:/OPS/ops-web/public/images/auth-hero.jpg 2>/dev/null && cp C:/OPS/ops-web/public/images/auth-hero.jpg C:/OPS/try-ops/public/images/auth-hero.jpg || echo "Hero image not found in ops-web — need to add manually"
```

- [ ] **Step 3: Commit**

```bash
cd C:/OPS/try-ops && git add app/signup/layout.tsx public/images/ && git commit -m "feat: add split-hero signup layout with redirect handler"
```

---

### Task 8: Rewrite Credentials Page

**Files:**
- Rewrite: `app/signup/credentials/page.tsx`

Complete rewrite replacing Bubble.io auth with Firebase. Features:
- Google + Apple OAuth buttons (full-width, design system compliant)
- Expandable email form (collapsed = button, expanded = fields)
- Login/signup toggle
- Firebase popup → redirect fallback
- Sync to Supabase via `/api/auth/sync-user`
- Bridge auth to both `signup-store` and `onboarding-store`

**Reference:** ops-web `(auth)/register/page.tsx`, spec Section 4.1

- [ ] **Step 1: Write the new credentials page**

Rewrite `app/signup/credentials/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSignupStore } from "@/lib/stores/signup-store";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { useAnalytics } from "@/lib/hooks/useAnalytics";
import {
  signInWithGoogle,
  signInWithApple,
  signInWithEmail,
  signUpWithEmail,
  updateUserProfile,
  getIdToken,
} from "@/lib/firebase/auth";
import type { User } from "firebase/auth";

async function syncUser(
  firebaseUser: User,
  extra?: { firstName?: string; lastName?: string }
) {
  const idToken = await firebaseUser.getIdToken();
  const nameParts = firebaseUser.displayName?.split(" ") ?? [];

  const res = await fetch("/api/auth/sync-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idToken,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      firstName: extra?.firstName || nameParts[0] || "",
      lastName: extra?.lastName || nameParts.slice(1).join(" ") || "",
      photoURL: firebaseUser.photoURL,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to sync user");
  }

  return res.json();
}

export default function CredentialsPage() {
  const router = useRouter();
  const {
    trackSignupStepView,
    trackSignupStepComplete,
    trackSignupAuthAttempt,
    trackSignupFieldError,
  } = useAnalytics();
  const signupStore = useSignupStore();
  const onboardingStore = useOnboardingStore();

  const [isLoginMode, setIsLoginMode] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"google" | "apple" | "email" | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    signupStore.setCurrentStep(1);
    onboardingStore.setSignupStep(1);
    trackSignupStepView("credentials", 1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAuthSuccess = async (
    firebaseUser: User,
    method: "google" | "apple" | "email",
    extraNames?: { firstName?: string; lastName?: string }
  ) => {
    try {
      const data = await syncUser(firebaseUser, extraNames);

      // Bridge to both stores
      signupStore.setAuth({
        firebaseUid: firebaseUser.uid,
        userId: data.user.id,
        email: data.user.email,
        authMethod: method,
        isNewUser: data.isNewUser,
      });
      onboardingStore.setAuth(data.user.id, method, data.user.email);

      if (data.user.firstName || data.user.lastName) {
        signupStore.setProfile({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          phone: "",
          companyName: "",
        });
        onboardingStore.setProfile({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          phone: "",
        });
      }

      trackSignupAuthAttempt(method, "completed");
      trackSignupStepComplete("credentials", 1);

      if (isLoginMode || !data.isNewUser) {
        // Existing user — skip setup, go to tutorial or download
        router.push("/tutorial");
      } else {
        router.push("/signup/profile");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to sync account";
      setError(msg);
      trackSignupAuthAttempt(method, "failed", msg);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setLoading(provider);
    setError("");
    trackSignupAuthAttempt(provider, "started");

    try {
      const signIn = provider === "google" ? signInWithGoogle : signInWithApple;
      const user = await signIn();
      await handleAuthSuccess(user, provider);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      // User cancelled — just reset loading
      if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        setLoading(null);
        return;
      }
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(msg);
      trackSignupAuthAttempt(provider, "failed", msg);
    } finally {
      setLoading(null);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!isLoginMode && !firstName.trim()) errors.firstName = "First name is required";
    if (!isLoginMode && !lastName.trim()) errors.lastName = "Last name is required";
    if (!email) errors.email = "Email is required";
    else if (!emailRegex.test(email)) errors.email = "Enter a valid email";
    if (!password) errors.password = "Password is required";
    else if (!isLoginMode && password.length < 8) errors.password = "Must be at least 8 characters";

    setFieldErrors(errors);
    Object.entries(errors).forEach(([field, err]) => {
      trackSignupFieldError("credentials", field, err);
    });
    return Object.keys(errors).length === 0;
  };

  const handleEmailSubmit = async () => {
    if (!validateForm()) return;

    setLoading("email");
    setError("");
    const method = isLoginMode ? "email_login" : "email_signup";
    trackSignupAuthAttempt(method, "started");

    try {
      let user: User;
      if (isLoginMode) {
        user = await signInWithEmail(email, password);
      } else {
        user = await signUpWithEmail(email, password);
        // Set display name for new users
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        await updateUserProfile(user, { displayName: fullName });
      }

      await handleAuthSuccess(user, "email", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      let msg = "Authentication failed. Please try again.";
      if (code === "auth/email-already-in-use") msg = "An account with this email already exists. Try signing in.";
      else if (code === "auth/invalid-credential") msg = "Invalid email or password.";
      else if (code === "auth/wrong-password") msg = "Incorrect password.";
      else if (code === "auth/user-not-found") msg = "No account found with this email.";
      else if (code === "auth/too-many-requests") msg = "Too many attempts. Please wait and try again.";

      setError(msg);
      trackSignupAuthAttempt(method, "failed", msg);
    } finally {
      setLoading(null);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError("");
    setFieldErrors({});
    setShowEmailForm(false);
  };

  return (
    <div className="w-full">
      {/* Mobile logo — hidden on desktop (hero has brand mark) */}
      <div className="lg:hidden mb-8">
        <p className="font-bebas text-[36px] tracking-[0.2em] text-white/90 leading-none">
          OPS
        </p>
      </div>

      <h1 className="font-mohave text-display text-text-primary uppercase tracking-wide">
        {isLoginMode ? "SIGN IN" : "CREATE ACCOUNT"}
      </h1>
      <p className="font-mohave text-body-sm text-text-tertiary mt-1 mb-6">
        {isLoginMode
          ? "Welcome back. Sign in to continue."
          : "Start your 30-day free trial. No card required."}
      </p>

      <div className="space-y-3">
        {/* OAuth Buttons — spec: bg rgba(255,255,255,0.03), border rgba(255,255,255,0.12), rounded-lg */}
        <Button
          variant="oauth"
          onClick={() => handleOAuth("google")}
          loading={loading === "google"}
          disabled={loading !== null}
          className="w-full"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" className="mr-2">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          CONTINUE WITH GOOGLE
        </Button>

        <Button
          variant="oauth"
          onClick={() => handleOAuth("apple")}
          loading={loading === "apple"}
          disabled={loading !== null}
          className="w-full"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          CONTINUE WITH APPLE
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-4 py-1">
          <div className="flex-1 h-px bg-border" />
          <span className="font-kosugi text-caption-sm text-text-tertiary uppercase tracking-widest">
            or
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Expandable Email */}
        {!showEmailForm ? (
          <Button
            variant="secondary"
            onClick={() => setShowEmailForm(true)}
            disabled={loading !== null}
            className="w-full"
          >
            {isLoginMode ? "SIGN IN WITH EMAIL" : "SIGN UP WITH EMAIL"}
          </Button>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {!isLoginMode && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, firstName: "" }));
                  }}
                  error={fieldErrors.firstName}
                  autoFocus
                />
                <Input
                  label="Last Name"
                  placeholder="Smith"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, lastName: "" }));
                  }}
                  error={fieldErrors.lastName}
                />
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((prev) => ({ ...prev, email: "" }));
              }}
              error={fieldErrors.email}
              autoComplete="email"
              autoFocus={isLoginMode}
            />

            <Input
              label="Password"
              type="password"
              placeholder={isLoginMode ? "Your password" : "8+ characters"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((prev) => ({ ...prev, password: "" }));
              }}
              error={fieldErrors.password}
              autoComplete={isLoginMode ? "current-password" : "new-password"}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEmailSubmit();
              }}
            />

            {error && (
              <p className="text-caption text-ops-error font-mohave" role="alert">
                {error}
              </p>
            )}

            <Button
              variant="primary"
              onClick={handleEmailSubmit}
              loading={loading === "email"}
              disabled={loading !== null}
              className="w-full"
            >
              {isLoginMode ? "SIGN IN" : "CREATE ACCOUNT"}
            </Button>
          </div>
        )}

        {/* General error (for OAuth) */}
        {error && !showEmailForm && (
          <p className="text-caption text-ops-error font-mohave" role="alert">
            {error}
          </p>
        )}

        {/* Toggle login/signup */}
        <p className="pt-2">
          <span className="font-kosugi text-caption text-text-tertiary">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            type="button"
            onClick={toggleMode}
            className="font-kosugi text-caption text-ops-accent hover:text-ops-accent-hover transition-colors"
          >
            {isLoginMode ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the page renders**

```bash
cd C:/OPS/try-ops && npx next build --no-lint 2>&1 | tail -10
```

Expected: Build succeeds. If Firebase env vars are missing, the build may still succeed since Firebase config uses lazy initialization.

- [ ] **Step 3: Commit**

```bash
cd C:/OPS/try-ops && git add app/signup/credentials/page.tsx && git commit -m "feat: rewrite credentials page with Firebase auth, OAuth, expandable email"
```

---

### Task 9: Rewrite Profile Page (About You)

**Files:**
- Rewrite: `app/signup/profile/page.tsx`

Consolidates old profile + company-setup into one page. Fields: First Name, Last Name, Company Name, Phone (optional). Uses the new Input component and design system tokens.

**Reference:** Spec Section 4.2, ops-web `SetupIdentityStep.tsx` Step 1

- [ ] **Step 1: Write the new profile page**

Rewrite `app/signup/profile/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSignupStore } from "@/lib/stores/signup-store";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { useAnalytics } from "@/lib/hooks/useAnalytics";

export default function ProfilePage() {
  const router = useRouter();
  const {
    trackSignupStepView,
    trackSignupStepComplete,
    trackSignupFieldError,
    trackSetupStepSkipped,
  } = useAnalytics();
  const signupStore = useSignupStore();
  const onboardingStore = useOnboardingStore();

  const [firstName, setFirstName] = useState(signupStore.firstName);
  const [lastName, setLastName] = useState(signupStore.lastName);
  const [companyName, setCompanyName] = useState(signupStore.companyName);
  const [phone, setPhone] = useState(signupStore.phone);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    signupStore.setCurrentStep(2);
    onboardingStore.setSignupStep(2);
    trackSignupStepView("profile", 2);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect if no auth
  useEffect(() => {
    if (!signupStore.userId) {
      router.replace("/signup/credentials");
    }
  }, [signupStore.userId, router]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!lastName.trim()) errs.lastName = "Last name is required";
    if (!companyName.trim()) errs.companyName = "Company name is required";

    setErrors(errs);
    Object.entries(errs).forEach(([field, err]) => {
      trackSignupFieldError("profile", field, err);
    });
    return Object.keys(errs).length === 0;
  };

  const saveProgress = async () => {
    signupStore.setProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      companyName: companyName.trim(),
    });
    onboardingStore.setProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
    });
    onboardingStore.setCompanyBasic({
      name: companyName.trim(),
      email: "",
      phone: "",
    });
  };

  const handleNext = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await saveProgress();
      trackSignupStepComplete("profile", 2);
      router.push("/signup/company-details");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    await saveProgress();
    trackSetupStepSkipped("profile", 2);
    router.push("/tutorial");
  };

  return (
    <div className="w-full">
      {/* Progress bar — 2 segments */}
      <div className="flex gap-1 mb-6">
        <div className="flex-1 h-0.5 bg-white/40 rounded-full" />
        <div className="flex-1 h-0.5 bg-background-elevated rounded-full" />
      </div>

      {/* Step indicator + skip */}
      <div className="flex items-center justify-between mb-6">
        <span className="font-kosugi text-caption-sm text-text-tertiary uppercase tracking-widest">
          [step 1 of 2]
        </span>
        <button
          type="button"
          onClick={handleSkip}
          className="font-kosugi text-caption-sm text-text-tertiary uppercase tracking-widest hover:text-text-secondary transition-colors"
        >
          Skip for now
        </button>
      </div>

      {/* Header */}
      <h1 className="font-mohave text-heading text-text-primary uppercase tracking-wide">
        ABOUT YOU
      </h1>
      <p className="font-kosugi text-caption text-text-tertiary mt-1 mb-6">
        [the name behind the operation]
      </p>

      {/* Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="John"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setErrors((prev) => ({ ...prev, firstName: "" }));
            }}
            error={errors.firstName}
            autoFocus
          />
          <Input
            label="Last Name"
            placeholder="Smith"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setErrors((prev) => ({ ...prev, lastName: "" }));
            }}
            error={errors.lastName}
          />
        </div>

        <Input
          label="Company Name"
          placeholder="Smith Roofing Co."
          value={companyName}
          onChange={(e) => {
            setCompanyName(e.target.value);
            setErrors((prev) => ({ ...prev, companyName: "" }));
          }}
          error={errors.companyName}
        />

        <Input
          label="Phone (Optional)"
          type="tel"
          placeholder="(555) 123-4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          helperText="[recovery only. we don't call.]"
        />
      </div>

      {/* Navigation */}
      <div className="border-t border-border-separator mt-8 pt-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          BACK
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
          loading={saving}
        >
          NEXT
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd C:/OPS/try-ops && git add app/signup/profile/page.tsx && git commit -m "feat: rewrite profile page — consolidated About You with company name"
```

---

### Task 10: Rewrite Company Details Page

**Files:**
- Modify: `lib/constants/industries.ts`
- Rewrite: `app/signup/company-details/page.tsx`

Step 3: Industry (searchable dropdown), Team Size (selector buttons), Years in Business (selector buttons). All optional, skippable.

**Reference:** Spec Section 4.3, ops-web `SetupIdentityStep.tsx` Step 2

**Pre-existing dependency:** `lib/constants/industries.ts` already exists with `INDUSTRIES`, `COMPANY_SIZES`, and `COMPANY_AGES`. The `COMPANY_SIZES` values (`1-2, 3-5, 6-10, 11-20, 20+`) differ from the spec (`1, 2-3, 4-5, 6-10, 10-20, 20+`). Update the constants to match the spec.

- [ ] **Step 1: Update COMPANY_SIZES in constants file**

In `lib/constants/industries.ts`, replace the `COMPANY_SIZES` line:

```typescript
// Before: ['1-2', '3-5', '6-10', '11-20', '20+']
export const COMPANY_SIZES = ['1', '2-3', '4-5', '6-10', '10-20', '20+'] as const
```

- [ ] **Step 2: Write the new company details page**

Rewrite `app/signup/company-details/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SelectorButton } from "@/components/ui/SelectorButton";
import { IndustryDropdown } from "@/components/ui/IndustryDropdown";
import { useSignupStore } from "@/lib/stores/signup-store";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { useAnalytics } from "@/lib/hooks/useAnalytics";
import { COMPANY_SIZES, COMPANY_AGES } from "@/lib/constants/industries";

export default function CompanyDetailsPage() {
  const router = useRouter();
  const {
    trackSignupStepView,
    trackSignupStepComplete,
    trackSignupComplete,
    trackSetupStepSkipped,
  } = useAnalytics();
  const signupStore = useSignupStore();
  const onboardingStore = useOnboardingStore();

  const [industries, setIndustries] = useState<string[]>(signupStore.industries);
  const [companySize, setCompanySize] = useState(signupStore.companySize);
  const [companyAge, setCompanyAge] = useState(signupStore.companyAge);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    signupStore.setCurrentStep(3);
    onboardingStore.setSignupStep(3);
    trackSignupStepView("details", 3);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect if no auth
  useEffect(() => {
    if (!signupStore.userId) {
      router.replace("/signup/credentials");
    }
  }, [signupStore.userId, router]);

  const saveAndFinish = async () => {
    setSaving(true);
    try {
      signupStore.setDetails({
        industries,
        companySize,
        companyAge,
      });
      onboardingStore.setCompanyDetails({
        industry: industries.join(", "),
        size: companySize,
        age: companyAge,
      });

      // Create/update company via API
      const idToken = await (await import("@/lib/firebase/auth")).getIdToken();
      if (idToken && signupStore.userId) {
        try {
          const res = await fetch("/api/auth/sync-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idToken,
              email: signupStore.email,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user?.companyId) {
              signupStore.setCompanyId(data.user.companyId);
              onboardingStore.setCompanyId(data.user.companyId);
            }
          }
        } catch {
          // Non-blocking — company can be created later
        }
      }

      trackSignupStepComplete("details", 3);
      trackSignupComplete(signupStore.authMethod ?? "unknown");
      onboardingStore.setSignupCompleted();

      router.push("/tutorial");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    onboardingStore.setSignupCompleted();
    trackSetupStepSkipped("details", 3);
    trackSignupComplete(signupStore.authMethod ?? "unknown");
    router.push("/tutorial");
  };

  return (
    <div className="w-full">
      {/* Progress bar — 2 segments, both filled */}
      <div className="flex gap-1 mb-6">
        <div className="flex-1 h-0.5 bg-white/40 rounded-full" />
        <div className="flex-1 h-0.5 bg-white/40 rounded-full" />
      </div>

      {/* Step indicator + skip */}
      <div className="flex items-center justify-between mb-6">
        <span className="font-kosugi text-caption-sm text-text-tertiary uppercase tracking-widest">
          [step 2 of 2]
        </span>
        <button
          type="button"
          onClick={handleSkip}
          className="font-kosugi text-caption-sm text-text-tertiary uppercase tracking-widest hover:text-text-secondary transition-colors"
        >
          Skip for now
        </button>
      </div>

      {/* Header */}
      <h1 className="font-mohave text-heading text-text-primary uppercase tracking-wide">
        YOUR COMPANY
      </h1>
      <p className="font-kosugi text-caption text-text-tertiary mt-1 mb-6">
        [this shapes your command center]
      </p>

      {/* Form */}
      <div className="space-y-5">
        <IndustryDropdown value={industries} onChange={setIndustries} />

        {/* Team Size */}
        <div role="group" aria-label="Team Size">
          <label className="font-kosugi text-caption-sm text-text-secondary uppercase tracking-widest mb-1.5 block">
            [team size]
          </label>
          <div className="flex gap-1.5">
            {COMPANY_SIZES.map((size) => (
              <SelectorButton
                key={size}
                label={size}
                selected={companySize === size}
                onClick={() => setCompanySize(companySize === size ? "" : size)}
              />
            ))}
          </div>
        </div>

        {/* Years in Business */}
        <div role="group" aria-label="Years in Business">
          <label className="font-kosugi text-caption-sm text-text-secondary uppercase tracking-widest mb-1.5 block">
            [years in business]
          </label>
          <div className="flex gap-1.5">
            {COMPANY_AGES.map((age) => (
              <SelectorButton
                key={age}
                label={age}
                selected={companyAge === age}
                onClick={() => setCompanyAge(companyAge === age ? "" : age)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-border-separator mt-8 pt-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          BACK
        </Button>
        <Button
          variant="primary"
          onClick={saveAndFinish}
          loading={saving}
        >
          LAUNCH
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd C:/OPS/try-ops && git add lib/constants/industries.ts app/signup/company-details/page.tsx && git commit -m "feat: rewrite company-details page — industry, size, age selectors; fix COMPANY_SIZES values"
```

---

## Chunk 4: Cleanup & Analytics (Tasks 11-13)

### Task 11: Update Analytics Hook

**Files:**
- Modify: `lib/hooks/useAnalytics.ts`

Add `trackSetupStepSkipped`. Remove crew invite trackers (pages deleted). Keep all other trackers intact.

- [ ] **Step 1: Add trackSetupStepSkipped**

In `lib/hooks/useAnalytics.ts`, add this function after `trackSignupStepAbandon`:

```typescript
const trackSetupStepSkipped = useCallback(
  (stepName: string, stepIndex: number) => {
    track('setup_step_skipped', {
      step_name: stepName,
      step_index: stepIndex,
    })
  },
  [track]
)
```

- [ ] **Step 2: Remove crew invite trackers**

Remove these functions from the hook:
- `trackCrewInviteOpened`
- `trackCrewInviteSent`
- `trackCrewInviteSkipped`

And remove them from the return object.

- [ ] **Step 3: Add trackSetupStepSkipped to return object**

Add `trackSetupStepSkipped` to the return object.

- [ ] **Step 4: Commit**

```bash
cd C:/OPS/try-ops && git add lib/hooks/useAnalytics.ts && git commit -m "feat: add trackSetupStepSkipped, remove deprecated crew invite trackers"
```

---

### Task 12: Delete Deprecated Files

**Files to delete:**
- `app/api/auth/signup/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/google/route.ts`
- `app/api/auth/apple/route.ts`
- `app/signup/company-setup/` (entire directory)
- `app/signup/company-code/` (entire directory)
- `app/signup/ready/` (entire directory)
- `components/ui/OPSButton.tsx`
- `components/ui/OPSInput.tsx`
- `components/signup/IndustryPicker.tsx` (if exists)
- `components/signup/PillSelector.tsx` (if exists)

**Important:** Before deleting, verify no remaining imports reference these files.

- [ ] **Step 1: Check for remaining imports of old components**

```bash
cd C:/OPS/try-ops && grep -rn "OPSButton\|OPSInput\|IndustryPicker\|PillSelector" --include="*.tsx" --include="*.ts" app/ components/ lib/ | grep -v "node_modules" | grep -v ".next"
```

If any files outside the deleted set still import these, update them to use the new components first.

- [ ] **Step 2: Check for remaining imports of Bubble auth routes**

```bash
cd C:/OPS/try-ops && grep -rn "api/auth/signup\|api/auth/login\|api/auth/google\|api/auth/apple" --include="*.tsx" --include="*.ts" app/ components/ lib/ | grep -v "node_modules" | grep -v ".next"
```

If any files still reference these routes, update them.

- [ ] **Step 3: Delete the files**

```bash
cd C:/OPS/try-ops && rm -f app/api/auth/signup/route.ts app/api/auth/login/route.ts app/api/auth/google/route.ts app/api/auth/apple/route.ts && rm -rf app/signup/company-setup app/signup/company-code app/signup/ready && rm -f components/ui/OPSButton.tsx components/ui/OPSInput.tsx && rm -f components/signup/IndustryPicker.tsx components/signup/PillSelector.tsx 2>/dev/null
```

- [ ] **Step 4: Verify build still passes**

```bash
cd C:/OPS/try-ops && npx next build --no-lint 2>&1 | tail -10
```

Expected: Build succeeds with no import errors.

- [ ] **Step 5: Commit**

```bash
cd C:/OPS/try-ops && git add -A && git commit -m "chore: remove deprecated Bubble auth routes, deleted pages, and old UI components"
```

---

### Task 13: Environment Variables

**Files:**
- Create: `.env.local.example` (documentation only)

The app needs Firebase + Supabase env vars configured in `.env.local`. This task documents the required variables.

- [ ] **Step 1: Create env example file**

Create `.env.local.example`:

```bash
# Firebase Auth (same project as ops-web)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Supabase (same project as ops-web)
NEXT_PUBLIC_SUPABASE_URL=https://ijeekuhbatykdomumfjx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- [ ] **Step 2: Copy Firebase env vars from ops-web**

The Firebase config values should match ops-web's `.env.local`. Copy the `NEXT_PUBLIC_FIREBASE_*` values from `C:/OPS/ops-web/.env.local` to `C:/OPS/try-ops/.env.local`.

```bash
grep "NEXT_PUBLIC_FIREBASE_" C:/OPS/ops-web/.env.local 2>/dev/null || echo "ops-web .env.local not found — copy values manually from Firebase Console"
```

Also ensure `SUPABASE_SERVICE_ROLE_KEY` is set (get from Supabase dashboard → Settings → API → service_role key).

- [ ] **Step 3: Add try-ops domain to Firebase authorized domains**

In Firebase Console → Authentication → Settings → Authorized domains, add:
- `localhost` (should already be there)
- The try-ops production domain (e.g., `try.opsapp.co`)

This step is manual and not scriptable.

- [ ] **Step 4: Commit the example file**

```bash
cd C:/OPS/try-ops && git add .env.local.example && git commit -m "docs: add .env.local.example with required Firebase and Supabase variables"
```

---

## Post-Implementation Verification

After all tasks are complete:

1. **Build check:** `cd C:/OPS/try-ops && npx next build --no-lint`
2. **Dev server:** `cd C:/OPS/try-ops && npm run dev` — verify all 3 signup pages render
3. **Desktop layout:** Open at 1440px+ width — verify split hero on credentials, centered layout on profile/details
4. **Mobile layout:** Open at 375px — verify full-width form, no hero
5. **Design system checklist:** Run through spec Section 9 items visually

---

## Design System Compliance Checklist (from Spec Section 9)

After implementation, verify each item:
- [ ] All text uses `#E5E5E5` primary (not `#FFFFFF`)
- [ ] Background is `#000000` (not `#080808`)
- [ ] Border radius follows system (5px default, 8px lg, 12px xl)
- [ ] Accent color (`#597794`) on ONE element per screen maximum
- [ ] Fonts: Mohave for titles/body/labels, Kosugi for captions, Bebas Neue for OPS brand mark ONLY
- [ ] All titles UPPERCASE
- [ ] All captions in `[square brackets]`
- [ ] 8dp grid spacing
- [ ] 56dp / 44px minimum touch targets
- [ ] No shadows — borders only
- [ ] Reduced motion respected

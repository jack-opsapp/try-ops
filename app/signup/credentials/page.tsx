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
} from "@/lib/firebase/auth";
import { triageUser } from "@/lib/auth/triage";
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

      trackSignupAuthAttempt(method, "completed");
      trackSignupStepComplete("credentials", 1);

      // Triage: routes user based on their current state in Supabase
      triageUser(
        data,
        firebaseUser.uid,
        method,
        { signupStore, onboardingStore },
        router
      );
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
        <p className="font-cakemono text-[36px] tracking-[0.2em] text-white/90 leading-none">
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
        {/* OAuth Buttons */}
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
          <span className="font-mono text-caption-sm text-text-tertiary uppercase tracking-widest">
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
          <span className="font-mono text-caption text-text-tertiary">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            type="button"
            onClick={toggleMode}
            className="font-mono text-caption text-ops-accent hover:text-ops-accent-hover transition-colors"
          >
            {isLoginMode ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

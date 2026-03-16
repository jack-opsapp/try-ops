"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  checkRedirectResult,
  clearRedirectFlag,
} from "@/lib/firebase/auth";
import { useSignupStore } from "@/lib/stores/signup-store";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { triageUser } from "@/lib/auth/triage";
import type { User } from "firebase/auth";

async function syncUserFromRedirect(firebaseUser: User) {
  const idToken = await firebaseUser.getIdToken();
  const nameParts = firebaseUser.displayName?.split(" ") ?? [];

  const res = await fetch("/api/auth/sync-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idToken,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      photoURL: firebaseUser.photoURL,
    }),
  });

  if (!res.ok) return null;
  return res.json();
}

function RedirectHandler() {
  const router = useRouter();
  const signupStore = useSignupStore();
  const onboardingStore = useOnboardingStore();

  useEffect(() => {
    clearRedirectFlag();
    checkRedirectResult().then(async (firebaseUser) => {
      if (!firebaseUser) return;

      const data = await syncUserFromRedirect(firebaseUser);
      if (!data) return;

      const method =
        firebaseUser.providerData[0]?.providerId === "google.com"
          ? ("google" as const)
          : ("apple" as const);

      triageUser(data, firebaseUser.uid, method, { signupStore, onboardingStore }, router);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCredentials = pathname === "/signup/credentials";
  const isAccountType = pathname === "/signup/account-type";

  return (
    <>
      <RedirectHandler />

      {isAccountType ? (
        // ─── Full-Screen Layout (Account Type Decision) ───
        <div className="min-h-screen bg-background">
          {children}
        </div>
      ) : isCredentials ? (
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

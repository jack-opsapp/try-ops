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

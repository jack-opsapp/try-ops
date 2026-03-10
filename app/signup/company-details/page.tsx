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

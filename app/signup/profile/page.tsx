"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSignupStore } from "@/lib/stores/signup-store";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { useAnalytics } from "@/lib/hooks/useAnalytics";
import { TacticalLoadingBar } from "@/components/ui/TacticalLoadingBar";

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

  if (!signupStore.userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <TacticalLoadingBar />
      </div>
    );
  }

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
    router.push("/download");
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
        <span className="font-mono text-caption-sm text-text-tertiary uppercase tracking-widest">
          [step 1 of 2]
        </span>
        <button
          type="button"
          onClick={handleSkip}
          className="font-mono text-caption-sm text-text-tertiary uppercase tracking-widest hover:text-text-secondary transition-colors"
        >
          Skip for now
        </button>
      </div>

      {/* Header */}
      <h1 className="font-mohave text-heading text-text-primary uppercase tracking-wide">
        ABOUT YOU
      </h1>
      <p className="font-mono text-caption text-text-tertiary mt-1 mb-6">
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

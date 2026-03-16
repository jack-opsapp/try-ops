"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountTypeScreen } from "@/components/signup/AccountTypeScreen";
import { getCurrentUser } from "@/lib/firebase/auth";
import { TacticalLoadingBar } from "@/components/ui/TacticalLoadingBar";

export default function AccountTypePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Auth guard: redirect to credentials if not authenticated
    const user = getCurrentUser();
    if (!user) {
      router.replace("/signup/credentials");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <TacticalLoadingBar />
      </div>
    );
  }

  return <AccountTypeScreen />;
}

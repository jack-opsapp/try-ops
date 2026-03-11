"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountTypeScreen } from "@/components/signup/AccountTypeScreen";
import { getCurrentUser } from "@/lib/firebase/auth";

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

  if (!ready) return null;

  return <AccountTypeScreen />;
}

'use client'

import { useEffect } from 'react'
import { useOnboardingStore, type Variant } from '@/lib/stores/onboarding-store'

export function useVariant(): Variant {
  const variant = useOnboardingStore((s) => s.variant)
  const setVariant = useOnboardingStore((s) => s.setVariant)

  useEffect(() => {
    if (variant) return

    // Read from cookie
    const cookies = document.cookie.split(';')
    const variantCookie = cookies
      .find((c) => c.trim().startsWith('ops_variant='))
      ?.split('=')[1]
      ?.trim()

    if (variantCookie === 'a' || variantCookie === 'b' || variantCookie === 'c') {
      setVariant(variantCookie as 'a' | 'b' | 'c')
    } else {
      // Fallback: random 3-way assignment
      const rand = Math.random()
      setVariant(rand < 0.33 ? 'a' : rand < 0.66 ? 'b' : 'c')
    }
  }, [variant, setVariant])

  return variant || 'a'
}

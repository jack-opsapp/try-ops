import { getABSupabase } from '@/lib/ab/supabase'
import { VariantConfigSchema, type VariantConfig } from '@/lib/ab/types'
import { SEED_CONFIG_A } from '@/lib/ab/seed-config'

export interface ActiveVariant {
  variantId: string
  config: VariantConfig
}

export async function fetchActiveVariant(slot: 'a' | 'b'): Promise<ActiveVariant> {
  try {
    const supabase = getABSupabase()

    const { data: test } = await supabase
      .from('ab_tests')
      .select('id, variant_a_id, variant_b_id')
      .eq('status', 'active')
      .single()

    if (!test) return fallback()

    const variantId = slot === 'a' ? test.variant_a_id : test.variant_b_id

    const { data: variant } = await supabase
      .from('ab_variants')
      .select('id, config')
      .eq('id', variantId)
      .single()

    if (!variant) return fallback()

    const parsed = VariantConfigSchema.safeParse(variant.config)
    if (!parsed.success) {
      console.error('Invalid variant config from DB:', parsed.error)
      return fallback()
    }

    return { variantId: variant.id, config: parsed.data }
  } catch (err) {
    console.error('Failed to fetch variant config:', err)
    return fallback()
  }
}

function fallback(): ActiveVariant {
  return { variantId: 'fallback', config: SEED_CONFIG_A }
}

import { z } from 'zod'

// ── Section prop schemas ──────────────────────────────────────────────────
export const HeroPropsSchema = z.object({
  headline: z.string(),
  subtext: z.string(),
  primaryCtaLabel: z.string(),
  secondaryCtaLabel: z.string(),
})

export const PainSectionPropsSchema = z.object({
  heading: z.string().optional(),
  cards: z.array(z.object({
    id: z.string(),
    title: z.string(),
    bullets: z.array(z.string()),
    forLine: z.string(),
  })),
})

export const SolutionSectionPropsSchema = z.object({
  heading: z.string().optional(),
  features: z.array(z.object({
    title: z.string(),
    copy: z.string(),
    why: z.string(),
  })),
})

export const TestimonialsSectionPropsSchema = z.object({
  heading: z.string().optional(),
  testimonials: z.array(z.object({
    quote: z.string(),
    name: z.string(),
    trade: z.string(),
    location: z.string(),
  })),
})

export const RoadmapSectionPropsSchema = z.object({
  heading: z.string().optional(),
  builtItems: z.array(z.string()),
  inDevItems: z.array(z.string()),
  roadmapItems: z.array(z.string()),
})

// PricingSection: keep tier data hardcoded, only expose heading/subtext
export const PricingSectionPropsSchema = z.object({
  heading: z.string().optional(),
  subtext: z.string().optional(),
})

export const FAQSectionPropsSchema = z.object({
  heading: z.string().optional(),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })),
})

export const ClosingCTAPropsSchema = z.object({
  headline: z.string(),
  subtext: z.string(),
  primaryCtaLabel: z.string(),
  secondaryCtaLabel: z.string(),
})

export const DesktopDownloadPropsSchema = z.object({
  heading: z.string().optional(),
})

export const InlineSignupFormPropsSchema = z.object({
  heading: z.string().optional(),
  subtext: z.string().optional(),
  location: z.string(),
})

export const StarburstPropsSchema = z.object({
  leftText: z.string().optional(),
  rightText: z.string().optional(),
})

// ── Section type registry ─────────────────────────────────────────────────
export const SECTION_TYPES = [
  'Hero',
  'PainSection',
  'SolutionSection',
  'TestimonialsSection',
  'RoadmapSection',
  'PricingSection',
  'FAQSection',
  'ClosingCTA',
  'DesktopDownload',
  'InlineSignupForm',
  'Starburst',
] as const

export type SectionType = typeof SECTION_TYPES[number]

export const SectionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('Hero'), props: HeroPropsSchema }),
  z.object({ type: z.literal('PainSection'), props: PainSectionPropsSchema }),
  z.object({ type: z.literal('SolutionSection'), props: SolutionSectionPropsSchema }),
  z.object({ type: z.literal('TestimonialsSection'), props: TestimonialsSectionPropsSchema }),
  z.object({ type: z.literal('RoadmapSection'), props: RoadmapSectionPropsSchema }),
  z.object({ type: z.literal('PricingSection'), props: PricingSectionPropsSchema }),
  z.object({ type: z.literal('FAQSection'), props: FAQSectionPropsSchema }),
  z.object({ type: z.literal('ClosingCTA'), props: ClosingCTAPropsSchema }),
  z.object({ type: z.literal('DesktopDownload'), props: DesktopDownloadPropsSchema }),
  z.object({ type: z.literal('InlineSignupForm'), props: InlineSignupFormPropsSchema }),
  z.object({ type: z.literal('Starburst'), props: StarburstPropsSchema }),
])

export const VariantConfigSchema = z.object({
  sections: z.array(SectionSchema).min(1).max(12),
})

export type VariantConfig = z.infer<typeof VariantConfigSchema>
export type SectionEntry = z.infer<typeof SectionSchema>

// ── DB row types (minimal, for type-safe queries) ─────────────────────────
export interface ABVariant {
  id: string
  test_id: string
  slot: 'a' | 'b'
  generation: number
  config: VariantConfig
  ai_reasoning: string
  visitor_count: number
  signup_count: number
  conversion_rate: number
  carried_from_variant_id: string | null
}

export interface ABTest {
  id: string
  started_at: string
  ended_at: string | null
  status: 'active' | 'rotating' | 'completed'
  winner_variant: 'a' | 'b' | null
  variant_a_id: string
  variant_b_id: string
  min_visitors: number
  min_days: number
}

export interface ABConfig {
  brand_context: string
  min_visitors: number
  min_days: number
}

import type React from 'react'
import { Hero } from '@/components/landing/Hero'
import { PainSection } from '@/components/landing/PainSection'
import { SolutionSection } from '@/components/landing/SolutionSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { RoadmapSection } from '@/components/landing/RoadmapSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { ClosingCTA } from '@/components/landing/ClosingCTA'
import { DesktopDownload } from '@/components/landing/DesktopDownload'
import { InlineSignupForm } from '@/components/landing/InlineSignupForm'
import { Starburst } from '@/components/landing/Starburst'
import { FounderQuote } from '@/components/landing/FounderQuote'
import type { SectionType } from '@/lib/ab/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SECTION_REGISTRY: Record<SectionType, React.ComponentType<any>> = {
  Hero,
  PainSection,
  SolutionSection,
  TestimonialsSection,
  RoadmapSection,
  PricingSection,
  FAQSection,
  ClosingCTA,
  DesktopDownload,
  InlineSignupForm,
  Starburst,
  FounderQuote,
}

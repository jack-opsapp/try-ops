import type React from 'react'
import dynamic from 'next/dynamic'
import { Hero } from '@/components/landing/Hero'
const PainSection = dynamic(() => import('@/components/landing/PainSection').then(module => module.PainSection))
import { SolutionSection } from '@/components/landing/SolutionSection'
const TestimonialsSection = dynamic(() => import('@/components/landing/TestimonialsSection').then(module => module.TestimonialsSection))
const RoadmapSection = dynamic(() => import('@/components/landing/RoadmapSection').then(module => module.RoadmapSection))
import { PricingSection } from '@/components/landing/PricingSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { ClosingCTA } from '@/components/landing/ClosingCTA'
const DesktopDownload = dynamic(() => import('@/components/landing/DesktopDownload').then(module => module.DesktopDownload))
const InlineSignupForm = dynamic(() => import('@/components/landing/InlineSignupForm').then(module => module.InlineSignupForm))
const Starburst = dynamic(() => import('@/components/landing/Starburst').then(module => module.Starburst))
const FounderQuote = dynamic(() => import('@/components/landing/FounderQuote').then(module => module.FounderQuote))
import { CompareTable } from '@/components/landing/CompareTable'
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
  CompareTable,
}

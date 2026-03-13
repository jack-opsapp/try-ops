/**
 * Audience-specific content overrides that merge with the base variant config.
 * Each override is a partial replacement keyed by section type.
 * Only overridden fields are replaced — everything else falls through from the base.
 */

import type { AudienceSignal, CompetitorSlug, TradeVertical } from './audience-signals'
import type { VariantConfig, SectionEntry } from './types'

// ── Competitor-specific overrides ──────────────────────────────────────────

interface CompetitorOverride {
  heroHeadline: string
  heroSubtext: string
  faqExtra: { question: string; answer: string }
  closingHeadline: string
  closingSubtext: string
}

const COMPETITOR_OVERRIDES: Record<CompetitorSlug, CompetitorOverride> = {
  jobber: {
    heroHeadline: 'TIRED OF PAYING FOR SOFTWARE YOUR CREW IGNORES?',
    heroSubtext: "Jobber charges $39-400+/month and your crew still texts you \"where am I going today?\" OPS is free to start, and your crew will actually open it.",
    faqExtra: {
      question: "How is OPS different from Jobber?",
      answer: "Jobber's calendar syncs once every 12 hours (one-way only). Their \"limited worker\" permissions strip away the features your crew actually needs. Their $39 price is bait — most teams pay $200+/month once you add the features you need. OPS gives your crew full visibility from day one, offline capability, and real-time scheduling. Free to start.",
    },
    closingHeadline: 'STOP PAYING FOR SOFTWARE YOUR CREW WON\'T USE',
    closingSubtext: 'Switch from Jobber today. Free to start. Your crew will thank you.',
  },
  servicetitan: {
    heroHeadline: 'ENTERPRISE FEATURES WITHOUT THE ENTERPRISE PRICE TAG',
    heroSubtext: "ServiceTitan costs $245-500/tech/month with $5K-50K in setup fees and 6+ months before your crew can use it. OPS is free to start and running the same day.",
    faqExtra: {
      question: "How does OPS compare to ServiceTitan?",
      answer: "ServiceTitan is built for enterprise shops with 20+ technicians. You'll pay $245-500 per tech per month, $5K-50K in implementation fees, and wait 6-12 months before your crew sees it. And it's desktop-first — not built for the field. OPS is mobile-first, crew-first, free to start, and working the same day you download it.",
    },
    closingHeadline: 'YOUR CREW NEEDS A TOOL BUILT FOR THE FIELD',
    closingSubtext: 'Not a desktop dashboard with a mobile afterthought. Free to start.',
  },
  housecallpro: {
    heroHeadline: 'REAL SUPPORT. REAL PRICING. BUILT FOR YOUR CREW.',
    heroSubtext: "Housecall Pro buried their support behind a chatbot and keeps raising prices. OPS gives you a direct line to the founder and transparent pricing that doesn't creep up.",
    faqExtra: {
      question: "Why switch from Housecall Pro?",
      answer: "Housecall Pro replaced human support with AI chatbots and buried their phone number. Their pricing starts at $59/month but creeps to $200+ with add-ons. Their Android app sits at 3.3 stars. OPS gives you direct access to the founder for support, published pricing with no hidden add-ons, and a mobile-first experience built for field crews.",
    },
    closingHeadline: 'SOFTWARE SHOULD COME WITH REAL HUMAN SUPPORT',
    closingSubtext: 'Direct line to the founder. Not a chatbot. Free to start.',
  },
  buildops: {
    heroHeadline: 'COMMERCIAL-GRADE TOOLS WITHOUT THE COMMERCIAL PRICE',
    heroSubtext: "BuildOps charges $299/user/month with 8+ weeks of implementation. That's $35,880/year for a 10-person team. OPS is free to start and working today.",
    faqExtra: {
      question: "How does OPS compare to BuildOps?",
      answer: "BuildOps is enterprise software priced for enterprise budgets — $299/user/month, no free trial, 8+ weeks of implementation before your crew sees it. That's $35,880/year for a 10-person team before you've scheduled a single job. OPS is free to start, no sales call required, and your crew is running the same day.",
    },
    closingHeadline: 'YOUR $35,880/YEAR PROBLEM HAS A FREE SOLUTION',
    closingSubtext: 'Download OPS today. Free to start. No sales call required.',
  },
  zuper: {
    heroHeadline: 'BUILT FOR YOUR TRADE, NOT EVERY TRADE',
    heroSubtext: "Generic FSM tools try to be everything to everyone and end up working for nobody. OPS is crew-first — designed for the people actually doing the work.",
    faqExtra: {
      question: "How is OPS different from Zuper?",
      answer: "Zuper markets to every trade, every industry, every workflow — HVAC, plumbing, electrical, roofing, solar, pool, landscaping, and more. When software tries to be everything, it does nothing well. Their mobile app sits at 3.0 stars and takes 12+ weeks to implement. OPS is crew-first, mobile-first, and working the same day.",
    },
    closingHeadline: 'YOUR CREW DESERVES PURPOSE-BUILT SOFTWARE',
    closingSubtext: 'Not a generic dashboard. Crew-first. Free to start.',
  },
}

// ── Trade-specific overrides ───────────────────────────────────────────────

interface TradeOverride {
  heroHeadline: string
  heroSubtext: string
  heroImageSrc?: string
}

const TRADE_OVERRIDES: Partial<Record<TradeVertical, TradeOverride>> = {
  roofing: {
    heroHeadline: 'ROOFING CREWS: STOP LOSING DAYS TO WEATHER AND CHAOS',
    heroSubtext: "Weather rescheduling. Crew coordination from the roof. Photo documentation for every shingle. OPS was built for crews who work with their hands, not office software adapted for the field.",
    heroImageSrc: '/images/hero_3.png',
  },
  electrical: {
    heroHeadline: 'ELECTRICAL CONTRACTORS: YOUR CREW NEEDS BETTER THAN A CLIPBOARD',
    heroSubtext: "Multi-day projects. Inspection holds. Crews in basements without signal. OPS works offline, syncs automatically, and keeps every crew member on the same page.",
    heroImageSrc: '/images/hero_1.png',
  },
  cleaning: {
    heroHeadline: 'CLEANING CREWS: SCHEDULING THAT HANDLES RECURRING CHAOS',
    heroSubtext: "Weekly clients. Rotating crews. 200% annual turnover. OPS keeps your schedule straight and your crew informed — no more WhatsApp group text chains.",
    heroImageSrc: '/images/hero_2.png',
  },
  glass: {
    heroHeadline: 'GLASS & GLAZING: DITCH THE WHITEBOARD',
    heroSubtext: "Material lead times. Field measurements. Crew scheduling around fabrication. OPS replaces the whiteboard, the sticky notes, and the group texts — in one app your crew will actually use.",
    heroImageSrc: '/images/hero_1.png',
  },
  plumbing: {
    heroHeadline: 'PLUMBING CREWS: SOFTWARE THAT WORKS IN THE CRAWLSPACE',
    heroSubtext: "Emergency calls destroying your schedule. Crews underground with no signal. OPS works offline, handles real-time rescheduling, and keeps your crew informed from the field.",
    heroImageSrc: '/images/hero_1.png',
  },
  hvac: {
    heroHeadline: 'HVAC CREWS: STOP COORDINATING THROUGH GROUP TEXTS',
    heroSubtext: "Seasonal surges. Emergency calls. Crews across town. OPS gives every technician a clean daily schedule and real-time updates — no more morning phone trees.",
    heroImageSrc: '/images/hero_2.png',
  },
  painting: {
    heroHeadline: 'PAINTING CONTRACTORS: YOUR CREW NEEDS MORE THAN A CLIPBOARD',
    heroSubtext: "Multi-day projects. Multiple crews. Client walkthroughs and photo documentation. OPS keeps every job organized and every crew member read in — free to start.",
    heroImageSrc: '/images/hero_1.png',
  },
  landscaping: {
    heroHeadline: 'LANDSCAPING CREWS: SCHEDULE TO DONE IN ONE APP',
    heroSubtext: "Seasonal crews. Recurring clients. Weather delays. OPS handles your scheduling chaos and keeps your crew informed — no training required.",
    heroImageSrc: '/images/hero_1.png',
  },
}

// ── Apply overrides to variant config ──────────────────────────────────────

export function applyAudienceOverrides(
  baseConfig: VariantConfig,
  signal: AudienceSignal,
): VariantConfig {
  // Deep clone to avoid mutating the original
  const config: VariantConfig = JSON.parse(JSON.stringify(baseConfig))

  const competitorOverride = signal.competitor ? COMPETITOR_OVERRIDES[signal.competitor] : null
  const tradeOverride = signal.trade ? TRADE_OVERRIDES[signal.trade] : null

  // No overrides detected
  if (!competitorOverride && !tradeOverride) return config

  for (let i = 0; i < config.sections.length; i++) {
    const section = config.sections[i]

    // ── Hero overrides ──
    if (section.type === 'Hero') {
      const props = section.props as Record<string, unknown>

      // Competitor headline/subtext take priority over trade
      if (competitorOverride) {
        props.headline = competitorOverride.heroHeadline
        props.subtext = competitorOverride.heroSubtext
      } else if (tradeOverride) {
        props.headline = tradeOverride.heroHeadline
        props.subtext = tradeOverride.heroSubtext
      }

      // Trade-specific hero image (only if trade override has one and no competitor override)
      if (tradeOverride?.heroImageSrc && !competitorOverride) {
        props.heroMode = 'image'
        props.heroImageSrc = tradeOverride.heroImageSrc
      }
    }

    // ── FAQ: prepend competitor-specific question ──
    if (section.type === 'FAQSection' && competitorOverride) {
      const props = section.props as { faqs: { question: string; answer: string }[] }
      // Insert competitor FAQ as the second item (after "Is OPS actually free?")
      props.faqs.splice(1, 0, competitorOverride.faqExtra)
    }

    // ── Closing CTA overrides ──
    if (section.type === 'ClosingCTA' && competitorOverride) {
      const props = section.props as Record<string, unknown>
      props.headline = competitorOverride.closingHeadline
      props.subtext = competitorOverride.closingSubtext
    }
  }

  return config
}

import type { VariantConfig } from '@/lib/ab/types'

/**
 * The paid landing pages — one per Google ad group, each answering the exact
 * question its searcher typed.
 *
 * These are fixed configs, not A/B variants. The rotating experiment stays on
 * `/`; a paid page has to hold still so its cost per trial means something.
 *
 * Section order is deliberate and the same everywhere: the headline answers
 * the search, the price answers the next question before it is asked, and one
 * CTA repeats down the page. The compare pages put the arithmetic before
 * everything else, because a person searching "jobber pricing" wants a number,
 * not a pitch.
 *
 * `TestimonialsSection` appears only where a real, named customer said
 * something relevant. Nothing here is invented, and no page carries a quote
 * that does not fit its subject.
 */

const FOUNDER = {
  type: 'FounderQuote' as const,
  props: {
    quote:
      "I scaled a deck and railing business from 0 to $1.6M in 4 years. Tried Jobber, ServiceTitan, Housecall Pro. None of them worked the way my crew actually works. So I built OPS.",
    name: 'Jack',
    title: 'Founder',
  },
}

const PRICING = {
  type: 'PricingSection' as const,
  props: {
    heading: 'THE PRICE IS ON THIS PAGE.',
    subtext:
      'Every plan has every feature. You pay for crew size, nothing else. 30 days free, no credit card.',
  },
}

/** The three things that decide whether a crew keeps using it. */
const CORE_FEATURES = [
  {
    title: 'NO TRAINING REQUIRED',
    copy: 'Your crew opens it once. They see their jobs. They know where to go. If they can send a text, they can use OPS.',
    why: 'Software the crew will not open is money you spend twice — once on the tool, again on the phone calls it was meant to end.',
  },
  {
    title: 'WORKS WITHOUT SIGNAL',
    copy: 'Basements, crawlspaces, rural sites, rooftops. OPS keeps working offline and syncs the moment the phone reconnects.',
    why: 'Your crew is not always in range. A tool that needs bars is a tool that fails on the days it matters.',
  },
  {
    title: 'ONE PRICE FOR THE CREW',
    copy: 'Every feature is on every plan. You pay for how many people you are managing, and nothing is held back for a bigger tier.',
    why: 'Per-seat billing charges you for hiring. Tiered features charge you twice for the same product.',
  },
]

const cta = (headline: string, subtext: string) => ({
  type: 'ClosingCTA' as const,
  props: {
    headline,
    subtext,
    primaryCtaLabel: 'START FREE',
    // Never rendered in web-signup mode — the single-CTA rule removes the
    // second button — but the schema requires the field.
    secondaryCtaLabel: 'START FREE',
  },
})

const hero = (headline: string, subtext: string) => ({
  type: 'Hero' as const,
  props: {
    headline,
    subtext,
    primaryCtaLabel: 'START FREE',
    secondaryCtaLabel: 'START FREE',
    heroMode: 'phone3d' as const,
  },
})

const faq = (faqs: Array<{ question: string; answer: string }>) => ({
  type: 'FAQSection' as const,
  props: { heading: 'THE QUESTIONS WORTH ASKING', faqs },
})

const solution = (features: typeof CORE_FEATURES) => ({
  type: 'SolutionSection' as const,
  props: { features },
})

/** Shared FAQ answers, so no page contradicts another. */
const FAQ_TRIAL = {
  question: 'What does the trial actually give me?',
  answer:
    'Everything, for 30 days, without a credit card. Not a demo account and not a cut-down version — the same product a paying crew runs on. If your crew has not opened it by week two, you have your answer and it cost you nothing.',
}
const FAQ_SWITCH = {
  question: 'How long does switching take?',
  answer:
    'A morning. You bring your clients, jobs and quotes across, and your crew starts on the next job. We have not built an import for every tool yet, so if yours is missing, say so and we will move the data for you.',
}
const FAQ_SMALL = {
  question: 'We are only three people. Is this overkill?',
  answer:
    'Three people is who it was built for. OPS starts at $90 a month for a crew of three, with every feature. It is the ten-person tools that get heavy, not this one.',
}

// ─── The pages ───────────────────────────────────────────────────────────────

const jobManagement: VariantConfig = {
  sections: [
    hero(
      'JOB MANAGEMENT YOUR CREW WILL ACTUALLY USE',
      'Jobs, schedule, quotes and invoices in one app. Your crew opens it and knows where to go. 30 days free, no credit card.'
    ),
    PRICING,
    FOUNDER,
    solution(CORE_FEATURES),
    faq([
      FAQ_TRIAL,
      {
        question: 'What if my crew will not use it?',
        answer:
          'That is the only question that matters, and it is why the trial is 30 days with no card. Open it with them on a Monday. If they are still texting you by Friday, we have not earned it.',
      },
      FAQ_SMALL,
    ]),
    cta(
      'START WITH THE NEXT JOB.',
      'Free for 30 days. No credit card. Every feature, every tier.'
    ),
  ],
}

const compare = (options: {
  rival: 'jobber' | 'housecall-pro' | 'servicetitan'
  headline: string
  subtext: string
  faqs: Array<{ question: string; answer: string }>
  testimonial?: {
    quote: string
    name: string
    trade: string
    location: string
  }
}): VariantConfig => ({
  sections: [
    hero(options.headline, options.subtext),
    // The arithmetic comes first: this page is answering a price search.
    { type: 'CompareTable' as const, props: { rival: options.rival } },
    PRICING,
    solution(CORE_FEATURES),
    ...(options.testimonial
      ? [
          {
            type: 'TestimonialsSection' as const,
            props: {
              heading: 'FROM SOMEONE WHO MADE THE MOVE',
              testimonials: [options.testimonial],
            },
          },
        ]
      : []),
    FOUNDER,
    faq(options.faqs),
    cta(
      'THE PRICE IS THE PRICE.',
      'Free for 30 days. No credit card. Every feature, every tier.'
    ),
  ],
})

const jobber = compare({
  rival: 'jobber',
  headline: 'SEE WHAT JOBBER COSTS. THEN SEE OURS.',
  subtext:
    'Both prices are published, side by side, in the currency each is billed in. Read it and decide.',
  testimonial: {
    quote:
      'I came to OPS from Jobber. We went from our crew ignoring the app, to being excited to use it.',
    name: 'Ryan M.',
    trade: 'HVAC',
    location: 'Fraser Valley',
  },
  faqs: [
    FAQ_SWITCH,
    {
      question: 'Is OPS just a cheaper Jobber?',
      answer:
        'No, and it would be a bad reason to switch. Jobber is a bigger product with more surface area. OPS is built so a crew of one to ten actually opens it every day, and everything it does is on every plan. If you need the surface area, Jobber is the better buy.',
    },
    FAQ_TRIAL,
  ],
})

const housecallPro = compare({
  rival: 'housecall-pro',
  headline: 'HOUSECALL PRO’S PRICE, NEXT TO OURS',
  subtext:
    'Read from their pricing page, not from memory. Both prices are labelled with the currency they are billed in.',
  faqs: [
    FAQ_SWITCH,
    {
      question: 'What about the sixth person?',
      answer:
        'That is where the two prices separate. Housecall Pro publishes $100 US a month for each user past five. OPS moves you to the plan that covers up to ten, and the feature list does not change.',
    },
    FAQ_TRIAL,
  ],
})

const serviceTitan = compare({
  rival: 'servicetitan',
  headline: 'SERVICETITAN WILL NOT SHOW YOU A PRICE',
  subtext:
    'Ours is on this page. Built for crews of one to ten, with no rollout, no onboarding fee and no sales call.',
  faqs: [
    {
      question: 'Is OPS a real replacement for ServiceTitan?',
      answer:
        'For a crew of one to ten, yes. For a hundred technicians and a call centre, no, and we will say so rather than sell you something that does not fit. ServiceTitan is built for a size of business OPS is not trying to serve.',
    },
    FAQ_SWITCH,
    FAQ_TRIAL,
  ],
})

const trade = (options: {
  headline: string
  subtext: string
  features: typeof CORE_FEATURES
  faqs: Array<{ question: string; answer: string }>
}): VariantConfig => ({
  sections: [
    hero(options.headline, options.subtext),
    PRICING,
    FOUNDER,
    solution(options.features),
    faq(options.faqs),
    cta(
      'START WITH TOMORROW’S SCHEDULE.',
      'Free for 30 days. No credit card. Every feature, every tier.'
    ),
  ],
})

const cleaning = trade({
  headline: 'RUN EVERY CLEAN FROM ONE APP',
  subtext:
    'The route, the crew, the photos and the invoice in one place. 30 days free, no credit card.',
  features: [
    {
      title: 'THE WHOLE ROUTE, ONE SCREEN',
      copy: 'Every stop, who is on it and what it needs, in the order the day happens. Your crew reads it once and drives.',
      why: 'Group texts and printed schedules lose stops. A crew that has to ask where they are going has already lost the morning.',
    },
    CORE_FEATURES[1],
    CORE_FEATURES[2],
  ],
  faqs: [
    {
      question: 'Does it handle recurring cleans?',
      answer:
        'Yes. Set the job once and it comes back on schedule, with the same crew and the same notes attached.',
    },
    FAQ_SMALL,
    FAQ_TRIAL,
  ],
})

const landscaping = trade({
  headline: 'EVERY PROPERTY, EVERY CREW, ONE APP',
  subtext:
    'The route, the crew, the photos and the invoice in one place. 30 days free, no credit card.',
  features: [
    {
      title: 'THE DAY, IN THE ORDER IT HAPPENS',
      copy: 'Every property, who is on it and what it needs, before the trailer leaves the yard.',
      why: 'A route that lives in one person’s head stops the day that person is off.',
    },
    CORE_FEATURES[1],
    CORE_FEATURES[2],
  ],
  faqs: [
    {
      question: 'Does it handle recurring maintenance?',
      answer:
        'Yes. Set the property once and it comes back on schedule, with the same crew and the same notes attached.',
    },
    FAQ_SMALL,
    FAQ_TRIAL,
  ],
})

const roofing = trade({
  headline: 'RUN EVERY ROOF FROM ONE APP',
  subtext:
    'Quote it, schedule it, photograph it, invoice it. All from the same app your crew already has open.',
  features: [
    {
      title: 'PHOTOS LAND ON THE JOB',
      copy: 'Tear-off, deck, flashing, finish. Every photo attaches to the job and stays there for the warranty call three years from now.',
      why: 'Photos in a camera roll are not a record. When a client questions the work, you need the file, not a search.',
    },
    CORE_FEATURES[1],
    CORE_FEATURES[2],
  ],
  faqs: [
    {
      question: 'Can I quote from the app?',
      answer:
        'Yes. Build the quote on site, send it before you leave, and turn it into a job when it comes back signed.',
    },
    FAQ_SMALL,
    FAQ_TRIAL,
  ],
})

/**
 * Route slug → config. The keys match the ad groups' final URLs in
 * `ops-web/config/ads/blueprint.json`; a page missing from here is an ad
 * pointing at a 404, so the test asserts both lists agree.
 */
export const PAID_PAGE_CONFIGS = {
  'job-management': jobManagement,
  'compare/jobber': jobber,
  'compare/housecall-pro': housecallPro,
  'compare/servicetitan': serviceTitan,
  'for/cleaning': cleaning,
  'for/landscaping': landscaping,
  'for/roofing': roofing,
} as const satisfies Record<string, VariantConfig>

export type PaidPageSlug = keyof typeof PAID_PAGE_CONFIGS

/** The variant id every paid page reports its events under. */
export const paidVariantId = (slug: PaidPageSlug): string => `paid:${slug}`

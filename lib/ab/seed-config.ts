import type { VariantConfig } from '@/lib/ab/types'

export const SEED_CONFIG_A: VariantConfig = {
  sections: [
    {
      type: 'Hero',
      props: {
        headline: 'JOB MANAGEMENT YOUR CREW WILL ACTUALLY USE',
        subtext: "Free to start. No training required. Your crew opens OPS, sees their jobs, and gets to work. Built by a contractor who couldn't find software his crew would use.",
        primaryCtaLabel: 'DOWNLOAD FREE - iOS',
        secondaryCtaLabel: 'TRY IT FIRST',
        heroMode: 'animation',
      },
    },
    {
      type: 'FounderQuote',
      props: {
        quote: "I scaled a deck and railing business from 0 to $1.6M in 4 years. Tried Jobber, ServiceTitan, Housecall Pro. None of them worked the way my crew actually works. So I built OPS.",
        name: 'Jack',
        title: 'Founder',
      },
    },
    {
      type: 'DesktopDownload',
      props: {},
    },
    {
      type: 'PainSection',
      props: {
        cards: [
          {
            id: 'messages',
            title: 'GROUP TEXT HELL',
            bullets: ['"What\'s the address?"', '"Who\'s going where?"', '"Did anyone update the client?"', 'Messages lost in scroll'],
            forLine: 'For 1-10 person crews with no software',
          },
          {
            id: 'dashboard',
            title: 'ENTERPRISE OVERKILL',
            bullets: ['$59-500/user/month', 'Training takes days or weeks', "Features you'll never touch", 'Your crew avoids opening it'],
            forLine: 'For crews who tried Jobber/ServiceTitan and it\'s too much',
          },
          {
            id: 'scattered',
            title: 'TOOL SPRAWL',
            bullets: ['Spreadsheets for scheduling', 'Whiteboard for crew assignments', 'Group texts for updates', 'Sticky notes for everything else'],
            forLine: 'For operations duct-taping manual solutions together',
          },
        ],
      },
    },
    {
      type: 'SolutionSection',
      props: {
        features: [
          { title: 'NO TRAINING REQUIRED', copy: "Your crew opens it once. They see their jobs. They know what to do. That's it. If they can send a text message, they can use OPS.", why: "Every other tool requires days of training and onboarding. Your crew won't use software they don't understand in 30 seconds. OPS is obvious from the first tap." },
          { title: 'WORKS WITHOUT SIGNAL', copy: "Basements. Crawlspaces. Rural job sites. Rooftops. OPS works offline and syncs automatically when your crew reconnects.", why: "Your crew isn't always in range. ServiceTitan and Jobber require constant connectivity. OPS doesn't." },
          { title: 'A SCHEDULE YOUR CREW ACTUALLY READS', copy: "An intuitive job board and clean daily schedule. Your crew sees what's coming up, who's assigned where, and what needs to get done — all in one glance.", why: 'No more morning phone calls asking "where am I going today?" Your crew opens the app and they\'re read in.' },
          { title: 'DIRECT LINE TO THE BUILDER', copy: "Missing a feature? Speak directly to the founder. We listen. We build what you actually need. No support tickets. No chatbots.", why: 'Housecall Pro buried their phone number behind an AI chatbot. We answer directly.' },
        ],
      },
    },
    {
      type: 'Starburst',
      props: {
        leftText: 'COMMAND',
        rightText: 'CHAOS',
      },
    },
    {
      type: 'TestimonialsSection',
      props: {
        testimonials: [
          { quote: 'I came to OPS from Jobber. We went from our crew ignoring the app, to being excited to use it.', name: 'Ryan M.', trade: 'HVAC', location: 'Fraser Valley' },
          { quote: 'OPS is saving me likely 2 hours daily of coordination and back & forth, which has impressed me, but more surprising is how much more efficient my crew is.', name: 'Jorge R.', trade: 'Painting Contractor', location: 'Kelowna' },
          { quote: "It's an absolute game changer.", name: 'Harrison S.', trade: 'Landscaping', location: 'Victoria' },
          { quote: "I was quite literally on the verge of firing my foreman on one of my crews... since then he's happy as a dog with two tails.", name: 'Bobby L.', trade: 'Plumbing', location: 'Kamloops' },
        ],
      },
    },
    {
      type: 'RoadmapSection',
      props: {
        builtItems: ['Multiple Project Tasks'],
        inDevItems: ['Auto Time Tracking', 'Team Locations', 'Expense Tracking', 'Client Portal', 'Estimating & Invoices', 'Request for Google Review', 'Client Booking Portal', 'Inventory Tracking'],
        roadmapItems: ['Calendar Request System', 'Weather Integration', 'Apple Watch', 'Work Analytics'],
      },
    },
    {
      type: 'PricingSection',
      props: {},
    },
    {
      type: 'InlineSignupForm',
      props: { location: 'mid-page' },
    },
    {
      type: 'FAQSection',
      props: {
        faqs: [
          {
            question: 'Is OPS actually free?',
            answer: "Yes. Free to start — no credit card, no sales call, no strings. We have paid tiers for teams that need more, but the free plan is genuinely functional. Not a 14-day trial that locks you out."
          },
          {
            question: 'How long does it take to set up?',
            answer: "Download it. Open it. Your crew sees their jobs. Most teams are running the same day. Not 3-12 months like ServiceTitan, not weeks of \"onboarding\" like Jobber. Same day."
          },
          {
            question: "My crew won't use software. How is this different?",
            answer: "We hear this constantly. The problem isn't your crew — it's the software. OPS was built for people who work with their hands. 56dp touch targets for gloved hands. Dark theme readable in sunlight. No training manual. If they can send a text, they can use OPS."
          },
          {
            question: 'Does it work without cell service?',
            answer: "Yes. Your crew in basements, crawlspaces, and on rooftops can use OPS without signal. Changes sync automatically when they reconnect. Most competitors require constant connectivity."
          },
          {
            question: 'Why should I switch from Jobber / ServiceTitan / Housecall Pro?',
            answer: "Honest answer: if your current tool works and your crew actually uses it, don't switch. But if you're paying $59-500/user/month and your crew still texts you \"where am I going today?\" — that tool isn't working. OPS is free to start and your crew will actually open it."
          },
          {
            question: 'What trades does OPS work for?',
            answer: "Any trade with a crew. HVAC, plumbing, electrical, roofing, landscaping, painting, cleaning, glass & glazing, fencing, decks — if you have people going to job sites, OPS works."
          },
          {
            question: 'Can I talk to a real person if I need help?',
            answer: "Yes. Direct line to the founder. Not a chatbot. Not a ticket queue. Not an AI assistant pretending to be support. A human who built the app and uses it every day."
          },
          {
            question: "What if you're missing a feature I need?",
            answer: "Tell us. If it makes sense for crews like yours, we build it. You talk directly to the person making the product decisions — not a feedback form that goes nowhere."
          },
          {
            question: "How do I know you won't jack up prices?",
            answer: "Our pricing is published. No hidden fees, no bait-and-switch, no \"contact sales for pricing.\" I built OPS because I needed it for my own crew. This isn't a VC-funded experiment that'll pivot to enterprise in 18 months."
          },
          {
            question: 'Is there an Android version?',
            answer: "Coming soon. We're building it now with the same crew-first design philosophy. Sign up to get early access and we'll notify you the moment it drops."
          },
        ],
      },
    },
    {
      type: 'ClosingCTA',
      props: {
        headline: 'YOUR CREW DESERVES SOFTWARE THAT WORKS AS HARD AS THEY DO',
        subtext: 'Free to start. Working today. No sales call required.',
        primaryCtaLabel: 'DOWNLOAD FREE',
        secondaryCtaLabel: 'TRY IT FIRST',
      },
    },
  ],
}

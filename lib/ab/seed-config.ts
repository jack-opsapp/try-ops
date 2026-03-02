import type { VariantConfig } from '@/lib/ab/types'

export const SEED_CONFIG_A: VariantConfig = {
  sections: [
    {
      type: 'Hero',
      props: {
        headline: 'JOB MANAGEMENT YOUR CREW WILL ACTUALLY USE',
        subtext: "Built by trades, for trades. Your software should handle the chaos so you don't have to.",
        primaryCtaLabel: 'DOWNLOAD FREE - iOS',
        secondaryCtaLabel: 'TRY IT FIRST',
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
            bullets: ['Training takes days', "Features you'll never use", '"It\'s just somewhat complicated"', 'Your crew avoids opening it'],
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
          { title: 'NO TRAINING REQUIRED', copy: "Your crew opens it once. They see their jobs. They know what to do. That's it.", why: "Every other tool requires days of training. Your guys won't use software they don't understand. OPS is obvious from the first tap." },
          { title: 'PHOTO DOCUMENTATION THAT WORKS', copy: 'Before/after shots. Progress updates. Damage documentation. Markup with arrows and notes. All organized by job.', why: 'No more hunting through text chains for that one photo. Everything lives with the job it belongs to.' },
          { title: 'A SCHEDULE YOUR CREW ACTUALLY READS', copy: "An intuitive job board and clean daily schedule. Your crew sees what's coming up, who's assigned where, and what needs to get done — all in one glance.", why: 'No more morning phone calls asking "where am I going today?" Your crew opens the app and they\'re read in.' },
          { title: 'DIRECT LINE TO THE BUILDER', copy: "Missing a feature? Speak directly to the founder. We listen. We build what you actually need.", why: 'No support tickets. No chatbots. You talk to the person who built it and uses it every day.' },
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
          { question: 'Why should I switch from Jobber?', answer: "Honestly? If Jobber works for you and your crew uses it, don't switch. OPS is for crews who tried Jobber and found it too complicated, or who are still using group texts and need something simple." },
          { question: "What if you're missing a feature I need?", answer: "Tell me. If it makes sense for crews like yours, we'll build it." },
          { question: "How do I know you won't shut down?", answer: "You don't. But I can tell you I'm building this because I needed it myself and couldn't find it. This isn't a VC-funded experiment." },
        ],
      },
    },
    {
      type: 'ClosingCTA',
      props: {
        headline: 'YOUR CREW DESERVES SOFTWARE THAT WORKS AS HARD AS YOU DO',
        subtext: 'Stop coordinating through chaos. Get OPS.',
        primaryCtaLabel: 'DOWNLOAD FREE',
        secondaryCtaLabel: 'TRY IT FIRST',
      },
    },
  ],
}

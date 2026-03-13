/**
 * Audience signal detection from UTM parameters and referrer.
 * Maps inbound traffic to audience segments for content personalization.
 */

export type TradeVertical =
  | 'electrical'
  | 'roofing'
  | 'plumbing'
  | 'hvac'
  | 'cleaning'
  | 'glass'
  | 'painting'
  | 'landscaping'
  | 'general'

export type CompetitorSlug =
  | 'jobber'
  | 'servicetitan'
  | 'housecallpro'
  | 'buildops'
  | 'zuper'

export interface AudienceSignal {
  trade?: TradeVertical
  competitor?: CompetitorSlug
  intent?: 'comparison' | 'pricing' | 'alternative' | 'general'
  channel?: 'reddit' | 'google' | 'social' | 'direct'
}

const TRADE_KEYWORDS: Record<string, TradeVertical> = {
  'electric': 'electrical',
  'electrician': 'electrical',
  'electrical': 'electrical',
  'roof': 'roofing',
  'roofer': 'roofing',
  'roofing': 'roofing',
  'plumb': 'plumbing',
  'plumber': 'plumbing',
  'plumbing': 'plumbing',
  'hvac': 'hvac',
  'heating': 'hvac',
  'cooling': 'hvac',
  'clean': 'cleaning',
  'cleaning': 'cleaning',
  'janitor': 'cleaning',
  'janitorial': 'cleaning',
  'glass': 'glass',
  'glazing': 'glass',
  'glazier': 'glass',
  'paint': 'painting',
  'painter': 'painting',
  'painting': 'painting',
  'landscape': 'landscaping',
  'landscaper': 'landscaping',
  'landscaping': 'landscaping',
  'deck': 'general',
  'fence': 'general',
  'fencing': 'general',
  'construction': 'general',
  'contractor': 'general',
}

const COMPETITOR_KEYWORDS: Record<string, CompetitorSlug> = {
  'jobber': 'jobber',
  'servicetitan': 'servicetitan',
  'service-titan': 'servicetitan',
  'service_titan': 'servicetitan',
  'housecall': 'housecallpro',
  'housecallpro': 'housecallpro',
  'housecall-pro': 'housecallpro',
  'buildops': 'buildops',
  'build-ops': 'buildops',
  'zuper': 'zuper',
}

const INTENT_KEYWORDS: Record<string, AudienceSignal['intent']> = {
  'alternative': 'alternative',
  'alternatives': 'alternative',
  'vs': 'comparison',
  'versus': 'comparison',
  'compare': 'comparison',
  'comparison': 'comparison',
  'pricing': 'pricing',
  'price': 'pricing',
  'cost': 'pricing',
  'free': 'pricing',
}

/**
 * Detect audience signals from URL search params and referrer string.
 * Designed to be called server-side in page.tsx.
 */
export function detectAudienceSignals(
  params: Record<string, string | string[] | undefined>,
  referrer?: string | null,
): AudienceSignal {
  const signal: AudienceSignal = {}

  // Normalize all UTM fields into a single searchable string
  const utmFields = ['utm_campaign', 'utm_term', 'utm_content', 'utm_source', 'utm_medium']
  const allText = utmFields
    .map(f => {
      const v = params[f]
      return typeof v === 'string' ? v : Array.isArray(v) ? v.join(' ') : ''
    })
    .join(' ')
    .toLowerCase()

  // Detect trade vertical
  for (const [keyword, trade] of Object.entries(TRADE_KEYWORDS)) {
    if (allText.includes(keyword)) {
      signal.trade = trade
      break
    }
  }

  // Detect competitor context
  for (const [keyword, competitor] of Object.entries(COMPETITOR_KEYWORDS)) {
    if (allText.includes(keyword)) {
      signal.competitor = competitor
      break
    }
  }

  // Detect intent
  for (const [keyword, intent] of Object.entries(INTENT_KEYWORDS)) {
    if (allText.includes(keyword)) {
      signal.intent = intent
      break
    }
  }

  // Referrer-based channel detection
  const ref = (referrer ?? '').toLowerCase()
  if (ref.includes('reddit.com')) signal.channel = 'reddit'
  else if (ref.includes('google.com') || ref.includes('google.ca')) signal.channel = 'google'
  else if (ref.includes('facebook.com') || ref.includes('instagram.com') || ref.includes('tiktok.com') || ref.includes('twitter.com') || ref.includes('x.com')) signal.channel = 'social'
  else if (!ref) signal.channel = 'direct'

  return signal
}

/** True if any meaningful signal was detected */
export function hasAudienceSignal(signal: AudienceSignal): boolean {
  return !!(signal.trade || signal.competitor)
}

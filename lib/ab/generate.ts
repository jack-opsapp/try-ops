import OpenAI from 'openai'
import { ZodError } from 'zod'
import { VariantConfigSchema, SECTION_TYPES, type VariantConfig } from '@/lib/ab/types'
import type { VariantSummary } from '@/lib/ab/aggregator'

const client = new OpenAI()

interface GenerationInput {
  brandContext: string
  winner: VariantSummary
  loser: VariantSummary
}

interface GenerationResult {
  config: VariantConfig
  reasoning: string
}

const SYSTEM_PROMPT = (brandContext: string) => `You are a conversion rate optimization expert generating a new landing page challenger for A/B testing.

BRAND CONTEXT:
${brandContext}

AVAILABLE SECTION TYPES (you MUST only use these exact strings):
${SECTION_TYPES.join(', ')}

SECTION PROP RULES:
- Hero: { headline: string, subtext: string, primaryCtaLabel: string, secondaryCtaLabel: string }
- PainSection: { heading?: string, cards: [{ id: string, title: string, bullets: string[], forLine: string }] }
- SolutionSection: { heading?: string, features: [{ title: string, copy: string, why: string }] }
- TestimonialsSection: { heading?: string, testimonials: [{ quote: string, name: string, trade: string, location: string }] }
- RoadmapSection: { heading?: string, builtItems: string[], inDevItems: string[], roadmapItems: string[] }
- PricingSection: { heading?: string, subtext?: string }
- FAQSection: { heading?: string, faqs: [{ question: string, answer: string }] }
- ClosingCTA: { headline: string, subtext: string, primaryCtaLabel: string, secondaryCtaLabel: string }
- DesktopDownload: { heading?: string }
- InlineSignupForm: { heading?: string, subtext?: string, location: string }
- Starburst: { leftText?: string, rightText?: string }

CONSTRAINTS:
- Use 4-10 sections total
- Must include Hero and ClosingCTA
- All copy must be trades-industry appropriate, direct, no corporate language
- All headings in UPPERCASE (Mohave font convention)
- Output valid JSON only — no markdown, no code fences, no explanation outside the JSON

OUTPUT FORMAT:
{"config":{"sections":[...]},"reasoning":"2-4 sentences explaining your design decisions"}`

export async function generateChallenger(input: GenerationInput): Promise<GenerationResult> {
  const { brandContext, winner, loser } = input

  const userPrompt = `WINNER (variant ${winner.slot}, generation ${winner.generation}):
- Conversion rate: ${(winner.conversionRate * 100).toFixed(2)}%
- Visitors: ${winner.visitorCount}, Signups: ${winner.signupCount}
- AI reasoning from last cycle: "${winner.aiReasoning}"
- Section performance: ${JSON.stringify(winner.sections, null, 2)}
- UTM breakdown: ${JSON.stringify(winner.utmBreakdown, null, 2)}
- Config: ${JSON.stringify(winner.config, null, 2)}

LOSER (variant ${loser.slot}, generation ${loser.generation}):
- Conversion rate: ${(loser.conversionRate * 100).toFixed(2)}%
- Visitors: ${loser.visitorCount}, Signups: ${loser.signupCount}
- AI reasoning from last cycle: "${loser.aiReasoning}"
- Section performance: ${JSON.stringify(loser.sections, null, 2)}
- Config: ${JSON.stringify(loser.config, null, 2)}

Generate a new challenger landing page config that learns from this data. Think carefully about which sections held attention (high dwell, high % viewers) and which didn't. Try a meaningfully different approach — not just minor copy tweaks.`

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT(brandContext) },
    { role: 'user', content: userPrompt },
  ]

  let lastErr: unknown
  for (let i = 0; i < 3; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 1000 * i))
    let assistantText = ''
    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 4096,
        temperature: 0.8,
        messages,
      })
      assistantText = response.choices[0]?.message?.content ?? ''
      const parsed = JSON.parse(assistantText)
      const validated = VariantConfigSchema.parse(parsed.config)
      return { config: validated, reasoning: String(parsed.reasoning) }
    } catch (err) {
      lastErr = err
      console.error(`Generation attempt ${i + 1} failed:`, err)
      // Feed Zod errors back so the model can self-correct
      if (err instanceof ZodError && i < 2 && assistantText) {
        messages.push(
          { role: 'assistant', content: assistantText },
          { role: 'user', content: `Your JSON failed schema validation. Fix these errors and output valid JSON only:\n${err.message}` }
        )
      }
    }
  }
  throw lastErr
}

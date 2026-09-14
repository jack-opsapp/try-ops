import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { APPROVED_TESTIMONIALS } from '@/lib/landing/content-registry'
import { VariantConfigSchema } from '@/lib/ab/types'
import { PAID_PAGE_CONFIGS, paidVariantId, type PaidPageSlug } from '@/lib/landing/page-configs'

const entries = Object.entries(PAID_PAGE_CONFIGS) as Array<[PaidPageSlug, (typeof PAID_PAGE_CONFIGS)[PaidPageSlug]]>

/**
 * A local port of the ad copy rules that apply to a page as well as an ad.
 * The number allowlist is deliberately not ported — a page may state a
 * competitor's published price, which an ad may not.
 */
const BANNED = [
  'leverage', 'synergy', 'paradigm', 'ecosystem', 'revolutionary', 'disruptive',
  'cutting-edge', 'state-of-the-art', 'best-in-class', 'world-class',
  'enterprise-grade', 'seamless', 'frictionless', 'holistic', 'empower',
  'solution', 'platform', 'stakeholders', 'facilitate', 'optimize', 'maximize',
  'robust',
]

/** Every string a visitor can read, with a path so a failure names itself. */
function strings(value: unknown, path = ''): Array<{ path: string; text: string }> {
  if (typeof value === 'string') return [{ path, text: value }]
  if (Array.isArray(value)) return value.flatMap((item, i) => strings(item, `${path}[${i}]`))
  if (value && typeof value === 'object')
    return Object.entries(value).flatMap(([key, item]) => strings(item, path ? `${path}.${key}` : key))
  return []
}

describe('paid landing page configs', () => {
  it.each(entries)('%s validates against the section schema', (_slug, config) => {
    expect(VariantConfigSchema.safeParse(config).success).toBe(true)
  })

  it.each(entries)('%s speaks in the OPS voice', (slug, config) => {
    for (const { path, text } of strings(config)) {
      const where = `${slug} ${path}: "${text}"`
      expect(text, where).not.toContain('!')
      expect(text, where).not.toMatch(/contractor/i)
      expect(text, where).not.toMatch(/^\s*AI\b/)
      // Emoji live outside the BMP; a surrogate-pair test needs no `u` flag.
      expect(text, where).not.toMatch(/[\uD83C-\uDBFF][\uDC00-\uDFFF]/)
      for (const word of BANNED)
        expect(text.toLowerCase(), `${where} — banned word "${word}"`).not.toMatch(
          new RegExp(`(^|[^a-z0-9-])${word}(?=$|[^a-z0-9-])`)
        )
    }
  })

  it.each(entries)('%s asks for exactly one thing', (slug, config) => {
    // One Hero and one ClosingCTA — the sticky bar repeats the same action, and
    // web-signup mode strips every secondary button.
    const types = config.sections.map((s) => s.type)
    expect(types.filter((t) => t === 'Hero'), slug).toHaveLength(1)
    expect(types.filter((t) => t === 'ClosingCTA'), slug).toHaveLength(1)
    // No section that offers a competing action.
    expect(types, slug).not.toContain('DesktopDownload')
    expect(types, slug).not.toContain('InlineSignupForm')
    // The hero leads, the price answers the next question early.
    expect(types[0], slug).toBe('Hero')
    expect(types.indexOf('PricingSection'), slug).toBeLessThanOrEqual(2)
    expect(types[types.length - 1], slug).toBe('ClosingCTA')
  })

  it.each(entries)('%s keeps its hero headline short enough to read at a glance', (slug, config) => {
    const hero = config.sections.find((s) => s.type === 'Hero')
    const headline = (hero?.props as { headline: string }).headline
    expect(headline, slug).toBe(headline.toUpperCase())
    expect(headline.split(/\s+/).length, `${slug}: "${headline}"`).toBeLessThanOrEqual(10)
  })

  it('names a competitor only on that competitor’s compare page', () => {
    for (const [slug, config] of entries) {
      const text = strings(config).map((s) => s.text).join(' ')
      for (const [brand, page] of [
        ['Jobber', 'compare/jobber'],
        ['Housecall Pro', 'compare/housecall-pro'],
        ['ServiceTitan', 'compare/servicetitan'],
      ] as const) {
        if (!text.includes(brand)) continue
        // The founder quote names all three at once, as his own history.
        const onlyInFounderQuote = config.sections
          .filter((s) => s.type !== 'FounderQuote')
          .every((s) => !strings(s).map((x) => x.text).join(' ').includes(brand))
        if (onlyInFounderQuote) continue
        expect(slug, `${brand} appears outside ${page}`).toBe(page)
      }
    }
  })

  it('contains no customer endorsements without an approved original source', () => {
    expect(Object.keys(APPROVED_TESTIMONIALS)).toHaveLength(0)
    for (const [slug, config] of entries)
      expect(config.sections.filter(section => section.type === 'TestimonialsSection'), slug).toHaveLength(0)
  })

  it('has a route file for every config, and a config for every route', () => {
    for (const [slug] of entries) {
      const page = readFileSync(`app/(paid)/${slug}/page.tsx`, 'utf8')
      expect(page, slug).toContain(`const SLUG = '${slug}' as const`)
      expect(page, slug).toContain('ctaMode="web-signup"')
      expect(page, slug).toContain(`https://try.opsapp.co/${slug}`)
    }
  })

  it('matches the dated ad-account fixture: every landing destination exists', () => {
    // The blueprint is the source of truth for which pages paid traffic hits.
    // A URL there with no page here is an ad pointing at a 404.
    const fixture = JSON.parse(readFileSync('tests/fixtures/paid-destinations.json', 'utf8')) as { urls: string[] }
    const urls = new Set(fixture.urls)
    const slugs = new Set(entries.map(([slug]) => `https://try.opsapp.co/${slug}`))
    for (const url of Array.from(urls)) {
      if (url === 'https://try.opsapp.co/') continue // the brand ad group lands on the home page
      expect(slugs.has(url), `${url} has no page in PAID_PAGE_CONFIGS`).toBe(true)
    }
    // And nothing here is a page no ad points at.
    for (const slug of Array.from(slugs))
      expect(urls.has(slug), `${slug} exists but no ad group sends traffic to it`).toBe(true)
  })

  it('reports each page under its own variant id', () => {
    expect(paidVariantId('compare/jobber')).toBe('paid:compare/jobber')
    expect(new Set(entries.map(([slug]) => paidVariantId(slug))).size).toBe(entries.length)
  })
})

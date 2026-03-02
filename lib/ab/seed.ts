// Run with: npx tsx lib/ab/seed.ts
import { createClient } from '@supabase/supabase-js'
import { SEED_CONFIG_A } from './seed-config'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function seed() {
  console.log('Seeding A/B system...')

  // Check if already seeded
  const { data: existing } = await supabase
    .from('ab_tests')
    .select('id')
    .eq('status', 'active')
    .single()

  if (existing) {
    console.log('Active test already exists:', existing.id)
    console.log('Nothing to do. Delete existing test rows to re-seed.')
    return
  }

  // Seed ab_config with brand context
  await supabase.from('ab_config').upsert({
    id: 1,
    brand_context: `OPS is a job and crew management app built specifically for small trades businesses (1-50 person crews). It is dead simple to use — field crews adopt it without training. Target customers are: plumbers, HVAC techs, landscapers, painters, and general contractors who are either using group texts + spreadsheets, or who tried tools like Jobber/ServiceTitan and found them too complex. OPS's value props: no training required, crew-first design, photo documentation, clean scheduling, direct access to the founder. Tone is direct, trades-oriented, no corporate fluff. Mohave font (uppercase headings), dark theme. Primary CTA is App Store download; secondary is "try it first" (web tutorial).`,
    min_visitors: 100,
    min_days: 7,
  })

  console.log('Updated ab_config')

  // Create variant A (current page — the control)
  const { data: varA, error: errA } = await supabase
    .from('ab_variants')
    .insert({
      slot: 'a',
      generation: 1,
      config: SEED_CONFIG_A,
      ai_reasoning: 'Seed variant A — current production landing page (control).',
    })
    .select('id')
    .single()

  if (errA || !varA) throw new Error(`Failed to create variant A: ${errA?.message}`)
  console.log('Created variant A:', varA.id)

  // Create variant B — challenger with punchier hero copy
  const varBConfig = {
    ...SEED_CONFIG_A,
    sections: [
      {
        type: 'Hero',
        props: {
          headline: 'RUN YOUR CREW. NOT YOUR PHONE.',
          subtext: 'One app. Every job. No chaos.',
          primaryCtaLabel: 'GET IT FREE',
          secondaryCtaLabel: 'SEE HOW IT WORKS',
        },
      },
      ...SEED_CONFIG_A.sections.slice(1),
    ],
  }

  const { data: varB, error: errB } = await supabase
    .from('ab_variants')
    .insert({
      slot: 'b',
      generation: 1,
      config: varBConfig,
      ai_reasoning: 'Seed variant B — challenger with shorter, punchier hero copy to test conciseness vs. explanation.',
    })
    .select('id')
    .single()

  if (errB || !varB) throw new Error(`Failed to create variant B: ${errB?.message}`)
  console.log('Created variant B:', varB.id)

  // Create the first test
  const { data: test, error: errT } = await supabase
    .from('ab_tests')
    .insert({
      status: 'active',
      variant_a_id: varA.id,
      variant_b_id: varB.id,
      min_visitors: 100,
      min_days: 7,
    })
    .select('id')
    .single()

  if (errT || !test) throw new Error(`Failed to create test: ${errT?.message}`)
  console.log('Created test:', test.id)

  // Back-fill test_id on variants
  await supabase.from('ab_variants').update({ test_id: test.id }).in('id', [varA.id, varB.id])

  console.log('Done. Seed complete.')
  console.log('\nVariant A ID:', varA.id)
  console.log('Variant B ID:', varB.id)
  console.log('Test ID:', test.id)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})

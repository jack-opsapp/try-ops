import { NextRequest, NextResponse } from 'next/server'
import { getABSupabase } from '@/lib/ab/supabase'
import { aggregateVariant } from '@/lib/ab/aggregator'
import { generateChallenger } from '@/lib/ab/generate'

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = req.headers.get('x-vercel-cron-secret')
  if (cronSecret && cronSecret === process.env.CRON_SECRET) return true
  const adminSecret = req.headers.get('x-ab-admin-secret')
  if (adminSecret && adminSecret === process.env.AB_ADMIN_SECRET) return true
  return false
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getABSupabase()

  const { data: test } = await supabase
    .from('ab_tests')
    .select('*')
    .eq('status', 'active')
    .single()

  if (!test) return NextResponse.json({ error: 'No active test' }, { status: 404 })

  // Check eligibility unless force=true
  const body = await req.json().catch(() => ({}))
  const force = body.force === true

  if (!force) {
    const daysSinceStart = (Date.now() - new Date(test.started_at).getTime()) / (1000 * 60 * 60 * 24)
    const { data: varA } = await supabase.from('ab_variants').select('visitor_count').eq('id', test.variant_a_id).single()
    const { data: varB } = await supabase.from('ab_variants').select('visitor_count').eq('id', test.variant_b_id).single()

    if (
      daysSinceStart < test.min_days ||
      (varA?.visitor_count ?? 0) < test.min_visitors ||
      (varB?.visitor_count ?? 0) < test.min_visitors
    ) {
      return NextResponse.json({ ok: false, reason: 'Threshold not met yet' })
    }
  }

  // Mark as rotating
  await supabase.from('ab_tests').update({ status: 'rotating' }).eq('id', test.id)

  try {
    const { data: varA } = await supabase.from('ab_variants').select('*').eq('id', test.variant_a_id).single()
    const { data: varB } = await supabase.from('ab_variants').select('*').eq('id', test.variant_b_id).single()
    if (!varA || !varB) throw new Error('Could not fetch variants')
    const winnerSlot: 'a' | 'b' = varA.conversion_rate >= varB.conversion_rate ? 'a' : 'b'
    const winner = winnerSlot === 'a' ? varA : varB
    const loser = winnerSlot === 'a' ? varB : varA

    // Close current test
    await supabase.from('ab_tests').update({
      status: 'completed',
      ended_at: new Date().toISOString(),
      winner_variant: winnerSlot,
    }).eq('id', test.id)

    // Aggregate for AI
    const [winnerSummary, loserSummary] = await Promise.all([
      aggregateVariant(winner.id),
      aggregateVariant(loser.id),
    ])

    const { data: config } = await supabase.from('ab_config').select('*').eq('id', 1).single()

    // Generate challenger
    const { config: challengerConfig, reasoning } = await generateChallenger({
      brandContext: config?.brand_context ?? '',
      winner: winnerSummary,
      loser: loserSummary,
    })

    // Create challenger variant
    const challengerSlot: 'a' | 'b' = winnerSlot === 'a' ? 'b' : 'a'
    const { data: newVariant } = await supabase
      .from('ab_variants')
      .insert({
        slot: challengerSlot,
        generation: loser.generation + 1,
        config: challengerConfig,
        ai_reasoning: reasoning,
        carried_from_variant_id: loser.id,
      })
      .select('id')
      .single()

    if (!newVariant) throw new Error('Failed to create challenger variant')

    const newVariantAId = winnerSlot === 'a' ? winner.id : newVariant.id
    const newVariantBId = winnerSlot === 'b' ? winner.id : newVariant.id

    const { data: newTest } = await supabase
      .from('ab_tests')
      .insert({
        status: 'active',
        variant_a_id: newVariantAId,
        variant_b_id: newVariantBId,
        min_visitors: config?.min_visitors ?? 100,
        min_days: config?.min_days ?? 7,
      })
      .select('id')
      .single()

    // Back-fill test_id on new variant
    if (newTest) {
      await supabase.from('ab_variants').update({ test_id: newTest.id }).eq('id', newVariant.id)
    }

    return NextResponse.json({
      ok: true,
      winnerSlot,
      challengerVariantId: newVariant.id,
      newTestId: newTest?.id,
    })
  } catch (err) {
    console.error('Rotation failed:', err)
    await supabase.from('ab_tests').update({ status: 'active' }).eq('id', test.id)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

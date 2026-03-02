import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Vercel authenticates cron requests with this header
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://try.opsapp.co'

  const rotateRes = await fetch(`${appUrl}/api/ab-rotate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-vercel-cron-secret': process.env.CRON_SECRET!,
    },
    body: JSON.stringify({}),
  })

  const result = await rotateRes.json() as { ok?: boolean; winnerSlot?: string; challengerVariantId?: string }
  console.log('[ab-cron] rotation result:', result)

  if (result.ok) {
    await notifyAdmin(result)
  }

  return NextResponse.json(result)
}

async function notifyAdmin(result: { winnerSlot?: string; challengerVariantId?: string }) {
  try {
    await fetch('https://app.opsapp.co/api/admin/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ab-admin-secret': process.env.AB_ADMIN_SECRET!,
      },
      body: JSON.stringify({
        subject: 'OPS A/B Test Rotated',
        body: `Winner: Variant ${result.winnerSlot?.toUpperCase()}. New challenger generated: ${result.challengerVariantId}`,
      }),
    })
  } catch {
    console.error('[ab-cron] Failed to send rotation notification')
  }
}

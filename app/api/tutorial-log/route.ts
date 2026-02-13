import { NextResponse } from 'next/server'

const BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BUBBLE_BASE_URL

export async function POST(request: Request) {
  try {
    const { stepDuration, totalTime, variant } = await request.json()

    if (!BUBBLE_BASE_URL) {
      console.error('Missing NEXT_PUBLIC_BUBBLE_BASE_URL')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const response = await fetch(
      `${BUBBLE_BASE_URL}/api/1.1/obj/TutorialLog`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stepDuration,
          totalTime,
          variant: variant || 'default',
          source: 'web_onboarding',
        }),
      }
    )

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      console.error('Bubble TutorialLog error:', response.status, data)
      return NextResponse.json(
        { error: 'Failed to log tutorial' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('Tutorial log error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

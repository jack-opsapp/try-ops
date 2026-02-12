import { NextResponse } from 'next/server'

const BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BUBBLE_BASE_URL

export async function POST(request: Request) {
  try {
    const { emails, company } = await request.json()

    if (!emails || !company) {
      return NextResponse.json(
        { error: 'Emails and company ID are required' },
        { status: 400 }
      )
    }

    if (!BUBBLE_BASE_URL) {
      console.error('Missing NEXT_PUBLIC_BUBBLE_BASE_URL')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Matches iOS OnboardingService.sendInvites exactly
    const response = await fetch(
      `${BUBBLE_BASE_URL}/api/1.1/wf/send_invite`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails,
          company,
        }),
      }
    )

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      const errorMessage =
        data?.body?.message ||
        data?.message ||
        'Failed to send invites'
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Invite error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

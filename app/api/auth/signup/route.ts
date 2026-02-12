import { NextResponse } from 'next/server'

const BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BUBBLE_BASE_URL

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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

    const response = await fetch(
      `${BUBBLE_BASE_URL}/api/1.1/wf/sign_company_up`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          signupPage: 'web_onboarding',
        }),
      }
    )

    const data = await response.json()

    // Handle 400 errors specifically (Bubble returns error messages here)
    if (response.status === 400) {
      const errorMessage =
        data?.body?.message ||
        data?.message ||
        data?.error_message ||
        'Signup failed. This email may already be registered.'
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    if (!response.ok) {
      const errorMessage =
        data?.body?.message ||
        data?.message ||
        data?.error_message ||
        'Signup failed'
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    // Handle multiple response shapes from Bubble
    // iOS checks: response.user_id, response.userId, direct user_id, direct userId
    const userId =
      data?.response?.user_id ||
      data?.response?.userId ||
      data?.user_id ||
      data?.userId

    if (!userId) {
      console.error('No user ID in signup response:', JSON.stringify(data))
      return NextResponse.json(
        { error: 'Account created but no user ID returned. Please try signing in.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      userId,
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

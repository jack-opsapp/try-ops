import { NextResponse } from 'next/server'

const BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BUBBLE_BASE_URL
const BUBBLE_API_TOKEN = process.env.BUBBLE_API_TOKEN

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${BUBBLE_BASE_URL}/api/1.1/wf/sign_company_up`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BUBBLE_API_TOKEN}`,
        },
        body: JSON.stringify({
          email,
          password,
          signupPage: 'web_onboarding',
        }),
      }
    )

    const data = await response.json()

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
    const userId =
      data?.response?.user_id ||
      data?.response?.userId ||
      data?.user_id ||
      data?.userId

    return NextResponse.json({
      success: true,
      userId,
      data,
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

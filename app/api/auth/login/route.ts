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

    // iOS AuthManager.signIn uses /api/1.1/wf/generate-api-token
    const response = await fetch(
      `${BUBBLE_BASE_URL}/api/1.1/wf/generate-api-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }
    )

    const data = await response.json()

    if (response.status === 401 || response.status === 403) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    if (!response.ok) {
      const errorMessage =
        data?.body?.message ||
        data?.message ||
        data?.error_message ||
        'Login failed'
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    // iOS response: { status: "success", response: { token, user_id, expires } }
    const userId =
      data?.response?.user_id ||
      data?.response?.userId ||
      data?.user_id ||
      data?.userId

    if (!userId) {
      console.error('No user ID in login response:', JSON.stringify(data))
      return NextResponse.json(
        { error: 'Login succeeded but no user ID returned.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      userId,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

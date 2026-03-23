import { NextResponse } from 'next/server'

const BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BUBBLE_BASE_URL

export async function POST(request: Request) {
  try {
    const {
      identity_token,
      user_identifier,
      email,
      given_name,
      family_name,
    } = await request.json()

    if (!identity_token) {
      return NextResponse.json(
        { error: 'Apple identity token is required' },
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

    // Matches iOS AuthManager.signInWithApple exactly
    // Sends: identity_token, user_identifier, optional email, given_name, family_name
    const payload: Record<string, string> = {
      identity_token,
      user_identifier,
    }
    if (email) payload.email = email
    if (given_name) payload.given_name = given_name
    if (family_name) payload.family_name = family_name

    const response = await fetch(
      `${BUBBLE_BASE_URL}/api/1.1/wf/login_apple`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        data?.body?.message ||
        data?.message ||
        data?.error_message ||
        'Apple login failed'
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    // iOS response format: { status: "success", response: { user: UserDTO } }
    const user =
      data?.response?.user ||
      data?.user

    const userId =
      user?._id ||
      user?.id ||
      data?.response?.user_id ||
      data?.user_id

    if (!userId) {
      console.error('No user ID in Apple login response:', JSON.stringify(data))
      return NextResponse.json(
        { error: 'Apple login succeeded but no user ID returned' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      userId,
      firstName: user?.nameFirst || given_name || '',
      lastName: user?.nameLast || family_name || '',
      email: user?.email || email || '',
    })
  } catch (error) {
    console.error('Apple login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

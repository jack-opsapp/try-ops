import { NextResponse } from 'next/server'

const BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BUBBLE_BASE_URL

export async function POST(request: Request) {
  try {
    const { id_token, email, name, given_name, family_name } =
      await request.json()

    if (!id_token) {
      return NextResponse.json(
        { error: 'Google ID token is required' },
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

    // Matches iOS AuthManager.signInWithGoogle exactly
    // Sends: id_token, email, name, optional given_name, family_name
    const payload: Record<string, string> = {
      id_token,
      email,
      name,
    }
    if (given_name) payload.given_name = given_name
    if (family_name) payload.family_name = family_name

    const response = await fetch(
      `${BUBBLE_BASE_URL}/api/1.1/wf/login_google`,
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
        'Google login failed'
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    // iOS tries two response formats:
    // 1. { status: "success", response: { user: UserDTO, company?: CompanyDTO } }
    // 2. { user: UserDTO, company?: CompanyDTO }
    const user =
      data?.response?.user ||
      data?.user

    const userId =
      user?._id ||
      user?.id ||
      data?.response?.user_id ||
      data?.user_id

    const company =
      data?.response?.company ||
      data?.company

    if (!userId) {
      console.error('No user ID in Google login response:', JSON.stringify(data))
      return NextResponse.json(
        { error: 'Google login succeeded but no user ID returned' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      userId,
      firstName: user?.nameFirst || user?.given_name || given_name || '',
      lastName: user?.nameLast || user?.family_name || family_name || '',
      email: user?.email || email,
      companyId: company?._id || company?.id || null,
    })
  } catch (error) {
    console.error('Google login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'

const BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BUBBLE_BASE_URL
const BUBBLE_API_TOKEN = process.env.BUBBLE_API_TOKEN

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

    const response = await fetch(
      `${BUBBLE_BASE_URL}/api/1.1/wf/login_apple`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BUBBLE_API_TOKEN}`,
        },
        body: JSON.stringify({
          identity_token,
          user_identifier,
          email,
          given_name,
          family_name,
        }),
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

    const userId =
      data?.response?.user?._id ||
      data?.response?.user_id ||
      data?.user?._id ||
      data?.user_id

    return NextResponse.json({
      success: true,
      userId,
      user: data?.response?.user || data?.user,
      data,
    })
  } catch (error) {
    console.error('Apple login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

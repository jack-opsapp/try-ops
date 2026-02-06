import { NextResponse } from 'next/server'

const BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BUBBLE_BASE_URL
const BUBBLE_API_TOKEN = process.env.BUBBLE_API_TOKEN

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.user) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${BUBBLE_BASE_URL}/api/1.1/wf/update_company`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BUBBLE_API_TOKEN}`,
        },
        body: JSON.stringify(body),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        data?.body?.message ||
        data?.message ||
        data?.error_message ||
        'Failed to update company'
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    // Handle multiple response shapes
    const companyId =
      data?.response?.company?._id ||
      data?.response?.company?.companyID ||
      data?.company?._id ||
      data?.company?.companyID

    const companyCode =
      data?.response?.company?.companyID ||
      data?.company?.companyID

    return NextResponse.json({
      success: true,
      companyId,
      companyCode,
      data,
    })
  } catch (error) {
    console.error('Company update error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

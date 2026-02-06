import { NextResponse } from 'next/server'

const BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BUBBLE_BASE_URL
const BUBBLE_API_TOKEN = process.env.BUBBLE_API_TOKEN

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    const body = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${BUBBLE_BASE_URL}/api/1.1/obj/user/${userId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BUBBLE_API_TOKEN}`,
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      const errorMessage =
        data?.body?.message ||
        data?.message ||
        'Failed to update user'
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

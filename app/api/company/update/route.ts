import { NextResponse } from 'next/server'

const BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BUBBLE_BASE_URL

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.user) {
      return NextResponse.json(
        { error: 'User ID is required' },
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

    // Build the payload matching iOS OnboardingService.updateCompany exactly
    // iOS sends: name, email, industry, size, age, address, user, name_first, name_last, user_phone
    // Optional: phone, company_id (if updating existing)
    const payload: Record<string, string> = {
      name: body.name || '',
      email: body.email || '',
      industry: body.industry || '',
      size: body.size || '',
      age: body.age || '',
      address: body.address || '', // iOS always sends this, even if empty
      user: body.user,
      name_first: body.name_first || '',
      name_last: body.name_last || '',
      user_phone: body.user_phone || '',
    }

    // Optional fields
    if (body.phone) {
      payload.phone = body.phone
    }
    if (body.company_id) {
      payload.company_id = body.company_id
    }

    const response = await fetch(
      `${BUBBLE_BASE_URL}/api/1.1/wf/update_company`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      const errorMessage =
        data?.body?.message ||
        data?.message ||
        data?.error_message ||
        'Failed to update company'
      console.error('Company update failed:', response.status, JSON.stringify(data))
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Match iOS CompanyUpdateResponse's complex extraction logic
    // Try new format: data.response.company._id / data.response.company.companyId
    // Try old format: data.company._id / data.company.companyId
    // Try flat format: data.company (string ID) / data.company_id / data._id

    let companyId: string | null = null
    let companyCode: string | null = null

    // New format: nested under response.company
    if (data?.response?.company) {
      const company = data.response.company
      companyId = company._id || company.id || null
      companyCode = company.companyId || company.code || companyId
    }
    // Old format: nested under company object
    else if (data?.company && typeof data.company === 'object') {
      companyId = data.company._id || data.company.id || null
      companyCode = data.company.companyId || data.company.code || companyId
    }
    // Flat format: company is a string ID
    else if (data?.company && typeof data.company === 'string') {
      companyId = data.company
      companyCode = data.company_code || data.companyId || companyId
    }
    // Fallback: try root-level fields
    else {
      companyId = data?.company_id || data?._id || null
      companyCode = data?.company_code || data?.companyId || companyId
    }

    if (!companyId) {
      console.error('No company ID in response:', JSON.stringify(data))
    }

    return NextResponse.json({
      success: true,
      companyId,
      companyCode,
    })
  } catch (error) {
    console.error('Company update error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

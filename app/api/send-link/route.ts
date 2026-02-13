import { NextResponse } from 'next/server'

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

const APP_STORE_URL = 'https://apps.apple.com/app/ops-app/id6503204873'

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('Missing Twilio env vars:', {
        hasSid: !!TWILIO_ACCOUNT_SID,
        hasToken: !!TWILIO_AUTH_TOKEN,
        hasPhone: !!TWILIO_PHONE_NUMBER,
      })
      return NextResponse.json(
        { error: 'Server configuration error', detail: 'Missing Twilio credentials' },
        { status: 500 }
      )
    }

    const normalized = normalizePhone(phone || '')
    if (!normalized) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: normalized,
          From: TWILIO_PHONE_NUMBER,
          Body: `Download OPS for your crew: ${APP_STORE_URL}\n\nReply STOP to opt out.`,
        }).toString(),
      }
    )

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      console.error('Twilio SMS error:', response.status, data)
      return NextResponse.json(
        { error: 'Failed to send text', detail: data?.message || data?.error_message || JSON.stringify(data) },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send link error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred', detail: String(error) },
      { status: 500 }
    )
  }
}

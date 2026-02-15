import { NextResponse } from 'next/server'

const BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BUBBLE_BASE_URL
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

const APP_STORE_URL = 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078'

function isEmail(value: string): boolean {
  return /^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,64}$/.test(value)
}

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

async function sendSMS(
  to: string,
  body: string,
  mediaUrl?: string
): Promise<{ ok: boolean; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    return { ok: false, error: 'Twilio not configured' }
  }

  const params: Record<string, string> = {
    To: to,
    From: TWILIO_PHONE_NUMBER,
    Body: body,
  }
  if (mediaUrl) {
    params.MediaUrl = mediaUrl
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params).toString(),
    }
  )

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    return { ok: false, error: data?.message || `Twilio error ${response.status}` }
  }
  return { ok: true }
}

async function sendEmailInvites(
  emails: string[],
  company: string,
  logoUrl: string
): Promise<{ ok: boolean; error?: string }> {
  if (!BUBBLE_BASE_URL) {
    return { ok: false, error: 'Bubble not configured' }
  }

  const response = await fetch(`${BUBBLE_BASE_URL}/api/1.1/wf/send_invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emails, company, logoUrl }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    return { ok: false, error: data?.body?.message || data?.message || 'Failed to send email invites' }
  }
  return { ok: true }
}

export async function POST(request: Request) {
  try {
    const { contacts, company, companyName, companyCode } = await request.json()

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'At least one contact is required' }, { status: 400 })
    }
    if (!company || !companyCode) {
      return NextResponse.json({ error: 'Company info is required' }, { status: 400 })
    }

    // Derive public logo URL from the request origin
    const origin = new URL(request.url).origin
    const logoUrl = `${origin}/images/ops-logo-white.png`

    const emails: string[] = []
    const phones: string[] = []
    const errors: string[] = []

    for (const contact of contacts) {
      const value = (contact as string).trim()
      if (!value) continue
      if (isEmail(value)) {
        emails.push(value)
      } else {
        const normalized = normalizePhone(value)
        if (normalized) {
          phones.push(normalized)
        } else {
          errors.push(`Invalid: ${value}`)
        }
      }
    }

    const results: { emailsSent: number; smsSent: number; errors: string[] } = {
      emailsSent: 0,
      smsSent: 0,
      errors,
    }

    // Send email invites via Bubble (with logo URL)
    if (emails.length > 0) {
      const emailResult = await sendEmailInvites(emails, company, logoUrl)
      if (emailResult.ok) {
        results.emailsSent = emails.length
      } else {
        results.errors.push(`Email error: ${emailResult.error}`)
      }
    }

    // Send SMS invites via Twilio
    // Message 1: Invite with OPS logo (MMS)
    const smsBody = `${companyName || 'Your company'} added you to OPS.\n\nDownload the app: ${APP_STORE_URL}\n\nReply STOP to opt out.`

    for (const phone of phones) {
      // First message: invite text + logo
      const smsResult = await sendSMS(phone, smsBody, logoUrl)
      if (smsResult.ok) {
        // Second message: crew code only (easy to copy)
        const codeResult = await sendSMS(phone, companyCode)
        if (!codeResult.ok) {
          results.errors.push(`Code SMS to ${phone}: ${codeResult.error}`)
        }
        results.smsSent++
      } else {
        results.errors.push(`SMS to ${phone}: ${smsResult.error}`)
      }
    }

    const totalSent = results.emailsSent + results.smsSent
    if (totalSent === 0 && results.errors.length > 0) {
      return NextResponse.json(
        { error: 'Failed to send invites', detail: results.errors.join('; ') },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      emailsSent: results.emailsSent,
      smsSent: results.smsSent,
      errors: results.errors,
    })
  } catch (error) {
    console.error('Invite send error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred', detail: String(error) },
      { status: 500 }
    )
  }
}

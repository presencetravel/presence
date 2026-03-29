import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(req: NextRequest) {
  try {
    const { travelerName, travelerPhone, gameDate, tripLink } = await req.json()

    if (!travelerName || !travelerPhone || !gameDate || !tripLink) {
      return NextResponse.json(
        { error: 'missing required fields' },
        { status: 400 }
      )
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromPhone = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !fromPhone) {
      return NextResponse.json(
        { error: 'sms service not configured' },
        { status: 500 }
      )
    }

    const client = twilio(accountSid, authToken)

    const message = `hey ${travelerName}! you've been booked on a flight for a game on ${gameDate}. tap to confirm your details and you're all set. ${tripLink}`

    await client.messages.create({
      body: message,
      from: fromPhone,
      to: travelerPhone,
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'failed to send sms'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
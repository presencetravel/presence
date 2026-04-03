import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(req: NextRequest) {
  try {
    const { travelerName, travelerPhone, tripDate, tripLink, mode } = await req.json()

    if (!travelerName || !travelerPhone || !tripDate || !tripLink) {
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

    // different message depending on which flow triggered the sms
    const message = mode === 'book'
      ? `hey ${travelerName}! you've been booked on a flight for a trip on ${tripDate}. tap the link to enter your travel info — it only takes a minute. ${tripLink}`
      : `hey ${travelerName}! someone wants to fly you out for a trip on ${tripDate}. tap the link to pick your flight — it only takes a minute. ${tripLink}`

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
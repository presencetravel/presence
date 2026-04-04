'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Elements, CardElement, useStripe, useElements, PaymentRequestButtonElement } from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type TripRequest = {
  id: string
  traveler_name: string
  traveler_phone: string
  trip_date: string
  status: string
  selected_offer_id: string
  selected_offer_data: {
    id: string
    airline: string
    type: string
    duration: string
    price: number
  }
  total_amount: number
  traveler_info: {
    full_name: string
    date_of_birth: string
    id_type: string
    id_number: string
  } | null
}

function PaymentSheet({
  trip,
  livePrice,
  insurance,
  onClose,
  onSuccess,
}: {
  trip: TripRequest
  livePrice: number
  insurance: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentRequest, setPaymentRequest] = useState<any>(null)

  const fee = Math.round(livePrice * 0.08 * 100) / 100
  const ins = insurance ? 12 : 0
  const total = livePrice + fee + ins

  useEffect(() => {
    if (!stripe) return
    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'presence booking',
        amount: Math.round(total * 100),
      },
      requestPayerName: false,
      requestPayerEmail: false,
    })
    pr.canMakePayment().then(result => {
      if (result) setPaymentRequest(pr)
    })
    pr.on('paymentmethod', async (e) => {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightPrice: livePrice, includeInsurance: insurance }),
      })
      const { clientSecret, error: apiError } = await res.json()
      if (apiError) { e.complete('fail'); setError(apiError); return }
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: e.paymentMethod.id },
        { handleActions: false }
      )
      if (confirmError) { e.complete('fail'); setError(confirmError.message || 'payment failed'); return }
      e.complete('success')
      if (paymentIntent!.status === 'requires_action') {
        await stripe.confirmCardPayment(clientSecret)
      }
      onSuccess()
    })
  }, [stripe, total, livePrice, insurance, onSuccess])

  const handleCardPay = async () => {
    if (!stripe || !elements) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightPrice: livePrice, includeInsurance: insurance }),
      })
      const { clientSecret, error: apiError } = await res.json()
      if (apiError) { setError(apiError); setLoading(false); return }
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) return
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      })
      if (confirmError) {
        setError(confirmError.message || 'payment failed')
      } else if (paymentIntent!.status === 'succeeded') {
        onSuccess()
      }
    } catch {
      setError('something went wrong. please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: '#161616', borderRadius: '20px 20px 0 0', padding: '16px', width: '100%', maxWidth: '390px' }}>
        <div style={{ width: '32px', height: '3px', background: 'rgba(255,255,255,0.15)', borderRadius: '100px', margin: '0 auto 16px' }} />
        <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff', marginBottom: '14px' }}>confirm and pay</div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>flight</span>
            <span style={{ fontSize: '11px', color: '#fff' }}>${livePrice.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>convenience fee (8%)</span>
            <span style={{ fontSize: '11px', color: '#fff' }}>${fee.toFixed(2)}</span>
          </div>
          {insurance && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>trip insurance</span>
              <span style={{ fontSize: '11px', color: '#fff' }}>$12.00</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 0' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#fff' }}>total</span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>${total.toFixed(2)}</span>
          </div>
        </div>

        {paymentRequest && (
          <div style={{ marginBottom: '10px' }}>
            <PaymentRequestButtonElement
              options={{
                paymentRequest,
                style: { paymentRequestButton: { type: 'default', theme: 'dark', height: '44px' } },
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>or pay with card</span>
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.08)' }} />
            </div>
          </div>
        )}

        <div style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '11px', padding: '12px', marginBottom: '12px' }}>
          <CardElement options={{
            style: {
              base: { fontSize: '13px', color: '#fff', '::placeholder': { color: 'rgba(255,255,255,0.3)' }, backgroundColor: 'transparent' },
              invalid: { color: '#FF3B30' },
            },
          }} />
        </div>

        {error && <div style={{ fontSize: '11px', color: '#FF3B30', marginBottom: '10px' }}>{error}</div>}

        <button
          onClick={handleCardPay}
          disabled={loading}
          style={{ width: '100%', background: loading ? 'rgba(26,110,255,0.5)' : '#1A6EFF', color: '#fff', border: 'none', padding: '13px', borderRadius: '100px', fontSize: '13px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '8px' }}
        >
          {loading ? 'processing...' : `pay $${total.toFixed(2)}`}
        </button>
        <button
          onClick={onClose}
          style={{ width: '100%', background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '0.5px solid rgba(255,255,255,0.1)', padding: '11px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer' }}
        >
          cancel
        </button>
      </div>
    </div>
  )
}

function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [trip, setTrip] = useState<TripRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [livePrice, setLivePrice] = useState<number | null>(null)
  const [priceChanged, setPriceChanged] = useState(false)
  const [checkingPrice, setCheckingPrice] = useState(false)
  const [insurance] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [declining, setDeclining] = useState(false)

  useEffect(() => {
    const fetchTrip = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data, error } = await supabase
        .from('trip_requests')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setError('trip not found.')
        setLoading(false)
        return
      }

      if (data.status !== 'traveler_submitted') {
        setError('this trip is not ready for review.')
        setLoading(false)
        return
      }

      setTrip(data)
      setLivePrice(data.selected_offer_data?.price ?? data.total_amount)
      setLoading(false)
    }

    if (id) fetchTrip()
  }, [id, router])

  const refreshPrice = useCallback(async () => {
    if (!trip) return
    setCheckingPrice(true)
    try {
      const res = await fetch('/api/search-flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: trip.selected_offer_data?.airline ?? 'ATL',
          destination: 'RDU',
          date: trip.trip_date,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.offers?.length) { setCheckingPrice(false); return }

      const match = data.offers.find((o: any) => o.id === trip.selected_offer_id)
      const freshOffer = match ?? data.offers[0]
      const freshPrice = parseFloat(freshOffer.total_amount)

      const originalPrice = trip.selected_offer_data?.price ?? trip.total_amount
      if (Math.abs(freshPrice - originalPrice) > 0.01) {
        setPriceChanged(true)
        setLivePrice(freshPrice)
      }
    } catch {
      // silently fail — don't block payment
    }
    setCheckingPrice(false)
  }, [trip])

  const handleConfirmAndPay = async () => {
    await refreshPrice()
    setShowPayment(true)
  }

  const handleDecline = async () => {
    if (!trip) return
    setDeclining(true)
    await supabase
      .from('trip_requests')
      .update({ status: 'declined' })
      .eq('id', trip.id)
    router.push('/travel')
  }

  const handlePaymentSuccess = async () => {
    if (!trip) return
    await supabase
      .from('trip_requests')
      .update({
        status: 'athlete_confirmed',
        total_amount: livePrice! + Math.round((livePrice! * 0.08) * 100) / 100 + (insurance ? 12 : 0)
      })
      .eq('id', trip.id)
    router.push('/confirm')
  }

  if (loading) {
    return (
      <main style={{ backgroundColor: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#555', fontSize: '13px' }}>loading...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main style={{ backgroundColor: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <p style={{ color: '#ff4444', fontSize: '13px', textAlign: 'center' }}>{error}</p>
      </main>
    )
  }

  if (!trip) return null

  const offer = trip.selected_offer_data
  const price = livePrice ?? offer?.price ?? 0
  const fee = Math.round(price * 0.08 * 100) / 100
  const ins = insurance ? 12 : 0
  const total = price + fee + ins

  return (
    <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '390px', minHeight: '100vh', background: '#080808', padding: '16px 16px 100px', position: 'relative' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <div onClick={() => router.back()} style={{ width: '26px', height: '26px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>←</div>
          <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>review trip</h3>
        </div>

        {priceChanged && (
          <div style={{ background: 'rgba(255,180,0,0.08)', border: '0.5px solid rgba(255,180,0,0.3)', borderRadius: '11px', padding: '10px 14px', marginBottom: '14px' }}>
            <p style={{ color: '#FFB400', fontSize: '11px', margin: 0, lineHeight: 1.5 }}>
              the price has changed. the updated amount is shown below.
            </p>
          </div>
        )}

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '11px', padding: '10px 14px', marginBottom: '16px' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0, lineHeight: 1.5 }}>
            flight prices change fast. confirm quickly to lock in this price.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '11px', padding: '14px', marginBottom: '10px' }}>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', marginBottom: '6px' }}>traveler</div>
          <div style={{ fontSize: '15px', fontWeight: 500, color: '#fff', marginBottom: '2px' }}>{trip.traveler_name.toLowerCase()}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{trip.trip_date}</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '11px', padding: '14px', marginBottom: '10px' }}>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', marginBottom: '6px' }}>flight</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff', marginBottom: '3px' }}>{offer?.airline ?? '—'}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{offer?.type ?? '—'} · {offer?.duration ?? '—'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '18px', fontWeight: 600, color: priceChanged ? '#FFB400' : '#1A6EFF' }}>${price.toFixed(2)}</div>
              {priceChanged && <div style={{ fontSize: '9px', color: '#FFB400', marginTop: '2px' }}>updated</div>}
            </div>
          </div>
        </div>

        {trip.traveler_info && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '11px', padding: '14px', marginBottom: '10px' }}>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', marginBottom: '8px' }}>traveler info</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>full name</span>
                <span style={{ fontSize: '11px', color: '#fff' }}>{trip.traveler_info.full_name.toLowerCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>date of birth</span>
                <span style={{ fontSize: '11px', color: '#fff' }}>{trip.traveler_info.date_of_birth}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{trip.traveler_info.id_type === 'passport' ? 'passport' : 'government id'}</span>
                <span style={{ fontSize: '11px', color: '#fff' }}>{trip.traveler_info.id_number}</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)', padding: '12px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>flight</span>
            <span style={{ fontSize: '11px', color: '#fff' }}>${price.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>convenience fee (8%)</span>
            <span style={{ fontSize: '11px', color: '#fff' }}>${fee.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>trip insurance</span>
            <span style={{ fontSize: '11px', color: '#fff' }}>${ins.toFixed(2)}</span>
          </div>
          <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)', marginTop: '6px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#fff' }}>total</span>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>${total.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
          <button
            onClick={handleConfirmAndPay}
            disabled={checkingPrice}
            style={{ width: '100%', background: checkingPrice ? 'rgba(26,110,255,0.5)' : '#1A6EFF', color: '#fff', border: 'none', padding: '14px', borderRadius: '100px', fontSize: '13px', fontWeight: 500, cursor: checkingPrice ? 'not-allowed' : 'pointer' }}
          >
            {checkingPrice ? 'checking price...' : 'confirm and pay'}
          </button>
          <button
            onClick={handleDecline}
            disabled={declining}
            style={{ width: '100%', background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '0.5px solid rgba(255,255,255,0.1)', padding: '13px', borderRadius: '100px', fontSize: '13px', cursor: declining ? 'not-allowed' : 'pointer' }}
          >
            {declining ? 'declining...' : 'decline'}
          </button>
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '390px', display: 'flex', borderTop: '0.5px solid rgba(255,255,255,0.07)', background: '#080808', padding: '10px 0 6px' }}>
          {['home', 'travel', 'profile'].map(t => (
            <div key={t} onClick={() => router.push(`/${t}`)} style={{ flex: 1, textAlign: 'center', fontSize: '9px', color: 'rgba(255,255,255,0.25)', cursor: 'pointer' }}>{t}</div>
          ))}
        </div>

        {showPayment && (
          <Elements stripe={stripePromise}>
            <PaymentSheet
              trip={trip}
              livePrice={price}
              insurance={insurance}
              onClose={() => setShowPayment(false)}
              onSuccess={handlePaymentSuccess}
            />
          </Elements>
        )}

      </div>
    </div>
  )
}

export default function ReviewPageWrapper() {
  return <ReviewPage />
}
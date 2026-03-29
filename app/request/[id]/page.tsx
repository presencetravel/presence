'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#111111',
  border: '1px solid #1e1e1e',
  borderRadius: '11px',
  padding: '16px',
  color: '#ffffff',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

type Flight = {
  id: string
  airline: string
  type: string
  duration: string
  price: number
  badge?: string
}

type TripRequest = {
  id: string
  traveler_name: string
  trip_date: string
  status: string
}

export default function RequestPage() {
  const params = useParams()
  const id = params.id as string

  const [tripRequest, setTripRequest] = useState<TripRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [fromCity, setFromCity] = useState('ATL')
  const [fromSearch, setFromSearch] = useState('')
  const [showFromSearch, setShowFromSearch] = useState(false)

  const [flights, setFlights] = useState<Flight[]>([])
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const airports = [
    {c:'ATL',n:'atlanta'},{c:'AUS',n:'austin'},{c:'BNA',n:'nashville'},{c:'BOS',n:'boston'},
    {c:'CLT',n:'charlotte'},{c:'DCA',n:'washington reagan'},{c:'DEN',n:'denver'},{c:'DFW',n:'dallas fort worth'},
    {c:'DTW',n:'detroit'},{c:'EWR',n:'newark'},{c:'FLL',n:'fort lauderdale'},{c:'IAH',n:'houston'},
    {c:'JFK',n:'new york jfk'},{c:'LAS',n:'las vegas'},{c:'LAX',n:'los angeles'},{c:'LGA',n:'new york laguardia'},
    {c:'MCO',n:'orlando'},{c:'MIA',n:'miami'},{c:'MSP',n:'minneapolis'},{c:'MSY',n:'new orleans'},
    {c:'ORD',n:"chicago o'hare"},{c:'PDX',n:'portland'},{c:'PHL',n:'philadelphia'},{c:'PHX',n:'phoenix'},
    {c:'RDU',n:'raleigh-durham'},{c:'SEA',n:'seattle'},{c:'SFO',n:'san francisco'},{c:'SLC',n:'salt lake city'},
    {c:'STL',n:'st louis'},{c:'TPA',n:'tampa'},
  ]

  const filteredAirports = airports.filter(a =>
    a.n.includes(fromSearch.toLowerCase()) ||
    a.c.toLowerCase().includes(fromSearch.toLowerCase())
  ).slice(0, 4)

  // load trip request
  useEffect(() => {
    const fetchTrip = async () => {
      const { data, error } = await supabase
        .from('trip_requests')
        .select('id, traveler_name, trip_date, status')
        .eq('id', id)
        .single()

      if (error || !data) {
        setError('this link is invalid or has expired.')
        setLoading(false)
        return
      }

      if (data.status === 'traveler_submitted') {
        setSubmitted(true)
      }

      setTripRequest(data)
      setLoading(false)
    }

    if (id) fetchTrip()
  }, [id])

  const searchFlights = async () => {
    if (!tripRequest) return
    setSearching(true)
    setSearchError('')
    setFlights([])
    setSelectedFlight(null)

    try {
      const res = await fetch('/api/search-flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: fromCity,
          destination: 'RDU', // placeholder — will be dynamic later
          date: tripRequest.trip_date,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSearchError(data.error || 'could not find flights. try again.')
        return
      }
      const mapped: Flight[] = data.offers.map((offer: any, i: number) => {
        const slice = offer.slices[0]
        const segment = slice.segments[0]
        const price = parseFloat(offer.total_amount)
        const durationStr = slice.duration || ''
        const hoursMatch = durationStr.match(/(\d+)H/)
        const minsMatch = durationStr.match(/(\d+)M/)
        const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0
        const mins = minsMatch ? parseInt(minsMatch[1]) : 0
        const stops = slice.segments.length - 1
        return {
          id: offer.id,
          airline: segment.marketing_carrier?.name?.toLowerCase() || 'unknown',
          type: stops === 0 ? 'nonstop' : `${stops} stop`,
          duration: `${hours}h ${mins}m`,
          price,
          badge: i === 0 ? 'best value' : undefined,
        }
      })
      setFlights(mapped)
      if (mapped.length > 0) setSelectedFlight(mapped[0])
    } catch {
      setSearchError('network error. please try again.')
    } finally {
      setSearching(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedFlight || !tripRequest) return
    setSubmitting(true)

    const fee = Math.round(selectedFlight.price * 0.08 * 100) / 100
    const insurance = 12
    const total = selectedFlight.price + fee + insurance

    const { error } = await supabase
      .from('trip_requests')
      .update({
        status: 'traveler_submitted',
        selected_offer_id: selectedFlight.id,
        selected_offer_data: selectedFlight,
        total_amount: total,
      })
      .eq('id', tripRequest.id)

    if (error) {
      setSearchError('could not submit your selection. please try again.')
      setSubmitting(false)
      return
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  const fee = selectedFlight ? Math.round(selectedFlight.price * 0.08 * 100) / 100 : 0
  const total = selectedFlight ? selectedFlight.price + fee + 12 : 0

  // loading state
  if (loading) {
    return (
      <main style={{ backgroundColor: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#555', fontSize: '13px' }}>loading...</p>
      </main>
    )
  }

  // error state
  if (error) {
    return (
      <main style={{ backgroundColor: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <p style={{ color: '#ff4444', fontSize: '13px', textAlign: 'center' }}>{error}</p>
      </main>
    )
  }

  // success state
  if (submitted) {
    return (
      <main style={{ backgroundColor: '#080808', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', maxWidth: '390px', margin: '0 auto' }}>
        <p style={{ color: '#1A6EFF', fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', margin: '0 0 16px' }}>presence</p>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, textAlign: 'center', margin: '0 0 12px', lineHeight: 1.2 }}>you're all set</h1>
        <p style={{ color: '#555', fontSize: '14px', textAlign: 'center', lineHeight: 1.6 }}>your flight selection has been sent. once confirmed, you'll get a text with your booking details.</p>
      </main>
    )
  }

  return (
    <main style={{ backgroundColor: '#080808', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '40px 20px 60px', maxWidth: '390px', margin: '0 auto', boxSizing: 'border-box' }}>

      {/* header */}
      <p style={{ color: '#1A6EFF', fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', margin: '0 0 8px' }}>presence</p>
      <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, margin: '0 0 6px', lineHeight: 1.2 }}>
        hey {tripRequest?.traveler_name.split(' ')[0].toLowerCase()},
      </h1>
      <p style={{ color: '#555', fontSize: '14px', margin: '0 0 32px', lineHeight: 1.6 }}>
        pick your flight and you're done. someone's got it from here.
      </p>

      {/* from airport */}
      <div style={{ marginBottom: '12px' }}>
        <p style={{ color: '#555', fontSize: '11px', letterSpacing: '0.06em', margin: '0 0 6px' }}>flying from</p>
        <div
          onClick={() => setShowFromSearch(!showFromSearch)}
          style={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '11px', padding: '14px 16px', cursor: 'pointer' }}
        >
          <p style={{ color: '#fff', fontSize: '15px', fontWeight: 500, margin: 0 }}>{fromCity}</p>
        </div>
        {showFromSearch && (
          <div style={{ marginTop: '4px' }}>
            <input
              value={fromSearch}
              onChange={e => setFromSearch(e.target.value)}
              placeholder="search airport..."
              autoFocus
              style={{ ...inputStyle, border: '1px solid #1A6EFF', marginBottom: '2px' }}
            />
            {filteredAirports.map(a => (
              <div
                key={a.c}
                onClick={() => { setFromCity(a.c); setShowFromSearch(false); setFromSearch('') }}
                style={{ padding: '10px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', backgroundColor: '#141414', borderBottom: '0.5px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
              >
                <span>{a.n}</span>
                <span style={{ color: '#1A6EFF', fontWeight: 500 }}>{a.c}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* search button */}
      <button
        onClick={searchFlights}
        disabled={searching}
        style={{ width: '100%', backgroundColor: searching ? '#0f3d99' : '#1A6EFF', color: '#fff', border: 'none', borderRadius: '11px', padding: '14px', fontSize: '13px', fontWeight: 600, cursor: searching ? 'not-allowed' : 'pointer', marginBottom: '16px' }}
      >
        {searching ? 'searching...' : 'find flights'}
      </button>

      {searchError && <p style={{ color: '#ff4444', fontSize: '12px', marginBottom: '12px' }}>{searchError}</p>}

      {/* flight results */}
      {flights.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ color: '#555', fontSize: '11px', letterSpacing: '0.06em', margin: '0 0 8px' }}>select a flight</p>
          {flights.map(f => (
            <div
              key={f.id}
              onClick={() => setSelectedFlight(f)}
              style={{ backgroundColor: selectedFlight?.id === f.id ? 'rgba(26,110,255,0.07)' : '#111', border: `1px solid ${selectedFlight?.id === f.id ? '#1A6EFF' : '#1e1e1e'}`, borderRadius: '11px', padding: '14px 16px', marginBottom: '8px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: '#fff', fontSize: '13px', fontWeight: 500, margin: 0 }}>{f.airline}</p>
                <p style={{ color: '#1A6EFF', fontSize: '15px', fontWeight: 600, margin: 0 }}>${f.price.toFixed(2)}</p>
              </div>
              <p style={{ color: '#555', fontSize: '11px', margin: '4px 0 0' }}>{f.type} · {f.duration}</p>
              {f.badge && <span style={{ fontSize: '9px', backgroundColor: 'rgba(26,110,255,0.12)', color: '#1A6EFF', padding: '2px 8px', borderRadius: '100px', display: 'inline-block', marginTop: '6px' }}>{f.badge}</span>}
            </div>
          ))}
        </div>
      )}

      {/* cost breakdown + confirm */}
      {selectedFlight && (
        <>
          <div style={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '11px', padding: '14px 16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ color: '#555', fontSize: '12px' }}>flight</span>
              <span style={{ color: '#fff', fontSize: '12px' }}>${selectedFlight.price.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ color: '#555', fontSize: '12px' }}>convenience fee (8%)</span>
              <span style={{ color: '#fff', fontSize: '12px' }}>${fee.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ color: '#555', fontSize: '12px' }}>trip insurance</span>
              <span style={{ color: '#fff', fontSize: '12px' }}>$12.00</span>
            </div>
            <div style={{ borderTop: '1px solid #1e1e1e', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>total</span>
              <span style={{ color: '#fff', fontSize: '15px', fontWeight: 700 }}>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ width: '100%', backgroundColor: submitting ? '#0f3d99' : '#1A6EFF', color: '#fff', border: 'none', borderRadius: '100px', padding: '18px', fontSize: '15px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}
          >
            {submitting ? 'submitting...' : 'this is my flight'}
          </button>
        </>
      )}
    </main>
  )
}
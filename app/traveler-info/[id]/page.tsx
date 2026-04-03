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

type TripRequest = {
  id: string
  traveler_name: string
  trip_date: string
  status: string
}

export default function TravelerInfoPage() {
  const params = useParams()
  const id = params.id as string

  const [tripRequest, setTripRequest] = useState<TripRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [idType, setIdType] = useState<'passport' | 'government_id'>('passport')

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

  const handleSubmit = async () => {
    if (!fullName.trim() || !dob.trim() || !idNumber.trim()) {
      setError('please fill in all fields')
      return
    }

    setSubmitting(true)
    setError(null)

    const { error } = await supabase
      .from('trip_requests')
      .update({
        status: 'traveler_submitted',
        traveler_info: {
          full_name: fullName.trim(),
          date_of_birth: dob.trim(),
          id_type: idType,
          id_number: idNumber.trim(),
        },
      })
      .eq('id', tripRequest!.id)

    if (error) {
      setError('could not submit your info. please try again.')
      setSubmitting(false)
      return
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  if (loading) {
    return (
      <main style={{ backgroundColor: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#555', fontSize: '13px' }}>loading...</p>
      </main>
    )
  }

  if (submitted) {
    return (
      <main style={{ backgroundColor: '#080808', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', maxWidth: '390px', margin: '0 auto' }}>
        <p style={{ color: '#1A6EFF', fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', margin: '0 0 16px' }}>presence</p>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, textAlign: 'center', margin: '0 0 12px', lineHeight: 1.2 }}>you're all set</h1>
        <p style={{ color: '#555', fontSize: '14px', textAlign: 'center', lineHeight: 1.6 }}>your info has been submitted. once the booking is confirmed you'll get a text with your flight details.</p>
      </main>
    )
  }

  if (error && !tripRequest) {
    return (
      <main style={{ backgroundColor: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <p style={{ color: '#ff4444', fontSize: '13px', textAlign: 'center' }}>{error}</p>
      </main>
    )
  }

  return (
    <main style={{ backgroundColor: '#080808', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '40px 20px 60px', maxWidth: '390px', margin: '0 auto', boxSizing: 'border-box' }}>

      <p style={{ color: '#1A6EFF', fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', margin: '0 0 8px' }}>presence</p>
      <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, margin: '0 0 6px', lineHeight: 1.2 }}>
        hey {tripRequest?.traveler_name.split(' ')[0].toLowerCase()},
      </h1>
      <p style={{ color: '#555', fontSize: '14px', margin: '0 0 32px', lineHeight: 1.6 }}>
        we need a few details to book your flight. this info is only used for your booking.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        <div>
          <p style={{ color: '#555', fontSize: '11px', letterSpacing: '0.06em', margin: '0 0 6px' }}>full legal name</p>
          <input
            type="text"
            placeholder="as it appears on your id"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <p style={{ color: '#555', fontSize: '11px', letterSpacing: '0.06em', margin: '0 0 6px' }}>date of birth</p>
          <input
            type="date"
            value={dob}
            onChange={e => setDob(e.target.value)}
            style={{ ...inputStyle, color: dob ? '#fff' : '#555', colorScheme: 'dark' }}
          />
        </div>

        <div>
          <p style={{ color: '#555', fontSize: '11px', letterSpacing: '0.06em', margin: '0 0 6px' }}>id type</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['passport', 'government_id'] as const).map(type => (
              <div
                key={type}
                onClick={() => setIdType(type)}
                style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: '11px', border: `1px solid ${idType === type ? '#1A6EFF' : '#1e1e1e'}`, backgroundColor: idType === type ? 'rgba(26,110,255,0.07)' : '#111', color: idType === type ? '#1A6EFF' : '#555', fontSize: '12px', cursor: 'pointer' }}
              >
                {type === 'passport' ? 'passport' : 'government id'}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p style={{ color: '#555', fontSize: '11px', letterSpacing: '0.06em', margin: '0 0 6px' }}>{idType === 'passport' ? 'passport number' : 'id number'}</p>
          <input
            type="text"
            placeholder={idType === 'passport' ? 'passport number' : 'government id number'}
            value={idNumber}
            onChange={e => setIdNumber(e.target.value)}
            style={inputStyle}
          />
        </div>

      </div>

      {error && <p style={{ color: '#ff4444', fontSize: '13px', marginTop: '16px' }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{ width: '100%', backgroundColor: submitting ? '#0f3d99' : '#1A6EFF', color: '#fff', border: 'none', borderRadius: '100px', padding: '18px', fontSize: '15px', fontWeight: 700, marginTop: '32px', cursor: submitting ? 'not-allowed' : 'pointer' }}
      >
        {submitting ? 'submitting...' : 'submit my info'}
      </button>

    </main>
  )
}
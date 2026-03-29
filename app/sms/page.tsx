'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SMSPage() {
  const router = useRouter()

  const [travelerName, setTravelerName] = useState('')
  const [travelerPhone, setTravelerPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    setError(null)

    if (!travelerName.trim() || !travelerPhone.trim()) {
      setError('please enter a name and phone number')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          travelerName,
          travelerPhone,
          gameDate: 'april 5, 2025',
          tripLink: 'https://presence.app/trip/abc123',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'something went wrong. please try again.')
        return
      }

      router.push('/confirm')
    } catch {
      setError('network error. please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        backgroundColor: '#080808',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '24px 20px',
        maxWidth: '390px',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', marginBottom: '40px' }}>
        <p
          style={{
            color: '#1A6EFF',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            margin: '0 0 8px',
          }}
        >
          presence
        </p>
        <h1
          style={{
            color: '#ffffff',
            fontSize: '26px',
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          who's coming to the game?
        </h1>
        <p
          style={{
            color: '#6b6b6b',
            fontSize: '14px',
            margin: '8px 0 0',
          }}
        >
          they'll get a text with everything they need
        </p>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="text"
          placeholder="traveler name"
          value={travelerName}
          onChange={(e) => setTravelerName(e.target.value)}
          style={inputStyle}
        />
        <input
          type="tel"
          placeholder="phone number"
          value={travelerPhone}
          onChange={(e) => setTravelerPhone(e.target.value)}
          style={inputStyle}
        />
      </div>

      {error && (
        <p
          style={{
            color: '#ff4444',
            fontSize: '13px',
            marginTop: '16px',
            textAlign: 'center',
          }}
        >
          {error}
        </p>
      )}

      <button
        onClick={handleSend}
        disabled={loading}
        style={{
          width: '100%',
          padding: '18px',
          borderRadius: '100px',
          border: 'none',
          backgroundColor: loading ? '#0f3d99' : '#1A6EFF',
          color: '#ffffff',
          fontSize: '15px',
          fontWeight: 700,
          marginTop: '32px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'sending...' : 'send text'}
      </button>
    </main>
  )
}

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
}
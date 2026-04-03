"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Flight = {
  id: string;
  airline: string;
  type: string;
  duration: string;
  price: number;
  badge?: string;
};

function PaymentSheet({ flight, insurance, onClose, onSuccess }: {
  flight: Flight;
  insurance: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fee = Math.round(flight.price * 0.08 * 100) / 100;
  const ins = insurance ? 12 : 0;
  const total = flight.price + fee + ins;

  const handleCardPay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightPrice: flight.price, includeInsurance: insurance }),
      });
      const { clientSecret, error: apiError } = await res.json();
      if (apiError) { setError(apiError); setLoading(false); return; }
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });
      if (confirmError) {
        setError(confirmError.message || 'payment failed');
      } else if (paymentIntent!.status === 'succeeded') {
        onSuccess();
      }
    } catch {
      setError('something went wrong. please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-end', zIndex: 20 }}>
      <div style={{ background: '#161616', borderRadius: '20px 20px 0 0', padding: '16px', width: '100%' }}>
        <div style={{ width: '32px', height: '3px', background: 'rgba(255,255,255,0.15)', borderRadius: '100px', margin: '0 auto 16px' }}></div>
        <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff', marginBottom: '14px' }}>confirm and pay</div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>flight</span>
            <span style={{ fontSize: '11px', color: '#fff' }}>${flight.price.toFixed(2)}</span>
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
          {loading ? 'processing...' : `confirm and pay $${total.toFixed(2)}`}
        </button>
        <button
          onClick={onClose}
          style={{ width: '100%', background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '0.5px solid rgba(255,255,255,0.1)', padding: '11px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer' }}
        >
          cancel
        </button>
      </div>
    </div>
  );
}

function BookPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'book' | 'delegate'>('book');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [sort, setSort] = useState('best');
  const [insurance, setInsurance] = useState(true);
  const [showInsModal, setShowInsModal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [fromCity, setFromCity] = useState('MIA');
  const [toCity, setToCity] = useState('RDU');
  const [depart, setDepart] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [showFromSearch, setShowFromSearch] = useState(false);
  const [showToSearch, setShowToSearch] = useState(false);
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // delegate mode state
  const [travelerName, setTravelerName] = useState('');
  const [travelerPhone, setTravelerPhone] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [delegateLoading, setDelegateLoading] = useState(false);
  const [delegateError, setDelegateError] = useState('');

  const airports = [
    {c:'ATL',n:'atlanta'},{c:'AUS',n:'austin'},{c:'BNA',n:'nashville'},{c:'BOS',n:'boston'},
    {c:'CLT',n:'charlotte'},{c:'DCA',n:'washington reagan'},{c:'DEN',n:'denver'},{c:'DFW',n:'dallas fort worth'},
    {c:'DTW',n:'detroit'},{c:'EWR',n:'newark'},{c:'FLL',n:'fort lauderdale'},{c:'IAH',n:'houston'},
    {c:'JFK',n:'new york jfk'},{c:'LAS',n:'las vegas'},{c:'LAX',n:'los angeles'},{c:'LGA',n:'new york laguardia'},
    {c:'MCO',n:'orlando'},{c:'MIA',n:'miami'},{c:'MSP',n:'minneapolis'},{c:'MSY',n:'new orleans'},
    {c:'ORD',n:"chicago o'hare"},{c:'PDX',n:'portland'},{c:'PHL',n:'philadelphia'},{c:'PHX',n:'phoenix'},
    {c:'RDU',n:'raleigh-durham'},{c:'SEA',n:'seattle'},{c:'SFO',n:'san francisco'},{c:'SLC',n:'salt lake city'},
    {c:'STL',n:'st louis'},{c:'TPA',n:'tampa'},
  ];

  const filteredFrom = airports.filter(a => a.n.includes(fromSearch.toLowerCase()) || a.c.toLowerCase().includes(fromSearch.toLowerCase())).slice(0, 4);
  const filteredTo = airports.filter(a => a.n.includes(toSearch.toLowerCase()) || a.c.toLowerCase().includes(toSearch.toLowerCase())).slice(0, 4);

  const toE164 = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10 ? `+1${digits}` : `+${digits}`;
  };

  const searchFlights = async () => {
    setSearching(true);
    setSearchError('');
    setFlights([]);
    setSelectedFlight(null);
    try {
      const res = await fetch('/api/search-flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: fromCity, destination: toCity, date: depart }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSearchError(data.error || 'could not find flights. try again.');
        return;
      }
      const mapped: Flight[] = data.offers.map((offer: any, i: number) => {
        const slice = offer.slices[0];
        const segment = slice.segments[0];
        const price = parseFloat(offer.total_amount);
        const durationStr = slice.duration || '';
        const hoursMatch = durationStr.match(/(\d+)H/);
        const minsMatch = durationStr.match(/(\d+)M/);
        const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
        const mins = minsMatch ? parseInt(minsMatch[1]) : 0;
        const stops = slice.segments.length - 1;
        return {
          id: offer.id,
          airline: segment.marketing_carrier?.name?.toLowerCase() || 'unknown',
          type: stops === 0 ? 'nonstop' : `${stops} stop`,
          duration: `${hours}h ${mins}m`,
          price,
          badge: i === 0 ? 'best value' : undefined,
        };
      });
      setFlights(mapped);
      if (mapped.length > 0) setSelectedFlight(mapped[0]);
    } catch {
      setSearchError('network error. please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleDelegate = async () => {
    if (!travelerName.trim() || !travelerPhone.trim() || !tripDate.trim()) {
      setDelegateError('please fill in all fields');
      return;
    }
    setDelegateLoading(true);
    setDelegateError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setDelegateError('you must be logged in');
        setDelegateLoading(false);
        return;
      }

      const { data: tripRequest, error: dbError } = await supabase
        .from('trip_requests')
        .insert({
          athlete_id: session.user.id,
          traveler_name: travelerName.trim(),
          traveler_phone: toE164(travelerPhone),
          trip_date: tripDate.trim(),
          status: 'pending',
        })
        .select()
        .single();

      if (dbError || !tripRequest) {
        setDelegateError('could not create trip request. please try again.');
        setDelegateLoading(false);
        return;
      }

      const tripLink = `${window.location.origin}/request/${tripRequest.id}`;

      const res = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          travelerName: travelerName.trim(),
          travelerPhone: toE164(travelerPhone),
          tripDate: tripDate.trim(),
          tripLink,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDelegateError(data.error || 'something went wrong. please try again.');
        setDelegateLoading(false);
        return;
      }

      router.push('/confirm');
    } catch {
      setDelegateError('network error. please try again.');
    } finally {
      setDelegateLoading(false);
    }
  };

  const getSortedFlights = () => {
    let sorted = [...flights];
    if (sort === 'cheapest') sorted.sort((a, b) => a.price - b.price);
    if (sort === 'fastest') sorted.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
    if (sort === 'nonstop') sorted = sorted.filter(f => f.type === 'nonstop');
    return sorted;
  };

  const fee = selectedFlight ? Math.round(selectedFlight.price * 0.08 * 100) / 100 : 0;
  const ins = insurance ? 12 : 0;
  const total = selectedFlight ? selectedFlight.price + fee + ins : 0;

  return (
    <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '390px', minHeight: '100vh', background: '#080808', position: 'relative', padding: '16px 16px 80px' }}>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <div onClick={() => router.back()} style={{ width: '26px', height: '26px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>←</div>
          <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>book a flight</h3>
        </div>

        {/* mode toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', padding: '3px', marginBottom: '20px' }}>
          {(['book', 'delegate'] as const).map(m => (
            <div
              key={m}
              onClick={() => {
                setMode(m);
                setFlights([]);
                setSelectedFlight(null);
                setSearchError('');
                setDelegateError('');
              }}
              style={{ flex: 1, textAlign: 'center', padding: '7px 0', borderRadius: '100px', fontSize: '11px', cursor: 'pointer', background: mode === m ? '#1A6EFF' : 'transparent', color: mode === m ? '#fff' : 'rgba(255,255,255,0.35)', fontWeight: mode === m ? 500 : 400 }}
            >
              {m === 'book' ? "i'll book it" : 'let them pick'}
            </div>
          ))}
        </div>

        {/* i'll book it mode */}
        {mode === 'book' && (
          <>
            {/* airport selectors */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <div style={{ flex: 1 }}>
                <div onClick={() => { setShowFromSearch(!showFromSearch); setShowToSearch(false); }} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '11px', padding: '8px 10px', cursor: 'pointer' }}>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>from</div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>{fromCity}</div>
                </div>
                {showFromSearch && (
                  <div style={{ marginTop: '4px' }}>
                    <input value={fromSearch} onChange={e => setFromSearch(e.target.value)} placeholder="search airport..." autoFocus style={{ width: '100%', background: '#141414', border: '0.5px solid #1A6EFF', color: '#fff', padding: '8px 10px', borderRadius: '10px', fontSize: '11px', outline: 'none', boxSizing: 'border-box' }} />
                    {filteredFrom.map(a => (
                      <div key={a.c} onClick={() => { setFromCity(a.c); setShowFromSearch(false); setFromSearch(''); }} style={{ padding: '8px 10px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', background: '#141414', borderBottom: '0.5px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{a.n}</span><span style={{ color: '#1A6EFF', fontWeight: 500 }}>{a.c}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>→</div>
              <div style={{ flex: 1 }}>
                <div onClick={() => { setShowToSearch(!showToSearch); setShowFromSearch(false); }} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '11px', padding: '8px 10px', cursor: 'pointer' }}>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>to</div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>{toCity}</div>
                </div>
                {showToSearch && (
                  <div style={{ marginTop: '4px' }}>
                    <input value={toSearch} onChange={e => setToSearch(e.target.value)} placeholder="search airport..." autoFocus style={{ width: '100%', background: '#141414', border: '0.5px solid #1A6EFF', color: '#fff', padding: '8px 10px', borderRadius: '10px', fontSize: '11px', outline: 'none', boxSizing: 'border-box' }} />
                    {filteredTo.map(a => (
                      <div key={a.c} onClick={() => { setToCity(a.c); setShowToSearch(false); setToSearch(''); }} style={{ padding: '8px 10px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', background: '#141414', borderBottom: '0.5px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{a.n}</span><span style={{ color: '#1A6EFF', fontWeight: 500 }}>{a.c}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* date + search */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '11px', padding: '8px 10px' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>depart</div>
                <input type="date" value={depart} onChange={e => setDepart(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 500, outline: 'none', width: '100%' }} />
              </div>
              <button onClick={searchFlights} disabled={searching} style={{ background: '#1A6EFF', color: '#fff', border: 'none', borderRadius: '11px', padding: '0 16px', fontSize: '12px', fontWeight: 500, cursor: searching ? 'not-allowed' : 'pointer', opacity: searching ? 0.6 : 1, whiteSpace: 'nowrap' }}>
                {searching ? 'searching...' : 'search'}
              </button>
            </div>

            {searchError && <div style={{ fontSize: '11px', color: '#FF3B30', marginBottom: '10px' }}>{searchError}</div>}

            {!searching && flights.length === 0 && !searchError && (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
                pick your airports and date, then tap search
              </div>
            )}

            {searching && (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                finding the best flights...
              </div>
            )}

            {flights.length > 0 && (
              <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '2px' }}>
                {['best', 'cheapest', 'fastest', 'nonstop'].map(s => (
                  <div key={s} onClick={() => setSort(s)} style={{ background: sort === s ? 'rgba(26,110,255,0.15)' : 'rgba(255,255,255,0.05)', border: `0.5px solid ${sort === s ? '#1A6EFF' : 'rgba(255,255,255,0.1)'}`, color: sort === s ? '#1A6EFF' : 'rgba(255,255,255,0.4)', padding: '5px 11px', borderRadius: '100px', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {s}
                  </div>
                ))}
              </div>
            )}

            {flights.length > 0 && (
              <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '10px' }}>
                {getSortedFlights().map(f => (
                  <div key={f.id} onClick={() => setSelectedFlight(f)} style={{ background: selectedFlight?.id === f.id ? 'rgba(26,110,255,0.07)' : 'rgba(255,255,255,0.04)', border: `0.5px solid ${selectedFlight?.id === f.id ? '#1A6EFF' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', padding: '9px 10px', marginBottom: '6px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '11px', fontWeight: 500, color: '#fff' }}>{f.airline}</div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#1A6EFF' }}>${f.price.toFixed(2)}</div>
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{f.type} · {f.duration}</div>
                    {f.badge && <div style={{ fontSize: '9px', background: 'rgba(26,110,255,0.12)', color: '#1A6EFF', padding: '2px 7px', borderRadius: '100px', display: 'inline-block', marginTop: '3px' }}>{f.badge}</div>}
                  </div>
                ))}
              </div>
            )}

            {selectedFlight && (
              <>
                <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)', padding: '8px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 500, color: '#fff' }}>trip insurance</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>covers cancellations & delays</div>
                    </div>
                    <div onClick={() => insurance ? setShowInsModal(true) : setInsurance(true)} style={{ width: '32px', height: '18px', background: insurance ? '#1A6EFF' : 'rgba(255,255,255,0.1)', borderRadius: '100px', position: 'relative', cursor: 'pointer' }}>
                      <div style={{ width: '12px', height: '12px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', right: insurance ? '3px' : 'auto', left: insurance ? 'auto' : '3px' }}></div>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)', padding: '8px 0 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>flight</span>
                    <span style={{ fontSize: '11px', color: '#fff' }}>${selectedFlight.price.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>convenience fee (8%)</span>
                    <span style={{ fontSize: '11px', color: '#fff' }}>${fee.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', opacity: insurance ? 1 : 0.3 }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>trip insurance</span>
                    <span style={{ fontSize: '11px', color: '#fff' }}>${ins.toFixed(2)}</span>
                  </div>
                  <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)', marginTop: '6px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#fff' }}>total</span>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/sms')}
                  style={{ width: '100%', background: '#1A6EFF', color: '#fff', border: 'none', padding: '13px', borderRadius: '100px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                >
                  next — get traveler info
                </button>
              </>
            )}
          </>
        )}

        {/* let them pick mode */}
        {mode === 'delegate' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '0 0 4px', lineHeight: 1.6 }}>
              enter their info and we'll send them a link to pick their own flight. you'll review and pay once they choose.
            </p>

            <input
              type="text"
              placeholder="traveler name"
              value={travelerName}
              onChange={e => setTravelerName(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '11px', padding: '12px 14px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />

            <input
              type="tel"
              placeholder="phone number"
              value={travelerPhone}
              onChange={e => setTravelerPhone(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '11px', padding: '12px 14px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '11px', padding: '8px 14px' }}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>trip date</div>
              <input
                type="date"
                value={tripDate}
                onChange={e => setTripDate(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: tripDate ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: '13px', fontWeight: 500, outline: 'none', width: '100%', colorScheme: 'dark' }}
              />
            </div>

            {delegateError && <div style={{ fontSize: '11px', color: '#FF3B30' }}>{delegateError}</div>}

            <button
              onClick={handleDelegate}
              disabled={delegateLoading}
              style={{ width: '100%', background: delegateLoading ? 'rgba(26,110,255,0.5)' : '#1A6EFF', color: '#fff', border: 'none', padding: '14px', borderRadius: '100px', fontSize: '13px', fontWeight: 500, cursor: delegateLoading ? 'not-allowed' : 'pointer', marginTop: '8px' }}
            >
              {delegateLoading ? 'sending...' : 'send link to traveler'}
            </button>
          </div>
        )}

        {/* insurance modal */}
        {showInsModal && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-end', zIndex: 10 }}>
            <div style={{ background: '#161616', borderRadius: '20px 20px 0 0', padding: '16px', width: '100%' }}>
              <div style={{ width: '32px', height: '3px', background: 'rgba(255,255,255,0.15)', borderRadius: '100px', margin: '0 auto 14px' }}></div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#fff', marginBottom: '8px' }}>travelling without insurance</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: '14px' }}>by removing trip insurance, you acknowledge that presence is not responsible for any costs related to flight cancellations, delays, missed connections, or any other travel disruptions. all rebooking fees, change fees, and losses are solely your responsibility. this waiver is final at time of booking.</div>
              <button onClick={() => { setInsurance(false); setShowInsModal(false); }} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: 'none', padding: '11px', borderRadius: '100px', fontSize: '11px', cursor: 'pointer', marginBottom: '6px' }}>i understand, remove insurance</button>
              <button onClick={() => setShowInsModal(false)} style={{ width: '100%', background: '#1A6EFF', color: '#fff', border: 'none', padding: '11px', borderRadius: '100px', fontSize: '11px', fontWeight: 500, cursor: 'pointer' }}>keep insurance</button>
            </div>
          </div>
        )}

        {/* payment sheet */}
        {showPayment && selectedFlight && (
          <Elements stripe={stripePromise}>
            <PaymentSheet
              flight={selectedFlight}
              insurance={insurance}
              onClose={() => setShowPayment(false)}
              onSuccess={() => router.push('/sms')}
            />
          </Elements>
        )}

        {/* bottom nav */}
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '390px', display: 'flex', borderTop: '0.5px solid rgba(255,255,255,0.07)', background: '#080808', padding: '10px 0 6px' }}>
          {['home', 'travel', 'profile'].map(t => (
            <div key={t} onClick={() => router.push(`/${t}`)} style={{ flex: 1, textAlign: 'center', fontSize: '9px', color: t === 'travel' ? '#1A6EFF' : 'rgba(255,255,255,0.25)', cursor: 'pointer' }}>
              {t}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default function BookPageWrapper() {
  return <BookPage />;
}
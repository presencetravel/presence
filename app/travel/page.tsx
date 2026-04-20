"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { BottomTabs } from "../components/BottomTabs";
import { colors } from "../lib/presenceData";

type Mode = "upcoming" | "past";

type TripRequest = {
  id: string;
  status: string;
  trip_date: string;
  total_amount: number | null;
  selected_offer_data: unknown;
};

type OfferData = {
  slices?: Array<{
    origin?: { iata_code?: string };
    destination?: { iata_code?: string };
    segments?: Array<{
      departing_at?: string;
      marketing_carrier?: { name?: string };
    }>;
  }>;
  base_amount?: string;
  total_amount?: string;
};

function parseOffer(raw: unknown): OfferData | null {
  if (!raw || typeof raw !== "object") return null;
  return raw as OfferData;
}

function getRoute(offer: OfferData | null): string {
  const slice = offer?.slices?.[0];
  const origin = slice?.origin?.iata_code?.toLowerCase();
  const destination = slice?.destination?.iata_code?.toLowerCase();
  if (origin && destination) return `${origin} → ${destination}`;
  return "flight pending";
}

function getAirline(offer: OfferData | null): string {
  const segment = offer?.slices?.[0]?.segments?.[0];
  return segment?.marketing_carrier?.name?.toLowerCase() ?? "";
}

function getDepartureTime(offer: OfferData | null): string {
  const raw = offer?.slices?.[0]?.segments?.[0]?.departing_at;
  if (!raw) return "—";
  const d = new Date(raw);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toLowerCase();
}

function formatTotal(amount: number | null): string {
  if (!amount) return "—";
  return `$${amount.toFixed(2)}`;
}

function getFlightCost(amount: number | null): string {
  if (!amount) return "—";
  const insurance = 12;
  const fee = parseFloat((((amount - insurance) / 1.08) * 0.08).toFixed(2));
  const flight = parseFloat(((amount - insurance - fee)).toFixed(2));
  return `$${flight.toFixed(2)}`;
}

function getConvenienceFee(amount: number | null): string {
  if (!amount) return "—";
  const insurance = 12;
  const fee = parseFloat((((amount - insurance) / 1.08) * 0.08).toFixed(2));
  return `$${fee.toFixed(2)}`;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "booked": return "#22c55e";
    case "traveler_submitted":
    case "athlete_confirmed": return "#f59e0b";
    case "pending": return "#f59e0b";
    case "declined": return "#ef4444";
    default: return "#555";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "booked": return "booked";
    case "traveler_submitted": return "info submitted";
    case "athlete_confirmed": return "confirmed";
    case "pending": return "pending";
    case "declined": return "declined";
    default: return status;
  }
}

function isUpcoming(trip: TripRequest): boolean {
  if (trip.status === "declined") return false;
  if (trip.status === "booked") {
    const tripDate = new Date(trip.trip_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tripDate >= today;
  }
  return true;
}

function isPast(trip: TripRequest): boolean {
  if (trip.status === "declined") return true;
  if (trip.status === "booked") {
    const tripDate = new Date(trip.trip_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tripDate < today;
  }
  return false;
}

export default function TravelPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>("upcoming");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trips, setTrips] = useState<TripRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setExpandedId(null);
  }, [mode]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }
      const { data } = await supabase
        .from("trip_requests")
        .select("id, status, trip_date, total_amount, selected_offer_data")
        .eq("athlete_id", user.id)
        .order("trip_date", { ascending: true });
      if (data) setTrips(data as TripRequest[]);
      setLoading(false);
    }
    load();
  }, []);

  const upcomingTrips = trips.filter(isUpcoming);
  const pastTrips = trips.filter(isPast);
  const displayTrips = mode === "upcoming" ? upcomingTrips : pastTrips;

  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#333", fontSize: "13px" }}>loading</span>
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100dvh", background: colors.bg, color: colors.white, display: "flex", justifyContent: "center", padding: "1rem 1rem 0" }}>
      <div style={{ width: "100%", maxWidth: "390px", minHeight: "100dvh", display: "flex", flexDirection: "column", paddingBottom: "90px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.5px", marginBottom: "16px", marginTop: "6px" }}>my trips</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
          {(["upcoming", "past"] as Mode[]).map((entry) => (
            <button key={entry} type="button" onClick={() => setMode(entry)} style={{ minHeight: "38px", borderRadius: "100px", border: "none", background: mode === entry ? colors.blue : colors.card, color: mode === entry ? colors.white : colors.muted, cursor: "pointer", fontSize: "13px" }}>
              {entry}
            </button>
          ))}
        </div>

        {displayTrips.length === 0 ? (
          <section style={{ textAlign: "center", marginTop: "48px" }}>
            <p style={{ marginBottom: "12px", color: colors.muted, fontSize: "13px" }}>no {mode} trips.</p>
            {mode === "upcoming" && (
              <Link href="/book" style={{ background: colors.blue, color: colors.white, padding: "11px 20px", borderRadius: "100px", textDecoration: "none", display: "inline-flex", cursor: "pointer", fontSize: "13px" }}>
                make it happen.
              </Link>
            )}
          </section>
        ) : (
          <section style={{ display: "grid", gap: "10px" }}>
            {displayTrips.map((trip) => {
              const offer = parseOffer(trip.selected_offer_data);
              const hasOffer = !!offer;
              const route = getRoute(offer);
              const airline = getAirline(offer);
              const departureTime = getDepartureTime(offer);
              const date = formatDate(trip.trip_date);
              const total = formatTotal(trip.total_amount);
              const statusColor = getStatusColor(trip.status);
              const statusLabel = getStatusLabel(trip.status);
              const flightCost = getFlightCost(trip.total_amount);
              const convenienceFee = getConvenienceFee(trip.total_amount);

              return (
                <article key={trip.id} style={{ border: colors.border, borderRadius: "11px", background: colors.card, padding: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                    <p style={{ fontSize: "15px", fontWeight: 600, color: hasOffer ? colors.white : "#555", fontStyle: hasOffer ? "normal" : "italic", margin: 0 }}>{route}</p>
                    <p style={{ fontSize: "13px", color: colors.blue, margin: 0, flexShrink: 0, marginLeft: "8px" }}>{total}</p>
                  </div>

                  <p style={{ fontSize: "12px", color: "#555", margin: "0 0 10px" }}>
                    {airline ? `${airline} · ` : ""}{date}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: expandedId === trip.id ? "12px" : "0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusColor, flexShrink: 0 }} />
                      <span style={{ color: statusColor, fontSize: "11px" }}>{statusLabel}</span>
                    </div>
                    {expandedId !== trip.id && (
                      <button type="button" onClick={() => setExpandedId(trip.id)} style={{ border: "none", background: "transparent", color: colors.blue, fontSize: "12px", cursor: "pointer", padding: 0 }}>
                        view details
                      </button>
                    )}
                  </div>

                  {expandedId === trip.id && (
                    <div style={{ background: "#111111", border: colors.border, borderRadius: "11px", padding: "12px", marginTop: "4px" }}>
                      <p style={{ fontSize: "11px", color: colors.muted, marginBottom: "8px" }}>trip details</p>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "12px", color: colors.muted }}>flight route</span>
                        <span style={{ fontSize: "12px" }}>{route}</span>
                      </div>
                      {airline && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontSize: "12px", color: colors.muted }}>airline</span>
                          <span style={{ fontSize: "12px" }}>{airline}</span>
                        </div>
                      )}
                      {departureTime !== "—" && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontSize: "12px", color: colors.muted }}>departure time</span>
                          <span style={{ fontSize: "12px" }}>{departureTime}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ fontSize: "12px", color: colors.muted }}>traveler status</span>
                        <span style={{ fontSize: "12px", color: statusColor }}>{statusLabel}</span>
                      </div>

                      {trip.total_amount && (
                        <div style={{ borderTop: colors.border, paddingTop: "10px", marginBottom: "8px" }}>
                          <p style={{ fontSize: "11px", color: colors.muted, marginBottom: "8px" }}>price breakdown</p>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span style={{ fontSize: "12px", color: colors.muted }}>flight cost</span>
                            <span style={{ fontSize: "12px" }}>{flightCost}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span style={{ fontSize: "12px", color: colors.muted }}>convenience fee</span>
                            <span style={{ fontSize: "12px" }}>{convenienceFee}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span style={{ fontSize: "12px", color: colors.muted }}>insurance</span>
                            <span style={{ fontSize: "12px" }}>$12.00</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "13px", fontWeight: 600 }}>total</span>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: colors.blue }}>{total}</span>
                          </div>
                        </div>
                      )}

                      <button type="button" onClick={() => setExpandedId(null)} style={{ border: "none", background: "transparent", color: colors.blue, fontSize: "12px", cursor: "pointer", padding: 0, marginTop: "4px" }}>
                        close
                      </button>
                    </div>
                  )}

                  {mode === "past" && expandedId !== trip.id && (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                      <Link href="/book" style={{ border: colors.border, borderRadius: "100px", padding: "6px 10px", textDecoration: "none", color: colors.white, fontSize: "12px" }}>
                        book again
                      </Link>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}

        <BottomTabs active="travel" />
      </div>
    </main>
  );
}
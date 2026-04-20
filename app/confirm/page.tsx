"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { BottomTabs } from "../components/BottomTabs";
import { colors } from "../lib/presenceData";

type OfferData = {
  slices?: Array<{
    origin?: { iata_code?: string };
    destination?: { iata_code?: string };
    segments?: Array<{
      departing_at?: string;
      marketing_carrier?: { name?: string };
    }>;
  }>;
  airline?: string;
  type?: string;
  duration?: string;
  price?: number;
};

type TripRequest = {
  id: string;
  traveler_name: string;
  trip_date: string;
  total_amount: number;
  selected_offer_data: unknown;
};

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", whiteSpace: "nowrap" }}>{label}</span>
      <span style={{ flex: 1, borderBottom: "1px dotted rgba(255,255,255,0.2)" }} />
      <span style={{ fontSize: "12px", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

function getRoute(offer: OfferData | null): string {
  const slice = offer?.slices?.[0];
  const origin = slice?.origin?.iata_code?.toLowerCase();
  const destination = slice?.destination?.iata_code?.toLowerCase();
  if (origin && destination) return `${origin} to ${destination}`;
  if (offer?.airline) return offer.airline.toLowerCase();
  return "—";
}

function getAirline(offer: OfferData | null): string {
  const segment = offer?.slices?.[0]?.segments?.[0];
  if (segment?.marketing_carrier?.name) return segment.marketing_carrier.name.toLowerCase();
  if (offer?.airline) return offer.airline.toLowerCase();
  return "—";
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

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [pulse, setPulse] = useState(true);
  const [trip, setTrip] = useState<TripRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setPulse((prev) => !prev), 700);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function load() {
      const id = searchParams.get("id");
      if (!id) { setLoading(false); return; }
      const { data } = await supabase
        .from("trip_requests")
        .select("id, traveler_name, trip_date, total_amount, selected_offer_data")
        .eq("id", id)
        .single();
      if (data) setTrip(data as unknown as TripRequest);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#333", fontSize: "13px" }}>loading</span>
      </div>
    );
  }

  const offer = trip ? (trip.selected_offer_data as OfferData) : null;
  const total = trip?.total_amount ?? 0;
  const insurance = 12;
  const fee = Math.round(((total - insurance) / 1.08) * 0.08 * 100) / 100;
  const flightCost = Math.round((total - insurance - fee) * 100) / 100;
  const route = getRoute(offer);
  const airline = getAirline(offer);
  const departureTime = getDepartureTime(offer);
  const date = formatDate(trip?.trip_date ?? "");
  const checkInDate = trip?.trip_date
    ? formatDate(new Date(new Date(trip.trip_date).getTime() - 86400000).toISOString())
    : "—";

  return (
    <main style={{ minHeight: "100dvh", background: colors.bg, color: colors.white, display: "flex", justifyContent: "center", padding: "1rem 1rem 0" }}>
      <div style={{ width: "100%", maxWidth: "390px", minHeight: "100dvh", display: "flex", flexDirection: "column", paddingBottom: "90px" }}>

        <div style={{ textAlign: "center", marginTop: "36px", marginBottom: "12px" }}>
          <span style={{ width: "54px", height: "54px", borderRadius: "100px", background: colors.blue, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 12.8L10.2 17L18 8.7" stroke="white" strokeWidth="2" />
            </svg>
          </span>
          <h1 style={{ fontSize: "28px", marginTop: "14px", marginBottom: "6px" }}>they're booked.</h1>
          <p style={{ fontSize: "13px", color: colors.muted }}>text sent. presence handles check-in and alerts automatically.</p>
        </div>

        <div style={{ width: "fit-content", margin: "0 auto 14px", borderRadius: "100px", background: "rgba(26,110,255,0.2)", border: colors.border, padding: "8px 12px", display: "flex", alignItems: "center", gap: "7px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "100px", background: colors.blue, opacity: pulse ? 1 : 0.35, transition: "opacity .2s ease" }} />
          <span style={{ fontSize: "12px", color: colors.blue }}>tracking active</span>
        </div>

        <section style={{ border: colors.border, borderRadius: "11px", background: colors.card, padding: "12px", marginBottom: "14px" }}>
          <ReceiptRow label="flight" value={`${route} · ${airline}`} />
          <ReceiptRow label="departs" value={`${date} ${departureTime}`} />
          <ReceiptRow label="auto check-in" value={`${checkInDate} · ${departureTime}`} />
          <ReceiptRow label="flight cost" value={`$${flightCost.toFixed(2)}`} />
          <ReceiptRow label="convenience fee" value={`$${fee.toFixed(2)}`} />
          <ReceiptRow label="insurance" value="$12.00" />
          <ReceiptRow label="total charged" value={`$${total.toFixed(2)}`} />
        </section>

        <button
          type="button"
          onClick={() => router.push("/home")}
          style={{ width: "100%", minHeight: "44px", borderRadius: "100px", background: colors.blue, color: colors.white, border: "none", fontSize: "14px", cursor: "pointer", marginBottom: "10px" }}
        >
          back to home
        </button>

        <BottomTabs active="home" />
      </div>
    </main>
  );
}
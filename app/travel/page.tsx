"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BottomTabs } from "../components/BottomTabs";
import { colors } from "../lib/presenceData";

type Mode = "upcoming" | "past";

type UpcomingTrip = {
  id: string;
  route: string;
  airline: string;
  date: string;
  departureTime: string;
  status: string;
  statusColor: string;
  total: string;
  autoCheckIn: string;
  flightCost: string;
  convenienceFee: string;
  insurance: string;
};

type PastTrip = {
  id: string;
  route: string;
  airline: string;
  date: string;
  status: string;
  total: string;
};

const upcomingTrips: UpcomingTrip[] = [
  {
    id: "up-1",
    route: "mia to rdu",
    airline: "southwest",
    date: "feb 13",
    departureTime: "8:45 am",
    status: "confirmed",
    statusColor: "#32D74B",
    total: "$213.96",
    autoCheckIn: "feb 12 · 8:45 am",
    flightCost: "$187.00",
    convenienceFee: "$14.96",
    insurance: "$12.00",
  },
  {
    id: "up-2",
    route: "atl to rdu",
    airline: "delta",
    date: "mar 07",
    departureTime: "9:10 am",
    status: "pending",
    statusColor: "#FF9F0A",
    total: "$187.22",
    autoCheckIn: "mar 06 · 9:10 am",
    flightCost: "$162.24",
    convenienceFee: "$12.98",
    insurance: "$12.00",
  },
];

const pastTrips: PastTrip[] = [
  { id: "past-1", route: "nyc to rdu", airline: "jetblue", date: "jan 20", status: "completed", total: "$241.20" },
  { id: "past-2", route: "mia to rdu", airline: "american", date: "dec 09", status: "completed", total: "$226.40" },
];

export default function TravelPage() {
  const [mode, setMode] = useState<Mode>("upcoming");
  const [showEmpty, setShowEmpty] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setShowEmpty(false);
    setExpandedId(null);
  }, [mode]);

  return (
    <main style={{ minHeight: "100vh", background: colors.bg, color: colors.white, display: "flex", justifyContent: "center", padding: "1rem 1rem 0" }}>
      <div style={{ width: "100%", maxWidth: "390px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>my trips</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
          {(["upcoming", "past"] as Mode[]).map((entry) => (
            <button key={entry} type="button" onClick={() => setMode(entry)} style={{ minHeight: "38px", borderRadius: "100px", border: "none", background: mode === entry ? colors.blue : colors.card, color: mode === entry ? colors.white : colors.muted, cursor: "pointer" }}>
              {entry}
            </button>
          ))}
        </div>

        <button type="button" onClick={() => setShowEmpty((prev) => !prev)} style={{ border: "none", background: "transparent", color: colors.muted, fontSize: "11px", textAlign: "left", marginBottom: "10px", cursor: "pointer", padding: 0 }}>
          toggle empty state
        </button>

        {showEmpty ? (
          <section style={{ textAlign: "center", marginTop: "48px" }}>
            <p style={{ marginBottom: "12px", color: colors.muted }}>no trips yet.</p>
            <Link href="/book" style={{ background: colors.blue, color: colors.white, padding: "11px 20px", borderRadius: "100px", textDecoration: "none", display: "inline-flex", cursor: "pointer" }}>
              make it happen.
            </Link>
          </section>
        ) : mode === "upcoming" ? (
          <section style={{ display: "grid", gap: "10px" }}>
            {upcomingTrips.map((trip) => (
              <article key={trip.id} style={{ border: colors.border, borderRadius: "11px", background: colors.card, padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                  <p style={{ fontSize: "14px", fontWeight: 600 }}>{trip.route}</p>
                  <p style={{ fontSize: "13px", color: colors.blue }}>{trip.total}</p>
                </div>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", marginBottom: "6px" }}>
                  {trip.airline} · {trip.date}
                </p>
                <span
                  style={{
                    display: "inline-flex",
                    borderRadius: "100px",
                    border: "0.5px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.08)",
                    color: trip.statusColor,
                    fontSize: "11px",
                    padding: "4px 8px",
                    marginBottom: "9px",
                  }}
                >
                  {trip.status}
                </span>

                {expandedId === trip.id && (
                  <div
                    style={{
                      marginTop: "4px",
                      marginBottom: "10px",
                      background: "#111111",
                      border: colors.border,
                      borderRadius: "11px",
                      padding: "12px",
                    }}
                  >
                    <p style={{ fontSize: "11px", color: colors.muted, marginBottom: "8px" }}>trip details</p>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", color: colors.muted }}>flight route</span>
                      <span style={{ fontSize: "12px" }}>{trip.route}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", color: colors.muted }}>airline</span>
                      <span style={{ fontSize: "12px" }}>{trip.airline}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", color: colors.muted }}>departure time</span>
                      <span style={{ fontSize: "12px" }}>{trip.departureTime}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", color: colors.muted }}>traveler status</span>
                      <span style={{ fontSize: "12px", color: trip.statusColor }}>{trip.status}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ fontSize: "12px", color: colors.muted }}>auto check-in</span>
                      <span style={{ fontSize: "12px" }}>{trip.autoCheckIn}</span>
                    </div>
                    <div style={{ borderTop: colors.border, paddingTop: "10px", marginBottom: "8px" }}>
                      <p style={{ fontSize: "11px", color: colors.muted, marginBottom: "8px" }}>price breakdown</p>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "12px", color: colors.muted }}>flight cost</span>
                        <span style={{ fontSize: "12px" }}>{trip.flightCost}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "12px", color: colors.muted }}>convenience fee</span>
                        <span style={{ fontSize: "12px" }}>{trip.convenienceFee}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "12px", color: colors.muted }}>insurance</span>
                        <span style={{ fontSize: "12px" }}>{trip.insurance}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600 }}>total</span>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: colors.blue }}>{trip.total}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedId(null)}
                      style={{ border: "none", background: "transparent", color: colors.blue, fontSize: "12px", cursor: "pointer", padding: 0, marginTop: "4px" }}
                    >
                      close
                    </button>
                  </div>
                )}

                {expandedId !== trip.id && (
                  <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => setExpandedId(trip.id)}
                      style={{ border: "none", background: "transparent", color: colors.blue, fontSize: "12px", cursor: "pointer", padding: 0 }}
                    >
                      view details
                    </button>
                  </div>
                )}
              </article>
            ))}
          </section>
        ) : (
          <section style={{ display: "grid", gap: "10px" }}>
            {pastTrips.map((trip) => (
              <article key={trip.id} style={{ border: colors.border, borderRadius: "11px", background: colors.card, padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                  <p style={{ fontSize: "14px", fontWeight: 600 }}>{trip.route}</p>
                  <p style={{ fontSize: "13px", color: colors.blue }}>{trip.total}</p>
                </div>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", marginBottom: "6px" }}>
                  {trip.airline} · {trip.date}
                </p>
                <span
                  style={{
                    display: "inline-flex",
                    borderRadius: "100px",
                    border: "0.5px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)",
                    color: "rgba(255,255,255,0.65)",
                    fontSize: "11px",
                    padding: "4px 8px",
                    marginBottom: "9px",
                  }}
                >
                  {trip.status}
                </span>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                  <Link href="/book" style={{ border: colors.border, borderRadius: "100px", padding: "6px 10px", textDecoration: "none", color: colors.white, fontSize: "12px", cursor: "pointer" }}>
                    book again
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}

        <BottomTabs active="travel" />
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BottomTabs } from "../components/BottomTabs";
import { airports, colors } from "../lib/presenceData";

type Deal = {
  destination: string;
  dates: string;
  type?: string;
  price: string;
  savings: string;
};

const baseDeals: Deal[] = [
  { destination: "mia", dates: "feb 21-24", type: "nonstop", price: "$89", savings: "save $121" },
  { destination: "atl", dates: "mar 7-mar 10", type: "nonstop", price: "$67", savings: "save $113" },
  { destination: "nyc", dates: "feb 28-mar 2", price: "$112", savings: "save $178" },
];

export default function HomePage() {
  const [originCode, setOriginCode] = useState("RDU");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [displayDeals, setDisplayDeals] = useState(baseDeals);

  useEffect(() => {
    setDisplayDeals(baseDeals);
  }, [originCode]);

  const suggestions = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) {
      return airports.slice(0, 5);
    }
    return airports
      .filter((airport) => {
        return (
          airport.code.toLowerCase().includes(value) ||
          airport.city.includes(value) ||
          airport.name.includes(value)
        );
      })
      .slice(0, 6);
  }, [query]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: colors.bg,
        color: colors.white,
        display: "flex",
        justifyContent: "center",
        padding: "1rem 1rem 0",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "390px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header style={{ marginTop: "6px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.48)", marginBottom: "4px" }}>good morning,</p>
              <p style={{ fontSize: "16px", fontWeight: 500 }}>marcus</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPickerOpen((prev) => !prev)}
              style={{
                border: "none",
                borderRadius: "100px",
                minHeight: "34px",
                padding: "0 12px",
                background: colors.blue,
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {originCode} edit
            </button>
          </div>

          {isPickerOpen && (
            <div style={{ marginTop: "10px" }}>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="search city or airport code..."
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: colors.border,
                  color: "#ffffff",
                  padding: "10px 12px",
                  borderRadius: "11px",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  marginTop: "6px",
                  border: colors.border,
                  borderRadius: "11px",
                  overflow: "hidden",
                  background: "#111111",
                }}
              >
                {suggestions.map((airport) => (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={() => {
                      setOriginCode(airport.code);
                      setIsPickerOpen(false);
                      setQuery("");
                    }}
                    style={{
                      width: "100%",
                      border: "none",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      background: "transparent",
                      padding: "10px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      color: "rgba(255,255,255,0.76)",
                      fontSize: "12px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span>{airport.city}</span>
                    <span style={{ color: colors.blue, fontWeight: 500 }}>{airport.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        <section
          style={{
            border: colors.border,
            background: "rgba(26,110,255,0.14)",
            borderRadius: "11px",
            padding: "14px",
            marginBottom: "18px",
          }}
        >
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.66)", marginBottom: "8px" }}>next home game</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div>
              <h1 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>next home game</h1>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>feb 14 · 7:00 pm</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "28px", fontWeight: 600, lineHeight: 1, color: colors.blue, marginBottom: "4px" }}>12</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.62)" }}>days away</p>
            </div>
          </div>
          <Link
            href="/book"
            style={{
              width: "100%",
              border: "none",
              background: colors.blue,
              color: "#ffffff",
              borderRadius: "100px",
              minHeight: "42px",
              fontSize: "13px",
              fontWeight: 500,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            make it happen.
          </Link>
        </section>

        <section style={{ marginBottom: "18px" }}>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.62)", marginBottom: "8px" }}>deals from {originCode}</p>
          <div style={{ display: "grid", gap: "8px" }}>
            {displayDeals.map((deal) => (
              <article
                key={deal.destination}
                style={{
                  border: colors.border,
                  borderRadius: "11px",
                  padding: "11px 12px",
                  background: colors.card,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>
                    {originCode} {"->"} {deal.destination}
                  </p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.66)" }}>
                    {deal.dates} {deal.type ? `· ${deal.type}` : ""}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "18px", fontWeight: 600, marginBottom: "3px" }}>{deal.price}</p>
                  <p style={{ fontSize: "12px", color: colors.blue }}>{deal.savings}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <BottomTabs active="home" />
      </div>
    </main>
  );
}

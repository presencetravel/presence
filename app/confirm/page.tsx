"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BottomTabs } from "../components/BottomTabs";
import { colors } from "../lib/presenceData";

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", whiteSpace: "nowrap" }}>{label}</span>
      <span style={{ flex: 1, borderBottom: "1px dotted rgba(255,255,255,0.2)" }} />
      <span style={{ fontSize: "12px", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

export default function ConfirmPage() {
  const [pulse, setPulse] = useState(true);
  useEffect(() => {
    const timer = setInterval(() => setPulse((prev) => !prev), 700);
    return () => clearInterval(timer);
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: colors.bg, color: colors.white, display: "flex", justifyContent: "center", padding: "1rem 1rem 0" }}>
      <div style={{ width: "100%", maxWidth: "390px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
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
          <ReceiptRow label="flight" value="mia to rdu southwest" />
          <ReceiptRow label="departs" value="feb 13 8:45 am" />
          <ReceiptRow label="traveler text sent" value="info pending" />
          <ReceiptRow label="auto check-in" value="feb 12 8:45 am" />
          <ReceiptRow label="flight" value="$187.00" />
          <ReceiptRow label="convenience fee" value="$14.96" />
          <ReceiptRow label="insurance" value="$12.00" />
          <ReceiptRow label="total charged" value="$213.96" />
        </section>

        <Link href="/home" style={{ width: "100%", minHeight: "44px", borderRadius: "100px", background: colors.blue, color: colors.white, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "14px", marginBottom: "10px", cursor: "pointer" }}>
          back to home
        </Link>

        <BottomTabs active="home" />
      </div>
    </main>
  );
}

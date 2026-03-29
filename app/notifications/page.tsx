"use client";

import { useEffect, useState } from "react";
import { BottomTabs } from "../components/BottomTabs";
import { colors } from "../lib/presenceData";

type Notice = {
  title: string;
  text: string;
  time: string;
  color: string;
  unread?: boolean;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<{ today: Notice[]; yesterday: Notice[] }>({ today: [], yesterday: [] });

  useEffect(() => {
    setItems({
      today: [
        { title: "game in 5 days", text: "your game is feb 14. haven't booked anyone yet - want to?", time: "9:00 am", color: colors.blue, unread: true },
        { title: "deal alert - mia", text: "flights from mia just hit $89. that is $121 off the usual price.", time: "7:32 am", color: "#32D74B", unread: true },
      ],
      yesterday: [
        { title: "checking them in tomorrow", text: "we are handling check-in for your traveler's 8:45 am flight. nothing you need to do.", time: "8:45 am", color: "#FF9F0A" },
        { title: "they're booked", text: "done. your traveler is locked in for your feb 14 game. they got the text.", time: "2:10 pm", color: colors.blue },
        { title: "you're verified", text: "your athlete status is confirmed. presence is ready when you are.", time: "11:03 am", color: colors.blue },
      ],
    });
  }, []);

  const card = (entry: Notice) => (
    <article key={`${entry.title}-${entry.time}`} style={{ border: colors.border, borderRadius: "11px", background: colors.card, padding: "10px 12px", display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "8px" }}>
      <span style={{ width: "14px", height: "14px", borderRadius: "4px", background: entry.color, flexShrink: 0, marginTop: "2px" }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>{entry.title}</p>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", lineHeight: 1.35, marginBottom: "4px" }}>{entry.text}</p>
        <p style={{ fontSize: "11px", color: colors.muted }}>{entry.time}</p>
      </div>
      {entry.unread && <span style={{ width: "6px", height: "6px", borderRadius: "100px", background: colors.blue, marginTop: "5px" }} />}
    </article>
  );

  return (
    <main style={{ minHeight: "100vh", background: colors.bg, color: colors.white, display: "flex", justifyContent: "center", padding: "1rem 1rem 0" }}>
      <div style={{ width: "100%", maxWidth: "390px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>notifications</h1>
        <p style={{ fontSize: "12px", color: colors.muted, marginBottom: "6px" }}>today</p>
        {items.today.map(card)}
        <p style={{ fontSize: "12px", color: colors.muted, marginBottom: "6px", marginTop: "8px" }}>yesterday</p>
        {items.yesterday.map(card)}
        <BottomTabs active="home" />
      </div>
    </main>
  );
}

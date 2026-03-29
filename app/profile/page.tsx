"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BottomTabs } from "../components/BottomTabs";
import { airports, colors } from "../lib/presenceData";

type Editable = "name" | "school" | "sport" | "airport" | "";

export default function ProfilePage() {
  const [editing, setEditing] = useState<Editable>("");
  const [name, setName] = useState("marcus williams");
  const [school, setSchool] = useState("unc chapel hill");
  const [sport, setSport] = useState("basketball");
  const [homeAirport, setHomeAirport] = useState("rdu");
  const [airportQuery, setAirportQuery] = useState("");

  useEffect(() => {
    if (editing !== "airport") {
      setAirportQuery("");
    }
  }, [editing]);

  const airportMatches = useMemo(() => {
    const value = airportQuery.toLowerCase().trim();
    if (!value) return airports.slice(0, 6);
    return airports.filter((entry) => entry.code.toLowerCase().includes(value) || entry.city.includes(value)).slice(0, 6);
  }, [airportQuery]);

  const row = (label: string, value: string, key: Editable, setter: (v: string) => void) => (
    <button
      type="button"
      onClick={() => setEditing(editing === key ? "" : key)}
      style={{ width: "100%", border: colors.border, borderRadius: "11px", background: colors.card, padding: "10px 12px", marginBottom: "8px", textAlign: "left", cursor: "pointer", color: colors.white }}
    >
      <p style={{ color: colors.muted, fontSize: "11px", marginBottom: "5px" }}>{label}</p>
      {editing === key ? (
        <input autoFocus value={value} onChange={(event) => setter(event.target.value)} style={{ width: "100%", border: colors.border, borderRadius: "11px", background: "#111111", color: colors.white, padding: "8px 10px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
      ) : (
        <p style={{ fontSize: "13px" }}>{value}</p>
      )}
    </button>
  );

  return (
    <main style={{ minHeight: "100vh", background: colors.bg, color: colors.white, display: "flex", justifyContent: "center", padding: "1rem 1rem 0" }}>
      <div style={{ width: "100%", maxWidth: "390px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <section style={{ textAlign: "center", marginBottom: "12px" }}>
          <span style={{ width: "58px", height: "58px", borderRadius: "100px", background: colors.blue, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "8px" }}>
            MW
          </span>
          <p style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>{name}</p>
          <p style={{ fontSize: "12px", color: colors.muted }}>{school}</p>
          <p style={{ fontSize: "12px", color: colors.muted, marginBottom: "6px" }}>{sport}</p>
          <span style={{ fontSize: "11px", color: "#32D74B", border: "0.5px solid rgba(50,215,75,0.45)", borderRadius: "100px", padding: "4px 8px" }}>
            verified
          </span>
        </section>

        <p style={{ fontSize: "12px", color: colors.muted, marginBottom: "6px" }}>edit profile</p>
        {row("name", name, "name", setName)}
        {row("school", school, "school", setSchool)}
        {row("sport", sport, "sport", setSport)}
        {row("home airport", homeAirport, "airport", setHomeAirport)}

        {editing === "airport" && (
          <div style={{ border: colors.border, borderRadius: "11px", background: "#111111", padding: "8px", marginBottom: "10px" }}>
            <input
              value={airportQuery}
              onChange={(event) => setAirportQuery(event.target.value)}
              placeholder="search airport..."
              style={{ width: "100%", border: colors.border, borderRadius: "11px", background: colors.card, color: colors.white, padding: "8px 10px", fontSize: "12px", outline: "none", boxSizing: "border-box", marginBottom: "6px" }}
            />
            {airportMatches.map((entry) => (
              <button
                key={entry.code}
                type="button"
                onClick={() => {
                  setHomeAirport(entry.code.toLowerCase());
                  setEditing("");
                }}
                style={{ width: "100%", background: "transparent", border: "none", color: "rgba(255,255,255,0.8)", padding: "7px 4px", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ fontSize: "12px" }}>{entry.city}</span>
                <span style={{ color: colors.blue, fontSize: "12px" }}>{entry.code}</span>
              </button>
            ))}
          </div>
        )}

        <p style={{ fontSize: "12px", color: colors.muted, marginBottom: "6px", marginTop: "4px" }}>account</p>
        <div style={{ border: colors.border, borderRadius: "11px", background: colors.card, padding: "10px 12px", marginBottom: "12px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px" }}>home airport {homeAirport.toUpperCase()}</span>
          <button type="button" onClick={() => setEditing("airport")} style={{ border: "none", background: "transparent", color: colors.blue, fontSize: "12px", cursor: "pointer" }}>
            edit
          </button>
        </div>

        <Link href="/" style={{ width: "100%", minHeight: "42px", borderRadius: "100px", border: colors.border, color: colors.muted, background: "transparent", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "10px", cursor: "pointer" }}>
          sign out
        </Link>

        <BottomTabs active="profile" />
      </div>
    </main>
  );
}

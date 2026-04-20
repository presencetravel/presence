"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { BottomTabs } from "../components/BottomTabs";
import { airports, colors } from "../lib/presenceData";

type Editable = "name" | "school" | "sport" | "airport" | "";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Editable>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [initials, setInitials] = useState("--");
  const [verified, setVerified] = useState(false);

  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [sport, setSport] = useState("");
  const [homeAirport, setHomeAirport] = useState("");
  const [airportQuery, setAirportQuery] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }
      setUserId(user.id);
      const { data: profile } = await supabase.from("profiles").select("full_name, school, sport, home_airport, verified").eq("id", user.id).single();
      if (profile) {
        const n = (profile.full_name as string) ?? "";
        const s = (profile.school as string) ?? "";
        const sp = (profile.sport as string) ?? "";
        const ha = (profile.home_airport as string) ?? "";
        const v = (profile.verified as boolean) ?? false;
        setName(n);
        setSchool(s);
        setSport(sp);
        setHomeAirport(ha);
        setVerified(v);
        const parts = n.trim().split(" ");
        const derived = parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : n.slice(0, 2).toUpperCase();
        setInitials(derived);
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (editing !== "airport") setAirportQuery("");
  }, [editing]);

  const airportMatches = useMemo(() => {
    const value = airportQuery.toLowerCase().trim();
    if (!value) return airports.slice(0, 6);
    return airports.filter((a) => a.code.toLowerCase().includes(value) || a.city.toLowerCase().includes(value)).slice(0, 6);
  }, [airportQuery]);

  const handleSave = async (field: Editable, value: string) => {
    if (!userId) return;
    setSaving(true);
    const fieldMap: Record<string, string> = {
      name: "full_name",
      school: "school",
      sport: "sport",
      airport: "home_airport",
    };
    const col = fieldMap[field];
    if (col) {
      await supabase.from("profiles").update({ [col]: value }).eq("id", userId);
    }
    if (field === "name") {
      const parts = value.trim().split(" ");
      const derived = parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : value.slice(0, 2).toUpperCase();
      setInitials(derived);
    }
    setSaving(false);
    setEditing("");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const row = (label: string, value: string, key: Editable, setter: (v: string) => void) => (
    <div style={{ border: colors.border, borderRadius: "11px", background: colors.card, padding: "10px 12px", marginBottom: "8px" }}>
      <p style={{ color: colors.muted, fontSize: "11px", marginBottom: "5px" }}>{label}</p>
      {editing === key ? (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            autoFocus
            value={value}
            onChange={(e) => setter(e.target.value)}
            style={{ flex: 1, border: colors.border, borderRadius: "11px", background: "#111111", color: colors.white, padding: "8px 10px", fontSize: "13px", outline: "none", boxSizing: "border-box" as const }}
          />
          <button
            type="button"
            onClick={() => void handleSave(key, value)}
            disabled={saving}
            style={{ border: "none", background: colors.blue, color: colors.white, borderRadius: "100px", padding: "6px 14px", fontSize: "12px", cursor: "pointer", opacity: saving ? 0.7 : 1, whiteSpace: "nowrap" as const }}
          >
            {saving ? "saving" : "save"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(key)}
          style={{ width: "100%", background: "transparent", border: "none", color: colors.white, padding: 0, textAlign: "left", cursor: "pointer", fontSize: "13px" }}
        >
          {value || <span style={{ color: "#333" }}>—</span>}
        </button>
      )}
    </div>
  );

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

        <section style={{ textAlign: "center", marginBottom: "20px", marginTop: "6px" }}>
          <div style={{ width: "58px", height: "58px", borderRadius: "100px", background: colors.blue, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 600, marginBottom: "10px" }}>
            {initials}
          </div>
          <p style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>{name}</p>
          <p style={{ fontSize: "12px", color: colors.muted, marginBottom: "2px" }}>{school}</p>
          <p style={{ fontSize: "12px", color: colors.muted, marginBottom: "8px" }}>{sport}</p>
          {verified && (
            <span style={{ fontSize: "11px", color: "#22c55e", border: "0.5px solid rgba(34,197,94,0.4)", borderRadius: "100px", padding: "4px 10px" }}>
              verified
            </span>
          )}
        </section>

        <p style={{ fontSize: "12px", color: colors.muted, marginBottom: "8px", letterSpacing: "0.5px", textTransform: "uppercase" }}>edit profile</p>
        {row("name", name, "name", setName)}
        {row("school", school, "school", setSchool)}
        {row("sport", sport, "sport", setSport)}
        {row("home airport", homeAirport, "airport", setHomeAirport)}

        {editing === "airport" && (
          <div style={{ border: colors.border, borderRadius: "11px", background: "#111111", padding: "8px", marginBottom: "10px" }}>
            <input
              value={airportQuery}
              onChange={(e) => setAirportQuery(e.target.value)}
              placeholder="search airport..."
              style={{ width: "100%", border: colors.border, borderRadius: "11px", background: colors.card, color: colors.white, padding: "8px 10px", fontSize: "12px", outline: "none", boxSizing: "border-box" as const, marginBottom: "6px" }}
            />
            {airportMatches.map((a) => (
              <button
                key={a.code}
                type="button"
                onClick={() => {
                  setHomeAirport(a.code.toLowerCase());
                  void handleSave("airport", a.code.toLowerCase());
                }}
                style={{ width: "100%", background: "transparent", border: "none", color: "rgba(255,255,255,0.8)", padding: "7px 4px", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between" }}
              >
                <span style={{ fontSize: "12px" }}>{a.city}</span>
                <span style={{ color: colors.blue, fontSize: "12px" }}>{a.code}</span>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => void handleSignOut()}
          style={{ width: "100%", minHeight: "42px", borderRadius: "100px", border: colors.border, color: colors.muted, background: "transparent", fontSize: "13px", cursor: "pointer", marginTop: "8px" }}
        >
          sign out
        </button>

        <BottomTabs active="profile" />
      </div>
    </main>
  );
}
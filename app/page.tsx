"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import { airports, colors, schools, sports } from "./lib/presenceData";

type Errors = Record<"email" | "name" | "school" | "sport" | "airport" | "password", string>;

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [sport, setSport] = useState("");
  const [airport, setAirport] = useState("");
  const [password, setPassword] = useState("");
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [airportOpen, setAirportOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<Errors>({
    email: "",
    name: "",
    school: "",
    sport: "",
    airport: "",
    password: "",
  });

  const schoolSuggestions = useMemo(() => {
    const value = school.trim().toLowerCase();
    if (value.length < 2) {
      return [];
    }
    return schools.filter((entry) => entry.includes(value)).slice(0, 6);
  }, [school]);

  const airportSuggestions = useMemo(() => {
    const value = airport.trim().toLowerCase();
    if (value.length < 1) {
      return [];
    }
    return airports
      .filter((entry) => {
        return (
          entry.code.toLowerCase().includes(value) ||
          entry.city.includes(value) ||
          entry.name.includes(value)
        );
      })
      .slice(0, 7);
  }, [airport]);

  useEffect(() => {
    if (errors.school && school.trim()) {
      setErrors((prev) => ({ ...prev, school: "" }));
    }
  }, [school, errors.school]);

  const validate = () => {
    const emailTrim = email.trim();
    const emailOk = emailTrim && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim);
    const next: Errors = {
      email: !emailTrim ? "email is required." : !emailOk ? "enter a valid email address." : "",
      name: name.trim() ? "" : "full name is required.",
      school: school.trim() ? "" : "school is required.",
      sport: sport.trim() ? "" : "sport is required.",
      airport: airport.trim() ? "" : "home airport is required.",
      password: password.trim() ? "" : "password is required.",
    };
    setErrors(next);
    return Object.values(next).every((v) => !v);
  };

  const handleCreateAccount = async () => {
    setSubmitError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            school: school.trim(),
            sport: sport.trim(),
            home_airport: airport.trim(),
          },
        },
      });

      if (authError) {
        setSubmitError(authError.message);
        return;
      }

      router.push("/verify");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "something went wrong. try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: colors.card,
    border: colors.border,
    color: colors.white,
    padding: "10px 12px",
    borderRadius: "11px",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  return (
    <main
      style={{
        background: colors.bg,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.2rem 1rem",
        color: colors.white,
      }}
    >
      <div style={{ width: "100%", maxWidth: "390px" }}>
        <div style={{ textAlign: "center", fontSize: "22px", fontWeight: 500, marginBottom: "24px" }}>
          <span style={{ color: colors.blue }}>p</span>resence
        </div>
        <section style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 500, lineHeight: 1.2, marginBottom: "8px" }}>
            made for <span style={{ color: colors.blue }}>athletes only.</span>
          </h1>
          <p style={{ fontSize: "13px", color: colors.muted }}>create your account to get started.</p>
        </section>

        <div style={{ marginBottom: "10px" }}>
          <p style={{ fontSize: "11px", color: colors.muted, marginBottom: "5px" }}>email</p>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@school.edu"
            style={inputStyle}
          />
          {!!errors.email && <p style={{ color: "#FF3B30", fontSize: "11px", marginTop: "4px" }}>{errors.email}</p>}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <p style={{ fontSize: "11px", color: colors.muted, marginBottom: "5px" }}>full name</p>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="first last"
            style={inputStyle}
          />
          {!!errors.name && <p style={{ color: "#FF3B30", fontSize: "11px", marginTop: "4px" }}>{errors.name}</p>}
        </div>

        <div style={{ marginBottom: "10px", position: "relative" }}>
          <p style={{ fontSize: "11px", color: colors.muted, marginBottom: "5px" }}>school</p>
          <input
            value={school}
            onFocus={() => setSchoolOpen(true)}
            onChange={(event) => {
              setSchool(event.target.value);
              setSchoolOpen(true);
            }}
            placeholder="start typing your school..."
            style={inputStyle}
          />
          {schoolOpen && schoolSuggestions.length > 0 && (
            <div style={{ background: "#141414", border: colors.border, borderRadius: "11px", marginTop: "4px" }}>
              {schoolSuggestions.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  onClick={() => {
                    setSchool(entry);
                    setSchoolOpen(false);
                  }}
                  style={{
                    width: "100%",
                    border: "none",
                    borderBottom: colors.border,
                    background: "transparent",
                    textAlign: "left",
                    color: "rgba(255,255,255,0.7)",
                    padding: "9px 12px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  {entry}
                </button>
              ))}
            </div>
          )}
          {!!errors.school && <p style={{ color: "#FF3B30", fontSize: "11px", marginTop: "4px" }}>{errors.school}</p>}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <p style={{ fontSize: "11px", color: colors.muted, marginBottom: "5px" }}>sport</p>
          <select value={sport} onChange={(event) => setSport(event.target.value)} style={inputStyle}>
            <option value="">select your sport</option>
            {sports.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
          {!!errors.sport && <p style={{ color: "#FF3B30", fontSize: "11px", marginTop: "4px" }}>{errors.sport}</p>}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <p style={{ fontSize: "11px", color: colors.muted, marginBottom: "5px" }}>home airport</p>
          <input
            value={airport}
            onFocus={() => setAirportOpen(true)}
            onChange={(event) => {
              setAirport(event.target.value);
              setAirportOpen(true);
            }}
            placeholder="city or airport code..."
            style={inputStyle}
          />
          {airportOpen && airportSuggestions.length > 0 && (
            <div style={{ background: "#141414", border: colors.border, borderRadius: "11px", marginTop: "4px" }}>
              {airportSuggestions.map((entry) => (
                <button
                  key={entry.code}
                  type="button"
                  onClick={() => {
                    setAirport(`${entry.city} (${entry.code})`);
                    setAirportOpen(false);
                  }}
                  style={{
                    width: "100%",
                    border: "none",
                    borderBottom: colors.border,
                    background: "transparent",
                    textAlign: "left",
                    color: "rgba(255,255,255,0.7)",
                    padding: "9px 12px",
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{entry.city}</span>
                  <span style={{ color: colors.blue }}>{entry.code}</span>
                </button>
              ))}
            </div>
          )}
          {!!errors.airport && <p style={{ color: "#FF3B30", fontSize: "11px", marginTop: "4px" }}>{errors.airport}</p>}
        </div>

        <div style={{ marginBottom: "18px" }}>
          <p style={{ fontSize: "11px", color: colors.muted, marginBottom: "5px" }}>password</p>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="enter password"
            style={inputStyle}
          />
          {!!errors.password && (
            <p style={{ color: "#FF3B30", fontSize: "11px", marginTop: "4px" }}>{errors.password}</p>
          )}
        </div>

        {!!submitError && (
          <p style={{ color: "#FF3B30", fontSize: "12px", marginBottom: "12px", lineHeight: 1.4 }}>{submitError}</p>
        )}

        <button
          type="button"
          disabled={submitting}
          onClick={() => void handleCreateAccount()}
          style={{
            width: "100%",
            background: colors.blue,
            color: colors.white,
            border: "none",
            padding: "13px",
            borderRadius: "100px",
            fontSize: "13px",
            cursor: submitting ? "not-allowed" : "pointer",
            marginBottom: "10px",
            opacity: submitting ? 0.85 : 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {submitting && <span className="presence-spinner" aria-hidden />}
          {submitting ? "creating account..." : "create account"}
        </button>
        <Link
          href="/home"
          style={{
            width: "100%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            color: colors.muted,
            border: colors.border,
            padding: "12px",
            borderRadius: "100px",
            fontSize: "13px",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          i already have an account
        </Link>
      </div>
    </main>
  );
}
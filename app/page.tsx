"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { colors } from "./lib/presenceData";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [view, setView] = useState<"signup" | "login">("signup");

  // signup fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [sport, setSport] = useState("");
  const [airport, setAirport] = useState("");
  const [password, setPassword] = useState("");

  // login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const handleLogin = async () => {
    setError("");
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError("email and password are required.");
      return;
    }
    setSubmitting(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (authError) {
        setError(authError.message);
        return;
      }
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    setError("");
    if (!email.trim() || !name.trim() || !school.trim() || !sport.trim() || !airport.trim() || !password.trim()) {
      setError("all fields are required.");
      return;
    }
    setSubmitting(true);
    try {
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
        setError(authError.message);
        return;
      }
      router.push("/verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "something went wrong.");
    } finally {
      setSubmitting(false);
    }
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

        {/* wordmark */}
        <div style={{ textAlign: "center", fontSize: "22px", fontWeight: 500, marginBottom: "24px" }}>
          <span style={{ color: colors.blue }}>p</span>resence
        </div>

        {view === "login" ? (
          <>
            <section style={{ textAlign: "center", marginBottom: "24px" }}>
              <h1 style={{ fontSize: "26px", fontWeight: 500, lineHeight: 1.2, marginBottom: "8px" }}>
                welcome back.
              </h1>
              <p style={{ fontSize: "13px", color: colors.muted }}>sign in to your account.</p>
            </section>

            <div style={{ marginBottom: "10px" }}>
              <p style={{ fontSize: "11px", color: colors.muted, marginBottom: "5px" }}>email</p>
              <input
                type="email"
                autoComplete="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@school.edu"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "18px" }}>
              <p style={{ fontSize: "11px", color: colors.muted, marginBottom: "5px" }}>password</p>
              <input
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="enter password"
                style={inputStyle}
              />
            </div>

            {!!error && (
              <p style={{ color: "#FF3B30", fontSize: "12px", marginBottom: "12px", lineHeight: 1.4 }}>{error}</p>
            )}

            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleLogin()}
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
              }}
            >
              {submitting ? "signing in..." : "sign in"}
            </button>

            <button
              type="button"
              onClick={() => { setError(""); setView("signup"); }}
              style={{
                width: "100%",
                background: "transparent",
                color: colors.muted,
                border: colors.border,
                padding: "12px",
                borderRadius: "100px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              create an account
            </button>
          </>
        ) : (
          <>
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <p style={{ fontSize: "11px", color: colors.muted, marginBottom: "5px" }}>full name</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="first last"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <p style={{ fontSize: "11px", color: colors.muted, marginBottom: "5px" }}>school</p>
              <input
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="university name"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <p style={{ fontSize: "11px", color: colors.muted, marginBottom: "5px" }}>sport</p>
              <input
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                placeholder="basketball, football, soccer..."
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <p style={{ fontSize: "11px", color: colors.muted, marginBottom: "5px" }}>home airport</p>
              <input
                value={airport}
                onChange={(e) => setAirport(e.target.value)}
                placeholder="city or airport code"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "18px" }}>
              <p style={{ fontSize: "11px", color: colors.muted, marginBottom: "5px" }}>password</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="enter password"
                style={inputStyle}
              />
            </div>

            {!!error && (
              <p style={{ color: "#FF3B30", fontSize: "12px", marginBottom: "12px", lineHeight: 1.4 }}>{error}</p>
            )}

            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleSignUp()}
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
              }}
            >
              {submitting ? "creating account..." : "create account"}
            </button>

            <button
              type="button"
              onClick={() => { setError(""); setView("login"); }}
              style={{
                width: "100%",
                background: "transparent",
                color: colors.muted,
                border: colors.border,
                padding: "12px",
                borderRadius: "100px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              i already have an account
            </button>
          </>
        )}
      </div>
    </main>
  );
}
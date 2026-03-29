"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function TravelerTripPage() {
  const params = useParams<{ id: string }>();
  const [confirmed, setConfirmed] = useState(false);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [dob, setDob] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [known, setKnown] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(!!first && !!last && !!dob && !!idNumber);
  }, [first, last, dob, idNumber]);

  if (confirmed) {
    return (
      <main style={{ minHeight: "100vh", background: "#ffffff", color: "#111111", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
        <div style={{ width: "100%", maxWidth: "390px", textAlign: "center" }}>
          <span style={{ width: "54px", height: "54px", borderRadius: "100px", background: "#1A6EFF", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 12.8L10.2 17L18 8.7" stroke="white" strokeWidth="2" />
            </svg>
          </span>
          <h1 style={{ fontSize: "28px", marginBottom: "6px" }}>you're all set.</h1>
          <p style={{ color: "rgba(0,0,0,0.65)", fontSize: "13px" }}>your flight is confirmed. see you at the game.</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#ffffff", color: "#111111", display: "flex", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: "390px" }}>
        <p style={{ textAlign: "center", fontSize: "22px", marginBottom: "16px" }}>
          <span style={{ color: "#1A6EFF" }}>p</span>resence
        </p>
        <h1 style={{ fontSize: "30px", marginBottom: "8px" }}>you've been invited.</h1>
        <p style={{ color: "rgba(0,0,0,0.6)", fontSize: "13px", marginBottom: "12px" }}>complete your details to confirm your flight.</p>

        <input value={first} onChange={(event) => setFirst(event.target.value)} placeholder="first name" style={{ width: "100%", boxSizing: "border-box", background: "#f3f3f3", border: "1px solid #e0e0e0", borderRadius: "11px", color: "#111", padding: "10px 12px", marginBottom: "8px" }} />
        <input value={last} onChange={(event) => setLast(event.target.value)} placeholder="last name" style={{ width: "100%", boxSizing: "border-box", background: "#f3f3f3", border: "1px solid #e0e0e0", borderRadius: "11px", color: "#111", padding: "10px 12px", marginBottom: "8px" }} />
        <input value={dob} onChange={(event) => setDob(event.target.value)} type="date" style={{ width: "100%", boxSizing: "border-box", background: "#f3f3f3", border: "1px solid #e0e0e0", borderRadius: "11px", color: "#111", padding: "10px 12px", marginBottom: "8px" }} />
        <input value={idNumber} onChange={(event) => setIdNumber(event.target.value)} placeholder="passport or id number" style={{ width: "100%", boxSizing: "border-box", background: "#f3f3f3", border: "1px solid #e0e0e0", borderRadius: "11px", color: "#111", padding: "10px 12px", marginBottom: "8px" }} />
        <input value={known} onChange={(event) => setKnown(event.target.value)} placeholder="known traveler number optional" style={{ width: "100%", boxSizing: "border-box", background: "#f3f3f3", border: "1px solid #e0e0e0", borderRadius: "11px", color: "#111", padding: "10px 12px", marginBottom: "12px" }} />

        <section style={{ border: "1px solid #dfe7ff", borderRadius: "11px", background: "#f7faff", padding: "12px", marginBottom: "12px" }}>
          <p style={{ fontSize: "13px", marginBottom: "4px" }}>mia to rdu</p>
          <p style={{ fontSize: "12px", color: "rgba(0,0,0,0.65)", marginBottom: "4px" }}>feb 13 · southwest · departs 8:45 am</p>
          <span style={{ fontSize: "11px", color: "#1A6EFF", border: "1px solid #bfd5ff", borderRadius: "100px", padding: "3px 7px" }}>insurance included</span>
        </section>

        <button
          type="button"
          disabled={!ready}
          onClick={() => setConfirmed(true)}
          style={{ width: "100%", minHeight: "44px", border: "none", borderRadius: "100px", background: ready ? "#1A6EFF" : "#a9c8ff", color: "#fff", cursor: "pointer" }}
        >
          confirm my details
        </button>
        <p style={{ fontSize: "11px", color: "rgba(0,0,0,0.4)", marginTop: "10px" }}>trip id {params.id}</p>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { colors } from "../lib/presenceData";

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="3" stroke="white" strokeWidth="1.5" />
      <path d="M8 7.5L9.5 5H14.5L16 7.5" stroke="white" strokeWidth="1.5" />
      <circle cx="12" cy="13.5" r="3.5" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

export default function VerifyPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);

  useEffect(() => {
    setCanSubmit(!!selectedFileName);
  }, [selectedFileName]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: colors.bg,
        color: colors.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "390px" }}>
        <div style={{ textAlign: "center", fontSize: "22px", marginBottom: "24px" }}>
          <span style={{ color: colors.blue }}>p</span>resence
        </div>

        <section style={{ textAlign: "center", marginBottom: "22px" }}>
          <h1 style={{ fontSize: "28px", lineHeight: 1.2, fontWeight: 500, marginBottom: "8px" }}>
            prove you're <span style={{ color: colors.blue }}>on the roster.</span>
          </h1>
          <p style={{ fontSize: "13px", color: colors.muted, lineHeight: 1.45 }}>
            take a photo of your student id. we'll verify your status within 24 hours.
          </p>
        </section>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            border: "1px dashed rgba(255,255,255,0.3)",
            borderRadius: "11px",
            padding: "24px 16px 18px",
            textAlign: "center",
            marginBottom: "10px",
            width: "100%",
            background: "transparent",
            color: colors.white,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "100px",
              margin: "0 auto 12px",
              background: colors.blue,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CameraIcon />
          </div>
          <p style={{ fontSize: "14px", marginBottom: "6px" }}>take a photo of your student id</p>
          <p style={{ fontSize: "12px", color: colors.muted }}>make sure your name and school are visible</p>
          {!!selectedFileName && <p style={{ marginTop: "8px", fontSize: "11px", color: colors.blue }}>{selectedFileName}</p>}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(event) => {
            const file = event.target.files?.[0];
            setSelectedFileName(file?.name ?? "");
          }}
        />

        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "20px" }}>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "100px",
              background: colors.blue,
              marginTop: "6px",
              flexShrink: 0,
            }}
          />
          <p style={{ fontSize: "12px", lineHeight: 1.5, color: colors.blue }}>
            your info stays private. this is for access only - nothing is stored or shared after verification.
          </p>
        </div>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => router.push("/home")}
          style={{
            width: "100%",
            background: canSubmit ? colors.blue : "rgba(255,255,255,0.2)",
            color: colors.white,
            border: "none",
            padding: "13px",
            borderRadius: "100px",
            fontSize: "13px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          submit for review
        </button>

        <Link
          href="/locked"
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
          i'll do this later
        </Link>
      </div>
    </main>
  );
}

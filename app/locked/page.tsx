import Link from "next/link";
import { BottomTabs } from "../components/BottomTabs";
import { colors } from "../lib/presenceData";

const red = "#FF3B30";

type Deal = {
  route: string;
  price: string;
  savings: string;
};

const deals: Deal[] = [
  { route: "rdu to mia", price: "$89", savings: "save $121" },
  { route: "rdu to atl", price: "$67", savings: "save $113" },
  { route: "rdu to nyc", price: "$112", savings: "save $178" },
];

export default function LockedPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: colors.bg,
        color: colors.white,
        display: "flex",
        justifyContent: "center",
        padding: "1rem 1rem 0.6rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <div style={{ textAlign: "center", fontSize: "22px", fontWeight: 500, marginTop: "10px", marginBottom: "18px" }}>
          <span style={{ color: colors.blue }}>p</span>resence
        </div>

        <section
          style={{
            border: `1px solid rgba(255, 59, 48, 0.35)`,
            background: "rgba(255, 59, 48, 0.08)",
            borderRadius: "11px",
            padding: "14px",
            marginBottom: "16px",
          }}
        >
          <h1 style={{ fontSize: "18px", fontWeight: 600, color: red, marginBottom: "7px" }}>verification required</h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)", lineHeight: 1.45, marginBottom: "12px" }}>
            verify your athlete status to unlock booking. takes less than a minute.
          </p>
          <Link
            href="/verify"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "36px",
              padding: "0 14px",
              borderRadius: "100px",
              background: colors.blue,
              color: "#ffffff",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            verify now
          </Link>
        </section>

        <section style={{ display: "grid", gap: "10px", marginBottom: "18px", opacity: 0.25 }}>
          {deals.map((deal) => (
            <article
              key={deal.route}
              style={{
                border: colors.border,
                borderRadius: "11px",
                padding: "12px",
                background: colors.card,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "6px",
                }}
              >
                <p style={{ fontSize: "14px", fontWeight: 500 }}>{deal.route}</p>
                <p style={{ fontSize: "20px", fontWeight: 600 }}>{deal.price}</p>
              </div>
              <p style={{ fontSize: "12px", color: colors.blue, textAlign: "right" }}>{deal.savings}</p>
            </article>
          ))}
        </section>

        <div style={{ marginTop: "auto", marginBottom: "10px" }}>
          <Link
            href="/verify"
            style={{
              position: "relative",
              width: "100%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              borderRadius: "100px",
              background: "#2d2d2d",
              color: "rgba(255,255,255,0.35)",
              border: colors.border,
              minHeight: "46px",
              overflow: "hidden",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 500 }}>make it happen.</span>
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                color: "rgba(255,255,255,0.62)",
                background: "rgba(8,8,8,0.32)",
              }}
            >
              verify to unlock
            </span>
          </Link>
        </div>
        <BottomTabs active="home" />
      </div>
    </main>
  );
}

import Link from "next/link";
import { colors } from "../lib/presenceData";

type Tab = "home" | "travel" | "profile";

export function BottomTabs({ active }: { active: Tab }) {
  const tabStyle = (tab: Tab) => ({
    textAlign: "center" as const,
    color: active === tab ? colors.blue : "rgba(255,255,255,0.3)",
    fontSize: "12px",
    textDecoration: "none",
    minHeight: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column" as const,
    cursor: "pointer",
  });

  return (
    <nav
      aria-label="bottom tabs"
      style={{
        marginTop: "auto",
        borderTop: colors.border,
        padding: "8px 6px calc(12px + env(safe-area-inset-bottom, 0px))",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "4px",
      }}
    >
      <Link href="/home" style={tabStyle("home")}>
        {active === "home" && (
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "100px",
              background: colors.blue,
              marginBottom: "2px",
            }}
          />
        )}
        home
      </Link>
      <Link href="/travel" style={tabStyle("travel")}>
        {active === "travel" && (
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "100px",
              background: colors.blue,
              marginBottom: "2px",
            }}
          />
        )}
        travel
      </Link>
      <Link href="/profile" style={tabStyle("profile")}>
        {active === "profile" && (
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "100px",
              background: colors.blue,
              marginBottom: "2px",
            }}
          />
        )}
        profile
      </Link>
    </nav>
  );
}

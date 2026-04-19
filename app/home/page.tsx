"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { BottomTabs } from "../components/BottomTabs";
import { colors } from "../lib/presenceData";

type TripStatus =
  | "pending"
  | "traveler_submitted"
  | "athlete_confirmed"
  | "booked"
  | "declined";

type TripRequest = {
  id: string;
  status: TripStatus;
  trip_date: string;
  traveler_name: string;
};

type Game = {
  id: string;
  opponent: string;
  date: string;
  venue: string;
  daysAway: number;
};

const PLACEHOLDER_GAMES: Game[] = [
  {
    id: "game-1",
    opponent: "duke",
    date: "sat, jan 18",
    venue: "cameron indoor",
    daysAway: 4,
  },
  {
    id: "game-2",
    opponent: "carolina",
    date: "jan 25",
    venue: "smith center",
    daysAway: 11,
  },
  {
    id: "game-3",
    opponent: "wake forest",
    date: "feb 1",
    venue: "lawrence joel",
    daysAway: 18,
  },
];

function getStatusCounts(trips: TripRequest[]) {
  const booked = trips.filter((t) => t.status === "booked").length;
  const pending = trips.filter(
    (t) =>
      t.status === "pending" ||
      t.status === "traveler_submitted" ||
      t.status === "athlete_confirmed"
  ).length;
  const total = trips.length;
  return { booked, pending, total };
}

function getGameTrips(trips: TripRequest[], date: string) {
  return trips.filter((t) => t.trip_date === date);
}

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();

  const [initials, setInitials] = useState("--");
  const [trips, setTrips] = useState<TripRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const nextGame = PLACEHOLDER_GAMES[0];
  const upcomingGames = PLACEHOLDER_GAMES.slice(1);
  const nextGameTrips = getGameTrips(trips, nextGame.date);
  const { booked, pending, total } = getStatusCounts(nextGameTrips);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, verified")
        .eq("id", user.id)
        .single();

      if (profile) {
        if (!profile.verified) {
          router.push("/locked");
          return;
        }
        if (profile.full_name) {
          const parts = (profile.full_name as string).trim().split(" ");
          const derived =
            parts.length >= 2
              ? (parts[0][0] + parts[parts.length - 1][0]).toLowerCase()
              : parts[0].slice(0, 2).toLowerCase();
          setInitials(derived);
        }
      }

      const { data: tripData } = await supabase
        .from("trip_requests")
        .select("id, status, trip_date, traveler_name")
        .eq("athlete_id", user.id)
        .order("created_at", { ascending: false });

      if (tripData) {
        setTrips(tripData as TripRequest[]);
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: colors.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#333", fontSize: "13px" }}>loading</span>
      </div>
    );
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: colors.bg,
        color: colors.white,
        display: "flex",
        justifyContent: "center",
        padding: "1rem 1rem 0",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "390px",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          paddingBottom: "90px",
        }}
      >
        <header
          style={{
            marginTop: "6px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "22px",
              fontWeight: 600,
              letterSpacing: "-0.5px",
              color: colors.white,
            }}
          >
            <span style={{ color: "#1A6EFF" }}>p</span>resence
          </span>

          <button
            type="button"
            onClick={() => router.push("/profile")}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <span style={{ color: "#888", fontSize: "13px", fontWeight: 500 }}>
              {initials}
            </span>
          </button>
        </header>

        <section style={{ marginBottom: "20px" }}>
          <p
            style={{
              fontSize: "12px",
              color: "#555",
              margin: "0 0 12px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            next game
          </p>

          <div
            style={{
              background: "#0f0f0f",
              borderRadius: "11px",
              padding: "20px",
              border: "1px solid #1e1e1e",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "20px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: colors.white,
                    margin: "0 0 4px",
                  }}
                >
                  vs. {nextGame.opponent}
                </p>
                <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>
                  {nextGame.date} · {nextGame.venue}
                </p>
              </div>
              <div
                style={{
                  background: "#1A6EFF18",
                  border: "1px solid #1A6EFF40",
                  borderRadius: "100px",
                  padding: "4px 12px",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    color: "#1A6EFF",
                    fontSize: "11px",
                    fontWeight: 500,
                  }}
                >
                  {nextGame.daysAway === 0
                    ? "today"
                    : nextGame.daysAway === 1
                    ? "tomorrow"
                    : `${nextGame.daysAway} days`}
                </span>
              </div>
            </div>

            <p
              style={{
                fontSize: "11px",
                color: "#444",
                margin: "0 0 10px",
                letterSpacing: "0.4px",
                textTransform: "uppercase",
              }}
            >
              who's coming
            </p>

            <button
              type="button"
              onClick={() => router.push("/book")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "transparent",
                borderRadius: "100px",
                padding: "8px 16px",
                border: "1px dashed #333",
                cursor: "pointer",
              }}
            >
              <span style={{ color: "#555", fontSize: "14px" }}>
                + invite someone
              </span>
            </button>

            <div
              style={{
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: "1px solid #1a1a1a",
                display: "flex",
                gap: "8px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  background: "#1a1a1a",
                  borderRadius: "8px",
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    marginBottom: "2px",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#22c55e",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: "#22c55e", fontSize: "11px" }}>
                    booked
                  </span>
                </div>
                <span
                  style={{
                    color: colors.white,
                    fontSize: "18px",
                    fontWeight: 600,
                  }}
                >
                  {booked}
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  background: "#1a1a1a",
                  borderRadius: "8px",
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    marginBottom: "2px",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#f59e0b",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: "#f59e0b", fontSize: "11px" }}>
                    pending
                  </span>
                </div>
                <span
                  style={{
                    color: colors.white,
                    fontSize: "18px",
                    fontWeight: 600,
                  }}
                >
                  {pending}
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  background: "#1a1a1a",
                  borderRadius: "8px",
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    marginBottom: "2px",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#333",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: "#444", fontSize: "11px" }}>
                    invited
                  </span>
                </div>
                <span
                  style={{
                    color: colors.white,
                    fontSize: "18px",
                    fontWeight: 600,
                  }}
                >
                  {total}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <p
            style={{
              fontSize: "12px",
              color: "#555",
              margin: "0 0 12px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            coming up
          </p>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {upcomingGames.map((game) => {
              const gameTrips = getGameTrips(trips, game.date);
              const { booked: gb, pending: gp } = getStatusCounts(gameTrips);
              const hasGuests = gb + gp > 0;

              return (
                <div
                  key={game.id}
                  style={{
                    background: "#0f0f0f",
                    borderRadius: "11px",
                    padding: "16px 20px",
                    border: "1px solid #1e1e1e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: 500,
                        color: colors.white,
                        margin: "0 0 3px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      vs. {game.opponent}
                    </p>
                    <p style={{ fontSize: "12px", color: "#444", margin: 0 }}>
                      {game.date} · {game.venue}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexShrink: 0,
                    }}
                  >
                    {hasGuests ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {gb > 0 && (
                          <>
                            <div
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: "#22c55e",
                              }}
                            />
                            <span style={{ color: "#555", fontSize: "12px" }}>
                              {gb}
                            </span>
                          </>
                        )}
                        {gp > 0 && (
                          <>
                            <div
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: "#f59e0b",
                                marginLeft: gb > 0 ? "4px" : "0",
                              }}
                            />
                            <span style={{ color: "#555", fontSize: "12px" }}>
                              {gp}
                            </span>
                          </>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "#333", fontSize: "12px" }}>
                        no guests yet
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => router.push("/book")}
                      style={{
                        background: "transparent",
                        borderRadius: "100px",
                        padding: "5px 14px",
                        border: "1px dashed #333",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ color: "#555", fontSize: "12px" }}>
                        + invite
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <BottomTabs active="home" />
      </div>
    </main>
  );
}
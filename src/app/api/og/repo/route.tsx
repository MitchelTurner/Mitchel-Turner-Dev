/**
 * Dynamic OG image generator for GitHub repo cards.
 *
 * GET /api/og/repo?name=&desc=&lang=&stars=&forks=&topics=
 * Renders a 1200×630 PNG with gradient background, repo metadata, and stats.
 * Used as cover art on RepoCard components.
 */
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { cardWash } from "@/lib/cardWash";
import { languageColor } from "@/lib/languages";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = (searchParams.get("name") ?? "repository").slice(0, 40);
  const desc = (searchParams.get("desc") ?? "").slice(0, 130);
  const lang = searchParams.get("lang") ?? "";
  const stars = searchParams.get("stars") ?? "0";
  const forks = searchParams.get("forks") ?? "0";
  const topics = (searchParams.get("topics") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 4);

  const wash = cardWash(name);
  const langColor = languageColor(lang);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          backgroundColor: "#04101a",
          backgroundImage: `linear-gradient(${wash.angle}deg, ${wash.a}55 0%, #04101a 46%, ${wash.b}44 100%)`,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: wash.a,
            opacity: 0.42,
            filter: "blur(80px)",
            display: "flex",
            ...wash.orb.a,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: 9999,
            background: wash.b,
            opacity: 0.36,
            filter: "blur(90px)",
            display: "flex",
            ...wash.orb.b,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="#ffffff">
            <path d="M12 .5C5.4.5 0 5.9 0 12.5c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 24 12.5C24 5.9 18.6.5 12 .5z" />
          </svg>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 30 }}>
            {lang || "Project"}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.05,
              letterSpacing: -2,
              display: "flex",
            }}
          >
            {name}
          </div>
          {desc ? (
            <div
              style={{
                fontSize: 32,
                color: "rgba(255,255,255,0.72)",
                lineHeight: 1.35,
                display: "flex",
                maxWidth: 980,
              }}
            >
              {desc}
            </div>
          ) : null}
          {topics.length ? (
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              {topics.map((t) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    fontSize: 24,
                    color: "rgba(255,255,255,0.7)",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 9999,
                    padding: "6px 18px",
                  }}
                >
                  #{t}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {lang ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 9999,
                  background: langColor,
                  display: "flex",
                }}
              />
              <span style={{ color: "#ffffff", fontSize: 30 }}>{lang}</span>
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "rgba(255,255,255,0.85)",
              fontSize: 30,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#fbbf24">
              <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>{stars}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "rgba(255,255,255,0.85)",
              fontSize: 30,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="7" r="3" />
              <path d="M6 9v6M18 10c0 3-4 3-6 4" />
            </svg>
            <span>{forks}</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

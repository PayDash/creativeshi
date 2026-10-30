"use client";

import { useState, useEffect } from "react";
import { THEMES } from "@/lib/constants";
import { T, DIM, ACCENT } from "./shared";

const ROLE = { title: "context engineer", c: "#60a5fa" };

// Real marks from /logos; glow uses each tool's brand color.
const TOOLS = [
  { name: "opencode", src: "/logos/opencode.svg", glow: "#e9e9f0" },
  { name: "deepseek harness", src: "/logos/deepseek.svg", glow: "#4d6bfe" },
  { name: "omp", src: "/logos/omp.svg", glow: "#e9e9f0" },
  { name: "zcode (glm)", src: "/logos/glm.svg", glow: "#e9e9f0" },
];

const STATS = [
  { label: "hours of sleep", value: "3h", sleepy: true },
  { label: "tokens/day", value: "367M", spinner: true },
  { label: "human input", value: "6%", caret: true },
  { label: "works on my machine", value: "100%", c: "#a78bfa", trust: true },
];

// Counts the numeric part up from 0 on mount (HUD boot feel); non-numeric
// values render as-is. Delay syncs the roll-up with the tile stagger.
function StatValue({ value, delay }: { value: string; delay: number }) {
  const [shown, setShown] = useState(() => {
    const m = value.match(/^(\d+)(.*)$/);
    return m !== null && m[1] !== "0" ? `0${m[2]}` : value;
  });

  useEffect(() => {
    const m = value.match(/^(\d+)(.*)$/);
    if (m === null || m[1] === "0") return;
    const target = parseInt(m[1], 10);
    const suffix = m[2];
    let raf = 0;
    let start = 0;
    const dur = 900;
    const tick = (now: number) => {
      if (start === 0) start = now;
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(`${Math.round(target * eased)}${suffix}`);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => { raf = requestAnimationFrame(tick); }, delay);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [value, delay]);

  return <>{shown}</>;
}

// Classic CLI braille spinner — tokens are always churning.
const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

function TokenSpinner({ color }: { color: string }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setFrame((v) => (v + 1) % SPINNER_FRAMES.length), 120);
    return () => clearInterval(iv);
  }, []);
  return <span aria-hidden style={{ marginLeft: "0.2em", color }}>{SPINNER_FRAMES[frame]}</span>;
}

function RoleCard() {
  const c = ROLE.c;
  return (
    <div style={{
      background: `linear-gradient(135deg, ${c}0f, rgba(255,255,255,0.02))`,
      border: `1px solid ${c}2e`,
      borderRadius: "6px", padding: "0.6em 0.8em",
      display: "flex", flexDirection: "column", gap: "0.45em",
      animation: "fadeSlide 0.4s ease-out",
    }}>
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.45em", minWidth: 0 }}>
        <span style={{
          color: c, fontSize: "0.5em", flexShrink: 0,
          filter: `drop-shadow(0 0 5px ${c})`,
        }}>●</span>
        <span style={{
          ...T, fontWeight: 700, fontSize: "1em", letterSpacing: "0.5px",
          color: "#e2e8f0",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{ROLE.title}</span>
      </div>

      {/* Tool logos */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45em" }}>
        {TOOLS.map((tool) => (
          <span key={tool.name} title={tool.name} aria-label={tool.name} style={{
            width: "24px", height: "24px", borderRadius: "6px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: `0 0 10px ${tool.glow}22`,
          }}>
            {/* Tiny static marks; next/image optimization adds cost for no gain at this size. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tool.src} alt="" width={14} height={14} style={{ display: "block" }} />
          </span>
        ))}
      </div>

      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }} />

      {/* Stats — HUD tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4em" }}>
        {STATS.map((stat, i) => (
          <div key={stat.label} style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: "6px",
            padding: "0.45em 0.6em",
            display: "flex", flexDirection: "column", gap: "0.2em",
            minWidth: 0,
            animation: "fadeSlide 0.4s ease-out backwards",
            animationDelay: `${0.2 + i * 0.1}s`,
          }}>
            <span style={{
              color: "#6b7a90", fontSize: "0.5em", letterSpacing: "0.5px",
              fontFamily: "monospace",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{stat.label.toUpperCase()}</span>
            <span style={{
              color: stat.c || c, fontWeight: 700,
              fontSize: "1.4em", lineHeight: 1, fontFamily: "monospace",
              textShadow: `0 0 12px ${stat.c || c}55`,
            }}><StatValue value={stat.value} delay={(0.2 + i * 0.1) * 1000} />
              {stat.sleepy && (
                <span style={{ marginLeft: "0.25em", fontSize: "0.45em" }} aria-hidden>
                  {"zzz".split("").map((z, zi) => (
                    <span key={zi} style={{
                      display: "inline-block", color: "#a78bfa", opacity: 0,
                      animation: "zDrift 1.8s ease-in-out infinite",
                      animationDelay: `${zi * 0.6}s`,
                    }}>{z}</span>
                  ))}
                </span>
              )}
              {stat.caret && (
                <span aria-hidden style={{
                  marginLeft: "0.2em", color: c, opacity: 0,
                  animation: "caretBlink 1.1s step-end infinite",
                }}>▊</span>
              )}
              {stat.spinner && <TokenSpinner color={c} />}
              {stat.trust && (
                <span aria-hidden style={{
                  marginLeft: "0.3em", color: "#a78bfa", opacity: 0,
                  fontSize: "0.45em", whiteSpace: "nowrap",
                  animation: "trustFade 3s ease-in-out infinite",
                }}>trust me</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function About({ expanded }: { expanded?: boolean }) {
  const t = THEMES.about;

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      overflowY: expanded ? "auto" : "visible",
      scrollbarWidth: "thin",
      scrollbarColor: `${t.accent}33 transparent`,
    }}>
      <span style={{ ...ACCENT(t.accent), fontSize: expanded ? "2em" : "1.8em", fontWeight: 700, marginBottom: "0.3em" }}>$ whoami</span>
      <div style={{ borderBottom: `1px solid ${t.accent}22`, marginBottom: "0.6em" }} />
      <span style={{ ...T, fontSize: expanded ? "3em" : "2.2em", fontWeight: 700, marginBottom: "0.1em" }}>vibez</span>
      <span style={{ ...DIM, fontSize: expanded ? "1.2em" : "1em", marginBottom: "0.6em" }}>crazy</span>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4em" }}>
        <RoleCard />
        <a href="https://github.com/PayDash" target="_blank" rel="noopener noreferrer"
          style={{ color: t.accent, fontSize: "0.75em", marginTop: "0.3em", textDecoration: "none", opacity: 0.7 }}>
          github.com/PayDash →
        </a>
      </div>
      {expanded && (
        <>
          <div style={{ borderBottom: `1px solid ${t.accent}22`, marginTop: "0.8em", marginBottom: "0.5em" }} />
          <div style={{ color: t.accent, fontSize: "0.85em", fontWeight: 700, marginBottom: "0.4em" }}>$ cat ~/about.md</div>
          <div style={{ ...DIM, fontSize: "0.8em", lineHeight: 1.6, marginBottom: "0.6em" }}>
            I HATE PAYING FOR AI SUBSCRIPTIONS,<br />
            ANYTHING IS FREE IF YOU TRY HARD ENOUGH!
          </div>
          <div style={{ borderBottom: `1px solid ${t.accent}22`, marginBottom: "0.5em" }} />
          <div style={{ color: t.accent, fontSize: "0.85em", fontWeight: 700, marginBottom: "0.4em" }}>$ env</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25em", fontSize: "0.75em" }}>
            <span style={{ color: "#6b7a90" }}>languages  <span style={{ color: "#b0bed9" }}>ts · js · python · lua</span></span>
            <span style={{ color: "#6b7a90" }}>tools      <span style={{ color: "#b0bed9" }}>xcode · vscodium · vscode · ghostty</span></span>
            <span style={{ color: "#6b7a90" }}>socials    <span style={{ color: "#b0bed9" }}>github.com/PayDash · discord: @ByeVibez</span></span>
          </div>
          <div style={{ textAlign: "center", fontSize: "0.6em", marginTop: "0.6em", color: `${t.accent}33`, letterSpacing: "0.25em" }}>
            ◇ ─ ─ ─ ◇ ─ ─ ─ ◇ ─ ─ ─ ◇ ─ ─ ─ ◇
          </div>
        </>
      )}
      <style>{`
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes zDrift { 0% { opacity: 0; transform: translateY(2px); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(-4px); } }
        @keyframes caretBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        @keyframes trustFade { 0% { opacity: 0; } 30%, 60% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>
    </div>
  );
}

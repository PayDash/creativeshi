"use client";

import { useState, useEffect } from "react";
import { THEMES } from "@/lib/constants";
import { T, DIM, ACCENT } from "./shared";

const ABOUT_ITEMS = [
  { role: "0 Programming Knowledge", tech: "html · js · python",           c: "#a78bfa" },
  { role: "Not A Femboy",     tech: "linux hater",  c: "#f472b6" },
  { role: "vibe coder",        tech: "opencode · deepseek · claude code",       c: "#60a5fa" },
  { role: "professional yapper", tech: "meow · meow · meow", c: "#34d399" },
];

export function About({ expanded }: { expanded?: boolean }) {
  const t = THEMES.about;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (expanded) return;
    const iv = setInterval(() => setIdx((i) => (i + 1) % ABOUT_ITEMS.length), 3000);
    return () => clearInterval(iv);
  }, [expanded]);

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      overflowY: expanded ? "auto" : "visible" as any,
      scrollbarWidth: "thin",
      scrollbarColor: `${t.accent}33 transparent`,
    }}>
      <span style={{ ...ACCENT(t.accent), fontSize: expanded ? "2em" : "1.8em", fontWeight: 700, marginBottom: "0.3em" }}>$ whoami</span>
      <div style={{ borderBottom: `1px solid ${t.accent}22`, marginBottom: "0.6em" }} />
      <span style={{ ...T, fontSize: expanded ? "3em" : "2.2em", fontWeight: 700, marginBottom: "0.1em" }}>vibez</span>
      <span style={{ ...DIM, fontSize: expanded ? "1.2em" : "1em", marginBottom: "0.6em" }}>crazy</span>
      {expanded ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4em" }}>
          {ABOUT_ITEMS.map((it) => (
            <div key={it.role} style={{
              background: "rgba(255,255,255,0.02)", borderRadius: "4px", padding: "0.4em 0.6em",
              display: "flex", flexDirection: "row", gap: "0.2em",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4em" }}>
                <span style={{ color: it.c, fontSize: "0.5em" }}>●</span>
                <span style={{ ...T, fontWeight: 700, fontSize: "1.1em" }}>{it.role}</span>
              </div>
              <span style={{ ...DIM, fontSize: "0.8em", marginLeft: "0.8em" }}>{it.tech}</span>
            </div>
          ))}
          <a href="https://github.com/PayDash" target="_blank" rel="noopener noreferrer"
            style={{ color: t.accent, fontSize: "0.75em", marginTop: "0.3em", textDecoration: "none", opacity: 0.7 }}>
            github.com/PayDash →
          </a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4em" }}>
          {(() => {
            const it = ABOUT_ITEMS[idx];
            return (
              <div key={it.role} style={{
                background: "rgba(255,255,255,0.02)", borderRadius: "4px", padding: "0.4em 0.6em",
                display: "flex", flexDirection: "column", gap: "0.2em",
                animation: "fadeSlide 0.4s ease-out",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4em" }}>
                  <span style={{ color: it.c, fontSize: "0.5em" }}>●</span>
                  <span style={{ ...T, fontWeight: 700, fontSize: "0.95em" }}>{it.role}</span>
                </div>
                <span style={{ ...DIM, fontSize: "0.8em" }}>{it.tech}</span>
              </div>
            );
          })()}
          <a href="https://github.com/PayDash" target="_blank" rel="noopener noreferrer"
            style={{ color: t.accent, fontSize: "0.75em", marginTop: "0.3em", textDecoration: "none", opacity: 0.7 }}>
            github.com/PayDash →
          </a>
        </div>
      )}
      {expanded && (
        <>
          <div style={{ borderBottom: `1px solid ${t.accent}22`, marginTop: "0.8em", marginBottom: "0.5em" }} />
          <div style={{ color: t.accent, fontSize: "0.85em", fontWeight: 700, marginBottom: "0.4em" }}>$ cat ~/about.md</div>
          <div style={{ ...DIM, fontSize: "0.8em", lineHeight: 1.6, marginBottom: "0.6em" }}>
            wobot is wike a big pwayground in the skyw where<br />
            u can make games and pway games and be a femboy<br />
            it was made by some guys wike back in 2004<br />
            and now miwwions of people use it evewy day uwu<br />
            wobot revgewse engineewing is my fawoite thingy<br />
            hehe that&apos;s wight femboy time {">"}w{"<"}
          </div>
          <div style={{ borderBottom: `1px solid ${t.accent}22`, marginBottom: "0.5em" }} />
          <div style={{ color: t.accent, fontSize: "0.85em", fontWeight: 700, marginBottom: "0.4em" }}>$ env</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25em", fontSize: "0.75em" }}>
            <span style={{ color: "#6b7a90" }}>languages  <span style={{ color: "#b0bed9" }}>ts · js · python · lua</span></span>
            <span style={{ color: "#6b7a90" }}>tools      <span style={{ color: "#b0bed9" }}>next.js · opencode · tailwind · vscode</span></span>
            <span style={{ color: "#6b7a90" }}>socials    <span style={{ color: "#b0bed9" }}>github.com/PayDash · discord: @ByeVibez</span></span>
          </div>
          <div style={{ textAlign: "center", fontSize: "0.6em", marginTop: "0.6em", color: `${t.accent}33`, letterSpacing: "0.25em" }}>
            ◇ ─ ─ ─ ◇ ─ ─ ─ ◇ ─ ─ ─ ◇ ─ ─ ─ ◇
          </div>
        </>
      )}
      <style>{`@keyframes fadeSlide { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

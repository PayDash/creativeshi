"use client";

import { THEMES } from "@/lib/constants";
import { T, DIM, ACCENT } from "./shared";

const PROJECTS = [
  { n: "creativeshi", d: "portfolio dashboard with live monitors", lang: "TypeScript", url: "https://github.com/PayDash/creativeshi" },
  { n: "FunPortfolioDuh", d: "css 3d portfolio", lang: "TypeScript", url: "https://github.com/PayDash/FunPortfolioDuh" },
  { n: "PayDash.github.io", d: "cool", lang: "JavaScript", url: "https://github.com/PayDash/PayDash.github.io" },
  { n: "Roblox-The-Hunt-Badge-Checker", d: "pretty cool right?", lang: "Python", url: "https://github.com/PayDash/Roblox-The-Hunt-Badge-Checker" },
];

export function Projects({ expanded }: { expanded?: boolean }) {
  const t = THEMES.projects;
  const langs = new Set(PROJECTS.map(p => p.lang)).size;

  function ProjectCard({ p }: { p: typeof PROJECTS[number] }) {
    return (
      <a href={p.url} target="_blank" rel="noopener noreferrer"
        style={{
          background: "rgba(255,255,255,0.02)", borderRadius: "4px", padding: "0.35em 0.6em",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          textDecoration: "none", transition: "background 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ ...T, fontWeight: 700, fontSize: expanded ? "1em" : "0.85em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.n}</div>
          <div style={{ ...DIM, fontSize: "0.7em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.d}</div>
        </div>
        <span style={{
          color: t.accent, fontSize: "0.6em", background: `${t.accent}11`,
          padding: "0.15em 0.4em", borderRadius: "3px", flexShrink: 0, marginLeft: "0.4em",
        }}>
          {p.lang}
        </span>
      </a>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3em" }}>
        <span style={{ ...ACCENT(t.accent), fontSize: expanded ? "1.6em" : "1.4em", fontWeight: 700 }}>◆ repos</span>
        <a href="https://github.com/PayDash" target="_blank" rel="noopener noreferrer"
          style={{ color: t.accent, fontSize: "0.6em", textDecoration: "none", opacity: 0.6 }}>
          github/PayDash ↗
        </a>
      </div>
      <div style={{ borderBottom: `1px solid ${t.accent}22`, marginBottom: "0.4em" }} />
      {expanded ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3em", flex: 1, paddingTop: "0.3em", overflowY: "auto", minHeight: 0 }}>
          {PROJECTS.map(p => <ProjectCard key={p.n} p={p} />)}
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden", paddingTop: "0.3em", maxHeight: "210px" }}>
          <style>{`
            @keyframes repos-scroll {
              0% { transform: translateY(0); }
              100% { transform: translateY(-50%); }
            }
            .repos-track {
              display: flex;
              flex-direction: column;
              animation: repos-scroll 20s linear infinite;
            }
            .repos-item {
              padding-bottom: 0.3em;
            }
            .repos-track:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="repos-track">
            {[...PROJECTS, ...PROJECTS].map((p, i) => (
              <div key={`${p.n}-${i}`} className="repos-item">
                <ProjectCard p={p} />
              </div>
            ))}
          </div>
        </div>
      )}
      {expanded && (
        <>
          <div style={{ borderBottom: `1px solid ${t.accent}22`, marginTop: "0.6em", marginBottom: "0.5em" }} />
          <div style={{ display: "flex", justifyContent: "center", gap: "1.2em", fontSize: "0.7em" }}>
            <span style={{ color: t.accent }}>◆ {PROJECTS.length} repos</span>
            <span style={{ color: "#6b7a90" }}>·</span>
            <span style={{ color: t.accent }}>◆ {langs} languages</span>
          </div>
          <div style={{ textAlign: "center", fontSize: "0.6em", marginTop: "0.35em", color: `${t.accent}44`, letterSpacing: "0.3em" }}>
            ◇ ─ ─ ◇ ─ ─ ◇ ─ ─ ◇ ─ ─ ◇ ─ ─ ◇
          </div>
        </>
      )}
    </div>
  );
}

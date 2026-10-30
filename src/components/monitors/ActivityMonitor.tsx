"use client";

import { useState, useEffect } from "react";
import { THEMES } from "@/lib/constants";
import { useWakatime } from "./useWakatime";

const LANG_COLORS: Record<string, string> = {
  typescript: "#3178c6", javascript: "#f7df1e", python: "#3572a5",
  html: "#e34c26", css: "#563d7c", lua: "#000080",
  rust: "#dea584", go: "#00add8", java: "#b07219",
  c: "#555555", "c++": "#f34b7d", csharp: "#178600",
  ruby: "#701516", php: "#4f5d95", swift: "#ffac45",
  kotlin: "#a97bff", dart: "#00b4ab", elixir: "#6e4a7e",
  sql: "#e38c00", shell: "#89e051", yaml: "#cb171e",
  json: "#292929", markdown: "#083fa1", dockerfile: "#384d54",
  default: "#8b5cf6",
};

const EDITOR_COLORS: Record<string, string> = {
  "vs code": "#007acc", "visual studio code": "#007acc",
  neovim: "#57a143", vim: "#019733",
  intellij: "#fe315d", "intellij idea": "#fe315d",
  webstorm: "#07c3f2", pycharm: "#21d789",
  goland: "#00acd7", fleet: "#8b5cf6",
  xcode: "#1575f9", zed: "#84cc16",
  default: "#8b5cf6",
};

function StatCard({ label, value, accent, index }: { label: string; value: string; accent: string; index?: number }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
      borderRadius: "8px", padding: "0.3em 0.7em", flex: 1, minWidth: 80,
      animation: "statFade 0.5s ease backwards",
      animationDelay: `${(index || 0) * 0.12}s`,
    }}>
      <span style={{ color: "#6b7a90", fontSize: "0.55em", letterSpacing: "0.5px", display: "block", marginBottom: "0.1em" }}>{label}</span>
      <span style={{ color: "#d4dce8", fontSize: "1.1em", fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function BarList({ items, maxKey = "percent" }: { items: any[]; maxKey?: string }) {
  const max = items.length > 0 ? Math.max(...items.map((i: any) => i[maxKey] || 0)) : 1;
  if (items.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3em" }}>
      {items.slice(0, 7).map((item: any) => {
        const val = item.percent || 0;
        const bar = max > 0 ? (val / max) * 100 : 0;
        const ckey = item.name.toLowerCase();
        const color = LANG_COLORS[ckey] || EDITOR_COLORS[ckey] || LANG_COLORS.default;
        return (
          <div key={item.name}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7em", marginBottom: "0.1em" }}>
              <span style={{ color: "#d4dce8", fontWeight: 600 }}>{item.name}</span>
              <span style={{ color }}>{val.toFixed(1)}%</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
              <div style={{
                width: `${bar}%`, height: "100%",
                background: `linear-gradient(90deg, ${color}66, ${color})`,
                borderRadius: "4px", transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ items, size = 140 }: { items: any[]; size?: number }) {
  if (items.length === 0) return null;
  const r = 36, sw = 16, circ = 2 * Math.PI * r;
  const cx = 50, cy = 50;
  let cum = 0;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={sw} />
      {items.slice(0, 6).map((item: any) => {
        const len = (item.percent / 100) * circ;
        const offset = -cum;
        cum += len;
        const color = LANG_COLORS[item.name.toLowerCase()] || EDITOR_COLORS[item.name.toLowerCase()] || LANG_COLORS.default;
        return (
          <circle key={item.name} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw}
            strokeDasharray={`${Math.max(len, 1)} ${circ - Math.max(len, 1)}`}
            strokeDashoffset={offset} transform={`rotate(-90 ${cx} ${cy})`} />
        );
      })}
      <circle cx={cx} cy={cy} r={r - sw / 2 + 1} fill="#080c0e" />
    </svg>
  );
}

export function Activity({ expanded }: { expanded?: boolean }) {
  const t = THEMES.skills;
  const data = useWakatime();

  if (!data) return null;

  if (!expanded) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.3em", marginBottom: "0.3em" }}>
          <span style={{
            fontSize: "1.4em", color: t.accent,
            filter: `drop-shadow(0 0 4px ${t.accent})`,
            animation: "pulseDot 2s ease-in-out infinite",
          }}>◉</span>
          <span style={{
            fontSize: "1.4em", fontWeight: 700, letterSpacing: "0.5px",
            background: `linear-gradient(135deg, ${t.accent}, ${t.accent}bb)`,
            backgroundClip: "text", WebkitBackgroundClip: "text",
            color: "transparent",
          }}>activity</span>
        </div>
        <div style={{ borderBottom: `1px solid ${t.accent}22`, marginBottom: "0.4em" }} />
        <div style={{ display: "flex", gap: "0.5em", flexWrap: "wrap", marginBottom: "0.3em" }}>
          <StatCard index={0} label="CODED" value={data.human_readable_total || "—"} accent={t.accent} />
          <StatCard index={1} label="DAILY" value={data.human_readable_daily_average || "—"} accent={t.accent} />
        </div>
        <div style={{ display: "flex", gap: "1em", flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.2em" }}>
            {data.editors && data.editors.length > 0 && (
              <>
                <span style={{ color: "#6b7a90", fontSize: "0.5em", letterSpacing: "0.5px" }}>EDITORS</span>
                {data.editors.slice(0, 4).map((e: any) => {
                  const color = EDITOR_COLORS[e.name.toLowerCase()] || t.accent;
                  return (
                    <div key={e.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.6em" }}>
                      <span style={{ color: "#d4dce8" }}>{e.name}</span>
                      <span style={{ color: t.accent }}>{e.percent?.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.2em" }}>
            {data.languages && data.languages.length > 0 && (
              <>
                <span style={{ color: "#6b7a90", fontSize: "0.5em", letterSpacing: "0.5px" }}>LANGUAGES</span>
                {data.languages.slice(0, 6).map((l: any) => {
                  const color = LANG_COLORS[l.name.toLowerCase()] || LANG_COLORS.default;
                  return (
                    <div key={l.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.6em" }}>
                      <span style={{ color: "#d4dce8" }}>{l.name}</span>
                      <span style={{ color: t.accent }}>{l.percent?.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const langs = data.languages?.filter((l: any) => l.percent > 0.5) || [];
  const editors = data.editors?.filter((e: any) => e.percent > 0.5) || [];
  const osList = data.operating_systems?.filter((o: any) => o.percent > 0.5) || [];
  const projects = data.projects?.filter((p: any) => p.percent > 0.5) || [];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.3em", marginBottom: "0.2em", flexShrink: 0 }}>
        <span style={{
          fontSize: "1em", color: t.accent,
          filter: `drop-shadow(0 0 6px ${t.accent})`,
          animation: "pulseDot 2s ease-in-out infinite",
        }}>◉</span>
        <span style={{
          fontSize: "1.6em", fontWeight: 700, letterSpacing: "1px",
          background: `linear-gradient(135deg, ${t.accent}, ${t.accent}cc, ${t.accent}66)`,
          backgroundClip: "text", WebkitBackgroundClip: "text",
          color: "transparent",
          filter: `drop-shadow(0 0 12px ${t.accent}33)`,
        }}>activity</span>
      </div>
      <div style={{ borderBottom: `1px solid ${t.accent}22`, marginBottom: "0.5em", flexShrink: 0 }} />

      <div style={{ display: "flex", gap: "0.5em", flexWrap: "wrap", marginBottom: "0.5em", flexShrink: 0 }}>
        <StatCard label="CODED THIS WEEK" value={data.human_readable_total || "—"} accent={t.accent} />
        <StatCard label="DAILY AVG" value={data.human_readable_daily_average || "—"} accent={t.accent} />
        <StatCard label="RANGE" value={data.range || "—"} accent={t.accent} />
      </div>

      <div style={{ display: "flex", gap: "1em", flex: 1, minHeight: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5em", flex: 1, overflow: "hidden" }}>
          <div style={{
            background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: "8px", padding: "0.5em", flex: 1, display: "flex", flexDirection: "column",
          }}>
            <span style={{ color: "#6b7a90", fontSize: "0.6em", letterSpacing: "0.5px", marginBottom: "0.3em" }}>LANGUAGES</span>
            <div style={{ display: "flex", gap: "0.8em", flex: 1, alignItems: "center", overflow: "hidden" }}>
              <div style={{ flexShrink: 0 }}>
                <DonutChart items={langs} size={100} />
              </div>
              <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                <BarList items={langs} />
              </div>
            </div>
          </div>

          {editors.length > 0 && (
            <div style={{
              background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)",
              borderRadius: "8px", padding: "0.5em", flexShrink: 0,
            }}>
              <span style={{ color: "#6b7a90", fontSize: "0.6em", letterSpacing: "0.5px", marginBottom: "0.3em", display: "block" }}>EDITORS</span>
              <BarList items={editors} />
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5em", flex: 1, overflow: "hidden", justifyContent: "space-between" }}>
          {osList.length > 0 && (
            <div style={{
              background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)",
              borderRadius: "8px", padding: "0.5em", flexShrink: 0,
            }}>
              <span style={{ color: "#6b7a90", fontSize: "0.6em", letterSpacing: "0.5px", marginBottom: "0.3em", display: "block" }}>OPERATING SYSTEMS</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3em" }}>
                {osList.map((o: any) => {
                  const color = LANG_COLORS[o.name.toLowerCase()] || LANG_COLORS.default;
                  return (
                    <div key={o.name} style={{
                      display: "flex", alignItems: "center", gap: "0.3em",
                      background: `${color}11`, border: `1px solid ${color}22`,
                      borderRadius: "4px", padding: "0.15em 0.4em",
                    }}>
                      <span style={{ color: "#d4dce8", fontSize: "0.7em", fontWeight: 600 }}>{o.name}</span>
                      <span style={{ color, fontSize: "0.6em" }}>{o.percent?.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {projects.length > 0 && (
            <div style={{
              background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)",
              borderRadius: "8px", padding: "0.5em", flex: 1,
            }}>
              <span style={{ color: "#6b7a90", fontSize: "0.6em", letterSpacing: "0.5px", marginBottom: "0.3em", display: "block" }}>PROJECTS</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3em" }}>
                {projects.slice(0, 7).map((p: any) => {
                  const maxSec = Math.max(...projects.map((x: any) => x.total_seconds || 0));
                  const bar = maxSec > 0 ? ((p.total_seconds || 0) / maxSec) * 100 : 0;
                  const color = LANG_COLORS[p.name.toLowerCase()] || EDITOR_COLORS[p.name.toLowerCase()] || t.accent;
                  return (
                    <div key={p.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7em", marginBottom: "0.1em" }}>
                        <span style={{ color: "#d4dce8", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                        <span style={{ color, flexShrink: 0 }}>{p.text || p.digital || "—"}</span>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                        <div style={{
                          width: `${bar}%`, height: "100%",
                          background: `linear-gradient(90deg, ${color}66, ${color})`,
                          borderRadius: "4px", transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{
            background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: "8px", padding: "0.4em 0.7em", display: "flex", alignItems: "center", gap: "0.6em",
            flexShrink: 0,
          }}>
            <span style={{ color: "#6b7a90", fontSize: "0.6em", letterSpacing: "0.5px" }}>GRAND TOTAL</span>
            <span style={{ color: "#d4dce8", fontSize: "0.9em", fontWeight: 700 }}>{data.grand_total || "—"}</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes statFade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}

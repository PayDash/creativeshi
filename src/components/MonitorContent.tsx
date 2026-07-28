"use client";

import { useState, useEffect, useRef } from "react";
import { THEMES } from "@/lib/constants";
import type { MonitorId } from "@/lib/constants";

const T = (s: string) => ({ color: "#d4dce8" as const, margin: 0, fontFamily: "monospace" as const, fontSize: "inherit", lineHeight: 1.6 });
const DIM = { color: "#6b7a90" as const, margin: 0, fontFamily: "monospace" as const, fontSize: "inherit", lineHeight: 1.6 };
const MUTED = { color: "#475569" as const, margin: 0, fontFamily: "monospace" as const, fontSize: "inherit", lineHeight: 1.6 };
const ACCENT = (c: string) => ({ color: c, margin: 0, fontFamily: "monospace" as const, fontSize: "inherit", lineHeight: 1.6 });

/* ── Terminal (fastfetch + shell) ── */

import data from "@/data.json";

const INFO = data.info;

const BLUE = "#3b82f6";
const CYAN = "#22d3ee";
const WHITE = "#d4dce8";
const GRAY = "#475569";

function Donut({ small }: { small?: boolean }) {
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const pre = preRef.current;
    if (!pre) return;

    const W = small ? 40 : 64;
    const H = small ? 12 : 18;
    const lum = ".,-~:;=!*#$@";
    let A = 0, B = 0;
    let raf: number;

    const render = () => {
      A += 0.07;
      B += 0.03;

      const sinA = Math.sin(A), cosA = Math.cos(A);
      const sinB = Math.sin(B), cosB = Math.cos(B);
      const b = new Array(W * H).fill(" ");
      const z = new Array(W * H).fill(0);

      for (let j = 0; j < 6.28; j += small ? 0.2 : 0.12) {
        const sinj = Math.sin(j), cosj = Math.cos(j);
        for (let i = 0; i < 6.28; i += small ? 0.07 : 0.04) {
          const sini = Math.sin(i), cosi = Math.cos(i);
          const h = cosj + 2;
          const D = 1 / (sini * h * sinA + sinj * cosA + 5);
          const t = sini * h * cosA - sinj * sinA;
          const x = Math.floor(W / 2 + (W / 3) * D * (cosi * h * cosB - t * sinB));
          const y = Math.floor(H / 2 + (W / 6) * D * (cosi * h * sinB + t * cosB));
          const o = x + W * y;
          if (y >= 0 && y < H && x >= 0 && x < W) {
            const N = Math.floor(8 * ((sinj * sinA - sini * cosj * cosA) * cosB - sini * cosj * sinA - sinj * cosA - cosi * cosj * sinB));
            if (D > z[o]) {
              z[o] = D;
              b[o] = lum[N > 0 ? N > 11 ? 11 : N : 0];
            }
          }
        }
      }

      let out = "";
      for (let y = 0; y < H; y++) {
        out += b.slice(y * W, (y + 1) * W).join("");
        if (y < H - 1) out += "\n";
      }
      pre.textContent = out;
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [small]);

  return (
    <pre ref={preRef} style={{
      margin: 0, fontFamily: "monospace", lineHeight: 1.05,
      fontSize: small ? "0.38em" : "0.5em", color: BLUE, overflow: "hidden",
    }} />
  );
}

function Terminal({ expanded }: { expanded?: boolean }) {
  const [vis, setVis] = useState(0);

  useEffect(() => {
    if (expanded) { setVis(INFO.length); return; }
    const iv = setInterval(() => {
      setVis((v) => {
        if (v >= INFO.length) { clearInterval(iv); return v; }
        return v + 1;
      });
    }, 250);
    return () => clearInterval(iv);
  }, [expanded]);

  if (!expanded) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.1em", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: "0.5em", overflow: "hidden", flex: 1 }}>
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Donut small />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.1em", minWidth: 0 }}>
            {INFO.slice(0, vis).map(([key, val], i) => (
              <div key={i} style={{ display: "flex", gap: "0.3em", fontSize: "0.65em", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                <span style={{ color: BLUE, fontWeight: 600, width: "4.2em", textAlign: "right", flexShrink: 0 }}>{key}</span>
                <span style={{ color: GRAY, flexShrink: 0 }}>:</span>
                <span style={{ color: WHITE, overflow: "hidden", textOverflow: "ellipsis", fontWeight: i === 0 ? 600 : 400 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.3em", flexShrink: 0 }}>
          <span style={{ color: CYAN }}>vibez@biggesthater:~$</span>
          <span style={{ color: "#6b7a90", animation: "termBlink 2s step-end infinite" }}>▊</span>
        </div>
        <style>{`@keyframes termBlink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
      </div>
    );
  }

  return (
    <TerminalShell />
  );
}

const FAKE_COMMANDS: Record<string, string[]> = {
  "ls": [
    "Desktop  Documents  Downloads  Music  Pictures  Projects",
    "dotfiles  games  neofetch.log  package.json  src  start.sh",
  ],
  "ls -la": [
    "total 69",
    "drwxr-xr-x  32 vibez  staff    1024 Jul 26 03:46 .",
    "drwxr-xr-x   3 root   root      96 Mar 12 11:00 ..",
    "-rw-r--r--   1 vibez  staff     420 Jul 26 03:46 .zshrc",
    "drwxr-xr-x   8 vibez  staff     256 Jul 26 19:00 projects",
    "drwxr-xr-x   4 vibez  staff     128 Jul 20 14:30 games",
    "drwxr-xr-x   6 vibez  staff     192 Jul 24 09:15 dotfiles",
    "-rw-r--r--   1 vibez  staff     420 Jul 25 20:40 neofetch.log",
    "-rwxr-xr-x   1 vibez  staff     174 Jul 26 03:47 start.sh",
  ],
  "uname -a": ["Linux biggesthater 6.8.7-arch1-1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux"],
  "whoami": ["vibez"],
  "uptime": [" 03:46  up 4 days,  2:01,  1 user,  load average: 0.08, 0.12, 0.15"],
  "df -h": [
    "Filesystem      Size  Used Avail Use% Mounted on",
    "/dev/nvme0n1p2  916G  412G  504G  45% /",
    "devtmpfs         16G     0   16G   0% /dev",
    "tmpfs            16G  2.1M   16G   1% /dev/shm",
  ],
  "pwd": ["/home/vibez"],
  "help": [
    "available commands:",
    "  ls, ls -la    list files",
    "  uname -a      system info",
    "  whoami        who you are",
    "  uptime        system uptime",
    "  df -h         disk usage",
    "  date          current date/time",
    "  echo <text>   repeat text",
    "  pwd           print working directory",
    "  cat <file>    show file contents",
    "  clear         clear terminal",
    "  neofetch      show system info",
    "  help          this message",
  ],
};

function runCommand(input: string): string[] | "clear" | "neofetch" {
  const t = input.trim();
  if (!t) return [];
  const parts = t.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  const key = [cmd, ...args].join(" ");
  if (FAKE_COMMANDS[key]) return FAKE_COMMANDS[key];
  switch (cmd) {
    case "ls": return FAKE_COMMANDS["ls"];
    case "uname": return args.includes("-a") ? FAKE_COMMANDS["uname -a"] : ["Linux"];
    case "df": return args.includes("-h") ? FAKE_COMMANDS["df -h"] : ["Filesystem     1K-blocks      Used Available Use% Mounted on", "/dev/nvme0n1p2  960145104 432000000 528145104  45% /"];
    case "date": return [new Date().toLocaleString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short" })];
    case "echo": return [args.join(" ") || ""];
    case "cat": return ["cat: " + (args.join(" ") || "") + ": No such file or directory"];
    case "pwd": return FAKE_COMMANDS["pwd"];
    case "help": return FAKE_COMMANDS["help"];
    case "clear": return "clear";
    case "neofetch": return "neofetch";
    default: return [`bash: ${cmd}: command not found`];
  }
}

function TerminalShell() {
  const [lines, setLines] = useState<{ t: "c" | "o"; v: string }[]>([]);
  const [buf, setBuf] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines, buf]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    const cmd = buf;
    setBuf("");
    const res = runCommand(cmd);
    if (res === "clear") { setLines([]); return; }
    if (res === "neofetch") {
      return;
    }
    const output = (res as string[]).map((l) => ({ t: "o" as const, v: l }));
    setLines((p) => [...p, { t: "c" as const, v: cmd }, ...output]);
  };

  return (
    <div
      style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
      onClick={() => inputRef.current?.focus()}
    >
      <div style={{
        display: "flex", gap: "0.8em", flexShrink: 0,
        padding: "0.3em 0.5em", borderBottom: `1px solid ${BLUE}11`,
      }}>
        <Donut />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.1em" }}>
          {INFO.map(([key, val], i) => (
            <div key={i} style={{ display: "flex", gap: "0.3em", fontSize: "0.75em", whiteSpace: "nowrap" }}>
              <span style={{ color: BLUE, fontWeight: 600, width: "5.2em", textAlign: "right", flexShrink: 0 }}>{key}</span>
              <span style={{ color: GRAY, flexShrink: 0 }}>:</span>
              <span style={{ color: WHITE, fontWeight: i === 0 ? 600 : 400 }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
      <div ref={scrollRef} style={{
        flex: 1, overflow: "auto", padding: "0.3em 0.5em",
        fontFamily: "monospace", fontSize: "0.85em", lineHeight: 1.4,
        cursor: "text",
      }}>
        {lines.map((l, i) => {
          if (l.t === "c") return (
            <div key={i} style={{ display: "flex", gap: "0.3em" }}>
              <span style={{ color: CYAN, flexShrink: 0 }}>vibez@biggesthater:~$</span>
              <span style={{ color: WHITE }}>{l.v}</span>
            </div>
          );
          return <div key={i} style={{ color: "#94a3b8" }}>{l.v}</div>;
        })}
        <div style={{ display: "flex", gap: "0.3em" }}>
          <span style={{ color: CYAN, flexShrink: 0 }}>vibez@biggesthater:~$</span>
          <div ref={inputRef} tabIndex={0} onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); submit(); return; }
            if (e.key === "Backspace") { setBuf((p) => p.slice(0, -1)); return; }
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) { setBuf((p) => p + e.key); }
          }} style={{ outline: "none", display: "flex", flex: 1, minWidth: 0 }}>
            <span style={{ color: WHITE }}>{buf}</span>
          <span style={{ color: "#6b7a90", animation: "termBlink 2s step-end infinite" }}>▊</span>
          </div>
        </div>
      </div>
      <style>{`@keyframes termBlink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
    </div>
  );
}

/* ── About ── */

const ABOUT_ITEMS = [
  { role: "0 Programming Knowledge", tech: "html · js · python",           c: "#a78bfa" },
  { role: "Not A Femboy",     tech: "linux hater",  c: "#f472b6" },
  { role: "vibe coder",        tech: "opencode · deepseek · claude code",       c: "#60a5fa" },
  { role: "professional yapper", tech: "meow · meow · meow", c: "#34d399" },
];

function About({ expanded }: { expanded?: boolean }) {
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
      <span style={{ ...T(""), fontSize: expanded ? "3em" : "2.2em", fontWeight: 700, marginBottom: "0.1em" }}>vibez</span>
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
                <span style={{ ...T(""), fontWeight: 700, fontSize: "1.1em" }}>{it.role}</span>
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
                  <span style={{ ...T(""), fontWeight: 700, fontSize: "0.95em" }}>{it.role}</span>
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
            hehe that's wight femboy time {">"}w{"<"}
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

/* ── Music ── */

type TopTrack = { title: string; artist: string; plays: number; album: string };
type TopArtist = { name: string; genres: string[]; plays: number; image: string };
type RecentTrack = { title: string; artist: string; album: string; image: string; nowPlaying: boolean; url: string; date: number | null };
type Range = "week" | "month" | "year" | "all";

const RANGES: { key: Range; label: string }[] = [
  { key: "week", label: "7d" },
  { key: "month", label: "1m" },
  { key: "year", label: "1y" },
  { key: "all", label: "all" },
];

const RANGE_LABEL: Record<Range, string> = {
  week: "this week",
  month: "this month",
  year: "this year",
  all: "all time",
};

function useTopData(range: Range) {
  const [data, setData] = useState<{ tracks: TopTrack[]; artists: TopArtist[] } | null>(null);
  useEffect(() => {
    fetch(`/api/spotify/top?range=${range}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {});
  }, [range]);
  return data;
}

function useRecentData() {
  const [data, setData] = useState<RecentTrack[] | null>(null);
  useEffect(() => {
    fetch("/api/spotify/recent")
      .then(r => r.json())
      .then(d => setData(d.recent))
      .catch(() => {});
    const id = setInterval(() => {
      fetch("/api/spotify/recent")
        .then(r => r.json())
        .then(d => setData(d.recent))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, []);
  return data;
}

function timeAgo(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

let _fbUrl: string | null | undefined;

function AlbumArt({ src, size, radius, accent, nowPlaying }: {
  src: string; size: string; radius: string; accent: string; nowPlaying?: boolean
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const fallbackTried = useRef(false);

  useEffect(() => {
    setLoaded(false);
    setErrored(false);
    fallbackTried.current = false;
  }, [src]);

  const handleError = async (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (fallbackTried.current) { setErrored(true); return; }
    fallbackTried.current = true;
    if (_fbUrl === undefined) {
      try {
        const r = await fetch("/api/album-covers");
        const d = await r.json();
        _fbUrl = d.url || null;
      } catch { _fbUrl = null; }
    }
    if (_fbUrl) (e.target as HTMLImageElement).src = _fbUrl;
    else setErrored(true);
  };

  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      position: "relative", overflow: "hidden",
      background: "rgba(255,255,255,0.04)",
      boxShadow: nowPlaying ? `0 0 20px ${accent}44` : "none",
    }}>
      {!errored && !loaded && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.03) 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.2s ease-in-out infinite",
        }} />
      )}
      {errored ? (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          color: "rgba(255,255,255,0.12)", fontSize: "1.3em",
        }}>♪</div>
      ) : (
        <img src={src} alt=""
          onLoad={() => setLoaded(true)}
          onError={handleError}
          loading="lazy"
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            display: "block", opacity: loaded ? 1 : 0,
            transition: "opacity 0.3s",
          }} />
      )}
    </div>
  );
}

function Music({ expanded }: { expanded?: boolean }) {
  const t = THEMES.music;
  const [range, setRange] = useState<Range>("week");
  const topData = useTopData(range);
  const recentData = useRecentData();

  if (!expanded) {
    const nowPlaying = recentData?.find(t => t.nowPlaying);
    const single = nowPlaying || recentData?.[0] || null;

    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <style>{`@keyframes wave{0%{transform:scaleY(0.3)}100%{transform:scaleY(1)}}@keyframes shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}`}</style>
        {single ? (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: "5%",
            padding: "0 4%",
          }}>
              <AlbumArt
                src={single.image?.replace("/34s/", "/64s/") || "/album-covers/missing"}
                size="clamp(40px, 7vw, 90px)" radius="8px"
                accent={t.accent} nowPlaying={!!nowPlaying} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: nowPlaying ? t.accent : "#94a3b8",
                fontSize: "clamp(8px, 0.55vw, 13px)",
                fontWeight: 600, letterSpacing: "0.5px", marginBottom: "0.2em",
              }}>
                {nowPlaying ? "NOW PLAYING" : "LAST PLAYED"}
              </div>
              <div style={{
                color: "#e2e8f0", fontWeight: 700,
                fontSize: "clamp(11px, 0.95vw, 20px)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {single.title}
              </div>
              <div style={{
                color: "#6b7a90",
                fontSize: "clamp(9px, 0.7vw, 15px)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {single.artist}
              </div>
              <div style={{
                display: "flex", alignItems: "flex-end", gap: "1.5px",
                height: "clamp(12px, 1vw, 22px)", marginTop: "0.25em",
              }}>
                {[3,6,4,7,3,8,2,9,4,6,2,7,3,8,5,6,3,7,4].map((h, i) => (
                  <div key={i} style={{
                    width: "clamp(2px, 0.15vw, 4px)",
                    height: `${Math.max(15, h * 8)}%`,
                    background: nowPlaying ? t.accent : "#475569",
                    borderRadius: "1px",
                    transformOrigin: "bottom",
                    animation: nowPlaying ? `wave ${0.4 + (i % 4) * 0.1}s ease-in-out infinite alternate` : "none",
                    animationDelay: `${i * 0.05}s`,
                  }} />
                ))}
              </div>

            </div>
            {nowPlaying && (
              <span style={{
                color: t.accent, fontSize: "clamp(10px, 0.8vw, 18px)",
                alignSelf: "center",
                animation: "pulse 2s ease-in-out infinite",
              }}>●</span>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#475569", fontSize: "clamp(9px, 0.7vw, 14px)", fontStyle: "italic" }}>
              no activity
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", scrollbarWidth: "thin", scrollbarColor: `${t.accent}22 transparent` }}>
      {/* Recently played */}
      {recentData && recentData.length > 0 && (
        <div style={{ flexShrink: 0, marginBottom: "0.1em" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4em", marginBottom: "0.15em" }}>
            <span style={{ fontSize: "0.9em", color: t.accent }}>♪</span>
            <span style={{ ...ACCENT(t.accent), fontSize: "0.8em", fontWeight: 700 }}>recently played</span>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.4em",
            paddingBottom: "0.2em",
          }}>
            {recentData.slice(0, 6).map((track, i) => (
              <div key={`${track.title}-${i}`} style={{
                display: "flex", alignItems: "center", gap: "0.4em",
                padding: "0.35em 0.5em", borderRadius: "5px",
                background: track.nowPlaying ? `${t.accent}15` : "rgba(255,255,255,0.04)",
                border: track.nowPlaying ? `1px solid ${t.accent}33` : "1px solid transparent",
                fontSize: "0.6em", minWidth: 0,
              }}>
                <AlbumArt
                  src={track.image || "/album-covers/missing"}
                  size="2.4em" radius="4px"
                  accent={t.accent} nowPlaying={track.nowPlaying} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ color: track.nowPlaying ? t.accent : "#d4dce8", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {track.title}
                  </div>
                  <div style={{ color: "#6b7a90", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {track.artist}
                  </div>
                </div>
                <span style={{ color: "#475569", fontSize: "0.75em", flexShrink: 0 }}>
                  {track.nowPlaying ? "●" : track.date ? timeAgo(track.date) : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top tracks & artists */}
      {topData && (
        <>
          {/* Range selector */}
          <div style={{
            display: "flex", gap: "0.15em", marginTop: "0.2em", marginBottom: "0.15em",
            flexShrink: 0, alignItems: "center",
          }}>
            {RANGES.map((r) => (
              <button key={r.key} onClick={() => setRange(r.key)}
                style={{
                  padding: "0.1em 0.4em", borderRadius: "3px", border: "none",
                  fontSize: "0.5em", fontFamily: "monospace", cursor: "pointer",
                  transition: "all 0.12s",
                  background: range === r.key ? `${t.accent}22` : "rgba(255,255,255,0.03)",
                  color: range === r.key ? t.accent : "#64748b",
                  fontWeight: range === r.key ? 700 : 400,
                  letterSpacing: "0.3px",
                }}
              >
                {r.label}
              </button>
            ))}
            <span style={{ color: "#475569", fontSize: "0.45em", marginLeft: "0.5em" }}>
              top songs & artists {RANGE_LABEL[range]}
            </span>
          </div>

          <div style={{
            flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1em",
            minHeight: 0,
          }}>
            {topData.tracks.length > 0 && (
              <div style={{
                display: "flex", flexDirection: "column", minHeight: 0,
              }}>
                <span style={{
                  color: t.accent, fontSize: "0.6em", fontWeight: 700,
                  letterSpacing: "0.5px", marginBottom: "0.2em", flexShrink: 0,
                }}>
                  ▲ top songs
                </span>
                <div style={{
                  flex: 1, overflow: "auto", display: "flex", flexDirection: "column",
                  gap: "0.15em", scrollbarWidth: "thin",
                  scrollbarColor: `${t.accent}22 transparent`,
                }}>
                  {topData.tracks.slice(0, 20).map((track, i) => {
                    const bar = (track.plays / (topData.tracks[0]?.plays || 1)) * 100;
                    return (
                      <div key={`${track.title}-${i}`} style={{
                        display: "flex", alignItems: "center", gap: "0.4em",
                        padding: "0.15em 0.3em", borderRadius: "3px",
                        background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
                        fontSize: "0.6em",
                      }}>
                        <span style={{ color: t.accent, width: "1.2em", textAlign: "right", fontWeight: 700, flexShrink: 0, fontSize: "0.8em" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: "#d4dce8", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {track.title}
                          </div>
                          <div style={{ color: "#6b7a90", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {track.artist}
                          </div>
                        </div>
                        <div style={{
                          width: "3em", height: "3px",
                          background: "rgba(255,255,255,0.06)", borderRadius: "2px",
                          overflow: "hidden", flexShrink: 0,
                        }}>
                          <div style={{
                            width: `${bar}%`, height: "100%",
                            background: t.accent, borderRadius: "2px",
                            transition: "width 0.5s",
                          }} />
                        </div>
                        <span style={{ color: "#6b7a90", fontSize: "0.8em", width: "2.5em", textAlign: "right", flexShrink: 0 }}>
                          {track.plays}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {topData.artists.length > 0 && (
              <div style={{
                display: "flex", flexDirection: "column", minHeight: 0,
              }}>
                <span style={{
                  color: t.accent, fontSize: "0.6em", fontWeight: 700,
                  letterSpacing: "0.5px", marginBottom: "0.2em", flexShrink: 0,
                }}>
                  ● top artists
                </span>
                <div style={{
                  flex: 1, overflow: "auto", display: "flex", flexDirection: "column",
                  gap: "0.15em", scrollbarWidth: "thin",
                  scrollbarColor: `${t.accent}22 transparent`,
                }}>
                  {topData.artists.slice(0, 20).map((artist, i) => {
                    const bar = (artist.plays / (topData.artists[0]?.plays || 1)) * 100;
                    const genreTag = artist.genres?.[0] || "";
                    return (
                      <div key={artist.name} style={{
                        display: "flex", alignItems: "center", gap: "0.4em",
                        padding: "0.15em 0.3em", borderRadius: "3px",
                        background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
                        fontSize: "0.6em",
                      }}>
                        <span style={{ color: t.accent, width: "1.2em", textAlign: "right", fontWeight: 700, flexShrink: 0, fontSize: "0.8em" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {artist.image && (
                          <AlbumArt
                            src={artist.image}
                            size="1.8em" radius="50%"
                            accent={t.accent} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: "#d4dce8", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {artist.name}
                          </div>
                          {genreTag && (
                            <div style={{ color: "#6b7a90", fontSize: "0.85em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {genreTag}
                            </div>
                          )}
                        </div>
                        <div style={{
                          width: "3em", height: "3px",
                          background: "rgba(255,255,255,0.06)", borderRadius: "2px",
                          overflow: "hidden", flexShrink: 0,
                        }}>
                          <div style={{
                            width: `${bar}%`, height: "100%",
                            background: t.accent, borderRadius: "2px",
                            transition: "width 0.5s",
                          }} />
                        </div>
                        <span style={{ color: "#6b7a90", fontSize: "0.8em", width: "2.8em", textAlign: "right", flexShrink: 0 }}>
                          {artist.plays}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {(() => {
            const gs: Record<string, number> = {};
            for (const a of topData.artists) {
              for (const g of a.genres) gs[g] = (gs[g] || 0) + a.plays;
            }
            const sorted = Object.entries(gs).sort((a, b) => b[1] - a[1]).slice(0, 10);
            if (sorted.length === 0) return null;
            const maxP = sorted[0][1];
            return (
              <div style={{ flexShrink: 0, marginTop: "0.3em" }}>
                <span style={{ color: t.accent, fontSize: "0.6em", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "0.2em", display: "block" }}>◉ top genres</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.15em" }}>
                  {sorted.map(([genre, plays]) => (
                    <div key={genre} style={{
                      display: "flex", alignItems: "center", gap: "0.3em",
                      padding: "0.15em 0.4em", borderRadius: "3px",
                      background: "rgba(255,255,255,0.02)", fontSize: "0.55em",
                    }}>
                      <span style={{ color: "#d4dce8", fontWeight: 600 }}>{genre}</span>
                      <div style={{ width: "2em", height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ width: `${(plays / maxP) * 100}%`, height: "100%", background: t.accent, borderRadius: "2px", transition: "width 0.5s" }} />
                      </div>
                      <span style={{ color: "#6b7a90", fontSize: "0.85em" }}>{plays}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </>
      )}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}`}</style>
    </div>
  );
}

/* ── Projects ── */

const PROJECTS = [
  { n: "creativeshi", d: "portfolio dashboard with live monitors", lang: "TypeScript", url: "https://github.com/PayDash/creativeshi" },
  { n: "FunPortfolioDuh", d: "css 3d portfolio", lang: "TypeScript", url: "https://github.com/PayDash/FunPortfolioDuh" },
  { n: "PayDash.github.io", d: "cool", lang: "JavaScript", url: "https://github.com/PayDash/PayDash.github.io" },
  { n: "Roblox-The-Hunt-Badge-Checker", d: "pretty cool right?", lang: "Python", url: "https://github.com/PayDash/Roblox-The-Hunt-Badge-Checker" },
];

function Projects({ expanded }: { expanded?: boolean }) {
  const t = THEMES.projects;
  const langs = new Set(PROJECTS.map(p => p.lang)).size;
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
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3em", flex: 1, paddingTop: "0.3em" }}>
        {PROJECTS.map((p) => (
          <a key={p.n} href={p.url} target="_blank" rel="noopener noreferrer"
            style={{
              background: "rgba(255,255,255,0.02)", borderRadius: "4px", padding: "0.35em 0.6em",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              textDecoration: "none", transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ ...T(""), fontWeight: 700, fontSize: expanded ? "1em" : "0.85em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.n}</div>
              <div style={{ ...DIM, fontSize: "0.7em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.d}</div>
            </div>
            <span style={{
              color: t.accent, fontSize: "0.6em", background: `${t.accent}11`,
              padding: "0.15em 0.4em", borderRadius: "3px", flexShrink: 0, marginLeft: "0.4em",
            }}>
              {p.lang}
            </span>
          </a>
        ))}
      </div>
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

/* ── Pulse (Wakatime stats) ── */

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

function useWakatime() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/wakatime")
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {});
  }, []);
  return data;
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
      borderRadius: "8px", padding: "0.3em 0.7em", flex: 1, minWidth: 80,
      animation: "statFade 0.5s ease backwards",
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

function Activity({ expanded }: { expanded?: boolean }) {
  const t = THEMES.skills;
  const data = useWakatime();

  if (!data) return null;

  if (!expanded) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.3em", marginBottom: "0.3em" }}>
        <span style={{
          fontSize: "1.4em",
          color: t.accent,
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
          <StatCard label="CODED" value={data.human_readable_total || "—"} accent={t.accent} />
          <StatCard label="DAILY" value={data.human_readable_daily_average || "—"} accent={t.accent} />
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

/* ── Clock ── */

function Clock({ expanded }: { expanded?: boolean }) {
  const [time, setTime] = useState(new Date());
  const t = THEMES.clock;

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const hh = time.getHours().toString().padStart(2, "0");
  const mm = time.getMinutes().toString().padStart(2, "0");
  const ss = time.getSeconds().toString().padStart(2, "0");
  const blink = time.getSeconds() % 2 === 0;
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" as const }}>
      <span style={{ ...ACCENT(t.accent), fontSize: expanded ? "1.2em" : "1em", fontWeight: 700, marginBottom: "0.4em", letterSpacing: "2px" }}>⏱ clock</span>
      <div style={{ borderBottom: `1px solid ${t.accent}22`, width: "80%", marginBottom: "0.6em" }} />
      <div style={{
        color: "#eef2f6", fontWeight: 300,
        fontSize: expanded ? "clamp(40px, 8vw, 120px)" : "clamp(20px, 4vw, 54px)",
        letterSpacing: "0.05em", lineHeight: 1.2,
      }}>
        {hh}{blink ? ":" : " "}{mm}
      </div>
      <div style={{ ...DIM, fontSize: expanded ? "clamp(14px, 2.5vw, 40px)" : "clamp(8px, 1.5vw, 20px)", marginTop: "0.2em" }}>
        {ss}
      </div>
      <div style={{ ...MUTED, fontSize: "0.7em", marginTop: "0.4em" }}>
        {days[time.getDay()]}, {months[time.getMonth()]} {time.getDate()}, {time.getFullYear()}
      </div>
      <div style={{ ...DIM, fontSize: "0.6em", marginTop: "0.6em", background: "rgba(255,255,255,0.02)", borderRadius: "4px", padding: "0.3em 0.8em" }}>
        system online · uptime 4d
      </div>
    </div>
  );
}

/* ── Dispatcher ── */

export function MonitorContent({ id, expanded }: { id: MonitorId; expanded?: boolean }) {
  switch (id) {
    case "terminal": return <Terminal expanded={expanded} />;
    case "about":    return <About expanded={expanded} />;
    case "music":    return <Music expanded={expanded} />;
    case "projects": return <Projects expanded={expanded} />;
    case "skills":   return <Activity expanded={expanded} />;
    case "clock":    return <Clock expanded={expanded} />;
  }
}

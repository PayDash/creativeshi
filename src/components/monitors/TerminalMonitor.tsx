"use client";

import { useState, useEffect, useRef } from "react";
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
  const [typedVis, setTypedVis] = useState(0);
  // While expanded, the full info is shown immediately (no typing animation).
  const vis = expanded ? INFO.length : typedVis;

  useEffect(() => {
    if (expanded) return;
    const iv = setInterval(() => {
      setTypedVis((v) => {
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
    "drwxr-xr-x   3 root   wheel      96 Mar 12 11:00 ..",
    "-rw-r--r--   1 vibez  staff     420 Jul 26 03:46 .zshrc",
    "drwxr-xr-x   8 vibez  staff     256 Jul 26 19:00 projects",
    "drwxr-xr-x   4 vibez  staff     128 Jul 20 14:30 games",
    "drwxr-xr-x   6 vibez  staff     192 Jul 24 09:15 dotfiles",
    "-rw-r--r--   1 vibez  staff     420 Jul 25 20:40 neofetch.log",
    "-rwxr-xr-x   1 vibez  staff     174 Jul 26 03:47 start.sh",
  ],
  "uname -a": ["Darwin biggesthater 25.5.0 Darwin Kernel Version 25.5.0: arm64"],
  "whoami": ["vibez"],
  "uptime": [" 03:46  up 4 days,  2:01,  1 user,  load average: 0.08, 0.12, 0.15"],
  "df -h": [
    "Filesystem     Size   Used  Avail  Use%  Mounted on",
    "/dev/disk3s1  228Gi   12Gi   96Gi   11%  /",
  ],
  "pwd": ["/Users/vibez"],
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
    case "uname": return args.includes("-a") ? FAKE_COMMANDS["uname -a"] : ["Darwin"];
    case "df": return args.includes("-h") ? FAKE_COMMANDS["df -h"] : ["Filesystem      1K-blocks      Used    Avail Use% Mounted on", "/dev/disk3s1   239075328 12582912 100663296  11% /"];
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
      setLines((p) => [
        ...p,
        { t: "c" as const, v: cmd },
        ...INFO.map(([k, v]) => ({ t: "o" as const, v: `${k.padEnd(9)}: ${v}` })),
      ]);
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

export { Terminal };

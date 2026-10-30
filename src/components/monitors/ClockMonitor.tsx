"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { THEMES } from "@/lib/constants";

export function Clock({ expanded }: { expanded?: boolean }) {
  const [time, setTime] = useState(new Date());
  const t = THEMES.clock;

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const hh = time.getHours().toString().padStart(2, "0");
  const mm = time.getMinutes().toString().padStart(2, "0");
  const ss = time.getSeconds().toString().padStart(2, "0");

  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

  const ds = time.getSeconds();

  const digits = [hh[0], hh[1], mm[0], mm[1], ss[0], ss[1]];

  function AnimatedDigit({ d, i }: { d: string; i: number }) {
    return (
      <motion.span
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 + Math.abs(i - 2.5) * 0.035, duration: 0.5, ease: "easeOut" }}
      >
        {d}
      </motion.span>
    );
  }

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", textAlign: "center" as const,
      position: "relative", overflow: "hidden",
      background: t.bg,
      minHeight: expanded ? "auto" : "140px",
      padding: expanded ? "0" : "4px 0",
    }}>
      {/* Animated background glow */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", inset: 0,
          background: `
            radial-gradient(ellipse at 50% 50%, ${t.accent}18 0%, transparent 70%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
        style={{
          display: "flex", alignItems: "center", gap: "0.4em",
          marginBottom: "0.3em", zIndex: 1,
        }}>
        <motion.span
          animate={{ filter: [`drop-shadow(0 0 4px ${t.accent}44)`, `drop-shadow(0 0 12px ${t.accent}66)`, `drop-shadow(0 0 4px ${t.accent}44)`] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ fontSize: expanded ? "0.7em" : "0.55em", color: t.accent }}
        >◉</motion.span>
        <span style={{
          fontSize: expanded ? "0.85em" : "0.65em", fontWeight: 700,
          letterSpacing: "3px", textTransform: "uppercase" as const,
          background: `linear-gradient(90deg, ${t.accent}88, ${t.accent}, ${t.accent}88)`,
          backgroundClip: "text", WebkitBackgroundClip: "text",
          color: "transparent",
        }}>clock</span>
      </motion.div>

      {/* Time display */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          position: "relative", zIndex: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column",
        }}>
        <div
          style={{
            fontFamily: "monospace", fontWeight: 300,
            fontSize: expanded ? "clamp(56px, 10vw, 140px)" : "clamp(26px, 3.5vw, 44px)",
            letterSpacing: "0.06em", lineHeight: 1,
            color: t.accent,
            pointerEvents: "none",
          }}
        >
          <AnimatedDigit d={digits[0]} i={0} />
          <AnimatedDigit d={digits[1]} i={1} />
          <span style={{ opacity: ds % 2 === 0 ? 1 : 0.15, transition: "opacity 0.15s" }}>:</span>
          <AnimatedDigit d={digits[2]} i={2} />
          <AnimatedDigit d={digits[3]} i={3} />
          <span style={{ opacity: ds % 2 === 0 ? 1 : 0.15, transition: "opacity 0.15s" }}>:</span>
          <AnimatedDigit d={digits[4]} i={4} />
          <AnimatedDigit d={digits[5]} i={5} />
        </div>
      </motion.div>

      {/* Date chip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
        style={{
          marginTop: expanded ? "0.6em" : "0.35em",
          display: "flex", alignItems: "center", gap: "0.5em", zIndex: 1,
        }}>
        <motion.div
          whileHover={{ scale: 1.05, borderColor: `${t.accent}55` }}
          style={{
            background: `${t.accent}11`, border: `1px solid ${t.accent}22`,
            borderRadius: "20px", padding: "0.2em 0.7em",
            fontSize: expanded ? "0.7em" : "0.55em",
            color: t.accent, fontWeight: 600, letterSpacing: "0.5px",
          }}
        >
          {days[time.getDay()]}, {months[time.getMonth()]} {time.getDate()}
        </motion.div>
      </motion.div>

      {/* System tag */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.5 }}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4em", zIndex: 1,
          fontSize: expanded ? "0.5em" : "0.4em", color: "#475569",
          marginTop: expanded ? "0.8em" : "0",
          paddingBottom: expanded ? "0.4em" : "0",
        }}>
        <motion.span
          animate={{ scale: [1, 0.6, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: "4px", height: "4px", borderRadius: "50%",
            background: t.accent, display: "inline-block",
          }}
        />
        system online · uptime 4d
      </motion.div>
    </div>
  );
}

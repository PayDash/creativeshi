"use client";

import { useState, useEffect } from "react";

export function LoadingScreen({ onReady }: { onReady: () => void }) {
  const [phase, setPhase] = useState<"loading" | "fading" | "done">("loading");

  useEffect(() => {
    const t = setTimeout(() => setPhase("fading"), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase === "fading") {
      const t = setTimeout(() => {
        setPhase("done");
        onReady();
      }, 600);
      return () => clearTimeout(t);
    }
  }, [phase, onReady]);

  if (phase === "done") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#080a12",
        color: "#e2e8f0",
        fontFamily: "monospace",
        transition: "opacity 0.6s ease-out",
        opacity: phase === "fading" ? 0 : 1,
      }}
    >
      <div style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "1px" }}>
        ByeVibez<span style={{ color: "#7c3aed" }}>.</span>
      </div>
      <div style={{
        marginTop: "24px", width: "160px", height: "2px",
        background: "rgba(255,255,255,0.06)", borderRadius: "1px", overflow: "hidden",
      }}>
        <div style={{
          width: "100%", height: "100%",
          background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
          borderRadius: "1px", animation: "loadBar 0.8s ease-in-out",
        }} />
      </div>
      <div style={{ marginTop: "12px", fontSize: "11px", color: "#475569" }}>
        booting monitors...
      </div>
      <style>{`
        @keyframes loadBar {
          0% { width: 0; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}

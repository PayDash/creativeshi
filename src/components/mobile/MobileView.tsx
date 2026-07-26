"use client";

import { useState } from "react";
import { MonitorContent } from "@/components/MonitorContent";
import { MONITOR_IDS, THEMES } from "@/lib/constants";
import type { MonitorId } from "@/lib/constants";

const ITEMS = MONITOR_IDS.map((id) => ({ id, ...THEMES[id] }));

export function MobileView() {
  const [focused, setFocused] = useState<MonitorId | null>(null);

  return (
    <div style={{
      minHeight: "100dvh", width: "100vw", background: "#0d0f12",
      color: "#e8eaed", fontFamily: "system-ui, sans-serif",
      paddingBottom: "40px",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 16px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "sticky", top: 0, zIndex: 10,
        background: "#0d0f12",
      }}>
        <div style={{ fontSize: "18px", fontWeight: 700, color: "#e2e8f0" }}>
          ByeVibez<span style={{ color: "#7c3aed" }}>.</span>
        </div>
        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
          ~/portfolio — tap a monitor
        </div>
      </div>

      {/* Monitor cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px" }}>
        {ITEMS.map((item) => (
          <div
            key={item.id}
            onClick={() => setFocused(item.id)}
            style={{
              background: item.bg,
              borderRadius: "8px",
              border: `1px solid rgba(255,255,255,0.06)`,
              overflow: "hidden",
              display: "flex", flexDirection: "column",
              boxShadow: `0 4px 20px rgba(0,0,0,0.4)`,
              cursor: "pointer",
            }}
          >
            <div style={{
              height: "1px",
              background: `linear-gradient(90deg, transparent, ${item.accent}44, transparent)`,
            }} />
            <div style={{
              padding: "14px 14px",
              display: "flex", flexDirection: "column",
              fontSize: "14px",
            }}>
              <MonitorContent id={item.id} />
            </div>
            <div style={{
              height: "20px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 10px",
              borderTop: `1px solid ${item.accent}11`,
              fontSize: "9px", color: "rgba(255,255,255,0.15)",
            }}>
              <span>{item.label}</span>
              <span style={{ color: item.accent, fontSize: "7px" }}>●</span>
            </div>
          </div>
        ))}
      </div>

      {/* Focus sheet */}
      {focused && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            display: "flex", alignItems: "flex-end",
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={() => setFocused(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", height: "90%",
              background: THEMES[focused].bg,
              borderRadius: "12px 12px 0 0",
              borderTop: `1px solid ${THEMES[focused].accent}33`,
              boxShadow: `0 -10px 40px rgba(0,0,0,0.5)`,
              padding: "5% 5% 3%",
              display: "flex", flexDirection: "column",
              fontSize: "15px",
              position: "relative",
              overflow: "hidden",
              animation: "slideUp 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "2px",
              background: `linear-gradient(90deg, transparent, ${THEMES[focused].accent}, transparent)`,
            }} />
            <div style={{
              width: "36px", height: "4px", borderRadius: "2px",
              background: "rgba(255,255,255,0.15)",
              margin: "0 auto 8px", flexShrink: 0,
            }} />
            <div onClick={() => setFocused(null)}
              style={{
                position: "absolute", top: "12px", right: "16px",
                color: THEMES[focused].accent, fontSize: "18px",
                cursor: "pointer", zIndex: 10, opacity: 0.7,
              }}
            >✕</div>
            <MonitorContent id={focused} expanded />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

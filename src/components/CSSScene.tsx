"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { MonitorContent } from "./MonitorContent";
import { UIOverlay } from "./UIOverlay";
import { MONITOR_IDS, THEMES } from "@/lib/constants";
import type { MonitorId } from "@/lib/constants";

export function CSSScene() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const [focused, setFocused] = useState<MonitorId | null>(null);
  const raf = useRef<number>(0);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  // Drag-swap state
  const [items, setItems] = useState<MonitorId[]>([...MONITOR_IDS]);
  const [dragging, setDragging] = useState<MonitorId | null>(null);
  const [dragOver, setDragOver] = useState<MonitorId | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const longPress = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStart = useRef({ x: 0, y: 0, t: 0 });
  const pointerId = useRef<number | null>(null);
  const tapTarget = useRef<MonitorId | null>(null);

  // Mouse parallax
  useEffect(() => {
    const el = gridRef.current;
    if (!el || focused || dragging) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      target.current = { x: (px - 0.5) * 12, y: (py - 0.5) * -6 };
    };
    const onLeave = () => { target.current = { x: 0, y: 0 }; };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [focused, dragging]);

  // Smooth animation loop
  useEffect(() => {
    let running = true;
    const tick = () => {
      if (!running) return;
      current.current.x += (target.current.x - current.current.x) * 0.06;
      current.current.y += (target.current.y - current.current.y) * 0.06;
      setRot({ x: current.current.y, y: current.current.x });
      raf.current = requestAnimationFrame(tick);
    };
    tick();
    return () => { running = false; cancelAnimationFrame(raf.current); };
  }, []);

  const handleFocus = useCallback((id: MonitorId | null) => {
    if (id) target.current = { x: 0, y: 0 };
    setFocused(id);
  }, []);

  const focusId = focused;

  const startDrag = useCallback((id: MonitorId, x: number, y: number) => {
    setDragging(id);
    setDragPos({ x, y });
    setDragOver(null);
    pointerId.current = null;
  }, []);

  const swap = useCallback((from: MonitorId, to: MonitorId) => {
    setItems((prev) => {
      const idx = prev.indexOf(from);
      const idy = prev.indexOf(to);
      if (idx === -1 || idy === -1) return prev;
      const next = [...prev];
      next[idx] = to;
      next[idy] = from;
      return next;
    });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent, id: MonitorId) => {
    if (focused) return;
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    pointerId.current = e.pointerId;
    tapTarget.current = id;
    dragStart.current = { x: e.clientX, y: e.clientY, t: Date.now() };

    longPress.current = setTimeout(() => {
      startDrag(id, e.clientX, e.clientY);
    }, 400);
  }, [focused, startDrag]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragging) {
      e.preventDefault();
      setDragPos({ x: e.clientX, y: e.clientY });
      const els = document.elementsFromPoint(e.clientX, e.clientY);
      for (const el of els) {
        const id = (el as HTMLElement).dataset?.monitorId as MonitorId | undefined;
        if (id && id !== dragging) { setDragOver(id); return; }
      }
      setDragOver(null);
      return;
    }
    // Cancel long press if moved too far before drag starts
    if (longPress.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (dx * dx + dy * dy > 100) {
        clearTimeout(longPress.current);
        longPress.current = null;
      }
    }
  }, [dragging]);

  const handlePointerUp = useCallback(() => {
    if (longPress.current) { clearTimeout(longPress.current); longPress.current = null; }

    const wasDragging = dragging !== null;

    if (dragging && dragOver) {
      swap(dragging, dragOver);
    }

    setDragging(null);
    setDragOver(null);
    pointerId.current = null;

    // If this was a tap (not a drag), focus the monitor
    if (!wasDragging && tapTarget.current) {
      const id = tapTarget.current;
      tapTarget.current = null;
      handleFocus(focused === id ? null : id);
    }
    tapTarget.current = null;
  }, [dragging, dragOver, swap, handleFocus, focused]);

  // Cleanup long press on unmount
  useEffect(() => () => { if (longPress.current) clearTimeout(longPress.current); }, []);

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      background: "radial-gradient(ellipse at 50% 40%, #141028 0%, #080a10 60%, #050608 100%)",
      position: "relative",
      fontFamily: "monospace",
      userSelect: "none",
      WebkitUserSelect: "none",
      touchAction: "none",
    }}>
      {/* Subtle floor glow at bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "30vh",
        background: "linear-gradient(0deg, rgba(109,40,217,0.04) 0%, transparent 100%)",
        pointerEvents: "none",
      }} />

      {/* Monitor array */}
      <div ref={gridRef} style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
        transformStyle: "preserve-3d",
        perspective: "1200px",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "4px",
        width: focused ? "90vw" : "min(76vw, 1320px)",
        maxWidth: focused ? "1400px" : "1320px",
        transition: "width 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        pointerEvents: focused ? "none" : "auto",
      }}>
        {items.map((id) => {
          const theme = THEMES[id];
          const isFocused = focusId === id;
          const isDragging = dragging === id;
          const isOver = dragOver === id && dragging && !isDragging;
          return (
            <div
              key={id}
              className="monitor-card"
              data-monitor-id={id}
               style={{
                  position: "relative",
                  aspectRatio: "16 / 10",
                  background: theme.bg,
                  borderRadius: "6px",
                  border: isOver
                    ? `2px solid ${theme.accent}`
                    : "1px solid rgba(255,255,255,0.06)",
                  overflow: "hidden",
                  boxShadow: isOver
                    ? `0 0 30px ${theme.accent}66`
                    : isFocused
                      ? `0 0 40px ${theme.accent}33, 0 0 80px ${theme.accent}22`
                      : `0 4px 24px rgba(0,0,0,0.5), inset 0 0 1px ${theme.accent}22`,
                  transform: isDragging ? "scale(0.92)" : "translateZ(0)",
                  opacity: isDragging ? 0.35 : 1,
                  transition: isDragging
                    ? "opacity 0.15s, transform 0.15s"
                    : "box-shadow 0.3s, transform 0.2s, border 0.2s",
                  pointerEvents: "auto",
                  display: "flex",
                  flexDirection: "column",
                  touchAction: "none",
                  "--accent": theme.accent,
                  "--glow": `${theme.accent}33`,
                } as React.CSSProperties}
                data-focused={isFocused ? "true" : "false"}
                data-dragging={isDragging ? "true" : "false"}
                onPointerDown={(e) => handlePointerDown(e, id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
              {/* Screen glow strip top */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "1px",
                background: `linear-gradient(90deg, transparent, ${theme.accent}44, transparent)`,
              }} />

              {/* Monitor content */}
              <div style={{
                flex: 1,
                padding: "6% 5%",
                display: "flex",
                flexDirection: "column",
                fontSize: "clamp(6px, 0.85vw, 14px)",
                overflow: "hidden",
              }}>
                <MonitorContent id={id} />
              </div>

              {/* Bottom bar with label */}
              <div style={{
                height: "clamp(14px, 2vw, 28px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 8%",
                borderTop: `1px solid ${theme.accent}11`,
                fontSize: "clamp(6px, 0.6vw, 11px)",
                color: "rgba(255,255,255,0.15)",
                letterSpacing: "1px",
                textTransform: "lowercase" as const,
              }}>
                <span>{theme.label}</span>
                <span style={{ color: theme.accent, fontSize: "clamp(4px, 0.45vw, 8px)" }}>● active</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating drag ghost */}
      {dragging && (
        <div style={{
          position: "fixed", zIndex: 100, pointerEvents: "none",
          left: dragPos.x - 120, top: dragPos.y - 80,
          width: 240, height: 160,
          background: THEMES[dragging].bg,
          borderRadius: "8px",
          border: `2px solid ${THEMES[dragging].accent}88`,
          boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${THEMES[dragging].accent}33`,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          transform: "scale(1.05)",
          transition: "none",
        }}>
          <div style={{
            flex: 1, padding: "6% 5%", display: "flex", flexDirection: "column",
            fontSize: "clamp(6px, 0.85vw, 14px)", overflow: "hidden",
          }}>
            <MonitorContent id={dragging} />
          </div>
          <div style={{
            height: "clamp(14px, 2vw, 28px)", display: "flex", alignItems: "center",
            justifyContent: "space-between", padding: "0 8%",
            borderTop: `1px solid ${THEMES[dragging].accent}22`,
            fontSize: "clamp(6px, 0.6vw, 11px)", color: "rgba(255,255,255,0.15)",
            letterSpacing: "1px", textTransform: "lowercase",
          }}>
            <span>{THEMES[dragging].label}</span>
          </div>
        </div>
      )}

      {/* Focus overlay */}
      {focused && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            animation: "fadeIn 0.3s ease-out",
          }}
          onClick={() => handleFocus(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(90vw, 1000px)",
              height: "min(80vh, 650px)",
              background: THEMES[focused].bg,
              borderRadius: "10px",
              border: `1px solid ${THEMES[focused].accent}33`,
              boxShadow: `0 0 60px ${THEMES[focused].accent}33`,
              padding: "3% 4%",
              display: "flex",
              flexDirection: "column",
              fontSize: "clamp(10px, 1.2vw, 16px)",
              position: "relative",
              overflow: "hidden",
              animation: "scaleIn 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "2px",
              background: `linear-gradient(90deg, transparent, ${THEMES[focused].accent}, transparent)`,
            }} />
            <MonitorContent id={focused} expanded />
          </div>
        </div>
      )}

      <style>{`
        .monitor-card { cursor: pointer !important; }
        .monitor-card * { cursor: inherit !important; }
        .monitor-card[data-dragging="true"] { cursor: grabbing !important; }
        .monitor-card[data-dragging="true"] * { cursor: inherit !important; }
        .monitor-card:hover:not([data-focused="true"]):not([data-dragging="true"]) {
          box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 0 20px var(--glow), inset 0 0 2px var(--glow) !important;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      <UIOverlay focused={!!focused} onExit={() => handleFocus(null)} />
    </div>
  );
}

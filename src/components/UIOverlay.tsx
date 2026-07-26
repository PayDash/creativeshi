"use client";

interface Props {
  focused: boolean;
  onExit: () => void;
}

export function UIOverlay({ focused, onExit }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%)",
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            fontFamily: "monospace",
            fontSize: "13px",
            fontWeight: 700,
            color: "#e2e8f0",
          }}
        >
          ByeVibez<span style={{ color: "#7c3aed" }}>.</span>
        </div>

        {focused && (
          <button
            onClick={onExit}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px",
              color: "#94a3b8",
              padding: "4px 12px",
              fontSize: "11px",
              fontFamily: "monospace",
              cursor: "pointer",
              pointerEvents: "auto",
            }}
          >
            esc to exit focus
          </button>
        )}
      </div>

    </div>
  );
}

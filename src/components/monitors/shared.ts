/* Shared monospace text styles for monitor panels */

export const T = {
  color: "#d4dce8",
  margin: 0,
  fontFamily: "monospace",
  fontSize: "inherit",
  lineHeight: 1.6,
} as const;

export const DIM = {
  color: "#6b7a90",
  margin: 0,
  fontFamily: "monospace",
  fontSize: "inherit",
  lineHeight: 1.6,
} as const;

export const ACCENT = (c: string) => ({
  color: c,
  margin: 0,
  fontFamily: "monospace",
  fontSize: "inherit",
  lineHeight: 1.6,
});

export type MonitorId = "terminal" | "about" | "music" | "projects" | "skills" | "clock";

export interface MonitorTheme {
  accent: string;
  bg: string;
  subBg: string;
  label: string;
}

export const THEMES: Record<MonitorId, MonitorTheme> = {
  terminal: { accent: "#3b82f6", bg: "#0a0e1a", subBg: "#0c1220", label: "terminal" },
  about:    { accent: "#a78bfa", bg: "#0c0a18", subBg: "#100c20", label: "about" },
  music:    { accent: "#1DB954", bg: "#080c08", subBg: "#0c140c", label: "music" },
  projects: { accent: "#fbbf24", bg: "#141008", subBg: "#1a1408", label: "projects" },
  skills:   { accent: "#06b6d4", bg: "#080c0e", subBg: "#0c1214", label: "activity" },
  clock:    { accent: "#a78bfa", bg: "#0a0814", subBg: "#0e0c1c", label: "clock" },
};

export const MONITOR_IDS: MonitorId[] = ["terminal", "about", "music", "projects", "skills", "clock"];

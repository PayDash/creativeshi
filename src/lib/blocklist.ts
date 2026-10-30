import fs from "fs";
import path from "path";

export function loadBlocklist(): string[] {
  try {
    const p = path.join(process.cwd(), "wakatime-blocklist.json");
    return JSON.parse(fs.readFileSync(p, "utf-8")) as string[];
  } catch {
    return [];
  }
}

// Case-insensitive substring match used to keep private project names
// off the public activity panel.
export function shouldBlock(name: string, blocklist: string[]): boolean {
  const low = name.toLowerCase();
  return blocklist.some((b) => low.includes(b.toLowerCase()));
}

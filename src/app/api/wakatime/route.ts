import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function loadBlocklist(): string[] {
  try {
    const p = path.join(process.cwd(), "wakatime-blocklist.json");
    return JSON.parse(fs.readFileSync(p, "utf-8")) as string[];
  } catch {
    return [];
  }
}

function shouldBlock(name: string, blocklist: string[]): boolean {
  const low = name.toLowerCase();
  return blocklist.some((b) => low.includes(b.toLowerCase()));
}

export async function GET() {
  const key = process.env.WAKATIME_API_KEY;
  if (!key) {
    return NextResponse.json(null);
  }

  try {
    const encoded = Buffer.from(key).toString("base64");
    const headers = { Authorization: `Basic ${encoded}` };

    const [statsRes, allTimeRes] = await Promise.all([
      fetch("https://wakatime.com/api/v1/users/current/stats/last_7_days", { headers }),
      fetch("https://wakatime.com/api/v1/users/current/stats/all_time", { headers }),
    ]);

    const stats = await statsRes.json();
    const allTime = await allTimeRes.json();

    const data = stats.data ?? null;
    const blocklist = loadBlocklist();

    if (data) {
      for (const key of ["projects", "languages", "editors", "operating_systems"]) {
        if (Array.isArray(data[key])) {
          data[key] = data[key].filter((item: any) => !shouldBlock(item.name, blocklist));
        }
      }
      data.grand_total = allTime.data?.human_readable_total ?? null;
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(null);
  }
}

import { NextResponse } from "next/server";
import { loadBlocklist, shouldBlock } from "@/lib/blocklist";
import type { WakatimeStats, WakatimeStatsResponse } from "@/lib/wakatime";

const STATS_KEYS = ["projects", "languages", "editors", "operating_systems"] as const;

export async function GET() {
  const key = process.env.WAKATIME_API_KEY;
  if (!key) {
    return NextResponse.json(null);
  }

  try {
    const encoded = Buffer.from(key).toString("base64");
    const headers = { Authorization: `Basic ${encoded}` };

    const [statsRes, allTimeRes] = await Promise.all([
      fetch("https://wakatime.com/api/v1/users/current/stats/last_7_days", { headers, next: { revalidate: 300 } }),
      fetch("https://wakatime.com/api/v1/users/current/stats/all_time", { headers, next: { revalidate: 300 } }),
    ]);

    const stats: WakatimeStatsResponse = await statsRes.json();
    const allTime: WakatimeStatsResponse = await allTimeRes.json();

    const data: WakatimeStats | null = stats.data ?? null;
    const blocklist = loadBlocklist();

    if (data) {
      for (const k of STATS_KEYS) {
        const list = data[k];
        if (list) {
          data[k] = list.filter((item) => !shouldBlock(item.name, blocklist));
        }
      }
      data.grand_total = allTime.data?.human_readable_total ?? null;
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(null);
  }
}

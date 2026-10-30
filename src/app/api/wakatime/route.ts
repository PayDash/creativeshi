import { NextResponse } from "next/server";
import { loadBlocklist, shouldBlock } from "@/lib/blocklist";

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

    const stats = await statsRes.json();
    const allTime = await allTimeRes.json();

    const data = stats.data ?? null;
    const blocklist = loadBlocklist();

    if (data) {
      for (const k of ["projects", "languages", "editors", "operating_systems"]) {
        if (Array.isArray(data[k])) {
          data[k] = data[k].filter((item: any) => !shouldBlock(item.name, blocklist));
        }
      }
      data.grand_total = allTime.data?.human_readable_total ?? null;
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(null);
  }
}

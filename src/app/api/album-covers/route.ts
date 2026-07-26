import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dir = join(process.cwd(), "public", "album-covers");
    const files = readdirSync(dir).filter(
      f => f.endsWith(".png") || f.endsWith(".gif") || f.endsWith(".jpg") || f.endsWith(".jpeg")
    );
    if (files.length === 0) return NextResponse.json({ url: null });
    const pick = files[Math.floor(Math.random() * files.length)];
    return NextResponse.json({ url: `/album-covers/${pick}` });
  } catch {
    return NextResponse.json({ url: null });
  }
}

import { NextResponse } from "next/server";
import { fetchRecentTracks, pickImageUrl } from "@/lib/spotify";

export const revalidate = 30;

export async function GET() {
  const hasCreds = !!(process.env.LASTFM_API_KEY && process.env.LASTFM_USERNAME);

  if (!hasCreds) {
    return NextResponse.json({
      recent: [],
      error: "Set LASTFM_API_KEY and LASTFM_USERNAME in .env.local",
    });
  }

  try {
    const raw = await fetchRecentTracks(10);

    const recent = raw.map((t: any) => ({
      title: t.name || "Unknown",
      artist: t.artist?.["#text"] || "Unknown",
      album: t.album?.["#text"] || "",
      image: pickImageUrl(t.image || []),
      nowPlaying: !!t["@attr"]?.nowplaying,
      url: t.url || "",
      date: t.date?.uts ? parseInt(t.date.uts) * 1000 : null,
    }));

    return NextResponse.json({ recent });
  } catch {
    return NextResponse.json({ recent: [] });
  }
}

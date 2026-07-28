import { NextRequest, NextResponse } from "next/server";
import { fetchTopTracks, fetchTopArtists } from "@/lib/spotify";

const RANGE_MAP: Record<string, string> = {
  week: "week",
  month: "month",
  year: "year",
  all: "all",
};

function mapTrack(t: any): { title: string; artist: string; plays: number; album: string } {
  return {
    title: t.name || "Unknown",
    artist: t.artist?.name || t.artist?.["#text"] || "Unknown",
    plays: parseInt(t.playcount) || 0,
    album: t.album?.["#text"] || "",
  };
}

function mapArtist(a: any): { name: string; genres: string[]; plays: number; image: string } {
  return {
    name: a.name || "Unknown",
    genres: (a.tags?.tag || []).map((t: any) => typeof t === "string" ? t : t.name || "").filter(Boolean),
    plays: parseInt(a.playcount) || 0,
    image: (() => {
      const imgs = a.image || [];
      const sizes = ["small", "medium", "large", "extralarge"];
      for (const sz of sizes) {
        const url = imgs.find((i: any) => i.size === sz)?.["#text"] || "";
        if (url && !url.includes("2a96cbd8b46e442fc41c2b86b821562f")) return url;
      }
      return "";
    })(),
  };
}

export async function GET(req: NextRequest) {
  const range = RANGE_MAP[req.nextUrl.searchParams.get("range") || "week"] || "week";

  const hasCreds = !!(process.env.LASTFM_API_KEY && process.env.LASTFM_USERNAME);

  if (!hasCreds) {
    return NextResponse.json({
      tracks: [],
      artists: [],
      error: "Set LASTFM_API_KEY and LASTFM_USERNAME in .env.local",
    });
  }

  try {
    const [rawTracks, rawArtists] = await Promise.all([
      fetchTopTracks(20, range),
      fetchTopArtists(20, range),
    ]);

    return NextResponse.json({
      tracks: rawTracks.map(mapTrack),
      artists: rawArtists.map(mapArtist),
    });
  } catch {
    return NextResponse.json({ tracks: [], artists: [] });
  }
}

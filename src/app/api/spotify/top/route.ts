import { NextRequest, NextResponse } from "next/server";
import { fetchTopTracks, fetchTopArtists, pickImageUrl } from "@/lib/spotify";
import type { LastfmArtist, LastfmTrack } from "@/lib/spotify";

const RANGES = ["week", "month", "year", "all"];

function mapTrack(t: LastfmTrack): { title: string; artist: string; plays: number; album: string } {
  return {
    title: t.name || "Unknown",
    artist: t.artist?.name || t.artist?.["#text"] || "Unknown",
    plays: parseInt(t.playcount ?? "") || 0,
    album: t.album?.["#text"] || "",
  };
}

function mapArtist(a: LastfmArtist): { name: string; genres: string[]; plays: number; image: string } {
  return {
    name: a.name || "Unknown",
    genres: (a.tags?.tag || []).map((t) => typeof t === "string" ? t : t.name || "").filter(Boolean),
    plays: parseInt(a.playcount ?? "") || 0,
    image: pickImageUrl(a.image || []),
  };
}

export async function GET(req: NextRequest) {
  const requested = req.nextUrl.searchParams.get("range") || "week";
  const range = RANGES.includes(requested) ? requested : "week";

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

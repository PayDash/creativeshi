const LASTFM_API = "https://ws.audioscrobbler.com/2.0";

const PERIOD_MAP: Record<string, string> = {
  week: "7day",
  month: "1month",
  year: "12month",
  all: "overall",
};

export interface LastfmImage {
  "#text": string;
  size: string;
}

export interface LastfmTrack {
  name: string;
  artist?: { name?: string; "#text"?: string };
  album?: { "#text": string };
  image?: LastfmImage[];
  playcount?: string;
  url?: string;
  "@attr"?: { nowplaying?: string };
  date?: { uts: string };
}

export interface LastfmArtist {
  name: string;
  playcount?: string;
  tags?: { tag: (string | { name: string })[] };
  image?: LastfmImage[];
}

function apiKey() {
  return process.env.LASTFM_API_KEY || "";
}

function username() {
  return process.env.LASTFM_USERNAME || "";
}

async function fetchLastFM<T>(method: string, period: string, limit = 10): Promise<T | null> {
  const key = apiKey();
  const user = username();
  if (!key || !user) return null;

  try {
    const url = `${LASTFM_API}/?method=${method}&user=${user}&period=${period}&api_key=${key}&format=json&limit=${limit}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchTopTracks(limit = 10, timeRange = "short_term"): Promise<LastfmTrack[]> {
  const period = PERIOD_MAP[timeRange] || "7day";
  const data = await fetchLastFM<{ toptracks?: { track?: LastfmTrack[] } }>("user.getTopTracks", period, limit);
  return data?.toptracks?.track ?? [];
}

export async function fetchTopArtists(limit = 10, timeRange = "short_term"): Promise<LastfmArtist[]> {
  const period = PERIOD_MAP[timeRange] || "7day";
  const data = await fetchLastFM<{ topartists?: { artist?: LastfmArtist[] } }>("user.getTopArtists", period, limit);
  return data?.topartists?.artist ?? [];
}

export async function fetchRecentTracks(limit = 10): Promise<LastfmTrack[]> {
  const key = apiKey();
  const user = username();
  if (!key || !user) return [];

  try {
    const url = `${LASTFM_API}/?method=user.getRecentTracks&user=${user}&api_key=${key}&format=json&limit=${limit}`;
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { recenttracks?: { track?: LastfmTrack[] } };
    return data?.recenttracks?.track ?? [];
  } catch {
    return [];
  }
}

// Last.fm serves this fixed image when no art exists; skip it.
const LASTFM_PLACEHOLDER_HASH = "2a96cbd8b46e442fc41c2b86b821562f";

export function pickImageUrl(imgs: LastfmImage[]): string {
  const sizes = ["small", "medium", "large", "extralarge"];
  for (const sz of sizes) {
    const url = imgs.find((i) => i.size === sz)?.["#text"] || "";
    if (url && !url.includes(LASTFM_PLACEHOLDER_HASH)) return url;
  }
  return "";
}

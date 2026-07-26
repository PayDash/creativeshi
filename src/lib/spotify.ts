const LASTFM_API = "https://ws.audioscrobbler.com/2.0";

const PERIOD_MAP: Record<string, string> = {
  week: "7day",
  month: "1month",
  year: "12month",
  all: "overall",
};

function apiKey() {
  return process.env.LASTFM_API_KEY || "";
}

function username() {
  return process.env.LASTFM_USERNAME || "";
}

async function fetchLastFM(method: string, period: string, limit = 10) {
  const key = apiKey();
  const user = username();
  if (!key || !user) return [];

  try {
    const url = `${LASTFM_API}/?method=${method}&user=${user}&period=${period}&api_key=${key}&format=json&limit=${limit}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data;
  } catch {
    return [];
  }
}

export async function fetchTopTracks(limit = 10, timeRange = "short_term"): Promise<any[]> {
  const period = PERIOD_MAP[timeRange] || "7day";
  const data = await fetchLastFM("user.getTopTracks", period, limit);
  return data?.toptracks?.track || [];
}

export async function fetchTopArtists(limit = 10, timeRange = "short_term"): Promise<any[]> {
  const period = PERIOD_MAP[timeRange] || "7day";
  const data = await fetchLastFM("user.getTopArtists", period, limit);
  return data?.topartists?.artist || [];
}

export async function fetchRecentTracks(limit = 10): Promise<any[]> {
  const key = apiKey();
  const user = username();
  if (!key || !user) return [];

  try {
    const url = `${LASTFM_API}/?method=user.getRecentTracks&user=${user}&api_key=${key}&format=json&limit=${limit}`;
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.recenttracks?.track || [];
  } catch {
    return [];
  }
}

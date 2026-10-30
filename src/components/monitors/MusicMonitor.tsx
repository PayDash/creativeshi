"use client";

import { useState, useEffect, useRef } from "react";
import { THEMES } from "@/lib/constants";
import { ACCENT } from "./shared";

type TopTrack = { title: string; artist: string; plays: number; album: string };
type TopArtist = { name: string; genres: string[]; plays: number; image: string };
type RecentTrack = { title: string; artist: string; album: string; image: string; nowPlaying: boolean; url: string; date: number | null };
type Range = "week" | "month" | "year" | "all";

const RANGES: { key: Range; label: string }[] = [
  { key: "week", label: "7d" },
  { key: "month", label: "1m" },
  { key: "year", label: "1y" },
  { key: "all", label: "all" },
];

const RANGE_LABEL: Record<Range, string> = {
  week: "this week",
  month: "this month",
  year: "this year",
  all: "all time",
};

function useTopData(range: Range) {
  const [data, setData] = useState<{ tracks: TopTrack[]; artists: TopArtist[] } | null>(null);
  useEffect(() => {
    // Abort on range change so a slow old response can't overwrite the new one.
    const ctrl = new AbortController();
    fetch(`/api/spotify/top?range=${range}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {});
    return () => ctrl.abort();
  }, [range]);
  return data;
}

function useRecentData() {
  const [data, setData] = useState<RecentTrack[] | null>(null);
  useEffect(() => {
    fetch("/api/spotify/recent")
      .then(r => r.json())
      .then(d => setData(d.recent))
      .catch(() => {});
    const id = setInterval(() => {
      fetch("/api/spotify/recent")
        .then(r => r.json())
        .then(d => setData(d.recent))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, []);
  return data;
}

function timeAgo(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

let _fbUrl: string | null | undefined;

async function fallbackCover(): Promise<string | null> {
  if (_fbUrl === undefined) {
    try {
      const r = await fetch("/api/album-covers");
      const d = await r.json();
      _fbUrl = d.url || null;
    } catch { _fbUrl = null; }
  }
  return _fbUrl ?? null;
}

function AlbumArt({ src, size, radius, accent, nowPlaying }: {
  src: string; size: string; radius: string; accent: string; nowPlaying?: boolean
}) {
  const [resolved, setResolved] = useState<string | null>(src || null);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const fallbackTried = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fallbackTried.current = false;
    if (src) {
      setResolved(src);
      setErrored(false);
      setLoaded(false);
      return;
    }
    // Empty image: go straight to the local fallback instead of a guaranteed 404.
    fallbackCover().then((url) => {
      if (cancelled) return;
      setResolved(url || "");
      setErrored(!url);
      setLoaded(false);
    });
    return () => { cancelled = true; };
  }, [src]);

  const handleError = async () => {
    if (fallbackTried.current) { setErrored(true); return; }
    fallbackTried.current = true;
    const url = await fallbackCover();
    if (url) {
      setResolved(url);
      setErrored(false);
      setLoaded(false);
    } else {
      setErrored(true);
    }
  };

  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      position: "relative", overflow: "hidden",
      background: "rgba(255,255,255,0.04)",
      boxShadow: nowPlaying ? `0 0 20px ${accent}44` : "none",
    }}>
      {!errored && !loaded && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.03) 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.2s ease-in-out infinite",
        }} />
      )}
      {errored ? (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          color: "rgba(255,255,255,0.12)", fontSize: "1.3em",
        }}>♪</div>
      ) : (
        <img src={resolved || undefined} alt=""
          onLoad={() => setLoaded(true)}
          onError={handleError}
          loading="lazy"
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            display: "block", opacity: loaded ? 1 : 0,
            transition: "opacity 0.3s",
          }} />
      )}
    </div>
  );
}

export function Music({ expanded }: { expanded?: boolean }) {
  const t = THEMES.music;
  const [range, setRange] = useState<Range>("week");
  const topData = useTopData(range);
  const recentData = useRecentData();

  if (!expanded) {
    const nowPlaying = recentData?.find(t => t.nowPlaying);
    const single = nowPlaying || recentData?.[0] || null;

    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <style>{`@keyframes wave{0%{transform:scaleY(0.3)}100%{transform:scaleY(1)}}@keyframes shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}`}</style>
        {single ? (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: "5%",
            padding: "0 4%",
          }}>
              <AlbumArt
                src={single.image?.replace("/34s/", "/174s/") || ""}
                size="clamp(40px, 7vw, 90px)" radius="8px"
                accent={t.accent} nowPlaying={!!nowPlaying} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: nowPlaying ? t.accent : "#94a3b8",
                fontSize: "clamp(8px, 0.55vw, 13px)",
                fontWeight: 600, letterSpacing: "0.5px", marginBottom: "0.2em",
              }}>
                {nowPlaying ? "NOW PLAYING" : "LAST PLAYED"}
              </div>
              <div style={{
                color: "#e2e8f0", fontWeight: 700,
                fontSize: "clamp(11px, 0.95vw, 20px)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {single.title}
              </div>
              <div style={{
                color: "#6b7a90",
                fontSize: "clamp(9px, 0.7vw, 15px)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {single.artist}
              </div>
              <div style={{
                display: "flex", alignItems: "flex-end", gap: "1.5px",
                height: "clamp(12px, 1vw, 22px)", marginTop: "0.25em",
              }}>
                {[3,6,4,7,3,8,2,9,4,6,2,7,3,8,5,6,3,7,4].map((h, i) => (
                  <div key={i} style={{
                    width: "clamp(2px, 0.15vw, 4px)",
                    height: `${Math.max(15, h * 8)}%`,
                    background: nowPlaying ? t.accent : "#475569",
                    borderRadius: "1px",
                    transformOrigin: "bottom",
                    animation: nowPlaying ? `wave ${0.4 + (i % 4) * 0.1}s ease-in-out infinite alternate` : "none",
                    animationDelay: `${i * 0.05}s`,
                  }} />
                ))}
              </div>

            </div>
            {nowPlaying && (
              <span style={{
                color: t.accent, fontSize: "clamp(10px, 0.8vw, 18px)",
                alignSelf: "center",
                animation: "pulse 2s ease-in-out infinite",
              }}>●</span>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#475569", fontSize: "clamp(9px, 0.7vw, 14px)", fontStyle: "italic" }}>
              no activity
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", scrollbarWidth: "thin", scrollbarColor: `${t.accent}22 transparent` }}>
      {/* Recently played */}
      {recentData && recentData.length > 0 && (
        <div style={{ flexShrink: 0, marginBottom: "0.1em" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4em", marginBottom: "0.15em" }}>
            <span style={{ fontSize: "0.9em", color: t.accent }}>♪</span>
            <span style={{ ...ACCENT(t.accent), fontSize: "0.8em", fontWeight: 700 }}>recently played</span>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.4em",
            paddingBottom: "0.2em",
          }}>
            {recentData.slice(0, 6).map((track, i) => (
              <div key={`${track.title}-${i}`} style={{
                display: "flex", alignItems: "center", gap: "0.4em",
                padding: "0.35em 0.5em", borderRadius: "5px",
                background: track.nowPlaying ? `${t.accent}15` : "rgba(255,255,255,0.04)",
                border: track.nowPlaying ? `1px solid ${t.accent}33` : "1px solid transparent",
                fontSize: "0.6em", minWidth: 0,
              }}>
                <AlbumArt
                  src={track.image}
                  size="2.4em" radius="4px"
                  accent={t.accent} nowPlaying={track.nowPlaying} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ color: track.nowPlaying ? t.accent : "#d4dce8", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {track.title}
                  </div>
                  <div style={{ color: "#6b7a90", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {track.artist}
                  </div>
                </div>
                <span style={{ color: "#475569", fontSize: "0.75em", flexShrink: 0 }}>
                  {track.nowPlaying ? "●" : track.date ? timeAgo(track.date) : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top tracks & artists */}
      {topData && (
        <>
          {/* Range selector */}
          <div style={{
            display: "flex", gap: "0.15em", marginTop: "0.2em", marginBottom: "0.15em",
            flexShrink: 0, alignItems: "center",
          }}>
            {RANGES.map((r) => (
              <button key={r.key} onClick={() => setRange(r.key)}
                style={{
                  padding: "0.1em 0.4em", borderRadius: "3px", border: "none",
                  fontSize: "0.5em", fontFamily: "monospace", cursor: "pointer",
                  transition: "all 0.12s",
                  background: range === r.key ? `${t.accent}22` : "rgba(255,255,255,0.03)",
                  color: range === r.key ? t.accent : "#64748b",
                  fontWeight: range === r.key ? 700 : 400,
                  letterSpacing: "0.3px",
                }}
              >
                {r.label}
              </button>
            ))}
            <span style={{ color: "#475569", fontSize: "0.45em", marginLeft: "0.5em" }}>
              top songs & artists {RANGE_LABEL[range]}
            </span>
          </div>

          <div style={{
            flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1em",
            minHeight: 0,
          }}>
            {topData.tracks.length > 0 && (
              <div style={{
                display: "flex", flexDirection: "column", minHeight: 0,
              }}>
                <span style={{
                  color: t.accent, fontSize: "0.6em", fontWeight: 700,
                  letterSpacing: "0.5px", marginBottom: "0.2em", flexShrink: 0,
                }}>
                  ▲ top songs
                </span>
                <div style={{
                  flex: 1, overflow: "auto", display: "flex", flexDirection: "column",
                  gap: "0.15em", scrollbarWidth: "thin",
                  scrollbarColor: `${t.accent}22 transparent`,
                }}>
                  {topData.tracks.slice(0, 20).map((track, i) => {
                    const bar = (track.plays / (topData.tracks[0]?.plays || 1)) * 100;
                    return (
                      <div key={`${track.title}-${i}`} style={{
                        display: "flex", alignItems: "center", gap: "0.4em",
                        padding: "0.15em 0.3em", borderRadius: "3px",
                        background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
                        fontSize: "0.6em",
                      }}>
                        <span style={{ color: t.accent, width: "1.2em", textAlign: "right", fontWeight: 700, flexShrink: 0, fontSize: "0.8em" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: "#d4dce8", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {track.title}
                          </div>
                          <div style={{ color: "#6b7a90", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {track.artist}
                          </div>
                        </div>
                        <div style={{
                          width: "3em", height: "3px",
                          background: "rgba(255,255,255,0.06)", borderRadius: "2px",
                          overflow: "hidden", flexShrink: 0,
                        }}>
                          <div style={{
                            width: `${bar}%`, height: "100%",
                            background: t.accent, borderRadius: "2px",
                            transition: "width 0.5s",
                          }} />
                        </div>
                        <span style={{ color: "#6b7a90", fontSize: "0.8em", width: "2.5em", textAlign: "right", flexShrink: 0 }}>
                          {track.plays}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {topData.artists.length > 0 && (
              <div style={{
                display: "flex", flexDirection: "column", minHeight: 0,
              }}>
                <span style={{
                  color: t.accent, fontSize: "0.6em", fontWeight: 700,
                  letterSpacing: "0.5px", marginBottom: "0.2em", flexShrink: 0,
                }}>
                  ● top artists
                </span>
                <div style={{
                  flex: 1, overflow: "auto", display: "flex", flexDirection: "column",
                  gap: "0.15em", scrollbarWidth: "thin",
                  scrollbarColor: `${t.accent}22 transparent`,
                }}>
                  {topData.artists.slice(0, 20).map((artist, i) => {
                    const bar = (artist.plays / (topData.artists[0]?.plays || 1)) * 100;
                    const genreTag = artist.genres?.[0] || "";
                    return (
                      <div key={artist.name} style={{
                        display: "flex", alignItems: "center", gap: "0.4em",
                        padding: "0.15em 0.3em", borderRadius: "3px",
                        background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
                        fontSize: "0.6em",
                      }}>
                        <span style={{ color: t.accent, width: "1.2em", textAlign: "right", fontWeight: 700, flexShrink: 0, fontSize: "0.8em" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {artist.image && (
                          <AlbumArt
                            src={artist.image}
                            size="1.8em" radius="50%"
                            accent={t.accent} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: "#d4dce8", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {artist.name}
                          </div>
                          {genreTag && (
                            <div style={{ color: "#6b7a90", fontSize: "0.85em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {genreTag}
                            </div>
                          )}
                        </div>
                        <div style={{
                          width: "3em", height: "3px",
                          background: "rgba(255,255,255,0.06)", borderRadius: "2px",
                          overflow: "hidden", flexShrink: 0,
                        }}>
                          <div style={{
                            width: `${bar}%`, height: "100%",
                            background: t.accent, borderRadius: "2px",
                            transition: "width 0.5s",
                          }} />
                        </div>
                        <span style={{ color: "#6b7a90", fontSize: "0.8em", width: "2.8em", textAlign: "right", flexShrink: 0 }}>
                          {artist.plays}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {(() => {
            const gs: Record<string, number> = {};
            for (const a of topData.artists) {
              for (const g of a.genres) gs[g] = (gs[g] || 0) + a.plays;
            }
            const sorted = Object.entries(gs).sort((a, b) => b[1] - a[1]).slice(0, 10);
            if (sorted.length === 0) return null;
            const maxP = sorted[0][1];
            return (
              <div style={{ flexShrink: 0, marginTop: "0.3em" }}>
                <span style={{ color: t.accent, fontSize: "0.6em", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "0.2em", display: "block" }}>◉ top genres</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.15em" }}>
                  {sorted.map(([genre, plays]) => (
                    <div key={genre} style={{
                      display: "flex", alignItems: "center", gap: "0.3em",
                      padding: "0.15em 0.4em", borderRadius: "3px",
                      background: "rgba(255,255,255,0.02)", fontSize: "0.55em",
                    }}>
                      <span style={{ color: "#d4dce8", fontWeight: 600 }}>{genre}</span>
                      <div style={{ width: "2em", height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ width: `${(plays / maxP) * 100}%`, height: "100%", background: t.accent, borderRadius: "2px", transition: "width 0.5s" }} />
                      </div>
                      <span style={{ color: "#6b7a90", fontSize: "0.85em" }}>{plays}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </>
      )}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}`}</style>
    </div>
  );
}

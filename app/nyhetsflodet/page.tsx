"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useGlobalLoading } from "@/app/components/LoadingProvider";

interface NewsItem {
  title: string;
  author: string | null;
  timestamp: string;
  content: string;
  image: { url: string | null; caption: string | null } | null;
  url: string | null;
}

interface NewsData {
  source: { name: string; section: string; url: string; retrieved_date: string };
  news_items: NewsItem[];
}

const SOURCE_OPTIONS = [
  { label: "SvD", url: "https://www.svd.se", group: "sv" },
  { label: "Omni", url: "https://omni.se", group: "sv" },
  { label: "DN", url: "https://www.dn.se", group: "sv" },
  { label: "Aftonbladet", url: "https://www.aftonbladet.se", group: "sv" },
  { label: "BBC", url: "https://www.bbc.com/news", group: "int" },
  { label: "The Guardian", url: "https://www.theguardian.com", group: "int" },
  { label: "Al Jazeera", url: "https://www.aljazeera.com", group: "int" },
  { label: "AP News", url: "https://apnews.com", group: "int" },
];

const CACHE_KEY = "nyhetsflodet_cache";

interface CachedNews {
  results: NewsData[];
  errors: string[];
  fetchedAt: string;
}

function loadCache(): CachedNews | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CachedNews) : null;
  } catch {
    return null;
  }
}

function saveCache(data: CachedNews) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

function formatRelative(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just nu";
  if (mins < 60) return `${mins} min sedan`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} tim sedan`;
  return `${Math.floor(hours / 24)} dag(ar) sedan`;
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem" }}>
      <span
        style={{
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          fontWeight: 500,
          color: "rgba(255,255,255,0.45)",
          paddingRight: "1rem",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
    </div>
  );
}

export default function NyhetsFlödet() {
  const [results, setResults] = useState<NewsData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>(
    SOURCE_OPTIONS.filter((s) => s.group === "sv").map((s) => s.url),
  );
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [relativeTime, setRelativeTime] = useState<string>("");
  const setGlobalLoading = useGlobalLoading();

  useEffect(() => {
    const cached = loadCache();
    if (cached) {
      setResults(cached.results);
      setErrors(cached.errors);
      setFetchedAt(cached.fetchedAt);
      setFetched(true);
    }
  }, []);

  useEffect(() => {
    if (!fetchedAt) return;
    setRelativeTime(formatRelative(fetchedAt));
    const id = setInterval(() => setRelativeTime(formatRelative(fetchedAt)), 30_000);
    return () => clearInterval(id);
  }, [fetchedAt]);

  function toggleSource(url: string) {
    setSelectedSources((prev) =>
      prev.includes(url) ? prev.filter((s) => s !== url) : [...prev, url],
    );
  }

  async function fetchNews() {
    if (selectedSources.length === 0) return;
    setLoading(true);
    setGlobalLoading(true);
    setFetched(false);
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources: selectedSources }),
      });
      const data = await res.json();
      const newResults = data.results ?? [];
      const newErrors = data.errors ?? [];
      const now = new Date().toISOString();
      setResults(newResults);
      setErrors(newErrors);
      setFetchedAt(now);
      saveCache({ results: newResults, errors: newErrors, fetchedAt: now });
    } catch (e) {
      setErrors([String(e)]);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
      setFetched(true);
    }
  }

  const allArticles = results.flatMap((r) =>
    (r.news_items ?? []).map((item) => ({ ...item, sourceName: r.source?.name ?? "Okänd" })),
  );

  const displayed = activeFilter
    ? allArticles.filter((a) => a.sourceName === activeFilter)
    : allArticles;

  const sourceNames = [...new Set(results.map((r) => r.source?.name).filter(Boolean))];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
            fontWeight: 400,
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            color: "white",
            marginBottom: "0.75rem",
          }}
        >
          Nyhetsflödet
        </h1>
        <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>
          Hämta de senaste nyheterna från flera källor på ett ställe.
        </p>
      </div>

      {/* Source selector */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "1.5rem 0",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1.375rem", marginBottom: "1.5rem" }}>
          {(["sv", "int"] as const).map((group) => (
            <div key={group}>
              <SectionHeader label={group === "sv" ? "Svenska" : "Internationella"} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {SOURCE_OPTIONS.filter((s) => s.group === group).map(({ label, url }) => {
                  const active = selectedSources.includes(url);
                  return (
                    <button
                      key={url}
                      onClick={() => toggleSource(url)}
                      className={`btn-chip${active ? " chip-active" : ""}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <button
            onClick={fetchNews}
            disabled={loading || selectedSources.length === 0}
            className="btn-primary"
          >
            {loading ? "Hämtar nyheter…" : "Hämta nyheter"}
          </button>
          {fetchedAt && !loading && (
            <span
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.45)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "rgba(74,222,128,0.8)",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              Senast hämtad {relativeTime}
            </span>
          )}
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && fetched && (
        <div
          style={{
            border: "1px solid rgba(220,38,38,0.35)",
            padding: "0.875rem 1rem",
            marginBottom: "1.5rem",
            background: "rgba(220,38,38,0.06)",
          }}
        >
          <p style={{ fontSize: "0.8125rem", color: "rgba(252,165,165,0.9)", marginBottom: "0.25rem", fontWeight: 500 }}>
            Kunde inte hämta från:
          </p>
          <ul style={{ fontSize: "0.8125rem", color: "rgba(252,165,165,0.75)", paddingLeft: "1rem" }}>
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {/* Filter tabs */}
      {sourceNames.length > 0 && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <button
            onClick={() => setActiveFilter(null)}
            className={`btn-chip${activeFilter === null ? " chip-active" : ""}`}
          >
            Alla ({allArticles.length})
          </button>
          {sourceNames.map((name) => {
            const count = allArticles.filter((a) => a.sourceName === name).length;
            return (
              <button
                key={name}
                onClick={() => setActiveFilter(name === activeFilter ? null : name!)}
                className={`btn-chip${activeFilter === name ? " chip-active" : ""}`}
              >
                {name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Articles grid */}
      {displayed.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {displayed.map((article, i) => (
            <div
              key={i}
              style={{
                background: "#0A0A0A",
                padding: "1.125rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem" }}>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#C9A961",
                  }}
                >
                  {article.sourceName}
                </span>
                <span style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.45)", flexShrink: 0 }}>
                  {article.timestamp}
                </span>
              </div>

              <h2
                style={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  lineHeight: 1.4,
                  color: "white",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {article.title}
              </h2>

              {article.content && (
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.55,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {article.content}
                </p>
              )}

              {article.author && (
                <p style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.45)" }}>
                  av {article.author}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginTop: "auto",
                  paddingTop: "0.625rem",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  alignItems: "center",
                }}
              >
                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.6875rem",
                      color: "rgba(255,255,255,0.45)",
                      textDecoration: "underline",
                      textUnderlineOffset: "2px",
                    }}
                  >
                    Läs mer →
                  </a>
                )}
                <Link
                  href={
                    article.url
                      ? `/vinklinganalys?url=${encodeURIComponent(article.url)}&title=${encodeURIComponent(article.title)}&source=${encodeURIComponent(article.sourceName)}`
                      : `/vinklinganalys?title=${encodeURIComponent(article.title)}&content=${encodeURIComponent(article.content?.slice(0, 2000) ?? "")}&source=${encodeURIComponent(article.sourceName)}`
                  }
                  style={{
                    fontSize: "0.6875rem",
                    color: "#C9A961",
                    textDecoration: "underline",
                    textUnderlineOffset: "2px",
                    marginLeft: "auto",
                  }}
                >
                  Analysera
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {fetched && !loading && displayed.length === 0 && errors.length === 0 && (
        <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.45)", paddingTop: "3rem" }}>
          Inga artiklar hittades.
        </p>
      )}

      {!fetched && !loading && (
        <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.45)", paddingTop: "3rem" }}>
          Välj källor ovan och klicka på &ldquo;Hämta nyheter&rdquo; för att se de senaste artiklarna.
        </p>
      )}
    </div>
  );
}

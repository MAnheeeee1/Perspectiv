"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  { label: "SvD", url: "https://www.svd.se" },
  { label: "Omni", url: "https://omni.se" },
  { label: "DN", url: "https://www.dn.se" },
  { label: "Aftonbladet", url: "https://www.aftonbladet.se" },
];

export default function NyhetsFlödet() {
  const [results, setResults] = useState<NewsData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>(
    SOURCE_OPTIONS.map((s) => s.url),
  );
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  function toggleSource(url: string) {
    setSelectedSources((prev) =>
      prev.includes(url) ? prev.filter((s) => s !== url) : [...prev, url],
    );
  }

  async function fetchNews() {
    if (selectedSources.length === 0) return;
    setLoading(true);
    setFetched(false);
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources: selectedSources }),
      });
      const data = await res.json();
      setResults(data.results ?? []);
      setErrors(data.errors ?? []);
    } catch (e) {
      setErrors([String(e)]);
    } finally {
      setLoading(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Nyhetsflödet</h1>
        <p className="text-slate-500 text-sm">
          Hämta de senaste nyheterna från flera svenska källor på ett ställe.
        </p>
      </div>

      {/* Source selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
        <p className="text-sm font-medium text-slate-700 mb-3">Välj källor</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {SOURCE_OPTIONS.map(({ label, url }) => {
            const active = selectedSources.includes(url);
            return (
              <button
                key={url}
                onClick={() => toggleSource(url)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-slate-300 text-slate-600 hover:border-blue-400"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <button
          onClick={fetchNews}
          disabled={loading || selectedSources.length === 0}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Hämtar nyheter…" : "Hämta nyheter"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <p className="text-slate-500 text-sm">Skrapar och analyserar källorna…</p>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && fetched && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-red-700 mb-1">Kunde inte hämta från:</p>
          <ul className="list-disc list-inside text-sm text-red-600 space-y-0.5">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {/* Filter by source */}
      {sourceNames.length > 0 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              activeFilter === null
                ? "bg-slate-800 border-slate-800 text-white"
                : "bg-white border-slate-300 text-slate-600 hover:border-slate-500"
            }`}
          >
            Alla ({allArticles.length})
          </button>
          {sourceNames.map((name) => {
            const count = allArticles.filter((a) => a.sourceName === name).length;
            return (
              <button
                key={name}
                onClick={() => setActiveFilter(name === activeFilter ? null : name!)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  activeFilter === name
                    ? "bg-slate-800 border-slate-800 text-white"
                    : "bg-white border-slate-300 text-slate-600 hover:border-slate-500"
                }`}
              >
                {name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Articles grid */}
      {displayed.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((article, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  {article.sourceName}
                </span>
                <span className="text-xs text-slate-400">{article.timestamp}</span>
              </div>

              <h2 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-3">
                {article.title}
              </h2>

              {article.content && (
                <p className="text-xs text-slate-500 line-clamp-4 leading-relaxed">
                  {article.content}
                </p>
              )}

              {article.author && (
                <p className="text-xs text-slate-400">av {article.author}</p>
              )}

              <div className="flex gap-2 mt-auto pt-1">
                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Läs mer →
                  </a>
                )}
                <Link
                  href={`/vinklinganalys?title=${encodeURIComponent(article.title)}&content=${encodeURIComponent(article.content?.slice(0, 2000) ?? "")}&source=${encodeURIComponent(article.sourceName)}`}
                  className="text-xs text-slate-500 hover:text-slate-700 ml-auto border border-slate-200 px-2 py-0.5 rounded hover:border-slate-400 transition-colors"
                >
                  Analysera
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {fetched && !loading && displayed.length === 0 && errors.length === 0 && (
        <p className="text-slate-400 text-center py-16">Inga artiklar hittades.</p>
      )}

      {!fetched && !loading && (
        <div className="text-center py-24 text-slate-400">
          <p className="text-lg mb-2">Välj källor ovan och klicka på "Hämta nyheter"</p>
          <p className="text-sm">Varje källa skrapas och analyseras i realtid</p>
        </div>
      )}
    </div>
  );
}

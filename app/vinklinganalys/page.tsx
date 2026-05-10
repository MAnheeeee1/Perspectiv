"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface Analysis {
  tone: string;
  political_bias: number;
  political_label: string;
  framing: string;
  loaded_language: string[];
  gaps: string[];
  summary: string;
}

const TONE_COLORS: Record<string, string> = {
  neutral: "bg-slate-100 text-slate-700",
  positiv: "bg-green-100 text-green-700",
  negativ: "bg-red-100 text-red-700",
  sensationalistisk: "bg-orange-100 text-orange-700",
};

const BIAS_LABELS: Record<string, string> = {
  vänster: "text-red-600",
  "center-vänster": "text-red-400",
  neutral: "text-slate-500",
  "center-höger": "text-blue-400",
  höger: "text-blue-600",
};

function BiasBar({ value }: { value: number }) {
  const clamped = Math.max(-2, Math.min(2, value));
  const percent = ((clamped + 2) / 4) * 100;

  return (
    <div className="relative">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>Vänster</span>
        <span>Center</span>
        <span>Höger</span>
      </div>
      <div className="h-3 bg-gradient-to-r from-red-200 via-slate-200 to-blue-200 rounded-full relative">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-slate-700 rounded-full shadow-sm transition-all"
          style={{ left: `calc(${percent}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-300 mt-0.5">
        <span>-2</span>
        <span>0</span>
        <span>+2</span>
      </div>
    </div>
  );
}

function AnalysisForm() {
  const searchParams = useSearchParams();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState(searchParams.get("title") ?? "");
  const [content, setContent] = useState(searchParams.get("content") ?? "");
  const [source, setSource] = useState(searchParams.get("source") ?? "");
  const [mode, setMode] = useState<"url" | "text">(
    searchParams.get("content") ? "text" : "url",
  );
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("content")) {
      handleAnalyze();
    }
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    const body =
      mode === "url"
        ? { url }
        : { title, content, source };

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Något gick fel");
      } else {
        setAnalysis(data.analysis);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Vinklingsanalys</h1>
        <p className="text-slate-500 text-sm">
          Analysera ton, politisk vinkling och saknade perspektiv i en artikel.
        </p>
      </div>

      {/* Input panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setMode("url")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              mode === "url"
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-slate-300 text-slate-600 hover:border-blue-400"
            }`}
          >
            URL
          </button>
          <button
            onClick={() => setMode("text")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              mode === "text"
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-slate-300 text-slate-600 hover:border-blue-400"
            }`}
          >
            Text
          </button>
        </div>

        {mode === "url" ? (
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.svd.se/a/artikel..."
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ) : (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Artikelns rubrik (valfritt)"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Källa, t.ex. SvD (valfritt)"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Klistra in artikelns text här…"
              rows={6}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || (mode === "url" ? !url : !content)}
          className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Analyserar…" : "Analysera"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <p className="text-slate-500 text-sm">Analyserar artikel…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {analysis && !loading && (
        <div className="flex flex-col gap-5">
          {/* Header cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                Ton
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${TONE_COLORS[analysis.tone] ?? "bg-slate-100 text-slate-700"}`}
              >
                {analysis.tone.charAt(0).toUpperCase() + analysis.tone.slice(1)}
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                Politisk vinkling
              </p>
              <span
                className={`text-sm font-semibold ${BIAS_LABELS[analysis.political_label] ?? "text-slate-700"}`}
              >
                {analysis.political_label.charAt(0).toUpperCase() +
                  analysis.political_label.slice(1)}{" "}
                <span className="text-slate-400 font-normal">
                  ({analysis.political_bias > 0 ? "+" : ""}
                  {analysis.political_bias.toFixed(1)})
                </span>
              </span>
            </div>
          </div>

          {/* Bias bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">
              Politisk skala
            </p>
            <BiasBar value={analysis.political_bias} />
          </div>

          {/* Framing */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Inramning
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">{analysis.framing}</p>
          </div>

          {/* Loaded language */}
          {analysis.loaded_language.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                Vinklade ord & fraser
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.loaded_language.map((word, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-full"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gaps */}
          {analysis.gaps.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                Saknade perspektiv
              </p>
              <ul className="space-y-1.5">
                {analysis.gaps.map((gap, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-red-400 mt-0.5 shrink-0">○</span>
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary */}
          <div className="bg-slate-900 text-white rounded-xl p-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Sammanfattning
            </p>
            <p className="text-sm leading-relaxed">{analysis.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VinklingsanalysPage() {
  return (
    <Suspense>
      <AnalysisForm />
    </Suspense>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { useGlobalLoading } from "@/app/components/LoadingProvider";

interface Analysis {
  tone: string;
  political_bias: number;
  political_label: string;
  framing: string;
  loaded_language: string[];
  gaps: string[];
  source_transparency?: {
    score: number;
    label: string;
    notes: string;
  };
  fact_opinion?: {
    facts_percent: number;
    label: string;
    notes: string;
  };
  emotional_manipulation?: {
    score: number;
    label: string;
    techniques: string[];
  };
  summary: string;
}

const TONE_COLORS: Record<string, string> = {
  neutral:           "rgba(255,255,255,0.55)",
  positiv:           "rgba(74,222,128,0.85)",
  negativ:           "rgba(252,165,165,0.85)",
  sensationalistisk: "rgba(251,191,36,0.85)",
};

const BIAS_COLORS: Record<string, string> = {
  "vänster":        "#f87171",
  "center-vänster": "#fca5a5",
  "neutral":        "rgba(255,255,255,0.55)",
  "center-höger":   "#93c5fd",
  "höger":          "#60a5fa",
};

function scoreColor(score: number, invertScale = false): string {
  const high = score >= 7;
  const mid  = score >= 4;
  if (!invertScale) {
    if (high) return "rgba(74,222,128,0.85)";
    if (mid)  return "rgba(251,191,36,0.85)";
    return "rgba(248,113,113,0.85)";
  } else {
    if (high) return "rgba(248,113,113,0.85)";
    if (mid)  return "rgba(251,191,36,0.85)";
    return "rgba(74,222,128,0.85)";
  }
}

// ── Unified signals section ────────────────────────────────────────────────
function SignalerSection({ analysis }: { analysis: Analysis }) {
  const biasPercent =
    ((Math.max(-2, Math.min(2, analysis.political_bias)) + 2) / 4) * 100;

  type Row = {
    key: string;
    label: string;
    valueLabel: string;
    valueColor: string;
    sub: string;
    bar: React.ReactNode;
  };

  const rows: Row[] = [
    {
      key: "vinkling",
      label: "Politisk vinkling",
      valueLabel:
        analysis.political_label.charAt(0).toUpperCase() +
        analysis.political_label.slice(1),
      valueColor: BIAS_COLORS[analysis.political_label] ?? "white",
      sub: `${analysis.political_bias > 0 ? "+" : ""}${analysis.political_bias.toFixed(1)}`,
      bar: (
        <div
          style={{
            position: "relative",
            height: "4px",
            background:
              "linear-gradient(to right, rgba(248,113,113,0.45), rgba(255,255,255,0.07), rgba(96,165,250,0.45))",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              left: `calc(${biasPercent}% - 5px)`,
              width: "10px",
              height: "10px",
              background: "#C9A961",
              borderRadius: "50%",
            }}
          />
        </div>
      ),
    },
    ...(analysis.source_transparency
      ? [
          {
            key: "transparens",
            label: "Källtransparens",
            valueLabel:
              analysis.source_transparency.label.charAt(0).toUpperCase() +
              analysis.source_transparency.label.slice(1),
            valueColor: scoreColor(analysis.source_transparency.score),
            sub: `${analysis.source_transparency.score}/10`,
            bar: (
              <div style={{ height: "4px", background: "rgba(255,255,255,0.07)" }}>
                <div
                  style={{
                    width: `${(analysis.source_transparency.score / 10) * 100}%`,
                    height: "100%",
                    background: scoreColor(analysis.source_transparency.score),
                  }}
                />
              </div>
            ),
          },
        ]
      : []),
    ...(analysis.fact_opinion
      ? [
          {
            key: "fakta",
            label: "Fakta vs. åsikt",
            valueLabel:
              analysis.fact_opinion.label.charAt(0).toUpperCase() +
              analysis.fact_opinion.label.slice(1),
            valueColor: "white",
            sub: `${analysis.fact_opinion.facts_percent}% fakta`,
            bar: (
              <div style={{ display: "flex", height: "4px", gap: "2px" }}>
                <div
                  style={{
                    width: `${analysis.fact_opinion.facts_percent}%`,
                    background: "rgba(74,222,128,0.65)",
                    minWidth: analysis.fact_opinion.facts_percent > 0 ? "2px" : "0",
                  }}
                />
                <div style={{ flex: 1, background: "rgba(248,113,113,0.4)" }} />
              </div>
            ),
          },
        ]
      : []),
    ...(analysis.emotional_manipulation
      ? [
          {
            key: "manipulation",
            label: "Manipulation",
            valueLabel:
              analysis.emotional_manipulation.label.charAt(0).toUpperCase() +
              analysis.emotional_manipulation.label.slice(1),
            valueColor: scoreColor(analysis.emotional_manipulation.score, true),
            sub: `${analysis.emotional_manipulation.score}/10`,
            bar: (
              <div style={{ height: "4px", background: "rgba(255,255,255,0.07)" }}>
                <div
                  style={{
                    width: `${(analysis.emotional_manipulation.score / 10) * 100}%`,
                    height: "100%",
                    background: scoreColor(analysis.emotional_manipulation.score, true),
                  }}
                />
              </div>
            ),
          },
        ]
      : []),
  ];

  const techniques = analysis.emotional_manipulation?.techniques ?? [];

  return (
    <ResultSection label="Signaler">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
        {rows.map(({ key, label, valueLabel, valueColor, sub, bar }) => (
          <div
            key={key}
            style={{
              display: "grid",
              gridTemplateColumns: "8rem 1fr auto",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.38)",
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
            <div>{bar}</div>
            <div style={{ textAlign: "right", minWidth: "4.5rem" }}>
              <div
                style={{ fontSize: "0.75rem", fontWeight: 500, color: valueColor, lineHeight: 1.25 }}
              >
                {valueLabel}
              </div>
              <div style={{ fontSize: "0.625rem", color: "rgba(255,255,255,0.28)", lineHeight: 1.25 }}>
                {sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manipulation techniques */}
      {techniques.length > 0 && (
        <div
          style={{
            marginTop: "1.25rem",
            paddingTop: "1rem",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.375rem",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.28)",
              marginRight: "0.25rem",
              whiteSpace: "nowrap",
            }}
          >
            Tekniker:
          </span>
          {techniques.map((t, i) => (
            <span
              key={i}
              style={{
                fontSize: "0.6875rem",
                padding: "2px 7px",
                border: "1px solid rgba(248,113,113,0.22)",
                color: "rgba(252,165,165,0.7)",
                background: "rgba(248,113,113,0.04)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </ResultSection>
  );
}

function ResultSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingTop: "1.25rem",
        paddingBottom: "1.25rem",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          fontWeight: 500,
          color: "rgba(255,255,255,0.45)",
          marginBottom: "0.75rem",
        }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function AnalysisForm() {
  const searchParams = useSearchParams();

  const paramUrl = searchParams.get("url") ?? "";
  const [url,     setUrl]     = useState(paramUrl);
  const [title,   setTitle]   = useState(searchParams.get("title") ?? "");
  const [content, setContent] = useState(searchParams.get("content") ?? "");
  const [source,  setSource]  = useState(searchParams.get("source") ?? "");
  const [mode, setMode] = useState<"url" | "text">(
    paramUrl ? "url" : searchParams.get("content") ? "text" : "url",
  );
  const [loading,        setLoading]        = useState(false);
  const [analysis,       setAnalysis]       = useState<Analysis | null>(null);
  const [error,          setError]          = useState<string | null>(null);
  const [limitedContent, setLimitedContent] = useState(false);
  const setGlobalLoading = useGlobalLoading();

  useEffect(() => {
    if (paramUrl || searchParams.get("content")) handleAnalyze();
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAnalyze() {
    setLoading(true);
    setGlobalLoading(true);
    setError(null);
    setAnalysis(null);
    setLimitedContent(false);

    const body = mode === "url" ? { url, source } : { title, content, source };

    try {
      const res  = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Något gick fel");
      } else {
        setAnalysis(data.analysis);
        setLimitedContent(data.limitedContent ?? false);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  }

  const canSubmit = mode === "url" ? !!url : !!content;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="analysis-layout">
        {/* ── Left — title ── */}
        <div style={{ paddingTop: "0.25rem" }}>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              fontWeight: 400,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              color: "white",
              marginBottom: "1rem",
            }}
          >
            Vinklingsanalys
          </h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            Analysera ton, politisk vinkling, källtransparens och emotionell
            manipulation i en artikel.
          </p>
        </div>

        {/* ── Right — form + results ── */}
        <div>
          {/* Lägesflikar */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <button
              onClick={() => setMode("url")}
              className={`btn-chip${mode === "url" ? " chip-active" : ""}`}
            >
              URL
            </button>
            <button
              onClick={() => setMode("text")}
              className={`btn-chip${mode === "text" ? " chip-active" : ""}`}
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
              className="input-field"
              style={{ marginBottom: "1rem" }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.625rem",
                marginBottom: "1rem",
              }}
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Artikelns rubrik (valfritt)"
                className="input-field"
              />
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Källa, t.ex. SvD (valfritt)"
                className="input-field"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Klistra in artikelns text här…"
                rows={6}
                className="input-field"
                style={{ resize: "none" }}
              />
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !canSubmit}
            className="btn-primary"
          >
            {loading ? "Analyserar…" : "Analysera"}
          </button>

          {/* Fel */}
          {error && (
            <div
              style={{
                border: "1px solid rgba(220,38,38,0.35)",
                padding: "0.875rem 1rem",
                marginTop: "1.25rem",
                fontSize: "0.875rem",
                color: "rgba(252,165,165,0.9)",
                background: "rgba(220,38,38,0.06)",
              }}
            >
              {error}
            </div>
          )}

          {/* Betalvägg-varning */}
          {limitedContent && !loading && (
            <div
              style={{
                border: "1px solid rgba(251,191,36,0.3)",
                padding: "0.75rem 1rem",
                marginTop: "1rem",
                fontSize: "0.8125rem",
                color: "rgba(253,230,138,0.8)",
                background: "rgba(251,191,36,0.05)",
              }}
            >
              Artikeln är bakom betalvägg — analysen baseras på en kortare
              förhandsgranskning och kan vara mindre träffsäker.
            </div>
          )}

          {/* ── Resultat ── */}
          {analysis && !loading && (
            <div style={{ marginTop: "2rem" }}>

              {/* Ton */}
              <ResultSection label="Ton">
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: TONE_COLORS[analysis.tone] ?? "white",
                  }}
                >
                  {analysis.tone.charAt(0).toUpperCase() + analysis.tone.slice(1)}
                </span>
              </ResultSection>

              {/* Signaler — unified bars */}
              <SignalerSection analysis={analysis} />

              {/* Inramning */}
              <ResultSection label="Inramning">
                <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.65 }}>
                  {analysis.framing}
                </p>
              </ResultSection>

              {/* Vinklade ord & fraser */}
              {analysis.loaded_language.length > 0 && (
                <ResultSection label="Vinklade ord & fraser">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                    {analysis.loaded_language.map((word, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: "0.75rem",
                          padding: "3px 8px",
                          border: "1px solid rgba(251,191,36,0.3)",
                          color: "rgba(253,230,138,0.75)",
                          background: "rgba(251,191,36,0.05)",
                        }}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </ResultSection>
              )}

              {/* Saknade perspektiv */}
              {analysis.gaps.length > 0 && (
                <ResultSection label="Saknade perspektiv">
                  <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {analysis.gaps.map((gap, i) => (
                      <li
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.625rem",
                          fontSize: "0.875rem",
                          color: "rgba(255,255,255,0.7)",
                        }}
                      >
                        <span
                          style={{
                            color: "rgba(248,113,113,0.6)",
                            marginTop: "0.25rem",
                            flexShrink: 0,
                            fontSize: "0.6875rem",
                          }}
                        >
                          ●
                        </span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </ResultSection>
              )}

              {/* Sammanfattning */}
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  paddingTop: "1.25rem",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.45)",
                    marginBottom: "0.75rem",
                  }}
                >
                  Sammanfattning
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.125rem",
                    lineHeight: 1.55,
                    color: "white",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {analysis.summary}
                </p>
              </div>

            </div>
          )}
        </div>
      </div>
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

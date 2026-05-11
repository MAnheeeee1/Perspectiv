import Link from "next/link";

export default function JamforelsevyPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
          fontWeight: 400,
          lineHeight: 0.95,
          letterSpacing: "-0.03em",
          color: "white",
          marginBottom: "1rem",
          maxWidth: "24rem",
        }}
      >
        Jämförelsevy
      </h1>
      <p style={{ fontSize: "0.875rem", color: "var(--text-2)", marginBottom: "4rem" }}>
        Visa artiklar om samma ämne bredvid varandra för att se skillnader i rapportering.
      </p>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "2rem", maxWidth: "28rem" }}>
        <p
          style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontWeight: 500,
            color: "var(--text-3)",
            marginBottom: "0.875rem",
          }}
        >
          Status
        </p>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.375rem",
            color: "white",
            marginBottom: "0.875rem",
            lineHeight: 1.25,
            letterSpacing: "-0.015em",
          }}
        >
          Under utveckling
        </p>
        <p style={{ fontSize: "0.875rem", color: "var(--text-2)", lineHeight: 1.65, marginBottom: "2rem" }}>
          Jämförelsevy söker artiklar om samma nyhet från flera källor och visar dem
          bredvid varandra — så att du direkt kan se hur vinklingen skiljer sig åt.
        </p>
        <Link
          href="/nyhetsflodet"
          style={{
            fontSize: "0.8125rem",
            fontWeight: 500,
            letterSpacing: "0.04em",
            color: "var(--accent)",
            textDecoration: "underline",
            textDecorationColor: "var(--accent)",
            textUnderlineOffset: "3px",
          }}
        >
          Gå till Nyhetsflödet →
        </Link>
      </div>
    </div>
  );
}

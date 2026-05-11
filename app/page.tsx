import Link from "next/link";

const features = [
  {
    num: "01",
    href: "/nyhetsflodet",
    title: "Nyhetsflödet",
    desc: "Hämta artiklar från SvD, DN, Aftonbladet, Omni och internationella källor på ett ställe.",
    cta: "Öppna flödet",
    active: true,
  },
  {
    num: "02",
    href: "/vinklinganalys",
    title: "Vinklingsanalys",
    desc: "Analysera ton, politisk vinkling och saknade perspektiv i valfri artikel.",
    cta: "Analysera artikel",
    active: true,
  },
  {
    num: "03",
    href: "/jamforelsevy",
    title: "Jämförelsevy",
    desc: "Se hur olika källor rapporterar om samma nyhet bredvid varandra.",
    cta: "Kommer snart",
    active: false,
  },
  {
    num: "04",
    href: "/kalloversikt",
    title: "Källöversikt",
    desc: "Läs om källornas redaktionella profil och vad som kännetecknar deras rapportering.",
    cta: "Utforska källorna",
    active: true,
  },
];

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Display heading — anchored at the same left edge as nav logo */}
      <div style={{ maxWidth: "36rem", marginBottom: "5rem" }}>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(3rem, 7vw, 4.5rem)",
            fontWeight: 400,
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            color: "white",
            marginBottom: "1.5rem",
          }}
        >
          Förstå nyheterna djupare.
        </h1>
        <p style={{ fontSize: "1rem", lineHeight: 1.6, color: "var(--text-2)", maxWidth: "28rem" }}>
          En plattform för att jämföra svenska och internationella nyheter, analysera
          vinklar och se perspektiv du annars missar.
        </p>
      </div>

      {/* Feature rows */}
      <div style={{ borderTop: "1px solid var(--border)" }}>
        {features.map(({ num, href, title, desc, cta, active }) => (
          <div
            key={href}
            style={{
              borderBottom: "1px solid var(--border)",
              padding: "1.375rem 0",
              display: "grid",
              gridTemplateColumns: "2.5rem 1fr auto",
              gap: "1.5rem",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.6875rem",
                color: "var(--text-3)",
                letterSpacing: "0.05em",
              }}
            >
              {num}
            </span>
            <div>
              <span style={{ fontWeight: 500, fontSize: "0.9375rem", color: "white" }}>
                {title}
              </span>
              <span style={{ fontSize: "0.875rem", color: "var(--text-2)", marginLeft: "1.25rem" }}>
                {desc}
              </span>
            </div>
            {active ? (
              <Link
                href={href}
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                  color: "var(--accent)",
                  textDecoration: "underline",
                  textDecorationColor: "var(--accent)",
                  textUnderlineOffset: "3px",
                  whiteSpace: "nowrap",
                }}
              >
                {cta} →
              </Link>
            ) : (
              <span style={{ fontSize: "0.75rem", color: "var(--text-3)", whiteSpace: "nowrap" }}>
                {cta}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

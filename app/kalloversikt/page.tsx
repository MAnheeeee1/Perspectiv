import Link from "next/link";

const SOURCES = [
  {
    name: "Svenska Dagbladet",
    short: "SvD",
    url: "https://www.svd.se",
    profile: "Liberal konservativ",
    description: "Rikstäckande morgontidning grundad 1884.",
    group: "sv",
  },
  {
    name: "Dagens Nyheter",
    short: "DN",
    url: "https://www.dn.se",
    profile: "Liberal",
    description: "Rikstäckande morgontidning grundad 1864.",
    group: "sv",
  },
  {
    name: "Aftonbladet",
    short: "AB",
    url: "https://www.aftonbladet.se",
    profile: "Socialdemokratisk",
    description: "Landets största kvällstidning grundad 1830.",
    group: "sv",
  },
  {
    name: "Omni",
    short: "Omni",
    url: "https://omni.se",
    profile: "Aggregator",
    description: "Samlar nyheter från svenska medier utan egen redaktion.",
    group: "sv",
  },
  {
    name: "BBC News",
    short: "BBC",
    url: "https://www.bbc.com/news",
    profile: "Public service",
    description: "Brittisk public service-kanal med global räckvidd och fritt tillgängligt innehåll.",
    group: "int",
  },
  {
    name: "The Guardian",
    short: "Gdn",
    url: "https://www.theguardian.com",
    profile: "Center-vänster",
    description: "Brittisk dagstidning grundad 1821 med öppen tillgångspolicy.",
    group: "int",
  },
  {
    name: "Al Jazeera",
    short: "AJE",
    url: "https://www.aljazeera.com",
    profile: "Qatar-baserad",
    description: "Internationell nyhetskanal grundad 1996 med fokus på globala konflikter.",
    group: "int",
  },
  {
    name: "AP News",
    short: "AP",
    url: "https://apnews.com",
    profile: "Nyhetsbyrå",
    description: "Ledande amerikansk nyhetsbyrå grundad 1846, distribuerar faktagranskad nyhetstext.",
    group: "int",
  },
];

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "0",
      }}
    >
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
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
    </div>
  );
}

function ProfileTag({ label }: { label: string }) {
  return (
    <span
      style={{
        fontSize: "12px",
        color: "rgba(255,255,255,0.45)",
        border: "1px solid rgba(255,255,255,0.12)",
        padding: "2px 6px",
        borderRadius: "3px",
        letterSpacing: "0.02em",
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}

export default function KalloversiktPage() {
  const swedish = SOURCES.filter((s) => s.group === "sv");
  const intl = SOURCES.filter((s) => s.group === "int");

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div style={{ marginBottom: "3.5rem" }}>
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
          Källöversikt
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-2)" }}>
          Tillgängliga nyhetskällor och deras redaktionella profil.
        </p>
      </div>

      {/* Source groups */}
      {[
        { label: "Svenska", sources: swedish },
        { label: "Internationella", sources: intl },
      ].map(({ label, sources }) => (
        <div key={label} style={{ marginBottom: "3rem" }}>
          <SectionHeader label={label} />
          <div>
            {sources.map((s) => (
              <div
                key={s.url}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  padding: "1.125rem 0",
                  display: "grid",
                  gridTemplateColumns: "3.5rem 1fr auto",
                  gap: "1.25rem",
                  alignItems: "start",
                }}
              >
                {/* Short code */}
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    paddingTop: "0.2rem",
                  }}
                >
                  {s.short}
                </span>

                {/* Name + description */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <span style={{ fontSize: "1.125rem", fontWeight: 500, color: "white", lineHeight: 1.3 }}>
                      {s.name}
                    </span>
                    <ProfileTag label={s.profile} />
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-2)", lineHeight: 1.55 }}>
                    {s.description}
                  </p>
                </div>

                {/* Domain link */}
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--text-3)",
                    textDecoration: "underline",
                    textUnderlineOffset: "2px",
                    whiteSpace: "nowrap",
                    paddingTop: "0.3rem",
                  }}
                >
                  {s.url.replace("https://", "").replace("www.", "")}
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Footer note */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
        <p style={{ fontSize: "0.8125rem", color: "var(--text-3)", marginBottom: "1rem", lineHeight: 1.6 }}>
          Historisk analys — hur en källa rapporterat över tid — är planerad för nästa fas.
        </p>
        <Link
          href="/vinklinganalys"
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
          Analysera en artikel nu →
        </Link>
      </div>
    </div>
  );
}

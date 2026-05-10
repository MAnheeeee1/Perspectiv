import Link from "next/link";

const features = [
  {
    href: "/nyhetsflodet",
    title: "Nyhetsflödet",
    description:
      "Hämta de senaste artiklarna från SvD, DN, Aftonbladet och Omni på ett ställe.",
    emoji: "📰",
    cta: "Öppna flödet",
    color: "border-blue-200 hover:border-blue-400",
    ctaColor: "bg-blue-600 hover:bg-blue-700",
  },
  {
    href: "/vinklinganalys",
    title: "Vinklingsanalys",
    description:
      "Analysera ton, politisk vinkling och saknade perspektiv i valfri artikel.",
    emoji: "🔍",
    cta: "Analysera artikel",
    color: "border-violet-200 hover:border-violet-400",
    ctaColor: "bg-violet-600 hover:bg-violet-700",
  },
  {
    href: "/jamforelsevy",
    title: "Jämförelsevy",
    description:
      "Se hur olika källor rapporterar om samma nyhet bredvid varandra.",
    emoji: "⚖",
    cta: "Kommer snart",
    color: "border-slate-200",
    ctaColor: "bg-slate-400 cursor-not-allowed",
    disabled: true,
  },
  {
    href: "/kalloversikt",
    title: "Källöversikt",
    description:
      "Få en bild av hur en nyhetskälla brukar rapportera baserat på redaktionell profil.",
    emoji: "📊",
    cta: "Utforska källor",
    color: "border-amber-200 hover:border-amber-400",
    ctaColor: "bg-amber-600 hover:bg-amber-700",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="text-blue-500 font-black text-5xl leading-none">P</span>
          <span className="font-bold text-4xl text-slate-900 tracking-tight">erspectiv</span>
        </div>
        <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
          En plattform för att jämföra nyheter från svenska medier och analysera
          hur samma händelse vinklas av olika källor.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Link
            href="/nyhetsflodet"
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            Kom igång
          </Link>
          <Link
            href="/vinklinganalys"
            className="bg-white text-slate-700 border border-slate-300 px-6 py-2.5 rounded-lg font-semibold text-sm hover:border-slate-400 transition-colors"
          >
            Analysera artikel
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        {features.map(({ href, title, description, emoji, cta, color, ctaColor, disabled }) => (
          <div
            key={href}
            className={`bg-white rounded-2xl border-2 p-6 flex flex-col gap-3 transition-colors ${color}`}
          >
            <div className="text-3xl">{emoji}</div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg mb-1">{title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
            </div>
            {disabled ? (
              <span
                className={`self-start mt-auto px-4 py-2 rounded-lg text-white text-sm font-semibold ${ctaColor}`}
              >
                {cta}
              </span>
            ) : (
              <Link
                href={href}
                className={`self-start mt-auto px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors ${ctaColor}`}
              >
                {cta}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

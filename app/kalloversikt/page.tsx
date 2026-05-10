import Link from "next/link";

const SOURCES = [
  { name: "Svenska Dagbladet", short: "SvD", url: "https://www.svd.se", description: "Rikstäckande morgontidning med liberal konservativ profil." },
  { name: "Dagens Nyheter", short: "DN", url: "https://www.dn.se", description: "Rikstäckande morgontidning med liberal profil." },
  { name: "Aftonbladet", short: "AB", url: "https://www.aftonbladet.se", description: "Landets största kvällstidning med socialdemokratisk profil." },
  { name: "Omni", short: "Omni", url: "https://omni.se", description: "Aggregeringstjänst som samlar nyheter från svenska medier." },
];

export default function KalloversiktPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Källöversikt</h1>
        <p className="text-slate-500 text-sm">
          Översikt av tillgängliga nyhetskällor och deras redaktionella profil.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {SOURCES.map((s) => (
          <div
            key={s.url}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-600 shrink-0">
                {s.short.slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{s.name}</p>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline"
                >
                  {s.url.replace("https://", "")}
                </a>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
            <p className="text-xs text-slate-400 mt-auto pt-1 border-t border-slate-100">
              Historisk analys kommer snart
            </p>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <p className="text-sm font-medium text-amber-800 mb-1">Historisk analys under utveckling</p>
        <p className="text-xs text-amber-700">
          Funktionen som visar hur en källa rapporterat över tid är planerad för nästa fas.
        </p>
        <Link
          href="/vinklinganalys"
          className="inline-block mt-3 bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors"
        >
          Analysera en artikel nu
        </Link>
      </div>
    </div>
  );
}

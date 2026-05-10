import Link from "next/link";

export default function JamforelsevyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Jämförelsevy</h1>
        <p className="text-slate-500 text-sm">
          Visa artiklar om samma ämne bredvid varandra för att se skillnader i rapportering.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl">
          ⚖
        </div>
        <h2 className="text-lg font-semibold text-slate-700">Kommer snart</h2>
        <p className="text-sm text-slate-500 max-w-md">
          Jämförelsevy är under utveckling. Funktionen söker artiklar om samma nyhet
          från flera källor och visar dem bredvid varandra.
        </p>
        <Link
          href="/nyhetsflodet"
          className="mt-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Gå till Nyhetsflödet
        </Link>
      </div>
    </div>
  );
}

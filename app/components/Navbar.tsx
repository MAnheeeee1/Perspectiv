"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Hem" },
  { href: "/nyhetsflodet", label: "Flödet" },
  { href: "/jamforelsevy", label: "Jämförelse" },
  { href: "/vinklinganalys", label: "Analys" },
  { href: "/kalloversikt", label: "Källor" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-blue-400 font-black text-2xl leading-none">P</span>
          <span className="font-semibold text-lg tracking-tight">erspectiv</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

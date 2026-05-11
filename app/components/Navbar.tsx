"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/nyhetsflodet", label: "Flödet" },
  { href: "/vinklinganalys", label: "Analys" },
  { href: "/jamforelsevy", label: "Jämförelse" },
  { href: "/kalloversikt", label: "Källor" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div
        className="max-w-5xl mx-auto px-6 flex items-center h-14"
        style={{ gap: "3rem" }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.125rem",
            color: "white",
            letterSpacing: "-0.015em",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          Perspectiv
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: "48px" }}>
          {links.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="nav-link"
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  color: active ? "white" : "rgba(255,255,255,0.45)",
                  textDecorationLine: active ? "underline" : "none",
                  textDecorationColor: "#C9A961",
                  textDecorationThickness: "2px",
                  textUnderlineOffset: "5px",
                }}
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

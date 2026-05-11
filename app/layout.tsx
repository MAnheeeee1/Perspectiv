import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";

import Navbar from "./components/Navbar";
import { LoadingProvider } from "./components/LoadingProvider";
import "./globals.css";

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Perspectiv – Nyhetsjämförelse",
  description: "Jämför nyheter från svenska medier och analysera vinklingen",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv" className={`${serif.variable} ${sans.variable} h-full`} style={{ background: "#0A0A0A", colorScheme: "dark" }}>
      <body className="min-h-full flex flex-col" style={{ background: "#0A0A0A", color: "white" }}>
        <LoadingProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </LoadingProvider>
      </body>
    </html>
  );
}

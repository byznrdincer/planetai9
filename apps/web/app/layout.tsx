import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SearchBox } from "@/components/SearchBox";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "PlanetAI — Explore the AI Universe",
  description: "One planet. Every AI signal. AI dünyasının nabzını tek merkezden tut.",
};

const NAV = [
  ["Haberler", "/news"],
  ["Trendler", "/trends"],
  ["Video", "/videos"],
  ["Kaynaklar", "/sources"],
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={archivo.variable}>
      <body className="min-h-screen font-sans antialiased">
        <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-content items-center gap-6 px-4">
            <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[11px] text-bg">
                P
              </span>
              PLANETAI
            </Link>
            <nav className="hidden gap-0.5 text-sm text-ink-2 md:flex">
              {NAV.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-md px-3 py-1.5 hover:bg-surface-2 hover:text-ink"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden w-56 lg:block">
                <SearchBox />
              </div>
              <span className="hidden items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-2 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                Canlı
              </span>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-content px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-content px-4 py-10 text-[11px] uppercase tracking-widest text-muted">
          PlanetAI — One Planet. Every AI Signal. · Tüm sinyaller orijinal kaynağa bağlanır.
        </footer>
      </body>
    </html>
  );
}

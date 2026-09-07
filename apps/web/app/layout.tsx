import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SearchBox } from "@/components/SearchBox";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PlanetAI — Explore the AI Universe",
  description: "One planet. Every AI signal. The AI world's discovery and intelligence platform.",
};

const NAV = [
  ["Home", "/"],
  ["News", "/news"],
  ["Trends", "/trends"],
  ["Videos", "/videos"],
  ["Sources", "/sources"],
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-content items-center gap-6 px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[11px] font-bold text-bg">
                P
              </span>
              PlanetAI
            </Link>
            <nav className="hidden gap-1 text-sm text-text-dim sm:flex">
              {NAV.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-md px-3 py-1.5 hover:bg-surface-2 hover:text-text"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="ml-auto w-full max-w-xs">
              <SearchBox />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-content px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-content px-4 py-10 text-xs text-text-dim">
          PlanetAI — ONE PLANET. EVERY AI SIGNAL. · All sources link to original publishers.
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Masthead } from "@/components/Masthead";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "PlanetAI — Yapay Zekâ Haberleri",
  description:
    "Yapay zekâ dünyasındaki gelişmeleri, model duyurularını ve araştırmaları tek bir yerde takip et.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={archivo.variable}>
      <body className="min-h-screen bg-paper font-sans antialiased">
        <Masthead />
        <main className="mx-auto max-w-content px-4 py-8">{children}</main>
        <footer className="mt-8 border-t-2 border-ink">
          <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-2 px-4 py-8 text-[11px] uppercase tracking-widest text-muted">
            <span>PlanetAI — Tek Gezegen. Her Yapay Zekâ Sinyali.</span>
            <Link href="/sources" className="hover:text-brand-ink">
              Kaynaklar & Güven
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}

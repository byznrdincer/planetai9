import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Masthead } from "@/components/Masthead";
import { LogoMark } from "@/components/Logo";
import { getDict, getLocale } from "@/lib/i18n";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "PlanetAI9 — Yapay Zekâ Haberleri",
  description:
    "Yapay zekâ dünyasındaki gelişmeleri, model duyurularını ve araştırmaları tek bir yerde takip et.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const t = await getDict();
  return (
    <html lang={locale} className={archivo.variable}>
      <body className="min-h-screen bg-canvas font-sans antialiased">
        <Masthead />
        <main className="mx-auto max-w-content px-5 py-6">{children}</main>
        <footer className="mt-10 border-t border-line bg-paper">
          <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-3 px-5 py-8 text-[12px] text-muted">
            <span className="flex items-center gap-2">
              <LogoMark className="h-5 w-5" />
              {t.common.footer}
            </span>
            <span className="flex gap-4">
              <Link href="/hakkinda" className="link-accent">
                {locale === "tr" ? "Biz Kimiz" : "About"}
              </Link>
              <Link href="/sources" className="link-accent">
                {t.common.sourcesLink}
              </Link>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Masthead } from "@/components/Masthead";
import { SiteFooter } from "@/components/SiteFooter";
import { getLocale } from "@/lib/i18n";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

const SITE = process.env.PLANETAI_SITE_URL ?? "https://planetai9.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "PlanetAI9 — Yapay Zekâ Haberleri",
    template: "%s · PlanetAI9",
  },
  description:
    "Yapay zekâ dünyasındaki gelişmeleri, model duyurularını, araçları ve regülasyonları Türkçe takip et.",
  applicationName: "PlanetAI9",
  openGraph: {
    type: "website",
    siteName: "PlanetAI9",
    locale: "tr_TR",
    url: SITE,
    title: "PlanetAI9 — Yapay Zekâ Haberleri",
    description: "Türkiye'nin yapay zekâ medya platformu.",
  },
  twitter: { card: "summary_large_image", site: "@planetai9" },
  robots: { index: true, follow: true },
  alternates: { types: { "application/rss+xml": `${SITE}/rss.xml` } },
};

const THEME_INIT = `try{if(localStorage.getItem('planetai_theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-screen bg-paper font-sans antialiased dark:bg-d-paper">
        <Masthead />
        <main className="mx-auto max-w-content px-5 py-8 sm:px-8 sm:py-12">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

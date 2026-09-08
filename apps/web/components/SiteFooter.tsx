import Link from "next/link";
import { Linkedin, Rss, Youtube } from "lucide-react";
import { LogoMark } from "./Logo";
import { getDict, getLocale } from "@/lib/i18n";

export async function SiteFooter() {
  const locale = await getLocale();
  const t = await getDict();
  const tr = locale === "tr";

  const links = [
    { label: tr ? "Hakkımızda" : "About", href: "/hakkinda" },
    { label: tr ? "Gizlilik Politikası" : "Privacy", href: "/gizlilik" },
    { label: tr ? "İletişim" : "Contact", href: "/hakkinda#iletisim" },
    { label: tr ? "Kaynaklar" : "Sources", href: "/sources" },
    { label: "RSS", href: "/api/rss", external: true },
  ];

  const socials = [
    { icon: Youtube, href: "https://www.youtube.com/@planetai9", label: "YouTube" },
    { icon: Linkedin, href: "https://www.linkedin.com/showcase/planetai9media", label: "LinkedIn" },
    { icon: Rss, href: "/api/rss", label: "RSS" },
  ];

  return (
    <footer className="mt-16 border-t border-line bg-canvas dark:border-d-line dark:bg-d-canvas">
      <div className="mx-auto max-w-content px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-7 w-7" />
              <span className="text-[15px] font-extrabold tracking-tight3 text-ink dark:text-d-ink">
                PlanetAI9
              </span>
            </div>
            <p className="mt-2 text-[12px] text-ink-2 dark:text-d-ink-2">{t.tagline}</p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
            {links.map((l) =>
              l.external ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-2 hover:text-ink dark:text-d-ink-2 dark:hover:text-d-ink"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-ink-2 hover:text-ink dark:text-d-ink-2 dark:hover:text-d-ink"
                >
                  {l.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-2 transition-colors hover:text-ink dark:border-d-line dark:text-d-ink-2 dark:hover:text-d-ink"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <p className="mt-10 border-t border-line pt-6 text-[12px] text-muted dark:border-d-line">
          © {new Date().getFullYear()} PlanetAI9. {tr ? "Tüm hakları saklıdır." : "All rights reserved."}
        </p>
      </div>
    </footer>
  );
}

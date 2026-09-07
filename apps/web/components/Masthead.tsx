import Link from "next/link";
import { getDict, getLocale } from "@/lib/i18n";
import { LangToggle } from "./LangToggle";
import { SearchBox } from "./SearchBox";
import { LogoMark } from "./Logo";

export async function Masthead() {
  const locale = await getLocale();
  const t = await getDict();

  const nav: { label: string; href: string; external?: boolean }[] = [
    { label: t.nav.news, href: "/news" },
    { label: t.nav.analysis, href: "/trends" },
    { label: t.nav.robotics, href: "/news?category=Robotics" },
    { label: t.nav.coding, href: "/news?category=AICoding" },
    { label: t.nav.safety, href: "/news?category=AISafety" },
    { label: t.nav.regulation, href: "/news?category=Regulation" },
    { label: t.nav.video, href: "/videos" },
    { label: t.nav.marketplace, href: "/marketplace" },
    { label: t.nav.authors, href: "/yazarlar" },
    { label: "LLMRadar ↗", href: "https://llmradar.planetai9.com", external: true },
    { label: "PlanetAI9 ↗", href: "https://www.youtube.com/@planetai9", external: true },
  ];

  const today = new Date().toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });

  return (
    <header className="border-b border-ink bg-paper">
      <div className="mx-auto max-w-content px-5">
        <div className="flex items-center justify-between py-1.5 text-[11px] uppercase tracking-wide text-muted">
          <span>{today}</span>
          <span className="flex items-center gap-1.5 font-semibold text-live">
            <span className="h-1.5 w-1.5 rounded-full bg-live" /> {t.live}
          </span>
        </div>

        <div className="flex items-center gap-4 border-t border-line py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark className="h-9 w-9" />
            <span className="text-2xl font-black tracking-tightest text-ink">PlanetAI9</span>
            <span className="hidden border-l border-line pl-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted sm:block">
              {t.tagline}
            </span>
          </Link>
          <div className="ml-auto hidden w-64 md:block">
            <SearchBox placeholder={t.searchPlaceholder} />
          </div>
          <LangToggle locale={locale} />
        </div>
      </div>

      <nav className="border-t border-ink bg-paper">
        <div className="mx-auto flex max-w-content gap-1 overflow-x-auto px-5 py-2 text-[13px] font-bold uppercase tracking-wide">
          {nav.map((it) =>
            it.external ? (
              <a
                key={it.label}
                href={it.href}
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap px-2.5 py-1 text-ink-2 hover:text-accent"
              >
                {it.label}
              </a>
            ) : (
              <Link
                key={it.label}
                href={it.href}
                className="whitespace-nowrap px-2.5 py-1 text-ink-2 hover:text-accent"
              >
                {it.label}
              </Link>
            ),
          )}
        </div>
      </nav>
    </header>
  );
}

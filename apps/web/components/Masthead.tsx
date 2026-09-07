import Link from "next/link";
import { SearchBox } from "./SearchBox";
import { LogoMark } from "./Logo";

type NavItem = { label: string; href: string; external?: boolean };

const NAV: NavItem[] = [
  { label: "Gündem", href: "/news" },
  { label: "Analiz", href: "/trends" },
  { label: "Robotik", href: "/news?category=Robotics" },
  { label: "Kodlama", href: "/news?category=AICoding" },
  { label: "Güvenlik", href: "/news?category=AISafety" },
  { label: "Regülasyon", href: "/news?category=Regulation" },
  { label: "Video", href: "/videos" },
  { label: "AI Marketplace", href: "/marketplace" },
  { label: "Yazarlar", href: "/yazarlar" },
  { label: "LLMRadar ↗", href: "https://llmradar.planetai9.com", external: true },
  { label: "PlanetAI9 ↗", href: "https://www.youtube.com/@planetai9", external: true },
];

export function Masthead() {
  const today = new Date().toLocaleDateString("tr-TR", {
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
            <span className="h-1.5 w-1.5 rounded-full bg-live" /> Canlı Yayın
          </span>
        </div>

        <div className="flex items-center gap-4 border-t border-line py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark className="h-9 w-9" />
            <span className="text-2xl font-black tracking-tightest text-ink">PlanetAI</span>
            <span className="hidden border-l border-line pl-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted sm:block">
              Yapay Zekâ Haberleri
            </span>
          </Link>
          <div className="ml-auto hidden w-72 md:block">
            <SearchBox />
          </div>
        </div>
      </div>

      <nav className="border-t border-ink bg-paper">
        <div className="mx-auto flex max-w-content gap-1 overflow-x-auto px-5 py-2 text-[13px] font-bold uppercase tracking-wide">
          {NAV.map((it) =>
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

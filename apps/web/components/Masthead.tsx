import Link from "next/link";
import { SearchBox } from "./SearchBox";

const CATEGORY_NAV = [
  ["Gündem", "/"],
  ["Tüm Haberler", "/news"],
  ["Modeller", "/news?category=Models"],
  ["Şirketler", "/news?category=Companies"],
  ["Ajanlar", "/news?category=Agents"],
  ["Kodlama", "/news?category=AICoding"],
  ["Robotik", "/news?category=Robotics"],
  ["Güvenlik", "/news?category=AISafety"],
  ["Regülasyon", "/news?category=Regulation"],
  ["Trendler", "/trends"],
  ["Video", "/videos"],
];

export function Masthead() {
  const today = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="border-b-2 border-ink bg-paper">
      <div className="mx-auto max-w-content px-4">
        <div className="flex items-center justify-between border-b border-line py-1.5 text-[11px] text-muted">
          <span className="uppercase tracking-wide">{today}</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Canlı yayında
          </span>
        </div>

        <div className="flex items-center gap-4 py-4">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tightest text-ink">PlanetAI</span>
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-muted sm:inline">
              Yapay Zekâ Haberleri
            </span>
          </Link>
          <div className="ml-auto hidden w-64 md:block">
            <SearchBox />
          </div>
        </div>
      </div>

      <nav className="border-t border-line bg-paper">
        <div className="mx-auto flex max-w-content gap-1 overflow-x-auto px-4 py-1.5 text-[13px] font-semibold">
          {CATEGORY_NAV.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="whitespace-nowrap rounded px-2.5 py-1 text-ink-2 hover:bg-wash hover:text-brand-ink"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

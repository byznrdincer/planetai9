import Link from "next/link";
import { SearchBox } from "./SearchBox";
import { Wordmark } from "./Logo";

const NAV: [string, string][] = [
  ["Ana Sayfa", "/"],
  ["Gündem", "/news"],
  ["Teknoloji", "/news?category=Infrastructure"],
  ["Modeller", "/models"],
  ["Araçlar", "/tools"],
  ["Şirketler", "/companies"],
  ["Analiz", "/trends"],
  ["Kodlama", "/news?category=AICoding"],
  ["Robotik", "/news?category=Robotics"],
  ["Güvenlik", "/news?category=AISafety"],
  ["Regülasyon", "/news?category=Regulation"],
  ["Trendler", "/trends"],
  ["Video", "/videos"],
];

export function Masthead() {
  const today = new Date().toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto max-w-content px-5">
        <div className="flex h-16 items-center gap-4">
          <Link href="/">
            <Wordmark />
          </Link>
          <div className="ml-auto hidden w-80 md:block">
            <SearchBox />
          </div>
          <button
            aria-label="Tema"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-line text-muted hover:text-ink md:flex"
          >
            ☀
          </button>
          <button
            aria-label="Profil"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-line text-muted hover:text-ink md:flex"
          >
            ◔
          </button>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-content items-center gap-1 px-5">
          <nav className="flex flex-1 gap-0.5 overflow-x-auto py-2 text-[13px] font-semibold">
            {NAV.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="whitespace-nowrap rounded-md px-2.5 py-1 text-ink-2 hover:bg-wash hover:text-ink"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="hidden shrink-0 items-center gap-3 pl-4 text-[12px] text-muted lg:flex">
            <span>{today}</span>
            <span className="flex items-center gap-1.5 font-semibold text-live">
              <span className="h-1.5 w-1.5 rounded-full bg-live" />
              Canlı Yayın
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

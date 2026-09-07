import { Page } from "@/components/Page";
import { LogoMark } from "@/components/Logo";
import { getLocale } from "@/lib/i18n";

export const revalidate = 86400;

const LINKS: { label: string; href: string; display: string }[] = [
  { label: "YouTube", href: "https://www.youtube.com/@planetai9", display: "youtube.com/@planetai9" },
  { label: "LinkedIn", href: "https://www.linkedin.com/showcase/planetai9media", display: "linkedin.com/showcase/planetai9media" },
  { label: "Instagram", href: "https://www.instagram.com/planetai9media", display: "instagram.com/planetai9media" },
  { label: "Spotify", href: "https://open.spotify.com/show/033ICMyCiAQh4Ynsx9vkg5", display: "open.spotify.com/show/033ICMyCiAQh4Ynsx9vkg5" },
  { label: "LLMRadar", href: "https://llmradar.planetai9.com", display: "llmradar.planetai9.com" },
  { label: "Digital Brain", href: "https://dbrain.tech", display: "dbrain.tech" },
  { label: "Oppy", href: "https://oppy.dbrain.tech", display: "oppy.dbrain.tech" },
];

export default async function AboutPage() {
  const locale = await getLocale();
  const tr = locale === "tr";

  return (
    <Page title={tr ? "Biz Kimiz" : "About PlanetAI9"} wide={false}>
      <div className="flex items-center gap-3">
        <LogoMark className="h-14 w-14" />
        <div>
          <p className="text-2xl font-black tracking-tightest text-ink">PlanetAI9</p>
          <p className="text-sm text-muted">
            {tr ? "Yapay Zekâ Medya Kanalı" : "AI Media Channel"} · {tr ? "Türkiye" : "Türkiye"}
          </p>
        </div>
      </div>

      <p className="mt-6 text-[16px] leading-relaxed text-ink-2">
        {tr
          ? "Türkiye'nin ve Türkçe konuşan izleyicinin penceresinden yapay zekâ, açık kaynak modeller, veri egemenliği ve teknoloji politikaları. PlanetAI9; haberleri, model duyurularını, araçları ve sektördeki kırılma noktalarını tek bir yerde toplar."
          : "AI, open-source models, data sovereignty and tech policy — from the perspective of Türkiye and the Turkish-speaking audience. PlanetAI9 brings together the news, model announcements, tools and the industry's inflection points in one place."}
      </p>
      <p className="mt-3 text-[15px] text-muted">
        {tr
          ? "Yeni içerikler için PlanetAI9 YouTube kanalına abone olmayı unutmayın."
          : "Subscribe to the PlanetAI9 YouTube channel for new content."}
      </p>

      <h2 className="mt-10 border-b-2 border-ink pb-2 text-lg font-black tracking-tight text-ink">
        {tr ? "Bağlantılar & İletişim" : "Links & Contact"}
      </h2>
      <ul className="mt-4 divide-y divide-line">
        {LINKS.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between py-3 text-sm hover:text-accent"
            >
              <span className="font-bold text-ink group-hover:text-accent">{l.label}</span>
              <span className="text-muted group-hover:text-accent">{l.display} ↗</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-[13px] text-muted">
        <span>{tr ? "Konum: Türkiye" : "Location: Türkiye"}</span>
        <span>{tr ? "Kuruluş: Temmuz 2026" : "Founded: July 2026"}</span>
      </div>
    </Page>
  );
}

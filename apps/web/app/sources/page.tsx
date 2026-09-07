import { Page } from "@/components/Page";
import { apiSafe } from "@/lib/api";
import type { SourceRef } from "@/lib/types";

export const revalidate = 3600;

const TYPE_LABEL: Record<string, string> = {
  primary: "Birincil kaynak",
  official_announcement: "Resmî duyuru",
  major_news: "Büyük haber kuruluşu",
  research_paper: "Araştırma",
  community: "Topluluk",
  social: "Sosyal medya",
};

export default async function SourcesPage() {
  const sources = await apiSafe<SourceRef[]>("/sources", []);

  return (
    <Page
      title="Kaynaklar & Güven"
      lead="PlanetAI'deki her haber orijinal yayıncıya bağlanır. Güven ağırlığı, haberin önem puanını etkiler."
    >
      <div className="card divide-y divide-line">
        {sources.map((s) => (
          <a
            key={s.slug}
            href={s.homepage_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-4 py-3 text-sm hover:text-accent"
          >
            <span className="flex-1 font-semibold text-ink">{s.name}</span>
            <span className="pill">{TYPE_LABEL[s.source_type] ?? s.source_type}</span>
            <span className="w-20 text-right text-[11px] text-muted">güven {s.trust_weight.toFixed(2)}</span>
          </a>
        ))}
      </div>
    </Page>
  );
}

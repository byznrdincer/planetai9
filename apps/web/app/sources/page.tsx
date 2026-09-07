import { Page } from "@/components/Page";
import { apiSafe } from "@/lib/api";
import type { SourceRef } from "@/lib/types";

export const revalidate = 3600;

const TYPE_LABEL: Record<string, string> = {
  primary: "Birincil",
  official_announcement: "Resmi duyuru",
  major_news: "Büyük haber kaynağı",
  research_paper: "Araştırma",
  community: "Topluluk",
  social: "Sosyal",
};

export default async function SourcesPage() {
  const sources = await apiSafe<SourceRef[]>("/sources", []);

  return (
    <Page section="Analiz" title="Kaynaklar & Güven" wide>
      <p className="mb-6 max-w-lg text-sm text-ink-2">
        PlanetAI&apos;deki her sinyal orijinal yayıncıya bağlanır. Güven ağırlığı önem skorunu
        besler.
      </p>
      <div className="card divide-y divide-line">
        {sources.map((s) => (
          <a
            key={s.slug}
            href={s.homepage_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-3 text-sm hover:bg-surface-2/60"
          >
            <span className="flex-1 font-semibold text-ink">{s.name}</span>
            <span className="chip">{TYPE_LABEL[s.source_type] ?? s.source_type}</span>
            <span className="w-24 text-right text-[11px] uppercase tracking-wide text-muted">
              güven {s.trust_weight.toFixed(2)}
            </span>
          </a>
        ))}
      </div>
    </Page>
  );
}

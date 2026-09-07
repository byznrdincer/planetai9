import { Page } from "@/components/Page";
import { apiSafe } from "@/lib/api";
import { getDict, getLocale } from "@/lib/i18n";
import type { SourceRef } from "@/lib/types";

export const revalidate = 3600;

const TYPE_LABEL: Record<string, { tr: string; en: string }> = {
  primary: { tr: "Birincil kaynak", en: "Primary source" },
  official_announcement: { tr: "Resmî duyuru", en: "Official announcement" },
  major_news: { tr: "Büyük haber kuruluşu", en: "Major news outlet" },
  research_paper: { tr: "Araştırma", en: "Research" },
  community: { tr: "Topluluk", en: "Community" },
  social: { tr: "Sosyal medya", en: "Social media" },
};

export default async function SourcesPage() {
  const locale = await getLocale();
  const t = await getDict();
  const sources = await apiSafe<SourceRef[]>("/sources", []);

  return (
    <Page title={t.sources.title} lead={t.sources.lead}>
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
            <span className="pill">{TYPE_LABEL[s.source_type]?.[locale] ?? s.source_type}</span>
            <span className="w-20 text-right text-[11px] text-muted">
              {t.sources.trust} {s.trust_weight.toFixed(2)}
            </span>
          </a>
        ))}
      </div>
    </Page>
  );
}

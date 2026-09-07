import Link from "next/link";
import { MarketplaceForm } from "@/components/MarketplaceForm";
import { Page } from "@/components/Page";
import { apiSafe } from "@/lib/api";
import { getDict, getLocale } from "@/lib/i18n";
import type { MarketplaceApp } from "@/lib/types";

export const revalidate = 120;

const CATS: Record<string, { tr: string; en: string }> = {
  "": { tr: "Tümü", en: "All" },
  mcp: { tr: "MCP Sunucuları", en: "MCP Servers" },
  llm: { tr: "LLM", en: "LLM" },
  stt: { tr: "Konuşma → Metin", en: "Speech → Text" },
  tts: { tr: "Metin → Konuşma", en: "Text → Speech" },
  agent: { tr: "Ajanlar", en: "Agents" },
  tool: { tr: "Araçlar", en: "Tools" },
  other: { tr: "Diğer", en: "Other" },
};

const PRICING: Record<string, { tr: string; en: string }> = {
  free: { tr: "Ücretsiz", en: "Free" },
  freemium: { tr: "Freemium", en: "Freemium" },
  paid: { tr: "Ücretli", en: "Paid" },
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const locale = await getLocale();
  const t = await getDict();
  const category = (await searchParams).category ?? "";
  const qs = category ? `?category=${category}` : "";
  const apps = await apiSafe<MarketplaceApp[]>(`/marketplace${qs}`, []);

  return (
    <Page title={t.marketplace.title} lead={t.marketplace.lead}>
      <div className="mb-6 flex flex-wrap gap-1.5">
        {Object.entries(CATS).map(([slug, label]) => (
          <Link
            key={slug}
            href={`/marketplace${slug ? `?category=${slug}` : ""}`}
            className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
              category === slug ? "bg-ink text-white" : "bg-wash text-ink-2 hover:bg-line"
            }`}
          >
            {label[locale]}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {apps.map((a) => (
          <a
            key={a.slug}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card group flex flex-col p-4 hover:border-accent/50"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded bg-wash text-sm font-black text-ink-2">
                {a.name.slice(0, 1)}
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-accent">
                  {a.category_label}
                </p>
                <p className="font-black text-ink group-hover:text-accent">{a.name}</p>
              </div>
            </div>
            <p className="mt-3 flex-1 text-[13px] text-ink-2">{a.tagline}</p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-muted">
              <span className="pill">{PRICING[a.pricing]?.[locale] ?? a.pricing}</span>
              <span>·</span>
              <span>{a.author_name}</span>
              {a.repo_url && (
                <>
                  <span>·</span>
                  <span className="text-accent">{t.marketplace.source}</span>
                </>
              )}
            </div>
          </a>
        ))}
        {apps.length === 0 && <p className="text-sm text-muted">{t.marketplace.empty}</p>}
      </div>

      <section id="oner" className="mt-14 scroll-mt-24 border-t-2 border-ink pt-8">
        <h2 className="text-xl font-black tracking-tight text-ink">{t.marketplace.suggestTitle}</h2>
        <p className="mt-1 max-w-lg text-sm text-ink-2">{t.marketplace.suggestBody}</p>
        <MarketplaceForm locale={locale} labels={{ submitted: t.marketplace.submitted, send: t.marketplace.send, sending: t.marketplace.sending }} />
      </section>
    </Page>
  );
}

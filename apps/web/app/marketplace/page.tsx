import Link from "next/link";
import { MarketplaceForm } from "@/components/MarketplaceForm";
import { Page } from "@/components/Page";
import { apiSafe } from "@/lib/api";
import type { MarketplaceApp } from "@/lib/types";

export const revalidate = 120;

const CATS: [string, string][] = [
  ["", "Tümü"],
  ["mcp", "MCP Sunucuları"],
  ["llm", "LLM"],
  ["stt", "Konuşma → Metin"],
  ["tts", "Metin → Konuşma"],
  ["agent", "Ajanlar"],
  ["tool", "Araçlar"],
  ["other", "Diğer"],
];

const PRICING: Record<string, string> = { free: "Ücretsiz", freemium: "Freemium", paid: "Ücretli" };

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const category = (await searchParams).category ?? "";
  const qs = category ? `?category=${category}` : "";
  const apps = await apiSafe<MarketplaceApp[]>(`/marketplace${qs}`, []);

  return (
    <Page
      title="AI Marketplace"
      lead="Topluluğun geliştirdiği faydalı yapay zekâ uygulamaları — MCP sunucuları, LLM'ler, STT/TTS araçları, ajanlar. Kendi projeni de paylaşabilirsin."
    >
      <div className="mb-6 flex flex-wrap gap-1.5">
        {CATS.map(([slug, label]) => (
          <Link
            key={slug}
            href={`/marketplace${slug ? `?category=${slug}` : ""}`}
            className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
              category === slug ? "bg-ink text-white" : "bg-wash text-ink-2 hover:bg-line"
            }`}
          >
            {label}
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
              <span className="pill">{PRICING[a.pricing] ?? a.pricing}</span>
              <span>·</span>
              <span>{a.author_name}</span>
              {a.repo_url && (
                <>
                  <span>·</span>
                  <span className="text-accent">kaynak ↗</span>
                </>
              )}
            </div>
          </a>
        ))}
        {apps.length === 0 && (
          <p className="text-sm text-muted">Bu kategoride henüz uygulama yok.</p>
        )}
      </div>

      <section id="oner" className="mt-14 scroll-mt-24 border-t-2 border-ink pt-8">
        <h2 className="text-xl font-black tracking-tight text-ink">Uygulamanı öner</h2>
        <p className="mt-1 max-w-lg text-sm text-ink-2">
          Yaptığın yapay zekâ uygulamasını PlanetAI topluluğuyla paylaş. Gönderiler incelendikten
          sonra yayınlanır.
        </p>
        <MarketplaceForm />
      </section>
    </Page>
  );
}
